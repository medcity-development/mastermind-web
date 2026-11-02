import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { serverModuleUrl } from "./helpers/load-server-module.mjs";

const historyUtilsSource = await readFile(
  new URL(
    "../src/app/(student)/dashboard/[governmentExamsSlug]/exam-attempted/utils/examHistoryUtils.js",
    import.meta.url
  ),
  "utf8"
);
const historyUtilsUrl = `data:text/javascript;base64,${Buffer.from(
  historyUtilsSource
).toString("base64")}`;

let historyCoreSource = await readFile(
  new URL(
    "../src/app/(student)/dashboard/[governmentExamsSlug]/exam-attempted/utils/examHistoryCore.js",
    import.meta.url
  ),
  "utf8"
);
historyCoreSource = historyCoreSource
  .replace(
    '"./examHistoryUtils"',
    JSON.stringify(historyUtilsUrl)
  )
  .replace(
    '"@/lib/examHistoryResult"',
    JSON.stringify(await serverModuleUrl("examHistoryResult"))
  )
  .replace(
    '"@/lib/pyqHistoryRecovery"',
    JSON.stringify(await serverModuleUrl("pyqHistoryRecovery"))
  )
  .replace(
    '"@/lib/examAttemptStatus"',
    JSON.stringify(await serverModuleUrl("examAttemptStatus"))
  );

const historyCoreUrl = `data:text/javascript;base64,${Buffer.from(
  historyCoreSource
).toString("base64")}`;
const { normalizeRecord } = await import(historyCoreUrl);

test("Topic Wise history derives attempted counts from saved answers", () => {
  const correctAnswers = [
    "A", "B", "C", "D", "E",
    "A", "B", "C", "D", "E",
  ];
  const userAnswers = [
    "A", "B", "C", "D", "E",
    "B", "C", 0, 0, 0,
  ];
  const record = normalizeRecord(
    {
      id: 330,
      exam_id: 40,
      exam_type: "twe",
      exam_status: "finish",
      total_questions: 10,
      total_mark: 10,
      total_attempted: 10,
      total_correct: 5,
      total_wrong: 5,
      answer_array: JSON.stringify(correctAnswers),
      user_answers: JSON.stringify(userAnswers),
    },
    "twe"
  );

  assert.equal(record.total_attempted, 7);
  assert.equal(record.total_correct, 5);
  assert.equal(record.total_wrong, 2);
  assert.equal(record.user_score, 4.33);
  assert.equal(record.minus_mark, 0.67);
});
