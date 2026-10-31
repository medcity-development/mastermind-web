import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { loadServerModule } from "./helpers/load-server-module.mjs";
const { resolveExamHistoryName } = await loadServerModule("examHistoryHelper");

test("resolves exam names with the backend details type for each category", async (context) => {
  const previousBaseUrl = process.env.PSC_API_BASE_URL;
  const previousApiKey = process.env.PSC_API_KEY;
  const previousFetch = globalThis.fetch;
  process.env.PSC_API_BASE_URL = "https://example.invalid";
  process.env.PSC_API_KEY = "test-key";

  const requests = [];
  globalThis.fetch = async (url, options) => {
    const fields = Object.fromEntries(options.body.entries());
    requests.push({ url, fields });
    if (url.endsWith("getUserExamAnalytics2")) {
      return new Response(JSON.stringify({ details: [{ exam_name: "Study Plan Exam" }] }));
    }
    const name = fields.type === "studyplan" ? "" : `${fields.type} Exam`;
    return new Response(JSON.stringify({ exam: name ? [{ exam_name: name }] : [] }));
  };

  context.after(() => {
    globalThis.fetch = previousFetch;
    if (previousBaseUrl === undefined) delete process.env.PSC_API_BASE_URL;
    else process.env.PSC_API_BASE_URL = previousBaseUrl;
    if (previousApiKey === undefined) delete process.env.PSC_API_KEY;
    else process.env.PSC_API_KEY = previousApiKey;
  });

  for (const [examType, expectedBackendType] of [
    ["mock", "mock"],
    ["pqp", "pqp"],
    ["scert", "scert"],
    ["topicwise", "twe"],
  ]) {
    assert.equal(
      await resolveExamHistoryName({ cid: 1, uid: 2, examId: 3, examType }),
      `${expectedBackendType} Exam`
    );
  }

  assert.equal(
    await resolveExamHistoryName({ cid: 1, uid: 2, examId: 3, examType: "studyplan" }),
    "Study Plan Exam"
  );
  assert.deepEqual(
    requests.slice(0, 4).map(({ fields }) => fields.type),
    ["mock", "pqp", "scert", "twe"]
  );
  assert.equal(requests.at(-1).url, "https://example.invalid/getUserExamAnalytics2");
});