"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

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

import ScertExamHeader from "./ScertExamHeader";
import ScertQuestionList from "./ScertQuestionList";
import ScertPagination from "./ScertPagination";
import ScertExamActions from "./ScertExamActions";
import ScertPauseModal from "./ScertPauseModal";
import ScertFinishModal from "./ScertFinishModal";

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

  const [
    showFinishModal,
    setShowFinishModal,
  ] = useState(false);

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
    startTime: Date.now(),
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

  const stats = useMemo(
    () =>
      calculateExamResult({
        answerArray: answerKeys,

        userAnswers:
          questions.map(
            (question) =>
              answers[String(question.id)] ?? 0
          ),

        markPerCorrect: 1,
        negativeMarkPerWrong: 0.333,
      }),
    [answers, questions, answerKeys]
  );

  /* LOCAL DRAFT */

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
      classId,
      testSlug,
      governmentExamsSlug,
      questionIds,
      action,
    });
  }

  /* RESTORE DRAFT / GUEST / PAUSED ATTEMPT */

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

        if (
          !isHandoff &&
          mode === "resume"
        ) {
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
    setShowFinishModal(false);
    setShowPauseModal(false);

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

        window.location.assign(
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
        if (isHandoff) checkpoint(action);
      }

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
        storeDraft();

        if (isHandoff) {
          try {
            clearGuestExamHandoff();
          } catch { }
        }

        router.push(
          `/dashboard/${encodeURIComponent(
            governmentExamsSlug
          )}/scert-tests/classes/${encodeURIComponent(
            classId
          )}`
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
      submitted ||
      paused ||
      saving ||
      showPauseModal ||
      showFinishModal ||
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
    showPauseModal,
    showFinishModal,
    remainingSeconds,
    draftKey,
  ]);

  /* TIMEOUT */

  useEffect(() => {
    if (
      !ready ||
      restoreError ||
      isHandoff ||
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
          answeredCount={stats.attempted}
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
              isHandoff ||
              snapshot.current.frozen ||
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
              onPause={() => {
                if (!saving && !paused) {
                  setShowPauseModal(true);
                }
              }}
              onFinish={() => {
                if (!saving) {
                  setShowFinishModal(true);
                }
              }}
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

      <ScertPauseModal
        open={showPauseModal}
        saving={saving}
        onClose={() => {
          if (!saving) {
            setShowPauseModal(false);
          }
        }}
        onConfirm={() => save("pause")}
      />

      <ScertFinishModal
        open={showFinishModal}
        saving={saving}
        attempted={stats.attempted}
        totalQuestions={totalQuestions}
        onClose={() => {
          if (!saving) {
            setShowFinishModal(false);
          }
        }}
        onConfirm={() => save("submit")}
      />

      <ExamResultModal
        open={resultModalOpen}
        result={submittedResult}
        examTitle={
          exam?.exam_name ??
          exam?.title ??
          "SCERT Exam"
        }
        onClose={() => setResultModalOpen(false)}
        onViewAnalysis={viewAttempted}
      />
    </main>
  );
}