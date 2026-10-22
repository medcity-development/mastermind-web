// src/lib/examAttemptData.js

/* =========================================================
   SCORING

   SAME AS ANDROID APP

   Correct = +1
   Wrong   = -0.333
========================================================= */

const CORRECT_MARK = 1;
const WRONG_MARK = 0.333;

/* =========================================================
   NUMBER
========================================================= */

function numeric(
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

  const number =
    Number(value);

  return Number.isFinite(
    number
  )
    ? number
    : fallback;
}

export function secondsToMilliseconds(seconds) {
  return Math.max(
    0,
    Math.round(numeric(seconds) * 1000)
  );
}

export function timestampToMilliseconds(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const numericTimestamp = Number(value);
  if (Number.isFinite(numericTimestamp) && numericTimestamp > 0) {
    return Math.trunc(
      numericTimestamp < 1_000_000_000_000
        ? numericTimestamp * 1000
        : numericTimestamp
    );
  }

  const timestamp = String(value).trim();
  const localDateTime = timestamp.match(
    /^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?))?$/
  );
  const normalizedTimestamp = localDateTime
    ? `${localDateTime[1]}T${localDateTime[2] || "00:00:00"}+05:30`
    : timestamp;
  const parsedTimestamp = Date.parse(normalizedTimestamp);
  return Number.isFinite(parsedTimestamp) && parsedTimestamp > 0
    ? parsedTimestamp
    : null;
}

export function millisecondsToSeconds(milliseconds) {
  return Math.max(
    0,
    Math.ceil(numeric(milliseconds) / 1000)
  );
}

export function savedPausedTimeToSeconds(value, durationSeconds) {
  const savedTime = Math.max(0, numeric(value));
  const duration = Math.max(0, numeric(durationSeconds));

  return savedTime <= duration
    ? Math.ceil(savedTime)
    : millisecondsToSeconds(savedTime);
}

/* =========================================================
   ROUND TO 2 DECIMALS
========================================================= */

function roundNumber(
  value
) {
  const number =
    numeric(
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

   Supports:

   ["A","B","C",0]

   and

   [A, B, C, 0]
========================================================= */

export function parseAnswers(
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
    String(value).trim();

  if (!text) {
    return [];
  }

  /* =======================================================
     NORMAL JSON
  ======================================================= */

  try {
    const parsed =
      JSON.parse(text);

    if (
      Array.isArray(parsed)
    ) {
      return parsed;
    }

    /*
     * Sometimes JSON is
     * double encoded.
     */
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

  /* =======================================================
     LEGACY FORMAT

     [A, B, C, 0]
  ======================================================= */

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
    .map((item) =>
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

   Supports:

   A
   a
   A.
   A)
   A. Kerala
   A) Kerala
========================================================= */

export function normalizeExamAnswer(
  value
) {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  const raw =
    String(value)
      .trim();

  if (!raw) {
    return "";
  }

  const upper =
    raw.toUpperCase();

  if (
    upper === "0" ||
    upper === "NULL" ||
    upper === "UNDEFINED" ||
    upper === "N/A"
  ) {
    return "";
  }

  /*
   * Direct option:
   *
   * A
   * B
   * C
   * D
   */
  if (
    /^[A-Z]$/.test(
      upper
    )
  ) {
    return upper;
  }

  /*
   * A. option
   * A) option
   * A: option
   * A - option
   */
  const optionMatch =
    upper.match(
      /^([A-Z])(?:[\s.):\-]|$)/
    );

  if (
    optionMatch?.[1]
  ) {
    return optionMatch[1];
  }

  return upper;
}

function normalizeStoredAnswers(
  answers
) {
  return answers.map((answer) => {
    const option =
      normalizeExamAnswer(answer);

    return /^[A-D]$/.test(option)
      ? option
      : 0;
  });
}

/* =========================================================
   GET ATTEMPT ID
========================================================= */

export function getAttemptId(
  result
) {
  if (
    !result ||
    typeof result !==
    "object"
  ) {
    return null;
  }

  const possibleKeys = [
    "pauseid",
    "pause_id",
    "attempt_id",
    "attemptId",
    "id",
    "last_id",
    "lastid",
    "insert_id",
  ];

  for (
    const key of
    possibleKeys
  ) {
    const value =
      result?.[key];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !==
      "" &&
      String(value) !==
      "0"
    ) {
      return value;
    }
  }

  const nestedValues = [
    result?.data,
    result?.details,
    result?.result,
  ];

  for (
    const nestedValue of
    nestedValues
  ) {
    if (!nestedValue) {
      continue;
    }

    if (
      Array.isArray(
        nestedValue
      )
    ) {
      for (
        const item of
        nestedValue
      ) {
        const id =
          getAttemptId(
            item
          );

        if (
          id !== null
        ) {
          return id;
        }
      }

      continue;
    }

    if (
      typeof nestedValue ===
      "object"
    ) {
      const id =
        getAttemptId(
          nestedValue
        );

      if (
        id !== null
      ) {
        return id;
      }
    }
  }

  return null;
}

/* =========================================================
   GET RESULT ARRAY
========================================================= */

export function getResultArray(
  result
) {
  if (
    Array.isArray(result)
  ) {
    return result;
  }

  if (
    !result ||
    typeof result !==
    "object"
  ) {
    return [];
  }

  const keys = [
    "details",
    "data",
    "result",
    "results",
    "exams",
    "exam_list",
  ];

  for (
    const key of keys
  ) {
    const value =
      result?.[key];

    if (
      Array.isArray(value) &&
      value.length
    ) {
      return value;
    }

    if (
      value &&
      typeof value ===
      "object" &&
      !Array.isArray(value)
    ) {
      const nested =
        getResultArray(
          value
        );

      if (
        nested.length
      ) {
        return nested;
      }

      if (
        getAttemptId(
          value
        ) !== null
      ) {
        return [
          value,
        ];
      }
    }
  }

  return [];
}

/* =========================================================
   FAILED RESPONSE
========================================================= */

export function isFailedResponse(
  result
) {
  if (!result) {
    return true;
  }

  const status =
    result?.status;

  return [
    false,
    0,
    "0",
    "false",
    "error",
    "failed",
  ].includes(
    status
  );
}

/* =========================================================
   NORMALIZE EXAM STATUS
========================================================= */

function normalizeExamStatus(
  value
) {
  const status =
    String(
      value ?? ""
    )
      .trim()
      .toLowerCase();

  if (
    status ===
    "finish" ||
    status ===
    "finished" ||
    status ===
    "complete" ||
    status ===
    "completed"
  ) {
    return "finish";
  }

  if (
    status ===
    "pause" ||
    status ===
    "paused"
  ) {
    return "pause";
  }

  return (
    status ||
    "pause"
  );
}

/* =========================================================
   CALCULATE EXAM RESULT

   EXACT ANDROID STYLE:

   totalWrong =
       wrong * 0.333

   totalWrongMark =
       Math.round(
         totalWrong * 100
       ) / 100

   score =
       correct -
       totalWrongMark
========================================================= */

export function calculateExamResult({
  answerArray = [],
  userAnswers = [],
  markPerCorrect = CORRECT_MARK,
  negativeMarkPerWrong = WRONG_MARK,
} = {}) {
  const correctAnswers =
    parseAnswers(
      answerArray
    );

  const studentAnswers =
    parseAnswers(
      userAnswers
    );

  const length =
    Math.max(
      correctAnswers.length,
      studentAnswers.length
    );

  let attempted = 0;
  let correct = 0;
  let wrong = 0;

  for (
    let index = 0;
    index < length;
    index += 1
  ) {
    const userAnswer =
      normalizeExamAnswer(
        studentAnswers[
        index
        ]
      );

    if (!userAnswer) {
      continue;
    }

    attempted += 1;

    const correctAnswer =
      normalizeExamAnswer(
        correctAnswers[
        index
        ]
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

  const skipped =
    Math.max(
      0,
      length -
      attempted
    );

  const positiveMark =
    correct *
    numeric(
      markPerCorrect,
      CORRECT_MARK
    );

  /*
   * Same as Android:
   *
   * Math.round(
   *   wrong * 0.333 * 100
   * ) / 100
   */
  const negativeMark =
    Math.round(
      wrong *
    numeric(
      negativeMarkPerWrong,
      WRONG_MARK
    ) *
    100
  ) / 100;

  const score =
    Math.round(
      (
        positiveMark -
        negativeMark
      ) *
      100
    ) / 100;

  return {
    attempted,
    correct,
    wrong,
    skipped,

    positiveMark:
      roundNumber(
        positiveMark
      ),

    negativeMark:
      roundNumber(
        negativeMark
      ),

    score:
      roundNumber(
        score
      ),
  };
}

/* =========================================================
   BUILD ATTEMPT PAYLOAD
========================================================= */

export function buildAttemptPayload(
  body = {},
  uid
) {
  /* =======================================================
     ANSWERS
  ======================================================= */

  const answerArray =
    normalizeStoredAnswers(
      parseAnswers(body?.answer_array)
    );

  const userAnswers =
    normalizeStoredAnswers(
      parseAnswers(body?.user_answers)
    );

  /* =======================================================
     TOTAL QUESTIONS
  ======================================================= */

  const totalQuestions =
    numeric(
      body?.total_questions,
      answerArray.length ||
      userAnswers.length
    );

  const totalMark =
    numeric(
      body?.total_mark,
      totalQuestions
    );

  const markPerCorrect =
    numeric(
      body?.__scoring?.markPerCorrect ??
        body?.mark_per_question,
      totalQuestions > 0 &&
        totalMark > 0
        ? totalMark / totalQuestions
        : CORRECT_MARK
    );

  const negativeMarkPerWrong =
    numeric(
      body?.__scoring?.negativeMarkPerWrong ??
        body?.negative_mark_per_wrong,
      body?.total_attempted !== undefined
        ? WRONG_MARK
        : numeric(
            body?.minus_mark,
            WRONG_MARK
          )
    );

  /* =======================================================
     STATUS
  ======================================================= */

  const examStatus =
    normalizeExamStatus(
      body?.exam_status
    );

  const isFinished = [
    "complete",
    "completed",
    "finish",
    "finished",
  ].includes(examStatus);

  const calculated = isFinished
    ? calculateExamResult({
        answerArray,
        userAnswers,
        markPerCorrect,
        negativeMarkPerWrong,
      })
    : null;

  /* =======================================================
     EXAM TYPE
  ======================================================= */

  const examType =
    String(
      body?.exam_type ??
      ""
    )
      .trim()
      .toLowerCase();

  /* =======================================================
     PAYLOAD

     Never trust client-calculated scores. Evaluate answers
     only after the attempt has been finished.
  ======================================================= */

  const payload = {
    uid,

    cid:
      body?.cid,

    exam_status:
      examStatus,

    lastposition:
      body?.lastposition ??
      examType,

    exam_id:
      body?.exam_id,

    exam_type:
      examType,

    total_questions:
      totalQuestions,

    paused_time:
      numeric(body?.paused_time ?? body?.time_taken, 0) > 0 &&
      numeric(body?.paused_time ?? body?.time_taken, 0) <= 86400
        ? Math.round(numeric(body?.paused_time ?? body?.time_taken, 0) * 1000)
        : Math.round(numeric(body?.paused_time ?? body?.time_taken, 0)),

    total_mark:
      totalMark,

    answer_array:
      answerArray,

    user_answers:
      userAnswers,

    __scoring: {
      markPerCorrect,
      negativeMarkPerWrong,
    },
  };

  if (calculated) {
    Object.assign(payload, {
      user_score: calculated.score,
      minus_mark: calculated.negativeMark,
      total_attempted: calculated.attempted,
      total_correct: calculated.correct,
      total_wrong: calculated.wrong,
    });
  }

  const startTime = timestampToMilliseconds(
    body?.start_time ?? body?.startTime ?? body?.started_at
  );
  const endTime = timestampToMilliseconds(
    body?.end_time ??
    body?.endTime ??
    body?.ended_at ??
    (["complete", "completed", "finish", "finished"].includes(examStatus) ? Date.now() : null)
  );

  if (startTime !== null) {
    payload.start_time = startTime;
  }

  if (endTime !== null) {
    payload.end_time = endTime;
  }

  /* =======================================================
     UPDATE EXISTING ATTEMPT
  ======================================================= */

  if (
    body?.pauseid !==
    undefined &&
    body?.pauseid !==
    null &&
    String(
      body.pauseid
    ).trim()
  ) {
    payload.pauseid =
      body.pauseid;
  }

  return payload;
}

export function withPausedAttemptPlaceholders(payload = {}) {
  const status = String(
    payload.exam_status ??
    payload.examStatus ??
    ""
  )
    .trim()
    .toLowerCase();

  if (!["pause", "paused"].includes(status)) {
    return payload;
  }

  return {
    ...payload,
    user_score: "",
    minus_mark: "",
    total_attempted: "",
    total_correct: "",
    total_wrong: "",
  };
}