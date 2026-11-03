const FINISHED_STATUSES = new Set([
  "complete",
  "completed",
  "finish",
  "finished",
]);

export function getExamAttemptStatus(attempt) {
  const explicit =
    attempt?.exam_status ??
    attempt?.examStatus;

  if (
    explicit !== undefined &&
    explicit !== null &&
    String(explicit).trim() !== ""
  ) {
    return String(explicit).trim().toLowerCase();
  }

  const status = attempt?.status;

  if (
    typeof status === "boolean" ||
    status === "true" ||
    status === "false"
  ) {
    return "";
  }

  return String(status ?? "")
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
