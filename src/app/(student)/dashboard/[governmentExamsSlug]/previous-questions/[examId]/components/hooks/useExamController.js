
"use client";

import {
  useMemo,
  useRef,
  useState,
} from "react";

import {
  normalizeQuestions,
} from "../utils/examUtils";

import useExamScoring from "./useExamScoring";
import useExamRestore from "./useExamRestore";
import useExamTimer from "./useExamTimer";
import useExamAnswers from "./useExamAnswers";
import useExamSubmission from "./useExamSubmission";

import {
  positiveId,
  QUESTIONS_PER_PAGE,
} from "../utils/examControllerHelpers";

export default function useExamController({
  exam,
  examId,
  questions = [],
  uid,
  cid,
  examType = "pqp",
  lastPosition,
  initialPauseId = null,
  governmentExamsSlug = "",
  guestAction = "",
}) {
  /* =====================================================
     EXAM IDENTIFICATION
  ===================================================== */

  const id = examId ?? exam?.id;

  const type = ["pyq", "pqp"].includes(
    String(examType).toLowerCase()
  )
    ? "pqp"
    : String(examType).toLowerCase();

  const isGuestHandoff = [
    "pause",
    "submit",
  ].includes(guestAction);

  /* =====================================================
     EXAM QUESTIONS AND DURATION
  ===================================================== */

  const normalizedQuestions = useMemo(
    () => normalizeQuestions(questions),
    [questions]
  );

  const totalQuestions = normalizedQuestions.length;

  const durationMinutes = Math.max(
    0,
    Number(
      exam?.total_minutes ??
      exam?.duration ??
      exam?.exam_duration ??
      0
    ) || 0
  );

  const totalDurationSeconds = Math.round(
    durationMinutes * 60
  );

  const draftKey =
    `exam_draft_${uid}_${cid}_${type}_${id}`;

  /* =====================================================
     EXAM STATE
  ===================================================== */

  const [currentPage, setCurrentPage] =
    useState(1);

  const [answers, setAnswers] =
    useState({});

  const [
    lastAnsweredQuestionId,
    setLastAnsweredQuestionId,
  ] = useState(null);

  const [submitted, setSubmitted] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [paused, setPaused] =
    useState(false);

  const [saveError, setSaveError] =
    useState("");

  const [
    remainingSeconds,
    setRemainingSeconds,
  ] = useState(totalDurationSeconds);

  const [
    resultModalOpen,
    setResultModalOpen,
  ] = useState(false);

  const [
    submittedResult,
    setSubmittedResult,
  ] = useState(null);

  const [
    restoreReady,
    setRestoreReady,
  ] = useState(
    !positiveId(uid) && !isGuestHandoff
  );

  const [
    interactionFrozen,
    setInteractionFrozen,
  ] = useState(isGuestHandoff);

  /* =====================================================
     EXAM ATTEMPT REFERENCE
  ===================================================== */

  const [initialStartTime] =
    useState(Date.now);

  const lock = useRef(false);

  const attempt = useRef({
    answers: {},
    lastAnsweredQuestionId: null,
    currentPage: 1,
    remainingSeconds: totalDurationSeconds,
    startTime: initialStartTime,
    endTime: null,
    pauseId: initialPauseId,
    boundUid: null,
    submittedResult: null,
    frozen: isGuestHandoff,
  });

  /* =====================================================
     SHARED CONTROLLER CONTEXT
  ===================================================== */

  const ctx = {
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
    lock,
    exam,

    currentPage,
    answers,
    submitted,
    saving,
    paused,
    restoreReady,
    interactionFrozen,

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
  };

  /* =====================================================
     RESTORE SAVED EXAM
  ===================================================== */

  const {
    restoreGuestAttempt,
    continueRestoredExam,
  } = useExamRestore(ctx);

  /* =====================================================
     EXAM TIMER
  ===================================================== */

  useExamTimer(ctx);

  /* =====================================================
     EXAM SCORING
  ===================================================== */

  const {
    totalMark,
    markPerCorrect,
    negativeMarkPerWrong,
    statsFor,
    stats,
    answeredCount,
  } = useExamScoring({
    exam,
    normalizedQuestions,
    answers,
  });

  /* =====================================================
     EXAM SUBMISSION AND GUEST LOGIN
  ===================================================== */

  // beginGuestLogin is declared ONLY here.
  // useExamRestore does not provide this function.

  const {
    save,
    beginGuestLogin,
  } = useExamSubmission({
    ...ctx,
    statsFor,
    totalMark,
    markPerCorrect,
    negativeMarkPerWrong,
  });

  /* =====================================================
     EXAM ANSWERS AND PAGINATION
  ===================================================== */

  const {
    totalPages,
    startIndex,
    pageTo,
    handleAnswer,
  } = useExamAnswers(ctx);

  /* =====================================================
     CONTROLLER RESPONSE
  ===================================================== */

  return {
    currentPage,
    totalPages,
    startIndex,
    lastAnsweredQuestionId,

    endIndex: Math.min(
      startIndex + QUESTIONS_PER_PAGE,
      totalQuestions
    ),

    currentQuestions:
      normalizedQuestions.slice(
        startIndex,
        startIndex + QUESTIONS_PER_PAGE
      ),

    totalQuestions,
    answers,
    answeredCount,

    unansweredCount:
      totalQuestions - answeredCount,

    progress:
      totalQuestions > 0
        ? Math.round(
            (answeredCount / totalQuestions) * 100
          )
        : 0,

    /* EXAM STATUS */

    submitted,
    saving,
    paused,
    saveError,
    restoreReady,
    interactionFrozen,

    /* EXAM RESULT */

    correctCount:
      submitted
        ? submittedResult?.total_correct ??
          stats.correct
        : 0,

    wrongCount:
      submitted
        ? submittedResult?.total_wrong ??
          stats.wrong
        : 0,

    /* EXAM TIMER */

    durationMinutes,
    totalDurationSeconds,
    remainingSeconds,

    elapsedSeconds:
      totalDurationSeconds - remainingSeconds,

    timerFinished:
      restoreReady &&
      totalDurationSeconds > 0 &&
      remainingSeconds === 0,

    /* ANSWER HANDLING */

    handleAnswer,

    /* PAGINATION */

    handlePreviousPage:
      () => pageTo(currentPage - 1),

    handleNextPage:
      () => pageTo(currentPage + 1),

    handlePageChange: pageTo,

    /* EXAM ACTIONS */

    handlePause:
      () => save("pause"),

    handleSubmit:
      () => save("submit"),

    /* GUEST LOGIN AND RESTORATION */

    restoreGuestAttempt,
    continueRestoredExam,
    beginGuestLogin,

    /* INTERACTION CONTROL */

    freezeInteraction: () => {
      attempt.current.frozen = true;
      setInteractionFrozen(true);
    },

    /* RESULT MODAL */

    resultModalOpen,
    submittedResult,

    closeResultModal:
      () => setResultModalOpen(false),
  };
}
