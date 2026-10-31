import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const asModule = source => `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const managerUrl = asModule((await readFile(new URL("../src/lib/pscRequestManager.js", import.meta.url), "utf8")).replace('import "server-only";', ""));
const helperUrl = asModule((await readFile(new URL("../src/lib/pyqDetailsHelper.js", import.meta.url), "utf8"))
  .replace('import "server-only";', "").replace('"@/lib/pscRequestManager"', JSON.stringify(managerUrl)));
const { getPyqExamDetails, getPyqQuestions } = await import(helperUrl);

test("PYQ preserves upstream errors and supports both detail shapes", async (context) => {
  const originalFetch = globalThis.fetch;
  const originalBase = process.env.PSC_API_BASE_URL;
  const originalKey = process.env.PSC_API_KEY;
  process.env.PSC_API_BASE_URL = "https://example.invalid/";
  process.env.PSC_API_KEY = "test-key";
  const state = globalThis[Symbol.for("mastermind.psc.requests")];
  context.after(() => {
    globalThis.fetch = originalFetch;
    state.cooldownUntil = 0;
    for (const [key, value] of [["PSC_API_BASE_URL", originalBase], ["PSC_API_KEY", originalKey]]) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  });
  const options = { uid: 7, cid: 1, examId: 790 };
  for (const exam of [[{ id: 790, exam_name: "Paper" }], { id: 790, exam_name: "Paper" }]) {
    state.nextRequestAt = 0;
    globalThis.fetch = async (_url, request) => {
      assert.equal(request.body.get("api"), "test-key");
      assert.equal(request.body.get("uid"), "7");
      return Response.json({ status: true, exam });
    };
    assert.equal((await getPyqExamDetails(options)).exam.exam_name, "Paper");
  }
  for (const status of [404, 502, 503]) {
    state.nextRequestAt = 0;
    globalThis.fetch = async () => new Response("Unavailable", { status });
    assert.equal((await getPyqExamDetails(options)).httpStatus, status);
  }
  state.nextRequestAt = 0;
  globalThis.fetch = async () => Response.json({ status: false, message: "Too many requests", retryAfter: 30 });
  const limited = await getPyqExamDetails(options);
  assert.equal(limited.httpStatus, 429);
  assert.ok(limited.retryAfter > 0);
  let calls = 0;
  globalThis.fetch = async () => { calls++; return Response.json({ data: [] }); };
  assert.equal((await getPyqQuestions(options)).httpStatus, 429);
  assert.equal(calls, 0);
});
