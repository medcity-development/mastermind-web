
/* =========================================================
   PAUSED EXAM ATTEMPTS
========================================================= */

import { timestampToMilliseconds } from "@/lib/examAttemptData";
import {
  isFinishedExamAttempt,
  isPausedExamAttempt,
} from "@/lib/examAttemptStatus";

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
    row?._examId ??
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
    row?._historyId ??
    row?.id
  );
}

function getTimestamp(row) {
  const values = [
    row?.end_time,
    row?.endTime,
    row?.ended_at,
    row?.modified_at,
    row?.updated_at,
    row?.created_at,
    row?.started_at,
    row?.start_time,
    row?.startTime,
  ];

  for (const value of values) {
    const parsed = timestampToMilliseconds(value);

    if (parsed != null) {
      return parsed;
    }
  }

  return Number.NaN;
}

function isNewerAttempt(current, previous) {
  const currentId = getPauseId(current.row) ?? 0;
  const previousId = getPauseId(previous.row) ?? 0;
  const currentFinished = isFinishedExamAttempt(current.row);
  const previousFinished = isFinishedExamAttempt(previous.row);
  const currentPaused = isPausedExamAttempt(current.row);
  const previousPaused = isPausedExamAttempt(previous.row);

  // A completed attempt replaces an older paused row for the same exam,
  // even when the pause record still exists in the list.
  if (currentFinished && previousPaused && currentId >= previousId) {
    return true;
  }

  if (previousFinished && currentPaused && previousId >= currentId) {
    return false;
  }

  const currentTime = current.timestamp;
  const previousTime = previous.timestamp;

  if (
    Number.isFinite(currentTime) &&
    Number.isFinite(previousTime) &&
    currentTime !== previousTime
  ) {
    return currentTime > previousTime;
  }

  if (currentId !== previousId) {
    return currentId > previousId;
  }

  if (currentFinished !== previousFinished) {
    return currentFinished;
  }

  return current.index >= previous.index;
}

function latestAttemptsByExam(rows) {
  const latest = new Map();

  rows.forEach((row, index) => {
    const examId = getExamId(row);

    if (!examId) {
      return;
    }

    const current = {
      row,
      index,
      timestamp: getTimestamp(row),
    };
    const previous = latest.get(examId);

    if (!previous || isNewerAttempt(current, previous)) {
      latest.set(examId, current);
    }
  });

  return latest;
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
  const latest = latestAttemptsByExam(getAttemptRows(result));
  const attempts = {};

  for (const [examId, entry] of latest) {
    const pauseId = getPauseId(entry.row);

    if (isPausedExamAttempt(entry.row) && pauseId) {
      attempts[String(examId)] = String(pauseId);
    }
  }

  return attempts;
}

export function getPausedAttempts(result) {
  const rows = getAttemptRows(result);
  const ids = getPausedAttemptIds(rows);

  return rows.filter((row) => {
    const examId = getExamId(row);
    const pauseId = getPauseId(row);

    return (
      examId &&
      pauseId &&
      ids[String(examId)] === String(pauseId)
    );
  });
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
