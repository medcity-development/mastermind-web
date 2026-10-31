
"use client";

import { useEffect, useCallback } from "react";

import {
  normalizeOptionAnswer,
  isValidOptionAnswer,
} from "../utils/examUtils";

import {
  getAttemptId,
  parseAnswers,
  savedPausedTimeToSeconds,
  timestampToMilliseconds,
} from "@/lib/examAttemptData";

import {
  QUESTIONS_PER_PAGE,
  positiveId,
  isFailed,
  getQuestionIndex,
  getLastAnsweredIndex,
  clampPage,
} from "../utils/examControllerHelpers";

/* =====================================================
   HELPERS
===================================================== */

function validTimestamp(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const timestamp = Number(value);

  return Number.isFinite(timestamp) && timestamp > 0
    ? timestamp
    : null;
}

function validPage(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const page = Number(value);

  return Number.isSafeInteger(page) && page > 0
    ? page
    : null;
}

function clampRemaining(value, duration) {
  const seconds = Number(value);

  if (!Number.isFinite(seconds)) {
    return duration;
  }

  return Math.min(duration, Math.max(0, seconds));
}

function restoreAnswersFromSource(questions, source) {
  const restored = {};

  if (!source || typeof source !== "object") {
    return restored;
  }

  questions.forEach((question, index) => {
    const rawValue =
      source[question.id] ??
      source[String(question.id)] ??
      source[index];

    const value = normalizeOptionAnswer(rawValue);

    if (isValidOptionAnswer(question, value)) {
      restored[question.id] = value;
    }
  });

  return restored;
}

/* =====================================================
   MAIN HOOK
===================================================== */

export default function useExamRestore(ctx) {
  const {
    id,
    cid,
    uid,
    type,
    draftKey,
    normalizedQuestions,
    totalQuestions,
    totalDurationSeconds,
    initialPauseId,
    isGuestHandoff,
    governmentExamsSlug,
    attempt,
    setAnswers,
    setLastAnsweredQuestionId,
    setCurrentPage,
    setRemainingSeconds,
    setSubmitted,
    setPaused,
    setSaving,
    setSaveError,
    setSubmittedResult,
    setResultModalOpen,
    setInteractionFrozen,
    setRestoreReady,
    lock,
  } = ctx;

  /* =====================================================
     RESTORE BACKEND PAUSED EXAM
  ===================================================== */

  useEffect(() => {
    if (isGuestHandoff) {
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    async function restoreExam() {
      let savedAttempt = null;
      let savedDraft = null;
      let resolvedPauseId = null;

      setRestoreReady(false);

      /* -----------------------------------------------
         FETCH SAVED BACKEND ATTEMPT
      ------------------------------------------------ */

      if (positiveId(uid)) {
        try {
          const query = new URLSearchParams({
            cid: String(cid),
            exam_id: String(id),
          });

          const response = await fetch(
            `/api/pyq-attempt?${query.toString()}`,
            {
              method: "GET",
              cache: "no-store",
              signal: controller.signal,
            }
          );

          if (!response.ok) {
            throw new Error(
              `Unable to load saved progress (${response.status}).`
            );
          }

          const result = await response.json();

          if (isFailed(result?.status)) {
            throw new Error(
              result?.message ||
                "Unable to load saved progress."
            );
          }

          savedAttempt = result?.paused ?? null;

          resolvedPauseId = positiveId(
            getAttemptId(savedAttempt)
          );

          if (
            positiveId(initialPauseId) &&
            resolvedPauseId !== positiveId(initialPauseId)
          ) {
            throw new Error(
              "This paused attempt is no longer available."
            );
          }
        } catch (error) {
          if (cancelled || error?.name === "AbortError") {
            return;
          }

          setSaveError(
            error?.message ||
              "Unable to load saved progress."
          );

          setRestoreReady(false);
          return;
        }
      }

      /* -----------------------------------------------
         LOAD MATCHING LOCAL DRAFT
      ------------------------------------------------ */

      if (resolvedPauseId) {
        try {
          const stored = localStorage.getItem(draftKey);

          if (stored) {
            const draft = JSON.parse(stored);

            if (
              draft &&
              positiveId(draft.pauseId) === resolvedPauseId &&
              (!draft.boundUid ||
                positiveId(draft.boundUid) === positiveId(uid))
            ) {
              savedDraft = draft;
            }
          }
        } catch {
          // Backend data remains the source of truth.
        }
      }

      if (cancelled) {
        return;
      }

      /* -----------------------------------------------
         RESTORE ANSWERS
      ------------------------------------------------ */

      let restoredAnswers = {};

      if (savedAttempt) {
        const backendAnswers = parseAnswers(
          savedAttempt.user_answers ??
            savedAttempt.answers
        );

        restoredAnswers = restoreAnswersFromSource(
          normalizedQuestions,
          backendAnswers
        );
      } else if (savedDraft?.answers) {
        restoredAnswers = restoreAnswersFromSource(
          normalizedQuestions,
          savedDraft.answers
        );
      }

      /* -----------------------------------------------
         RESTORE LAST QUESTION
      ------------------------------------------------ */

      const backendPositionRaw =
        savedAttempt?.lastposition ??
        savedAttempt?.last_position;

      const backendPosition = Number(backendPositionRaw);

      const backendIndex =
        backendPositionRaw !== null &&
        backendPositionRaw !== undefined &&
        backendPositionRaw !== "" &&
        Number.isSafeInteger(backendPosition) &&
        backendPosition > 0 &&
        backendPosition <= totalQuestions
          ? backendPosition - 1
          : -1;

      const draftIndex = getQuestionIndex(
        normalizedQuestions,
        savedDraft?.lastAnsweredQuestionId
      );

      const answeredIndex = getLastAnsweredIndex(
        normalizedQuestions,
        restoredAnswers
      );

      const lastIndex =
        backendIndex >= 0
          ? backendIndex
          : draftIndex >= 0
            ? draftIndex
            : answeredIndex;

      const lastQuestionId =
        lastIndex >= 0
          ? normalizedQuestions[lastIndex]?.id ?? null
          : null;

      /* -----------------------------------------------
         RESTORE QUESTION PAGE
      ------------------------------------------------ */

      const backendPage = validPage(
        savedAttempt?.current_page ??
          savedAttempt?.currentPage
      );

      const draftPage = validPage(
        savedDraft?.currentPage
      );

      const fallbackPage =
        lastIndex >= 0
          ? Math.floor(lastIndex / QUESTIONS_PER_PAGE) + 1
          : 1;

      const restoredPage = clampPage(
        backendPage ?? draftPage ?? fallbackPage,
        totalQuestions
      );

      /* -----------------------------------------------
         RESTORE REMAINING TIME
      ------------------------------------------------ */

      const backendTime = savedAttempt?.paused_time;
      const draftTime = savedDraft?.remainingSeconds;

      let restoredRemaining = totalDurationSeconds;

      if (
        backendTime !== undefined &&
        backendTime !== null &&
        backendTime !== ""
      ) {
        const seconds = savedPausedTimeToSeconds(
          backendTime,
          totalDurationSeconds
        );

        restoredRemaining = clampRemaining(
          seconds,
          totalDurationSeconds
        );
      } else if (
        draftTime !== undefined &&
        draftTime !== null &&
        draftTime !== ""
      ) {
        restoredRemaining = clampRemaining(
          draftTime,
          totalDurationSeconds
        );
      }

      /* -----------------------------------------------
         RESTORE START TIME
      ------------------------------------------------ */

      const backendStartTime = validTimestamp(
        timestampToMilliseconds(
          savedAttempt?.start_time ??
            savedAttempt?.startTime ??
            savedAttempt?.started_at
        )
      );

      const draftStartTime = validTimestamp(
        savedDraft?.startTime
      );

      const startTime =
        backendStartTime ??
        draftStartTime ??
        Date.now();

      /* -----------------------------------------------
         RESTORE ATTEMPT REF
      ------------------------------------------------ */

      attempt.current = {
        answers: restoredAnswers,
        lastAnsweredQuestionId: lastQuestionId,
        currentPage: restoredPage,
        remainingSeconds: restoredRemaining,
        startTime,
        endTime: null,
        pauseId: resolvedPauseId,
        boundUid: positiveId(uid),
        submittedResult: null,
        frozen: false,
      };

      /* -----------------------------------------------
         SYNCHRONIZE REACT STATE
      ------------------------------------------------ */

      setAnswers(restoredAnswers);
      setLastAnsweredQuestionId(lastQuestionId);
      setCurrentPage(restoredPage);
      setRemainingSeconds(restoredRemaining);

      setSubmitted(false);
      setPaused(false);
      setSaving(false);
      setSaveError("");
      setSubmittedResult(null);
      setResultModalOpen(false);
      setInteractionFrozen(false);
      setRestoreReady(true);
    }

    void restoreExam();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [
    id,
    cid,
    uid,
    type,
    draftKey,
    normalizedQuestions,
    totalQuestions,
    totalDurationSeconds,
    initialPauseId,
    isGuestHandoff,
    attempt,
    setAnswers,
    setLastAnsweredQuestionId,
    setCurrentPage,
    setRemainingSeconds,
    setSubmitted,
    setPaused,
    setSaving,
    setSaveError,
    setSubmittedResult,
    setResultModalOpen,
    setInteractionFrozen,
    setRestoreReady,
  ]);

  /* =====================================================
     RESTORE GUEST EXAM AFTER LOGIN
  ===================================================== */

  const restoreGuestAttempt = useCallback(
    (saved) => {
      /* -----------------------------------------------
         VALIDATE EXAM IDENTITY
      ------------------------------------------------ */

      if (
        String(saved?.examId) !== String(id) ||
        String(saved?.examType ?? "").toLowerCase() !==
          String(type).toLowerCase() ||
        String(saved?.governmentExamsSlug) !==
          String(governmentExamsSlug) ||
        Number(saved?.cid) !== Number(cid)
      ) {
        throw new Error(
          "Saved exam does not match this test."
        );
      }

      /* -----------------------------------------------
         VALIDATE SAVED ANSWERS
      ------------------------------------------------ */

      if (
        !saved.answers ||
        typeof saved.answers !== "object" ||
        Array.isArray(saved.answers)
      ) {
        throw new Error(
          "Saved answers are invalid."
        );
      }

      /* -----------------------------------------------
         VALIDATE QUESTION PAPER
      ------------------------------------------------ */

      const questionIds = normalizedQuestions.map(
        (question) => String(question.id)
      );

      if (
        !Array.isArray(saved.questionIds) ||
        JSON.stringify(saved.questionIds) !==
          JSON.stringify(questionIds)
      ) {
        throw new Error(
          "The question paper changed. Saved progress cannot be restored safely."
        );
      }

      /* -----------------------------------------------
         VALIDATE TIMING
      ------------------------------------------------ */

      const savedRemaining = Number(
        saved.remainingSeconds
      );

      const savedStartTime = validTimestamp(
        saved.startTime
      );

      if (
        !Number.isFinite(savedRemaining) ||
        savedRemaining < 0 ||
        savedRemaining > totalDurationSeconds ||
        savedStartTime === null
      ) {
        throw new Error(
          "Saved exam timing is invalid."
        );
      }

      /* -----------------------------------------------
         VALIDATE LOGGED-IN USER
      ------------------------------------------------ */

      const currentUid = positiveId(uid);

      if (!currentUid) {
        throw new Error(
          "Please complete login before restoring this exam."
        );
      }

      if (
        saved.boundUid &&
        positiveId(saved.boundUid) !== currentUid
      ) {
        throw new Error(
          "This attempt belongs to another account."
        );
      }

      /* -----------------------------------------------
         RESTORE ANSWERS
      ------------------------------------------------ */

      const restoredAnswers = restoreAnswersFromSource(
        normalizedQuestions,
        saved.answers
      );

      /* -----------------------------------------------
         RESTORE LAST QUESTION
      ------------------------------------------------ */

      const savedQuestionIndex = getQuestionIndex(
        normalizedQuestions,
        saved.lastAnsweredQuestionId
      );

      const lastIndex =
        savedQuestionIndex >= 0
          ? savedQuestionIndex
          : getLastAnsweredIndex(
              normalizedQuestions,
              restoredAnswers
            );

      const lastQuestionId =
        lastIndex >= 0
          ? normalizedQuestions[lastIndex]?.id ?? null
          : null;

      /* -----------------------------------------------
         RESTORE CURRENT PAGE
      ------------------------------------------------ */

      const savedPage = validPage(saved.currentPage);

      const fallbackPage =
        lastIndex >= 0
          ? Math.floor(lastIndex / QUESTIONS_PER_PAGE) + 1
          : 1;

      const restoredPage = clampPage(
        savedPage ?? fallbackPage,
        totalQuestions
      );

      /* -----------------------------------------------
         RESTORE ATTEMPT REF
      ------------------------------------------------ */

      const submittedResult =
        saved.submittedResult ?? null;

      attempt.current = {
        answers: restoredAnswers,
        lastAnsweredQuestionId: lastQuestionId,
        currentPage: restoredPage,
        remainingSeconds: savedRemaining,
        startTime: savedStartTime,
        endTime: saved.endTime ?? null,
        pauseId: positiveId(saved.pauseId),
        boundUid: currentUid,
        submittedResult,
        frozen: true,
      };

      /* -----------------------------------------------
         SYNCHRONIZE REACT STATE
      ------------------------------------------------ */

      setAnswers(restoredAnswers);
      setLastAnsweredQuestionId(lastQuestionId);
      setCurrentPage(restoredPage);
      setRemainingSeconds(savedRemaining);

      setSaving(false);
      setSaveError("");
      setPaused(false);

      setInteractionFrozen(true);
      setRestoreReady(true);

      if (submittedResult) {
        setSubmitted(true);
        setSubmittedResult(submittedResult);
        setResultModalOpen(true);
      } else {
        setSubmitted(false);
        setSubmittedResult(null);
        setResultModalOpen(false);
      }

      return saved;
    },
    [
      id,
      type,
      governmentExamsSlug,
      cid,
      uid,
      normalizedQuestions,
      totalDurationSeconds,
      totalQuestions,
      attempt,
      setAnswers,
      setLastAnsweredQuestionId,
      setCurrentPage,
      setRemainingSeconds,
      setSaving,
      setSaveError,
      setPaused,
      setInteractionFrozen,
      setRestoreReady,
      setSubmitted,
      setSubmittedResult,
      setResultModalOpen,
    ]
  );

  /* =====================================================
     CONTINUE RESTORED EXAM
  ===================================================== */

  const continueRestoredExam = useCallback(() => {
    if (
      attempt.current?.submittedResult ||
      lock.current
    ) {
      return;
    }

    attempt.current.frozen = false;
    setInteractionFrozen(false);
  }, [attempt, lock, setInteractionFrozen]);

  /* =====================================================
     RETURN
  ===================================================== */

  return {
    restoreGuestAttempt,
    continueRestoredExam,
  };
}
