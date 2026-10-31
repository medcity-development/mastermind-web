
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
  getResultArray,
  secondsToMilliseconds,
  timestampToMilliseconds,
} from "@/lib/examAttemptData";

import {
  prepareExamHistoryResult,
} from "@/lib/examHistoryResult";

import {
  clearGuestExamHandoff,
  readGuestExamHandoff,
} from "@/lib/guestExamHandoff";

import ExamHero from "./ExamHero";
import ExamProgress from "./ExamProgress";
import ExamQuestions from "./ExamQuestions";
import ExamPagination from "./ExamPagination";
import ExamControls from "./ExamControls";

import ExamResultModal from "@/components/ExamResultModal";
import ExamPauseConfirmModal from "@/components/ExamPauseConfirmModal";

import {
  QUESTIONS_PER_PAGE,
} from "../utils/examUtils";

/* =========================================================
   HELPERS
========================================================= */

function normalizeAnswerValue(value) {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value === "object") {
    return normalizeAnswerValue(
      value.id ??
      value.option ??
      value.answer ??
      value.value ??
      ""
    );
  }

  const normalized = String(value).trim().toUpperCase();

  if (
    !normalized ||
    ["0", "NULL", "UNDEFINED"].includes(normalized)
  ) {
    return "";
  }

  return normalized;
}

function getCorrectAnswer(question) {
  return normalizeAnswerValue(
    question?.correct_answer ??
    question?.correctAnswer ??
    question?.answer ??
    question?.right_answer ??
    question?.rightAnswer ??
    ""
  );
}

function normalizeSavedPage(page, totalPages) {
  const number = Number(page);

  return Math.min(
    totalPages,
    Math.max(
      1,
      Number.isFinite(number) ? Math.floor(number) : 1
    )
  );
}

function normalizeRemainingSeconds(value, duration) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return duration;
  }

  return Math.max(
    0,
    Math.min(duration, Math.floor(number))
  );
}

function isSuccessfulResponse(result) {
  const status = String(
    result?.status ?? "true"
  ).toLowerCase();

  return ![
    "false",
    "0",
    "failed",
    "error",
  ].includes(status);
}

async function sendAttemptRequest({
  endpoint,
  payload,
}) {
  const response = await fetch(endpoint, {
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
    throw new Error(
      "The exam server returned an invalid response."
    );
  }

  if (!response.ok || !isSuccessfulResponse(result)) {
    throw new Error(
      result?.message ||
      result?.msg ||
      "Unable to save exam attempt."
    );
  }

  return result;
}

/* =========================================================
   EXAM CLIENT
========================================================= */

export default function ExamClient({
  exam,
  questions = [],
  imagePath = "",
  statementTypeSlug,
  examSlug,
  governmentExamsSlug,
  uid,
  cid,
  examType = "tst",
  guestAction = "",
}) {
  const router = useRouter();

  const examId = exam?.id;

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
    `exam_draft_${uid}_${cid}_${examType}_${examId}`;

  const dashboardHome =
    `/dashboard/${encodeURIComponent(governmentExamsSlug)}`;

  /* =======================================================
     STATE
  ======================================================= */

  const [answers, setAnswers] = useState({});

  const [currentPage, setCurrentPage] = useState(1);

  const [saving, setSaving] = useState(false);

  const [saveError, setSaveError] = useState("");

  const [pauseId, setPauseId] = useState(null);

  const [restoring, setRestoring] = useState(true);

  const [guestRestoreError, setGuestRestoreError] =
    useState("");

  const [showPauseConfirmation, setShowPauseConfirmation] =
    useState(false);

  const [pauseSuccessOpen, setPauseSuccessOpen] =
    useState(false);

  const [resultModalOpen, setResultModalOpen] =
    useState(false);

  const [submittedResult, setSubmittedResult] =
    useState(null);

  const [attemptStartTime, setAttemptStartTime] =
    useState(() => Date.now());

  const [attemptEndTime, setAttemptEndTime] =
    useState(null);

  const [endTime, setEndTime] = useState(null);

  const [timeLeft, setTimeLeft] =
    useState(durationSeconds);

  const [attemptFinished, setAttemptFinished] =
    useState(false);

  const [attemptPaused, setAttemptPaused] =
    useState(false);

  const requestRef = useRef(false);

  const guestActionHandledRef = useRef(false);

  const timeOverHandledRef = useRef(false);

  const restoredActionRef = useRef("");

  const latestTimeRef = useRef(durationSeconds);

  /* =======================================================
     RESTORE SAVED EXAM
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function restoreDraft() {
      setRestoring(true);

      try {
        const hasGuestAction =
          ["pause", "submit"].includes(guestAction);

        let draft = null;

        if (hasGuestAction) {
          draft = readGuestExamHandoff({
            examId,
            examType,
            governmentExamsSlug,
          });

          if (
            !draft ||
            draft.action !== guestAction
          ) {
            throw new Error(
              "Saved guest exam progress could not be found. Please reopen the exam."
            );
          }
        } else {
          const raw = localStorage.getItem(draftKey);

          draft = raw ? JSON.parse(raw) : null;
        }

        if (cancelled) return;

        if (draft) {
          const restoredTime =
            normalizeRemainingSeconds(
              draft.remainingSeconds ??
              draft.timeLeft,
              durationSeconds
            );

          const restoredStart =
            timestampToMilliseconds(
              draft.startTime
            ) ?? Date.now();

          setAnswers(
            draft.answers &&
            typeof draft.answers === "object"
              ? draft.answers
              : {}
          );

          setPauseId(
            draft.pauseId ?? null
          );

          setCurrentPage(
            normalizeSavedPage(
              draft.currentPage,
              totalPages
            )
          );

          setAttemptStartTime(restoredStart);

          setAttemptEndTime(
            guestAction === "submit"
              ? timestampToMilliseconds(
                  draft.endTime
                ) ?? Date.now()
              : null
          );

          latestTimeRef.current = restoredTime;

          setTimeLeft(restoredTime);

          setEndTime(
            Date.now() + restoredTime * 1000
          );
        } else {
          latestTimeRef.current =
            durationSeconds;

          setTimeLeft(durationSeconds);

          setEndTime(
            durationSeconds > 0
              ? Date.now() +
                  durationSeconds * 1000
              : null
          );
        }

        restoredActionRef.current =
          hasGuestAction ? guestAction : "";

        setGuestRestoreError("");
      } catch (error) {
        if (cancelled) return;

        const message =
          error?.message ||
          "Unable to restore saved exam.";

        setGuestRestoreError(message);
        setSaveError(message);
      } finally {
        if (!cancelled) {
          setRestoring(false);
        }
      }
    }

    void restoreDraft();

    return () => {
      cancelled = true;
    };
  }, [
    draftKey,
    guestAction,
    examId,
    examType,
    governmentExamsSlug,
    durationSeconds,
    totalPages,
  ]);

  /* =======================================================
     TIMER
  ======================================================= */

  useEffect(() => {
    if (
      restoring ||
      !endTime ||
      attemptFinished ||
      attemptPaused ||
      pauseSuccessOpen
    ) {
      return;
    }

    function updateTimer() {
      const remaining = Math.max(
        0,
        Math.ceil(
          (endTime - Date.now()) / 1000
        )
      );

      latestTimeRef.current = remaining;

      setTimeLeft(remaining);
    }

    updateTimer();

    const timer = window.setInterval(
      updateTimer,
      1000
    );

    return () => {
      window.clearInterval(timer);
    };
  }, [
    endTime,
    restoring,
    attemptFinished,
    attemptPaused,
    pauseSuccessOpen,
  ]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const currentQuestions = useMemo(() => {
    const start =
      (currentPage - 1) *
      QUESTIONS_PER_PAGE;

    return questions.slice(
      start,
      start + QUESTIONS_PER_PAGE
    );
  }, [questions, currentPage]);

  const answeredCount = useMemo(() => {
    return questions.filter((question, index) => {
      const id = String(
        question?.id ?? index + 1
      );

      return Boolean(
        normalizeAnswerValue(answers[id])
      );
    }).length;
  }, [questions, answers]);

  const isTimeOver =
    durationSeconds > 0 &&
    timeLeft <= 0;

  const interactionLocked =
    restoring ||
    saving ||
    attemptFinished ||
    attemptPaused ||
    pauseSuccessOpen ||
    resultModalOpen;

  /* =======================================================
     ANSWER SELECTION
  ======================================================= */

  function handleAnswer(questionId, answer) {
    if (
      interactionLocked ||
      isTimeOver ||
      requestRef.current
    ) {
      return;
    }

    setAnswers((previous) => ({
      ...previous,
      [String(questionId)]: answer,
    }));
  }

  function handlePage(page) {
    if (
      interactionLocked ||
      requestRef.current
    ) {
      return;
    }

    setCurrentPage(
      normalizeSavedPage(page, totalPages)
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =======================================================
     BUILD ANSWER DATA
  ======================================================= */

  const buildAnswerData = useCallback(() => {
    const correctAnswerArray = [];
    const wrongAnswerArray = [];

    const answerArray = questions.map(
      (question, index) => {
        const questionId = String(
          question?.id ?? index + 1
        );

        const selectedAnswer =
          normalizeAnswerValue(
            answers[questionId]
          );

        const correctAnswer =
          getCorrectAnswer(question);

        const item = {
          question_id: question?.id,
          answer: selectedAnswer,
        };

        if (selectedAnswer) {
          if (
            correctAnswer &&
            selectedAnswer === correctAnswer
          ) {
            correctAnswerArray.push(item);
          } else {
            wrongAnswerArray.push(item);
          }
        }

        return item;
      }
    );

    return {
      answerArray,
      correctAnswerArray,
      wrongAnswerArray,
    };
  }, [questions, answers]);

  /* =======================================================
     SAVE ATTEMPT
  ======================================================= */

  const saveExamAttempt = useCallback(
    async (examStatus) => {
      if (requestRef.current) {
        return;
      }

      if (!Number(uid)) {
        setSaveError(
          "Your login session is unavailable. Please sign in again."
        );
        return;
      }

      if (!examId) {
        setSaveError("Exam ID is missing.");
        return;
      }

      const isFinished = [
        "complete",
        "completed",
        "finish",
        "finished",
      ].includes(
        String(examStatus).toLowerCase()
      );

      requestRef.current = true;
      setSaving(true);
      setSaveError("");

      try {
        const resultData =
          buildAnswerData();

        const correctCount =
          resultData.correctAnswerArray.length;

        const wrongCount =
          resultData.wrongAnswerArray.length;

        const attemptedCount =
          correctCount + wrongCount;

        const negativeMark = Number(
          (wrongCount * 0.333).toFixed(2)
        );

        const score = Number(
          (
            correctCount - wrongCount * 0.333
          ).toFixed(2)
        );

        const remainingSeconds =
          latestTimeRef.current;

        const payload = {
          uid: Number(uid),
          cid: Number(cid),

          exam_status: isFinished
            ? "finish"
            : "pause",

          lastposition: currentPage,

          exam_id: examId,

          exam_type: "tst",

          total_questions:
            Number(exam?.total_questions) ||
            questions.length,

          // Backend requires milliseconds.
          paused_time:
            secondsToMilliseconds(
              remainingSeconds
            ),

          start_time: attemptStartTime,

          ...(isFinished
            ? {
                end_time:
                  attemptEndTime ??
                  Date.now(),
              }
            : {}),

          total_mark:
            Number(exam?.total_mark) ||
            questions.length,

          answer_array:
            questions.map(getCorrectAnswer),

          user_answers:
            resultData.answerArray.map(
              (item) => item.answer || 0
            ),

          ...(pauseId
            ? { pauseid: pauseId }
            : {}),
        };

        if (isFinished) {
          Object.assign(payload, {
            user_score: score,
            minus_mark: negativeMark,
            total_correct: correctCount,
            total_wrong: wrongCount,
            total_attempted: attemptedCount,
            correct_answer_array:
              resultData.correctAnswerArray,
            wrong_answer_array:
              resultData.wrongAnswerArray,
          });
        }

        const endpoint = pauseId
          ? "/api/exam-attempt/update"
          : "/api/exam-attempt/create";

        const result =
          await sendAttemptRequest({
            endpoint,
            payload,
          });

        const savedAttemptId =
          pauseId ||
          getAttemptId(result);

        if (!savedAttemptId) {
          throw new Error(
            "The backend did not return the saved attempt ID. Check whether the attempt was saved before retrying."
          );
        }

        setPauseId(savedAttemptId);

        // Only clear guest handoff after confirmed save.
        if (
          ["pause", "submit"].includes(
            guestAction
          )
        ) {
          clearGuestExamHandoff();
        }

        try {
          if (!isFinished) {
            localStorage.setItem(
              draftKey,
              JSON.stringify({
                answers,
                pauseId: savedAttemptId,
                timeLeft: remainingSeconds,
                remainingSeconds,
                currentPage,
                startTime: attemptStartTime,
              })
            );
          } else {
            localStorage.removeItem(
              draftKey
            );
          }
        } catch (storageError) {
          console.warn(
            "Unable to update local exam draft:",
            storageError
          );
        }

        /* -------------------------------------
           PAUSE SUCCESS
        ------------------------------------- */

        if (!isFinished) {
          setAttemptPaused(true);

          setShowPauseConfirmation(false);

          setPauseSuccessOpen(true);

          return;
        }

        /* -------------------------------------
           FINISH SUCCESS
        ------------------------------------- */

        setAttemptFinished(true);

        let savedResult =
          result?.data?.[0] ||
          result?.data ||
          result ||
          {};

        try {
          const details =
            await sendAttemptRequest({
              endpoint:
                "/api/exam-attempt/analytics-details",

              payload: {
                cid: Number(cid),
                uid: Number(uid),
                id: savedAttemptId,
                exam_type: "tst",
              },
            });

          savedResult =
            getResultArray(details)[0] ||
            savedResult;
        } catch (error) {
          // Saving succeeded. Analytics failure
          // must not cause a second submission.
          console.warn(
            "Exam saved, but analytics could not be loaded:",
            error
          );
        }

        setSubmittedResult(
          prepareExamHistoryResult({
            ...payload,
            ...savedResult,

            id: savedAttemptId,
            pauseid: savedAttemptId,

            exam_type: "tst",

            exam_name:
              exam?.exam_name ||
              exam?.title ||
              "",
          })
        );

        setResultModalOpen(true);
      } catch (error) {
        console.error(
          "STATEMENT EXAM SAVE ERROR:",
          error
        );

        setSaveError(
          error?.message ||
          "Unable to save exam attempt."
        );
      } finally {
        requestRef.current = false;
        setSaving(false);
      }
    },
    [
      uid,
      cid,
      examId,
      exam,
      questions,
      currentPage,
      attemptStartTime,
      attemptEndTime,
      pauseId,
      guestAction,
      draftKey,
      answers,
      buildAnswerData,
    ]
  );

  /* =======================================================
     GUEST ACTION AFTER LOGIN

     PAUSE:
       Restore -> Show confirmation.
       Do NOT automatically save.

     SUBMIT:
       Restore -> Complete once.
  ======================================================= */

  useEffect(() => {
    if (
      restoring ||
      guestRestoreError ||
      guestActionHandledRef.current
    ) {
      return;
    }

    const action =
      restoredActionRef.current;

    if (
      action !== "pause" &&
      action !== "submit"
    ) {
      return;
    }

    guestActionHandledRef.current = true;

    if (action === "pause") {
      setShowPauseConfirmation(true);
      return;
    }

    if (action === "submit") {
      void saveExamAttempt("finish");
    }
  }, [
    restoring,
    guestRestoreError,
    saveExamAttempt,
  ]);

  /* =======================================================
     PAUSE CONTROLS
  ======================================================= */

  function handlePause() {
    if (
      restoring ||
      saving ||
      attemptFinished ||
      attemptPaused ||
      requestRef.current
    ) {
      return;
    }

    setSaveError("");
    setShowPauseConfirmation(true);
  }

  function confirmPause() {
    if (
      saving ||
      requestRef.current ||
      attemptPaused
    ) {
      return;
    }

    // Keep the confirmation visible while saving.
    // On success, saveExamAttempt closes it.
    void saveExamAttempt("pause");
  }

  function closePauseConfirmation() {
    if (saving) return;

    setShowPauseConfirmation(false);
  }

  function handlePauseSuccess() {
    setPauseSuccessOpen(false);

    router.replace(dashboardHome);
    router.refresh();
  }

  /* =======================================================
     FINISH
  ======================================================= */

  function handleFinish() {
    if (
      restoring ||
      saving ||
      attemptFinished ||
      attemptPaused ||
      requestRef.current
    ) {
      return;
    }

    setShowPauseConfirmation(false);

    void saveExamAttempt("finish");
  }

  /* =======================================================
     TIMER EXPIRY
  ======================================================= */

  useEffect(() => {
    if (
      restoring ||
      guestRestoreError ||
      !isTimeOver ||
      timeOverHandledRef.current ||
      attemptFinished ||
      attemptPaused ||
      saving ||
      showPauseConfirmation ||
      ["pause", "submit"].includes(guestAction)
    ) {
      return;
    }

    timeOverHandledRef.current = true;

    void saveExamAttempt("finish");
  }, [
    restoring,
    guestRestoreError,
    isTimeOver,
    attemptFinished,
    attemptPaused,
    saving,
    showPauseConfirmation,
    guestAction,
    saveExamAttempt,
  ]);

  /* =======================================================
     RESULT ANALYSIS
  ======================================================= */

  function handleViewAnalysis(result) {
    const attemptId =
      result?.id ??
      result?.attempt_id ??
      result?.pauseid ??
      pauseId;

    if (!attemptId) {
      setSaveError(
        "Saved attempt ID is unavailable."
      );
      return;
    }

    const params = new URLSearchParams({
      attemptId: String(attemptId),
      examType: "tst",

      title:
        result?.exam_name ||
        exam?.exam_name ||
        exam?.title ||
        "",
    });

    router.push(
      `${dashboardHome}/exam-analysis?${params.toString()}`
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <>
      <ExamResultModal
        open={resultModalOpen}
        result={submittedResult}
        examTitle={
          exam?.exam_name ||
          exam?.title ||
          ""
        }
        onClose={() => {
          setResultModalOpen(false);
          router.replace(
            `${dashboardHome}/exam-attempted`
          );
        }}
        onViewAnalysis={
          handleViewAnalysis
        }
      />

      <ExamPauseConfirmModal
        open={showPauseConfirmation}
        saving={saving}
        onClose={
          closePauseConfirmation
        }
        onConfirm={
          confirmPause
        }
      />

      {/* PAUSED SUCCESS MODAL */}
      {pauseSuccessOpen && (
        <div
          className="
            fixed inset-0 z-[9999]
            flex items-center justify-center
            bg-black/60 p-4
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="pause-success-title"
        >
          <div
            className="
              w-full max-w-md
              rounded-[24px]
              bg-white p-7
              text-center shadow-2xl
            "
          >
            <div
              className="
                mx-auto mb-5
                flex h-16 w-16
                items-center justify-center
                rounded-full
                bg-green-100
                text-3xl
                text-green-700
              "
            >
              ✓
            </div>

            <h2
              id="pause-success-title"
              className="
                text-2xl font-black
                text-slate-900
              "
            >
              Exam Paused Successfully
            </h2>

            <p
              className="
                mt-3 text-sm
                leading-6 text-slate-600
              "
            >
              Your answers and remaining time
              have been saved. You can resume
              this exam later from your dashboard.
            </p>

            <button
              type="button"
              onClick={
                handlePauseSuccess
              }
              className="
                mt-7 w-full
                rounded-xl
                bg-blue-700
                px-5 py-3
                font-bold text-white
                transition
                hover:bg-blue-800
              "
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}

      <main className="min-h-screen bg-[#f5f9ff]">
        <div
          className="
            mx-auto w-full
            max-w-[1300px]
            px-4 py-8
            sm:px-6 lg:px-8
          "
        >
          <ExamHero
            exam={exam}
            questionsCount={
              questions.length
            }
            timeLeft={timeLeft}
            durationMinutes={
              durationMinutes
            }
            statementTypeSlug={
              statementTypeSlug
            }
            examSlug={examSlug}
            governmentExamsSlug={
              governmentExamsSlug
            }
          />

          <ExamProgress
            answeredCount={
              answeredCount
            }
            totalQuestions={
              questions.length
            }
            currentPage={
              currentPage
            }
            totalPages={
              totalPages
            }
          />

          {guestRestoreError && (
            <div
              className="
                mt-5 rounded-2xl
                border border-red-200
                bg-red-50 p-4
                font-semibold text-red-700
              "
            >
              {guestRestoreError}
            </div>
          )}

          {saveError && (
            <div
              className="
                mt-5 rounded-2xl
                border border-red-200
                bg-red-50 p-4
                font-semibold text-red-700
              "
            >
              {saveError}
            </div>
          )}

          {restoring && (
            <div
              className="
                mt-5 rounded-xl
                bg-blue-50 p-4
                text-sm font-medium
                text-blue-800
              "
            >
              Restoring your exam progress...
            </div>
          )}

          {isTimeOver && !attemptFinished && (
            <div
              className="
                mt-5 rounded-2xl
                border border-amber-200
                bg-amber-50 p-4
                text-amber-800
              "
            >
              <p className="font-bold">
                Time is over
              </p>
              <p className="mt-1 text-sm">
                You can no longer change your answers.
              </p>
            </div>
          )}

          <ExamQuestions
            questions={
              currentQuestions
            }
            currentPage={
              currentPage
            }
            answers={
              answers
            }
            onAnswer={
              handleAnswer
            }
            disabled={
              interactionLocked ||
              isTimeOver
            }
            imagePath={
              imagePath
            }
          />

          <ExamPagination
            currentPage={
              currentPage
            }
            totalPages={
              totalPages
            }
            onPageChange={
              handlePage
            }
          />

          <ExamControls
            onPause={
              handlePause
            }
            onFinish={
              handleFinish
            }
            saving={
              saving
            }
            disabled={
              interactionLocked ||
              Boolean(guestRestoreError)
            }
          />
        </div>
      </main>
    </>
  );
}
