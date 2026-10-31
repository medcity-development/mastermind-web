
import {
  isValidOptionAnswer,
} from "./examUtils";

export const QUESTIONS_PER_PAGE = 10;

export function positiveId(value) {
  const number = Number(value);

  return Number.isSafeInteger(number) &&
    number > 0
    ? number
    : null;
}

export function isFailed(value) {
  return [
    false,
    0,
    "0",
    "false",
    "error",
    "failed",
  ].includes(value);
}

export function getQuestionIndex(
  questions,
  questionId
) {
  if (questionId == null) {
    return -1;
  }

  return questions.findIndex(
    (question) =>
      String(question.id) ===
      String(questionId)
  );
}

export function getLastAnsweredIndex(
  questions,
  answers
) {
  return questions.reduce(
    (last, question, index) => {
      const answer =
        answers?.[question.id];

      return isValidOptionAnswer(
        question,
        answer
      )
        ? index
        : last;
    },
    -1
  );
}

export function clampPage(
  page,
  totalQuestions
) {
  const maxPage = Math.max(
    1,
    Math.ceil(
      totalQuestions /
        QUESTIONS_PER_PAGE
    )
  );

  const value = Number(page);

  return Math.min(
    maxPage,
    Math.max(
      1,
      Number.isSafeInteger(value)
        ? value
        : 1
    )
  );
}

export async function postAttempt(
  endpoint,
  payload
) {
  const response = await fetch(
    endpoint,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(
        payload
      ),
    }
  );

  let result;

  try {
    result =
      await response.json();
  } catch {
    throw new Error(
      "Exam API returned an invalid response."
    );
  }

  if (
    !response.ok ||
    !result ||
    isFailed(result.status)
  ) {
    const error = new Error(
      result?.message ||
      result?.msg ||
      "Unable to save this exam."
    );

    error.status =
      response.status;

    throw error;
  }

  return result;
}
