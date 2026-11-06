import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL(
  "../src/app/(student)/dashboard/[governmentExamsSlug]/exam-attempted/utils/historyLoadStatus.js",
  import.meta.url,
), "utf8");
const { getHistoryLoadStatus } = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
);

test("successful retry clears the previous partial verification warning", () => {
  const results = new Map([["mock", { partialVerification: true, unresolvedCount: 2 }]]);
  assert.equal(getHistoryLoadStatus(results).historyIncomplete, true);
  results.set("mock", { partialVerification: false, unresolvedCount: 0 });
  assert.deepEqual(getHistoryLoadStatus(results), {
    historyIncomplete: false, failedTypes: [], unverifiedTypes: [], unresolvedCount: 0,
  });
});

test("distinguishes failed requests from unverified attempts", () => {
  const status = getHistoryLoadStatus(new Map([
    ["mock", { partialVerification: false }],
    ["studyplan", { partialVerification: true, unresolvedCount: 3 }],
  ]), ["pqp"]);
  assert.deepEqual(status, {
    historyIncomplete: true, failedTypes: ["pqp"],
    unverifiedTypes: ["studyplan"], unresolvedCount: 3,
  });
});

test("total request failure is not treated as an empty successful history", () => {
  assert.equal(getHistoryLoadStatus(new Map(), ["mock"]).historyIncomplete, true);
  assert.equal(getHistoryLoadStatus(new Map()).historyIncomplete, false);
});
