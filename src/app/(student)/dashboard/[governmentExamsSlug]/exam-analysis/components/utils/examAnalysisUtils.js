
import { parseSavedAnswers } from "@/lib/examResultUtils";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function first(...values) {
  return values.find(
    (value) =>
      value !== null &&
      value !== undefined &&
      value !== ""
  );
}

function decodeEntities(value) {
  return String(value ?? "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

export function cleanQuestionText(value) {
  return decodeEntities(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|div|li)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function getQuestionHtml(question = {}) {
  return String(
    first(
      question.question_html,
      question.questionHtml,
      question.question,
      question.question_text,
      question.questionText,
      question.question_name,
      question.questionName,
      question.ques,
      question.qtn,
      question.title,
      ""
    )
  );
}

export function getQuestionText(question = {}) {
  return cleanQuestionText(getQuestionHtml(question));
}

export function answerKey(value) {
  if (value == null) return "";

  if (typeof value === "object") {
    return answerKey(
      first(
        value.key,
        value.option_key,
        value.label,
        value.option,
        value.answer,
        value.value
      )
    );
  }

  const text = String(value).trim();

  if (
    !text ||
    ["0", "null", "undefined", "none", "-"].includes(
      text.toLowerCase()
    )
  ) {
    return "";
  }

  const upper = text.toUpperCase();

  if (/^[A-Z]$/.test(upper)) {
    return upper;
  }

  const match = upper.match(/^([A-Z])[\s.):\-]/);

  return match ? match[1] : "";
}

function optionData(key, value) {
  const data =
    value &&
      typeof value === "object" &&
      !Array.isArray(value)
      ? value
      : null;

  const raw = data
    ? first(
      data.text,
      data.option_text,
      data.option,
      data.answer,
      data.value,
      data.title,
      ""
    )
    : value;

  const html = String(raw ?? "");

  return {
    key,
    text: cleanQuestionText(html),
    html,
    image: data
      ? first(
        data.image,
        data.image_url,
        data.img,
        data.attached,
        data.attachment,
        ""
      )
      : "",
  };
}

export function getQuestionOptions(question = {}) {
  let source = first(
    question.options,
    question.answers,
    question.choices,
    question.option_list
  );

  if (typeof source === "string") {
    try {
      source = JSON.parse(source);
    } catch {
      source = null;
    }
  }

  if (Array.isArray(source)) {
    return source
      .map((item, index) => {
        const key = answerKey(
          item && typeof item === "object"
            ? first(item.key, item.option_key, item.label)
            : null
        ) || LETTERS[index];
        return key ? optionData(key, item) : null;
      })
      .filter((option) => option && (option.text || option.image || /<img\b/i.test(option.html)));
  }

  if (source && typeof source === "object") {
    return Object.entries(source)
      .map(([key, value]) => {
        const label = answerKey(key) ||
          (/^\d+$/.test(key) ? LETTERS[Number(key) - 1] : key.toUpperCase());
        return label ? optionData(label, value) : null;
      })
      .filter((option) => option && (option.text || option.image || /<img\b/i.test(option.html)));
  }

  const collected = new Map();
  for (const [field, value] of Object.entries(question)) {
    if (value == null || value === "") continue;
    const match = field.match(/^(?:option_?([a-z])|option_?(\d+)|answer_?(\d+))$/i);
    if (!match) continue;
    const key = match[1]
      ? match[1].toUpperCase()
      : LETTERS[Number(match[2] ?? match[3]) - 1];
    if (key && !collected.has(key)) collected.set(key, optionData(key, value));
  }
  return [...collected.values()]
    .filter((option) => option.text || option.image || /<img\b/i.test(option.html))
    .sort((a, b) => a.key.localeCompare(b.key));
}

function savedArray(...values) {
  for (const value of values) {
    const parsed = parseSavedAnswers(value);

    if (parsed.length) {
      return parsed;
    }
  }

  return [];
}

function questionId(question) {
  const value = first(
    question?.question_id,
    question?.questionId,
    question?.qid,
    question?.id
  );

  return value == null ? "" : String(value);
}

function savedQuestionIds(result) {
  return savedArray(
    result.question_ids,
    result.question_id_array,
    result.questionIds
  ).map(String);
}

function formatAnswerDisplay(key, value) {
  const letter = String(key ?? "")
    .trim()
    .toUpperCase();

  const text = cleanQuestionText(value);

  if (!letter) {
    return text || "Not Available";
  }

  if (!text) {
    return letter;
  }

  const prefix = new RegExp(
    `^(?:${letter}\\s*[.)]\\s*)+`,
    "i"
  );

  const cleaned = text.replace(prefix, "").trim();

  if (
    !cleaned ||
    cleaned.toUpperCase() === letter
  ) {
    return letter;
  }

  return `${letter}. ${cleaned}`;
}

function displayAnswer(key, raw, options = []) {
  if (!key) {
    return cleanQuestionText(raw) || "Not Answered";
  }

  const match = options.find(
    (option) => option.key === key
  );

  return formatAnswerDisplay(
    key,
    match ? match.text : raw
  );
}

export function buildQuestionRows({
  result = {},
  questions = [],
  imagePath = "",
} = {}) {
  const userAnswers = savedArray(
    result.user_answers,
    result.user_answer_array
  );

  const correctAnswers = savedArray(
    result.answer_array,
    result.correct_answers
  );

  const paper = Array.isArray(questions)
    ? questions
    : [];

  const ids = savedQuestionIds(result);

  const canMatchIds =
    ids.length > 0 &&
    paper.length > 0 &&
    paper.every((question) => questionId(question));

  const canMatchPosition =
    paper.length > 0 &&
    (
      (userAnswers.length > 0 &&
        paper.length === userAnswers.length) ||
      (correctAnswers.length > 0 &&
        paper.length === correctAnswers.length)
    );

  const byId = new Map(
    paper.map((question) => [
      questionId(question),
      question,
    ])
  );

  const count = Math.max(
    userAnswers.length,
    correctAnswers.length,
    paper.length,
    Number(result.total_questions) || 0
  );

  return Array.from(
    { length: count },
    (_, index) => {
      const question =
        canMatchIds && ids[index]
          ? byId.get(ids[index]) ?? null
          : canMatchPosition
            ? paper[index] ?? null
            : null;

      const options = getQuestionOptions(
        question ?? {}
      );

      const rawUserAnswer =
        userAnswers[index] ?? "";

      const rawCorrectAnswer =
        correctAnswers[index] ?? "";

      const userAnswerKey = answerKey(rawUserAnswer);

      const questionCorrect = first(
        question?.answerkey,
        question?.answer_key,
        question?.answer,
        question?.correct_answer,
        question?.correctAnswer,
        question?.answer_key,
        question?.answerKey,
        question?.right_answer
      );

      const correctAnswerKey =
        answerKey(rawCorrectAnswer) ||
        answerKey(questionCorrect);

      const attempted = Boolean(
        userAnswerKey ||
        (
          String(rawUserAnswer).trim() &&
          String(rawUserAnswer).trim() !== "0"
        )
      );

      const evaluated = Boolean(
        correctAnswerKey && userAnswerKey
      );

      const selectedOption = options.find(
        (option) => option.key === userAnswerKey
      );

      const correctOption = options.find(
        (option) => option.key === correctAnswerKey
      );

      const resolvedImagePath = first(
        question?.imagePath,
        question?.image_path,
        question?.img_path,
        imagePath,
        ""
      );

      return {
        id: questionId(question) || index + 1,
        index,
        number: index + 1,

        question,
        questionText: getQuestionText(
          question ?? {}
        ),
        questionHtml: getQuestionHtml(
          question ?? {}
        ),

        imagePath: resolvedImagePath,
        image_path: resolvedImagePath,

        questionImage: first(
          question?.question_image,
          question?.questionImage,
          question?.image,
          question?.image_url,
          question?.attached,
          question?.attachment,
          ""
        ),

        options,

        rawUserAnswer,
        rawCorrectAnswer:
          rawCorrectAnswer || questionCorrect || "",

        userAnswerKey,
        correctAnswerKey,

        attempted,
        evaluated,

        isCorrect:
          evaluated &&
          userAnswerKey === correctAnswerKey,

        userAnswerDisplay: attempted
          ? displayAnswer(
            userAnswerKey,
            rawUserAnswer,
            options
          )
          : "Not Answered",

        correctAnswerDisplay: correctAnswerKey
          ? displayAnswer(
            correctAnswerKey,
            rawCorrectAnswer,
            options
          )
          : "Not Available",

        userAnswerHtml: selectedOption?.html || "",
        correctAnswerHtml: correctOption?.html || "",

        userAnswerImage: selectedOption?.image || "",
        correctAnswerImage: correctOption?.image || "",

        matchedQuestion: Boolean(question),

        matchMethod: canMatchIds
          ? "question-id"
          : canMatchPosition
            ? "position"
            : "unverified",
      };
    }
  );
}
