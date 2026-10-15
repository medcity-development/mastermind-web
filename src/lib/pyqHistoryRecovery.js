
/*
 * PYQ-only history recovery.
 * Does not change shared exam calculation code.
 */

function count(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const n = Number(value);

  return Number.isSafeInteger(n) && n >= 0
    ? n
    : null;
}

function parseArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  let current = value;

  for (let i = 0; i < 3; i++) {
    if (Array.isArray(current)) {
      return current;
    }

    if (typeof current !== "string") {
      return null;
    }

    try {
      current = JSON.parse(current);
    } catch {
      return null;
    }
  }

  return Array.isArray(current) ? current : null;
}

function isAnswered(value) {
  if (value === null || value === undefined) {
    return false;
  }

  const text = String(value).trim().toLowerCase();

  return ![
    "",
    "0",
    "null",
    "undefined",
    "unanswered",
  ].includes(text);
}

function answerLetter(value) {
  if (!isAnswered(value)) {
    return "";
  }

  const text = String(value).trim().toUpperCase();

  if (/^[A-D]$/.test(text)) {
    return text;
  }

  const match = text.match(/^([A-D])\s*[.)]\s*\S/);

  return match?.[1] ?? "";
}

export function recoverPyqHistory(record = {}) {
  const result = { ...record };

  let attempted = count(
    record.total_attempted ??
    record.attempted_count
  );

  let correct = count(
    record.total_correct ??
    record.correct_count
  );

  let wrong = count(
    record.total_wrong ??
    record.wrong_count
  );

  const selected = parseArray(record.user_answers);
  const keys = parseArray(record.answer_array);

  if (attempted === null && selected) {
    attempted = selected.filter(isAnswered).length;
  }

  if (
    (correct === null || wrong === null) &&
    selected &&
    keys &&
    selected.length === keys.length
  ) {
    let calculatedCorrect = 0;
    let calculatedWrong = 0;
    let comparable = true;

    for (let i = 0; i < selected.length; i++) {
      if (!isAnswered(selected[i])) {
        continue;
      }

      const user = answerLetter(selected[i]);
      const expected = answerLetter(keys[i]);

      if (!user || !expected) {
        comparable = false;
        break;
      }

      if (user === expected) {
        calculatedCorrect++;
      } else {
        calculatedWrong++;
      }
    }

    if (comparable) {
      correct ??= calculatedCorrect;
      wrong ??= calculatedWrong;
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

  if (
    (correct === null || wrong === null) &&
    attempted !== null &&
    attempted > 0
  ) {
    const rawScore = Number(record.user_score ?? record.score ?? record.marks_obtained);
    const rawMinus = Number(record.minus_mark ?? record.negative_mark);

    if (Number.isFinite(rawMinus) && rawMinus !== 0) {
      const absMinus = Math.abs(rawMinus);
      const calculatedWrong = Math.round(absMinus / 0.3333333333333333);
      if (calculatedWrong <= attempted) {
        wrong ??= calculatedWrong;
        correct ??= attempted - calculatedWrong;
      }
    } else if (Number.isFinite(rawScore)) {
      // Kerala PSC standard: Score = C - W/3 => 4C = 3*Score + A => C = (3*Score + A) / 4
      const calculatedCorrect = Math.round((3 * rawScore + attempted) / 4);
      const calculatedWrong = attempted - calculatedCorrect;

      if (
        calculatedCorrect >= 0 &&
        calculatedWrong >= 0 &&
        calculatedCorrect + calculatedWrong === attempted
      ) {
        const expectedScore = calculatedCorrect - calculatedWrong / 3;
        if (Math.abs(expectedScore - rawScore) < 0.1) {
          correct ??= calculatedCorrect;
          wrong ??= calculatedWrong;
        }
      }
    }
  }

  if (attempted !== null) {
    result.total_attempted = attempted;
    result.attempted_count = attempted;
  }

  if (correct !== null) {
    result.total_correct = correct;
    result.correct_count = correct;
  }

  if (wrong !== null) {
    result.total_wrong = wrong;
    result.wrong_count = wrong;
  }

  return result;
}
