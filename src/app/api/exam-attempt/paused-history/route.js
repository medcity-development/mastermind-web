import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/getStudentSession";
import { normalizeHistoryType, isHistoryTypeEnabled } from "@/lib/examHistoryApi";
import { getPausedExamHistory } from "@/lib/pausedExamHistory";

export const dynamic = "force-dynamic";

function reply(body, status = 200) {
  return NextResponse.json(body, { status, headers: {
    "Cache-Control": "private, no-store",
    ...(body.retryAfter ? { "Retry-After": String(body.retryAfter) } : {}),
  } });
}

export async function POST(request) {
  const session = await getStudentSession();
  const uid = Number(session?.uid);
  if (!Number.isSafeInteger(uid) || uid <= 0) return reply({ status: false, message: "Please sign in." }, 401);
  let body;
  try { body = await request.json(); } catch {
    return reply({ status: false, message: "Invalid request." }, 400);
  }
  const cid = Number(body.cid);
  const examType = normalizeHistoryType(body.exam_type);
  if (!Number.isSafeInteger(cid) || cid <= 0 || !isHistoryTypeEnabled(examType)) {
    return reply({ status: false, message: "Invalid course or exam type." }, 400);
  }
  try {
    const result = await getPausedExamHistory({ uid, cid, examType });
    return reply(result, result?.status === true ? 200 : result?.rateLimited ? 429 : 502);
  } catch (error) {
    const rateLimited = error?.httpStatus === 429 || error?.status === 429;
    return reply({ status: false, rateLimited, retryAfter: error?.retryAfter,
      message: "Unable to load paused exams." }, rateLimited ? 429 : 502);
  }
}
