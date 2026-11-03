import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/getStudentSession";
import { getGovernmentExamConfig } from "@/lib/governmentExamConfig";
import { normalizeHistoryType, backendHistoryType, isHistoryTypeEnabled } from "@/lib/examHistoryApi";
import { getUserExamAttempts } from "@/lib/examAttemptHelper";
import { selectMockPausedAttempt } from "@/lib/mockPausedAttempt";
import { verifyExamHistoryCourse } from "@/lib/examHistoryHelper";
import { resolvePausedExamHref } from "@/lib/pausedExamResume";

export const dynamic = "force-dynamic";
function id(value) { const n = Number(value); return Number.isSafeInteger(n) && n > 0 ? n : null; }
function reply(body, status = 200) { return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } }); }

export async function POST(request) {
  const session = await getStudentSession();
  const uid = id(session?.uid);
  if (!uid) return reply({ message: "Please sign in to resume your exam." }, 401);
  let body;
  try { body = await request.json(); } catch { return reply({ message: "Invalid request." }, 400); }
  const config = getGovernmentExamConfig(body?.governmentExamsSlug);
  const examId = id(body?.examId);
  const pauseId = id(body?.pauseId);
  const examType = normalizeHistoryType(body?.examType);
  if (!config || !examId || !pauseId || !isHistoryTypeEnabled(examType)) return reply({ message: "Invalid exam or attempt." }, 400);
  const cid = Number(config.cid);
  try {
    const result = await getUserExamAttempts({ uid, cid, examId, examType: backendHistoryType(examType) });
    if (result?.status === false && (result.message || result.msg)) throw new Error(result.message || result.msg);
    const paused = selectMockPausedAttempt(result, { uid, cid, examId, examType: backendHistoryType(examType) });
    const savedId = id(paused?.pauseid ?? paused?.pause_id ?? paused?.attempt_id ?? paused?.id);
    if (!paused || savedId !== pauseId) return reply({ message: "This attempt is no longer paused or has been replaced. Refresh the list." }, 409);
    const verified = await verifyExamHistoryCourse({ uid, cid, examId, examType, attemptId: pauseId, historyRow: paused });
    if (verified !== true) return reply({ message: "Unable to verify this saved attempt for the selected course." }, 403);
    const href = await resolvePausedExamHref({ uid, cid, governmentExamsSlug: config.slug, examId, examType, pauseId });
    if (!href) return reply({ message: "The saved exam is no longer available in this course." }, 404);
    return reply({ status: true, href });
  } catch (error) {
    console.error("Unable to resume paused exam:", error?.message);
    return reply({ message: "Unable to load the saved exam. Please try again." }, 502);
  }
}
