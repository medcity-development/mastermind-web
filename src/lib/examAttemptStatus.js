const FINISHED_STATUSES = new Set([
  "complete",
  "completed",
  "finish",
  "finished",
]);

export function getExamAttemptStatus(attempt) {
  return String(
    attempt?.exam_status ??
    attempt?.examStatus ??
    attempt?.status ??
    ""
  )
    .trim()
    .toLowerCase();
}

export function isPausedExamAttempt(attempt) {
  return ["pause", "paused"].includes(
    getExamAttemptStatus(attempt)
  );
}

export function isFinishedExamAttempt(attempt) {
  return FINISHED_STATUSES.has(
    getExamAttemptStatus(attempt)
  );
}
