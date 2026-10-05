"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import ExamTopBar from "./ExamTopBar";
import ExamHero from "./ExamHero";
import ExamProgress from "./ExamProgress";
import ExamQuestions from "./ExamQuestions";
import ExamPagination from "./ExamPagination";
import ExamControls from "./ExamControls";

const QUESTIONS_PER_PAGE =
  10;

function formatExamArray(values) {
  return `[${values.join(", ")}]`;
}

function getCorrectAnswer(question) {
  return (
    question?.answerkey ||
    question?.answer ||
    question?.correct_answer ||
    question?.correctAnswer ||
    question?.right_answer ||
    question?.ans ||
    ""
  );
}

function getAttemptId(result) {
  return (
    result?.pauseid ??
    result?.pause_id ??
    result?.id ??
    result?.last_id ??
    result?.lastid ??
    result?.insert_id ??
    result?.data?.pauseid ??
    result?.data?.pause_id ??
    result?.data?.id ??
    result?.data?.last_id ??
    result?.data?.lastid ??
    result?.data?.insert_id ??
    (Array.isArray(result?.data)
      ? result.data[0]?.id
      : null) ??
    null
  );
}

function saveAttemptHistory({
  cid,
  uid,
  attemptId,
  examId,
  examType,
  status,
  title,
}) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  const key =
    `exam_attempt_history_${uid}_${cid}`;

  const current =
    JSON.parse(
      window.localStorage.getItem(
        key
      ) || "[]"
    );

  const next = [
    {
      attemptId,
      examId,
      examType,
      status,
      title,
      updatedAt:
        new Date().toISOString(),
    },
    ...current.filter(
      (item) =>
        String(item.attemptId) !==
        String(attemptId)
    ),
  ];

  window.localStorage.setItem(
    key,
    JSON.stringify(
      next.slice(0, 50)
    )
  );
}

async function sendAttemptRequest({
  endpoint,
  payload,
  throwOnError = true,
}) {
  const response =
    await fetch(endpoint, {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body:
        JSON.stringify(payload),
    });

  if (
    !response.ok &&
    throwOnError
  ) {
    throw new Error(
      "Unable to save exam attempt."
    );
  }

  return response.json();
}

export default function ExamClient({
  exam,
  questions = [],
  imagePath = "",
  uid,
  cid,
  examType,
  slug,
  examSlug,
  governmentExamsSlug,
}) {
  const [submitted, setSubmitted] = useState(false);
  const requestRef = useRef(false);
  const timeoutRef = useRef(false);

  /* =====================================================
     PAGE
  ===================================================== */

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  /* =====================================================
     ANSWERS
  ===================================================== */

  const [
    answers,
    setAnswers,
  ] = useState({});

  const [
    pauseId,
    setPauseId,
  ] = useState(null);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    saveMessage,
    setSaveMessage,
  ] = useState("");

  const [
    saveError,
    setSaveError,
  ] = useState("");

  const [
    analytics,
    setAnalytics,
  ] = useState(null);

  const [
    isPaused,
    setIsPaused,
  ] = useState(false);

  /* =====================================================
     EXAM DURATION
  ===================================================== */

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

  /* =====================================================
     TIMER END TIME
  ===================================================== */

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

  /*
    Timer is calculated from
    actual clock time.

    This avoids interval drift
    and React re-render issues.
  */

  useEffect(() => {
    if (
      !endTime ||
      submitted ||
      saving ||
      isPaused
    ) {
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
        250
      );

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [
    endTime,
    submitted,
    saving,
    isPaused,
  ]);

  /* =====================================================
     PAGINATION
  ===================================================== */

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

  /* =====================================================
     COUNTS
  ===================================================== */

  const answeredCount =
    Object.keys(
      answers
    ).length;

  const isTimeOver =
    durationSeconds > 0 &&
    timeLeft <= 0;

  /* =====================================================
     ANSWER
  ===================================================== */

  function handleAnswer(
    questionId,
    answer
  ) {
    if (
      submitted || saving || isTimeOver ||
      isPaused
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

  /* =====================================================
     PAGE CHANGE
  ===================================================== */

  function scrollTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handlePrevious() {
    setCurrentPage(
      (previous) =>
        Math.max(
          1,
          previous - 1
        )
    );

    scrollTop();
  }

  function handleNext() {
    setCurrentPage(
      (previous) =>
        Math.min(
          totalPages,
          previous + 1
        )
    );

    scrollTop();
  }

  function handlePageChange(
    page
  ) {
    setCurrentPage(page);

    scrollTop();
  }

  /* =====================================================
     ATTEMPT PAYLOAD
  ===================================================== */

  function buildAttemptPayload(
    examStatus
  ) {
    const answerArray =
      questions.map(
        (question) =>
          getCorrectAnswer(
            question
          ) || 0
      );

    const userAnswers =
      questions.map(
        (question) =>
          answers[question.id] ||
          0
      );

    const totalCorrect =
      userAnswers.filter(
        (answer, index) =>
          answer !== 0 &&
          String(answer) ===
            String(
              answerArray[index]
            )
      ).length;

    const totalAttempted =
      userAnswers.filter(
        (answer) =>
          answer !== 0
      ).length;

    const totalWrong =
      Math.max(
        0,
        totalAttempted -
          totalCorrect
      );

    const totalMark =
      Number(
        exam?.total_mark
      ) ||
      questions.length ||
      0;

    const minusMark =
      Number(
        exam?.minus_mark ??
          exam?.negative_mark
      ) || 0;

    const pausedTime = timeLeft;

    return {
      cid:
        String(cid),
      uid:
        String(uid),

      exam_status:
        examStatus,

      lastposition:
        examType || "twe",

      exam_id:
        String(
          exam?.id
        ),

      exam_type:
        examType || "twe",

      total_questions:
        String(
          questions.length
        ),

      paused_time:
        String(pausedTime),

      total_mark:
        String(totalMark),

      user_score:
        examStatus === "pause"
          ? "0"
          : String(totalCorrect),

      minus_mark:
        examStatus === "pause"
          ? "0"
          : String(minusMark),

      answer_array:
        formatExamArray(
          answerArray
        ),

      user_answers:
        formatExamArray(
          userAnswers
        ),

      total_wrong:
        examStatus === "pause"
          ? ""
          : String(totalWrong),

      total_correct:
        examStatus === "pause"
          ? ""
          : String(totalCorrect),

      total_attempted:
        examStatus === "pause"
          ? ""
          : String(totalAttempted),
    };
  }

  /* =====================================================
     SAVE ATTEMPT
  ===================================================== */

  async function saveAttempt(
    examStatus
  ) {
    if (requestRef.current || submitted) {
      return;
    }

    if (
      !uid ||
      !cid ||
      !exam?.id
    ) {
      setSaveError(
        "Unable to save attempt. Session or exam data is missing."
      );

      return;
    }

    try {
      requestRef.current = true;
      setSaving(true);
      setSaveError("");
      setSaveMessage("");

      const payload =
        buildAttemptPayload(
          examStatus
        );

      const shouldUpdate =
        Boolean(pauseId);

      const endpoint =
        shouldUpdate
          ? "/api/exam-attempt/update"
          : "/api/exam-attempt/create";

      const result =
        await sendAttemptRequest({
          endpoint,
          payload:
            shouldUpdate
              ? {
                  ...payload,
                  pauseid:
                    pauseId,
                }
              : payload,
        });

      if (
        result?.status === false
      ) {
        setSaveError(
          result?.message ||
            result?.msg ||
            "Backend did not save this attempt."
        );

        return;
      }

      const nextPauseId =
        pauseId || getAttemptId(result);

      if (!nextPauseId && examStatus === "pause") throw new Error("The service did not return an attempt ID. Please retry.");

      if (nextPauseId) {
        setPauseId(
          nextPauseId
        );

        try { saveAttemptHistory({
          cid,
          uid,
          attemptId:
            nextPauseId,
          examId:
            exam?.id,
          examType:
            examType || "twe",
          status:
            examStatus,
          title:
            exam?.exam_name ||
            exam?.exam ||
            "Topic Wise Exam",
        }); } catch { /* Saving history locally is optional. */ }
      }

      if (
        examStatus ===
        "completed"
      ) {
        setSubmitted(true);
        try { localStorage.removeItem(draftKey); } catch {}
        try {
          const analyticsResponse =
            await sendAttemptRequest({
              endpoint:
                "/api/exam-attempt/analytics",

              throwOnError:
                false,

              payload: {
                cid,
                uid,
                exam_id:
                  exam?.id,
                exam_type:
                  examType || "twe",
              },
            });

          const detailResponse =
            nextPauseId
              ? await sendAttemptRequest({
                  endpoint:
                    "/api/exam-attempt/analytics-details",

                  throwOnError:
                    false,

                  payload: {
                    cid,
                    uid,
                    id:
                      nextPauseId,
                    exam_type:
                      examType || "twe",
                  },
                })
              : null;

          setAnalytics({
            analytics:
              analyticsResponse,
            details:
              detailResponse,
          });
        } catch (analyticsError) {
          console.error(
            "TOPIC RESULT LOAD ERROR:",
            analyticsError
          );
        }
      } else {
        setIsPaused(true);
        try { localStorage.setItem(draftKey, JSON.stringify({ answers, pauseId: nextPauseId, timeLeft, currentPage })); } catch {}
      }

      setSaveError("");

      setSaveMessage(
        examStatus ===
          "completed"
          ? "Exam submitted successfully."
          : "Exam paused successfully."
      );
    } catch (error) {
      console.error(
        "TOPIC EXAM SAVE ERROR:",
        error
      );

      setSaveError(
        error?.message ||
          "Unable to save attempt."
      );
    } finally {
      requestRef.current = false;
      setSaving(false);
    }
  }

  function handlePause() {
    if (submitted || requestRef.current) return;
    if (isPaused) {
      // This runs only from the Resume button event.
      // eslint-disable-next-line react-hooks/purity
      setEndTime(Date.now() + timeLeft * 1000);
      setIsPaused(false);
      setSaveMessage(
        "Exam resumed."
      );
      setSaveError("");
      return;
    }

    saveAttempt("pause");
  }

  function handleFinish() {

    saveAttempt(
      "completed"
    );
  }

  const draftKey = `exam_draft_${uid}_${cid}_${examType}_${exam?.id}`;
  useEffect(() => {
    try {
      const draft = JSON.parse(localStorage.getItem(draftKey) || "null");
      if (!draft) return;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnswers(draft.answers || {});
      setPauseId(draft.pauseId);
      setTimeLeft(draft.timeLeft);
      setCurrentPage(draft.currentPage || 1);
      setIsPaused(true);
    } catch {}
  }, [draftKey]);

  useEffect(() => {
    if (!isTimeOver || submitted || saving || timeoutRef.current) return;
    timeoutRef.current = true;
    // Submission is an external persistence operation when the timer expires.
    saveAttempt("completed");
  });

  /* =====================================================
     UI
  ===================================================== */

  return (
    <>
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
            max-w-7xl
            px-4
            py-6
            sm:px-6
            lg:px-8
            lg:py-8 mt-20
          "
        >
          {/* TIMER ALWAYS AT TOP */}

        

          <ExamTopBar
  slug={slug}
  examSlug={examSlug}
  governmentExamsSlug={
    governmentExamsSlug
  }
  timeLeft={timeLeft}
  durationMinutes={durationMinutes}
/>
<ExamHero
  exam={exam}
  questionsCount={questions.length}
  timeLeft={timeLeft}
  durationMinutes={durationMinutes}
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

          {durationSeconds <=
          0 ? (
            <div
              className="
                mt-5
                rounded-[16px]
                border
                border-amber-200
                bg-amber-50
                p-4
                text-sm
                font-semibold
                text-amber-700
              "
            >
              Exam duration was
              not received from
              the API.
            </div>
          ) : null}

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
                You can no
                longer change
                your answers.
              </p>
            </div>
          ) : null}

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
              submitted || saving || isTimeOver ||
              isPaused
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
            onPrevious={
              handlePrevious
            }
            onNext={
              handleNext
            }
            onPageChange={
              handlePageChange
            }
          />

          {/* ALWAYS VISIBLE */}

          <ExamControls submitted={submitted}
            onPause={
              handlePause
            }
            onFinish={
              handleFinish
            }
            saving={
              saving
            }
            paused={
              isPaused
            }
          />

          {saveMessage ? (
            <div
              className="
                mt-4
                rounded-[14px]
                border
                border-emerald-200
                bg-emerald-50
                px-4
                py-3
                text-sm
                font-bold
                text-emerald-700
              "
            >
              {saveMessage}
            </div>
          ) : null}

          {saveError ? (
            <div
              className="
                mt-4
                rounded-[14px]
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                text-sm
                font-bold
                text-red-700
              "
            >
              {saveError}
            </div>
          ) : null}

          {analytics ? (
            <div
              className="
                mt-4
                rounded-[18px]
                border
                border-[#dce8f7]
                bg-white
                p-5
                text-sm
                text-slate-700
                shadow-sm
              "
            >
              <p
                className="
                  font-black
                  text-[#071f55]
                "
              >
                Exam Result
              </p>

              <div
                className="
                  mt-3
                  grid
                  gap-3
                  sm:grid-cols-4
                "
              >
                <ResultStat
                  label="Attempted"
                  value={
                    analytics
                      ?.details
                      ?.details?.[0]
                      ?.total_attempted ??
                    answeredCount
                  }
                />
                <ResultStat
                  label="Correct"
                  value={
                    analytics
                      ?.details
                      ?.details?.[0]
                      ?.total_correct ??
                    "-"
                  }
                />
                <ResultStat
                  label="Wrong"
                  value={
                    analytics
                      ?.details
                      ?.details?.[0]
                      ?.total_wrong ??
                    "-"
                  }
                />
                <ResultStat
                  label="Score"
                  value={
                    analytics
                      ?.details
                      ?.details?.[0]
                      ?.user_score ??
                    "-"
                  }
                />
              </div>
            </div>
          ) : null}
        </div>
      </main>

    </>
  );
}

function ResultStat({
  label,
  value,
}) {
  return (
    <div
      className="
        rounded-[14px]
        border
        border-[#dce8f7]
        bg-[#f8fbff]
        p-4
      "
    >
      <p
        className="
          text-[10px]
          font-black
          uppercase
          tracking-[0.12em]
          text-slate-400
        "
      >
        {label}
      </p>
      <p
        className="
          mt-1
          text-xl
          font-black
          text-[#071f55]
        "
      >
        {value}
      </p>
    </div>
  );
}
