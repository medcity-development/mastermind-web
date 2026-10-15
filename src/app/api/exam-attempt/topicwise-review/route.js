import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/getStudentSession";
import { getExamAnalyticDetails } from "@/lib/examAttemptHelper";
import { getTopicWiseExamQuestions } from "@/lib/topicWiseExamHelper";
import { buildTopicWiseReview } from "@/lib/topicWiseReview";

export const dynamic = "force-dynamic";

function positiveId(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}
function reply(body, status = 200) {
  return NextResponse.json(body, {
    status, headers: { "Cache-Control": "no-store" },
  });
}
function rows(result) {
  return [result?.details, result?.data, result?.result,
    result?.data?.details, result?.data?.data].find(Array.isArray) ?? [];
}
function failed(result) {
  return !result || [false, "false", 0, "0", "error", "failed"].includes(result.status);
}

export async function GET(request) {
  try {
    const session = await getStudentSession();
    const uid = positiveId(session?.uid);
    if (!uid) return reply({ status: false, message: "Please sign in." }, 401);
    const query = new URL(request.url).searchParams;
    const cid = positiveId(query.get("cid"));
    const attemptId = positiveId(query.get("attemptId"));
    if (!cid || !attemptId) {
      return reply({ status: false, message: "Valid course and attempt IDs are required." }, 400);
    }

    const result = await getExamAnalyticDetails({ uid, cid, id: attemptId, exam_type: "twe" });
    if (failed(result)) {
      return reply({ status: false, message: result?.message || "Unable to load saved answers." }, 502);
    }
    const records = rows(result);
    const attempt = records.find((row) =>
      positiveId(row.pauseid ?? row.pause_id ?? row.attempt_id ?? row.id) === attemptId
    ) ?? (records.length === 1 ? records[0] : null);
    if (!attempt) return reply({ status: false, message: "The saved attempt was not returned." }, 404);

    const owner = attempt.uid ?? attempt.user_id;
    const course = attempt.cid ?? attempt.course_id;
    if ((owner != null && Number(owner) !== uid) ||
        (course != null && Number(course) !== cid)) {
      return reply({ status: false, message: "This attempt does not match the signed-in student and course." }, 403);
    }
    const examId = positiveId(attempt.exam_id ?? attempt.examid ?? attempt.test_id);
    if (!examId) return reply({ status: false, message: "The saved attempt has no exam ID." }, 422);

    // UI calls this type 'topicwise'; the backend expects 'twe'.
    const paper = await getTopicWiseExamQuestions({ uid, cid, examId, examType: "twe" });
    if (failed(paper) || !Array.isArray(paper.data) || !paper.data.length) {
      return reply({ status: false, message: paper?.message || "Unable to load topic-wise questions." }, 502);
    }
    let review;
    try { review = buildTopicWiseReview(paper.data, attempt); }
    catch (error) { return reply({ status: false, message: error.message }, 422); }
    return reply({ status: true, examId, imagePath: paper.imagePath || "", questions: review });
  } catch (error) {
    console.error("TOPIC WISE REVIEW:", error?.message);
    return reply({ status: false, message: "Unable to load the exam review. Please retry." }, 502);
  }
}
