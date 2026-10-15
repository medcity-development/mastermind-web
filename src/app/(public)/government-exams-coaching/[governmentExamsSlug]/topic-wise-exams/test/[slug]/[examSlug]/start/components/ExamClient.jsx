"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  saveGuestExamHandoff,
} from "@/lib/guestExamHandoff";

import ExamTopBar from "./ExamTopBar";
import ExamHero from "./ExamHero";
import ExamProgress from "./ExamProgress";
import ExamQuestions from "./ExamQuestions";
import ExamPagination from "./ExamPagination";
import ExamControls from "./ExamControls";
import LoginRequiredModal from "./LoginRequiredModal";

const QUESTIONS_PER_PAGE = 10;

function positiveId(value) {
  const number = Number(value);

  return Number.isSafeInteger(number) && number > 0
    ? number
    : null;
}

export default function ExamClient({
  exam,
  questions = [],
  imagePath = "",
  uid = 0,
  cid,
  slug = "",
  examSlug = "",
  governmentExamsSlug = "",
  examName = "Kerala PSC",
  examId,
  examTitle = "",
}) {
  const router = useRouter();

  const selectedExamId = positiveId(examId ?? exam?.id);

  const durationMinutes = Math.max(
    0,
    Number(exam?.total_minutes) || 0
  );

  const durationSeconds = Math.floor(
    durationMinutes * 60
  );

  const totalPages = Math.max(
    1,
    Math.ceil(questions.length / QUESTIONS_PER_PAGE)
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [handoffError, setHandoffError] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  const [modalState, setModalState] = useState({
    open: false,
    action: "",
  });

  const clock = useRef(null);
  const answerSnapshot = useRef({});
  const pendingAttempt = useRef(null);
  const navigationLock = useRef(false);

  const questionIds = useMemo(
    () => questions.map((question) => String(question.id)),
    [questions]
  );

  /*
   * Start the timer after mounting.
   * The deadline measures actual elapsed time.
   */
  useEffect(() => {
    const startTime = Date.now();

    clock.current = {
      startTime,
      deadline:
        durationSeconds > 0
          ? startTime + durationSeconds * 1000
          : null,
    };

    setTimeLeft(durationSeconds);
  }, [selectedExamId, durationSeconds]);

  /*
   * Freeze the clock while an attempt is awaiting login.
   */
  useEffect(() => {
    if (
      durationSeconds <= 0 ||
      modalState.open ||
      redirecting
    ) {
      return;
    }

    function tick() {
      const deadline = clock.current?.deadline;

      if (!deadline) return;

      setTimeLeft(
        Math.max(
          0,
          Math.ceil((deadline - Date.now()) / 1000)
        )
      );
    }

    tick();

    const timer = window.setInterval(tick, 250);

    return () => window.clearInterval(timer);
  }, [durationSeconds, modalState.open, redirecting]);

  const currentQuestions = useMemo(() => {
    const start =
      (currentPage - 1) * QUESTIONS_PER_PAGE;

    return questions.slice(
      start,
      start + QUESTIONS_PER_PAGE
    );
  }, [questions, currentPage]);

  const answeredCount = questions.reduce(
    (count, question) => {
      const answer = answers[String(question.id)];

      const answered =
        answer != null &&
        String(answer).trim() !== "" &&
        String(answer).trim() !== "0";

      return count + (answered ? 1 : 0);
    },
    0
  );

  const isTimeOver =
    durationSeconds > 0 && timeLeft <= 0;

  function remainingAt(now) {
    if (durationSeconds <= 0) return 0;

    return Math.max(
      0,
      Math.ceil(
        ((clock.current?.deadline ?? now) - now) / 1000
      )
    );
  }

  function handleAnswer(questionId, answer) {
    if (
      modalState.open ||
      redirecting ||
      pendingAttempt.current ||
      (
        durationSeconds > 0 &&
        remainingAt(Date.now()) <= 0
      )
    ) {
      return;
    }

    const nextAnswers = {
      ...answerSnapshot.current,
      [String(questionId)]: answer,
    };

    answerSnapshot.current = nextAnswers;
    setAnswers(nextAnswers);
  }

  function handlePageChange(page) {
    if (redirecting) return;

    const nextPage = Math.max(
      1,
      Math.min(totalPages, Number(page) || 1)
    );

    setCurrentPage(nextPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /*
   * Capture answers and the finish time when Finish is clicked,
   * before the user spends time logging in.
   */
  function captureAttempt(action) {
    const courseId = positiveId(cid);

    if (
      !courseId ||
      !selectedExamId ||
      !governmentExamsSlug ||
      !slug ||
      !examSlug
    ) {
      throw new Error(
        "Exam information is incomplete. Please reopen this exam."
      );
    }

    if (
      !questions.length ||
      questions.some((question) => question.id == null) ||
      new Set(questionIds).size !== questionIds.length
    ) {
      throw new Error(
        "The question paper is incomplete or contains duplicate question IDs."
      );
    }

    if (!clock.current?.startTime) {
      throw new Error(
        "The exam is still loading. Please try again."
      );
    }

    const now = Date.now();
    const remainingSeconds = remainingAt(now);

    setTimeLeft(remainingSeconds);

    return {
      examId: selectedExamId,
      examType: "twe",
      cid: courseId,
      governmentExamsSlug,

      slug,
      topicSlug: slug,
      examSlug,

      action,
      answers: { ...answerSnapshot.current },
      questionIds: [...questionIds],
      currentPage,

      remainingSeconds,
      startTime: clock.current.startTime,
      endTime: action === "submit" ? now : null,

      pauseId: null,
      boundUid: null,
      submittedResult: null,
      frozen: true,

      examTitle:
        examTitle ||
        exam?.exam_name ||
        exam?.title ||
        "Topic Wise Exam",
    };
  }

  function continueAttempt(attempt) {
    if (navigationLock.current) return;

    navigationLock.current = true;
    setHandoffError("");

    try {
      saveGuestExamHandoff(attempt);

      const destination =
        `/dashboard/${encodeURIComponent(governmentExamsSlug)}` +
        `/topic-wise-exams/test/${encodeURIComponent(slug)}` +
        `/${encodeURIComponent(examSlug)}/start` +
        `?guestAction=${attempt.action}`;

      setRedirecting(true);

      if (positiveId(uid)) {
        router.push(destination);
      } else {
        router.push(
          `/login?redirect=${encodeURIComponent(destination)}`
        );
      }
    } catch (error) {
      navigationLock.current = false;
      setRedirecting(false);

      setHandoffError(
        error?.message ||
        "Unable to retain your answers. Please retry."
      );
    }
  }

  function requestAction(action) {
    if (redirecting || modalState.open) return;

    setHandoffError("");

    try {
      const attempt = captureAttempt(action);
      pendingAttempt.current = attempt;

      setModalState({
        open: true,
        action: action === "pause" ? "pause" : "finish",
      });

      // A signed-in user can continue without another login.
      if (positiveId(uid)) {
        continueAttempt(attempt);
      }
    } catch (error) {
      setHandoffError(
        error?.message || "Unable to prepare this attempt."
      );
    }
  }

  function handleLogin() {
    const attempt = pendingAttempt.current;

    if (!attempt) {
      setHandoffError(
        "Please close this dialog and select Finish again."
      );
      return;
    }

    continueAttempt(attempt);
  }

  function handleCloseModal() {
    if (redirecting) return;

    const attempt = pendingAttempt.current;

    if (clock.current && durationSeconds > 0 && attempt) {
      clock.current.deadline =
        Date.now() + attempt.remainingSeconds * 1000;

      setTimeLeft(attempt.remainingSeconds);
    }

    pendingAttempt.current = null;
    navigationLock.current = false;

    setHandoffError("");

    setModalState({
      open: false,
      action: "",
    });
  }

  const disabled =
    isTimeOver || modalState.open || redirecting;

  return (
    <>
      <main className="min-h-screen bg-[#f5f9ff]">
        <div className="mx-auto mt-20 w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <ExamTopBar
            slug={slug}
            examSlug={examSlug}
            governmentExamsSlug={governmentExamsSlug}
            examId={selectedExamId}
            examTitle={
              examTitle || exam?.exam_name || ""
            }
            timeLeft={timeLeft}
            durationMinutes={durationMinutes}
          />

          <ExamHero
            exam={exam}
            questionsCount={questions.length}
            timeLeft={timeLeft}
            durationMinutes={durationMinutes}
            examName={examName}
          />

          <ExamProgress
            answeredCount={answeredCount}
            totalQuestions={questions.length}
            currentPage={currentPage}
            totalPages={totalPages}
          />

          {durationSeconds <= 0 && (
            <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-700">
              Untimed practice. No exam duration was
              received from the API.
            </p>
          )}

          {isTimeOver && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="font-black text-red-700">
                Time is over
              </p>

              <p className="mt-1 text-sm text-red-600">
                Your answers are locked. Select Finish
                to save your attempt.
              </p>
            </div>
          )}

          {handoffError && (
            <p
              role="alert"
              className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700"
            >
              {handoffError}
            </p>
          )}

          {redirecting && (
            <p
              role="status"
              className="mt-5 rounded-xl bg-blue-50 p-4 text-sm text-blue-700"
            >
              Continuing with your saved answers…
            </p>
          )}

          <ExamQuestions
            questions={currentQuestions}
            currentPage={currentPage}
            answers={answers}
            onAnswer={handleAnswer}
            disabled={disabled}
            imagePath={imagePath}
          />

          <ExamPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevious={() =>
              handlePageChange(currentPage - 1)
            }
            onNext={() =>
              handlePageChange(currentPage + 1)
            }
            onPageChange={handlePageChange}
          />

          {!redirecting && (
            <ExamControls
              onPause={() => requestAction("pause")}
              onFinish={() => requestAction("submit")}
            />
          )}

          {redirecting && positiveId(uid) && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl border border-blue-200 px-4 py-2 text-sm font-bold text-blue-700"
            >
              Reload if navigation does not complete
            </button>
          )}

          {!redirecting &&
            modalState.open &&
            positiveId(uid) &&
            handoffError && (
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleLogin}
                  className="rounded-xl bg-blue-700 px-4 py-2 font-bold text-white"
                >
                  Retry
                </button>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-xl border px-4 py-2 font-bold"
                >
                  Cancel
                </button>
              </div>
            )}
        </div>
      </main>

      {!positiveId(uid) && (
        <LoginRequiredModal
  open={modalState.open}
  action={modalState.action}
  onClose={handleCloseModal}
  onLogin={handleLogin}
  error={handoffError}
/>
      )}
    </>
  );
}
