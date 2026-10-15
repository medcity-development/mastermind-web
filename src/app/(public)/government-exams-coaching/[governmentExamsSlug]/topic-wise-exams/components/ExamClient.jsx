"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useRouter,
  usePathname,
} from "next/navigation";

import Link from "next/link";

import {
  calculateExamResult,
  getAttemptId,
  getResultArray,
  parseAnswers,
  savedPausedTimeToSeconds,
  timestampToMilliseconds,
} from "@/lib/examAttemptData";

import {
  saveGuestExamHandoff,
  readGuestExamHandoff,
  clearGuestExamHandoff,
  guestExamLoginRedirectPath,
} from "@/lib/guestExamHandoff";

import ExamHero from "./ExamHero";
import ExamProgress from "./ExamProgress";
import ExamQuestions from "./ExamQuestions";
import ExamPagination from "./ExamPagination";
import ExamControls from "./ExamControls";

import ExamResultModal from "@/components/ExamResultModal";

function positiveId(value) {
  const number = Number(value);

  return Number.isSafeInteger(number) && number > 0
    ? number
    : null;
}

function failed(value) {
  return [
    false,
    "false",
    0,
    "0",
    "error",
    "failed",
  ].includes(value);
}

async function post(endpoint, payload) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "The exam API returned an invalid response."
    );
  }

  if (
    !response.ok ||
    !result ||
    failed(result.status)
  ) {
    const error = new Error(
      result?.message ||
      result?.msg ||
      "Unable to save the exam."
    );

    error.status = response.status;
    throw error;
  }

  return result;
}

export default function ExamClient({
  exam,
  examId,
  questions = [],
  imagePath = "",
  uid = 0,
  cid,
  slug = "",
  examSlug = "",
  examType = "twe",
  mode = "new",
  initialPauseId = null,
  governmentExamsSlug = "",
  guestAction = "",
}) {
  const router = useRouter();
  const pathname = usePathname();

  const id = examId ?? exam?.id;
  const type = "twe";

  const basePath =
    `${pathname?.startsWith("/dashboard/")
      ? "/dashboard"
      : "/government-exams-coaching"}` +
    `/${governmentExamsSlug}/topic-wise-exams`;

  const durationMinutes = Math.max(
    0,
    Number(exam?.total_minutes) || 0
  );

  const fullDuration = Math.round(
    durationMinutes * 60
  );

  const pageSize = 10;
  const totalQuestions = questions.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalQuestions / pageSize)
  );

  const isHandoff = [
    "pause",
    "submit",
  ].includes(guestAction);

  const draftKey =
    `exam_draft_${uid}_${cid}_${type}_${id}`;

  const [ready, setReady] = useState(false);

  const [
    handoffConsumed,
    setHandoffConsumed,
  ] = useState(false);

  const [restoreError, setRestoreError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [answers, setAnswers] = useState({});

  const [
    remainingSeconds,
    setRemainingSeconds,
  ] = useState(fullDuration);

  const [currentPage, setCurrentPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [paused, setPaused] = useState(false);

  const [
    resultModalOpen,
    setResultModalOpen,
  ] = useState(false);

  const [
    submittedResult,
    setSubmittedResult,
  ] = useState(null);

  const lock = useRef(false);
  const autoHandled = useRef(false);
  const timeoutHandled = useRef(false);

  const snapshot = useRef({
    answers: {},
    remainingSeconds: fullDuration,
    currentPage: 1,
    startTime: 0,
    endTime: null,
    pauseId: initialPauseId,
    boundUid: null,
    submittedResult: null,
    frozen: isHandoff,
  });

  const questionIds = useMemo(
    () => questions.map((q) => String(q.id)),
    [questions]
  );

  const answerKeys = useMemo(
    () =>
      questions.map(
        (q) =>
          q.answerkey ??
          q.answer ??
          q.correct_answer ??
          q.correctAnswer ??
          q.right_answer ??
          q.ans ??
          0
      ),
    [questions]
  );

  const stats = useMemo(
    () =>
      calculateExamResult({
        answerArray: answerKeys,

        userAnswers:
          questions.map(
            (q) => answers[String(q.id)] ?? 0
          ),

        markPerCorrect: 1,
        negativeMarkPerWrong: 0.333,
      }),
    [answers, questions, answerKeys]
  );

  function storeDraft() {
    try {
      localStorage.setItem(
        draftKey,
        JSON.stringify({
          ...snapshot.current,
          questionIds,
          savedAt: Date.now(),
        })
      );
    } catch {
      // Guest login uses checked storage below.
    }
  }

  function checkpoint(action) {
    return saveGuestExamHandoff({
      ...snapshot.current,
      examId: id,
      examType: type,
      cid,
      slug,
      examSlug,
      governmentExamsSlug,
      questionIds,
      action,
    });
  }

  /* RESTORE ANSWERS BEFORE SUBMITTING */

  useEffect(() => {
    let cancelled = false;

    setReady(false);
    setRestoreError("");

    async function restore() {
      try {
        let saved = null;

        if (isHandoff) {
          saved = readGuestExamHandoff({
            examId: id,
            examType: type,
            governmentExamsSlug,
          });

          if (
            !saved ||
            saved.action !== guestAction
          ) {
            throw new Error(
              "Saved Topic Wise answers could not be found. Reopen the original exam tab."
            );
          }

          if (Number(saved.cid) !== Number(cid)) {
            throw new Error(
              "Saved topic-wise course does not match this exam."
            );
          }

          if (
            saved.boundUid &&
            Number(saved.boundUid) !== Number(uid)
          ) {
            throw new Error(
              "This saved attempt belongs to another account."
            );
          }
        } else {
          try {
            saved = JSON.parse(
              localStorage.getItem(draftKey) || "null"
            );
          } catch {
            saved = null;
          }

          if (
            saved &&
            (
              !saved.savedAt ||
              Date.now() - saved.savedAt > 86400000
            )
          ) {
            saved = null;
          }
        }

        if (!isHandoff && mode === "resume") {
          if (
            !positiveId(uid) ||
            !positiveId(initialPauseId)
          ) {
            throw new Error(
              "Sign in and reopen the paused exam."
            );
          }

          const result = await post(
            "/api/exam-attempt/analytics-details",
            {
              cid,
              id: initialPauseId,
              exam_type: type,
            }
          );

          const row = getResultArray(result)[0];

          if (!row) {
            throw new Error(
              "Saved exam answers were not returned."
            );
          }

          if (
            row.exam_id != null &&
            String(row.exam_id) !== String(id)
          ) {
            throw new Error(
              "The paused attempt belongs to another exam."
            );
          }

          if (
            row.cid != null &&
            Number(row.cid) !== Number(cid)
          ) {
            throw new Error(
              "The paused attempt belongs to another course."
            );
          }

          const values = parseAnswers(row.user_answers);

          if (values.length !== questions.length) {
            throw new Error(
              "The saved answer array does not match this question paper."
            );
          }

          saved = {
            answers: Object.fromEntries(
              questions.map((q, index) => [
                String(q.id),
                values[index] ?? 0,
              ])
            ),

            questionIds,

            remainingSeconds:
              savedPausedTimeToSeconds(
                row.paused_time,
                fullDuration
              ),

            startTime:
              timestampToMilliseconds(
                row.start_time ??
                row.startTime ??
                row.started_at ??
                row.created_at
              ) ?? Date.now(),

            currentPage:
              String(saved?.pauseId) ===
                String(initialPauseId)
                ? saved.currentPage
                : 1,

            pauseId: initialPauseId,
            boundUid: Number(uid),
          };
        }

        if (saved) {
          if (
            !saved.answers ||
            typeof saved.answers !== "object" ||
            Array.isArray(saved.answers)
          ) {
            throw new Error(
              "Saved Topic Wise answers are invalid."
            );
          }

          if (
            JSON.stringify(saved.questionIds) !==
            JSON.stringify(questionIds)
          ) {
            throw new Error(
              "The Topic Wise question paper changed. This draft cannot be restored safely."
            );
          }

          if (
            !Number.isFinite(
              Number(saved.remainingSeconds)
            ) ||
            Number(saved.remainingSeconds) < 0 ||
            Number(saved.remainingSeconds) > fullDuration
          ) {
            throw new Error(
              "Saved exam time is invalid."
            );
          }
        }

        if (cancelled) return;

        snapshot.current = saved
          ? {
            answers: { ...saved.answers },

            remainingSeconds:
              Number(saved.remainingSeconds),

            currentPage: Math.max(
              1,
              Math.min(
                totalPages,
                Number(saved.currentPage) || 1
              )
            ),

            startTime:
              timestampToMilliseconds(
                saved.startTime
              ) ?? Date.now(),

            endTime: saved.endTime ?? null,
            pauseId: saved.pauseId ?? initialPauseId,
            boundUid: saved.boundUid ?? null,

            submittedResult:
              saved.submittedResult ?? null,

            frozen:
              isHandoff ||
              Boolean(saved.submittedResult) ||
              Boolean(saved.endTime),
          }
          : {
            answers: {},
            remainingSeconds: fullDuration,
            currentPage: 1,
            startTime: Date.now(),
            endTime: null,
            pauseId: initialPauseId,
            boundUid: null,
            submittedResult: null,
            frozen: false,
          };

        setAnswers(snapshot.current.answers);

        setRemainingSeconds(
          snapshot.current.remainingSeconds
        );

        setCurrentPage(
          snapshot.current.currentPage
        );

        if (snapshot.current.submittedResult) {
          setSubmitted(true);

          setSubmittedResult(
            snapshot.current.submittedResult
          );

          setResultModalOpen(true);
        }

        setReady(true);
      } catch (error) {
        if (!cancelled) {
          setRestoreError(
            error.message ||
            "Unable to restore this Topic Wise attempt."
          );
        }
      }
    }

    restore();

    return () => {
      cancelled = true;
    };
  }, [
    id,
    uid,
    cid,
    draftKey,
    mode,
    initialPauseId,
    fullDuration,
    totalPages,
    questions,
    questionIds,
    guestAction,
    isHandoff,
    governmentExamsSlug,
  ]);

  /* SAVE PAUSE / FINISH */

  async function save(action) {
    if (
      !ready ||
      restoreError ||
      lock.current
    ) {
      return false;
    }

    if (snapshot.current.submittedResult) {
      setResultModalOpen(true);
      return true;
    }

    lock.current = true;
    snapshot.current.frozen = true;

    setSaving(true);
    setSaveError("");

    if (action === "submit") {
      snapshot.current.endTime ??= Date.now();
    }

    try {
      if (!positiveId(uid)) {
        checkpoint(action);

        window.location.assign(
          `/login?redirect=${encodeURIComponent(
            guestExamLoginRedirectPath(action)
          )}`
        );

        return false;
      }

      const current = snapshot.current;

      const payload = {
        cid,
        exam_id: id,
        exam_type: type,
        lastposition: type,

        total_questions: totalQuestions,

        total_mark:
          Number(exam?.total_mark) || totalQuestions,

        remaining_seconds:
          current.remainingSeconds,

        start_time:
          current.startTime,

        ...(action === "submit"
          ? { end_time: current.endTime }
          : {}),

        answer_array: answerKeys,

        user_answers:
          questions.map(
            (q) =>
              current.answers[String(q.id)] ?? 0
          ),

        __scoring: {
          markPerCorrect: 1,
          negativeMarkPerWrong: 0.333,
        },
      };

      if (!current.pauseId) {
        const result = await post(
          "/api/topicwise-attempt",
          {
            ...payload,
            action: "create",
            exam_status: "pause",
          }
        );

        const createdId = positiveId(
          getAttemptId(result)
        );

        if (!createdId) {
          throw new Error(
            "The backend did not return the created attempt ID. Contact support before retrying."
          );
        }

        current.pauseId = createdId;
        current.boundUid = Number(uid);

        storeDraft();

        if (isHandoff) checkpoint(action);
      }

      const result = await post(
        "/api/topicwise-attempt",
        {
          ...payload,
          action: "update",
          pauseid: current.pauseId,

          exam_status:
            action === "submit"
              ? "finish"
              : "pause",
        }
      );

      if (action === "submit") {
        const finalResult = {
          ...result.savedResult,
          id: current.pauseId,
          pauseid: current.pauseId,
          exam_id: id,
          exam_type: type,

          exam_name:
            exam?.exam_name ??
            exam?.title ??
            "",
        };

        current.submittedResult = finalResult;

        setSubmittedResult(finalResult);
        setSubmitted(true);
        setResultModalOpen(true);

        try {
          localStorage.removeItem(draftKey);
        } catch { }

        if (isHandoff) {
          try {
            checkpoint(action);
          } catch { }
        }
      } else {
        setPaused(true);
        setHandoffConsumed(true);

        storeDraft();

        if (isHandoff) {
          try {
            clearGuestExamHandoff();
          } catch { }
        }

        const url = new URL(window.location.href);

        url.searchParams.delete("guestAction");

        window.history.replaceState(
          window.history.state,
          "",
          url.pathname + url.search + url.hash
        );
      }

      return true;
    } catch (error) {
      if (error.status === 401) {
        try {
          checkpoint(action);

          window.location.assign(
            `/login?redirect=${encodeURIComponent(
              guestExamLoginRedirectPath(action)
            )}`
          );
        } catch (failure) {
          setSaveError(failure.message);
        }
      } else {
        setSaveError(
          error.message ||
          "Unable to save. Your answers are retained; retry Finish."
        );
      }

      return false;
    } finally {
      lock.current = false;
      setSaving(false);
    }
  }

  /* APPLY GUEST ACTION AFTER LOGIN */

  useEffect(() => {
    if (
      !ready ||
      restoreError ||
      !isHandoff ||
      autoHandled.current
    ) {
      return;
    }

    autoHandled.current = true;

    if (!snapshot.current.submittedResult) {
      void save(guestAction);
    }
  }, [
    ready,
    restoreError,
    isHandoff,
    guestAction,
  ]);

  /* TIMER */

  useEffect(() => {
    if (
      !ready ||
      restoreError ||
      fullDuration <= 0 ||
      submitted ||
      paused ||
      saving ||
      snapshot.current.frozen ||
      remainingSeconds <= 0
    ) {
      return;
    }

    let lastTick = Date.now();

    const timer = window.setInterval(() => {
      if (
        snapshot.current.frozen ||
        lock.current
      ) {
        return;
      }

      const elapsed = Math.floor(
        (Date.now() - lastTick) / 1000
      );

      if (elapsed < 1) return;

      lastTick += elapsed * 1000;

      snapshot.current.remainingSeconds = Math.max(
        0,
        snapshot.current.remainingSeconds - elapsed
      );

      setRemainingSeconds(
        snapshot.current.remainingSeconds
      );

      storeDraft();
    }, 250);

    return () => window.clearInterval(timer);
  }, [
    ready,
    restoreError,
    submitted,
    paused,
    saving,
    remainingSeconds,
    draftKey,
  ]);

  useEffect(() => {
    if (
      !ready ||
      restoreError ||
      (isHandoff && !handoffConsumed) ||
      fullDuration <= 0 ||
      saving ||
      submitted ||
      paused ||
      remainingSeconds !== 0 ||
      timeoutHandled.current
    ) {
      return;
    }

    timeoutHandled.current = true;
    void save("submit");
  }, [
    ready,
    restoreError,
    isHandoff,
    handoffConsumed,
    saving,
    submitted,
    paused,
    remainingSeconds,
  ]);

  function handleAnswer(questionId, value) {
    if (
      !ready ||
      saving ||
      paused ||
      submitted ||
      snapshot.current.frozen ||
      (
        fullDuration > 0 &&
        snapshot.current.remainingSeconds <= 0
      )
    ) {
      return;
    }

    snapshot.current.answers = {
      ...snapshot.current.answers,
      [String(questionId)]: value,
    };

    setAnswers(snapshot.current.answers);
    storeDraft();
  }

  function handlePageChange(page) {
    if (!ready || saving) return;

    const next = Math.max(
      1,
      Math.min(
        totalPages,
        Number(page) || 1
      )
    );

    snapshot.current.currentPage = next;

    setCurrentPage(next);
    storeDraft();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handlePause() {
    if (
      paused &&
      !saving &&
      !submitted &&
      (
        fullDuration === 0 ||
        snapshot.current.remainingSeconds > 0
      )
    ) {
      snapshot.current.frozen = false;
      snapshot.current.endTime = null;

      setPaused(false);
      setSaveError("");
      return;
    }

    void save("pause");
  }

  function viewAttempted() {
    try {
      clearGuestExamHandoff();
    } catch { }

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

  if (!ready) {
    return (
      <p role="status" className="p-6">
        Restoring your Topic Wise exam…
      </p>
    );
  }

  const startIndex =
    (currentPage - 1) * pageSize;

  return (
    <main className="min-h-screen bg-[#f5f9ff] py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`${basePath}/test/${slug}/${examSlug}`}
            className="font-bold text-blue-700"
          >
            Back to Instructions
          </Link>

          <p className="rounded-xl bg-white px-4 py-3 font-black text-[#071f55]">
            {durationMinutes > 0
              ? `${Math.floor(remainingSeconds / 60)}:${String(
                remainingSeconds % 60
              ).padStart(2, "0")}`
              : "Untimed practice"}
          </p>
        </div>

        <ExamHero
          exam={exam}
          questionsCount={totalQuestions}
          timeLeft={remainingSeconds}
          durationMinutes={durationMinutes}
        />

        <ExamProgress
          answeredCount={stats.attempted}
          totalQuestions={totalQuestions}
          currentPage={currentPage}
          totalPages={totalPages}
        />

        {saveError && (
          <p
            role="alert"
            className="mt-5 rounded-xl bg-red-50 p-4 text-red-700"
          >
            {saveError}
          </p>
        )}

        {paused && (
          <p
            role="status"
            className="mt-5 rounded-xl bg-amber-50 p-4"
          >
            Exam paused. Select Resume to continue.
          </p>
        )}

        {submitted && (
          <p
            role="status"
            className="mt-5 rounded-xl bg-green-50 p-4 text-green-900"
          >
            Exam saved. Correct:{" "}
            {submittedResult?.total_correct}
            {" · "}Wrong:{" "}
            {submittedResult?.total_wrong}
            {" · "}Score:{" "}
            {submittedResult?.user_score}
          </p>
        )}

        <ExamQuestions
          questions={questions.slice(
            startIndex,
            startIndex + pageSize
          )}
          currentPage={currentPage}
          answers={answers}
          onAnswer={handleAnswer}
          disabled={
            saving ||
            submitted ||
            paused ||
            snapshot.current.frozen ||
            (
              fullDuration > 0 &&
              remainingSeconds <= 0
            )
          }
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

        {!submitted && (
          <ExamControls
            submitted={submitted}
            paused={paused}
            saving={saving}
            onPause={handlePause}
            onFinish={() => save("submit")}
          />
        )}

        {submitted && (
          <button
            type="button"
            onClick={() => setResultModalOpen(true)}
            className="mt-5 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white"
          >
            Show Result
          </button>
        )}
      </div>

      <ExamResultModal
        open={resultModalOpen}
        result={submittedResult}
        examTitle={
          exam?.exam_name ??
          exam?.title ??
          "Topic Wise Exam"
        }
        onClose={() => setResultModalOpen(false)}
        onViewAnalysis={viewAttempted}
      />
    </main>
  );
}