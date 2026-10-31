"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  getAttemptId,
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

import ScertExamHeader from "./ScertExamHeader";
import ScertQuestionList from "./ScertQuestionList";
import ScertPagination from "./ScertPagination";
import ScertExamActions from "./ScertExamActions";


import ExamResultModal from "@/components/ExamResultModal";
import ExamPauseConfirmationModal from "@/app/(student)/dashboard/common-components/exam/ExamPauseConfirmationModal";
import ExamTimeFinishedModal from "@/components/exam-timer/ExamTimeFinishedModal";
import LoginRequiredModal from "@/app/(public)/government-exams-coaching/[governmentExamsSlug]/previous-questions/[examId]/components/LoginRequiredModal";

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

export default function ScertExamClient({
  exam,
  examId,
  questions = [],
  imagePath = "",
  uid = 0,
  cid,
  classId,
  testSlug,
  examType = "scert",
  lastPosition = "scert",
  durationMinutes = 90,
  questionsPerPage = 10,
  mode = "new",
  initialPauseId = null,
  governmentExamsSlug = "",
  guestAction = "",
}) {
  const router = useRouter();

  const id = examId ?? exam?.id;
  const type = "scert";

  const fullDuration = Math.max(
    0,
    Math.round(
      (Number(durationMinutes) || 90) * 60
    )
  );

  const pageSize = Math.max(
    1,
    Number(questionsPerPage) || 10
  );

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
    showPauseModal,
    setShowPauseModal,
  ] = useState(false);

  const [loginAction, setLoginAction] = useState("");
  const [interactionFrozen, setInteractionFrozen] = useState(isHandoff);
  const authenticated = Boolean(positiveId(uid));
  const cardsPath = `${authenticated ? "/dashboard" : "/government-exams-coaching"}/${encodeURIComponent(governmentExamsSlug)}/scert-tests/classes/${encodeURIComponent(classId)}`;
  const guestTimedOut = ready && !restoreError && !authenticated && remainingSeconds === 0 && !loginAction;

  useEffect(() => {
    if (!guestTimedOut) return;
    try { localStorage.removeItem(draftKey); } catch { /* Storage may be unavailable. */ }
    const timer = window.setTimeout(() => router.replace(cardsPath), 5000);
    return () => window.clearTimeout(timer);
  }, [guestTimedOut, cardsPath, router, draftKey]);

  const [
    resultModalOpen,
    setResultModalOpen,
  ] = useState(false);

  const [
    submittedResult,
    setSubmittedResult,
  ] = useState(null);

  const [initialStartTime] = useState(Date.now);
  const lock = useRef(false);
  const autoHandled = useRef(false);
  const timeoutHandled = useRef(false);

  const snapshot = useRef({
    answers: {},
    remainingSeconds: fullDuration,
    currentPage: 1,
    startTime: initialStartTime,
    endTime: null,
    pauseId: initialPauseId,
    boundUid: null,
    submittedResult: null,
    frozen: isHandoff,
  });

  const questionIds = useMemo(
    () => questions.map((question) => String(question.id)),
    [questions]
  );

  const answerKeys = useMemo(
    () =>
      questions.map(
        (question) =>
          question.answerkey ??
          question.answer ??
          question.correct_answer ??
          question.correctAnswer ??
          0
      ),
    [questions]
  );

  const answeredCount = useMemo(
    () =>
      questions.reduce((count, question) => {
        const answer = answers[String(question.id)];
        return count + (answer != null && String(answer).trim() !== "" && String(answer) !== "0" ? 1 : 0);
      }, 0),
    [answers, questions]
  );

  /* LOCAL DRAFT */

  const storeDraft = useCallback(() => {
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
  }, [draftKey, questionIds]);

  const checkpoint = useCallback((action) => {
    return saveGuestExamHandoff({
      ...snapshot.current,
      examId: id,
      examType: type,
      cid,
      classId,
      testSlug,
      governmentExamsSlug,
      questionIds,
      action,
    });
  }, [id, cid, classId, testSlug, governmentExamsSlug, questionIds]);

  /* RESTORE DRAFT / GUEST / PAUSED ATTEMPT */

  useEffect(() => {
    let cancelled = false;


    async function restore() {
      try {
        let saved = null;
        let row = null;
        let resolvedPauseId = null;

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
              "Saved SCERT answers could not be found. Reopen the original exam tab."
            );
          }

          if (
            Number(saved.cid) !== Number(cid) ||
            String(saved.classId) !== String(classId)
          ) {
            throw new Error(
              "Saved SCERT course or class does not match this exam."
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

        if (!isHandoff && authenticated) {
          const query = new URLSearchParams({ cid: String(cid), exam_id: String(id) });
          const response = await fetch(`/api/scert-attempt?${query}`, { cache: "no-store" });
          const result = await response.json();
          if (!response.ok || failed(result?.status)) {
            throw new Error(result?.message || "Unable to load paused SCERT progress.");
          }
          row = result.paused ?? null;
          resolvedPauseId = positiveId(getAttemptId(row));
          if (mode === "resume" && (!resolvedPauseId || (initialPauseId && String(initialPauseId) !== String(resolvedPauseId)))) {
            throw new Error("This paused attempt is no longer available. Reopen the exam from its cards.");
          }
          // Only reuse a local draft after its saved attempt is verified by the server.
          if (!resolvedPauseId || String(saved?.pauseId) !== String(resolvedPauseId)) saved = null;
        }

        if (row) {
          const values = parseAnswers(
            row.user_answers
          );

          if (values.length !== questions.length) {
            throw new Error(
              "The saved answer array does not match this question paper."
            );
          }

          saved = {
            answers: Object.fromEntries(
              questions.map((question, index) => [
                String(question.id),
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
                String(resolvedPauseId)
                ? saved.currentPage
                : 1,

            pauseId: resolvedPauseId,
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
              "Saved SCERT answers are invalid."
            );
          }

          if (
            JSON.stringify(saved.questionIds) !==
            JSON.stringify(questionIds)
          ) {
            throw new Error(
              "The SCERT question paper changed. This draft cannot be restored safely."
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
            pauseId: saved.pauseId ?? resolvedPauseId,
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
            pauseId: resolvedPauseId,
            boundUid: null,
            submittedResult: null,
            frozen: false,
          };

        setInteractionFrozen(snapshot.current.frozen);
        setShowPauseModal(isHandoff && guestAction === "pause" && !snapshot.current.submittedResult);
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
            "Unable to restore this SCERT attempt."
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
    classId,
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
    authenticated,
  ]);

  /* SAVE PAUSE / FINISH */

  const save = useCallback(async (action) => {
    if (
      !ready ||
      restoreError ||
      lock.current ||
      paused ||
      ((action === "pause" || !authenticated) && snapshot.current.remainingSeconds <= 0)
    ) {
      return false;
    }

    if (snapshot.current.submittedResult) {
      setResultModalOpen(true);
      return true;
    }

    lock.current = true;
    const wasFrozen = snapshot.current.frozen;
    let success = false;
    let redirecting = false;
    snapshot.current.frozen = true;
    setInteractionFrozen(true);

    setSaving(true);
    setSaveError("");


    if (action === "submit") {
      snapshot.current.endTime ??= Date.now();
    }

    try {
      /*
       * Guest: save answers before leaving.
       * No protected save API is called here.
       */
      if (!positiveId(uid)) {
        checkpoint(action);

        redirecting = true;
        router.push(
          `/login?redirect=${encodeURIComponent(
            guestExamLoginRedirectPath(action)
          )}`
        );

        return false;
      }

      const current = snapshot.current;

      const userAnswers = questions.map(
        (question) =>
          current.answers[String(question.id)] ?? 0
      );

      const payload = {
        cid,
        exam_id: id,
        exam_type: type,
        lastposition: lastPosition || type,

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
        user_answers: userAnswers,

        __scoring: {
          markPerCorrect: 1,
          negativeMarkPerWrong: 0.333,
        },
      };

      const isResuming = Boolean(current.pauseId);
      const result = await post(
        "/api/scert-attempt",
        {
          ...payload,
          action: isResuming ? "update" : "create",
          exam_status:
            action === "submit"
              ? "finish"
              : "pause",
          ...(isResuming
            ? { pauseid: current.pauseId }
            : {}),
        }
      );

      if (!isResuming) {
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

        if (action !== "submit") storeDraft();
        if (isHandoff) {
          try { checkpoint(action); } catch { /* The backend already saved this attempt. */ }
        }
      }

      success = true;
      setShowPauseModal(false);
      setLoginAction("");
      if (action === "submit") {
        const finalResult = {
          ...result.savedResult,
          exam_status: "finish",
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
        storeDraft();

        if (isHandoff) {
          try {
            clearGuestExamHandoff();
          } catch { }
        }

        router.replace(cardsPath);
      }

      return true;
    } catch (error) {
      if (error.status === 401) {
        try {
          checkpoint(action);

          redirecting = true;
          router.push(
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
      if (!success && !redirecting) {
        snapshot.current.frozen = wasFrozen;
        if (!wasFrozen) snapshot.current.endTime = null;
        setInteractionFrozen(wasFrozen);
      }
    }
  }, [ready, restoreError, paused, authenticated, uid, checkpoint, router, cid, id, lastPosition, totalQuestions, exam, questions, answerKeys, storeDraft, isHandoff, draftKey, cardsPath]);

  /* CONTINUE THE GUEST ACTION AFTER LOGIN */

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

    if (guestAction === "submit" && !snapshot.current.submittedResult) {
      void save("submit");
    }
  }, [
    ready,
    restoreError,
    isHandoff,
    guestAction,
    save,
  ]);

  /* TIMER */

  useEffect(() => {
    if (
      !ready ||
      restoreError ||
      submitted ||
      paused ||
      saving ||
      showPauseModal ||
      loginAction ||
      interactionFrozen ||
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
    showPauseModal,
    loginAction,
    interactionFrozen,
    remainingSeconds,
    draftKey,
    storeDraft,
  ]);

  /* TIMEOUT */

  useEffect(() => {
    if (
      !ready ||
      restoreError ||
      !authenticated ||
      interactionFrozen ||
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
    authenticated,
    interactionFrozen,
    saving,
    submitted,
    paused,
    remainingSeconds,
    save,
  ]);

  function handleAnswer(questionId, value) {
    if (
      !ready ||
      saving ||
      paused ||
      submitted ||
      snapshot.current.frozen ||
      snapshot.current.remainingSeconds <= 0
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
    if (!ready || saving || paused || submitted || interactionFrozen || remainingSeconds <= 0) return;

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

  function continueExam() {
    if (saving) return;
    snapshot.current.frozen = false;
    snapshot.current.endTime = null;
    setInteractionFrozen(false);
    setShowPauseModal(false);
    setLoginAction("");
    clearGuestExamHandoff();
  }

  function requestAction(action) {
    if (!ready || saving || paused || submitted) return;
    if (!authenticated) {
      if (remainingSeconds <= 0) return;
      snapshot.current.frozen = true;
      setInteractionFrozen(true);
      setLoginAction(action);
    } else if (action === "pause") {
      if (remainingSeconds > 0) setShowPauseModal(true);
    } else {
      void save("submit");
    }
  }

  function viewAnalysis() {
    const attemptId = submittedResult?.pauseid ?? submittedResult?.id;
    if (!attemptId) return;
    clearGuestExamHandoff();
    const query = new URLSearchParams({ attemptId: String(attemptId), examType: "scert", title: exam?.exam_name ?? exam?.title ?? "SCERT Exam" });
    router.push(`/dashboard/${encodeURIComponent(governmentExamsSlug)}/exam-analysis?${query}`);
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
        Restoring your SCERT exam…
      </p>
    );
  }

  const startIndex =
    (currentPage - 1) * pageSize;

  return (
    <main className="min-h-screen bg-[#f5f9ff] py-6 sm:py-8">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <ScertExamHeader
          exam={exam}
          remainingSeconds={remainingSeconds}
          totalQuestions={totalQuestions}
          answeredCount={answeredCount}
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

        <section className="mt-6 rounded-3xl border border-blue-100 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="mb-5 text-lg font-black text-[#071f55]">
            Questions {startIndex + 1}–
            {Math.min(
              startIndex + pageSize,
              totalQuestions
            )}{" "}
            of {totalQuestions}
          </h2>

          <ScertQuestionList
            questions={questions.slice(
              startIndex,
              startIndex + pageSize
            )}
            imagePath={imagePath}
            getSelectedAnswer={(question) =>
              answers[String(question.id)] ?? ""
            }
            onAnswer={handleAnswer}
            disabled={
              saving ||
              submitted ||
              paused ||
              showPauseModal ||
              interactionFrozen ||
              remainingSeconds <= 0
            }
            startIndex={startIndex}
          />

          <ScertPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            disabled={saving}
          />

          {!submitted && (
            <ScertExamActions
              saving={saving}
              submitted={submitted}
              onPause={() => requestAction("pause")}
              onFinish={() => requestAction("submit")}
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
        </section>
      </div>

      <ExamPauseConfirmationModal
        open={showPauseModal && remainingSeconds > 0}
        saving={saving}
        error={saveError}
        onContinue={continueExam}
        onConfirm={() => save("pause")}
      />

      <LoginRequiredModal
        open={Boolean(loginAction)}
        onClose={continueExam}
        onLogin={() => save(loginAction)}
      />

      <ExamTimeFinishedModal
        open={guestTimedOut}
        message="Your exam time has expired. Returning to the exam cards in 5 seconds."
        onBackToExams={() => router.replace(cardsPath)}
      />

      <ExamResultModal
        open={resultModalOpen}
        result={submittedResult}
        examTitle={
          exam?.exam_name ??
          exam?.title ??
          "SCERT Exam"
        }
        onClose={viewAnalysis}
        onViewAnalysis={viewAnalysis}
      />
    </main>
  );
}
