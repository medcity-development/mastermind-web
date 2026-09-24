"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import ExamHero from "./ExamHero";
import ExamProgress from "./ExamProgress";
import ExamQuestions from "./ExamQuestions";
import ExamPagination from "./ExamPagination";
import ExamControls from "./ExamControls";
import LoginRequiredModal from "./LoginRequiredModal";

import {
  QUESTIONS_PER_PAGE,
} from "../utils/examUtils";

/* =========================================================
   API REQUEST
========================================================= */

async function sendAttemptRequest({
  endpoint,
  payload,
}) {
  const response =
    await fetch(
      endpoint,
      {
        method: "POST",

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

  const result =
    await response.json();

  if (
    !response.ok ||
    result?.status === false
  ) {
    throw new Error(
      result?.message ||
        "Unable to save exam attempt."
    );
  }

  return result;
}

/* =========================================================
   NORMALIZE ANSWER VALUE
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

  if (
    typeof value ===
    "object"
  ) {
    return String(
      value?.id ??
        value?.option ??
        value?.answer ??
        value?.value ??
        ""
    );
  }

  return String(value);
}

/* =========================================================
   GET CORRECT ANSWER FROM QUESTION

   Supports common backend field names.
========================================================= */

function getCorrectAnswer(
  question
) {
  return normalizeAnswerValue(
    question?.correct_answer ??
      question?.correctAnswer ??
      question?.answer ??
      question?.right_answer ??
      question?.rightAnswer ??
      ""
  );
}

/* =========================================================
   EXAM CLIENT
========================================================= */

export default function ExamClient({
  exam,

  questions = [],

  imagePath = "",

  statementTypeSlug,

  examSlug,

  governmentExamsSlug = "kerala-psc",

  uid = 0,

  cid = 1,

  examType = "tst",

  initialAttemptCreated = false,
}) {
  const router =
    useRouter();

  /* =======================================================
     STATE
  ======================================================= */

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [
    answers,
    setAnswers,
  ] = useState({});

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    saveError,
    setSaveError,
  ] = useState("");

  const [
    attemptCreated,
    setAttemptCreated,
  ] = useState(
    Boolean(
      initialAttemptCreated
    )
  );

  const [
    modalState,
    setModalState,
  ] = useState({
    open: false,
    action: "",
  });

  const timeOverHandled =
    useRef(false);

  /* =======================================================
     EXAM VALUES
  ======================================================= */

  const examId =
    exam?.id;

  const durationMinutes =
    Number(
      exam?.total_minutes
    ) || 0;

  const durationSeconds =
    Math.max(
      0,
      Math.floor(
        durationMinutes *
          60
      )
    );

  /* =======================================================
     TIMER
  ======================================================= */

  const [
    endTime,
    setEndTime,
  ] = useState(null);

  const [
    timeLeft,
    setTimeLeft,
  ] = useState(
    durationSeconds
  );

  useEffect(() => {
    timeOverHandled.current =
      false;

    if (
      durationSeconds <= 0
    ) {
      setEndTime(null);
      setTimeLeft(0);

      return;
    }

    const deadline =
      Date.now() +
      durationSeconds *
        1000;

    setEndTime(
      deadline
    );

    setTimeLeft(
      durationSeconds
    );
  }, [
    examId,
    durationSeconds,
  ]);

  useEffect(() => {
    if (!endTime) {
      return;
    }

    function updateTimer() {
      const remaining =
        Math.max(
          0,
          Math.ceil(
            (endTime -
              Date.now()) /
              1000
          )
        );

      setTimeLeft(
        remaining
      );
    }

    updateTimer();

    const timer =
      window.setInterval(
        updateTimer,
        1000
      );

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [endTime]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        questions.length /
          QUESTIONS_PER_PAGE
      )
    );

  const currentQuestions =
    useMemo(() => {
      const start =
        (currentPage -
          1) *
        QUESTIONS_PER_PAGE;

      return questions.slice(
        start,
        start +
          QUESTIONS_PER_PAGE
      );
    }, [
      questions,
      currentPage,
    ]);

  /* =======================================================
     COUNTS
  ======================================================= */

  const answeredCount =
    Object.keys(
      answers
    ).filter(
      (questionId) =>
        normalizeAnswerValue(
          answers[
            questionId
          ]
        ) !== ""
    ).length;

  const isTimeOver =
    durationSeconds > 0 &&
    timeLeft <= 0;

  /* =======================================================
     ANSWER
  ======================================================= */

  function handleAnswer(
    questionId,
    answer
  ) {
    if (
      isTimeOver ||
      saving
    ) {
      return;
    }

    setAnswers(
      (previous) => ({
        ...previous,

        [questionId]:
          answer,
      })
    );
  }

  /* =======================================================
     PAGE CHANGE
  ======================================================= */

  function scrollTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handlePage(
    page
  ) {
    if (saving) {
      return;
    }

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

    scrollTop();
  }

  /* =======================================================
     BUILD ANSWER ARRAYS
  ======================================================= */

  function buildAnswerData() {
    const answerArray = [];

    const correctAnswerArray =
      [];

    const wrongAnswerArray =
      [];

    questions.forEach(
      (
        question,
        index
      ) => {
        const questionId =
          String(
            question?.id ??
              index +
                1
          );

        const selectedAnswer =
          normalizeAnswerValue(
            answers[
              questionId
            ] ??
              answers[
                question?.id
              ]
          );

        const correctAnswer =
          getCorrectAnswer(
            question
          );

        const answerItem = {
          question_id:
            question?.id,

          answer:
            selectedAnswer,
        };

        answerArray.push(
          answerItem
        );

        if (
          !selectedAnswer
        ) {
          return;
        }

        if (
          correctAnswer &&
          selectedAnswer ===
            correctAnswer
        ) {
          correctAnswerArray.push(
            answerItem
          );

          return;
        }

        wrongAnswerArray.push(
          answerItem
        );
      }
    );

    return {
      answerArray,

      correctAnswerArray,

      wrongAnswerArray,
    };
  }

  /* =======================================================
     SCORE
  ======================================================= */

  function calculateScore(
    correctCount
  ) {
    const totalMark =
      Number(
        exam?.total_mark
      ) || 0;

    const totalQuestions =
      Number(
        exam?.total_questions
      ) ||
      questions.length;

    if (
      totalQuestions <= 0
    ) {
      return 0;
    }

    const markPerQuestion =
      totalMark /
      totalQuestions;

    return Number(
      (
        correctCount *
        markPerQuestion
      ).toFixed(2)
    );
  }

  /* =======================================================
     LOGIN MODAL
  ======================================================= */

  function openLoginModal(
    action
  ) {
    setModalState({
      open: true,
      action,
    });
  }

  function closeModal() {
    setModalState({
      open: false,
      action: "",
    });
  }

  function handleLogin() {
    const currentUrl =
      window.location.pathname;

    router.push(
      `/login?redirect=${encodeURIComponent(
        currentUrl
      )}`
    );
  }

  /* =======================================================
     SAVE ATTEMPT
  ======================================================= */

  async function saveExamAttempt(
    examStatus
  ) {
    if (saving) {
      return;
    }

    /* -------------------------------------------------------
       USER NOT LOGGED IN
    ------------------------------------------------------- */

    if (
      !uid ||
      Number(uid) === 0
    ) {
      openLoginModal(
        examStatus
      );

      return;
    }

    if (!examId) {
      setSaveError(
        "Exam ID is missing."
      );

      return;
    }

    try {
      setSaving(true);
      setSaveError("");

      const {
        answerArray,
        correctAnswerArray,
        wrongAnswerArray,
      } =
        buildAnswerData();

      const elapsedSeconds =
        durationSeconds > 0
          ? Math.max(
              0,
              durationSeconds -
                timeLeft
            )
          : 0;

      const userScore =
        calculateScore(
          correctAnswerArray.length
        );

      const payload = {
        uid:
          Number(uid),

        cid:
          Number(cid),

        exam_status:
          examStatus,

        lastposition:
          currentPage,

        exam_id:
          examId,

        exam_type:
          examType,

        total_questions:
          Number(
            exam?.total_questions
          ) ||
          questions.length,

        paused_time:
          elapsedSeconds,

        total_mark:
          Number(
            exam?.total_mark
          ) || 0,

        user_score:
          userScore,

        minus_mark:
          0,

        answer_array:
          answerArray,

        correct_answer_array:
          correctAnswerArray,

        wrong_answer_array:
          wrongAnswerArray,
      };

      console.log(
        "STATEMENT EXAM PAYLOAD:",
        payload
      );

      let result;

      /* -----------------------------------------------------
         CREATE FIRST ATTEMPT
      ----------------------------------------------------- */

      if (
        !attemptCreated
      ) {
        result =
          await sendAttemptRequest({
            endpoint:
              "/api/exam-attempt/create",

            payload,
          });

        setAttemptCreated(
          true
        );
      }

      /* -----------------------------------------------------
         UPDATE EXISTING ATTEMPT
      ----------------------------------------------------- */

      else {
        result =
          await sendAttemptRequest({
            endpoint:
              "/api/exam-attempt/update",

            payload,
          });
      }

      console.log(
        "STATEMENT EXAM SAVE RESULT:",
        result
      );

      /* -----------------------------------------------------
         AFTER PAUSE
      ----------------------------------------------------- */

      if (
        examStatus ===
        "pause"
      ) {
        router.push(
          `/government-exams-coaching/${governmentExamsSlug}/statement-type-exams/${statementTypeSlug}/${examSlug}`
        );

        return;
      }

      /* -----------------------------------------------------
         AFTER FINISH
      ----------------------------------------------------- */

      if (
        examStatus ===
        "complete"
      ) {
        router.push(
          `/government-exams-coaching/${governmentExamsSlug}/statement-type-exams/${statementTypeSlug}/${examSlug}`
        );
      }
    } catch (error) {
      console.error(
        "STATEMENT EXAM SAVE ERROR:",
        error
      );

      setSaveError(
        error?.message ||
          "Unable to save exam."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     CONTROLS
  ======================================================= */

  function handlePause() {
    saveExamAttempt(
      "pause"
    );
  }

  function handleFinish() {
    saveExamAttempt(
      "complete"
    );
  }

  /* =======================================================
     TIME OVER

     For logged-in user:
     complete automatically.

     For uid 0:
     show login modal.
  ======================================================= */

  useEffect(() => {
    if (
      !isTimeOver ||
      timeOverHandled.current
    ) {
      return;
    }

    timeOverHandled.current =
      true;

    if (
      !uid ||
      Number(uid) === 0
    ) {
      openLoginModal(
        "finish"
      );

      return;
    }

    saveExamAttempt(
      "complete"
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isTimeOver,
  ]);

  /* =======================================================
     UI
  ======================================================= */

  return (
    <>
      <main
        className="
          min-h-screen
          bg-[#f5f9ff]
        "
      >
        <div
          className="
            mx-auto
            w-full
            max-w-[1300px]
            px-4
            py-8
            sm:px-6
            lg:px-8
          "
        >
          <ExamHero
            exam={exam}
            questionsCount={
              questions.length
            }
            timeLeft={
              timeLeft
            }
            durationMinutes={
              durationMinutes
            }
            statementTypeSlug={
              statementTypeSlug
            }
            examSlug={
              examSlug
            }
          />

          <ExamProgress
            answeredCount={
              answeredCount
            }
            totalQuestions={
              questions.length
            }
            currentPage={
              currentPage
            }
            totalPages={
              totalPages
            }
          />

          {/* ==============================================
              SAVE ERROR
          ============================================== */}

          {saveError ? (
            <div
              className="
                mt-5
                rounded-[16px]
                border
                border-red-200
                bg-red-50
                p-4
              "
            >
              <p
                className="
                  font-bold
                  text-red-700
                "
              >
                {saveError}
              </p>
            </div>
          ) : null}

          {/* ==============================================
              TIME OVER
          ============================================== */}

          {isTimeOver ? (
            <div
              className="
                mt-5
                rounded-[16px]
                border
                border-red-200
                bg-red-50
                p-4
              "
            >
              <p
                className="
                  font-black
                  text-red-700
                "
              >
                Time is over
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  text-red-600
                "
              >
                You can no longer
                change your answers.
              </p>
            </div>
          ) : null}

          {/* ==============================================
              QUESTIONS
          ============================================== */}

          <ExamQuestions
            questions={
              currentQuestions
            }
            currentPage={
              currentPage
            }
            answers={
              answers
            }
            onAnswer={
              handleAnswer
            }
            disabled={
              isTimeOver ||
              saving
            }
            imagePath={
              imagePath
            }
          />

          {/* ==============================================
              PAGINATION
          ============================================== */}

          <ExamPagination
            currentPage={
              currentPage
            }
            totalPages={
              totalPages
            }
            onPageChange={
              handlePage
            }
          />

          {/* ==============================================
              CONTROLS
          ============================================== */}

          <ExamControls
            onPause={
              handlePause
            }
            onFinish={
              handleFinish
            }
            saving={
              saving
            }
            disabled={
              saving
            }
          />
        </div>
      </main>

      {/* ================================================
          LOGIN MODAL
      ================================================= */}

      <LoginRequiredModal
        open={
          modalState.open
        }
        action={
          modalState.action
        }
        onClose={
          closeModal
        }
        onLogin={
          handleLogin
        }
      />
    </>
  );
}