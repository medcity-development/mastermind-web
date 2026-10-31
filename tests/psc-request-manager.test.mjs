import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = (await readFile(new URL("../src/lib/pscRequestManager.js", import.meta.url), "utf8"))
  .replace('import "server-only";', "");
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const manager = await import(moduleUrl);
const state = globalThis[Symbol.for("mastermind.psc.requests")];

test("concurrent subscribers share one request and can independently read responses", async () => {
  let calls = 0;
  const options = { key: "same", task: async () => {
    calls++;
    return Response.json({ status: true });
  } };
  const responses = await Promise.all([
    manager.executePscRequest(options), manager.executePscRequest(options),
  ]);
  assert.equal(calls, 1);
  assert.deepEqual(await Promise.all(responses.map(response => response.json())),
    [{ status: true }, { status: true }]);
});

test("429 blocks queued requests and shares cooldown across module instances", async () => {
  state.nextRequestAt = 0;
  let secondCalls = 0;
  const first = manager.executePscRequest({ key: "limited", task: async () =>
    new Response(null, { status: 429, headers: { "Retry-After": "120" } }) });
  const second = manager.executePscRequest({ key: "queued", task: async () => {
    secondCalls++;
    return Response.json({});
  } });
  const results = await Promise.allSettled([first, second]);
  for (const result of results) {
    assert.equal(result.status, "rejected");
    assert.equal(result.reason.httpStatus, 429);
    assert.ok(result.reason.retryAfter > 0);
  }
  assert.equal(secondCalls, 0);
  const reloaded = await import(`${moduleUrl}#reload`);
  assert.equal(reloaded.isPscRateLimited(), true);
  state.cooldownUntil = 0;
  state.nextRequestAt = 0;
});

test("PSC configuration includes the validated API key", async () => {
  const api = await readFile(new URL("../src/lib/pscApi.js", import.meta.url), "utf8");
  const configFunction = api.slice(api.indexOf("function getApiConfig()"), api.indexOf("function requireCid"));
  const config = vm.runInNewContext(`${configFunction}; getApiConfig()`, {
    process: { env: { PSC_API_BASE_URL: " https://example.invalid/ ", PSC_API_KEY: " test-key " } },
  });
  assert.equal(config.apiKey, "test-key");
  assert.equal(config.apiBaseUrl, "https://example.invalid");
});

test("paused exam names resolve from details once and respect the shared cooldown", async (context) => {
  const asModule = text => `data:text/javascript;base64,${Buffer.from(text).toString("base64")}`;
  const api = asModule((await readFile(new URL("../src/lib/examHistoryApi.js", import.meta.url), "utf8"))
    .replace('import "server-only";', "")
    .replace('"@/lib/pscRequestManager"', JSON.stringify(moduleUrl)));
  const helper = asModule((await readFile(new URL("../src/lib/examHistoryHelper.js", import.meta.url), "utf8"))
    .replace('import "server-only";', "")
    .replace('"@/lib/pscRequestManager"', JSON.stringify(moduleUrl))
    .replace('"@/lib/examHistoryApi"', JSON.stringify(api)));
  const { resolveExamHistoryName } = await import(helper);
  const previousFetch = globalThis.fetch;
  const previousEnv = { ...process.env };
  context.after(() => {
    globalThis.fetch = previousFetch;
    for (const key of ["PSC_API_BASE_URL", "PSC_API_KEY"]) {
      if (previousEnv[key] === undefined) delete process.env[key];
      else process.env[key] = previousEnv[key];
    }
    state.cooldownUntil = 0;
  });
  process.env.PSC_API_BASE_URL = "https://example.invalid";
  process.env.PSC_API_KEY = "test-key";
  let calls = 0;
  globalThis.fetch = async (url, options) => {
    calls++;
    assert.ok(url.endsWith("getMockTestDetails"));
    assert.equal(options.body.get("api"), "test-key");
    return Response.json({ status: true, exam: [{ exam_name: "Previous Paper" }] });
  };
  const options = { uid: 1, cid: 2, examId: 3, examType: "pqp" };
  assert.deepEqual(await Promise.all([resolveExamHistoryName(options), resolveExamHistoryName(options)]),
    ["Previous Paper", "Previous Paper"]);
  assert.equal(calls, 1);
  manager.setPscRateLimit(60);
  assert.equal(await resolveExamHistoryName({ ...options, examId: 4 }), "");
  assert.equal(calls, 1);
});
