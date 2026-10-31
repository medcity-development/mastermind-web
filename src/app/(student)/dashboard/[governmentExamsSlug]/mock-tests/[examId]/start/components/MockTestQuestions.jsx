
"use client";

import {
  useCallback,
  useState,
} from "react";



import {
  Loader2,
} from "lucide-react";

import MockQuestionPagination from "./MockQuestionPagination";
import MockQuestionsSection from "./MockQuestionsSection";

import ExamResultModal from "@/components/ExamResultModal";

import ExamPauseConfirmationModal from "@/app/(student)/dashboard/common-components/exam/ExamPauseConfirmationModal";



import MockTestActions from "./MockTestActions";
import MockTestEmpty from "./MockTestEmpty";
import MockTestError from "./MockTestError";
import MockTestLoading from "./MockTestLoading";
import MockTestMessages from "./MockTestMessages";
import MockTestStats from "./MockTestStats";

import MockTestHeader from "../../components/MockTestHeader";

import useMockTestExam from "../hooks/useMockTestExam";

export default function MockTestQuestions({
  examId,
  uid,
  cid,
  examName = "",
  shortName = "",
  examTitle = "",
  examType = "mock",
  governmentExamsSlug = "",
  guestAction = "",
}) {


  const [
    showPauseConfirmation,
    setShowPauseConfirmation,
  ] = useState(false);

  const [
    pauseConfirming,
    setPauseConfirming,
  ] = useState(false);

  const {
    exam,
    questions,
    imagePath,
    answers,

    loading,
    error,

    currentPage,
    totalPages,
    pageNumbers,
    startIndex,
    visibleQuestions,

    answeredCount,
    unansweredCount,

    saving,
    submitted,
    isPaused,

    remainingSeconds,
    timeEnded,

    saveMessage,
    saveError,

    resultModalOpen,
    submittedResult,
    resultLoading,

    dashboardDetailsPath,

    handleAnswer,
    handlePageChange,
    handlePause,
    handleSubmit,
    handleResultClose,
    handleViewAnalysis,

    interactionDisabled,

    guestPausePending,
    confirmGuestPause,
    continueGuestExam,

    timeoutStatus,
    timeoutError,
    retryTimeoutSubmit,

  } = useMockTestExam({
    examId,
    uid,
    cid,
    examTitle,
    examType,
    governmentExamsSlug,
    guestAction,
  });

  /* =====================================================
     PAUSE / RESUME BUTTON
  ===================================================== */

  const handlePauseOrResume = useCallback(async () => {
    if (
      saving ||
      pauseConfirming ||
      submitted ||
      timeEnded ||
      guestPausePending
    ) {
      return;
    }

    if (isPaused) {
      // Resume immediately. Do not open pause modal.
      await handlePause();
      return;
    }

    // Active exam: ask before pausing.
    setShowPauseConfirmation(true);
  }, [
    saving,
    pauseConfirming,
    submitted,
    timeEnded,
    guestPausePending,
    isPaused,
    handlePause,
  ]);

  /* =====================================================
     CONFIRM PAUSE
  ===================================================== */

  const handleConfirmPause = useCallback(async () => {
    if (
      pauseConfirming ||
      saving ||
      submitted ||
      timeEnded
    ) {
      return;
    }

    setPauseConfirming(true);

    try {
      const success = guestPausePending
        ? await confirmGuestPause()
        : await handlePause();

      if (success) {
        setShowPauseConfirmation(false);
      }
    } finally {
      setPauseConfirming(false);
    }
  }, [
    pauseConfirming,
    saving,
    submitted,
    timeEnded,
    guestPausePending,
    confirmGuestPause,
    handlePause,
  ]);

  /* =====================================================
     CONTINUE EXAM
  ===================================================== */

  const handleContinueExam = useCallback(() => {
    if (
      saving ||
      pauseConfirming
    ) {
      return;
    }

    if (guestPausePending) {
      continueGuestExam();
    }

    setShowPauseConfirmation(false);
  }, [
    saving,
    pauseConfirming,
    guestPausePending,
    continueGuestExam,
  ]);

  /* =====================================================
     LOADING / ERROR
  ===================================================== */

  if (loading) {
    return <MockTestLoading />;
  }

  if (error) {
    return (
      <MockTestError
        message={error}
      />
    );
  }

  if (!questions.length) {
    return <MockTestEmpty />;
  }

  /* =====================================================
     EXAM DETAILS
  ===================================================== */

  const resolvedExamTitle =
    exam?.exam_name ??
    exam?.examName ??
    exam?.exam_title ??
    exam?.examTitle ??
    exam?.title ??
    exam?.name ??
    examTitle ??
    "";

  const timeoutVisible =
    timeEnded &&
    !guestPausePending &&
    (
      timeoutStatus === "saving" ||
      timeoutStatus === "success" ||
      timeoutStatus === "error"
    );

  const pauseModalOpen =
    !timeoutVisible &&
    (
      guestPausePending ||
      showPauseConfirmation
    );

  const actionsBusy =
    saving ||
    pauseConfirming ||
    pauseModalOpen ||
    timeoutVisible;

  const questionsDisabled =
    interactionDisabled ||
    pauseModalOpen ||
    timeoutVisible;

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <>
      <section
        className="
          overflow-hidden
          rounded-[26px]
          border
          border-[#dce8f7]
          bg-white
          shadow-[0_18px_50px_rgba(15,23,42,0.06)]
        "
      >
        <MockTestHeader
          exam={exam}
          examName={examName}
          shortName={shortName}
          remainingSeconds={remainingSeconds}
          backHref={dashboardDetailsPath}
        />

        <MockTestStats
          questionsCount={questions.length}
          totalMark={
            exam?.total_mark ??
            exam?.totalMark ??
            questions.length
          }
          answeredCount={answeredCount}
          unansweredCount={unansweredCount}
        />

        <MockQuestionsSection
          questions={visibleQuestions}
          startIndex={startIndex}
          answers={answers}
          imagePath={imagePath}
          disabled={questionsDisabled}
          onAnswer={handleAnswer}
        />

        <MockQuestionPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pages={pageNumbers}
          onPageChange={handlePageChange}
        />

        <MockTestActions
          onPause={handlePauseOrResume}
          onSubmit={handleSubmit}
          saving={actionsBusy}
          resultLoading={resultLoading}
          submitted={submitted}
          isPaused={isPaused}
          timeEnded={timeEnded}
        />

        <MockTestMessages
          success={saveMessage}
          error={saveError}
        />
      </section>

      {/* ================================================
          RESULT MODAL
      ================================================ */}

      <ExamResultModal
        open={resultModalOpen}
        result={submittedResult}
        examTitle={resolvedExamTitle}
        onClose={handleResultClose}
        onViewAnalysis={handleViewAnalysis}
      />

      {/* ================================================
          PAUSE CONFIRMATION MODAL
      ================================================ */}

      <ExamPauseConfirmationModal
        open={pauseModalOpen}
        error={saveError}
        saving={
          saving ||
          pauseConfirming
        }
        onContinue={handleContinueExam}
        onConfirm={handleConfirmPause}
      />

      {/* ================================================
          TIME FINISHED — SUBMITTING / ERROR
      ================================================ */}

      {timeoutVisible &&
        timeoutStatus !== "success" && (
          <div
            className="
              fixed
              inset-0
              z-[10000]
              flex
              items-center
              justify-center
              bg-slate-950/75
              p-4
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="timeout-title"
          >
            <div
              className="
                w-full
                max-w-md
                rounded-2xl
                bg-white
                p-7
                text-center
                shadow-2xl
              "
            >
              <h2
                id="timeout-title"
                className="
                  text-2xl
                  font-bold
                  text-slate-900
                "
              >
                Your Time Is Finished!
              </h2>

              {timeoutStatus === "saving" ? (
                <div
                  className="
                    mt-5
                    flex
                    items-center
                    justify-center
                    gap-2
                    text-slate-600
                  "
                >
                  <Loader2
                    className="animate-spin"
                    size={20}
                  />

                  <span>
                    Submitting your exam...
                  </span>
                </div>
              ) : (
                <>
                  <p
                    className="
                      mt-4
                      text-sm
                      text-red-600
                    "
                  >
                    {timeoutError ||
                      "Submission failed. Your answers have not been confirmed saved."}
                  </p>

                  <button
                    type="button"
                    onClick={retryTimeoutSubmit}
                    className="
                      mt-6
                      rounded-xl
                      bg-amber-600
                      px-6
                      py-3
                      font-semibold
                      text-white
                      transition
                      hover:bg-amber-700
                    "
                  >
                    Retry Submission
                  </button>
                </>
              )}
            </div>
          </div>
        )}
    </>
  );
}
