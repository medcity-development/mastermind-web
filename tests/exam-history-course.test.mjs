import test from "node:test";
import assert from "node:assert/strict";

process.env.PSC_API_BASE_URL = "https://api.example.invalid";
process.env.PSC_API_KEY = "test-key";

import { loadServerModule } from "./helpers/load-server-module.mjs";
const { filterExamHistoryByCourse, getCourseExamHistory } = await loadServerModule("examHistoryApi");
const { verifyExamHistoryCourse } = await loadServerModule("examHistoryHelper");

test("filters history records carrying a different course ID", () => {
  const filtered = filterExamHistoryByCourse([
    { id: 1, cid: 2 },
    { id: 2, course_id: 1 },
    { id: 3, course: { id: 1 } },
    { id: 4 },
  ], 2);

  assert.deepEqual(filtered.map(({ id }) => id), [1]);
});

test("history request includes the active course ID", async (context) => {
  const originalFetch = globalThis.fetch;
  let requestedFields;
  globalThis.fetch = async (_url, options) => {
    requestedFields = Object.fromEntries(options.body.entries());
    return new Response(JSON.stringify({ status: true, details: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
  context.after(() => {
    globalThis.fetch = originalFetch;
  });

  await getCourseExamHistory({ uid: 9, cid: 2, examType: "mock" });
  assert.equal(requestedFields.cid, "2");
  assert.equal(requestedFields.exam_type, "mock");
});

test("course-less records require explicit course evidence", async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async () => Response.json({ status: true, details: [
    { id: 155, exam_id: 40, exam_type: "mock" },
  ] });
  assert.equal(await verifyExamHistoryCourse({ cid: 2, uid: 9, examId: 40, examType: "mock", attemptId: 155 }), null);
});

test("explicit wrong-course attempt is rejected", async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async () => Response.json({ status: true, details: [
    { id: 157, exam_id: 40, exam_type: "mock", cid: 1 },
  ] });
  assert.equal(await verifyExamHistoryCourse({ cid: 2, uid: 9, examId: 40, examType: "mock", attemptId: 157 }), false);
});
