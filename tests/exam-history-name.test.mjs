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

test("Study Plan prefers the analytics exam_name over a generic details name", async (context) => {
  const previousFetch = globalThis.fetch;
  const previousBase = process.env.PSC_API_BASE_URL;
  const previousKey = process.env.PSC_API_KEY;
  process.env.PSC_API_BASE_URL = "https://study-name.example.invalid";
  process.env.PSC_API_KEY = "test-key";
  context.after(() => {
    globalThis.fetch = previousFetch;
    if (previousBase === undefined) delete process.env.PSC_API_BASE_URL;
    else process.env.PSC_API_BASE_URL = previousBase;
    if (previousKey === undefined) delete process.env.PSC_API_KEY;
    else process.env.PSC_API_KEY = previousKey;
  });
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(url);
    return Response.json(url.endsWith("getUserExamAnalytics2")
      ? { status: true, details: [{ id: 1739, exam_name: "Exam - Day-01" }] }
      : { exam: { name: "Study Plan" } });
  };
  assert.equal(await resolveExamHistoryName({ cid: 2, uid: 9, examId: 7, examType: "studyplan" }), "Exam - Day-01");
  assert.equal(calls.length, 1);
});

test("a cached name stays eligible until the row displays it", async (context) => {
  let source = await readFile(new URL("../src/app/(student)/dashboard/[governmentExamsSlug]/exam-attempted/services/examHistoryService.js", import.meta.url), "utf8");
  source = source.replace(/import[\s\S]*?from ["'][^"']+["'];/g, "");
  source = `const validName = (value) => typeof value === "string" ? value.trim() : "";
    const resolveName = (row) => row.exam_name || "";
    const nameKey = (cid, row) => cid + ":studyplan:" + row.exam_id;
    const examIdOf = (row) => row.exam_id;
    const normalizeType = (value) => value;
` + source;
  const { loadExamName, isNameLookupNeeded } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
  const previousFetch = globalThis.fetch;
  context.after(() => { globalThis.fetch = previousFetch; });
  let calls = 0;
  globalThis.fetch = async () => { calls++; return Response.json({ status: true, examName: "Exam - Day-01" }); };
  const row = { exam_id: 7 };
  assert.equal(await loadExamName(2, row), "Exam - Day-01");
  assert.equal(isNameLookupNeeded(2, row), true);
  assert.equal(await loadExamName(2, row), "Exam - Day-01");
  assert.equal(calls, 1);
  assert.equal(isNameLookupNeeded(2, { ...row, exam_name: "Exam - Day-01" }), false);
});
