
const OPTION_LETTERS = ["A", "B", "C", "D", "E"];

export function normalizeQuestions(questions) {
  if (!Array.isArray(questions)) {
    return [];
  }

  return questions.map((item, index) => ({
    ...item,

    id: item?.id ?? index + 1,

    question: item?.question ?? "",
    questionAlias:
      item?.question_alias ??
      item?.questionAlias ??
      "",

    qtype: item?.qtype,
    attached: item?.attached,

    option1: item?.option1,
    option2: item?.option2,
    option3: item?.option3,
    option4: item?.option4,
    option5: item?.option5,

    answer: item?.answer,

    answerkey:
      item?.answerkey ??
      item?.answer_key ??
      item?.correct_answer ??
      item?.correctAnswer,

    comment: item?.comment,

    commentAttach:
      item?.comment_attach ??
      item?.commentAttach,

    order:
      item?.orders ??
      item?.order ??
      index + 1,
  }));
}

export function normalizeOptionAnswer(value) {
  const text = String(value ?? "")
    .trim()
    .toUpperCase();

  if (
    !text ||
    ["0", "NULL", "NONE", "UNDEFINED"].includes(text)
  ) {
    return "";
  }

  const match = text.match(
    /^(?:OPTION\s*)?([A-E])(?=$|[\s.):\-])/
  );

  return match?.[1] ?? "";
}

export function getAvailableOptions(question = {}) {
  return OPTION_LETTERS.filter((letter, index) => {
    const value = question?.[`option${index + 1}`];

    return (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
    );
  });
}

export function isValidOptionAnswer(question, answer) {
  const selected = normalizeOptionAnswer(answer);

  return Boolean(
    selected &&
    getAvailableOptions(question).includes(selected)
  );
}

export function getQuestionAnswerKey(question = {}) {
  const explicitKey =
    question?.answerkey ??
    question?.answer_key ??
    question?.correct_answer ??
    question?.correctAnswer;

  if (
    explicitKey !== null &&
    explicitKey !== undefined &&
    String(explicitKey).trim() !== ""
  ) {
    return normalizeOptionAnswer(explicitKey);
  }

  // The fallback is safe only when the answer field
  // contains an explicit option letter, not arbitrary
  // answer text.
  return normalizeOptionAnswer(question?.answer);
}

export function validateQuestionAnswerKey(question) {
  const available = getAvailableOptions(question);
  const correct = getQuestionAnswerKey(question);

  return (
    available.length >= 2 &&
    available.includes(correct)
  );
}

export function calculatePreviousQuestionResult({
  questions = [],
  answers = {},
} = {}) {
  const list = Array.isArray(questions)
    ? questions
    : [];

  const answerArray = [];
  const userAnswers = [];
  const validationErrors = [];

  let attempted = 0;
  let correct = 0;

  list.forEach((question, index) => {
    const questionId = question?.id ?? index + 1;

    const correctAnswer =
      getQuestionAnswerKey(question);

    const rawSelected =
      answers?.[questionId] ?? "";

    const selected =
      normalizeOptionAnswer(rawSelected);

    const available =
      getAvailableOptions(question);

    answerArray.push(correctAnswer || 0);

    userAnswers.push(
      selected && available.includes(selected)
        ? selected
        : 0
    );

    if (!validateQuestionAnswerKey(question)) {
      validationErrors.push({
        questionId,
        reason:
          "Missing or invalid correct answer key",
      });
    }

    const skipped =
      rawSelected === null ||
      rawSelected === undefined ||
      ["", "0", "NULL", "NONE", "UNDEFINED"].includes(
        String(rawSelected).trim().toUpperCase()
      );

    if (skipped) {
      return;
    }

    if (!available.includes(selected)) {
      validationErrors.push({
        questionId,
        reason:
          "Selected answer is not an available option",
      });

      return;
    }

    attempted += 1;

    if (selected === correctAnswer) {
      correct += 1;
    }
  });

  const wrong = attempted - correct;

  const unanswered = Math.max(
    0,
    list.length - attempted
  );

  const positiveMark = correct;

  const negativeMark =
    Math.round((wrong * 0.333 + Number.EPSILON) * 100) /
    100;

  const score =
    Math.round(
      (positiveMark - negativeMark + Number.EPSILON) *
      100
    ) / 100;

  return {
    answerArray,
    userAnswers,

    attempted,
    correct,
    wrong,
    unanswered,

    positiveMark,
    negativeMark,
    score,

    totalAttempted: attempted,
    totalCorrect: correct,
    totalWrong: wrong,
    totalUnanswered: unanswered,

    minusMark: negativeMark,
    userScore: score,

    scoreVerified:
      validationErrors.length === 0,

    validationErrors,
  };
}

export function formatExamArray(values) {
  if (!Array.isArray(values)) {
    return "[]";
  }

  return `[${values.join(", ")}]`;
}
