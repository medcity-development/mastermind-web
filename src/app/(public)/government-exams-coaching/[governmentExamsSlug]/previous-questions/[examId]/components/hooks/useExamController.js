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

/* =========================================================
   NORMALIZE ANSWER
========================================================= */

function normalizeAnswerValue(
  value
) {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value)
    .trim()
    .toUpperCase();
}

/* =========================================================
   CHECK ATTEMPTED ANSWER
========================================================= */

function isAttemptedAnswer(
  value
) {
  return (
    value !== undefined &&
    value !== null &&
    value !== "" &&
    value !== 0 &&
    value !== "0"
  );
}

/* =========================================================
   EXAM CONTROLLER
========================================================= */

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
     SUBMISSION
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
    }, [
      questions,
    ]);

  const totalQuestions =
    normalizedQuestions.length;

  /* =========================================================
     DURATION
  ========================================================= */

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
     RESET EXAM
  ========================================================= */

  useEffect(() => {
    setCurrentPage(1);

    setAnswers({});

    setSubmitted(false);

    setSaving(false);

    setPauseId(
      initialPauseId
    );

    setRemainingSeconds(
      totalDurationSeconds
    );

    setTimerFinished(
      false
    );
  }, [
    exam?.id,
    initialPauseId,
    totalDurationSeconds,
  ]);

  /* =========================================================
     TIMER
  ========================================================= */

  useEffect(() => {
    if (
      totalDurationSeconds <=
      0
    ) {
      return;
    }

    if (submitted) {
      return;
    }

    if (timerFinished) {
      return;
    }

    const intervalId =
      window.setInterval(
        () => {
          setRemainingSeconds(
            (
              previousSeconds
            ) => {
              if (
                previousSeconds <=
                1
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
                previousSeconds -
                1
              );
            }
          );
        },
        1000
      );

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
    Math.min(
      startIndex +
        QUESTIONS_PER_PAGE,
      totalQuestions
    );

  const currentQuestions =
    normalizedQuestions.slice(
      startIndex,
      endIndex
    );

  /* =========================================================
     CORRECT ANSWERS ARRAY
  ========================================================= */

  const answerArray =
    useMemo(() => {
      return normalizedQuestions.map(
        (question) =>
          question?.answerkey ??
          question?.answer ??
          question?.correct_answer ??
          question?.correctAnswer ??
          0
      );
    }, [
      normalizedQuestions,
    ]);

  /* =========================================================
     USER ANSWERS ARRAY
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
     LIVE STATISTICS
  ========================================================= */

  const examStats =
    useMemo(() => {
      let totalCorrect =
        0;

      let totalWrong =
        0;

      let totalAttempted =
        0;

      normalizedQuestions.forEach(
        (
          question
        ) => {
          const userAnswer =
            answers[
              question.id
            ];

          if (
            !isAttemptedAnswer(
              userAnswer
            )
          ) {
            return;
          }

          totalAttempted +=
            1;

          const correctAnswer =
            question?.answerkey ??
            question?.answer ??
            question?.correct_answer ??
            question?.correctAnswer ??
            "";

          const normalizedUser =
            normalizeAnswerValue(
              userAnswer
            );

          const normalizedCorrect =
            normalizeAnswerValue(
              correctAnswer
            );

          if (
            normalizedUser ===
            normalizedCorrect
          ) {
            totalCorrect +=
              1;
          } else {
            totalWrong +=
              1;
          }
        }
      );

      return {
        totalCorrect,
        totalWrong,
        totalAttempted,
      };
    }, [
      normalizedQuestions,
      answers,
    ]);

  /* =========================================================
     COUNTS
  ========================================================= */

  const answeredCount =
    examStats.totalAttempted;

  const unansweredCount =
    Math.max(
      totalQuestions -
        answeredCount,
      0
    );

  const progress =
    totalQuestions > 0
      ? Math.round(
          (
            answeredCount /
            totalQuestions
          ) * 100
        )
      : 0;

  /* =========================================================
     RESULT COUNTS
  ========================================================= */

  const correctCount =
    submitted
      ? examStats.totalCorrect
      : 0;

  const wrongCount =
    submitted
      ? examStats.totalWrong
      : 0;

  /* =========================================================
     MARK DETAILS
  ========================================================= */

  const totalMark =
    exam?.total_mark ??
    exam?.total_marks ??
    exam?.mark ??
    "";

  const minusMark =
    Number(
      exam?.minus_mark ??
        exam?.negative_mark ??
        exam?.negative_marks ??
        0
    ) || 0;

  /* =========================================================
     SCORE
  ========================================================= */

  const userScore =
    examStats.totalCorrect -
    examStats.totalWrong *
      minusMark;

  /* =========================================================
     SCROLL
  ========================================================= */

  function scrollToTop() {
    window.scrollTo({
      top: 0,

      behavior:
        "smooth",
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

    if (timerFinished) {
      return;
    }

    setAnswers(
      (
        previous
      ) => ({
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
      (
        previous
      ) =>
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
      (
        previous
      ) =>
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
    const safePage =
      Math.min(
        Math.max(
          Number(page) ||
            1,
          1
        ),
        totalPages
      );

    setCurrentPage(
      safePage
    );

    scrollToTop();
  }

  /* =========================================================
     COMMON PAYLOAD
  ========================================================= */

  function buildAttemptPayload({
    examStatus = "pause",
  } = {}) {
    return {
      uid,
      cid,

      exam_status:
        examStatus,

      lastposition:
        lastPosition ??
        examType,

      exam_id:
        exam?.id,

      exam_type:
        examType,

      total_questions:
        totalQuestions,

      paused_time:
        elapsedSeconds,

      total_mark:
        totalMark,

      user_score:
        userScore,

      minus_mark:
        minusMark,

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
    const payload =
      buildAttemptPayload({
        examStatus:
          "pause",
      });

    console.log(
      "CREATE EXAM ATTEMPT:",
      {
        uid:
          payload.uid,

        cid:
          payload.cid,

        exam_id:
          payload.exam_id,

        exam_type:
          payload.exam_type,

        exam_status:
          payload.exam_status,
      }
    );

    const response =
      await fetch(
        "/api/exam-attempt/create",
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(
              payload
            ),
        }
      );

    let result;

    try {
      result =
        await response.json();
    } catch {
      throw new Error(
        "Create attempt API returned invalid JSON."
      );
    }

    if (
      !response.ok ||
      result?.status ===
        false
    ) {
      console.error(
        "CREATE EXAM ATTEMPT FAILED:",
        result
      );

      throw new Error(
        result?.message ||
          "Failed to create exam attempt."
      );
    }

    const newPauseId =
      result?.pauseid ??
      result?.pause_id ??
      result?.id ??
      result?.data
        ?.pauseid ??
      result?.data
        ?.pause_id ??
      null;

    if (
      newPauseId ==
      null
    ) {
      console.error(
        "CREATE ATTEMPT RESPONSE:",
        result
      );

      throw new Error(
        "Exam attempt created but pauseid was not returned."
      );
    }

    setPauseId(
      newPauseId
    );

    console.log(
      "EXAM ATTEMPT CREATED:",
      {
        pauseid:
          newPauseId,
      }
    );

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

    examStatus =
      "pause",

    extra = {},
  }) {
    if (
      currentPauseId ==
      null
    ) {
      throw new Error(
        "pauseid is required."
      );
    }

    const payload = {
      ...buildAttemptPayload({
        examStatus,
      }),

      pauseid:
        currentPauseId,

      total_correct:
        examStats.totalCorrect,

      total_wrong:
        examStats.totalWrong,

      total_attempted:
        examStats.totalAttempted,

      ...extra,
    };

    console.log(
      "========================================"
    );

    console.log(
      "UPDATE EXAM ATTEMPT"
    );

    console.log(
      "uid:",
      payload.uid
    );

    console.log(
      "cid:",
      payload.cid
    );

    console.log(
      "exam_type:",
      payload.exam_type
    );

    console.log(
      "exam_status:",
      payload.exam_status
    );

    console.log(
      "pauseid:",
      payload.pauseid
    );

    console.log(
      "total_correct:",
      payload.total_correct
    );

    console.log(
      "total_wrong:",
      payload.total_wrong
    );

    console.log(
      "total_attempted:",
      payload.total_attempted
    );

    console.log(
      "user_score:",
      payload.user_score
    );

    console.log(
      "========================================"
    );

    const response =
      await fetch(
        "/api/exam-attempt/update",
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(
              payload
            ),
        }
      );

    let result;

    try {
      result =
        await response.json();
    } catch {
      throw new Error(
        "Update attempt API returned invalid JSON."
      );
    }

    if (
      !response.ok ||
      result?.status ===
        false
    ) {
      console.error(
        "UPDATE EXAM ATTEMPT FAILED:",
        result
      );

      throw new Error(
        result?.message ||
          "Failed to update exam attempt."
      );
    }

    return result;
  }

  /* =========================================================
     GET OR CREATE PAUSE ID
  ========================================================= */

  async function getOrCreatePauseId() {
    if (
      pauseId != null
    ) {
      return pauseId;
    }

    const created =
      await createAttempt();

    return created.pauseId;
  }

  /* =========================================================
     PAUSE
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
       *
       * 1. setNewUserExams
       * 2. receive pauseid
       * 3. setUpdateUserExams
       */

      const currentPauseId =
        await getOrCreatePauseId();

      const result =
        await updateAttempt({
          currentPauseId,

          examStatus:
            "pause",
        });

      console.log(
        "PAUSE EXAM SAVED:",
        {
          pauseid:
            currentPauseId,

          total_correct:
            examStats.totalCorrect,

          total_wrong:
            examStats.totalWrong,

          total_attempted:
            examStats.totalAttempted,

          result,
        }
      );

      return result;
    } catch (error) {
      console.error(
        "Pause PYQ exam:",
        error
      );

      throw error;
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     SUBMIT / FINISH
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

      /*
       * Get the existing attempt ID.
       *
       * If this exam has never been saved,
       * create it first.
       */

      const currentPauseId =
        await getOrCreatePauseId();

      /*
       * IMPORTANT
       *
       * Final submission must use "finish",
       * not "pause".
       */

      const result =
        await updateAttempt({
          currentPauseId,

          examStatus:
            "finish",

          extra: {
            total_correct:
              examStats.totalCorrect,

            total_wrong:
              examStats.totalWrong,

            total_attempted:
              examStats.totalAttempted,

            user_score:
              userScore,
          },
        });

      console.log(
        "========================================"
      );

      console.log(
        "FINAL EXAM SUBMITTED"
      );

      console.log(
        "uid:",
        uid
      );

      console.log(
        "cid:",
        cid
      );

      console.log(
        "pauseid:",
        currentPauseId
      );

      console.log(
        "exam_type:",
        examType
      );

      console.log(
        "exam_status:",
        "finish"
      );

      console.log(
        "total_correct:",
        examStats.totalCorrect
      );

      console.log(
        "total_wrong:",
        examStats.totalWrong
      );

      console.log(
        "total_attempted:",
        examStats.totalAttempted
      );

      console.log(
        "user_score:",
        userScore
      );

      console.log(
        "result:",
        result
      );

      console.log(
        "========================================"
      );

      setSubmitted(
        true
      );

      scrollToTop();

      return result;
    } catch (error) {
      console.error(
        "Submit PYQ exam:",
        error
      );

      throw error;
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