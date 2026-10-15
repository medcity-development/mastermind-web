
/* =========================================================
   EXAM RESULT UTILITIES
   MasterMind Academy

   Android calculation:
   Correct mark = correct answers
   Negative mark = round(wrong answers * 0.333, 2)
   Final score = round(correct mark - negative mark, 2)
========================================================= */

/* =========================================================
   NUMBER
========================================================= */

export function toResultNumber(value, fallback = 0) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
}

/* =========================================================
   ROUND
   Equivalent to Android Math.round(x * 100) / 100
========================================================= */

export function roundResultNumber(value) {
  return (
    Math.round(toResultNumber(value, 0) * 100) / 100
  );
}

/* =========================================================
   PARSE SAVED ANSWERS

   Supports:
   ["A","B","C"]
   [A,B,C]
   Double-encoded JSON arrays
========================================================= */

export function parseSavedAnswers(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return [];
  }

  let text = String(value).trim();

  if (!text) {
    return [];
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const parsed = JSON.parse(text);

      if (Array.isArray(parsed)) {
        return parsed;
      }

      if (typeof parsed === "string") {
        text = parsed.trim();
        continue;
      }

      return [];
    } catch {
      break;
    }
  }

  // Legacy backend format: [A,B,0,C]
  return text
    .replace(/^\[/, "")
    .replace(/\]$/, "")
    .split(",")
    .map((item) =>
      item.trim().replace(/^["']|["']$/g, "")
    );
}

/* =========================================================
   NORMALIZE SAVED ANSWER
========================================================= */

export function normalizeSavedAnswer(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  const answer = String(value).trim();

  if (
    !answer ||
    answer === "0" ||
    ["null", "undefined", "none"].includes(
      answer.toLowerCase()
    )
  ) {
    return "";
  }

  const upper = answer.toUpperCase();

  if (/^[A-Z]$/.test(upper)) {
    return upper;
  }

  const optionMatch = upper.match(
    /^([A-Z])(?:[\s.):\-]|$)/
  );

  if (optionMatch) {
    return optionMatch[1];
  }

  return upper;
}

/* =========================================================
   IS ANSWERED
========================================================= */

export function isAnswered(value) {
  return Boolean(normalizeSavedAnswer(value));
}

/* =========================================================
   IS CORRECT ANSWER
========================================================= */

export function isCorrectAnswer(
  userAnswer,
  correctAnswer
) {
  const user = normalizeSavedAnswer(userAnswer);
  const correct = normalizeSavedAnswer(correctAnswer);

  return Boolean(
    user &&
    correct &&
    user === correct
  );
}

/* =========================================================
   SAFE OPTIONAL NUMBER

   Unlike toResultNumber, missing values remain null.
========================================================= */

function optionalNumber(...values) {
  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

/* =========================================================
   CALCULATE EXAM COUNTS

   Priority:
   1. Complete saved answer arrays
   2. Backend attempted/correct/wrong values

   Missing values are not treated as zero.
========================================================= */

export function calculateExamCounts(result = {}) {
  const correctAnswers = parseSavedAnswers(
    result.answer_array
  );

  const userAnswers = parseSavedAnswers(
    result.user_answers
  );

  const canCalculate =
    correctAnswers.length > 0 &&
    userAnswers.length > 0 &&
    correctAnswers.length === userAnswers.length &&
    correctAnswers.every((answer) =>
      Boolean(normalizeSavedAnswer(answer))
    );

  let attempted = null;
  let correct = null;
  let wrong = null;

  if (canCalculate) {
    attempted = 0;
    correct = 0;
    wrong = 0;

    for (
      let index = 0;
      index < userAnswers.length;
      index++
    ) {
      const userAnswer = normalizeSavedAnswer(
        userAnswers[index]
      );

      if (!userAnswer) {
        continue;
      }

      attempted++;

      const correctAnswer = normalizeSavedAnswer(
        correctAnswers[index]
      );

      if (userAnswer === correctAnswer) {
        correct++;
      } else {
        wrong++;
      }
    }
  } else {
    attempted = optionalNumber(
      result.total_attempted,
      result.attempted
    );

    correct = optionalNumber(
      result.total_correct,
      result.correct
    );

    wrong = optionalNumber(
      result.total_wrong,
      result.wrong
    );

    if (
      wrong === null &&
      attempted !== null &&
      correct !== null
    ) {
      wrong = Math.max(0, attempted - correct);
    }

    if (
      attempted === null &&
      correct !== null &&
      wrong !== null
    ) {
      attempted = correct + wrong;
    }

    if (
      correct === null &&
      attempted !== null &&
      wrong !== null
    ) {
      correct = Math.max(0, attempted - wrong);
    }
  }

  return {
    attempted,
    correct,
    wrong,
    correctAnswers,
    userAnswers,
    canCalculate,
  };
}

/* =========================================================
   CALCULATE EXAM SCORE

   Android MockTestResultsActivity.java:

   wrongMark = wrong * 0.333
   minusMark = Math.round(wrongMark * 100) / 100
   correctMark = correct
   score = Math.round(
     (correctMark - minusMark) * 100
   ) / 100

   Existing options remain supported for compatibility.
========================================================= */

export function calculateExamScore(
  result = {},
  options = {}
) {
  const counts = calculateExamCounts(result);

  const {
    attempted,
    correct,
    wrong,
    correctAnswers,
    userAnswers,
    canCalculate,
  } = counts;

  const markPerCorrect = toResultNumber(
    options.markPerCorrect ??
      result.mark_per_question ??
      1,
    1
  );

  const negativeMarkPerWrong = toResultNumber(
    options.negativeMarkPerWrong ??
      result.negative_mark_per_wrong ??
      0.333,
    0.333
  );

  const hasCounts =
    correct !== null &&
    wrong !== null;

  const correctMark = hasCounts
    ? roundResultNumber(
        correct * markPerCorrect
      )
    : null;

  const minusMark = hasCounts
    ? roundResultNumber(
        wrong * negativeMarkPerWrong
      )
    : optionalNumber(
        result.minus_mark,
        result.minusMark
      );

  const calculatedScore = hasCounts
    ? roundResultNumber(
        correctMark - minusMark
      )
    : null;

  const backendScore = optionalNumber(
    result.user_score,
    result.score
  );

  const score =
    calculatedScore !== null
      ? calculatedScore
      : backendScore;

  const totalQuestions = optionalNumber(
    result.total_questions,
    result.totalQuestions,
    correctAnswers.length || null,
    userAnswers.length || null
  );

  const totalMark = optionalNumber(
    result.total_mark,
    result.totalMark,
    totalQuestions !== null
      ? totalQuestions * markPerCorrect
      : null
  );

  const percentage =
    score !== null &&
    totalMark !== null &&
    totalMark > 0
      ? roundResultNumber(
          (score / totalMark) * 100
        )
      : null;

  return {
    attempted,
    correct,
    wrong,

    correctMark,
    minusMark,
    score,

    totalQuestions,
    totalMark,
    percentage,

    correctAnswers,
    userAnswers,

    canCalculate,
    hasCounts,

    scoreSource: hasCounts
      ? "calculated"
      : backendScore !== null
        ? "backend"
        : "unavailable",
  };
}

/* =========================================================
   BUILD CALCULATED EXAM RESULT

   Shared by:
   - Mock Tests
   - Previous Questions (PQP)
   - SCERT
   - Topic-wise Tests
   - Exam History Table
   - Exam History Result Modal

   Preserve original backend fields and identifiers.
========================================================= */

export function buildCalculatedExamResult(
  result = {},
  options = {}
) {
  const calculated = calculateExamScore(
    result,
    options
  );

  return {
    ...result,
    ...calculated,

    total_attempted: calculated.attempted,
    total_correct: calculated.correct,
    total_wrong: calculated.wrong,

    user_score: calculated.score,
    minus_mark: calculated.minusMark,

    total_mark: calculated.totalMark,
    total_questions: calculated.totalQuestions,
  };
}
