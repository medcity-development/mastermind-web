
"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import useMockExamLoader from "./useMockExamLoader";
import useMockExamAnswers from "./useMockExamAnswers";
import useMockExamPagination from "./useMockExamPagination";
import useMockExamTimer from "./useMockExamTimer";
import useMockExamAttempt from "./useMockExamAttempt";

import {
  readGuestExamHandoff,
  clearGuestExamHandoff,
} from "@/lib/guestExamHandoff";

import {
  timestampToMilliseconds,
} from "@/lib/examAttemptData";

function getRealExamTitle({
  exam,
  fallback = "",
}) {
  const candidates = [
    exam?.exam_name,
    exam?.examName,
    exam?.exam_title,
    exam?.examTitle,
    exam?.test_name,
    exam?.testName,
    exam?.mock_name,
    exam?.mockName,
    exam?.title,
    exam?.name,
    fallback,
  ];

  for (const candidate of candidates) {
    const value = String(candidate ?? "").trim();
    if (value) return value;
  }

  return "";
}

export default function useMockTestExam({
  examId,
  uid,
  cid,
  examTitle = "",
  examType: requestedExamType = "mock",
  governmentExamsSlug = "",
  guestAction = "",
}) {
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [imagePath, setImagePath] = useState("");
  const [examType, setExamType] =
    useState(requestedExamType);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [initialPauseId, setInitialPauseId] =
    useState(null);
  const [attemptStartTime, setAttemptStartTime] =
    useState(0);

  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [restoredPage, setRestoredPage] =
    useState(1);

  const [guestPausePending, setGuestPausePending] =
    useState(false);

  const guestHandoffActionRef = useRef("");
  const guestActionHandledRef = useRef(false);
  const guestPauseSavingRef = useRef(false);

  const answersApi = useMockExamAnswers({
    questions,
    disabled: false,
  });

  const { loadMockExam } = useMockExamLoader({
    examId,
    uid,
    cid,
    examType: requestedExamType,
    skipRestore: guestAction === "pause" || guestAction === "submit",
  });

  const timer = useMockExamTimer({
    submitted,
    saving,
    isPaused: isPaused || guestPausePending,
  });

  const restoreAnswers = answersApi.restoreAnswers;
  const startTimer = timer.startTimer;
  const stopTimer = timer.stopTimer;

  const resolvedExamTitle = useMemo(
    () =>
      getRealExamTitle({
        exam,
        fallback: examTitle,
      }),
    [exam, examTitle]
  );

  /* =====================================================
     LOAD EXAM AND RESTORE GUEST ATTEMPT
  ===================================================== */

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");
        setExam(null);
        setQuestions([]);
        setImagePath("");
        setExamType(requestedExamType);
        setInitialPauseId(null);
        setAttemptStartTime(0);
        setSubmitted(false);
        setSaving(false);
        setIsPaused(false);
        setGuestPausePending(false);
        setRestoredPage(1);

        guestHandoffActionRef.current = "";
        guestActionHandledRef.current = false;
        guestPauseSavingRef.current = false;

        const data = await loadMockExam();
        if (cancelled) return;

        let guestAttempt = null;

        if (
          guestAction === "pause" ||
          guestAction === "submit"
        ) {
          guestAttempt = readGuestExamHandoff({
            examId,
            examType: requestedExamType,
            governmentExamsSlug,
          });
        }

        const matchingGuestAttempt =
          guestAttempt?.action === guestAction
            ? guestAttempt
            : null;

        if (guestAction && !matchingGuestAttempt) {
          throw new Error("Your saved guest attempt is unavailable. Please return to the exam cards and start again.");
        }
        if (matchingGuestAttempt?.questionIds?.length) {
          const ids = (data?.questions ?? []).map((question) => String(question.id));
          const savedIds = matchingGuestAttempt.questionIds.map(String);
          if (ids.length !== savedIds.length || ids.some((id, index) => id !== savedIds[index])) {
            throw new Error("The exam questions changed. Your guest answers have not been submitted.");
          }
        }

        setExam(data?.exam ?? null);
        setQuestions(
          Array.isArray(data?.questions)
            ? data.questions
            : []
        );
        setImagePath(
          String(data?.imagePath ?? "")
        );

        const loadedExamType = String(
          data?.examType ??
            data?.exam?.exam_type ??
            data?.exam?.examType ??
            requestedExamType
        )
          .trim()
          .toLowerCase();

        setExamType(loadedExamType || "mock");

        const loadedPauseId =
          data?.pauseId ??
          null;

        setInitialPauseId(loadedPauseId);

        setAttemptStartTime(
          timestampToMilliseconds(
            matchingGuestAttempt?.startTime
          ) ??
            timestampToMilliseconds(
              data?.startTime
            ) ??
            Date.now()
        );

        restoreAnswers(
          matchingGuestAttempt?.answers ??
            data?.restoredAnswers ??
            {}
        );

        setRestoredPage(
          Number(
            matchingGuestAttempt?.currentPage ??
              data?.currentPage
          ) || 1
        );

        const initialRemaining = Number(
          data?.initialRemaining
        );

        const guestRemaining =
          matchingGuestAttempt
            ? Number(
                matchingGuestAttempt.remainingSeconds
              )
            : NaN;

        const remainingSeconds =
          Number.isFinite(guestRemaining) &&
          guestRemaining >= 0
            ? guestRemaining
            : Number.isFinite(initialRemaining) &&
                initialRemaining >= 0
              ? initialRemaining
              : 0;

        const shouldConfirmGuestPause =
          matchingGuestAttempt?.action === "pause" &&
          guestAction === "pause";

        setGuestPausePending(
          shouldConfirmGuestPause
        );

        startTimer(remainingSeconds);

        if (
          matchingGuestAttempt?.action === "pause" ||
          matchingGuestAttempt?.action === "submit"
        ) {
          guestHandoffActionRef.current =
            matchingGuestAttempt.action;
        }
      } catch (loadError) {
        if (cancelled) return;

        console.error(
          "MOCK EXAM LOAD:",
          loadError
        );
        setExam(null);
        setQuestions([]);
        setError(
          loadError?.message ||
            "Unable to load exam."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (examId && uid && cid) {
      void load();
    } else {
      Promise.resolve().then(() => {
        if (!cancelled) {
          setLoading(false);
          setError(
            "Required exam information is missing."
          );
        }
      });
    }

    return () => {
      cancelled = true;
      stopTimer?.();
    };
  }, [
    examId,
    uid,
    cid,
    guestAction,
    loadMockExam,
    restoreAnswers,
    startTimer,
    stopTimer,
    governmentExamsSlug,
    requestedExamType,
  ]);

  /* =====================================================
     PAGINATION
  ===================================================== */

  const pagination = useMockExamPagination({
    questions,
    disabled:
      saving ||
      submitted ||
      isPaused ||
      guestPausePending ||
      timer.timeEnded,
  });

  const setPaginationPage = pagination.setCurrentPage;
  const paginationPageCount = pagination.totalPages;

  useEffect(() => {
    if (loading) return;

    setPaginationPage(
      Math.max(
        1,
        Math.min(
          restoredPage,
          paginationPageCount
        )
      )
    );
  }, [
    loading,
    restoredPage,
    paginationPageCount,
    setPaginationPage,
  ]);

  /* =====================================================
     ATTEMPT ACTIONS
  ===================================================== */

  const attempt = useMockExamAttempt({
    uid,
    cid,
    examId,
    examType: examType || "mock",
    exam,
    questions,
    answersRef: answersApi.answersRef,
    remainingSeconds: timer.remainingSeconds,
    timerStarted: timer.timerStarted,
    currentPage: pagination.currentPage,
    initialPauseId,
    startTime: attemptStartTime,
    examTitle: resolvedExamTitle,
    governmentExamsSlug,
    guestAction,
    stopTimer: timer.stopTimer,
    onSavingChange: setSaving,
    onSubmittedChange: setSubmitted,
    onPausedChange: setIsPaused,
  });

  const {
    handlePause: pauseAttempt,
    finishExam: finishExamAttempt,
  } = attempt;

  /* =====================================================
     POST-LOGIN GUEST HANDOFF
  ===================================================== */

  useEffect(() => {
    if (
      loading ||
      guestActionHandledRef.current ||
      guestHandoffActionRef.current !== guestAction ||
      (
        guestAction !== "pause" &&
        guestAction !== "submit"
      )
    ) {
      return;
    }

    guestActionHandledRef.current = true;

    if (guestAction === "pause") return;

    if (guestAction === "submit") {
      void finishExamAttempt({
        timeout: timer.remainingSeconds <= 0,
      });
    }
  }, [
    loading,
    guestAction,
    finishExamAttempt,
    timer.remainingSeconds,
  ]);

  async function confirmGuestPause() {
    if (
      !guestPausePending ||
      guestPauseSavingRef.current ||
      saving ||
      submitted ||
      isPaused ||
      timer.timeEnded
    ) {
      return false;
    }

    guestPauseSavingRef.current = true;

    try {
      const success = await pauseAttempt();
      if (success) {
        guestHandoffActionRef.current = "";
        setGuestPausePending(false);
      }
      return success;
    } finally {
      guestPauseSavingRef.current = false;
    }
  }

  function continueGuestExam() {
    if (
      !guestPausePending ||
      saving ||
      guestPauseSavingRef.current
    ) {
      return;
    }

    setGuestPausePending(false);
    guestHandoffActionRef.current = "";
    guestActionHandledRef.current = true;
    clearGuestExamHandoff();
  }

  const interactionDisabled =
    guestPausePending ||
    submitted ||
    saving ||
    isPaused ||
    timer.timeEnded;

  const dashboardDetailsPath =
    `/dashboard/${governmentExamsSlug}` +
    `/mock-tests/${examId}?` +
    new URLSearchParams({
      type: examType || "mock",
      ...(resolvedExamTitle
        ? { title: resolvedExamTitle }
        : {}),
    }).toString();

  return {
    exam,
    examTitle: resolvedExamTitle,
    examType,
    questions,
    imagePath,
    answers: answersApi.answers,
    answeredCount: answersApi.answeredCount,
    unansweredCount: answersApi.unansweredCount,
    loading,
    error,
    ...pagination,
    saving,
    submitted,
    isPaused,
    remainingSeconds: timer.remainingSeconds,
    timeEnded: timer.timeEnded,
    ...attempt,
    handleAnswer: interactionDisabled
      ? () => {}
      : answersApi.handleAnswer,
    guestPausePending,
    confirmGuestPause,
    continueGuestExam,
    interactionDisabled,
    dashboardDetailsPath,
  };
}
