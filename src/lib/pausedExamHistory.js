import "server-only";
import { getUserExamsList, getUserExamAttempts } from "@/lib/examAttemptHelper";
import { backendHistoryType } from "@/lib/examHistoryApi";
import { selectStudentAttempts } from "@/lib/studentAttemptHistory";
import { getPausedAttempts } from "@/lib/pausedExamAttempts";
import { selectMockPausedAttempt } from "@/lib/mockPausedAttempt";
import { verifyExamHistoryCourse } from "@/lib/examHistoryHelper";

export async function getPausedExamHistory({ uid, cid, examType }) {
  const backendType = backendHistoryType(examType);
  // The list discovers exam IDs; getUserExams is the source of saved progress.
  const history = await getUserExamsList({ uid, cid, exam_type: backendType });
  if (history?.status !== true) return history;
  const candidates = getPausedAttempts(selectStudentAttempts(
    history.details ?? history.data, uid, examType,
  ));
  const details = [];
  let partialVerification = false;
  for (const candidate of candidates) {
    const examId = Number(candidate.exam_id ?? candidate.examId);
    try {
      const saved = await getUserExamAttempts({ uid, cid, examId, examType: backendType });
      if (saved?.status === false) {
        if (saved.message || saved.msg || saved.rateLimited) {
          if (saved.rateLimited) return saved;
          partialVerification = true;
        }
        continue;
      }
      const paused = selectMockPausedAttempt(saved, { uid, cid, examId, examType: backendType });
      if (!paused) continue;
      const attemptId = Number(paused.pauseid ?? paused.pause_id ?? paused.attempt_id ?? paused.id);
      const verified = await verifyExamHistoryCourse({
        uid, cid, examId, examType, attemptId, historyRow: paused,
      });
      if (verified === null) partialVerification = true;
      if (verified !== true) continue;
      details.push({ ...paused, exam_id: examId, _examId: examId,
        _historyId: attemptId, exam_type: examType, _examType: examType,
        _courseVerified: true });
    } catch (error) {
      if (error?.httpStatus === 429 || error?.status === 429) {
        return { status: false, rateLimited: true, retryAfter: error.retryAfter, details: [] };
      }
      partialVerification = true;
    }
  }
  return { status: true, details, courseFilterVerified: true, partialVerification };
}
