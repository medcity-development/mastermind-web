import {
    getExamTotalMark,
} from "./mockTestUtils";

export function buildMockAttemptPayload({
    cid,
    examId,
    examType,
    exam,
    questions = [],
    remainingSeconds = 0,
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

        lastposition:
            exam?.lastposition ??
            examType,

        paused_time:
            String(
                remainingSeconds
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