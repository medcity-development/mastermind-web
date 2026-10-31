
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";

import MockLoginModal from "./MockLoginModal";
import MockPauseButton from "./MockPauseButton";
import MockQuestionCard from "./MockQuestionCard";
import MockQuestionPagination from "./MockQuestionPagination";
import MockSubmitButton from "./MockSubmitButton";
import MockTestHeader from "./MockTestHeader";

import ExamTimeFinishedModal from "@/components/exam-timer/ExamTimeFinishedModal";

import {
  saveGuestExamHandoff,
  readGuestExamHandoff,
  clearGuestExamHandoff,
  guestExamLoginRedirectPath,
} from "@/lib/guestExamHandoff";

const QUESTIONS_PER_PAGE = 10;

function getAttemptId(result) {
  const value =
    result?.pauseid ??
    result?.attempt_id ??
    result?.id ??
    result?.data?.pauseid ??
    result?.data?.id;

  const number = Number(value);

  return Number.isSafeInteger(number) && number > 0
    ? number
    : null;
}

function getExamData(result) {
  if (Array.isArray(result?.exam)) {
    return result.exam[0] ?? null;
  }

  if (
    result?.exam &&
    typeof result.exam === "object"
  ) {
    return result.exam;
  }

  if (Array.isArray(result?.data)) {
    return result.data[0] ?? null;
  }

  return null;
}

function isSuccess(result) {
  return (
    result?.status === true ||
    result?.status === 1 ||
    result?.status === "1" ||
    result?.status === "true" ||
    result?.status === "success"
  );
}

export default function MockTestQuestions({
  examId,
  uid = 0,
  cid = 1,
  examTitle = "",
  examName = "Kerala PSC",
  governmentExamsSlug = "",
  guestAction = "",
}) {
  const router = useRouter();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [imagePath, setImagePath] = useState("");
  const [answers, setAnswers] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [remainingSeconds, setRemainingSeconds] =
    useState(0);

  const [timerStarted, setTimerStarted] =
    useState(false);

  const [loginModalOpen, setLoginModalOpen] =
    useState(false);

  const [modalReason, setModalReason] =
    useState("submit");

  const [paused, setPaused] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);

  const [timeFinishedOpen, setTimeFinishedOpen] =
    useState(false);

  const [savedAttemptId, setSavedAttemptId] =
    useState(null);

  const timeoutHandled = useRef(false);
  const examStartedAt = useRef(0);
  const examEndedAt = useRef(0);

  const restored = useRef(false);
  const saveInProgress = useRef(false);
  const completedAction = useRef(false);
  const handoffRef = useRef(null);

  const isAuthenticated = Number(uid) > 0;

  const dashboardPath =
    `/dashboard/${governmentExamsSlug}`;

  const examCardsPath =
    `/government-exams-coaching/${governmentExamsSlug}/mock-tests`;

  useEffect(() => {
    if (!timeFinishedOpen || isAuthenticated) return;
    const redirectTimer = window.setTimeout(() => {
      router.replace(examCardsPath);
    }, 5000);
    return () => window.clearTimeout(redirectTimer);
  }, [timeFinishedOpen, isAuthenticated, router, examCardsPath]);

  const totalPages = Math.max(
    1,
    Math.ceil(questions.length / QUESTIONS_PER_PAGE)
  );

  const pageNumbers = useMemo(
    () =>
      Array.from(
        { length: totalPages },
        (_, index) => index + 1
      ),
    [totalPages]
  );

  const startIndex =
    (currentPage - 1) * QUESTIONS_PER_PAGE;

  const visibleQuestions = questions.slice(
    startIndex,
    startIndex + QUESTIONS_PER_PAGE
  );

  const answeredCount = Object.keys(answers).filter(
    (key) =>
      answers[key] !== null &&
      answers[key] !== undefined &&
      String(answers[key]).trim() !== ""
  ).length;

  const unansweredCount = Math.max(
    0,
    questions.length - answeredCount
  );

  const interactionDisabled =
    saving ||
    paused ||
    submitted ||
    loginModalOpen ||
    timeFinishedOpen ||
    remainingSeconds <= 0;

  /* =========================================================
     SAVE MOCK ATTEMPT
  ========================================================= */

  const saveAttempt = useCallback(
    async ({
      action,
      attemptAnswers,
      seconds,
      startTime,
      existingAttemptId,
    }) => {
      if (saveInProgress.current) {
        return null;
      }

      saveInProgress.current = true;
      setSaving(true);
      setError("");

      try {
        const response = await fetch(
          "/api/mock-attempt",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
            body: JSON.stringify({
              cid,
              exam_id: examId,
              action: existingAttemptId
                ? "update"
                : "create",
              pauseid:
                existingAttemptId ?? undefined,
              exam_status:
                action === "pause"
                  ? "pause"
                  : "finish",
              answers: attemptAnswers,
              remaining_seconds: seconds,
              start_time: startTime,
            }),
          }
        );

        const result = await response.json();

        if (
          !response.ok ||
          !isSuccess(result)
        ) {
          throw new Error(
            result?.message ||
              "Unable to save Mock Test attempt."
          );
        }

        const attemptId =
          getAttemptId(result) ??
          existingAttemptId;

        setSavedAttemptId(attemptId ?? null);

        return {
          result,
          attemptId,
        };
      } catch (err) {
        setError(
          err?.message ||
            "Unable to save Mock Test."
        );

        return null;
      } finally {
        saveInProgress.current = false;
        setSaving(false);
      }
    },
    [cid, examId]
  );

  /* =========================================================
     COMPLETE PAUSE OR SUBMIT
  ========================================================= */

  const completeAction = useCallback(
    async ({
      action,
      attemptAnswers,
      seconds,
      startTime,
      existingAttemptId,
      fromHandoff = false,
    }) => {
      if (completedAction.current) {
        return;
      }

      completedAction.current = true;

      const saved = await saveAttempt({
        action,
        attemptAnswers,
        seconds,
        startTime,
        existingAttemptId,
      });

      if (!saved) {
        completedAction.current = false;
        return;
      }

      if (fromHandoff) {
        clearGuestExamHandoff();
        handoffRef.current = null;
      }

      setTimerStarted(false);
      setLoginModalOpen(false);

      if (action === "pause") {
        setPaused(true);
      } else {
        setSubmitted(true);
        setResultOpen(true);
      }
    },
    [saveAttempt]
  );

  /* =========================================================
     LOAD MOCK TEST
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadExam() {
      try {
        setLoading(true);
        setError("");
        setTimerStarted(false);

        timeoutHandled.current = false;
        restored.current = false;
        completedAction.current = false;
        handoffRef.current = null;

        setTimeFinishedOpen(false);
        setPaused(false);
        setSubmitted(false);
        setResultOpen(false);

        const detailsParams =
          new URLSearchParams({
            cid: String(cid),
            examid: String(examId),
            type: "mock",
          });

        const questionsParams =
          new URLSearchParams({
            cid: String(cid),
            examid: String(examId),
            examtype: "mock",
          });

        const [
          detailsResponse,
          questionsResponse,
        ] = await Promise.all([
          fetch(
            `/api/mock-tests/details?${detailsParams}`,
            { cache: "no-store" }
          ),
          fetch(
            `/api/mock-tests/questions?${questionsParams}`,
            { cache: "no-store" }
          ),
        ]);

        const detailsResult =
          await detailsResponse.json();

        const questionsResult =
          await questionsResponse.json();

        if (!detailsResponse.ok) {
          throw new Error(
            detailsResult?.message ||
              "Unable to load Mock Test details."
          );
        }

        if (!questionsResponse.ok) {
          throw new Error(
            questionsResult?.message ||
              "Unable to load Mock Test questions."
          );
        }

        const examData =
          getExamData(detailsResult);

        const questionList =
          Array.isArray(questionsResult?.data)
            ? questionsResult.data
            : [];

        if (cancelled) return;

        setExam(examData);
        setQuestions(questionList);

        setImagePath(
          questionsResult?.img_path ||
            questionsResult?.imagePath ||
            ""
        );

        const duration = Number(
          examData?.total_minutes
        );

        const initialSeconds =
          (
            Number.isFinite(duration) &&
            duration > 0
              ? duration
              : 90
          ) * 60;

        let saved = null;

        if (
          isAuthenticated &&
          guestAction
        ) {
          saved = readGuestExamHandoff({
            examId,
            examType: "mock",
            governmentExamsSlug,
          });

          if (
            saved &&
            saved.action !== guestAction
          ) {
            saved = null;
          }
        }

        if (saved) {
          const expectedIds =
            Array.isArray(saved.questionIds)
              ? saved.questionIds.map(String)
              : [];

          const actualIds =
            questionList.map((question) =>
              String(question?.id)
            );

          if (
            expectedIds.length > 0 &&
            (
              expectedIds.length !==
                actualIds.length ||
              expectedIds.some(
                (id, index) =>
                  id !== actualIds[index]
              )
            )
          ) {
            throw new Error(
              "The Mock Test questions changed since your guest attempt. Your saved answers have not been submitted."
            );
          }

          const restoredAnswers =
            saved.answers &&
            typeof saved.answers === "object"
              ? saved.answers
              : {};

          const restoredSeconds =
            Math.max(
              0,
              Math.min(
                initialSeconds,
                Number(
                  saved.remainingSeconds
                ) || 0
              )
            );

          const restoredPage =
            Math.max(
              1,
              Math.min(
                Math.ceil(
                  questionList.length /
                    QUESTIONS_PER_PAGE
                ) || 1,
                Number(
                  saved.currentPage
                ) || 1
              )
            );

          setAnswers(restoredAnswers);
          setCurrentPage(restoredPage);
          setRemainingSeconds(
            restoredSeconds
          );

          examStartedAt.current =
            Number(saved.startTime) ||
            Date.now();

          handoffRef.current = saved;
        } else {
          setAnswers({});
          setCurrentPage(1);
          setRemainingSeconds(
            initialSeconds
          );

          examStartedAt.current =
            Date.now();
        }

        setTimerStarted(true);
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.message ||
              "Unable to load Mock Test."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (examId) {
      loadExam();
    }

    return () => {
      cancelled = true;
    };
  }, [
    examId,
    cid,
    isAuthenticated,
    guestAction,
    governmentExamsSlug,
  ]);

  /* =========================================================
     RESTORE GUEST HANDOFF AFTER LOGIN
  ========================================================= */

  useEffect(() => {
    if (
      !isAuthenticated ||
      !guestAction ||
      loading ||
      questions.length === 0 ||
      restored.current ||
      !handoffRef.current
    ) {
      return;
    }

    restored.current = true;

    const saved =
      handoffRef.current;

    completeAction({
      action: saved.action,
      attemptAnswers: saved.answers,
      seconds: Math.max(
        0,
        Number(
          saved.remainingSeconds
        ) || 0
      ),
      startTime:
        Number(saved.startTime) ||
        Date.now(),
      fromHandoff: true,
    });
  }, [
    isAuthenticated,
    guestAction,
    loading,
    questions.length,
    completeAction,
  ]);

  /* =========================================================
     COUNTDOWN TIMER
  ========================================================= */

  useEffect(() => {
    if (
      !timerStarted ||
      loginModalOpen ||
      paused ||
      submitted ||
      saving ||
      timeFinishedOpen ||
      handoffRef.current ||
      remainingSeconds <= 0
    ) {
      return;
    }

    const interval =
      window.setInterval(() => {
        setRemainingSeconds(
          (previous) =>
            Math.max(
              0,
              previous - 1
            )
        );
      }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [
    timerStarted,
    loginModalOpen,
    paused,
    submitted,
    saving,
    timeFinishedOpen,
    remainingSeconds,
  ]);

  /* =========================================================
     TIME FINISHED

     Do not open login modal.
     Do not automatically submit.
     Show common timeout modal.
  ========================================================= */

  useEffect(() => {
    if (
      !timerStarted ||
      remainingSeconds > 0 ||
      timeoutHandled.current ||
      paused ||
      submitted ||
      saving ||
      loginModalOpen ||
      completedAction.current ||
      handoffRef.current
    ) {
      return;
    }

    timeoutHandled.current = true;
    examEndedAt.current = Date.now();

    setTimerStarted(false);
    setTimeFinishedOpen(true);
  }, [
    timerStarted,
    remainingSeconds,
    paused,
    submitted,
    saving,
    loginModalOpen,
  ]);

  /* =========================================================
     QUESTION ANSWERS
  ========================================================= */

  function handleAnswer(
    questionId,
    answer
  ) {
    if (interactionDisabled) {
      return;
    }

    setAnswers((previous) => ({
      ...previous,
      [questionId]: answer,
    }));
  }

  /* =========================================================
     PAGINATION
  ========================================================= */

  function handlePageChange(page) {
    if (
      interactionDisabled ||
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =========================================================
     GUEST LOGIN REDIRECT
  ========================================================= */

  function redirectToLogin(action) {
    if (
      timeFinishedOpen ||
      remainingSeconds <= 0
    ) {
      return;
    }

    try {
      saveGuestExamHandoff({
        examId,
        examType: "mock",
        governmentExamsSlug,
        cid,
        action,
        answers,

        questionIds: questions.map(
          (question) =>
            String(question?.id)
        ),

        currentPage,
        remainingSeconds,

        startTime:
          examStartedAt.current ||
          Date.now(),

        endTime:
          examEndedAt.current ||
          Date.now(),

        examTitle:
          examTitle ||
          exam?.exam_name ||
          "",

        returnPath:
          window.location.pathname +
          window.location.search,
      });

      const destination =
        guestExamLoginRedirectPath(
          action
        );

      router.push(
        `/login?redirect=${encodeURIComponent(
          destination
        )}`
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to save guest progress."
      );

      setLoginModalOpen(false);
    }
  }

  /* =========================================================
     PAUSE / SUBMIT
  ========================================================= */

  function requestAction(action) {
    if (
      saving ||
      paused ||
      submitted ||
      timeFinishedOpen ||
      remainingSeconds <= 0 ||
      completedAction.current
    ) {
      return;
    }

    examEndedAt.current =
      Date.now();

    if (!isAuthenticated) {
      setModalReason(action);
      setLoginModalOpen(true);
      return;
    }

    completeAction({
      action,
      attemptAnswers: answers,
      seconds: remainingSeconds,

      startTime:
        examStartedAt.current ||
        Date.now(),

      existingAttemptId:
        savedAttemptId,
    });
  }

  function handleLogin() {
    if (
      timeFinishedOpen ||
      remainingSeconds <= 0
    ) {
      return;
    }

    redirectToLogin(
      modalReason === "pause"
        ? "pause"
        : "submit"
    );
  }

  function handleCloseModal() {
    setLoginModalOpen(false);
  }

  function handleBackToExams() {
    setTimeFinishedOpen(false);
    setTimerStarted(false);

    router.replace(examCardsPath);
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-3xl border bg-white">
        <div className="text-center">
          <Loader2
            size={30}
            className="mx-auto animate-spin text-blue-600"
          />

          <p className="mt-3 text-sm font-bold text-slate-500">
            Loading mock test...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (
    error &&
    questions.length === 0
  ) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-14 text-center">
        <AlertCircle
          size={28}
          className="mx-auto text-rose-500"
        />

        <p className="mt-3 text-sm font-bold text-rose-600">
          {error}
        </p>
      </div>
    );
  }

  if (
    questions.length === 0
  ) {
    return (
      <div className="rounded-3xl border bg-white px-6 py-14 text-center text-slate-500">
        No questions available for this exam.
      </div>
    );
  }

  /* =========================================================
     MAIN EXAM UI
  ========================================================= */

  return (
    <>
      <section className="overflow-hidden rounded-[26px] border border-[#dce8f7] bg-white shadow-lg">

        <MockTestHeader
          exam={exam}
          examTitle={examTitle}
          examName={examName}
          remainingSeconds={
            remainingSeconds
          }
        />

        {/* EXAM STATISTICS */}

        <div className="grid grid-cols-2 gap-3 border-b bg-[#f8fbff] px-5 py-4 sm:grid-cols-4 sm:px-7">

          <StatBox
            label="Questions"
            value={questions.length}
          />

          <StatBox
            label="Marks"
            value={
              exam?.total_mark ?? "-"
            }
          />

          <StatBox
            label="Answered"
            value={answeredCount}
          />

          <StatBox
            label="Remaining"
            value={unansweredCount}
          />

        </div>

        {/* ERROR MESSAGE */}

        {error && (
          <div
            role="alert"
            className="mx-5 mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
          >
            {error}
          </div>
        )}

        {/* PAUSE CONFIRMATION */}

        {paused && (
          <div className="mx-5 mt-5 rounded-xl border border-amber-200 bg-amber-50 p-5">

            <h3 className="font-bold text-amber-900">
              You have paused your exam
            </h3>

            <p className="mt-2 text-sm text-amber-800">
              Your answers and remaining
              time have been saved
              successfully.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  dashboardPath
                )
              }
              className="mt-4 rounded-xl bg-amber-700 px-5 py-3 text-sm font-bold text-white"
            >
              Go to Dashboard
            </button>

          </div>
        )}

        {/* QUESTIONS */}

        <div className="space-y-5 px-5 py-7 sm:px-7">

          {visibleQuestions.map(
            (question, index) => {
              const questionNumber =
                startIndex +
                index +
                1;

              const questionId =
                question?.id ??
                questionNumber;

              return (
                <div
                  key={questionId}
                  className={
                    interactionDisabled
                      ? "pointer-events-none opacity-75"
                      : ""
                  }
                >
                  <MockQuestionCard
                    question={question}
                    questionNumber={
                      questionNumber
                    }
                    selectedAnswer={
                      answers[questionId]
                    }
                    imagePath={
                      imagePath
                    }
                    onAnswer={(
                      answer
                    ) =>
                      handleAnswer(
                        questionId,
                        answer
                      )
                    }
                  />
                </div>
              );
            }
          )}

        </div>

        {/* PAGINATION */}

        <div
          className={
            interactionDisabled
              ? "pointer-events-none opacity-60"
              : ""
          }
        >
          <MockQuestionPagination
            currentPage={
              currentPage
            }
            totalPages={
              totalPages
            }
            pages={
              pageNumbers
            }
            onPageChange={
              handlePageChange
            }
          />
        </div>

        {/* ACTION BUTTONS */}

        {!paused &&
          !submitted &&
          !timeFinishedOpen && (
            <div className="flex flex-col gap-3 border-t bg-[#f8fbff] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">

              <MockPauseButton
                onPause={() =>
                  requestAction(
                    "pause"
                  )
                }
                saving={saving}
              />

              <MockSubmitButton
                onSubmit={() =>
                  requestAction(
                    "submit"
                  )
                }
                saving={saving}
                disabled={
                  remainingSeconds <= 0 ||
                  interactionDisabled
                }
              />

            </div>
          )}

      </section>

      {/* GUEST LOGIN MODAL */}

      <MockLoginModal
        open={loginModalOpen}
        reason={modalReason}
        onClose={
          handleCloseModal
        }
        onLogin={
          handleLogin
        }
      />

      {/* COMMON TIME FINISHED MODAL */}

      <ExamTimeFinishedModal
        open={timeFinishedOpen}
        message="Your exam time has expired. Returning to the exam cards in 5 seconds."
        onBackToExams={
          handleBackToExams
        }
      />

      {/* RESULT MODAL */}

      {resultOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 p-4">

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mock-result-title"
            className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl"
          >

            <h2
              id="mock-result-title"
              className="text-xl font-black text-[#071f55]"
            >
              Mock Test Submitted
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Your Mock Test attempt has
              been saved. You can view
              your result and analysis
              from your dashboard.
            </p>

            <div className="mt-6 flex flex-col gap-3">

              {savedAttemptId && (
                <button
                  type="button"
                  onClick={() => {
                    const query =
                      new URLSearchParams({
                        attemptId:
                          String(
                            savedAttemptId
                          ),
                        examType:
                          "mock",
                        title:
                          examTitle ||
                          exam?.exam_name ||
                          "Mock Test",
                      });

                    router.push(
                      `${dashboardPath}/exam-analysis?${query}`
                    );
                  }}
                  className="rounded-xl bg-[#075fc8] px-5 py-3 font-bold text-white"
                >
                  View Analysis
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  router.push(
                    `${dashboardPath}/exam-attempted`
                  )
                }
                className="rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-700"
              >
                View Attempted Exams
              </button>

            </div>

          </div>
        </div>
      )}

    </>
  );
}

/* =========================================================
   STATISTICS COMPONENT
========================================================= */

function StatBox({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3">

      <p className="text-[17px] font-black text-[#071f55]">
        {value}
      </p>

      <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

    </div>
  );
}
