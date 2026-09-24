"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  formatExamArray,
  normalizeQuestions,
} from "../utils/examUtils";

const QUESTIONS_PER_PAGE = 10;

export default function useExamController({
  exam,
  questions = [],
  uid,
  cid,
  examType,
  lastPosition,
  initialPauseId = null,
}) {
  /* =========================================================
     PAGE
  ========================================================= */

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  /* =========================================================
     ANSWERS
  ========================================================= */

  const [
    answers,
    setAnswers,
  ] = useState({});

  /* =========================================================
     SUBMIT STATE
  ========================================================= */

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  /* =========================================================
     PAUSE ID
  ========================================================= */

  const [
    pauseId,
    setPauseId,
  ] = useState(
    initialPauseId
  );

  /* =========================================================
     QUESTIONS
  ========================================================= */

  const normalizedQuestions =
    useMemo(() => {
      return normalizeQuestions(
        questions
      );
    }, [questions]);

  const totalQuestions =
    normalizedQuestions.length;

  /* =========================================================
     EXAM DURATION
  ========================================================= */

  /*
   * Most of your exam APIs use total_minutes.
   *
   * Fallback fields are included so this component
   * also works if another exam endpoint returns
   * duration / exam_duration.
   */

  const durationMinutes =
    Number(
      exam?.total_minutes ??
        exam?.duration ??
        exam?.exam_duration ??
        0
    ) || 0;

  const totalDurationSeconds =
    durationMinutes * 60;

  const [
    remainingSeconds,
    setRemainingSeconds,
  ] = useState(
    totalDurationSeconds
  );

  const [
    timerFinished,
    setTimerFinished,
  ] = useState(false);

  /* =========================================================
     RESET TIMER WHEN EXAM CHANGES
  ========================================================= */

  useEffect(() => {
    setRemainingSeconds(
      totalDurationSeconds
    );

    setTimerFinished(false);
  }, [
    exam?.id,
    totalDurationSeconds,
  ]);

  /* =========================================================
     TIMER COUNTDOWN
  ========================================================= */

  useEffect(() => {
    /*
     * No duration available.
     */

    if (
      totalDurationSeconds <= 0
    ) {
      return;
    }

    /*
     * Stop timer after submit.
     */

    if (submitted) {
      return;
    }

    /*
     * Timer already ended.
     */

    if (timerFinished) {
      return;
    }

    const intervalId =
      window.setInterval(() => {
        setRemainingSeconds(
          (previousSeconds) => {
            if (
              previousSeconds <= 1
            ) {
              window.clearInterval(
                intervalId
              );

              setTimerFinished(
                true
              );

              return 0;
            }

            return (
              previousSeconds - 1
            );
          }
        );
      }, 1000);

    return () => {
      window.clearInterval(
        intervalId
      );
    };
  }, [
    totalDurationSeconds,
    submitted,
    timerFinished,
  ]);

  /* =========================================================
     ELAPSED TIME
  ========================================================= */

  const elapsedSeconds =
    Math.max(
      totalDurationSeconds -
        remainingSeconds,
      0
    );

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalQuestions /
          QUESTIONS_PER_PAGE
      )
    );

  const startIndex =
    (currentPage - 1) *
    QUESTIONS_PER_PAGE;

  const endIndex =
    startIndex +
    QUESTIONS_PER_PAGE;

  const currentQuestions =
    normalizedQuestions.slice(
      startIndex,
      endIndex
    );

  /* =========================================================
     ANSWER COUNTS
  ========================================================= */

  const answeredCount =
    Object.keys(
      answers
    ).length;

  const unansweredCount =
    Math.max(
      totalQuestions -
        answeredCount,
      0
    );

  const progress =
    totalQuestions > 0
      ? Math.round(
          (answeredCount /
            totalQuestions) *
            100
        )
      : 0;

  /* =========================================================
     SCORE
  ========================================================= */

  const correctCount =
    useMemo(() => {
      if (!submitted) {
        return 0;
      }

      return normalizedQuestions.filter(
        (question) =>
          answers[
            question.id
          ] ===
          question.answerkey
      ).length;
    }, [
      submitted,
      answers,
      normalizedQuestions,
    ]);

  const wrongCount =
    submitted
      ? answeredCount -
        correctCount
      : 0;

  /* =========================================================
     BACKEND ANSWER ARRAY
  ========================================================= */

  const answerArray =
    useMemo(() => {
      return normalizedQuestions.map(
        (question) =>
          question.answerkey ??
          question.answer ??
          0
      );
    }, [
      normalizedQuestions,
    ]);

  /* =========================================================
     USER ANSWER ARRAY
  ========================================================= */

  const userAnswers =
    useMemo(() => {
      return normalizedQuestions.map(
        (question) =>
          answers[
            question.id
          ] ?? 0
      );
    }, [
      normalizedQuestions,
      answers,
    ]);

  /* =========================================================
     SCROLL
  ========================================================= */

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =========================================================
     ANSWER
  ========================================================= */

  function handleAnswer(
    questionId,
    optionKey
  ) {
    if (submitted) {
      return;
    }

    /*
     * Don't allow answering when
     * exam time has finished.
     */

    if (timerFinished) {
      return;
    }

    setAnswers(
      (previous) => ({
        ...previous,

        [questionId]:
          optionKey,
      })
    );
  }

  /* =========================================================
     PREVIOUS PAGE
  ========================================================= */

  function handlePreviousPage() {
    setCurrentPage(
      (previous) =>
        Math.max(
          previous - 1,
          1
        )
    );

    scrollToTop();
  }

  /* =========================================================
     NEXT PAGE
  ========================================================= */

  function handleNextPage() {
    setCurrentPage(
      (previous) =>
        Math.min(
          previous + 1,
          totalPages
        )
    );

    scrollToTop();
  }

  /* =========================================================
     PAGE CHANGE
  ========================================================= */

  function handlePageChange(
    page
  ) {
    setCurrentPage(page);

    scrollToTop();
  }

  /* =========================================================
     COMMON BACKEND PAYLOAD
  ========================================================= */

  function buildAttemptPayload() {
    return {
      uid,
      cid,

      exam_status:
        "pause",

      lastposition:
        lastPosition,

      exam_id:
        exam?.id,

      exam_type:
        examType,

      total_questions:
        totalQuestions,

      /*
       * Keeping your current backend
       * behaviour unchanged.
       */

      paused_time:
        Date.now(),

      total_mark:
        "",

      user_score:
        "",

      minus_mark:
        "",

      answer_array:
        formatExamArray(
          answerArray
        ),

      user_answers:
        formatExamArray(
          userAnswers
        ),
    };
  }

  /* =========================================================
     CREATE ATTEMPT
  ========================================================= */

  async function createAttempt() {
    const response =
      await fetch(
        "/api/exam-attempt/create",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(
              buildAttemptPayload()
            ),
        }
      );

    if (!response.ok) {
      throw new Error(
        "Failed to create exam attempt"
      );
    }

    const result =
      await response.json();

    const newPauseId =
      result?.pauseid ??
      result?.pause_id ??
      result?.data
        ?.pauseid ??
      result?.data
        ?.pause_id ??
      null;

    if (
      newPauseId != null
    ) {
      setPauseId(
        newPauseId
      );
    }

    return {
      result,

      pauseId:
        newPauseId,
    };
  }

  /* =========================================================
     UPDATE ATTEMPT
  ========================================================= */

  async function updateAttempt({
    currentPauseId,
    extra = {},
  }) {
    const response =
      await fetch(
        "/api/exam-attempt/update",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              ...buildAttemptPayload(),

              pauseid:
                currentPauseId,

              ...extra,
            }),
        }
      );

    if (!response.ok) {
      throw new Error(
        "Failed to update exam attempt"
      );
    }

    return response.json();
  }

  /* =========================================================
     PAUSE EXAM
  ========================================================= */

  async function handlePause() {
    if (saving) {
      return;
    }

    if (submitted) {
      return;
    }

    try {
      setSaving(true);

      /*
       * First pause:
       * create backend attempt.
       */

      if (
        pauseId == null
      ) {
        await createAttempt();

        return;
      }

      /*
       * Existing attempt:
       * update same backend attempt.
       */

      await updateAttempt({
        currentPauseId:
          pauseId,

        extra: {
          total_attempted:
            answeredCount,

          total_correct:
            "",

          total_wrong:
            "",
        },
      });
    } catch (error) {
      console.error(
        "Pause PYQ exam:",
        error
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     SUBMIT
  ========================================================= */

  async function handleSubmit() {
    if (saving) {
      return;
    }

    if (submitted) {
      return;
    }

    try {
      setSaving(true);

      /* =====================================================
         FINAL CORRECT COUNT
      ===================================================== */

      const finalCorrectCount =
        normalizedQuestions.filter(
          (question) =>
            answers[
              question.id
            ] ===
            question.answerkey
        ).length;

      /* =====================================================
         FINAL ATTEMPTED COUNT
      ===================================================== */

      const finalAttemptedCount =
        Object.keys(
          answers
        ).length;

      /* =====================================================
         FINAL WRONG COUNT
      ===================================================== */

      const finalWrongCount =
        finalAttemptedCount -
        finalCorrectCount;

      let currentPauseId =
        pauseId;

      /*
       * If the exam has never
       * been saved before,
       * create the attempt first.
       */

      if (
        currentPauseId == null
      ) {
        const created =
          await createAttempt();

        currentPauseId =
          created.pauseId;
      }

      /*
       * Update attempt only when
       * backend returned an id.
       */

      if (
        currentPauseId != null
      ) {
        await updateAttempt({
          currentPauseId,

          extra: {
            total_correct:
              finalCorrectCount,

            total_wrong:
              finalWrongCount,

            total_attempted:
              finalAttemptedCount,
          },
        });
      }

      setSubmitted(true);

      scrollToTop();
    } catch (error) {
      console.error(
        "Submit PYQ exam:",
        error
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     RETURN
  ========================================================= */

  return {
    currentPage,
    totalPages,

    startIndex,
    endIndex,

    currentQuestions,
    totalQuestions,

    answers,

    answeredCount,
    unansweredCount,

    progress,

    submitted,
    saving,

    correctCount,
    wrongCount,

    pauseId,

    /* TIMER */

    durationMinutes,
    totalDurationSeconds,
    remainingSeconds,
    elapsedSeconds,
    timerFinished,

    /* ACTIONS */

    handleAnswer,
    handlePreviousPage,
    handleNextPage,
    handlePageChange,

    handlePause,
    handleSubmit,
  };
}