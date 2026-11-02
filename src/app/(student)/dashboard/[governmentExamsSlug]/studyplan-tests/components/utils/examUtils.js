import {
  calculateMockResult,
  getAttemptId,
  getDurationSeconds,
  getExamTotalMark,
  getQuestionOptions,
  parseAnswerArray,
} from "@/app/(student)/dashboard/[governmentExamsSlug]/mock-tests/[examId]/start/utils/mockTestUtils";
import {
  savedPausedTimeToSeconds,
} from "@/lib/examAttemptData";
import {
  selectMockPausedAttempt,
} from "@/lib/mockPausedAttempt";

export const QUESTIONS_PER_PAGE = 10;

export function extractStudyPlanExam(result, examId) {
  const candidates = [
    result?.exam,
    result?.exam_details,
    result?.examDetails,
    result?.data?.exam,
    result?.details?.exam,
  ];

  for (const candidate of candidates) {
    const rows = Array.isArray(candidate)
      ? candidate
      : candidate && typeof candidate === "object"
        ? [candidate]
        : [];
    const exam = rows.find((item) => {
      const id = item?.id ?? item?.exam_id ?? item?.examid;
      return id != null && String(id) === String(examId);
    });

    if (exam) return exam;
  }

  return null;
}

export function extractStudyPlanInstructions(result) {
  const instructions = [];

  function add(value) {
    if (typeof value === "string") {
      const instruction = value.trim();

      if (instruction) instructions.push(instruction);

      return;
    }

    if (Array.isArray(value)) {
      value.forEach(add);
      return;
    }

    if (!value || typeof value !== "object") return;

    add(
      value.instructions ??
      value.instruction ??
      value.instruction_text ??
      value.instructionText
    );
  }

  add(result?.data);
  add(result?.instructions);
  add(result?.instruction);

  const exam = Array.isArray(result?.exam)
    ? result.exam[0]
    : result?.exam;
  add(exam?.instructions ?? exam?.instruction);

  return instructions;
}

export function selectStudyPlanPausedAttempt(result, filters) {
  return selectMockPausedAttempt(result, {
    ...filters,
    examType: "studyplan",
  });
}

export function restoreStudyPlanAnswers(questions, savedAnswers) {
  const values = parseAnswerArray(savedAnswers);
  const answers = {};

  questions.forEach((question, index) => {
    const answer = String(values[index] ?? "").trim().toUpperCase();
    const questionId = question?.id ?? index + 1;

    if (
      getQuestionOptions(question).includes(answer)
    ) {
      answers[questionId] = answer;
    }
  });

  return answers;
}

export function getStudyPlanRemainingSeconds(attempt, exam) {
  const duration = getDurationSeconds(exam);

  if (!attempt || duration <= 0) {
    return duration;
  }

  const remaining = savedPausedTimeToSeconds(
    attempt.paused_time,
    duration
  );

  return Math.min(duration, remaining);
}

export function buildStudyPlanAttemptPayload({
  cid,
  examId,
  exam,
  questions,
  answers,
  examStatus,
  remainingSeconds,
  startTime,
  pauseId,
}) {
  const result = calculateMockResult({
    questions,
    answers,
  });

  if (
    examStatus === "finish" &&
    !result.scoreVerified
  ) {
    const firstError = result.validationErrors[0];
    throw new Error(
      firstError
        ? `Unable to verify question ${firstError.questionId}: ${firstError.reason}.`
        : "Unable to verify the exam score."
    );
  }

  return {
    cid: String(cid),
    exam_id: String(examId),
    exam_type: "studyplan",
    exam_status: examStatus,
    lastposition: "studyplan",
    total_questions: String(questions.length),
    total_mark: String(
      getExamTotalMark(exam, questions.length)
    ),
    answer_array: result.answerArray,
    user_answers: result.userAnswers,
    remaining_seconds: Math.max(
      0,
      Math.round(Number(remainingSeconds) || 0)
    ),
    start_time: String(startTime || Date.now()),
    ...(examStatus === "finish"
      ? { end_time: String(Date.now()) }
      : {}),
    ...(pauseId ? { pauseid: String(pauseId) } : {}),
  };
}

export function buildStudyPlanResult({
  exam,
  questions,
  answers,
  attemptId,
}) {
  const score = calculateMockResult({
    questions,
    answers,
  });

  if (!score.scoreVerified) {
    const firstError = score.validationErrors[0];
    throw new Error(
      firstError
        ? `Unable to verify question ${firstError.questionId}: ${firstError.reason}.`
        : "Unable to verify the exam score."
    );
  }

  return {
    id: attemptId,
    exam_status: "finish",
    exam_type: "studyplan",
    exam_name:
      exam?.exam_name ||
      exam?.title ||
      "Study Plan Test",
    total_questions: questions.length,
    total_mark: getExamTotalMark(exam, questions.length),
    answer_array: score.answerArray,
    user_answers: score.userAnswers,
    total_attempted: score.totalAttempted,
    total_correct: score.totalCorrect,
    total_wrong: score.totalWrong,
    user_score: score.userScore,
    minus_mark: score.minusMark,
  };
}

export {
  getAttemptId,
  getDurationSeconds,
  getQuestionOptions,
};
