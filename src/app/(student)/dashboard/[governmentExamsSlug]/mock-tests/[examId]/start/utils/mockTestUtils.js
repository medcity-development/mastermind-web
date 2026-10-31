
export const QUESTIONS_PER_PAGE = 10;
export const WRONG_MARK = 0.333;
export const CORRECT_MARK = 1;

const LETTERS = ["A", "B", "C", "D", "E"];

export function normalizeAnswer(value) {
  const text = String(value ?? "").trim().toUpperCase();

  if (
    !text ||
    ["0", "NULL", "UNDEFINED", "NONE"].includes(text)
  ) {
    return "";
  }

  const match = text.match(
    /^(?:OPTION\s*)?([A-E])(?=$|[\s.):\-])/
  );

  return match?.[1] ?? "";
}

export function getCorrectAnswer(question = {}) {
  return (
    question?.answerkey ??
    question?.answer_key ??
    question?.correct_answer ??
    question?.correctAnswer ??
    question?.right_answer ??
    question?.rightAnswer ??
    question?.correct_option ??
    question?.correctOption ??
    question?.answer ??
    question?.ans ??
    ""
  );
}

// Prefer the backend's actual option1...option5 fields.
// Never infer an option from the answer key.

export function getQuestionOptions(question = {}) {
  const found = new Set();

  const add = (letter, value) => {
    if (
      value != null &&
      String(value).trim() !== ""
    ) {
      found.add(letter);
    }
  };

  for (let index = 0; index < LETTERS.length; index++) {
    const letter = LETTERS[index];
    const lower = letter.toLowerCase();

    const fields = [
      `option${index + 1}`,
      `option_${index + 1}`,
      `option${letter}`,
      `option${lower}`,
      `option_${lower}`,
      `option_${letter}`,
      `choice${letter}`,
      `choice_${lower}`,
      lower,
      letter,
    ];

    for (const field of fields) {
      if (Object.hasOwn(question, field)) {
        add(letter, question[field]);
      }
    }
  }

  for (const source of [
    question.options,
    question.choices,
    question.option_list,
    question.optionList,
  ]) {
    if (Array.isArray(source)) {
      source.slice(0, 5).forEach((item, index) => {
        const label =
          item && typeof item === "object"
            ? normalizeAnswer(
                item.key ??
                item.label ??
                item.letter ??
                item.option_key
              ) || LETTERS[index]
            : LETTERS[index];

        const value =
          item && typeof item === "object"
            ? item.text ??
              item.value ??
              item.title ??
              item.option_text ??
              item.option_value
            : item;

        if (LETTERS.includes(label)) {
          add(label, value);
        }
      });
    } else if (
      source &&
      typeof source === "object"
    ) {
      LETTERS.forEach((letter) => {
        const lower = letter.toLowerCase();

        for (const field of [
          letter,
          lower,
          `option_${lower}`,
          `option${letter}`,
        ]) {
          if (Object.hasOwn(source, field)) {
            add(letter, source[field]);
          }
        }
      });
    }
  }

  return LETTERS.filter((letter) =>
    found.has(letter)
  );
}

export function isValidQuestionAnswer(question, answer) {
  const selected = normalizeAnswer(answer);

  return Boolean(
    selected &&
    getQuestionOptions(question).includes(selected)
  );
}

export function parseAnswerArray(value) {
  if (Array.isArray(value)) return value;

  if (value == null || value === "") return [];

  const text = String(value).trim();

  if (!text) return [];

  try {
    const parsed = JSON.parse(text);

    if (Array.isArray(parsed)) {
      return parsed;
    }

    if (typeof parsed === "string") {
      const second = JSON.parse(parsed);

      if (Array.isArray(second)) {
        return second;
      }
    }
  } catch {
    // Legacy backend format.
  }

  return text
    .replace(/^\[/, "")
    .replace(/\]$/, "")
    .split(",")
    .map((item) =>
      item.trim().replace(/^["']|["']$/g, "")
    );
}

export function getAttemptId(result) {
  if (!result || typeof result !== "object") {
    return null;
  }

  const keys = [
    "pauseid",
    "pause_id",
    "attempt_id",
    "attemptId",
    "id",
    "last_id",
    "lastid",
    "insert_id",
  ];

  for (const key of keys) {
    const value = result[key];

    if (
      value != null &&
      String(value).trim() &&
      String(value) !== "0"
    ) {
      return value;
    }
  }

  for (const source of [
    result.data,
    result.details,
    result.result,
  ]) {
    if (!source) continue;

    if (Array.isArray(source)) {
      for (const item of source) {
        const id = getAttemptId(item);

        if (id) return id;
      }
    } else if (typeof source === "object") {
      const id = getAttemptId(source);

      if (id) return id;
    }
  }

  return null;
}

export function getDatabaseResult(result) {
  if (Array.isArray(result?.details)) {
    return result.details[0] ?? null;
  }

  if (
    result?.details &&
    typeof result.details === "object"
  ) {
    return result.details;
  }

  if (Array.isArray(result?.data)) {
    return result.data[0] ?? null;
  }

  if (
    result?.data &&
    typeof result.data === "object"
  ) {
    return result.data;
  }

  return null;
}

export function getExamType(...sources) {
  for (const source of sources) {
    const value =
      source?.exam_type ??
      source?.examType ??
      source?.type ??
      source?.lastposition;

    if (
      value != null &&
      String(value).trim()
    ) {
      return String(value)
        .trim()
        .toLowerCase();
    }
  }

  return "";
}

export function getExamStatus(value) {
  const status = String(value ?? "")
    .trim()
    .toLowerCase();

  if (
    ["finish", "finished", "complete", "completed"]
      .includes(status)
  ) {
    return "finish";
  }

  if (["pause", "paused"].includes(status)) {
    return "pause";
  }

  return status;
}

export function getDurationSeconds(exam) {
  const minutes = Number(
    exam?.total_minutes ??
    exam?.totalMinutes ??
    exam?.duration_minutes ??
    exam?.duration
  );

  return Number.isFinite(minutes) && minutes > 0
    ? Math.floor(minutes * 60)
    : 0;
}

export function getExamTotalMark(exam, fallback = 0) {
  const value = Number(
    exam?.total_mark ??
    exam?.totalMark
  );

  return Number.isFinite(value) && value > 0
    ? value
    : fallback;
}

export function roundMark(value) {
  const number = Number(value);

  return Number.isFinite(number)
    ? Math.round(number * 100) / 100
    : 0;
}

/* =====================================================
   RESULT CALCULATION

   Correct = +1
   Wrong   = -0.333
   Skipped = 0

   Supports A-D and A-E.
===================================================== */

export function calculateMockResult({
  questions = [],
  answers = {},
} = {}) {
  const list = Array.isArray(questions)
    ? questions
    : [];

  const answerArray = list.map(
    (question) => getCorrectAnswer(question) || 0
  );

  const userAnswers = list.map(
    (question, index) =>
      answers?.[question?.id ?? index + 1] ?? 0
  );

  let totalAttempted = 0;
  let totalCorrect = 0;
  let invalidCount = 0;

  const validationErrors = [];

  list.forEach((question, index) => {
    const questionId =
      question?.id ?? index + 1;

    const options = getQuestionOptions(question);

    const correct = normalizeAnswer(
      answerArray[index]
    );

    const selected = normalizeAnswer(
      userAnswers[index]
    );

    // Validate every question, including skipped ones.

    if (!options.length) {
      validationErrors.push({
        questionId,
        reason: "No recognizable question options",
      });
      return;
    }

    if (
      !correct ||
      !options.includes(correct)
    ) {
      validationErrors.push({
        questionId,
        reason:
          "Answer key is missing or not among available options",
      });
      return;
    }

    const raw = userAnswers[index];

    if (
      raw == null ||
      String(raw).trim() === "" ||
      ["0", "NULL", "UNDEFINED", "NONE"].includes(
        String(raw).trim().toUpperCase()
      )
    ) {
      return;
    }

    if (
      !selected ||
      !options.includes(selected)
    ) {
      invalidCount++;

      validationErrors.push({
        questionId,
        reason:
          "Selected option is not available for this question",
      });

      return;
    }

    totalAttempted++;

    if (selected === correct) {
      totalCorrect++;
    }
  });

  const totalWrong =
    totalAttempted - totalCorrect;

  const minusMark = roundMark(
    totalWrong * WRONG_MARK
  );

  const positiveMark = roundMark(
    totalCorrect * CORRECT_MARK
  );

  const userScore = roundMark(
    positiveMark - minusMark
  );

  const skipped = Math.max(
    0,
    list.length - totalAttempted - invalidCount
  );

  return {
    answerArray,
    userAnswers,
    totalAttempted,
    totalCorrect,
    totalWrong,
    skipped,
    invalidCount,
    validationErrors,
    positiveMark,
    minusMark,
    userScore,
    scoreVerified: validationErrors.length === 0,
  };
}

/* =====================================================
   POST JSON
===================================================== */

export async function postJson(endpoint, payload) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const text = await response.text();

  let result;

  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      "Exam API returned invalid JSON."
    );
  }

  if (
    !response.ok ||
    result?.status === false
  ) {
    throw new Error(
      result?.message ??
      result?.msg ??
      "Exam service request failed."
    );
  }

  return result;
}
