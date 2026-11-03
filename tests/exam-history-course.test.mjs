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

test("treats a message-free empty backend response as no exam history", async (context) => {
  const originalFetch = globalThis.fetch;
  const previousBaseUrl = process.env.PSC_API_BASE_URL;
  const previousApiKey = process.env.PSC_API_KEY;
  globalThis.fetch = async () =>
    Response.json({
      status: false,
      details: [],
      data: [],
    });
  process.env.PSC_API_BASE_URL = "https://api.example.invalid";
  process.env.PSC_API_KEY = "test-key";

  context.after(() => {
    globalThis.fetch = originalFetch;
    if (previousBaseUrl === undefined) delete process.env.PSC_API_BASE_URL;
    else process.env.PSC_API_BASE_URL = previousBaseUrl;
    if (previousApiKey === undefined) delete process.env.PSC_API_KEY;
    else process.env.PSC_API_KEY = previousApiKey;
  });

  const result = await getCourseExamHistory({
    uid: 9,
    cid: 2,
    examType: "scert",
  });

  assert.equal(result.status, true);
  assert.equal(result.total, 0);
  assert.deepEqual(result.details, []);
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

test("complete upstream history identity reuses one course lookup across repeated attempts", async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => { globalThis.fetch = originalFetch; });
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    return Response.json({ status: true, exam: { id: 810, cid: 2, type: "mock" } });
  };
  for (const id of [811, 812, 813]) {
    assert.equal(await verifyExamHistoryCourse({
      cid: 2, uid: 91, examId: 810, examType: "mock", attemptId: id,
      historyRow: { id, uid: 91, exam_id: 810, exam_type: "mock" },
    }), true);
  }
  assert.equal(calls.length, 1);
  assert.ok(calls[0].endsWith("/getMockTestDetails"));
});

test("reused history identity still rejects a different exam course", async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async () => Response.json({ status: true, exam: { id: 820, cid: 1 } });
  assert.equal(await verifyExamHistoryCourse({
    cid: 2, uid: 91, examId: 820, examType: "mock", attemptId: 821,
    historyRow: { id: 821, uid: 91, exam_id: 820, exam_type: "mock" },
  }), false);
});

test("incomplete history identity retains the saved-attempt lookup", async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => { globalThis.fetch = originalFetch; });
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    return Response.json({ status: true, details: [{ id: 831, uid: 92, exam_id: 830, cid: 2 }] });
  };
  assert.equal(await verifyExamHistoryCourse({
    cid: 2, uid: 92, examId: 830, examType: "mock", attemptId: 831,
    historyRow: { id: 831, exam_id: 830, exam_type: "mock" },
  }), true);
  assert.ok(calls[0].endsWith("/getExamAnalyticDetails"));
});
