// getUserExams can return a row, an array, or a wrapped array.
export function selectMockPausedAttempt(result, { examId, uid, cid, examType = "mock" }) {
  function rows(value) {
    if (Array.isArray(value)) return value.flatMap(rows);
    if (!value || typeof value !== "object") return [];
    if (value.pauseid || value.pause_id || value.attempt_id || value.id) return [value];
    return ["data", "details", "result", "results", "exams", "paused"]
      .flatMap((key) => rows(value[key]));
  }
  const candidates = rows(result).filter((row) => {
    const matches = (value, expected) => value == null || String(value) === String(expected);
    return matches(row.exam_id ?? row.examId, examId)
      && matches(row.uid ?? row.user_id, uid)
      && matches(row.cid, cid)
      && matches(row.exam_type, examType);
  });
  const id = (row) => Number(row.pauseid ?? row.pause_id ?? row.attempt_id ?? row.id) || 0;
  candidates.sort((a, b) => id(b) - id(a));
  const latest = candidates[0];
  if (!latest || id(latest) <= 0) return null;
  const status = String(latest.exam_status ?? latest.examStatus ?? "").toLowerCase();
  return ["pause", "paused"].includes(status) ? latest : null;
}
