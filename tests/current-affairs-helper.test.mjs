import test from "node:test";
import assert from "node:assert/strict";

import { loadServerModule } from "./helpers/load-server-module.mjs";

const originalApiUrl = process.env.PSC_API_BASE_URL;
const originalApiKey = process.env.PSC_API_KEY;
process.env.PSC_API_BASE_URL = "https://example.invalid";
process.env.PSC_API_KEY = "test-key";

const { getCurrentAffairMonths } = await loadServerModule(
  "currentAffairsHelper"
);
const requestState = globalThis[
  Symbol.for("mastermind.psc.requests")
];

test("loads and normalizes current affairs months through the shared request manager", async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => {
    globalThis.fetch = originalFetch;
    requestState.cooldownUntil = 0;
    requestState.nextRequestAt = 0;
    if (originalApiUrl === undefined) {
      delete process.env.PSC_API_BASE_URL;
    } else {
      process.env.PSC_API_BASE_URL = originalApiUrl;
    }
    if (originalApiKey === undefined) {
      delete process.env.PSC_API_KEY;
    } else {
      process.env.PSC_API_KEY = originalApiKey;
    }
  });

  requestState.cooldownUntil = 0;
  requestState.nextRequestAt = 0;
  let calls = 0;
  globalThis.fetch = async (url, options) => {
    calls++;
    assert.equal(url, "https://example.invalid/getCurrentAffairMonthsCid");
    assert.equal(options.body.get("api"), "test-key");
    assert.equal(options.body.get("cid"), "1");
    assert.equal(options.cache, "no-store");
    return Response.json({
      status: true,
      months: [{ id: 138, month: "November", year: 2026 }],
      nextoffset: 0,
    });
  };

  const result = await getCurrentAffairMonths({ cid: 1 });
  assert.equal(calls, 1);
  assert.equal(result.status, true);
  assert.equal(result.months[0].id, 138);
  assert.deepEqual(result.years, [2026]);

  await getCurrentAffairMonths({ cid: 1 });
  assert.equal(calls, 1);
});

test("reports backend rate limits instead of returning an empty success-shaped month list", async (context) => {
  const originalFetch = globalThis.fetch;
  const originalConsoleError = console.error;
  context.after(() => {
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
  });

  requestState.cooldownUntil = 0;
  requestState.nextRequestAt = 0;
  console.error = () => {};
  globalThis.fetch = async () =>
    Response.json({
      status: 429,
      message: "Too many requests",
      retryAfter: 1,
    });

  const result = await getCurrentAffairMonths({ cid: 2 });
  assert.equal(result.status, false);
  assert.equal(result.months.length, 0);
  assert.match(result.error, /rate-limited/i);
  requestState.cooldownUntil = 0;
  requestState.nextRequestAt = 0;
});
