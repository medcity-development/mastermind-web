"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import ExamTopBar from "./ExamTopBar";
import ExamHero from "./ExamHero";
import ExamProgress from "./ExamProgress";
import ExamQuestions from "./ExamQuestions";
import ExamPagination from "./ExamPagination";
import ExamControls from "./ExamControls";
import LoginRequiredModal from "./LoginRequiredModal";

const QUESTIONS_PER_PAGE =
  10;

export default function ExamClient({
  exam,
  questions = [],
  imagePath = "",
  uid,
  cid,
  examType,
  slug,
  examSlug,
}) {
  const router =
    useRouter();

  /* =====================================================
     PAGE
  ===================================================== */

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  /* =====================================================
     ANSWERS
  ===================================================== */

  const [
    answers,
    setAnswers,
  ] = useState({});

  /* =====================================================
     LOGIN MODAL
  ===================================================== */

  const [
    modalState,
    setModalState,
  ] = useState({
    open: false,
    action: "",
  });

  /* =====================================================
     EXAM DURATION
  ===================================================== */

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

  /* =====================================================
     TIMER END TIME
  ===================================================== */

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

  /*
    Start timer once the
    exam component mounts.
  */

  useEffect(() => {
    if (
      durationSeconds <= 0
    ) {
      setTimeLeft(0);
      setEndTime(null);

      return;
    }

    const nextEndTime =
      Date.now() +
      durationSeconds *
        1000;

    setEndTime(
      nextEndTime
    );

    setTimeLeft(
      durationSeconds
    );
  }, [
    exam?.id,
    durationSeconds,
  ]);

  /*
    Timer is calculated from
    actual clock time.

    This avoids interval drift
    and React re-render issues.
  */

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
        250
      );

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [endTime]);

  /* =====================================================
     PAGINATION
  ===================================================== */

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

  /* =====================================================
     COUNTS
  ===================================================== */

  const answeredCount =
    Object.keys(
      answers
    ).length;

  const isTimeOver =
    durationSeconds > 0 &&
    timeLeft <= 0;

  /* =====================================================
     ANSWER
  ===================================================== */

  function handleAnswer(
    questionId,
    answer
  ) {
    if (isTimeOver) {
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

  /* =====================================================
     PAGE CHANGE
  ===================================================== */

  function scrollTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handlePrevious() {
    setCurrentPage(
      (previous) =>
        Math.max(
          1,
          previous - 1
        )
    );

    scrollTop();
  }

  function handleNext() {
    setCurrentPage(
      (previous) =>
        Math.min(
          totalPages,
          previous + 1
        )
    );

    scrollTop();
  }

  function handlePageChange(
    page
  ) {
    setCurrentPage(page);

    scrollTop();
  }

  /* =====================================================
     PAUSE
  ===================================================== */

  function handlePause() {
    setModalState({
      open: true,
      action: "pause",
    });
  }

  /* =====================================================
     FINISH
  ===================================================== */

  function handleFinish() {
    setModalState({
      open: true,
      action: "finish",
    });
  }

  /* =====================================================
     MODAL
  ===================================================== */

  function handleCloseModal() {
    setModalState({
      open: false,
      action: "",
    });
  }

  function handleLogin() {
    router.push(
      "/login"
    );
  }

  /* =====================================================
     UI
  ===================================================== */

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
            max-w-7xl
            px-4
            py-6
            sm:px-6
            lg:px-8
            lg:py-8 mt-20
          "
        >
          {/* TIMER ALWAYS AT TOP */}

        

          <ExamTopBar
  slug={slug}
  examSlug={examSlug}
  timeLeft={timeLeft}
  durationMinutes={durationMinutes}
/>
<ExamHero
  exam={exam}
  questionsCount={questions.length}
  timeLeft={timeLeft}
  durationMinutes={durationMinutes}
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

          {durationSeconds <=
          0 ? (
            <div
              className="
                mt-5
                rounded-[16px]
                border
                border-amber-200
                bg-amber-50
                p-4
                text-sm
                font-semibold
                text-amber-700
              "
            >
              Exam duration was
              not received from
              the API.
            </div>
          ) : null}

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
                You can no
                longer change
                your answers.
              </p>
            </div>
          ) : null}

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
              isTimeOver
            }
            imagePath={
              imagePath
            }
          />

          <ExamPagination
            currentPage={
              currentPage
            }
            totalPages={
              totalPages
            }
            onPrevious={
              handlePrevious
            }
            onNext={
              handleNext
            }
            onPageChange={
              handlePageChange
            }
          />

          {/* ALWAYS VISIBLE */}

          <ExamControls
            onPause={
              handlePause
            }
            onFinish={
              handleFinish
            }
          />
        </div>
      </main>

      <LoginRequiredModal
        open={
          modalState.open
        }
        action={
          modalState.action
        }
        onClose={
          handleCloseModal
        }
        onLogin={
          handleLogin
        }
      />
    </>
  );
}