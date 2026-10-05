/* =========================================================
   NUMBER
========================================================= */

export function toResultNumber(
  value,
  fallback = 0
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return fallback;
  }

  const parsed =
    Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
}

/* =========================================================
   ROUND
========================================================= */

export function roundResultNumber(
  value
) {
  const number =
    toResultNumber(
      value,
      0
    );

  return (
    Math.round(
      number * 100
    ) / 100
  );
}

/* =========================================================
   PARSE ANSWERS
========================================================= */

export function parseSavedAnswers(
  value
) {
  if (
    Array.isArray(value)
  ) {
    return value;
  }

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return [];
  }

  const text =
    String(value)
      .trim();

  if (!text) {
    return [];
  }

  try {
    const parsed =
      JSON.parse(text);

    if (
      Array.isArray(
        parsed
      )
    ) {
      return parsed;
    }

    if (
      typeof parsed ===
      "string"
    ) {
      try {
        const secondParsed =
          JSON.parse(
            parsed
          );

        if (
          Array.isArray(
            secondParsed
          )
        ) {
          return secondParsed;
        }
      } catch {
        // Continue.
      }
    }
  } catch {
    // Continue.
  }

  return text
    .replace(
      /^\[/,
      ""
    )
    .replace(
      /\]$/,
      ""
    )
    .split(",")
    .map(
      (item) =>
        String(item)
          .trim()
          .replace(
            /^["']|["']$/g,
            ""
          )
    );
}

/* =========================================================
   NORMALIZE ANSWER
========================================================= */

export function normalizeSavedAnswer(
  value
) {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  const answer =
    String(value)
      .trim();

  if (
    !answer ||
    answer === "0" ||
    answer.toLowerCase() ===
      "null" ||
    answer.toLowerCase() ===
      "undefined"
  ) {
    return "";
  }

  const upper =
    answer.toUpperCase();

  if (
    /^[A-Z]$/.test(
      upper
    )
  ) {
    return upper;
  }

  const optionMatch =
    upper.match(
      /^([A-Z])(?:[\s.\):\-]|$)/
    );

  if (
    optionMatch?.[1]
  ) {
    return optionMatch[1];
  }

  return upper;
}

/* =========================================================
   ANSWERED
========================================================= */

export function isAnswered(
  value
) {
  return Boolean(
    normalizeSavedAnswer(
      value
    )
  );
}

/* =========================================================
   CORRECT
========================================================= */

export function isCorrectAnswer(
  userAnswer,
  correctAnswer
) {
  const user =
    normalizeSavedAnswer(
      userAnswer
    );

  const correct =
    normalizeSavedAnswer(
      correctAnswer
    );

  if (
    !user ||
    !correct
  ) {
    return false;
  }

  return (
    user === correct
  );
}

/* =========================================================
   COUNTS
========================================================= */

export function calculateExamCounts(
  result = {}
) {
  const correctAnswers =
    parseSavedAnswers(
      result?.answer_array
    );

  const userAnswers =
    parseSavedAnswers(
      result?.user_answers
    );

  const canCalculate =
    correctAnswers.length >
      0 &&
    userAnswers.length >
      0;

  let attempted = 0;
  let correct = 0;
  let wrong = 0;

  if (canCalculate) {
    const totalItems =
      Math.max(
        correctAnswers.length,
        userAnswers.length
      );

    for (
      let index = 0;
      index < totalItems;
      index += 1
    ) {
      const userAnswer =
        normalizeSavedAnswer(
          userAnswers[index]
        );

      if (!userAnswer) {
        continue;
      }

      attempted += 1;

      const correctAnswer =
        normalizeSavedAnswer(
          correctAnswers[index]
        );

      if (
        correctAnswer &&
        userAnswer ===
          correctAnswer
      ) {
        correct += 1;
      } else {
        wrong += 1;
      }
    }
  } else {
    attempted =
      toResultNumber(
        result?.total_attempted,
        0
      );

    correct =
      toResultNumber(
        result?.total_correct,
        0
      );

    wrong =
      toResultNumber(
        result?.total_wrong,
        Math.max(
          0,
          attempted - correct
        )
      );
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
   SCORE

   Android calculation:

   wrongMark = wrong * 0.333
   score = correct - wrongMark
========================================================= */

export function calculateExamScore(
  result = {},
  options = {}
) {
  const counts =
    calculateExamCounts(
      result
    );

  const {
    attempted,
    correct,
    wrong,
    correctAnswers,
    userAnswers,
    canCalculate,
  } = counts;

  const markPerCorrect =
    toResultNumber(
      options?.markPerCorrect ??
        result?.mark_per_question ??
        1,
      1
    );

  const negativeMarkPerWrong =
    toResultNumber(
      options?.negativeMarkPerWrong ??
        result?.negative_mark_per_wrong ??
        0.333,
      0.333
    );

  const correctMark =
    roundResultNumber(
      correct *
        markPerCorrect
    );

  const minusMark =
    roundResultNumber(
      wrong *
        negativeMarkPerWrong
    );

  const score =
    roundResultNumber(
      correctMark -
        minusMark
    );

  const totalQuestions =
    toResultNumber(
      result?.total_questions,
      Math.max(
        correctAnswers.length,
        userAnswers.length
      )
    );

  const totalMark =
    toResultNumber(
      result?.total_mark,
      totalQuestions *
        markPerCorrect
    );

  const percentage =
    totalMark > 0
      ? roundResultNumber(
          (score /
            totalMark) *
            100
        )
      : 0;

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
  };
}

/* =========================================================
   RESULT PAYLOAD VALUES
========================================================= */

export function buildCalculatedExamResult(
  result = {},
  options = {}
) {
  const calculated =
    calculateExamScore(
      result,
      options
    );

  return {
    ...calculated,

    total_attempted:
      calculated.attempted,

    total_correct:
      calculated.correct,

    total_wrong:
      calculated.wrong,

    user_score:
      calculated.score,

    minus_mark:
      calculated.minusMark,

    total_mark:
      calculated.totalMark,

    total_questions:
      calculated.totalQuestions,
  };
}