"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  normalizeExamAnswer,
} from "@/lib/examAttemptData";

import {
  saveGuestExamHandoff,
  guestExamLoginRedirectPath,
} from "@/lib/guestExamHandoff";

import ExamHero from "./ExamHero";
import ExamProgress from "./ExamProgress";
import ExamQuestions from "./ExamQuestions";
import ExamPagination from "./ExamPagination";
import ExamControls from "./ExamControls";
import LoginRequiredModal from "./LoginRequiredModal";
import ExamTimeFinishedModal from "@/components/exam-timer/ExamTimeFinishedModal";

import {
  QUESTIONS_PER_PAGE,
} from "../utils/examUtils";

export default function ExamClient({
  exam,
  questions = [],
  imagePath = "",
  statementTypeSlug,
  examSlug,
  governmentExamsSlug = "kerala-psc",
  guestAction = "",
  uid = 0,
  cid = 1,
  examType = "tst",
}) {
  const router = useRouter();

  const examId = exam?.id;
  const signedIn = Number(uid) > 0;

  const durationMinutes =
    Number(exam?.total_minutes) || 0;

  const durationSeconds = Math.max(
    0,
    Math.floor(durationMinutes * 60)
  );

  const totalPages = Math.max(
    1,
    Math.ceil(questions.length / QUESTIONS_PER_PAGE)
  );

  const draftKey =
    `exam_draft_${signedIn ? uid : "guest"}_${cid}_${examType}_${examId}`;
  const publicCardPath =
    `/government-exams-coaching/${encodeURIComponent(governmentExamsSlug)}` +
    `/statement-type-exams/${encodeURIComponent(statementTypeSlug)}`;

  const requestRef = useRef(false);
  const timerFinishedRef = useRef(false);

  const [answers, setAnswers] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pauseId, setPauseId] = useState(null);

  const [startTime, setStartTime] = useState(
    () => Date.now()
  );

  const [endTime, setEndTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(
    durationSeconds
  );

  const [restoring, setRestoring] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [timeoutModalOpen, setTimeoutModalOpen] = useState(false);

  const [modalState, setModalState] = useState({
    open: false,
    action: "",
  });

  useEffect(() => {
    let cancelled = false;

    try {
      const raw = localStorage.getItem(draftKey);
      const draft = raw ? JSON.parse(raw) : null;

      const remaining = draft
        ? Math.max(
            0,
            Math.min(
              durationSeconds,
              Number(
                draft.remainingSeconds ?? draft.timeLeft
              ) || 0
            )
          )
        : durationSeconds;

      if (!cancelled) {
        if (draft) {
          setAnswers(draft.answers || {});
          setCurrentPage(
            Math.min(
              totalPages,
              Math.max(1, Number(draft.currentPage) || 1)
            )
          );
          setPauseId(draft.pauseId || null);
          setStartTime(
            Number(draft.startTime) || Date.now()
          );
        }

        setTimeLeft(remaining);
        setEndTime(Date.now() + remaining * 1000);
      }
    } catch {
      if (!cancelled) {
        setEndTime(
          Date.now() + durationSeconds * 1000
        );
      }
    } finally {
      if (!cancelled) setRestoring(false);
    }

    return () => {
      cancelled = true;
    };
  }, [draftKey, durationSeconds, totalPages]);

  useEffect(() => {
    if (restoring || endTime === null) return;

    const update = () => {
      setTimeLeft(
        Math.max(
          0,
          Math.ceil((endTime - Date.now()) / 1000)
        )
      );
    };

    update();

    const interval = window.setInterval(update, 1000);

    return () => window.clearInterval(interval);
  }, [endTime, restoring]);

  const currentQuestions = useMemo(() => {
    const start =
      (currentPage - 1) * QUESTIONS_PER_PAGE;

    return questions.slice(
      start,
      start + QUESTIONS_PER_PAGE
    );
  }, [questions, currentPage]);

  const answeredCount = questions.filter(
    (question, index) => {
      const id = String(question?.id ?? index + 1);
      return Boolean(normalizeExamAnswer(answers[id]));
    }
  ).length;

  const isTimeOver =
    durationSeconds > 0 && timeLeft <= 0;

  const locked =
    saving || restoring || isTimeOver;

  function handleAnswer(questionId, answer) {
    if (locked || requestRef.current) return;

    setAnswers((previous) => ({
      ...previous,
      [String(questionId)]: answer,
    }));
  }

  function handlePage(page) {
    if (saving || restoring || requestRef.current) {
      return;
    }

    setCurrentPage(
      Math.min(
        totalPages,
        Math.max(1, Number(page) || 1)
      )
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function openLoginModal(action) {
    setSaveError("");
    setModalState({
      open: true,
      action,
    });
  }

  function continueToDashboard(action) {
    try {
      saveGuestExamHandoff({
        examId,
        examType: "tst",
        governmentExamsSlug,
        statementTypeSlug,
        examSlug,
        action,
        answers,
        currentPage,
        remainingSeconds: timeLeft,
        startTime,
        endTime:
          action === "submit" ? Date.now() : null,
        pauseId,
        examTitle:
          exam?.exam_name || exam?.title || "",
      });

      if (signedIn) {
        const params = new URLSearchParams({
          examId: String(examId),
          guestAction: action,
        });
        router.push(
          `/dashboard/${encodeURIComponent(governmentExamsSlug)}` +
            `/statement-type-exams/${encodeURIComponent(statementTypeSlug)}` +
            `/${encodeURIComponent(examSlug)}/start?${params.toString()}`
        );
        return;
      }

      const redirect =
        guestExamLoginRedirectPath(action);

      router.push(
        `/login?redirect=${encodeURIComponent(redirect)}`
      );
    } catch (error) {
      setSaveError(
        error?.message ||
          "Unable to preserve exam progress."
      );
    }
  }

  function handleGuestLogin() {
    continueToDashboard(modalState.action);
  }

  function handlePause() {
    if (saving || restoring || isTimeOver) return;

    if (!signedIn) {
      openLoginModal("pause");
      return;
    }

    continueToDashboard("pause");
  }

  function handleFinish() {
    if (saving || restoring || isTimeOver) return;

    if (!signedIn) {
      openLoginModal("submit");
      return;
    }

    continueToDashboard("submit");
  }

  useEffect(() => {
    if (
      restoring ||
      !isTimeOver ||
      timerFinishedRef.current
    ) {
      return;
    }

    timerFinishedRef.current = true;

    if (!signedIn) {
      const timeout = window.setTimeout(
        () => setTimeoutModalOpen(true),
        0
      );
      return () => window.clearTimeout(timeout);
    } else {
      continueToDashboard("submit");
    }

    // Only execute once when the timer expires.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restoring, isTimeOver, signedIn]);

  useEffect(() => {
    if (!timeoutModalOpen) return undefined;

    const timeout = window.setTimeout(
      () => router.replace(publicCardPath),
      5000
    );

    return () => window.clearTimeout(timeout);
  }, [publicCardPath, router, timeoutModalOpen]);

  return (
    <>
      <LoginRequiredModal
        open={modalState.open}
        action={modalState.action}
        onClose={() =>
          setModalState({
            open: false,
            action: "",
          })
        }
        onLogin={handleGuestLogin}
      />
      <ExamTimeFinishedModal
        open={timeoutModalOpen}
        message="Your exam time has expired. Returning to the exams in 5 seconds."
        onBackToExams={() => router.replace(publicCardPath)}
      />

      <main className="min-h-screen bg-[#f5f9ff]">
        <div className="mx-auto w-full max-w-[1300px] px-4 py-8 sm:px-6 lg:px-8">
          <ExamHero
            exam={exam}
            questionsCount={questions.length}
            timeLeft={timeLeft}
            durationMinutes={durationMinutes}
            statementTypeSlug={statementTypeSlug}
            examSlug={examSlug}
            governmentExamsSlug={governmentExamsSlug}
          />

          <ExamProgress
            answeredCount={answeredCount}
            totalQuestions={questions.length}
            currentPage={currentPage}
            totalPages={totalPages}
          />

          {saveError && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">
              {saveError}
            </div>
          )}

          {isTimeOver && (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
              Time is over. You cannot change your answers.
            </div>
          )}

          <ExamQuestions
            questions={currentQuestions}
            currentPage={currentPage}
            answers={answers}
            onAnswer={handleAnswer}
            disabled={locked}
            imagePath={imagePath}
          />

          <ExamPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePage}
          />

          <ExamControls
            onPause={handlePause}
            onFinish={handleFinish}
            saving={saving}
            disabled={saving || restoring}
          />
        </div>
      </main>
    </>
  );
}