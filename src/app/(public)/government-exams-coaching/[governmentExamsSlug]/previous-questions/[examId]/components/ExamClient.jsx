"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import ExamHero from "./ExamHero";
import ExamTimer from "./ExamTimer";
import ExamProgress from "./ExamProgress";
import ExamQuestionRange from "./ExamQuestionRange";
import ExamQuestions from "./ExamQuestions";
import ExamPagination from "./ExamPagination";
import ExamPause from "./ExamPause";
import ExamSubmit from "./ExamSubmit";
import ExamResult from "./ExamResult";
import ExamEmpty from "./ExamEmpty";
import LoginRequiredModal from "./LoginRequiredModal";

import useExamController from "./hooks/useExamController";

export default function ExamClient({
  exam,
  questions = [],
  imagePath = "",
  uid,
  cid,
  examType,
  lastPosition,
  initialPauseId = null,
}) {
  const router =
    useRouter();

  /* =========================================================
     LOGIN MODAL
  ========================================================= */

  const [
    showLoginModal,
    setShowLoginModal,
  ] = useState(false);

  /* =========================================================
     PREVENT MULTIPLE TIMER SUBMITS
  ========================================================= */

  const autoSubmitStartedRef =
    useRef(false);

  /* =========================================================
     EXAM CONTROLLER
  ========================================================= */

  const {
    currentPage,
    totalPages,

    currentQuestions,
    totalQuestions,

    startIndex,
    endIndex,

    answers,

    answeredCount,
    unansweredCount,

    progress,

    submitted,
    saving,

    correctCount,
    wrongCount,

    /* TIMER */

    durationMinutes,
    remainingSeconds,
    timerFinished,

    /* ACTIONS */

    handleAnswer,
    handlePreviousPage,
    handleNextPage,
    handlePageChange,

    handlePause,
    handleSubmit,
  } = useExamController({
    exam,
    questions,
    uid,
    cid,
    examType,
    lastPosition,
    initialPauseId,
  });

  /* =========================================================
     PAUSE WRAPPER
  ========================================================= */

  async function handleExamPause() {
    /*
     * Guest:
     *
     * Don't create/update backend
     * attempt.
     *
     * Show login modal instead.
     */

    if (
      Number(uid) === 0
    ) {
      setShowLoginModal(
        true
      );

      return;
    }

    await handlePause();
  }

  /* =========================================================
     SUBMIT WRAPPER
  ========================================================= */

  async function handleExamSubmit() {
    /*
     * Guest:
     *
     * Show login modal instead
     * of submitting.
     */

    if (
      Number(uid) === 0
    ) {
      setShowLoginModal(
        true
      );

      return;
    }

    await handleSubmit();
  }

  /* =========================================================
     TIMER FINISHED
  ========================================================= */

  useEffect(() => {
    /*
     * Timer hasn't finished.
     */

    if (!timerFinished) {
      return;
    }

    /*
     * Already submitted.
     */

    if (submitted) {
      return;
    }

    /*
     * Backend request running.
     */

    if (saving) {
      return;
    }

    /*
     * Prevent duplicate automatic
     * submission.
     */

    if (
      autoSubmitStartedRef.current
    ) {
      return;
    }

    autoSubmitStartedRef.current =
      true;

    /*
     * Guest user:
     *
     * Time ended, so show
     * login modal.
     */

    if (
      Number(uid) === 0
    ) {
      setShowLoginModal(
        true
      );

      return;
    }

    /*
     * Logged-in user:
     *
     * Automatically submit exam.
     */

    handleSubmit();
  }, [
    timerFinished,
    submitted,
    saving,
    uid,
    handleSubmit,
  ]);

  /* =========================================================
     RESET AUTO SUBMIT GUARD
     WHEN EXAM CHANGES
  ========================================================= */

  useEffect(() => {
    autoSubmitStartedRef.current =
      false;
  }, [
    exam?.id,
  ]);

  /* =========================================================
     LOGIN REDIRECT
  ========================================================= */

  function handleLoginRedirect() {
    setShowLoginModal(
      false
    );

    /*
     * You can later include
     * redirect back to the exam
     * if required.
     */

    router.push(
      "/login"
    );
  }

  /* =========================================================
     EMPTY EXAM
  ========================================================= */

  if (
    totalQuestions === 0
  ) {
    return <ExamEmpty />;
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      <section
        className="
          space-y-6
        "
      >
        {/* =================================================
            HERO
        ================================================= */}

        <ExamHero
          exam={exam}
          totalQuestions={
            totalQuestions
          }
          currentPage={
            currentPage
          }
          totalPages={
            totalPages
          }
        />

        {/* =================================================
            TIMER
        ================================================= */}

        {durationMinutes > 0 ? (
          <div
            className="
              flex
              items-center
              justify-end
            "
          >
            <ExamTimer
              remainingSeconds={
                remainingSeconds
              }
              durationMinutes={
                durationMinutes
              }
            />
          </div>
        ) : null}

        {/* =================================================
            RESULT
        ================================================= */}

        {submitted && (
          <ExamResult
            totalQuestions={
              totalQuestions
            }
            answeredCount={
              answeredCount
            }
            correctCount={
              correctCount
            }
            wrongCount={
              wrongCount
            }
          />
        )}

        {/* =================================================
            PROGRESS
        ================================================= */}

        <ExamProgress
          answeredCount={
            answeredCount
          }
          totalQuestions={
            totalQuestions
          }
          progress={
            progress
          }
        />

        {/* =================================================
            QUESTION RANGE
        ================================================= */}

        <ExamQuestionRange
          startIndex={
            startIndex
          }
          endIndex={
            endIndex
          }
          totalQuestions={
            totalQuestions
          }
          currentPage={
            currentPage
          }
          unansweredCount={
            unansweredCount
          }
        />

        {/* =================================================
            QUESTIONS
        ================================================= */}

        <ExamQuestions
          questions={
            currentQuestions
          }
          startIndex={
            startIndex
          }
          answers={
            answers
          }
          submitted={
            submitted
          }
          imagePath={
            imagePath
          }
          onAnswer={
            handleAnswer
          }
        />

        {/* =================================================
            PAGINATION
        ================================================= */}

        {!timerFinished && (
          <ExamPagination
            currentPage={
              currentPage
            }
            totalPages={
              totalPages
            }
            onPrevious={
              handlePreviousPage
            }
            onNext={
              handleNextPage
            }
            onPageChange={
              handlePageChange
            }
          />
        )}

        {/* =================================================
            ACTIONS
        ================================================= */}

        {!submitted &&
          !timerFinished && (
            <div
              className="
                flex
                flex-col
                gap-3
                sm:flex-row
                sm:items-center
                sm:justify-end
              "
            >
              {/* PAUSE */}

              <ExamPause
                onPause={
                  handleExamPause
                }
                saving={
                  saving
                }
              />

              {/* SUBMIT */}

              <ExamSubmit
                answeredCount={
                  answeredCount
                }
                totalQuestions={
                  totalQuestions
                }
                onSubmit={
                  handleExamSubmit
                }
                saving={
                  saving
                }
              />
            </div>
          )}

        {/* =================================================
            TIME FINISHED MESSAGE
        ================================================= */}

        {timerFinished &&
          !submitted && (
            <div
              className="
                rounded-2xl
                border
                border-red-200
                bg-red-50
                px-5
                py-4
                text-center
              "
            >
              <p
                className="
                  text-sm
                  font-black
                  text-red-700
                "
              >
                Exam time has ended.
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  font-medium
                  text-red-500
                "
              >
                Your exam is being
                submitted automatically.
              </p>
            </div>
          )}
      </section>

      {/* =====================================================
          LOGIN REQUIRED MODAL
      ===================================================== */}

      <LoginRequiredModal
        open={
          showLoginModal
        }
        onClose={() =>
          setShowLoginModal(
            false
          )
        }
        onLogin={
          handleLoginRedirect
        }
      />
    </>
  );
}