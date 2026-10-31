
/*
 * Shared exam result utilities.
 *
 * Supports:
 * - Four-option questions: A, B, C, D
 * - Five-option questions: A, B, C, D, E
 * - JSON and legacy saved answer arrays
 * - Android-compatible scoring
 * - Existing backend result fields
 */

const ANDROID_MARK_PER_CORRECT = 1;
const ANDROID_NEGATIVE_MARK = 0.333;

const ANDROID_EXAM_TYPES = new Set([
  "mock",
  "pqp",
  "pyq",
  "scert",
]);

const VALID_OPTIONS = new Set([
  "A",
  "B",
  "C",
  "D",
  "E",
]);

export function toResultNumber(value, fallback = 0) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return fallback;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

export function roundResultNumber(value) {
  return (
    Math.round(toResultNumber(value) * 100) / 100
  );
}

function optionalNumber(...values) {
  for (const value of values) {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      continue;
    }

    const number = Number(value);

    if (Number.isFinite(number)) {
      return number;
    }
  }

  return null;
}

/* =====================================================
   PARSE SAVED ANSWERS
===================================================== */

export function parseSavedAnswers(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value == null || value === "") {
    return [];
  }

  let text = String(value).trim();

  for (let index = 0; index < 3; index++) {
    try {
      const parsed = JSON.parse(text);

      if (Array.isArray(parsed)) {
        return parsed;
      }

      if (typeof parsed !== "string") {
        return [];
      }

      text = parsed.trim();
    } catch {
      break;
    }
  }

  // Legacy format: [A, B, E, 0]
  if (
    !/^\[\s*(?:[A-Ea-e]|0)(?:\s*,\s*(?:[A-Ea-e]|0))*\s*\]$/.test(
      text
    )
  ) {
    return [];
  }

  return text
    .slice(1, -1)
    .split(",")
    .map((item) => item.trim());
}

/* =====================================================
   NORMALIZE ANSWERS
===================================================== */

export function normalizeSavedAnswer(value) {
  if (value == null) {
    return "";
  }

  const raw = String(value).trim();

  if (
    !raw ||
    ["0", "null", "undefined", "none", "n/a", "-"].includes(
      raw.toLowerCase()
    )
  ) {
    return "";
  }

  const upper = raw.toUpperCase();

  if (VALID_OPTIONS.has(upper)) {
    return upper;
  }

  // Supports "A. Text", "B) Text", "E: Text".
  const match = upper.match(
    /^([A-E])(?:[\s.):\-]|$)/
  );

  return match ? match[1] : "";
}

export function isAnswered(value) {
  return Boolean(normalizeSavedAnswer(value));
}

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

/* =====================================================
   EXAM COUNTS
===================================================== */

export function calculateExamCounts(result = {}) {
  const correctAnswers = parseSavedAnswers(
    result.answer_array ??
    result.correct_answers
  );

  const userAnswers = parseSavedAnswers(
    result.user_answers ??
    result.user_answer_array
  );

  const canCalculate =
    correctAnswers.length > 0 &&
    correctAnswers.length === userAnswers.length &&
    correctAnswers.every((answer) =>
      VALID_OPTIONS.has(normalizeSavedAnswer(answer))
    ) &&
    userAnswers.every((answer) => {
      const normalized = normalizeSavedAnswer(answer);

      return (
        normalized !== "" ||
        answer === 0 ||
        answer === "0" ||
        answer == null ||
        String(answer).trim() === ""
      );
    });

  let arrayAttempted = null;
  let arrayCorrect = null;
  let arrayWrong = null;

  if (canCalculate) {
    arrayAttempted = 0;
    arrayCorrect = 0;
    arrayWrong = 0;

    for (
      let index = 0;
      index < userAnswers.length;
      index++
    ) {
      const selected = normalizeSavedAnswer(
        userAnswers[index]
      );

      if (!selected) {
        continue;
      }

      arrayAttempted++;

      const correctAnswer = normalizeSavedAnswer(
        correctAnswers[index]
      );

      if (selected === correctAnswer) {
        arrayCorrect++;
      } else {
        arrayWrong++;
      }
    }
  }

  // Prefer valid answer arrays for accurate A-E grading.
  // Fall back to saved backend counts when arrays
  // are unavailable or incomplete.
  let attempted = canCalculate
    ? arrayAttempted
    : optionalNumber(
        result.total_attempted,
        result.attempted
      );

  let correct = canCalculate
    ? arrayCorrect
    : optionalNumber(
        result.total_correct,
        result.correct
      );

  let wrong = canCalculate
    ? arrayWrong
    : optionalNumber(
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

  return {
    attempted,
    correct,
    wrong,
    correctAnswers,
    userAnswers,
    canCalculate,
  };
}

/* =====================================================
   ANDROID SCORE CALCULATION
===================================================== */

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

  const examType = String(
    result.exam_type ??
    result.examType ??
    ""
  )
    .trim()
    .toLowerCase();

  const androidScoring =
    ANDROID_EXAM_TYPES.has(examType);

  const markPerCorrect = androidScoring
    ? ANDROID_MARK_PER_CORRECT
    : toResultNumber(
        options.markPerCorrect ?? 1,
        1
      );

  const negativeMarkPerWrong = androidScoring
    ? ANDROID_NEGATIVE_MARK
    : toResultNumber(
        options.negativeMarkPerWrong ?? 0.333,
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

  // Android rounds total negative marks first.
  const minusMark = hasCounts
    ? roundResultNumber(
        wrong * negativeMarkPerWrong
      )
    : optionalNumber(
        result.minus_mark,
        result.minusMark
      );

  // Then subtracts negative marks from correct marks.
  const score = hasCounts
    ? roundResultNumber(
        correctMark - minusMark
      )
    : optionalNumber(
        result.user_score,
        result.score
      );

  const totalQuestions = optionalNumber(
    result.total_questions,
    result.totalQuestions,
    correctAnswers.length || null,
    userAnswers.length || null
  );

  const totalMark = optionalNumber(
    result.total_mark,
    result.totalMark,
    totalQuestions === null
      ? null
      : totalQuestions * markPerCorrect
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
    scoreSource: canCalculate
      ? "android-calculated"
      : hasCounts
        ? "backend-counts"
        : score !== null
          ? "backend"
          : "unavailable",
  };
}

/* =====================================================
   BUILD CALCULATED RESULT
===================================================== */

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
