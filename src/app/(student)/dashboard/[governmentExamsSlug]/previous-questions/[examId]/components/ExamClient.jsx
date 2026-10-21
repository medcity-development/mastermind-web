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

import useExamController from "./hooks/useExamController";

import PyqResultModal from "@/components/PyqResultModal";

import {
  clearGuestExamHandoff,
  readGuestExamHandoff,
} from "@/lib/guestExamHandoff";

export default function ExamClient({
  exam,
  examId,
  questions = [],
  imagePath = "",
  uid = 0,
  cid,
  examType = "pqp",
  lastPosition,
  initialPauseId = null,
  governmentExamsSlug = "",
  guestAction = "",
}) {
  const router = useRouter();

  const id = examId ?? exam?.id;

  const handoff = [
    "pause",
    "submit",
  ].includes(guestAction);

  const [restored, setRestored] = useState(
    !handoff
  );

  const [
    restoreError,
    setRestoreError,
  ] = useState("");

  const restoredOnce = useRef(false);
  const appliedOnce = useRef(false);
  const autoSubmitted = useRef(false);
  const resumedQuestionScrolled = useRef(false);

  const controller = useExamController({
    exam,
    examId: id,
    questions,
    uid,
    cid,
    examType,
    lastPosition,
    initialPauseId,
    governmentExamsSlug,
    guestAction,
  });

  async function handlePauseAndReturn() {
    const saved = await controller.handlePause();

    if (saved) {
      router.replace(
        `/dashboard/${governmentExamsSlug}/previous-questions`
      );
    }
  }

  useEffect(() => {
    restoredOnce.current = false;
    appliedOnce.current = false;
    autoSubmitted.current = false;
    resumedQuestionScrolled.current = false;
  }, [
    id,
    guestAction,
    handoff,
  ]);

  useEffect(() => {
    if (
      !initialPauseId ||
      !controller.restoreReady ||
      !controller.lastAnsweredQuestionId ||
      resumedQuestionScrolled.current
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      const question = document.getElementById(
        `exam-question-${controller.lastAnsweredQuestionId}`
      );

      if (question) {
        question.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        resumedQuestionScrolled.current = true;
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [
    initialPauseId,
    controller.restoreReady,
    controller.lastAnsweredQuestionId,
  ]);

  /* RESTORE BEFORE SAVING */

  useEffect(() => {
    if (
      !handoff ||
      restoredOnce.current
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (restoredOnce.current) return;

      restoredOnce.current = true;

      try {
        const saved = readGuestExamHandoff({
          examId: id,
          examType,
          governmentExamsSlug,
        });

        if (
          !saved ||
          saved.action !== guestAction
        ) {
          throw new Error(
            "Saved exam progress could not be found. Return to the original exam tab."
          );
        }

        controller.restoreGuestAttempt(saved);
        setRestored(true);
      } catch (error) {
        setRestoreError(
          error.message ||
          "Unable to restore this exam."
        );
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [
    handoff,
    id,
    examType,
    governmentExamsSlug,
    guestAction,
    controller.restoreGuestAttempt,
  ]);

  /* SAVE AFTER LOGIN / PROFILE SETUP */

  useEffect(() => {
    if (
      !handoff ||
      !restored ||
      restoreError ||
      !controller.restoreReady ||
      appliedOnce.current
    ) {
      return;
    }

    appliedOnce.current = true;

    // Already saved before refresh.
    if (controller.submitted) return;

    if (guestAction === "submit") {
      controller.handleSubmit();
    } else {
      handlePauseAndReturn();
    }
  }, [
    handoff,
    restored,
    restoreError,
    guestAction,
    controller.restoreReady,
    controller.submitted,
    controller.handleSubmit,
    controller.handlePause,
    handlePauseAndReturn,
  ]);

  /* AUTOMATIC FINISH */

  useEffect(() => {
    if (
      !restored ||
      restoreError ||
      handoff ||
      !controller.timerFinished ||
      controller.submitted ||
      controller.saving ||
      autoSubmitted.current
    ) {
      return;
    }

    autoSubmitted.current = true;
    controller.handleSubmit();
  }, [
    restored,
    restoreError,
    handoff,
    controller.timerFinished,
    controller.submitted,
    controller.saving,
    controller.handleSubmit,
  ]);

  function viewAttempted() {
    if (!governmentExamsSlug) return;

    try {
      clearGuestExamHandoff();
    } catch {
      // Attempt is already saved to the backend.
    }

    router.push(
      `/dashboard/${encodeURIComponent(
        governmentExamsSlug
      )}/exam-attempted`
    );
  }

  if (restoreError) {
    return (
      <p
        role="alert"
        className="rounded-xl bg-red-50 p-5 text-red-700"
      >
        {restoreError}
      </p>
    );
  }

  if (
    !restored ||
    !controller.restoreReady
  ) {
    return (
      <div
        role={controller.saveError ? "alert" : "status"}
        className="rounded-xl bg-white p-5"
      >
        {controller.saveError ? (
          <>
            <p className="text-red-700">
              {controller.saveError}
            </p>
            <button
              type="button"
              className="mt-3 font-semibold text-blue-700 underline"
              onClick={() => window.location.reload()}
            >
              Retry loading saved exam
            </button>
          </>
        ) : (
          "Restoring your saved exam…"
        )}
      </div>
    );
  }

  if (!controller.totalQuestions) {
    return <ExamEmpty />;
  }

  const c = controller;

  return (
    <>
      <section className="space-y-6">
        {c.saveError && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 p-4 text-red-700"
          >
            {c.saveError} Your answers are retained.
            Use the action button to retry.
          </p>
        )}

        {c.paused && (
          <p
            role="status"
            className="rounded-xl bg-amber-50 p-4"
          >
            Exam paused. Answers and remaining time
            are saved.
          </p>
        )}

        <ExamHero
          exam={exam}
          totalQuestions={c.totalQuestions}
          currentPage={c.currentPage}
          totalPages={c.totalPages}
        />

        {c.durationMinutes > 0 && (
          <div className="flex justify-end">
            <ExamTimer
              remainingSeconds={c.remainingSeconds}
              durationMinutes={c.durationMinutes}
            />
          </div>
        )}

        {c.submitted && (
          <ExamResult
            totalQuestions={c.totalQuestions}
            answeredCount={c.answeredCount}
            correctCount={c.correctCount}
            wrongCount={c.wrongCount}
          />
        )}

        <ExamProgress
          answeredCount={c.answeredCount}
          totalQuestions={c.totalQuestions}
          progress={c.progress}
        />

        <ExamQuestionRange
          startIndex={c.startIndex}
          endIndex={c.endIndex}
          totalQuestions={c.totalQuestions}
          currentPage={c.currentPage}
          unansweredCount={c.unansweredCount}
        />

        <div
          className={
            c.saving ||
              c.paused ||
              handoff ||
              c.submitted
              ? "pointer-events-none"
              : ""
          }
        >
          <ExamQuestions
            questions={c.currentQuestions}
            startIndex={c.startIndex}
            answers={c.answers}
            submitted={c.submitted}
            imagePath={imagePath}
            onAnswer={c.handleAnswer}
          />
        </div>

        <ExamPagination
          currentPage={c.currentPage}
          totalPages={c.totalPages}
          onPrevious={c.handlePreviousPage}
          onNext={c.handleNextPage}
          onPageChange={c.handlePageChange}
        />

        {!c.submitted && (
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            {guestAction !== "submit" && (
              <ExamPause
                paused={c.paused}
                disabled={
                  !c.restoreReady ||
                  c.timerFinished ||
                  c.saving
                }
                onPause={handlePauseAndReturn}
                saving={c.saving}
              />
            )}

            <ExamSubmit
              answeredCount={c.answeredCount}
              totalQuestions={c.totalQuestions}
              onSubmit={c.handleSubmit}
              saving={c.saving}
            />
          </div>
        )}

        {c.timerFinished && !c.submitted && (
          <p
            role="status"
            className="rounded-xl bg-red-50 p-4 text-red-700"
          >
            Exam time has ended.{" "}
            {c.saveError
              ? "Use Submit & Finish to retry."
              : "Saving your exam…"}
          </p>
        )}

        {c.submitted && (
          <button
            type="button"
            onClick={() => c.handleSubmit()}
            className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white"
          >
            Show Result
          </button>
        )}
      </section>

      <PyqResultModal
        open={c.resultModalOpen}
        result={c.submittedResult}
        examTitle={
          exam?.exam_name ??
          exam?.title ??
          "Previous Questions"
        }
        onClose={c.closeResultModal}
        onViewAnalysis={viewAttempted}
      />
    </>
  );
}