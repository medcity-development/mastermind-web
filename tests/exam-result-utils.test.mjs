import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL("../src/lib/examResultUtils.js", import.meta.url),
  "utf8"
);
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const { calculateExamScore } = await import(moduleUrl);

test("calculates finished result counts when saved metrics are blank", () => {
  const result = calculateExamScore({
    total_attempted: "",
    total_correct: "",
    total_wrong: "",
    user_score: "",
    minus_mark: "",
    answer_array: ["A", "B", "C", "D"],
    user_answers: ["A", "D", "0", "B"],
  });

  assert.equal(result.attempted, 3);
  assert.equal(result.correct, 1);
  assert.equal(result.wrong, 2);
  assert.equal(result.score, 0.33);
  assert.equal(result.minusMark, 0.67);
});

test("leaves result counts unavailable when there are no saved metrics or answers", () => {
  const result = calculateExamScore({
    total_attempted: "",
    total_correct: "",
    total_wrong: "",
    user_score: "",
    minus_mark: "",
  });

  assert.equal(result.attempted, null);
  assert.equal(result.correct, null);
  assert.equal(result.wrong, null);
  assert.equal(result.score, null);
});
