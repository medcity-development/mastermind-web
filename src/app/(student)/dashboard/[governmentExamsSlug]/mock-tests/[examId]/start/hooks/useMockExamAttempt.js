
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  calculateMockResult,
  getAttemptId,
  getDatabaseResult,
  getExamTotalMark,
  postJson,
} from "../utils/mockTestUtils";

import {
  buildMockAttemptPayload,
  getMockExamTitle,
} from "../utils/mockAttemptUtils";

import {
  clearGuestExamHandoff,
} from "@/lib/guestExamHandoff";

export default function useMockExamAttempt({
  uid,
  cid,
  examId,
  examType = "mock",
  exam,
  questions = [],
  answersRef,
  remainingSeconds,
  timerStarted = false,
  currentPage,
  initialPauseId = null,
  startTime = 0,
  examTitle = "",
  governmentExamsSlug = "",
  guestAction = "",
  stopTimer,
  onSavingChange,
  onSubmittedChange,
  onPausedChange,
}) {
  const router = useRouter();

  const requestRef = useRef(false);
  const timeoutHandledRef = useRef(false);

  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [savedPauseId, setPauseId] = useState(null);

  const pauseId =
    savedPauseId || initialPauseId || null;

  const [isPaused, setIsPaused] = useState(false);

  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  const [resultModalOpen, setResultModalOpen] =
    useState(false);

  const [submittedResult, setSubmittedResult] =
    useState(null);

  const [resultLoading, setResultLoading] =
    useState(false);

  const [timeoutStatus, setTimeoutStatus] =
    useState("idle");

  const [timeoutError, setTimeoutError] =
    useState("");

  /* =====================================================
     STATE HELPERS
  ===================================================== */

  const updateSaving = useCallback(
    (value) => {
      setSaving(value);
      onSavingChange?.(value);
    },
    [onSavingChange]
  );

  const updateSubmitted = useCallback(
    (value) => {
      setSubmitted(value);
      onSubmittedChange?.(value);
    },
    [onSubmittedChange]
  );

  const updatePaused = useCallback(
    (value) => {
      setIsPaused(value);
      onPausedChange?.(value);
    },
    [onPausedChange]
  );

  /* =====================================================
     CALCULATE RESULT
  ===================================================== */

  const getCurrentResult = useCallback(
    () =>
      calculateMockResult({
        questions,
        answers: answersRef?.current || {},
      }),
    [questions, answersRef]
  );

  /* =====================================================
     BUILD ATTEMPT PAYLOAD
  ===================================================== */

  const buildPayload = useCallback(
    ({
      examStatus,
      result,
      completedAt,
    }) =>
      buildMockAttemptPayload({
        cid,
        examId,
        examType,
        exam,
        questions,
        answers: answersRef?.current || {},
        remainingSeconds,
        startTime,
        completedAt,
        examStatus,
        result,
      }),
    [
      cid,
      examId,
      examType,
      exam,
      questions,
      answersRef,
      remainingSeconds,
      startTime,
    ]
  );

  /* =====================================================
     FETCH SAVED DATABASE RESULT
  ===================================================== */

  const fetchDatabaseResult = useCallback(
    async (savedAttemptId) => {
      setResultLoading(true);

      try {
        const response = await postJson(
          "/api/exam-attempt/analytics-details",
          {
            cid,
            id: savedAttemptId,
            exam_type: examType,
          }
        );

        const databaseResult =
          getDatabaseResult(response);

        if (!databaseResult) {
          throw new Error(
            "Saved result was not returned."
          );
        }

        return databaseResult;
      } finally {
        setResultLoading(false);
      }
    },
    [cid, examType]
  );

  /* =====================================================
     SAVE PAUSE
  ===================================================== */

  const savePause = useCallback(async () => {
    if (
      requestRef.current ||
      submitted ||
      isPaused ||
      remainingSeconds <= 0
    ) {
      return false;
    }

    requestRef.current = true;

    updateSaving(true);
    setSaveError("");
    setSaveMessage("");

    try {
      const payload = buildPayload({
        examStatus: "pause",
      });

      let savedPauseId = pauseId;

      if (savedPauseId) {
        await postJson(
          "/api/exam-attempt/update",
          {
            ...payload,
            pauseid: String(savedPauseId),
          }
        );
      } else {
        const created = await postJson(
          "/api/exam-attempt/create",
          payload
        );

        savedPauseId = getAttemptId(created);

        if (!savedPauseId) {
          throw new Error(
            "Pause ID was not returned."
          );
        }

        setPauseId(savedPauseId);
      }

      try {
        localStorage.setItem(
          `exam_draft_${uid}_${cid}_${examType}_${examId}`,
          JSON.stringify({
            pauseId: savedPauseId,
            answers: answersRef?.current || {},
            remainingSeconds,
            currentPage,
          })
        );
      } catch (storageError) {
        console.warn(
          "Unable to save local exam draft:",
          storageError
        );
      }

      updatePaused(true);

      clearGuestExamHandoff();

      setSaveMessage(
        "Exam paused successfully."
      );

      stopTimer?.();

      router.replace(
        `/dashboard/${governmentExamsSlug}/mock-tests`
      );

      return true;
    } catch (error) {
      console.error(
        "PAUSE MOCK TEST:",
        error
      );

      setSaveError(
        error?.message ||
        "Unable to pause exam."
      );

      return false;
    } finally {
      requestRef.current = false;
      updateSaving(false);
    }
  }, [
    submitted,
    isPaused,
    remainingSeconds,
    buildPayload,
    pauseId,
    answersRef,
    uid,
    cid,
    examType,
    examId,
    currentPage,
    stopTimer,
    router,
    governmentExamsSlug,
    updatePaused,
    updateSaving,
  ]);

  /* =====================================================
     FINISH EXAM - MANUAL OR TIMEOUT
  ===================================================== */

  const finishExam = useCallback(
    async ({ timeout = false } = {}) => {
      if (
        requestRef.current ||
        submitted
      ) {
        return false;
      }

      if (
        !timeout &&
        remainingSeconds <= 0
      ) {
        return false;
      }

      requestRef.current = true;

      updateSaving(true);
      setSaveError("");
      setSaveMessage("");

      if (timeout) {
        setTimeoutStatus("saving");
        setTimeoutError("");
      }

      try {
        const calculated = getCurrentResult();

        /*
         * Never save an unverified score.
         *
         * This catches:
         * - Missing options
         * - Invalid answer keys
         * - Invalid selected options
         * - Incorrect A-D / A-E mappings
         */

        if (!calculated.scoreVerified) {
          const firstError =
            calculated.validationErrors?.[0];

          throw new Error(
            firstError
              ? `Cannot verify question ${firstError.questionId}: ${firstError.reason}.`
              : "Cannot verify exam score. Please contact support."
          );
        }

        const finalPayload = buildPayload({
          examStatus: "finish",
          result: calculated,
          completedAt: Date.now(),
        });

        let finalPauseId = pauseId;

        /* ---------------------------------------------
           UPDATE EXISTING ATTEMPT
        --------------------------------------------- */

        if (finalPauseId) {
          await postJson(
            "/api/exam-attempt/update",
            {
              ...finalPayload,
              pauseid: String(finalPauseId),
            }
          );
        } else {
          /* -------------------------------------------
             CREATE NEW ATTEMPT
          ------------------------------------------- */

          const createResult = await postJson(
            "/api/exam-attempt/create",
            finalPayload
          );

          finalPauseId = getAttemptId(
            createResult
          );

          if (!finalPauseId) {
            throw new Error(
              "Saved attempt ID was not returned."
            );
          }

          setPauseId(finalPauseId);
        }

        /* ---------------------------------------------
           SUBMISSION SUCCESS
        --------------------------------------------- */

        updateSubmitted(true);
        updatePaused(false);

        stopTimer?.();

        try {
          clearGuestExamHandoff();

          localStorage.removeItem(
            `exam_draft_${uid}_${cid}_${examType}_${examId}`
          );
        } catch (storageError) {
          console.warn(
            "Unable to clear exam storage:",
            storageError
          );
        }

        /* ---------------------------------------------
           LOCAL RESULT
        --------------------------------------------- */

        const localResult = {
          id: finalPauseId,
          pauseid: finalPauseId,

          exam_id: examId,
          exam_type: examType,
          exam_status: "finish",

          exam_name: getMockExamTitle({
            exam,
            fallback: examTitle,
          }),

          total_questions: questions.length,

          total_mark: getExamTotalMark(
            exam,
            questions.length
          ),

          answer_array:
            calculated.answerArray,

          user_answers:
            calculated.userAnswers,

          total_attempted:
            calculated.totalAttempted,

          total_correct:
            calculated.totalCorrect,

          total_wrong:
            calculated.totalWrong,

          user_score:
            calculated.userScore,

          minus_mark:
            calculated.minusMark,
        };

        let resultForModal = localResult;
        let resultDetailsLoaded = true;

        /* ---------------------------------------------
           LOAD DATABASE ANALYTICS
        --------------------------------------------- */

        try {
          const databaseResult =
            await fetchDatabaseResult(
              finalPauseId
            );

          resultForModal = {
            ...databaseResult,
            ...localResult,
            id: finalPauseId,
            pauseid: finalPauseId,
          };
        } catch (resultError) {
          console.error(
            "RESULT DETAILS ERROR:",
            resultError
          );

          resultDetailsLoaded = false;

          setSaveMessage(
            "Exam submitted. Saved analytics details are unavailable."
          );
        }

        setSubmittedResult(
          resultForModal
        );

        if (resultDetailsLoaded) {
          setSaveMessage(
            timeout
              ? "Time is over. Exam submitted automatically."
              : "Exam submitted successfully."
          );
        }

        if (timeout) {
          setTimeoutStatus("success");
        }

        setResultModalOpen(true);

        return true;
      } catch (error) {
        console.error(
          "FINISH MOCK TEST:",
          error
        );

        const message =
          error?.message ||
          "Unable to submit exam.";

        setSaveError(message);

        if (timeout) {
          setTimeoutStatus("error");
          setTimeoutError(message);
        }

        return false;
      } finally {
        requestRef.current = false;
        updateSaving(false);
      }
    },
    [
      submitted,
      remainingSeconds,
      getCurrentResult,
      buildPayload,
      pauseId,
      exam,
      examId,
      examTitle,
      examType,
      questions.length,
      uid,
      cid,
      fetchDatabaseResult,
      stopTimer,
      updateSaving,
      updateSubmitted,
      updatePaused,
    ]
  );

  /* =====================================================
     AUTO SUBMIT WHEN TIMER EXPIRES
  ===================================================== */

  useEffect(() => {
    if (
      !timerStarted ||
      remainingSeconds !== 0 ||
      submitted ||
      saving ||
      isPaused ||
      !exam ||
      !questions.length ||
      timeoutHandledRef.current
    ) {
      return;
    }

    // Prevent duplicate submission attempts.

    timeoutHandledRef.current = true;

    void finishExam({
      timeout: true,
    });
  }, [
    timerStarted,
    remainingSeconds,
    submitted,
    saving,
    isPaused,
    exam,
    questions.length,
    finishExam,
  ]);

  /* =====================================================
     RETRY FAILED TIMEOUT SUBMISSION
  ===================================================== */

  const retryTimeoutSubmit = useCallback(
    async () => {
      if (
        timeoutStatus !== "error" ||
        requestRef.current
      ) {
        return false;
      }

      return await finishExam({
        timeout: true,
      });
    },
    [
      timeoutStatus,
      finishExam,
    ]
  );

  const openTimeoutResult = useCallback(
    () => {
      if (
        timeoutStatus === "success" &&
        submittedResult
      ) {
        setResultModalOpen(true);
      }
    },
    [
      timeoutStatus,
      submittedResult,
    ]
  );

  /* =====================================================
     PAUSE / RESUME
  ===================================================== */

  const handlePause = useCallback(
    async () => {
      if (
        submitted ||
        saving ||
        requestRef.current ||
        remainingSeconds <= 0
      ) {
        return false;
      }

      if (isPaused) {
        updatePaused(false);

        setSaveMessage(
          "Exam resumed."
        );

        return true;
      }

      return await savePause();
    },
    [
      submitted,
      saving,
      remainingSeconds,
      isPaused,
      updatePaused,
      savePause,
    ]
  );

  /* =====================================================
     MANUAL SUBMIT
  ===================================================== */

  const handleSubmit = useCallback(
    async () => {
      if (
        saving ||
        submitted ||
        requestRef.current ||
        remainingSeconds <= 0
      ) {
        return false;
      }

      return await finishExam({
        timeout: false,
      });
    },
    [
      saving,
      submitted,
      remainingSeconds,
      finishExam,
    ]
  );

  /* =====================================================
     RESULT CLOSE
  ===================================================== */

  function handleResultClose() {
    handleViewAnalysis();
  }

  /* =====================================================
     VIEW ANALYSIS
  ===================================================== */

  function handleViewAnalysis() {
    const savedAttemptId =
      pauseId ||
      getAttemptId(submittedResult);

    if (!savedAttemptId) {
      setSaveError(
        "Saved attempt ID is missing. Unable to open exam analysis."
      );

      return;
    }

    const resolvedExamTitle =
      getMockExamTitle({
        exam,
        submittedResult,
        fallback: examTitle,
      });

    const params = new URLSearchParams({
      attemptId: String(
        savedAttemptId
      ),

      examType,

      ...(resolvedExamTitle
        ? {
            title: resolvedExamTitle,
          }
        : {}),
    });

    setResultModalOpen(false);

    router.push(
      `/dashboard/${governmentExamsSlug}/exam-analysis?${params.toString()}`
    );
  }

  /* =====================================================
     RETURN
  ===================================================== */

  return {
    saving,
    submitted,
    pauseId,
    isPaused,

    saveMessage,
    saveError,

    resultModalOpen,
    submittedResult,
    resultLoading,

    handlePause,
    handleSubmit,

    handleResultClose,
    handleViewAnalysis,

    finishExam,

    timeoutStatus,
    timeoutError,
    retryTimeoutSubmit,
    openTimeoutResult,
  };
}
