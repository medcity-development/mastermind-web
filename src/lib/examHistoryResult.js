import {
  calculateExamScore,
  parseSavedAnswers,
} from "@/lib/examResultUtils";

import {
  isFinishedExamAttempt,
} from "@/lib/examAttemptStatus";

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

function normalizeType(item) {
  return String(
    item?._examType ??
      item?.exam_type ??
      item?.examType ??
      ""
  )
    .trim()
    .toLowerCase()
    .replace(/[-_\s]/g, "");
}

export function prepareExamHistoryResult(
  item = {}
) {
  const type = normalizeType(item);

  const hasStudyPlanAnalytics =
    type === "studyplan" &&
    firstNumber(
      item.user_score,
      item.score,
      item.marks_obtained
    ) !== null &&
    firstNumber(
      item.total_mark,
      item.total_marks,
      item.maximum_mark
    ) !== null;

  const finished =
    isFinishedExamAttempt(item) ||
    (
      hasStudyPlanAnalytics &&
      ![
        "pause",
        "paused",
        "inprogress",
        "in_progress",
        "running",
      ].includes(
        String(
          item.exam_status ??
            item.status ??
            ""
        )
          .trim()
          .toLowerCase()
      )
    );

  const userAnswers = finished
    ? parseSavedAnswers(
        item.user_answers ??
          item.user_answer_array
      )
    : [];

  const correctAnswers = finished
    ? parseSavedAnswers(
        item.answer_array ??
          item.correct_answers
      )
    : [];

  const totalQuestions = firstNumber(
    item.total_questions,
    item.question_count,
    item.no_of_questions
  );

  const complete =
    finished &&
    userAnswers.length > 0 &&
    userAnswers.length ===
      correctAnswers.length &&
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

  const attempted = finished
    ? (
        firstNumber(
          item.total_attempted,
          item.attempted,
          item.attempted_questions,
          item.attempted_count
        ) ??
        calculated?.attempted ??
        null
      )
    : null;

  const correct = finished
    ? (
        firstNumber(
          item.total_correct,
          item.correct,
          item.correct_answers_count,
          item.correct_count
        ) ??
        calculated?.correct ??
        null
      )
    : null;

  const wrong = finished
    ? (
        firstNumber(
          item.total_wrong,
          item.wrong,
          item.wrong_answers_count,
          item.wrong_count
        ) ??
        calculated?.wrong ??
        null
      )
    : null;

  const score = finished
    ? (
        firstNumber(
          item.user_score,
          item.score,
          item.marks_obtained
        ) ??
        calculated?.score ??
        null
      )
    : null;

  const totalMark =
    firstNumber(
      item.total_mark,
      item.total_marks,
      item.maximum_mark
    ) ??
    calculated?.totalMark ??
    null;

  const minusMark = finished
    ? (
        firstNumber(
          item.minus_mark,
          item.negative_mark
        ) ??
        calculated?.minusMark ??
        null
      )
    : null;

  return {
    ...item,

    total_attempted: attempted,
    total_correct: correct,
    total_wrong: wrong,

    total_questions:
      totalQuestions ??
      (
        complete
          ? userAnswers.length
          : null
      ),

    total_mark: totalMark,
    user_score: score,
    minus_mark: minusMark,

    percentage:
      score !== null &&
      totalMark !== null &&
      totalMark > 0
        ? Math.round(
            (score / totalMark) * 100
          )
        : null,

    _resultPrepared: true,

    _resultSource: complete
      ? "saved-data-with-answer-fallback"
      : hasStudyPlanAnalytics
        ? "studyplan-backend-analytics"
        : "backend",
  };
}