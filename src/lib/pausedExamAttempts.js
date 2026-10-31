
/* =========================================================
   PAUSED EXAM ATTEMPTS
========================================================= */

function getAttemptRows(result) {
  if (Array.isArray(result)) {
    return result;
  }

  const candidates = [
    result?.details,
    result?.data,
    result?.result,
    result?.results,
    result?.exams,
    result?.data?.details,
    result?.data?.data,
    result?.data?.result,
    result?.result?.details,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

function positiveId(value) {
  const number = Number(value);

  return Number.isSafeInteger(number) && number > 0
    ? number
    : null;
}

function getExamId(row) {
  return positiveId(
    row?.exam_id ??
    row?.examId ??
    row?.test_id ??
    row?.testId
  );
}

function getPauseId(row) {
  return positiveId(
    row?.pauseid ??
    row?.pause_id ??
    row?.attempt_id ??
    row?.attemptId ??
    row?.id
  );
}

function getStatus(row) {
  return String(
    row?.exam_status ??
    row?.examStatus ??
    row?.status ??
    ""
  )
    .trim()
    .toLowerCase();
}

function getTimestamp(row) {
  const value =
    row?.modified_at ??
    row?.updated_at ??
    row?.created_at ??
    row?.started_at ??
    row?.start_time;

  if (!value) {
    return Number.NaN;
  }

  const parsed = Date.parse(String(value));

  return Number.isFinite(parsed)
    ? parsed
    : Number.NaN;
}

function isPaused(row) {
  return ["pause", "paused"].includes(
    getStatus(row)
  );
}

/* =========================================================
   GET PAUSED ATTEMPT IDS

   Output:
   {
     "40": "329",
     "41": "330"
   }
========================================================= */

export function getPausedAttemptIds(result) {
  const rows = getAttemptRows(result);

  const latest = new Map();

  rows.forEach((row, index) => {
    const examId = getExamId(row);

    if (!examId) {
      return;
    }

    const key = String(examId);

    const current = {
      row,
      index,
      timestamp: getTimestamp(row),
    };

    const previous = latest.get(key);

    if (!previous) {
      latest.set(key, current);
      return;
    }

    const currentTime = current.timestamp;
    const previousTime = previous.timestamp;

    if (
      Number.isFinite(currentTime) &&
      Number.isFinite(previousTime)
    ) {
      if (currentTime >= previousTime) {
        latest.set(key, current);
      }

      return;
    }

    if (
      Number.isFinite(currentTime) &&
      !Number.isFinite(previousTime)
    ) {
      latest.set(key, current);
      return;
    }

    if (
      !Number.isFinite(currentTime) &&
      !Number.isFinite(previousTime)
    ) {
      // Fall back to attempt ID when timestamps
      // are unavailable.
      const currentId = getPauseId(row) ?? 0;
      const previousId =
        getPauseId(previous.row) ?? 0;

      if (currentId > previousId) {
        latest.set(key, current);
      }
    }
  });

  const attempts = {};

  for (const [examId, entry] of latest) {
    const row = entry.row;
    const pauseId = getPauseId(row);

    if (isPaused(row) && pauseId) {
      attempts[examId] = String(pauseId);
    }
  }

  return attempts;
}

/* =========================================================
   FETCH PAUSED ATTEMPTS
========================================================= */

export async function fetchPausedAttemptIds({
  cid,
  examType = "twe",
} = {}) {
  const response = await fetch(
    "/api/exam-attempt/user-exams",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        cid,
        exam_type: examType,
      }),
    }
  );

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "Unable to read saved exam attempts."
    );
  }

  if (
    !response.ok ||
    result?.status === false
  ) {
    throw new Error(
      result?.message ||
      "Unable to load paused exams."
    );
  }

  return getPausedAttemptIds(result);
}
