import {
  parseSavedAnswers,
} from "@/lib/examResultUtils";

/* =========================================================
   BASIC TEXT
========================================================= */

function cleanText(
  value
) {
  return String(
    value ?? ""
  ).trim();
}

/* =========================================================
   NORMALIZE TEXT FOR COMPARISON

   Used only for comparing an answer with an option.

   Example:

   " A. Kerala "
   "Kerala"

   can be compared safely.
========================================================= */

function normalizeText(
  value
) {
  return cleanText(
    value
  )
    .replace(
      /<[^>]*>/g,
      ""
    )
    .replace(
      /^[A-Da-d]\s*[.)\-:]\s*/,
      ""
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim()
    .toLowerCase();
}

/* =========================================================
   NUMBER
========================================================= */

function toNumber(
  value,
  fallback = 0
) {
  const number =
    Number(value);

  return Number.isFinite(
    number
  )
    ? number
    : fallback;
}

/* =========================================================
   EMPTY ANSWER

   Backend uses 0 for unanswered.

   IMPORTANT:

   Numeric answer text such as:

   10
   48
   600
   2775

   are VALID answers.

   Only exactly 0 is treated as empty.
========================================================= */

export function isEmptyAnswer(
  value
) {
  if (
    value === undefined ||
    value === null
  ) {
    return true;
  }

  const text =
    cleanText(
      value
    );

  if (!text) {
    return true;
  }

  const normalized =
    text.toLowerCase();

  if (
    normalized === "null" ||
    normalized === "undefined" ||
    normalized === "nan"
  ) {
    return true;
  }

  /*
   * Backend unanswered value.
   */

  if (
    text === "0" ||
    text === "0.0"
  ) {
    return true;
  }

  return false;
}

/* =========================================================
   SAVED RESULT
========================================================= */

export function getResultItem(
  response
) {
  if (
    Array.isArray(
      response?.details
    )
  ) {
    return (
      response.details[0] ??
      null
    );
  }

  if (
    response?.details &&
    typeof response.details ===
    "object"
  ) {
    return response.details;
  }

  if (
    Array.isArray(
      response?.data
    )
  ) {
    return (
      response.data[0] ??
      null
    );
  }

  if (
    response?.data &&
    typeof response.data ===
    "object"
  ) {
    return response.data;
  }

  return null;
}

/* =========================================================
   QUESTION TEXT
========================================================= */

export function getQuestionText(
  question = {}
) {
  const candidates = [
    question?.question,
    question?.question_text,
    question?.questionText,

    question?.ques,
    question?.qtn,

    question?.title,
    question?.name,
  ];

  for (
    const candidate of
    candidates
  ) {
    const text =
      cleanText(
        candidate
      );

    if (text) {
      return text;
    }
  }

  return "Question";
}

/* =========================================================
   OPTION KEY FROM INDEX
========================================================= */

function indexToKey(
  index
) {
  const keys = [
    "A",
    "B",
    "C",
    "D",
  ];

  return (
    keys[index] ??
    ""
  );
}

/* =========================================================
   ANSWER KEY

   Supports:

   A
   B
   C
   D

   A. Kerala
   A) Kerala
   A: Kerala
   A - Kerala
========================================================= */

export function getAnswerKey(
  value
) {
  if (
    isEmptyAnswer(
      value
    )
  ) {
    return "";
  }

  const text =
    cleanText(
      value
    );

  /*
   * Exact option key.
   */

  if (
    /^[A-D]$/i.test(
      text
    )
  ) {
    return text.toUpperCase();
  }

  /*
   * A. Kerala
   * A) Kerala
   * A: Kerala
   * A - Kerala
   */

  const prefixed =
    text.match(
      /^([A-D])\s*(?:[.)\-:]|\s)/i
    );

  if (
    prefixed?.[1]
  ) {
    return prefixed[1]
      .toUpperCase();
  }

  return "";
}

/* =========================================================
   REMOVE OPTION PREFIX
========================================================= */

function removeAnswerPrefix(
  value,
  key = ""
) {
  const text =
    cleanText(
      value
    );

  if (!text) {
    return "";
  }

  const safeKey =
    cleanText(
      key
    ).toUpperCase();

  if (!safeKey) {
    return text;
  }

  return text
    .replace(
      new RegExp(
        `^${safeKey}\\s*(?:[.)\\-:]\\s*)?`,
        "i"
      ),
      ""
    )
    .trim();
}

/* =========================================================
   EXTRACT OPTION TEXT

   Supports:

   "Kerala"

   {
     text: "Kerala"
   }

   {
     option: "Kerala"
   }

   etc.
========================================================= */

function getOptionObjectText(
  option
) {
  if (
    option === undefined ||
    option === null
  ) {
    return "";
  }

  if (
    typeof option ===
    "string" ||
    typeof option ===
    "number"
  ) {
    return cleanText(
      option
    );
  }

  if (
    typeof option !==
    "object"
  ) {
    return "";
  }

  const candidates = [
    option?.text,
    option?.value,

    option?.option,
    option?.option_text,
    option?.optionText,

    option?.answer,
    option?.answer_text,
    option?.answerText,

    option?.title,
    option?.name,
  ];

  for (
    const candidate of
    candidates
  ) {
    const text =
      cleanText(
        candidate
      );

    if (text) {
      return text;
    }
  }

  return "";
}

/* =========================================================
   OPTION KEY FROM OBJECT
========================================================= */

function getOptionObjectKey(
  option,
  index
) {
  if (
    option &&
    typeof option ===
    "object"
  ) {
    const candidates = [
      option?.key,
      option?.code,
      option?.option_key,
      option?.optionKey,
      option?.answer_key,
      option?.answerKey,
      option?.label,
    ];

    for (
      const candidate of
      candidates
    ) {
      const key =
        getAnswerKey(
          candidate
        );

      if (key) {
        return key;
      }
    }
  }

  return indexToKey(
    index
  );
}

/* =========================================================
   TOP LEVEL FIELD -> OPTION KEY

   Supports:

   option_a
   optionA
   option1

   answer_a
   answerA
   answer1

   ans_a
   ansA
   ans1

   choice_a
   choiceA
   choice1

   A
   B
   C
   D
========================================================= */

function getFieldOptionKey(
  fieldName
) {
  const original =
    cleanText(
      fieldName
    );

  if (!original) {
    return "";
  }

  const field =
    original.toLowerCase();

  /*
   * Direct:
   *
   * a
   * b
   * c
   * d
   */

  if (
    /^[a-d]$/.test(
      field
    )
  ) {
    return field.toUpperCase();
  }

  /*
   * option_a
   * optionA
   * answer_a
   * choiceD
   */

  const letterMatch =
    field.match(
      /(?:option|answer|ans|choice|alternative|choicevalue|optionvalue|answertext|optiontext)[_-]?([a-d])$/
    );

  if (
    letterMatch?.[1]
  ) {
    return letterMatch[1]
      .toUpperCase();
  }

  /*
   * option1
   * answer_2
   * ans3
   * choice_4
   */

  const numberMatch =
    field.match(
      /(?:option|answer|ans|choice|alternative|choicevalue|optionvalue|answertext|optiontext)[_-]?([1-4])$/
    );

  if (
    numberMatch?.[1]
  ) {
    return indexToKey(
      Number(
        numberMatch[1]
      ) - 1
    );
  }

  return "";
}

/* =========================================================
   ADD OPTION
========================================================= */

function addQuestionOption(
  optionMap,
  key,
  rawValue
) {
  const safeKey =
    cleanText(
      key
    ).toUpperCase();

  if (
    !/^[A-D]$/.test(
      safeKey
    )
  ) {
    return;
  }

  let text =
    getOptionObjectText(
      rawValue
    );

  if (!text) {
    return;
  }

  /*
   * Avoid:
   *
   * A. A. Kerala
   */

  text =
    removeAnswerPrefix(
      text,
      safeKey
    );

  if (!text) {
    return;
  }

  if (
    !optionMap.has(
      safeKey
    )
  ) {
    optionMap.set(
      safeKey,
      text
    );
  }
}

/* =========================================================
   READ OPTION COLLECTION

   Supports:

   options: [
     "Kerala",
     "Tamil Nadu",
     ...
   ]

   options: [
     {
       key: "A",
       text: "Kerala"
     }
   ]

   options: {
     A: "Kerala",
     B: "Tamil Nadu"
   }

   options: {
     option1: "Kerala",
     option2: "Tamil Nadu"
   }
========================================================= */

function readOptionCollection(
  optionMap,
  source
) {
  if (!source) {
    return;
  }

  /* =======================================================
     ARRAY
  ======================================================= */

  if (
    Array.isArray(
      source
    )
  ) {
    source.forEach(
      (
        option,
        index
      ) => {
        const key =
          getOptionObjectKey(
            option,
            index
          );

        addQuestionOption(
          optionMap,
          key,
          option
        );
      }
    );

    return;
  }

  /* =======================================================
     OBJECT
  ======================================================= */

  if (
    typeof source ===
    "object"
  ) {
    Object.entries(
      source
    ).forEach(
      ([
        fieldName,
        value,
      ]) => {
        let key =
          getAnswerKey(
            fieldName
          );

        if (!key) {
          key =
            getFieldOptionKey(
              fieldName
            );
        }

        /*
         * Object numeric keys:
         *
         * {
         *   1: "Kerala",
         *   2: "Tamil Nadu"
         * }
         */

        if (
          !key &&
          /^[1-4]$/.test(
            String(
              fieldName
            )
          )
        ) {
          key =
            indexToKey(
              Number(
                fieldName
              ) - 1
            );
        }

        addQuestionOption(
          optionMap,
          key,
          value
        );
      }
    );
  }
}

/* =========================================================
   GET QUESTION OPTIONS

   This is the important function for:

   600 -> A. 600
   48  -> C. 48

   It discovers A/B/C/D from the question API dynamically.
========================================================= */

export function getQuestionOptions(
  question = {}
) {
  if (
    !question ||
    typeof question !==
    "object"
  ) {
    return [];
  }

  const optionMap =
    new Map();

  /* =======================================================
     1. SCAN EVERY TOP LEVEL FIELD

     Dynamic.

     We are not depending on one single
     backend naming style.
  ======================================================= */

  Object.entries(
    question
  ).forEach(
    ([
      fieldName,
      fieldValue,
    ]) => {
      const key =
        getFieldOptionKey(
          fieldName
        );

      if (!key) {
        return;
      }

      addQuestionOption(
        optionMap,
        key,
        fieldValue
      );
    }
  );

  /* =======================================================
     2. COMMON DIRECT FIELDS

     These are field aliases, not hardcoded answers.
  ======================================================= */

  const directGroups = [
    [
      question?.option_a,
      question?.option_b,
      question?.option_c,
      question?.option_d,
    ],

    [
      question?.optionA,
      question?.optionB,
      question?.optionC,
      question?.optionD,
    ],

    [
      question?.option1,
      question?.option2,
      question?.option3,
      question?.option4,
    ],

    [
      question?.answer_a,
      question?.answer_b,
      question?.answer_c,
      question?.answer_d,
    ],

    [
      question?.answerA,
      question?.answerB,
      question?.answerC,
      question?.answerD,
    ],

    [
      question?.answer1,
      question?.answer2,
      question?.answer3,
      question?.answer4,
    ],

    [
      question?.ans_a,
      question?.ans_b,
      question?.ans_c,
      question?.ans_d,
    ],

    [
      question?.ansA,
      question?.ansB,
      question?.ansC,
      question?.ansD,
    ],

    [
      question?.ans1,
      question?.ans2,
      question?.ans3,
      question?.ans4,
    ],

    [
      question?.choice1,
      question?.choice2,
      question?.choice3,
      question?.choice4,
    ],
  ];

  directGroups.forEach(
    (group) => {
      group.forEach(
        (
          value,
          index
        ) => {
          if (
            value ===
            undefined ||
            value ===
            null ||
            cleanText(
              value
            ) === ""
          ) {
            return;
          }

          addQuestionOption(
            optionMap,
            indexToKey(
              index
            ),
            value
          );
        }
      );
    }
  );

  /* =======================================================
     3. NESTED COLLECTIONS
  ======================================================= */

  const collections = [
    question?.options,
    question?.option,

    question?.choices,
    question?.choice,

    question?.answers,

    question?.alternatives,

    question?.answer_options,
    question?.answerOptions,

    question?.option_list,
    question?.optionList,

    question?.choices_list,
    question?.choicesList,
  ];

  collections.forEach(
    (collection) => {
      readOptionCollection(
        optionMap,
        collection
      );
    }
  );

  /* =======================================================
     FINAL ORDER

     Always:

     A
     B
     C
     D
  ======================================================= */

  return [
    "A",
    "B",
    "C",
    "D",
  ]
    .map(
      (key) => ({
        key,

        text:
          optionMap.get(
            key
          ) ?? "",
      })
    )
    .filter(
      (option) =>
        Boolean(
          option.text
        )
    );
}

/* =========================================================
   GET QUESTION OPTION TEXT
========================================================= */

export function getQuestionOptionText(
  question,
  optionKey
) {
  const key =
    cleanText(
      optionKey
    ).toUpperCase();

  if (
    !/^[A-D]$/.test(
      key
    )
  ) {
    return "";
  }

  const options =
    getQuestionOptions(
      question
    );

  const match =
    options.find(
      (option) =>
        option.key ===
        key
    );

  return (
    match?.text ??
    ""
  );
}

/* =========================================================
   FIND OPTION KEY BY ANSWER TEXT

   Example:

   API question options:

   A = 12 സെക്കന്റ്
   B = 15 സെക്കന്റ്
   C = 18 സെക്കന്റ്
   D = 20 സെക്കന്റ്

   Saved user answer:

   18 സെക്കന്റ്

   Result:

   C
========================================================= */

function findOptionKeyByText(
  question,
  rawAnswer
) {
  if (
    isEmptyAnswer(
      rawAnswer
    )
  ) {
    return "";
  }

  const answerText =
    normalizeText(
      rawAnswer
    );

  if (!answerText) {
    return "";
  }

  const options =
    getQuestionOptions(
      question
    );

  /* =======================================================
     EXACT MATCH
  ======================================================= */

  const exact =
    options.find(
      (option) =>
        normalizeText(
          option.text
        ) ===
        answerText
    );

  if (exact) {
    return exact.key;
  }

  /* =======================================================
     SAVED VALUE MAY BE:

     A. Kerala

     while option text is:

     Kerala
  ======================================================= */

  for (
    const option of
    options
  ) {
    const withoutPrefix =
      normalizeText(
        removeAnswerPrefix(
          rawAnswer,
          option.key
        )
      );

    const optionText =
      normalizeText(
        option.text
      );

    if (
      withoutPrefix &&
      optionText &&
      withoutPrefix ===
      optionText
    ) {
      return option.key;
    }
  }

  return "";
}

/* =========================================================
   RESOLVE ANSWER KEY

   Priority:

   1. Saved value itself contains A/B/C/D
   2. Match saved answer text against question options
========================================================= */

function resolveAnswerKey(
  question,
  rawAnswer
) {
  if (
    isEmptyAnswer(
      rawAnswer
    )
  ) {
    return "";
  }

  const direct =
    getAnswerKey(
      rawAnswer
    );

  if (direct) {
    return direct;
  }

  return findOptionKeyByText(
    question,
    rawAnswer
  );
}

/* =========================================================
   GET SAVED ANSWER TEXT
========================================================= */

function getSavedAnswerText(
  rawAnswer,
  key = ""
) {
  if (
    isEmptyAnswer(
      rawAnswer
    )
  ) {
    return "";
  }

  const raw =
    cleanText(
      rawAnswer
    );

  /*
   * Backend stored only:
   *
   * A
   * B
   * C
   * D
   *
   * So no answer text exists here.
   */

  if (
    /^[A-D]$/i.test(
      raw
    )
  ) {
    return "";
  }

  if (key) {
    return removeAnswerPrefix(
      raw,
      key
    );
  }

  return raw;
}

/* =========================================================
   BUILD DISPLAY ANSWER

   Examples:

   rawAnswer = "A"
   option A  = "Kerala"

   => A. Kerala


   rawAnswer = "600"
   option B  = "600"

   => B. 600


   rawAnswer = "18 സെക്കന്റ്"
   option C  = "18 സെക്കന്റ്"

   => C. 18 സെക്കന്റ്
========================================================= */

function buildDisplayAnswer({
  question,
  rawAnswer,
}) {
  /* =======================================================
     EMPTY
  ======================================================= */

  if (
    isEmptyAnswer(
      rawAnswer
    )
  ) {
    return {
      key: "",
      text: "",

      display:
        "Not Answered",

      attempted:
        false,
    };
  }

  /* =======================================================
     FIND A/B/C/D
  ======================================================= */

  const key =
    resolveAnswerKey(
      question,
      rawAnswer
    );

  /* =======================================================
     OPTION TEXT
  ======================================================= */

  const optionText =
    key
      ? getQuestionOptionText(
        question,
        key
      )
      : "";

  /* =======================================================
     SAVED TEXT
  ======================================================= */

  const savedText =
    getSavedAnswerText(
      rawAnswer,
      key
    );

  /* =======================================================
     BEST TEXT

     Prefer question API text.

     Example:

     saved:
     A

     question:
     A = Kerala

     => Kerala
  ======================================================= */

  const text =
    optionText ||
    savedText;

  /* =======================================================
     DISPLAY
  ======================================================= */

  let display =
    "Not Answered";

  if (
    key &&
    text
  ) {
    display =
      `${key}. ${text}`;
  } else if (key) {
    display =
      key;
  } else if (text) {
    /*
     * This fallback means we have answer text,
     * but question API did not contain enough
     * option information to discover A/B/C/D.
     */

    display =
      text;
  }

  return {
    key,
    text,
    display,

    attempted:
      true,
  };
}

/* =========================================================
   COMPARE ANSWERS
========================================================= */

function answersMatch(
  userAnswer,
  correctAnswer
) {
  if (
    !userAnswer?.attempted
  ) {
    return false;
  }

  /* =======================================================
     BEST MATCH

     Compare A/B/C/D.
  ======================================================= */

  if (
    userAnswer?.key &&
    correctAnswer?.key
  ) {
    return (
      userAnswer.key ===
      correctAnswer.key
    );
  }

  /* =======================================================
     FALLBACK

     Compare actual text.
  ======================================================= */

  const userText =
    normalizeText(
      userAnswer?.text
    );

  const correctText =
    normalizeText(
      correctAnswer?.text
    );

  return Boolean(
    userText &&
    correctText &&
    userText ===
    correctText
  );
}

/* =========================================================
   BUILD QUESTION ROWS
========================================================= */

export function buildQuestionRows({
  result,
  questions = [],
}) {
  if (!result) {
    return [];
  }

  const correctAnswers =
    parseSavedAnswers(
      result?.answer_array
    );

  const userAnswers =
    parseSavedAnswers(
      result?.user_answers
    );

  const rowCount =
    Math.max(
      questions.length,
      correctAnswers.length,
      userAnswers.length
    );

  return Array.from(
    {
      length:
        rowCount,
    },
    (
      _,
      index
    ) => {
      const question =
        questions[index] ??
        {};

      const rawCorrectAnswer =
        correctAnswers[
        index
        ] ?? "";

      const rawUserAnswer =
        userAnswers[
        index
        ] ?? "";

      /* ===================================================
         USER ANSWER
      =================================================== */

      const userAnswer =
        buildDisplayAnswer({
          question,

          rawAnswer:
            rawUserAnswer,
        });

      /* ===================================================
         CORRECT ANSWER
      =================================================== */

      const correctAnswer =
        buildDisplayAnswer({
          question,

          rawAnswer:
            rawCorrectAnswer,
        });

      /* ===================================================
         STATUS
      =================================================== */

      const attempted =
        userAnswer.attempted;

      const isCorrect =
        attempted &&
        answersMatch(
          userAnswer,
          correctAnswer
        );

      const isWrong =
        attempted &&
        !isCorrect;

      /* ===================================================
         ROW
      =================================================== */

      return {
        id:
          question?.id ??
          question?.question_id ??
          question?.qid ??
          index + 1,

        index,

        number:
          index + 1,

        question,

        questionText:
          getQuestionText(
            question
          ),

        /* ===============================================
           RAW
        =============================================== */

        rawUserAnswer,

        rawCorrectAnswer,

        /* ===============================================
           USER ANSWER
        =============================================== */

        userAnswer:
          userAnswer.key,

        userAnswerKey:
          userAnswer.key,

        userAnswerText:
          userAnswer.text,

        userAnswerDisplay:
          userAnswer.display,

        /* ===============================================
           CORRECT ANSWER
        =============================================== */

        correctAnswer:
          correctAnswer.key,

        correctAnswerKey:
          correctAnswer.key,

        correctAnswerText:
          correctAnswer.text,

        correctAnswerDisplay:
          correctAnswer.display,

        /* ===============================================
           STATUS
        =============================================== */

        attempted,

        answered:
          attempted,

        skipped:
          !attempted,

        isCorrect,

        isWrong,
      };
    }
  );
}

/* =========================================================
   ANALYSIS SUMMARY
========================================================= */

export function calculateAnalysisSummary({
  rows = [],
  totalQuestions = 0,
  totalMark = 0,
} = {}) {
  let attempted = 0;
  let correct = 0;
  let wrong = 0;

  rows.forEach(
    (row) => {
      if (
        !row?.attempted
      ) {
        return;
      }

      attempted += 1;

      if (
        row?.isCorrect
      ) {
        correct += 1;
      } else {
        wrong += 1;
      }
    }
  );

  const safeTotalQuestions =
    Math.max(
      toNumber(
        totalQuestions
      ),
      rows.length
    );

  const unanswered =
    Math.max(
      0,
      safeTotalQuestions -
      attempted
    );

  const safeTotalMark =
    toNumber(
      totalMark,
      safeTotalQuestions
    );

  return {
    attempted,
    correct,
    wrong,
    unanswered,

    totalQuestions:
      safeTotalQuestions,

    totalMark:
      safeTotalMark,
  };
}