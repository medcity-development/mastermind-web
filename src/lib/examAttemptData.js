const CORRECT_MARK = 1;
const WRONG_MARK = 0.333;

function numeric(value, fallback = 0) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function roundNumber(value) {
  return Math.round((numeric(value) + Number.EPSILON) * 100) / 100;
}

export function secondsToMilliseconds(seconds) {
  return Math.max(0, Math.round(numeric(seconds) * 1000));
}

export function millisecondsToSeconds(milliseconds) {
  return Math.max(0, Math.ceil(numeric(milliseconds) / 1000));
}

export function timestampToMilliseconds(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const number = Number(value);

  if (Number.isFinite(number) && number > 0) {
    return Math.trunc(
      number < 1_000_000_000_000 ? number * 1000 : number
    );
  }

  const timestamp = String(value).trim();

  const local = timestamp.match(
    /^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?))?$/
  );

  const normalized = local
    ? `${local[1]}T${local[2] || "00:00:00"}+05:30`
    : timestamp;

  const parsed = Date.parse(normalized);

  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : null;
}

// Supports legacy PSC values stored in either seconds or milliseconds.
export function savedPausedTimeToSeconds(value, durationSeconds) {
  const saved = Math.max(0, numeric(value));
  const duration = Math.max(0, numeric(durationSeconds));

  return saved <= duration
    ? Math.ceil(saved)
    : millisecondsToSeconds(saved);
}

export function parseAnswers(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value === undefined || value === null || value === "") {
    return [];
  }

  const text = String(value).trim();

  if (!text) {
    return [];
  }

  try {
    const parsed = JSON.parse(text);

    if (Array.isArray(parsed)) {
      return parsed;
    }

    if (typeof parsed === "string") {
      try {
        const nested = JSON.parse(parsed);

        if (Array.isArray(nested)) {
          return nested;
        }
      } catch {
        // Continue with legacy format.
      }
    }
  } catch {
    // Continue with legacy format.
  }

  const content = text
    .replace(/^\[/, "")
    .replace(/\]$/, "");

  if (!content.trim()) {
    return [];
  }

  return content
    .split(",")
    .map((item) =>
      item.trim().replace(/^["']|["']$/g, "")
    );
}

export function normalizeExamAnswer(value) {
  if (value === undefined || value === null) {
    return "";
  }

  const upper = String(value).trim().toUpperCase();

  if (
    !upper ||
    ["0", "NULL", "UNDEFINED", "N/A"].includes(upper)
  ) {
    return "";
  }

  if (/^[A-E]$/.test(upper)) {
    return upper;
  }

  const match = upper.match(
    /^([A-E])(?:[\s.):\-]|$)/
  );

  return match ? match[1] : upper;
}

function normalizeStoredAnswers(value) {
  return parseAnswers(value).map((answer) => {
    const option = normalizeExamAnswer(answer);
    return /^[A-E]$/.test(option) ? option : 0;
  });
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
      value !== undefined &&
      value !== null &&
      String(value).trim() !== "" &&
      String(value) !== "0"
    ) {
      return value;
    }
  }

  for (const nested of [
    result.data,
    result.details,
    result.result,
  ]) {
    if (Array.isArray(nested)) {
      for (const item of nested) {
        const id = getAttemptId(item);

        if (id !== null) {
          return id;
        }
      }
    } else if (nested && typeof nested === "object") {
      const id = getAttemptId(nested);

      if (id !== null) {
        return id;
      }
    }
  }

  return null;
}

export function getResultArray(result) {
  if (Array.isArray(result)) {
    return result;
  }

  if (!result || typeof result !== "object") {
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

  for (const key of keys) {
    const value = result[key];

    if (Array.isArray(value) && value.length) {
      return value;
    }

    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      const nested = getResultArray(value);

      if (nested.length) {
        return nested;
      }

      if (getAttemptId(value) !== null) {
        return [value];
      }
    }
  }

  return [];
}

export function isFailedResponse(result) {
  if (!result) {
    return true;
  }

  const status =
    typeof result.status === "string"
      ? result.status.trim().toLowerCase()
      : result.status;

  return [
    false,
    0,
    "0",
    "false",
    "error",
    "failed",
  ].includes(status);
}

function normalizeExamStatus(value) {
  const status = String(value ?? "")
    .trim()
    .toLowerCase();

  if (
    ["finish", "finished", "complete", "completed"].includes(status)
  ) {
    return "finish";
  }

  if (["pause", "paused"].includes(status)) {
    return "pause";
  }

  return status || "pause";
}

export function calculateExamResult({
  answerArray = [],
  userAnswers = [],
  markPerCorrect = CORRECT_MARK,
  negativeMarkPerWrong = WRONG_MARK,
} = {}) {
  const correctAnswers = parseAnswers(answerArray);
  const studentAnswers = parseAnswers(userAnswers);

  if (correctAnswers.length !== studentAnswers.length) {
    throw new Error(
      "Cannot calculate exam score: answer arrays have different lengths."
    );
  }

  let attempted = 0;
  let correct = 0;
  let wrong = 0;

  for (
    let index = 0;
    index < correctAnswers.length;
    index += 1
  ) {
    const student = normalizeExamAnswer(
      studentAnswers[index]
    );

    if (!student) {
      continue;
    }

    if (!/^[A-E]$/.test(student)) {
      throw new Error(
        `Invalid selected answer for question ${index + 1}.`
      );
    }

    const key = normalizeExamAnswer(
      correctAnswers[index]
    );

    if (!/^[A-E]$/.test(key)) {
      throw new Error(
        `Missing or invalid correct answer for question ${index + 1}.`
      );
    }

    attempted += 1;

    if (student === key) {
      correct += 1;
    } else {
      wrong += 1;
    }
  }

  const positiveMark =
    correct * numeric(markPerCorrect, CORRECT_MARK);

  const negativeMark = roundNumber(
    wrong * numeric(negativeMarkPerWrong, WRONG_MARK)
  );

  return {
    attempted,
    correct,
    wrong,
    skipped: correctAnswers.length - attempted,
    positiveMark: roundNumber(positiveMark),
    negativeMark,
    score: roundNumber(positiveMark - negativeMark),
  };
}

export function buildAttemptPayload(body = {}, uid) {
  const answerArray = normalizeStoredAnswers(
    body.answer_array
  );

  const userAnswers = normalizeStoredAnswers(
    body.user_answers
  );

  const totalQuestions = numeric(
    body.total_questions,
    answerArray.length || userAnswers.length
  );

  const totalMark = numeric(
    body.total_mark,
    totalQuestions
  );

  const examType = String(body.exam_type ?? "")
    .trim()
    .toLowerCase();

  const androidScoring = [
    "mock",
    "pqp",
    "pyq",
    "scert",
    "twe",
    "topicwise",
    "tst",
    "studyplan",
  ].includes(examType);

  const markPerCorrect = androidScoring
    ? CORRECT_MARK
    : numeric(
        body.__scoring?.markPerCorrect ??
          body.mark_per_question,
        totalQuestions > 0 && totalMark > 0
          ? totalMark / totalQuestions
          : CORRECT_MARK
      );

  const negativeMarkPerWrong = androidScoring
    ? WRONG_MARK
    : numeric(
        body.__scoring?.negativeMarkPerWrong ??
          body.negative_mark_per_wrong,
        body.total_attempted !== undefined
          ? WRONG_MARK
          : numeric(body.minus_mark, WRONG_MARK)
      );

  const examStatus = normalizeExamStatus(
    body.exam_status
  );

  const isFinished = examStatus === "finish";

  const calculated = isFinished
    ? calculateExamResult({
        answerArray,
        userAnswers,
        markPerCorrect,
        negativeMarkPerWrong,
      })
    : null;

  const payload = {
    uid,
    cid: body.cid,
    exam_status: examStatus,
    lastposition: body.lastposition ?? examType,
    exam_id: body.exam_id,
    exam_type: examType,
    total_questions: totalQuestions,

    // paused_time and time_taken are milliseconds.
    // remaining_seconds is converted exactly once.
    paused_time:
      body.paused_time != null && body.paused_time !== ""
        ? Math.max(0, Math.round(numeric(body.paused_time)))
        : body.remaining_seconds != null &&
            body.remaining_seconds !== ""
          ? secondsToMilliseconds(body.remaining_seconds)
          : Math.max(0, Math.round(numeric(body.time_taken))),

    total_mark: totalMark,
    answer_array: answerArray,
    user_answers: userAnswers,
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
    body.start_time ??
      body.startTime ??
      body.started_at
  );

  const endTime = timestampToMilliseconds(
    body.end_time ??
      body.endTime ??
      body.ended_at ??
      (isFinished ? Date.now() : null)
  );

  if (startTime !== null) {
    payload.start_time = startTime;
  }

  if (endTime !== null) {
    payload.end_time = endTime;
  }

  if (
    body.pauseid !== undefined &&
    body.pauseid !== null &&
    String(body.pauseid).trim()
  ) {
    payload.pauseid = body.pauseid;
  }

  return payload;
}

export function withPausedAttemptPlaceholders(payload = {}) {
  const status = String(
    payload.exam_status ?? payload.examStatus ?? ""
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