import test from "node:test";
import assert from "node:assert/strict";

process.env.PSC_API_BASE_URL = "https://api.example.invalid";
process.env.PSC_API_KEY = "test-key";

const source = await import("node:fs/promises").then(({ readFile }) =>
  readFile(new URL("../src/lib/examHistoryApi.js", import.meta.url), "utf8")
);
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const { filterExamHistoryByCourse, getCourseExamHistory } = await import(moduleUrl);
const nameHelperSource = await import("node:fs/promises").then(({ readFile }) =>
  readFile(new URL("../src/lib/examHistoryHelper.js", import.meta.url), "utf8")
);
const nameHelperUrl = `data:text/javascript;base64,${Buffer.from(nameHelperSource).toString("base64")}`;
const { verifyExamHistoryCourse } = await import(nameHelperUrl);

test("filters history records carrying a different course ID", () => {
  const filtered = filterExamHistoryByCourse([
    { id: 1, cid: 2 },
    { id: 2, course_id: 1 },
    { id: 3, course: { id: 1 } },
    { id: 4 },
  ], 2);

  assert.deepEqual(filtered.map(({ id }) => id), [1, 4]);
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

test("course-less attempts must match exact getExamAnalyticDetails records", async (context) => {
  const originalFetch = globalThis.fetch;
  const requestedFields = [];
  globalThis.fetch = async (url, options) => {
    const fields = Object.fromEntries(options.body.entries());
    requestedFields.push({ url, fields });
    const attemptId = fields.cid === "2" ? "155" : "156";
    const details = [{
      id: attemptId,
      exam_id: "40",
      exam_type: fields.exam_type,
    }];
    if (fields.id === "157") {
      details.push({
        id: "157",
        exam_id: "40",
        exam_type: fields.exam_type,
        cid: "1",
      });
    }
    return new Response(JSON.stringify({ status: true, details: [{
      ...details[0],
    }, ...details.slice(1)] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
  context.after(() => {
    globalThis.fetch = originalFetch;
  });

  assert.equal(await verifyExamHistoryCourse({
    cid: 2, uid: 9, examId: 40, examType: "mock", attemptId: 155,
  }), true);
  assert.equal(await verifyExamHistoryCourse({
    cid: 1, uid: 9, examId: 40, examType: "mock", attemptId: 155,
  }), false);
  assert.equal(await verifyExamHistoryCourse({
    cid: 2, uid: 9, examId: 40, examType: "mock", attemptId: 156,
  }), false);
  assert.equal(await verifyExamHistoryCourse({
    cid: 2, uid: 9, examId: 40, examType: "mock", attemptId: 157,
  }), false);
  assert.deepEqual(requestedFields.map(({ fields }) => [fields.cid, fields.uid, fields.id, fields.exam_type]), [
    ["2", "9", "155", "mock"],
    ["1", "9", "155", "mock"],
    ["2", "9", "156", "mock"],
    ["2", "9", "157", "mock"],
  ]);
  assert.ok(requestedFields.every(({ url }) => url.endsWith("/getExamAnalyticDetails")));
});
