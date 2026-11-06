import test from "node:test";
import assert from "node:assert/strict";
import { loadServerModule } from "./helpers/load-server-module.mjs";

const { selectStudentAttempts } = await loadServerModule("studentAttemptHistory");

test("all-course history keeps finished and paused attempts from both courses", () => {
  const rows = [
    { id: 1, uid: 9, cid: 1, exam_type: "mock", exam_status: "finish" },
    { id: 2, uid: 9, cid: 2, exam_type: "mock", exam_status: "pause" },
    { id: 3, uid: 9, exam_type: "mock", exam_status: "finish" },
  ];
  const result = selectStudentAttempts(rows, 9, "mock");
  assert.deepEqual(result.map((row) => row.id), [1, 2, 3]);
  assert.ok(result.every((row) => row._userVerified));
});

test("all-course history never includes another student or unverified owner", () => {
  const rows = [
    { id: 1, uid: 10, exam_type: "mock" },
    { id: 2, exam_type: "mock" },
    { id: 3, uid: 9, exam_type: "mock" },
    { id: 3, uid: 9, exam_type: "mock" },
    { id: 0, uid: 9, exam_type: "mock" },
  ];
  assert.deepEqual(selectStudentAttempts(rows, 9, "mock").map((row) => row.id), [3]);
});

test("mixed topic and statement responses are split without losing paused attempts", () => {
  const rows = [
    { id: 1, uid: 9, exam_type: "twe", exam_status: "pause" },
    { id: 2, uid: 9, exam_type: "tst", exam_status: "finish" },
    { id: 3, uid: 9, exam_type: "tst", exam_status: "pause" },
  ];
  assert.equal(selectStudentAttempts(rows, 9, "topicwise").length, 1);
  assert.equal(selectStudentAttempts(rows, 9, "tst").length, 2);
});

test("legacy study plan attempts do not need a course ID in the all-course view", () => {
  assert.equal(selectStudentAttempts([
    { id: 1745, uid: 9, exam_id: 7, exam_type: "studyplan", exam_status: "finish" },
  ], 9, "studyplan").length, 1);
});
