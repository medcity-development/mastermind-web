
import {
  calculateExamScore,
  parseSavedAnswers,
} from "@/lib/examResultUtils";

function finiteNumber(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function firstNumber(...values) {
  for (const value of values) {
    const n = finiteNumber(value);
    if (n !== null) return n;
  }

  return null;
}

export function prepareExamHistoryResult(item = {}) {
  const userAnswers = parseSavedAnswers(
    item.user_answers ?? item.user_answer_array
  );

  const correctAnswers = parseSavedAnswers(
    item.answer_array ?? item.correct_answers
  );

  const totalQuestions = firstNumber(
    item.total_questions,
    item.question_count,
    item.no_of_questions
  );

  // Calculate only when answer arrays are complete.
  // Never derive correct/wrong counts from a rounded score.
  const complete =
    userAnswers.length > 0 &&
    userAnswers.length === correctAnswers.length &&
    (
      totalQuestions === null ||
      totalQuestions === userAnswers.length
    );

  const calculated = complete
    ? calculateExamScore({
      ...item,
      user_answers: userAnswers,
      answer_array: correctAnswers,
    })
    : null;

  const attempted =
    firstNumber(
      item.total_attempted,
      item.attempted,
      item.attempted_questions
    ) ??
    calculated?.attempted ??
    null;

  const correct =
    firstNumber(
      item.total_correct,
      item.correct,
      item.correct_answers_count
    ) ??
    calculated?.correct ??
    null;

  const wrong =
    firstNumber(
      item.total_wrong,
      item.wrong,
      item.wrong_answers_count
    ) ??
    calculated?.wrong ??
    null;

  const score =
    firstNumber(
      item.user_score,
      item.score,
      item.marks_obtained
    ) ??
    calculated?.score ??
    null;

  const totalMark =
    firstNumber(
      item.total_mark,
      item.total_marks,
      item.maximum_mark
    ) ??
    calculated?.totalMark ??
    null;

  return {
    ...item,

    total_attempted: attempted,
    total_correct: correct,
    total_wrong: wrong,

    total_questions:
      totalQuestions ??
      (complete ? userAnswers.length : null),

    total_mark: totalMark,
    user_score: score,

    minus_mark:
      firstNumber(
        item.minus_mark,
        item.negative_mark
      ) ??
      calculated?.minusMark ??
      null,

    percentage:
      score !== null && totalMark > 0
        ? Math.round((score / totalMark) * 100)
        : null,

    _resultPrepared: true,

    _resultSource: complete
      ? "saved-data-with-answer-fallback"
      : "backend",
  };
}
