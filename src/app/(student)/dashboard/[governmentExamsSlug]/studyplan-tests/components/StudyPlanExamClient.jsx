"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LogIn,
  PauseCircle,
  Send,
} from "lucide-react";

import ExamPauseConfirmModal from "@/components/ExamPauseConfirmModal";
import ExamResultModal from "@/components/ExamResultModal";
import ExamNavigationGuard from "@/components/exam/ExamNavigationGuard";
import {
  clearGuestExamHandoff,
  guestExamLoginRedirectPath,
  readGuestExamHandoff,
  saveGuestExamHandoff,
} from "@/lib/guestExamHandoff";
import {
  getAttemptId,
  getStudyPlanLastPosition,
  getStudyPlanRemainingSeconds,
  restoreStudyPlanAnswers,
  selectStudyPlanPausedAttempt,
  buildStudyPlanAttemptPayload,
  buildStudyPlanResult,
  getDurationSeconds,
  getQuestionOptions,
  extractStudyPlanExam,
  extractStudyPlanInstructions,
  QUESTIONS_PER_PAGE,
} from "./utils/examUtils";
import {
  timestampToMilliseconds,
} from "@/lib/examAttemptData";
import { getPausedAttemptIds } from "@/lib/pausedExamAttempts";
import QuestionCard from "./QuestionCard";
import ExamTimer from "./ExamTimer";

async function getJson(url) {
  const response = await fetch(url, {
    cache: "no-store",
  });
  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("Exam service returned an invalid response.");
  }

  if (!response.ok || result?.status === false) {
    throw new Error(
      result?.message ||
      result?.msg ||
      "Unable to load Study Plan exam."
    );
  }

  return result;
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("Exam service returned an invalid response.");
  }

  if (!response.ok || result?.status === false) {
    throw new Error(
      result?.message ||
      result?.msg ||
      "Unable to save Study Plan attempt."
    );
  }

  return result;
}

function extractQuestions(result) {
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.questions)) return result.questions;
  if (Array.isArray(result?.details)) return result.details;
  return [];
}

export default function StudyPlanExamClient({
  examId,
  cid,
  uid = 0,
  governmentExamsSlug,
  examTitle = "",
  basePath,
  guestAction = "",
  initialPauseId = null,
}) {
  const router = useRouter();
  const authenticated = Number(uid) > 0;
  const savingRef = useRef(false);
  const submittedRef = useRef(false);
  const automaticFinishRef = useRef(false);
  const guestSubmitHandledRef = useRef(false);

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [pauseId, setPauseId] = useState(
    Number.isSafeInteger(Number(initialPauseId)) &&
      Number(initialPauseId) > 0
      ? Number(initialPauseId)
      : null
  );
  const [startTime, setStartTime] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPosition, setLastPosition] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pauseConfirmOpen, setPauseConfirmOpen] = useState(false);
  const [guestActionOpen, setGuestActionOpen] = useState(false);
  const [pendingGuestAction, setPendingGuestAction] = useState("");
  const [timeoutModalOpen, setTimeoutModalOpen] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);

  const questionPages = Math.max(
    1,
    Math.ceil(questions.length / QUESTIONS_PER_PAGE)
  );
  const currentQuestions = questions.slice(
    (currentPage - 1) * QUESTIONS_PER_PAGE,
    currentPage * QUESTIONS_PER_PAGE
  );
  const answeredCount = questions.reduce(
    (count, question, index) =>
      answers[question?.id ?? index + 1] ? count + 1 : count,
    0
  );
  const title =
    exam?.exam_name ||
    exam?.title ||
    examTitle ||
    "Study Plan Test";
  const cardsPath = basePath || `/dashboard/${governmentExamsSlug}/studyplan-tests`;
  const detailsPath = `${cardsPath}/${encodeURIComponent(String(examId))}?${new URLSearchParams({
    title,
  }).toString()}`;

  useEffect(() => {
    let cancelled = false;

    async function loadExam() {
      setLoading(true);
      setLoadError("");

      try {
        const detailParams = new URLSearchParams({
          cid: String(cid),
          examid: String(examId),
          type: "studyplan",
          offset: "0",
          resume: "1",
        });
        const details = await getJson(
          `/api/mock-tests/details?${detailParams.toString()}`
        );
        const loadedExam = extractStudyPlanExam(details, examId);

        if (!loadedExam) {
          throw new Error("Study Plan exam details were not returned.");
        }

        const questionParams = new URLSearchParams({
          cid: String(cid),
          examid: String(examId),
          examtype: "studyplan",
        });
        const questionResult = await getJson(
          `/api/mock-tests/questions?${questionParams.toString()}`
        );
        const loadedQuestions = extractQuestions(questionResult);

        if (!loadedQuestions.length) {
          throw new Error("No questions were returned for this Study Plan exam.");
        }

        let guestAttempt = null;
        if (guestAction === "pause" || guestAction === "submit") {
          if (!authenticated) {
            throw new Error("Please sign in to continue your saved exam action.");
          }

          guestAttempt = readGuestExamHandoff({
            examId,
            examType: "studyplan",
            governmentExamsSlug,
          });

          if (guestAttempt?.action !== guestAction) {
            throw new Error(
              "Your saved guest exam progress is unavailable. Return to the Study Plan test card and start again."
            );
          }

          if (guestAttempt.questionIds?.length) {
            const ids = loadedQuestions.map((question) =>
              String(question?.id ?? "")
            );
            const savedIds = guestAttempt.questionIds.map(String);

            if (
              ids.length !== savedIds.length ||
              ids.some((id, index) => id !== savedIds[index])
            ) {
              throw new Error(
                "The exam questions changed. Your guest answers have not been submitted."
              );
            }
          }
        }

        const pausedAttempt = guestAttempt
          ? null
          : selectStudyPlanPausedAttempt(details, {
              examId,
              uid,
              cid,
            });
        const resumedPauseId =
          Number.isSafeInteger(Number(initialPauseId)) &&
          Number(initialPauseId) > 0
            ? Number(initialPauseId)
            : getAttemptId(pausedAttempt);
        const duration = getDurationSeconds(loadedExam);
        const restoredAnswers = guestAttempt
          ? guestAttempt.answers
          : restoreStudyPlanAnswers(
              loadedQuestions,
              pausedAttempt?.user_answers
            );
        const initialTime = guestAttempt
          ? Math.max(
              0,
              Number(guestAttempt.remainingSeconds) || 0
            )
          : pausedAttempt
            ? getStudyPlanRemainingSeconds(pausedAttempt, loadedExam)
            : Number.isFinite(duration) && duration > 0
              ? Math.floor(duration)
              : 0;
        const initialLastPosition = guestAttempt
          ? Math.max(
              1,
              Math.min(
                loadedQuestions.length,
                Number(guestAttempt.lastPosition) ||
                  (Number(guestAttempt.currentPage) - 1) *
                    QUESTIONS_PER_PAGE +
                    1
              )
            )
          : getStudyPlanLastPosition(
              pausedAttempt,
              loadedQuestions
            );

        if (duration <= 0) {
          throw new Error("The Study Plan exam duration is missing.");
        }

        if (cancelled) return;

        setExam(loadedExam);
        setQuestions(loadedQuestions);
        setInstructions(extractStudyPlanInstructions(details));
        setAnswers(restoredAnswers);
        setPauseId(resumedPauseId || null);
        setStartTime(
          timestampToMilliseconds(
            guestAttempt?.startTime ??
            pausedAttempt?.start_time ??
            pausedAttempt?.startTime
          ) || 0
        );
        setHasStarted(
          guestAction === "pause" ||
          guestAction === "submit"
        );
        setRemainingSeconds(initialTime);
        setLastPosition(initialLastPosition);
        setCurrentPage(
          Math.max(
            1,
            Math.min(
              Math.max(
                1,
                Math.ceil(loadedQuestions.length / QUESTIONS_PER_PAGE)
              ),
              Math.ceil(
                initialLastPosition / QUESTIONS_PER_PAGE
              )
            )
          )
        );

        if (guestAction === "pause") {
          setPauseConfirmOpen(true);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("STUDY PLAN EXAM LOAD:", error);
          setLoadError(
            error?.message || "Unable to load Study Plan exam."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadExam();

    return () => {
      cancelled = true;
    };
  }, [
    authenticated,
    cid,
    examId,
    guestAction,
    governmentExamsSlug,
    initialPauseId,
    uid,
  ]);

  const finishExam = useCallback(async (timedOut = false) => {
    if (
      savingRef.current ||
      submittedRef.current ||
      !questions.length
    ) {
      return false;
    }

    savingRef.current = true;
    setSaving(true);
    setSaveError("");

    try {
      let activePauseId = pauseId;

      if (!activePauseId) {
        try {
          const savedAttempts = await postJson(
            "/api/exam-attempt/user-exams",
            {
              cid,
              exam_type: "studyplan",
            }
          );
          const pausedIds = getPausedAttemptIds(savedAttempts);
          const existingPauseId = Number(pausedIds[String(examId)]);

          if (
            Number.isSafeInteger(existingPauseId) &&
            existingPauseId > 0
          ) {
            activePauseId = existingPauseId;
            setPauseId(existingPauseId);
          }
        } catch (lookupError) {
          console.warn(
            "Unable to look up paused Study Plan attempt:",
            lookupError
          );
        }
      }

      const payload = buildStudyPlanAttemptPayload({
        cid,
        examId,
        exam,
        questions,
        answers,
        examStatus: "finish",
        remainingSeconds: timedOut ? 0 : remainingSeconds,
        startTime,
        pauseId: activePauseId,
        lastPosition,
      });
      const saved = activePauseId
        ? await postJson("/api/exam-attempt/update", payload)
        : await postJson("/api/exam-attempt/create", payload);
      const attemptId = getAttemptId(saved) ?? activePauseId;

      if (!attemptId) {
        throw new Error("The saved attempt ID was not returned.");
      }

      const result = buildStudyPlanResult({
        exam,
        questions,
        answers,
        attemptId,
      });

      submittedRef.current = true;
      setSubmittedResult(result);
      setResultModalOpen(true);
      setPauseConfirmOpen(false);
      setGuestActionOpen(false);
      setTimeoutModalOpen(false);
      clearGuestExamHandoff();

      try {
        localStorage.removeItem(
          `exam_draft_${uid}_${cid}_studyplan_${examId}`
        );
      } catch (storageError) {
        console.warn(
          "Unable to clear Study Plan local draft:",
          storageError
        );
      }

      return true;
    } catch (error) {
      console.error("STUDY PLAN EXAM SUBMIT:", error);
      setSaveError(
        timedOut
          ? `${error?.message || "Unable to submit exam."} Please retry submission.`
          : error?.message || "Unable to submit Study Plan exam."
      );
      return false;
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }, [
    answers,
    cid,
    exam,
    examId,
    pauseId,
    uid,
    questions,
    remainingSeconds,
    startTime,
    lastPosition,
  ]);

  const pauseExam = useCallback(async () => {
    if (
      savingRef.current ||
      submittedRef.current ||
      !questions.length ||
      remainingSeconds <= 0
    ) {
      return false;
    }

    savingRef.current = true;
    setSaving(true);
    setSaveError("");

    try {
      const payload = buildStudyPlanAttemptPayload({
        cid,
        examId,
        exam,
        questions,
        answers,
        examStatus: "pause",
        remainingSeconds,
        startTime,
        pauseId,
        lastPosition,
      });
      const saved = pauseId
        ? await postJson("/api/exam-attempt/update", payload)
        : await postJson("/api/exam-attempt/create", payload);
      const savedId = getAttemptId(saved) ?? pauseId;

      if (!savedId) {
        throw new Error("Pause ID was not returned.");
      }

      try {
        localStorage.setItem(
          `exam_draft_${uid}_${cid}_studyplan_${examId}`,
          JSON.stringify({
            pauseId: savedId,
            answers,
            remainingSeconds,
            currentPage,
          })
        );
      } catch (storageError) {
        console.warn("Unable to save Study Plan local draft:", storageError);
      }

      clearGuestExamHandoff();
      router.push(detailsPath);
      return true;
    } catch (error) {
      console.error("STUDY PLAN EXAM PAUSE:", error);
      setSaveError(
        error?.message || "Unable to save Study Plan exam progress."
      );
      return false;
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }, [
    answers,
    cid,
    currentPage,
    detailsPath,
    exam,
    examId,
    pauseId,
    questions,
    remainingSeconds,
    router,
    startTime,
    uid,
    lastPosition,
  ]);

  useEffect(() => {
    if (
      loading ||
      !hasStarted ||
      saving ||
      submittedRef.current ||
      resultModalOpen ||
      timeoutModalOpen ||
      !questions.length
    ) {
      return undefined;
    }

    if (remainingSeconds <= 0) {
      if (!authenticated) {
        const timeout = window.setTimeout(
          () => setTimeoutModalOpen(true),
          0
        );
        return () => window.clearTimeout(timeout);
      } else if (!automaticFinishRef.current) {
        automaticFinishRef.current = true;
        void finishExam(true);
      }

      return undefined;
    }

    const interval = window.setInterval(() => {
      setRemainingSeconds((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [
    authenticated,
    finishExam,
    hasStarted,
    loading,
    questions.length,
    remainingSeconds,
    resultModalOpen,
    saving,
    timeoutModalOpen,
  ]);

  useEffect(() => {
    if (
      loading ||
      !hasStarted ||
      guestAction !== "submit" ||
      guestSubmitHandledRef.current
    ) {
      return;
    }

    guestSubmitHandledRef.current = true;
    void finishExam(remainingSeconds <= 0);
  }, [finishExam, guestAction, hasStarted, loading, remainingSeconds]);

  function chooseAction(action) {
    if (saving || submittedRef.current) return;

    if (!authenticated) {
      setPendingGuestAction(action);
      setGuestActionOpen(true);
      return;
    }

    if (action === "pause") {
      setPauseConfirmOpen(true);
    } else {
      void finishExam(false);
    }
  }

  function continueToLogin() {
    try {
      saveGuestExamHandoff({
        examId,
        examType: "studyplan",
        governmentExamsSlug,
        action: pendingGuestAction,
        answers,
        questionIds: questions.map((question) =>
          String(question?.id ?? "")
        ),
        currentPage,
        lastPosition,
        remainingSeconds,
        startTime,
        examTitle: title,
        returnPath:
          window.location.pathname + window.location.search,
      });

      router.push(
        `/login?redirect=${encodeURIComponent(
          guestExamLoginRedirectPath(pendingGuestAction)
        )}`
      );
    } catch (error) {
      setSaveError(
        error?.message || "Unable to preserve your exam progress."
      );
    }
  }

  function navigateToAnalysis() {
    const attemptId = submittedResult?.id;

    if (!attemptId) {
      setSaveError("The saved result ID is missing.");
      return;
    }

    const query = new URLSearchParams({
      attemptId: String(attemptId),
      examType: "studyplan",
      title,
    });

    router.push(
      `/dashboard/${encodeURIComponent(
        governmentExamsSlug
      )}/exam-analysis?${query.toString()}`
    );
  }

  function selectAnswer(question, answer) {
    const availableOptions = getQuestionOptions(question);
    if (!availableOptions.includes(answer)) return;

    const questionIndex = questions.indexOf(question);
    const key = question?.id ?? questionIndex + 1;
    setLastPosition(questionIndex + 1);
    setAnswers((current) => ({
      ...current,
      [key]: answer,
    }));
  }

  function beginExam() {
    if (!startTime) {
      setStartTime(Date.now());
    }
    setHasStarted(true);
  }

  if (loading) {
    return (
      <section className="flex min-h-[50vh] items-center justify-center text-sm font-semibold text-slate-500">
        Loading Study Plan exam...
      </section>
    );
  }

  if (loadError) {
    return (
      <section role="alert" className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        <p className="font-bold">Unable to open this Study Plan exam</p>
        <p className="mt-2">{loadError}</p>
        <button
          type="button"
          onClick={() => router.push(detailsPath)}
          className="mt-5 rounded-xl bg-blue-700 px-4 py-2 font-bold text-white"
        >
          Return to exams
        </button>
      </section>
    );
  }

  if (!hasStarted) {
    return (
      <main className="mx-auto w-full max-w-9xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm">
          <header className="bg-gradient-to-r from-[#071f55] to-[#017dc0] p-6 text-white sm:p-9">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-100">
              Study Plan Exam Instructions
            </p>
            <h1 className="mt-2 text-2xl font-black sm:text-3xl">{title}</h1>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-blue-100">
              <span>{questions.length} Questions</span>
              <span>{exam?.total_minutes || Math.ceil(remainingSeconds / 60)} Minutes</span>
              <span>
                {exam?.total_mark ?? exam?.total_marks ?? questions.length} Total Marks
              </span>
            </div>
          </header>

          <div className="p-6 sm:p-9">
            <h2 className="text-lg font-black text-[#071f55]">
              Read all instructions before starting
            </h2>
            {instructions.length ? (
              <ol className="mt-5 space-y-3">
                {instructions.map((instruction, index) => (
                  <li
                    key={`${index}-${instruction}`}
                    className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-black text-blue-800">
                      {index + 1}
                    </span>
                    <span className="whitespace-pre-wrap">{instruction}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                No additional instructions were provided for this exam.
              </p>
            )}

            {saveError && (
              <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {saveError}
              </p>
            )}

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => router.push(detailsPath)}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700"
              >
                Back to exams
              </button>
              <button
                type="button"
                onClick={beginExam}
                className="rounded-xl bg-gradient-to-r from-blue-700 to-violet-600 px-6 py-3 text-sm font-black text-white"
              >
                {pauseId ? "Resume Exam" : "Start Exam"}
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main
      data-exam-workspace
      className="mx-auto w-full max-w-9xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <ExamNavigationGuard
        active={
          hasStarted &&
          questions.length > 0 &&
          !loading &&
          !submittedResult
        }
      />
      <header className="mb-6 rounded-2xl bg-gradient-to-r from-[#071f55] to-[#017dc0] p-5 text-white sm:flex sm:items-center sm:justify-between sm:p-7">
        <div>
          <button
            type="button"
            onClick={() => router.push(detailsPath)}
            data-exam-exit
            disabled={saving}
            className="mb-4 inline-flex items-center gap-2 text-xs font-bold text-blue-100 hover:text-white"
          >
            <ArrowLeft size={15} />
            Exams
          </button>
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-100">
            Study Plan Exam
          </p>
          <h1 className="mt-2 text-xl font-black sm:text-2xl">{title}</h1>
          <p className="mt-2 text-xs text-blue-100">
            {answeredCount} of {questions.length} answered
          </p>
        </div>
        <div className="mt-5 sm:mt-0">
          <ExamTimer seconds={remainingSeconds} />
        </div>
      </header>

      {saveError && (
        <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div className="flex-1">{saveError}</div>
          {authenticated && remainingSeconds <= 0 && !submittedResult && (
            <button
              type="button"
              onClick={() => void finishExam(true)}
              disabled={saving}
              className="shrink-0 font-bold underline"
            >
              Retry
            </button>
          )}
        </div>
      )}

      <section className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <CheckCircle2 size={16} className="text-emerald-600" />
          Page {currentPage} of {questionPages}
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: questionPages }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentPage(index + 1)}
              disabled={saving || remainingSeconds <= 0}
              aria-current={currentPage === index + 1 ? "page" : undefined}
              className={`h-9 min-w-9 rounded-lg px-2 text-xs font-bold ${
                currentPage === index + 1
                  ? "bg-blue-700 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-blue-50"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </section>

      <div className="space-y-4">
        {currentQuestions.map((question, index) => {
          const questionIndex =
            (currentPage - 1) * QUESTIONS_PER_PAGE + index;

          return (
            <QuestionCard
              key={question?.id ?? questionIndex}
              question={question}
              index={questionIndex}
              selectedAnswer={
                answers[question?.id ?? questionIndex + 1] || ""
              }
              disabled={saving || remainingSeconds <= 0}
              onSelect={(answer) =>
                selectAnswer(question, answer)
              }
            />
          );
        })}
      </div>

      <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <button
          type="button"
          onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          disabled={currentPage <= 1 || saving || remainingSeconds <= 0}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-700 disabled:opacity-40"
        >
          <ArrowLeft size={15} />
          Previous
        </button>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => chooseAction("pause")}
            disabled={saving || remainingSeconds <= 0}
            className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-800 disabled:opacity-40"
          >
            <PauseCircle size={16} />
            Pause
          </button>
          <button
            type="button"
            onClick={() => chooseAction("submit")}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-violet-600 px-4 py-3 text-xs font-bold text-white disabled:opacity-50"
          >
            <Send size={15} />
            Finish Exam
          </button>
          <button
            type="button"
            onClick={() =>
              setCurrentPage((page) => Math.min(questionPages, page + 1))
            }
            disabled={
              currentPage >= questionPages ||
              saving ||
              remainingSeconds <= 0
            }
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-700 disabled:opacity-40"
          >
            Next
            <ArrowRight size={15} />
          </button>
        </div>
      </footer>

      <ExamPauseConfirmModal
        open={pauseConfirmOpen}
        saving={saving}
        onClose={() => setPauseConfirmOpen(false)}
        onConfirm={() => void pauseExam()}
      />

      {guestActionOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4">
          <section role="dialog" aria-modal="true" className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <LogIn size={23} />
            </span>
            <h2 className="mt-4 text-xl font-black text-[#071f55]">
              Sign in to {pendingGuestAction === "pause" ? "pause" : "finish"} this exam
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Your answers will be kept and restored after you sign in.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setGuestActionOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600"
              >
                Continue Exam
              </button>
              <button
                type="button"
                onClick={continueToLogin}
                className="flex-1 rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white"
              >
                Continue to Login
              </button>
            </div>
          </section>
        </div>
      )}

      {timeoutModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/65 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="studyplan-timeout-title" className="w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertCircle size={27} />
            </div>
            <h2 id="studyplan-timeout-title" className="mt-4 text-xl font-black text-[#071f55]">
              Your time is up
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This guest attempt was not submitted. Return to the exams to try again.
            </p>
            <button
              type="button"
              onClick={() => router.push(detailsPath)}
              className="mt-6 w-full rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white"
            >
              Return to Exams
            </button>
          </section>
        </div>
      )}

      <ExamResultModal
        open={resultModalOpen}
        result={submittedResult}
        examTitle={title}
        notice={
          authenticated && remainingSeconds <= 0
            ? "Time expired. Your exam was submitted automatically."
            : ""
        }
        onClose={navigateToAnalysis}
        onViewAnalysis={navigateToAnalysis}
      />
    </main>
  );
}
