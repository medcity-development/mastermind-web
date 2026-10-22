"use client";

import { getAttemptId, getResultArray, secondsToMilliseconds, timestampToMilliseconds } from "@/lib/examAttemptData";
import { prepareExamHistoryResult } from "@/lib/examHistoryResult";
import {
  clearGuestExamHandoff,
  readGuestExamHandoff,
} from "@/lib/guestExamHandoff";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

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
   API REQUEST
========================================================= */

async function sendAttemptRequest({
  endpoint,
  payload,
}) {
  const response =
    await fetch(
      endpoint,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            payload
          ),
      }
    );

  const result =
    await response.json();

  if (
    !response.ok ||
    result?.status === false
  ) {
    throw new Error(
      result?.message ||
        "Unable to save exam attempt."
    );
  }

  return result;
}

/* =========================================================
   NORMALIZE ANSWER VALUE
========================================================= */

function normalizeAnswerValue(
  value
) {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  if (
    typeof value ===
    "object"
  ) {
    return String(
      value?.id ??
        value?.option ??
        value?.answer ??
        value?.value ??
        ""
    );
  }

  return String(value);
}

/* =========================================================
   GET CORRECT ANSWER FROM QUESTION

   Supports common backend field names.
========================================================= */

function getCorrectAnswer(
  question
) {
  return normalizeAnswerValue(
    question?.correct_answer ??
      question?.correctAnswer ??
      question?.answer ??
      question?.right_answer ??
      question?.rightAnswer ??
      ""
  );
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
  const router =
    useRouter();

  /* =======================================================
     STATE
  ======================================================= */

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [
    answers,
    setAnswers,
  ] = useState({});

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    saveError,
    setSaveError,
  ] = useState("");

  const [
    pauseId,
    setPauseId,
  ] = useState(null);
  const [restoring, setRestoring] = useState(true);
  const [guestRestoreError, setGuestRestoreError] = useState("");
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);
  const [showPauseConfirmation, setShowPauseConfirmation] = useState(false);
  const [attemptStartTime, setAttemptStartTime] = useState(() => Date.now());
  const [attemptEndTime, setAttemptEndTime] = useState(null);

  const requestRef = useRef(false);
  const guestActionHandledRef = useRef(false);
  const draftKey = `exam_draft_${uid}_${cid}_${examType}_${exam?.id}`;

  const timeOverHandled =
    useRef(false);

  /* =======================================================
     EXAM VALUES
  ======================================================= */

  const examId =
    exam?.id;

  const durationMinutes =
    Number(
      exam?.total_minutes
    ) || 0;

  const durationSeconds =
    Math.max(
      0,
      Math.floor(
        durationMinutes *
          60
      )
    );

  /* =======================================================
     TIMER
  ======================================================= */

  const [
    endTime,
    setEndTime,
  ] = useState(() =>
    durationSeconds > 0
      ? Date.now() +
        durationSeconds *
          1000
      : null
  );

  const [
    timeLeft,
    setTimeLeft,
  ] = useState(
    durationSeconds
  );

  useEffect(() => {
    let cancelled = false;
    async function restoreDraft() {
      try {
        await Promise.resolve();
        let draft = JSON.parse(localStorage.getItem(draftKey) || "null");
        if (["pause", "submit"].includes(guestAction)) {
          draft = readGuestExamHandoff({
            examId,
            examType,
            governmentExamsSlug,
          });
          if (!draft || draft.action !== guestAction) {
            throw new Error("Saved exam progress could not be found.");
          }
        }

        if (draft && !cancelled) {
          const restoredTime = Math.max(
            0,
            Math.min(
              durationSeconds,
              Number(draft.timeLeft ?? draft.remainingSeconds) || 0
            )
          );
          setAnswers(draft.answers || {});
          setPauseId(draft.pauseId || null);
          setAttemptStartTime(
            timestampToMilliseconds(draft.startTime) ?? Date.now()
          );
          setAttemptEndTime(
            guestAction === "submit"
              ? timestampToMilliseconds(draft.endTime)
              : null
          );
          setTimeLeft(restoredTime);
          setEndTime(Date.now() + restoredTime * 1000);
          setCurrentPage(draft.currentPage || 1);
        }
      } catch (error) {
        if (!cancelled) {
          setGuestRestoreError(error?.message || "Unable to restore saved exam.");
          setSaveError(error?.message || "Unable to restore saved exam.");
        }
      } finally {
        if (!cancelled) setRestoring(false);
      }
    }
    void restoreDraft();
    return () => {
      cancelled = true;
    };
  }, [draftKey, guestAction, examId, examType, governmentExamsSlug, durationSeconds]);

  useEffect(() => {
    if (!endTime || restoring) {
      return;
    }

    function updateTimer() {
      const remaining =
        Math.max(
          0,
          Math.ceil(
            (endTime -
              Date.now()) /
              1000
          )
        );

      setTimeLeft(
        remaining
      );
    }

    updateTimer();

    const timer =
      window.setInterval(
        updateTimer,
        1000
      );

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [endTime, restoring]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        questions.length /
          QUESTIONS_PER_PAGE
      )
    );

  const currentQuestions =
    useMemo(() => {
      const start =
        (currentPage -
          1) *
        QUESTIONS_PER_PAGE;

      return questions.slice(
        start,
        start +
          QUESTIONS_PER_PAGE
      );
    }, [
      questions,
      currentPage,
    ]);

  /* =======================================================
     COUNTS
  ======================================================= */

  const answeredCount =
    Object.keys(
      answers
    ).filter(
      (questionId) =>
        normalizeAnswerValue(
          answers[
            questionId
          ]
        ) !== ""
    ).length;

  const isTimeOver =
    durationSeconds > 0 &&
    timeLeft <= 0;

  /* =======================================================
     ANSWER
  ======================================================= */

  function handleAnswer(
    questionId,
    answer
  ) {
    if (
      isTimeOver ||
      saving
    ) {
      return;
    }

    setAnswers(
      (previous) => ({
        ...previous,

        [questionId]:
          answer,
      })
    );
  }

  /* =======================================================
     PAGE CHANGE
  ======================================================= */

  function scrollTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handlePage(
    page
  ) {
    if (requestRef.current) {
      return;
    }

    const safePage =
      Math.min(
        Math.max(
          Number(page) ||
            1,
          1
        ),
        totalPages
      );

    setCurrentPage(
      safePage
    );

    scrollTop();
  }

  /* =======================================================
     BUILD ANSWER ARRAYS
  ======================================================= */

  function buildAnswerData() {
    const answerArray = [];

    const correctAnswerArray =
      [];

    const wrongAnswerArray =
      [];

    questions.forEach(
      (
        question,
        index
      ) => {
        const questionId =
          String(
            question?.id ??
              index +
                1
          );

        const selectedAnswer =
          normalizeAnswerValue(
            answers[
              questionId
            ] ??
              answers[
                question?.id
              ]
          );

        const correctAnswer =
          getCorrectAnswer(
            question
          );

        const answerItem = {
          question_id:
            question?.id,

          answer:
            selectedAnswer,
        };

        answerArray.push(
          answerItem
        );

        if (
          !selectedAnswer
        ) {
          return;
        }

        if (
          correctAnswer &&
          selectedAnswer ===
            correctAnswer
        ) {
          correctAnswerArray.push(
            answerItem
          );

          return;
        }

        wrongAnswerArray.push(
          answerItem
        );
      }
    );

    return {
      answerArray,

      correctAnswerArray,

      wrongAnswerArray,
    };
  }

  /* =======================================================
     SCORE
  ======================================================= */

  function calculateScore(
    correctCount
  ) {
    const totalMark =
      Number(
        exam?.total_mark
      ) || 0;

    const totalQuestions =
      Number(
        exam?.total_questions
      ) ||
      questions.length;

    if (
      totalQuestions <= 0
    ) {
      return 0;
    }

    const markPerQuestion =
      totalMark /
      totalQuestions;

    return Number(
      (
        correctCount *
        markPerQuestion
      ).toFixed(2)
    );
  }

  /* =======================================================
     SAVE ATTEMPT
  ======================================================= */

  async function saveExamAttempt(
    examStatus
  ) {
    if (saving || requestRef.current) {
      return;
    }

    if (
      !uid ||
      Number(uid) === 0
    ) {
      setSaveError(
        "Your session is unavailable. Please refresh the dashboard."
      );

      return;
    }

    if (!examId) {
      setSaveError(
        "Exam ID is missing."
      );

      return;
    }

    try {
      requestRef.current = true;
      setSaving(true);
      setSaveError("");

      const isFinished =
        ["complete", "completed", "finish", "finished"].includes(
          String(examStatus).toLowerCase()
        );

      const resultData = isFinished
        ? buildAnswerData()
        : null;
      const answerArray = resultData
        ? resultData.answerArray
        : questions.map((question, index) => ({
            question_id: question?.id,
            answer: normalizeAnswerValue(
              answers[String(question?.id ?? index + 1)] ??
              answers[question?.id]
            ),
          }));
      const userScore = resultData
        ? calculateScore(resultData.correctAnswerArray.length)
        : null;

      const payload = {
        uid:
          Number(uid),

        cid:
          Number(cid),

        exam_status:
          examStatus,

        lastposition:
          currentPage,

        exam_id:
          examId,

        exam_type:
          examType,

        total_questions:
          Number(
            exam?.total_questions
          ) ||
          questions.length,

        paused_time:
          secondsToMilliseconds(timeLeft),

        start_time:
          attemptStartTime,

        ...(["complete", "completed", "finish", "finished"].includes(String(examStatus).toLowerCase())
          ? { end_time: attemptEndTime ?? Date.now() }
          : {}),

        total_mark:
          Number(
            exam?.total_mark
          ) || 0,

        answer_array: questions.map(getCorrectAnswer),
        user_answers: answerArray.map((item) => item.answer || 0),
        ...(pauseId ? { pauseid: pauseId } : {}),
      };

      if (resultData) {
        Object.assign(payload, {
          user_score: userScore,
          minus_mark: 0,
          total_correct: resultData.correctAnswerArray.length,
          total_wrong: resultData.wrongAnswerArray.length,
          total_attempted:
            resultData.correctAnswerArray.length +
            resultData.wrongAnswerArray.length,
          correct_answer_array: resultData.correctAnswerArray,
          wrong_answer_array: resultData.wrongAnswerArray,
        });
      }

      console.log(
        "STATEMENT EXAM PAYLOAD:",
        payload
      );

      let result;

      /* -----------------------------------------------------
         CREATE FIRST ATTEMPT
      ----------------------------------------------------- */

      if (
        !pauseId
      ) {
        result =
          await sendAttemptRequest({
            endpoint:
              "/api/exam-attempt/create",

            payload,
          });

        const id = getAttemptId(result);
        if (!id && examStatus === "pause") throw new Error("Missing saved attempt ID. Please retry.");
        setPauseId(id);
      }

      /* -----------------------------------------------------
         UPDATE EXISTING ATTEMPT
      ----------------------------------------------------- */

      else {
        result =
          await sendAttemptRequest({
            endpoint:
              "/api/exam-attempt/update",

            payload,
          });
      }

      const savedAttemptId = pauseId || getAttemptId(result);
      if (
        !savedAttemptId &&
        (examStatus === "pause" ||
          (examStatus === "complete" && guestAction === "submit"))
      ) {
        throw new Error("The saved attempt ID was not returned. Please retry.");
      }
      if (savedAttemptId) setPauseId(savedAttemptId);
      if (["pause", "submit"].includes(guestAction)) {
        clearGuestExamHandoff();
      }

      console.log(
        "STATEMENT EXAM SAVE RESULT:",
        result
      );

      try {
        if (examStatus === "pause") localStorage.setItem(draftKey, JSON.stringify({ answers, pauseId: savedAttemptId, timeLeft, currentPage, startTime: attemptStartTime }));
        else localStorage.removeItem(draftKey);
      } catch {}

      /* -----------------------------------------------------
         AFTER PAUSE
      ----------------------------------------------------- */

      if (
        examStatus ===
        "pause"
      ) {
        router.push(
          `/dashboard/${governmentExamsSlug}/statement-type-exams/${statementTypeSlug}/${examSlug}`
        );

        return;
      }

      /* -----------------------------------------------------
         AFTER FINISH
      ----------------------------------------------------- */

      if (
        examStatus ===
        "complete"
      ) {
        if (guestAction === "submit") {
          let savedResult = result?.data?.[0] || result?.data || result || {};
          if (savedAttemptId) {
            try {
              const details = await sendAttemptRequest({
                endpoint: "/api/exam-attempt/analytics-details",
                payload: {
                  cid: Number(cid),
                  uid: Number(uid),
                  id: savedAttemptId,
                  exam_type: examType,
                },
              });
              savedResult = getResultArray(details)[0] || savedResult;
            } catch (error) {
              console.error("STATEMENT RESULT LOAD ERROR:", error);
            }
          }
          setSubmittedResult(prepareExamHistoryResult({
            ...payload,
            ...savedResult,
            id: savedAttemptId,
            exam_type: examType,
            exam_name: exam?.exam_name || exam?.title || "",
          }));
          setResultModalOpen(true);
          return;
        }

        router.push(
          `/dashboard/${governmentExamsSlug}/statement-type-exams/${statementTypeSlug}/${examSlug}`
        );
      }
    } catch (error) {
      console.error(
        "STATEMENT EXAM SAVE ERROR:",
        error
      );

      setSaveError(
        error?.message ||
          "Unable to save exam."
      );
    } finally {
      requestRef.current = false;
      setSaving(false);
    }
  }

  /* =======================================================
     CONTROLS
  ======================================================= */

  function handlePause() {
    setShowPauseConfirmation(true);
  }

  function confirmPause() {
    setShowPauseConfirmation(false);
    saveExamAttempt("pause");
  }

  function handleFinish() {
    saveExamAttempt(
      "complete"
    );
  }

  function handleViewAnalysis(result) {
    const attemptId = result?.id ?? result?.attempt_id ?? result?.pauseid;
    if (!attemptId || !governmentExamsSlug) return;
    const params = new URLSearchParams({
      attemptId: String(attemptId),
      examType: String(result?.exam_type ?? examType),
      ...(result?.exam_name ? { title: result.exam_name } : {}),
    });
    router.push(`/dashboard/${encodeURIComponent(governmentExamsSlug)}/exam-analysis?${params.toString()}`);
  }

  useEffect(() => {
    if (
      restoring ||
      guestRestoreError ||
      guestActionHandledRef.current ||
      !["pause", "submit"].includes(guestAction)
    ) {
      return;
    }

    guestActionHandledRef.current = true;
    const timer = window.setTimeout(() => {
      void saveExamAttempt(guestAction === "pause" ? "pause" : "complete");
    }, 0);
    return () => window.clearTimeout(timer);
    // One handoff is replayed once after restoration; the ref prevents repeats.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restoring, guestRestoreError, guestAction]);

  /* =======================================================
     TIME OVER

     For logged-in user:
     complete automatically.

     For uid 0:
     show login modal.
  ======================================================= */

  useEffect(() => {
    if (
      restoring ||
      guestAction ||
      !isTimeOver ||
      timeOverHandled.current
    ) {
      return;
    }

    timeOverHandled.current =
      true;

    saveExamAttempt(
      "complete"
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    restoring,
    isTimeOver,
  ]);

  /* =======================================================
     UI
  ======================================================= */

  return (
    <>
      <ExamResultModal
        open={resultModalOpen}
        result={submittedResult}
        examTitle={exam?.exam_name || exam?.title || ""}
        onClose={() => setResultModalOpen(false)}
        onViewAnalysis={handleViewAnalysis}
      />
      <ExamPauseConfirmModal
        open={showPauseConfirmation}
        saving={saving}
        onClose={() => setShowPauseConfirmation(false)}
        onConfirm={confirmPause}
      />
      <main
        className="
          min-h-screen
          bg-[#f5f9ff]
        "
      >
        <div
          className="
            mx-auto
            w-full
            max-w-[1300px]
            px-4
            py-8
            sm:px-6
            lg:px-8
          "
        >
          <ExamHero
            exam={exam}
            questionsCount={
              questions.length
            }
            timeLeft={
              timeLeft
            }
            durationMinutes={
              durationMinutes
            }
            statementTypeSlug={
              statementTypeSlug
            }
            examSlug={
              examSlug
            }
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

          {/* ==============================================
              SAVE ERROR
          ============================================== */}

          {saveError ? (
            <div
              className="
                mt-5
                rounded-[16px]
                border
                border-red-200
                bg-red-50
                p-4
              "
            >
              <p
                className="
                  font-bold
                  text-red-700
                "
              >
                {saveError}
              </p>
            </div>
          ) : null}

          {/* ==============================================
              TIME OVER
          ============================================== */}

          {isTimeOver ? (
            <div
              className="
                mt-5
                rounded-[16px]
                border
                border-red-200
                bg-red-50
                p-4
              "
            >
              <p
                className="
                  font-black
                  text-red-700
                "
              >
                Time is over
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  text-red-600
                "
              >
                You can no longer
                change your answers.
              </p>
            </div>
          ) : null}

          {/* ==============================================
              QUESTIONS
          ============================================== */}

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
              isTimeOver ||
              saving
            }
            imagePath={
              imagePath
            }
          />

          {/* ==============================================
              PAGINATION
          ============================================== */}

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

          {/* ==============================================
              CONTROLS
          ============================================== */}

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
              saving
            }
          />
        </div>
      </main>

    </>
  );
}
