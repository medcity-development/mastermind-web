import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { loadServerModule } from "./helpers/load-server-module.mjs";
const { verifyExamHistoryCourse } = await loadServerModule("examHistoryHelper");
const { getStudyPlanHistory } = await loadServerModule("studyPlanHistoryHelper");

test("study plan analytics can independently verify an attempt while rejecting mismatches", async (context) => {
  const previousFetch = globalThis.fetch;
  const previousBase = process.env.PSC_API_BASE_URL;
  const previousKey = process.env.PSC_API_KEY;
  process.env.PSC_API_BASE_URL = "https://studyplan.example.invalid";
  process.env.PSC_API_KEY = "test-key";
  context.after(() => {
    globalThis.fetch = previousFetch;
    if (previousBase === undefined) delete process.env.PSC_API_BASE_URL;
    else process.env.PSC_API_BASE_URL = previousBase;
    if (previousKey === undefined) delete process.env.PSC_API_KEY;
    else process.env.PSC_API_KEY = previousKey;
  });

  let row;
  globalThis.fetch = async (url) => new Response(JSON.stringify({
    status: true,
    details: url.endsWith("getUserExamAnalytics2") ? [row] : [],
  }));

  const cases = [
    [{}, true],
    [{ uid: 99 }, null],
    [{ exam_id: 99 }, null],
    [{ exam_type: "mock" }, null],
    [{ id: 99 }, null],
    [{ cid: 99 }, false],
    [{ cid: undefined }, null],
  ];
  for (let index = 0; index < cases.length; index++) {
    const examId = 100 + index;
    const [overrides, expected] = cases[index];
    row = { id: 50, exam_id: examId, uid: 9, cid: 2, exam_type: "studyplan", ...overrides };
    assert.equal(await verifyExamHistoryCourse({
      cid: 2, uid: 9, examId, examType: "studyplan", attemptId: 50,
    }), expected, JSON.stringify(overrides));
  }
});

test("legacy study-plan attempts verify through their course catalog and topic", async (context) => {
  const previousFetch = globalThis.fetch;
  const previousBase = process.env.PSC_API_BASE_URL;
  const previousKey = process.env.PSC_API_KEY;
  process.env.PSC_API_BASE_URL = "https://legacy-studyplan.example.invalid";
  process.env.PSC_API_KEY = "test-key";
  context.after(() => {
    globalThis.fetch = previousFetch;
    if (previousBase === undefined) delete process.env.PSC_API_BASE_URL;
    else process.env.PSC_API_BASE_URL = previousBase;
    if (previousKey === undefined) delete process.env.PSC_API_KEY;
    else process.env.PSC_API_KEY = previousKey;
  });
  globalThis.fetch = async (url, options) => {
    const fields = Object.fromEntries(options.body.entries());
    const endpoint = url.split("/").at(-1);
    const responses = {
      getUserExamsList: { details: [{ id: 1739, uid: 9, exam_id: 7, exam_type: "studyplan", exam_status: "finish" }] },
      getExamAnalyticDetails: { details: [{ id: 1739, uid: 9, exam_id: 7, exam_type: "studyplan" }] },
      getMockTestDetails: { exam: [{ id: 7, type: "studyplan", topicid: 183 }] },
      getUserExamAnalytics2: { details: [{ id: 1739, exam_name: "Exam - Day-01" }] },
      getSubCategoriesNew: { data: [{ id: 3, exam_id: fields.cid }] },
      getSubExamsList: { data: [{ id: 12, cid: fields.cid }] },
      getSubExamDetailsLatest: { items: [{ id: 46, exam: fields.cid, subject: "Study Plan" }] },
      getTopicListNew: { data: [{ id: 183, sub_id: 46, examid: fields.cid === "1" ? 7 : 99 }] },
    };
    assert.ok(responses[endpoint], endpoint);
    return new Response(JSON.stringify({ status: true, ...responses[endpoint] }));
  };
  assert.equal(await verifyExamHistoryCourse({
    cid: 1, uid: 9, examId: 7, examType: "studyplan", attemptId: 1739,
  }), true);
  const history = await getStudyPlanHistory({ uid: 9, cid: 1 });
  assert.equal(history.total, 1);
  assert.equal(history.unresolvedCount, 0);
  assert.equal(history.courseFilterVerified, true);
  assert.equal(history.details[0].exam_name, "Exam - Day-01");
  assert.equal(await verifyExamHistoryCourse({
    cid: 2, uid: 9, examId: 7, examType: "studyplan", attemptId: 1739,
  }), null, "a topic linked to another exam does not verify the attempt");
});
