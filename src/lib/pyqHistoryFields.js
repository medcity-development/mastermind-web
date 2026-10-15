
/*
 * src/lib/pyqHistoryFields.js
 *
 * Recover PYQ history fields without changing
 * Mock, SCERT, Topic Wise or Study Plan logic.
 */

function isPresent(value) {
  return (
    value !== undefined &&
    value !== null &&
    value !== ""
  );
}

function toCount(value) {
  if (!isPresent(value)) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) &&
    Number.isInteger(number) &&
    number >= 0
    ? number
    : null;
}

function parseAnswerArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed
      : null;
  } catch {
    /*
     * Do not split legacy answer arrays on commas.
     * Option text itself may contain commas.
     */
    return null;
  }
}

function isAnswered(value) {
  if (!isPresent(value)) {
    return false;
  }

  const text = String(value)
    .trim()
    .toLowerCase();

  return ![
    "",
    "0",
    "null",
    "undefined",
  ].includes(text);
}

function normalizeAnswer(value) {
  if (!isAnswered(value)) {
    return "";
  }

  const text = String(value)
    .trim()
    .toUpperCase();

  const match = text.match(
    /^([A-D])(?:[.)\s]|$)/
  );

  return match
    ? match[1]
    : /^[A-D]$/.test(text)
      ? text
      : "";
}

export function recoverPyqHistoryFields(
  item = {}
) {
  const result = {
    ...item,
  };

  const userAnswers = parseAnswerArray(
    item.user_answers
  );

  const answerKeys = parseAnswerArray(
    item.answer_array
  );

  let attempted = toCount(
    item.total_attempted ??
    item.attempted_count
  );

  let correct = toCount(
    item.total_correct ??
    item.correct_count
  );

  let wrong = toCount(
    item.total_wrong ??
    item.wrong_count
  );

  /*
   * Prefer backend counts.
   * Recover attempted count from saved answers
   * only when the backend count is missing.
   */

  if (
    attempted === null &&
    userAnswers
  ) {
    attempted = userAnswers.filter(
      isAnswered
    ).length;
  }

  /*
   * Compare answer arrays only when both
   * arrays are complete and use comparable
   * A/B/C/D option representations.
   */

  if (
    (correct === null || wrong === null) &&
    userAnswers &&
    answerKeys &&
    userAnswers.length === answerKeys.length
  ) {
    let calculatedCorrect = 0;
    let calculatedWrong = 0;
    let valid = true;

    for (
      let index = 0;
      index < userAnswers.length;
      index++
    ) {
      const userAnswer = userAnswers[index];

      if (!isAnswered(userAnswer)) {
        continue;
      }

      const selected = normalizeAnswer(
        userAnswer
      );

      const expected = normalizeAnswer(
        answerKeys[index]
      );

      if (!selected || !expected) {
        valid = false;
        break;
      }

      if (selected === expected) {
        calculatedCorrect++;
      } else {
        calculatedWrong++;
      }
    }

    if (valid) {
      if (correct === null) {
        correct = calculatedCorrect;
      }

      if (wrong === null) {
        wrong = calculatedWrong;
      }
    }
  }

  if (
    attempted === null &&
    correct !== null &&
    wrong !== null
  ) {
    attempted = correct + wrong;
  }

  if (
    wrong === null &&
    attempted !== null &&
    correct !== null &&
    attempted >= correct
  ) {
    wrong = attempted - correct;
  }

  if (
    correct === null &&
    attempted !== null &&
    wrong !== null &&
    attempted >= wrong
  ) {
    correct = attempted - wrong;
  }

  if (attempted !== null) {
    result.total_attempted = attempted;
  }

  if (correct !== null) {
    result.total_correct = correct;
  }

  if (wrong !== null) {
    result.total_wrong = wrong;
  }

  /*
   * Preserve original timestamps.
   * modified_at is not necessarily end_time.
   */

  return result;
}
