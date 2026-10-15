import {
    getExamTotalMark,
} from "./mockTestUtils";
import { secondsToMilliseconds } from "@/lib/examAttemptData";

export function buildMockAttemptPayload({
    cid,
    examId,
    examType,
    exam,
    questions = [],
    remainingSeconds = 0,
    startTime,
    completedAt,
    examStatus,
    result,
}) {
    const totalMark =
        getExamTotalMark(
            exam,
            questions.length
        );

    return {
        cid:
            String(cid),

        exam_id:
            String(examId),

        exam_type:
            examType,

        exam_status:
            examStatus,

        start_time:
            String(startTime ?? Date.now()),

        ...(String(examStatus).toLowerCase() === "finish" ||
            String(examStatus).toLowerCase() === "complete"
            ? {
                // Store when the student actually submits, not the timer's
                // scheduled deadline (which can be many hours later).
                end_time:
                    String(completedAt ?? Date.now()),
            }
            : {}),

        lastposition:
            exam?.lastposition ??
            examType,

        paused_time:
            String(
                secondsToMilliseconds(
                    remainingSeconds
                )
            ),

        total_questions:
            String(
                questions.length
            ),

        total_mark:
            String(
                totalMark
            ),

        user_score:
            String(
                result.userScore
            ),

        minus_mark:
            String(
                result.minusMark
            ),

        answer_array:
            result.answerArray,

        user_answers:
            result.userAnswers,

        total_wrong:
            String(
                result.totalWrong
            ),

        total_correct:
            String(
                result.totalCorrect
            ),

        total_attempted:
            String(
                result.totalAttempted
            ),
    };
}

export function getMockExamTitle({
    exam,
    submittedResult,
    fallback = "",
}) {
    return String(
        submittedResult
            ?.exam_name ??
        submittedResult
            ?.examName ??
        submittedResult
            ?.exam_title ??
        submittedResult
            ?.examTitle ??
        submittedResult
            ?.title ??
        exam?.exam_name ??
        exam?.examName ??
        exam?.exam_title ??
        exam?.examTitle ??
        exam?.title ??
        exam?.name ??
        fallback ??
        ""
    ).trim();
}
