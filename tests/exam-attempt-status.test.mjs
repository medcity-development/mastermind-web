import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL("../src/lib/examAttemptStatus.js", import.meta.url),
  "utf8"
);
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const {
  getExamAttemptStatus,
  isFinishedExamAttempt,
  isPausedExamAttempt,
} = await import(moduleUrl);

test("recognizes paused attempts across supported status fields", () => {
  assert.equal(isPausedExamAttempt({ exam_status: "pause" }), true);
  assert.equal(isPausedExamAttempt({ status: " PAUSED " }), true);
  assert.equal(isPausedExamAttempt({ examStatus: "finished" }), false);
});

test("recognizes all finished attempt status variants", () => {
  for (const status of ["complete", "completed", "finish", "finished"]) {
    assert.equal(isFinishedExamAttempt({ exam_status: status }), true);
  }

  assert.equal(isFinishedExamAttempt({ exam_status: "pause" }), false);
  assert.equal(getExamAttemptStatus({ status: " Finished " }), "finished");
});
