/* Shared Android-compatible scoring for all exam types. */
export function toResultNumber(value, fallback = 0) {
  if (value === undefined || value === null || value === "") return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function roundResultNumber(value) {
  return Math.round(toResultNumber(value) * 100) / 100;
}

export function parseSavedAnswers(value) {
  if (Array.isArray(value)) return value;
  if (value == null || value === "") return [];
  let text = String(value).trim();
  for (let i = 0; i < 3; i++) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed;
      if (typeof parsed !== "string") return [];
      text = parsed.trim();
    } catch {
      break;
    }
  }
  // Only accept legacy arrays made of single-letter keys or 0.
  // Commas inside full option text cannot be split safely.
  if (!/^\[\s*(?:[A-Za-z]|0)(?:\s*,\s*(?:[A-Za-z]|0))*\s*\]$/.test(text)) {
    return [];
  }
  return text.slice(1, -1).split(",").map((item) => item.trim());
}

export function normalizeSavedAnswer(value) {
  if (value == null) return "";
  const raw = String(value).trim();
  if (!raw || ["0", "null", "undefined", "none", "-"].includes(raw.toLowerCase())) return "";
  const upper = raw.toUpperCase();
  if (/^[A-Z]$/.test(upper)) return upper;
  const match = upper.match(/^([A-Z])(?:[\s.):\-]|$)/);
  return match ? match[1] : upper;
}

export function isAnswered(value) {
  return Boolean(normalizeSavedAnswer(value));
}

export function isCorrectAnswer(userAnswer, correctAnswer) {
  const user = normalizeSavedAnswer(userAnswer);
  const correct = normalizeSavedAnswer(correctAnswer);
  return Boolean(user && correct && user === correct);
}

function optionalNumber(...values) {
  for (const value of values) {
    if (value === undefined || value === null || value === "") continue;
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }
  return null;
}

export function calculateExamCounts(result = {}) {
  const correctAnswers = parseSavedAnswers(result.answer_array ?? result.correct_answers);
  const userAnswers = parseSavedAnswers(result.user_answers ?? result.user_answer_array);
  const canCalculate = correctAnswers.length > 0 &&
    correctAnswers.length === userAnswers.length &&
    correctAnswers.every((answer) => isAnswered(answer));

  let arrayAttempted = null;
  let arrayCorrect = null;
  let arrayWrong = null;
  if (canCalculate) {
    arrayAttempted = 0;
    arrayCorrect = 0;
    arrayWrong = 0;
    for (let i = 0; i < userAnswers.length; i++) {
      const selected = normalizeSavedAnswer(userAnswers[i]);
      if (!selected) continue;
      arrayAttempted++;
      if (selected === normalizeSavedAnswer(correctAnswers[i])) arrayCorrect++;
      else arrayWrong++;
    }
  }

  // A saved backend attempt is authoritative for its counts.
  let attempted = optionalNumber(result.total_attempted, result.attempted, arrayAttempted);
  let correct = optionalNumber(result.total_correct, result.correct, arrayCorrect);
  let wrong = optionalNumber(result.total_wrong, result.wrong, arrayWrong);
  if (wrong === null && attempted !== null && correct !== null) wrong = Math.max(0, attempted - correct);
  if (attempted === null && correct !== null && wrong !== null) attempted = correct + wrong;
  if (correct === null && attempted !== null && wrong !== null) correct = Math.max(0, attempted - wrong);
  return { attempted, correct, wrong, correctAnswers, userAnswers, canCalculate };
}

export function calculateExamScore(result = {}, options = {}) {
  const counts = calculateExamCounts(result);
  const { attempted, correct, wrong, correctAnswers, userAnswers, canCalculate } = counts;
  // Android uses 1 point for a correct answer and 0.333 penalty for a wrong answer.
  // Allow explicit per-exam rules only if a caller deliberately passes them.
  const markPerCorrect = toResultNumber(options.markPerCorrect ?? 1, 1);
  const negativeMarkPerWrong = toResultNumber(options.negativeMarkPerWrong ?? 0.333, 0.333);
  const hasCounts = correct !== null && wrong !== null;
  const correctMark = hasCounts ? roundResultNumber(correct * markPerCorrect) : null;
  const minusMark = hasCounts ? roundResultNumber(wrong * negativeMarkPerWrong) : optionalNumber(result.minus_mark, result.minusMark);
  const score = hasCounts ? roundResultNumber(correctMark - minusMark) : optionalNumber(result.user_score, result.score);
  const totalQuestions = optionalNumber(result.total_questions, result.totalQuestions, correctAnswers.length || null, userAnswers.length || null);
  const totalMark = optionalNumber(result.total_mark, result.totalMark, totalQuestions === null ? null : totalQuestions * markPerCorrect);
  const percentage = score !== null && totalMark !== null && totalMark > 0
    ? roundResultNumber(score / totalMark * 100) : null;
  return {
    attempted, correct, wrong, correctMark, minusMark, score,
    totalQuestions, totalMark, percentage, correctAnswers, userAnswers,
    canCalculate, hasCounts,
    scoreSource: hasCounts ? "android-calculated" : score !== null ? "backend" : "unavailable",
  };
}

export function buildCalculatedExamResult(result = {}, options = {}) {
  const calculated = calculateExamScore(result, options);
  return {
    ...result, ...calculated,
    total_attempted: calculated.attempted,
    total_correct: calculated.correct,
    total_wrong: calculated.wrong,
    user_score: calculated.score,
    minus_mark: calculated.minusMark,
    total_mark: calculated.totalMark,
    total_questions: calculated.totalQuestions,
  };
}
