import {
  useCallback,
} from "react";

import {
  getAttemptId,
  getDurationSeconds,
  getExamStatus,
  getExamType,
  normalizeAnswer,
  parseAnswerArray,
} from "../utils/mockTestUtils";

export default function useMockExamLoader({
  examId,
  uid,
  cid,
}) {
  const loadMockExam =
    useCallback(
      async () => {
        /* ===============================================
           DETAILS
        =============================================== */

        const detailsParams =
          new URLSearchParams({
            uid:
              String(uid),

            cid:
              String(cid),

            examid:
              String(
                examId
              ),

            offset:
              "0",
          });

        const detailsResponse =
          await fetch(
            `/api/mock-tests/details?${detailsParams.toString()}`,
            {
              cache:
                "no-store",
            }
          );

        const detailsResult =
          await detailsResponse.json();

        if (
          !detailsResponse.ok ||
          detailsResult?.status ===
            false
        ) {
          throw new Error(
            detailsResult?.message ||
            detailsResult?.msg ||
            "Unable to load exam details."
          );
        }

        const exam =
          Array.isArray(
            detailsResult?.exam
          )
            ? detailsResult.exam[0] ??
              null
            : detailsResult?.exam ??
              null;

        if (!exam) {
          throw new Error(
            "Exam details were not returned."
          );
        }

        const examType =
          getExamType(
            exam,
            detailsResult
          );

        if (!examType) {
          throw new Error(
            "Exam type is missing."
          );
        }

        /* ===============================================
           QUESTIONS
        =============================================== */

        const questionParams =
          new URLSearchParams({
            uid:
              String(uid),

            cid:
              String(cid),

            examid:
              String(
                examId
              ),

            examtype:
              examType,
          });

        const questionsResponse =
          await fetch(
            `/api/mock-tests/questions?${questionParams.toString()}`,
            {
              cache:
                "no-store",
            }
          );

        const questionsResult =
          await questionsResponse.json();

        if (
          !questionsResponse.ok ||
          questionsResult?.status ===
            false
        ) {
          throw new Error(
            questionsResult?.message ||
            questionsResult?.msg ||
            "Unable to load exam questions."
          );
        }

        const questions =
          Array.isArray(
            questionsResult?.data
          )
            ? questionsResult.data
            : [];

        /* ===============================================
           PAUSED ATTEMPT
        =============================================== */

        const savedAttempt =
          Array.isArray(
            detailsResult?.paused
          )
            ? detailsResult.paused[0] ??
              null
            : detailsResult?.paused ??
              null;

        const savedStatus =
          getExamStatus(
            savedAttempt
              ?.exam_status ??
            savedAttempt?.status
          );

        const pausedAttempt =
          savedAttempt &&
          (
            !savedStatus ||
            savedStatus ===
              "pause"
          )
            ? savedAttempt
            : null;

        const restoredAnswers =
          {};

        let pauseId =
          null;

        if (pausedAttempt) {
          pauseId =
            getAttemptId(
              pausedAttempt
            );

          const savedAnswers =
            parseAnswerArray(
              pausedAttempt
                ?.user_answers
            );

          questions.forEach(
            (
              question,
              index
            ) => {
              const answer =
                savedAnswers[
                  index
                ];

              if (
                !normalizeAnswer(
                  answer
                )
              ) {
                return;
              }

              const questionId =
                question?.id ??
                index + 1;

              restoredAnswers[
                questionId
              ] = answer;
            }
          );
        }

        /* ===============================================
           TIMER
        =============================================== */

        const fullDuration =
          getDurationSeconds(
            exam
          );

        if (
          fullDuration <= 0
        ) {
          throw new Error(
            "Exam duration is missing."
          );
        }

        const savedRemaining =
          Number(
            pausedAttempt
              ?.paused_time
          );

        const hasSavedTime =
          Boolean(
            pausedAttempt
          ) &&
          Number.isFinite(
            savedRemaining
          ) &&
          savedRemaining > 0 &&
          savedRemaining <=
            fullDuration;

        return {
          exam,
          examType,
          questions,

          imagePath:
            questionsResult
              ?.img_path ??
            questionsResult
              ?.image_path ??
            questionsResult
              ?.imagePath ??
            "",

          pauseId,

          restoredAnswers,

          initialRemaining:
            hasSavedTime
              ? savedRemaining
              : fullDuration,
        };
      },
      [
        examId,
        uid,
        cid,
      ]
    );

  return {
    loadMockExam,
  };
}