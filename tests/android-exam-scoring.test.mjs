import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const load = async path => import(`data:text/javascript;base64,${Buffer.from(await readFile(new URL(path, import.meta.url), "utf8")).toString("base64")}`);
const { buildAttemptPayload, calculateExamResult } = await load("../src/lib/examAttemptData.js");
const { calculateExamScore } = await load("../src/lib/examResultUtils.js");
const { calculateMockResult } = await load("../src/app/(student)/dashboard/[governmentExamsSlug]/mock-tests/[examId]/start/utils/mockTestUtils.js");

for (const [correct, wrong, skipped, penalty, score] of [
  [2, 1, 1, 0.33, 1.67],
  [1, 2, 0, 0.67, 0.33],
  [0, 3, 1, 1, -1],
  [0, 100, 0, 33.3, -33.3],
  [5, 0, 2, 0, 5],
  [0, 0, 4, 0, 0],
]) {
  const answerArray = Array(correct + wrong + skipped).fill("A");
  const userAnswers = [...Array(correct).fill("A"), ...Array(wrong).fill("B"), ...Array(skipped).fill(0)];
  test(`Android scoring: ${correct} correct, ${wrong} wrong, ${skipped} skipped`, () => {
    const result = calculateExamResult({ answerArray, userAnswers });
    assert.equal(result.score, score);
    assert.equal(result.negativeMark, penalty);
    assert.equal(result.attempted, correct + wrong);
    const mock = calculateMockResult({ questions: answerArray.map((answer, id) => ({ id, answer })), answers: Object.fromEntries(userAnswers.map((answer, id) => [id, answer])) });
    assert.equal(mock.userScore, score);
    assert.equal(mock.minusMark, penalty);
    for (const exam_type of ["mock", "pqp", "pyq", "scert"]) {
      const payload = buildAttemptPayload({ exam_type, exam_status: "finish", total_mark: 200, answer_array: answerArray, user_answers: userAnswers, minus_mark: 0.5, __scoring: { markPerCorrect: 2, negativeMarkPerWrong: 0.5 } }, 21);
      assert.equal(payload.user_score, score);
      assert.equal(payload.minus_mark, penalty);
      const displayed = calculateExamScore({ ...payload, user_score: 999, minus_mark: 999 }, { markPerCorrect: 2, negativeMarkPerWrong: 0.5 });
      assert.equal(displayed.score, score);
      assert.equal(displayed.minusMark, penalty);
    }
  });
}
