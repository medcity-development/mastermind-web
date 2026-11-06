import { normalizeExamHistoryType } from "@/lib/examHistoryTypes";

// All-course history is still restricted to the authenticated student.
// Completion status is deliberately not a filter: paused attempts are history too.
export function selectStudentAttempts(rows, uid, examType) {
  const type = normalizeExamHistoryType(examType);
  const seen = new Set();
  return (Array.isArray(rows) ? rows : []).filter((row) => {
    if (!row || typeof row !== "object" || Array.isArray(row)) return false;
    const owner = Number(row.uid ?? row.user_id ?? row.userId);
    const attemptId = Number(row.attempt_id ?? row.attemptId ?? row.pauseid ?? row.pause_id ?? row.id);
    if (!Number.isSafeInteger(owner) || owner <= 0 || owner !== Number(uid)) return false;
    if (!Number.isSafeInteger(attemptId) || attemptId <= 0) return false;
    if (normalizeExamHistoryType(row.exam_type ?? row.examType ?? row.type) !== type) return false;
    if (seen.has(attemptId)) return false;
    seen.add(attemptId);
    return true;
  }).map((row) => ({ ...row, exam_type: type, _examType: type, _userVerified: true }));
}
