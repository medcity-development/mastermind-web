
"use client";

import { useRouter } from "next/navigation";

import {
  getAttemptId,
} from "@/lib/examAttemptData";

import {
  saveGuestExamHandoff,
  guestExamLoginRedirectPath,
} from "@/lib/guestExamHandoff";

import {
  QUESTIONS_PER_PAGE,
  positiveId,
  getQuestionIndex,
  postAttempt,
} from "../utils/examControllerHelpers";

export default function useExamSubmission(ctx) {
  const router = useRouter();

  const {
    attempt,
    lock,
    restoreReady,
    submitted,
    paused,
    uid,
    totalDurationSeconds,
    setResultModalOpen,
    setSaving,
    setSaveError,
    setInteractionFrozen,
    statsFor,
    normalizedQuestions,
    id,
    type,
    cid,
    governmentExamsSlug,
    totalQuestions,
    totalMark,
    markPerCorrect,
    negativeMarkPerWrong,
    draftKey,
    setPaused,
    setSubmittedResult,
    setSubmitted,
    exam,
  } = ctx;

  function checkpoint(action) {
    return saveGuestExamHandoff({
      ...attempt.current,
      examId: id,
      examType: type,
      cid,
      governmentExamsSlug,
      action,
      currentPage: attempt.current.currentPage,
      questionIds: normalizedQuestions.map(
        (question) => String(question.id)
      ),
    });
  }

  function beginGuestLogin(action) {
    if (
      positiveId(uid) ||
      !["pause", "submit"].includes(action) ||
      lock.current
    ) {
      return false;
    }

    try {
      checkpoint(action);

      attempt.current.frozen = true;
      setInteractionFrozen(true);
      setSaveError("");

      router.push(
        `/login?redirect=${encodeURIComponent(
          guestExamLoginRedirectPath(action)
        )}`
      );

      return true;
    } catch (error) {
      setSaveError(
        error?.message ||
        "Unable to preserve your exam progress."
      );

      return false;
    }
  }

  async function save(action) {
    if (!["pause", "submit"].includes(action)) {
      return false;
    }

    if (!positiveId(uid)) {
      // Do not save a guest attempt to the backend.
      // ExamClient must show the login-required modal
      // and invoke beginGuestLogin after confirmation.
      return false;
    }

    if (
      lock.current ||
      !restoreReady ||
      submitted ||
      paused ||
      (
        action === "pause" &&
        totalDurationSeconds > 0 &&
        attempt.current.remainingSeconds <= 0
      )
    ) {
      if (
        submitted &&
        attempt.current.submittedResult
      ) {
        setResultModalOpen(true);
        return true;
      }

      return false;
    }

    lock.current = true;
    setSaving(true);
    setSaveError("");

    const wasFrozen = attempt.current.frozen;

    attempt.current.frozen = true;
    setInteractionFrozen(true);

    if (action === "submit") {
      attempt.current.endTime ??= Date.now();
    }

    let success = false;

    try {
      const current = attempt.current;

      const resultStats = statsFor(current.answers);

      if (
        action === "submit" &&
        !resultStats.scoreVerified
      ) {
        const issue =
          resultStats.validationErrors?.[0];

        throw new Error(
          issue
            ? `Question ${issue.questionId}: ${issue.reason}`
            : "Unable to verify exam answers."
        );
      }

      const lastAnsweredIndex = getQuestionIndex(
        normalizedQuestions,
        current.lastAnsweredQuestionId
      );

      const resumePosition =
        lastAnsweredIndex >= 0
          ? lastAnsweredIndex + 1
          : (
              current.currentPage - 1
            ) * QUESTIONS_PER_PAGE + 1;

      const payload = {
        cid,
        exam_id: id,
        exam_type: type,
        lastposition: resumePosition,

        total_questions: totalQuestions,
        total_mark: totalMark,

        remaining_seconds: Math.max(
          0,
          Math.floor(current.remainingSeconds)
        ),

        start_time: current.startTime,

        ...(action === "submit"
          ? { end_time: current.endTime }
          : {}),

        answer_array: resultStats.answerArray,
        user_answers: resultStats.userAnswers,

        total_attempted: resultStats.attempted,
        total_correct: resultStats.correct,
        total_wrong: resultStats.wrong,

        user_score: resultStats.score,
        minus_mark: resultStats.negativeMark,

        __scoring: {
          markPerCorrect,
          negativeMarkPerWrong,
        },
      };

      const isResuming = Boolean(
        positiveId(current.pauseId)
      );

      const result = await postAttempt(
        "/api/pyq-attempt",
        {
          ...payload,
          action: isResuming
            ? "update"
            : "create",
          exam_status: action === "submit"
            ? "finish"
            : "pause",

          ...(isResuming
            ? { pauseid: current.pauseId }
            : {}),
        }
      );

      if (!isResuming) {
        const savedId = positiveId(
          getAttemptId(result)
        );

        if (!savedId) {
          throw new Error(
            "The backend did not return an attempt ID. " +
            "Do not retry until the saved attempt is verified."
          );
        }

        current.pauseId = savedId;
        current.boundUid = Number(uid);
      }

      success = true;

      if (action === "pause") {
        try {
          localStorage.setItem(
            draftKey,
            JSON.stringify({
              answers: current.answers,
              lastAnsweredQuestionId:
                current.lastAnsweredQuestionId,
              pauseId: current.pauseId,
              remainingSeconds:
                current.remainingSeconds,
              currentPage: current.currentPage,
              startTime: current.startTime,
            })
          );
        } catch (error) {
          console.warn(
            "Unable to cache paused exam:",
            error
          );
        }

        setPaused(true);
      } else {
        try {
          localStorage.removeItem(draftKey);
        } catch (error) {
          console.warn(
            "Unable to clear finished draft:",
            error
          );
        }

        const finalResult = {
          ...payload,
          ...(result.savedResult ?? {}),

          total_attempted: resultStats.attempted,
          total_correct: resultStats.correct,
          total_wrong: resultStats.wrong,
          user_score: resultStats.score,
          minus_mark: resultStats.negativeMark,

          id: current.pauseId,
          pauseid: current.pauseId,

          exam_status: "finish",
          exam_name:
            exam?.exam_name ??
            exam?.title ??
            "",
          status: true,
        };

        current.submittedResult = finalResult;

        setSubmittedResult(finalResult);
        setSubmitted(true);
        setResultModalOpen(true);
      }

      return result;
    } catch (error) {
      setSaveError(
        error?.message ||
        "Unable to save this exam. Please retry."
      );

      return false;
    } finally {
      lock.current = false;
      setSaving(false);

      if (!success) {
        attempt.current.frozen = wasFrozen;
        setInteractionFrozen(wasFrozen);
      }
    }
  }

  return {
    save,
    beginGuestLogin,
  };
}
