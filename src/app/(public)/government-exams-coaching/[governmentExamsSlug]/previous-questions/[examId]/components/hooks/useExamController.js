"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  normalizeQuestions,
} from "../utils/examUtils";

import {
  calculateExamResult,
  getAttemptId,
} from "@/lib/examAttemptData";

import {
  saveGuestExamHandoff,
  guestExamLoginRedirectPath,
} from "@/lib/guestExamHandoff";

const QUESTIONS_PER_PAGE = 10;

function failed(value) {
  return [
    false,
    0,
    "0",
    "false",
    "error",
    "failed",
  ].includes(value);
}

function positiveId(value) {
  const number = Number(value);

  return Number.isSafeInteger(number) && number > 0
    ? number
    : null;
}

async function postAttempt(endpoint, payload) {
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
      "Exam API returned an invalid response."
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
      "Unable to save this exam."
    );

    error.status = response.status;
    throw error;
  }

  return result;
}

export default function useExamController({
  exam,
  examId,
  questions = [],
  uid,
  cid,
  examType = "pqp",
  lastPosition,
  initialPauseId = null,
  governmentExamsSlug = "",
  guestAction = "",
}) {
  const id = examId ?? exam?.id;

  const type = ["pyq", "pqp"].includes(
    String(examType).toLowerCase()
  )
    ? "pqp"
    : String(examType).toLowerCase();

  const normalizedQuestions = useMemo(
    () => normalizeQuestions(questions),
    [questions]
  );

  const totalQuestions =
    normalizedQuestions.length;

  const durationMinutes = Math.max(
    0,
    Number(
      exam?.total_minutes ??
      exam?.duration ??
      exam?.exam_duration ??
      0
    ) || 0
  );

  const totalDurationSeconds = Math.round(
    durationMinutes * 60
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [paused, setPaused] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [
    remainingSeconds,
    setRemainingSeconds,
  ] = useState(totalDurationSeconds);

  const [
    resultModalOpen,
    setResultModalOpen,
  ] = useState(false);

  const [
    submittedResult,
    setSubmittedResult,
  ] = useState(null);

  const [
    restoreReady,
    setRestoreReady,
  ] = useState(
    !["pause", "submit"].includes(guestAction)
  );

  const lock = useRef(false);

  /*
   * The ref is the authoritative snapshot.
   * Restoring answers works before React renders
   * the updated state.
   */
  const attempt = useRef({
    answers: {},
    remainingSeconds: totalDurationSeconds,
    startTime: 0,
    endTime: null,
    pauseId: initialPauseId,
    boundUid: null,
    submittedResult: null,
    frozen: !restoreReady,
  });

  useEffect(() => {
    attempt.current = {
      answers: {},
      remainingSeconds: totalDurationSeconds,
      startTime: Date.now(),
      endTime: null,
      pauseId: initialPauseId,
      boundUid: null,
      submittedResult: null,
      frozen: ["pause", "submit"].includes(
        guestAction
      ),
    };

    setAnswers({});
    setCurrentPage(1);
    setRemainingSeconds(totalDurationSeconds);
    setSubmitted(false);
    setPaused(false);
    setSaving(false);
    setSaveError("");
    setSubmittedResult(null);
    setResultModalOpen(false);

    setRestoreReady(
      !["pause", "submit"].includes(guestAction)
    );
  }, [
    id,
    totalDurationSeconds,
    initialPauseId,
    guestAction,
  ]);

  /* TIMER */

  useEffect(() => {
    if (
      !restoreReady ||
      submitted ||
      paused ||
      saving ||
      totalDurationSeconds <= 0 ||
      attempt.current.frozen
    ) {
      return;
    }

    let lastTick = Date.now();

    const timer = window.setInterval(() => {
      if (
        attempt.current.frozen ||
        lock.current
      ) {
        lastTick = Date.now();
        return;
      }

      const now = Date.now();

      const elapsed = Math.floor(
        (now - lastTick) / 1000
      );

      if (elapsed < 1) return;

      lastTick += elapsed * 1000;

      attempt.current.remainingSeconds = Math.max(
        0,
        attempt.current.remainingSeconds - elapsed
      );

      setRemainingSeconds(
        attempt.current.remainingSeconds
      );
    }, 250);

    return () => window.clearInterval(timer);
  }, [
    restoreReady,
    submitted,
    paused,
    saving,
    totalDurationSeconds,
  ]);

  /* ANSWERS AND SCORING */

  const answerArray = useMemo(
    () =>
      normalizedQuestions.map(
        (question) =>
          question.answerkey ??
          question.answer ??
          question.correct_answer ??
          question.correctAnswer ??
          0
      ),
    [normalizedQuestions]
  );

  const markTotal = Number(
    exam?.total_mark ??
    exam?.total_marks ??
    exam?.mark
  );

  const totalMark =
    Number.isFinite(markTotal) && markTotal > 0
      ? markTotal
      : totalQuestions;

  const markPerCorrect = 1;
  const negativeMarkPerWrong = 0.333;

  const statsFor = useCallback(
    (selected) =>
      calculateExamResult({
        answerArray,

        userAnswers:
          normalizedQuestions.map(
            (question) =>
              selected[question.id] ?? 0
          ),

        markPerCorrect,
        negativeMarkPerWrong,
      }),
    [
      answerArray,
      normalizedQuestions,
      markPerCorrect,
      negativeMarkPerWrong,
    ]
  );

  const stats = useMemo(
    () => statsFor(answers),
    [answers, statsFor]
  );

  /* RESTORE GUEST ATTEMPT */

  const restoreGuestAttempt = useCallback(
    (saved) => {
      if (
        String(saved.examId) !== String(id) ||
        saved.examType !== type ||
        String(saved.governmentExamsSlug) !==
        governmentExamsSlug ||
        Number(saved.cid) !== Number(cid)
      ) {
        throw new Error(
          "Saved exam does not match this test."
        );
      }

      if (
        !saved.answers ||
        Array.isArray(saved.answers) ||
        typeof saved.answers !== "object"
      ) {
        throw new Error(
          "Saved answers are invalid."
        );
      }

      const questionIds =
        normalizedQuestions.map(
          (question) => String(question.id)
        );

      if (
        !Array.isArray(saved.questionIds) ||
        JSON.stringify(saved.questionIds) !==
        JSON.stringify(questionIds)
      ) {
        throw new Error(
          "The question paper changed. The saved attempt cannot be restored safely."
        );
      }

      if (
        !Number.isFinite(saved.remainingSeconds) ||
        saved.remainingSeconds < 0 ||
        saved.remainingSeconds >
        totalDurationSeconds ||
        !Number.isFinite(saved.startTime)
      ) {
        throw new Error(
          "Saved exam timing is invalid."
        );
      }

      const currentUid = positiveId(uid);

      if (
        saved.boundUid &&
        Number(saved.boundUid) !== currentUid
      ) {
        throw new Error(
          "This attempt belongs to another signed-in account."
        );
      }

      attempt.current = {
        answers: { ...saved.answers },
        remainingSeconds: saved.remainingSeconds,
        startTime: saved.startTime,
        endTime: saved.endTime ?? null,
        pauseId: saved.pauseId ?? null,
        boundUid: saved.boundUid ?? null,
        submittedResult:
          saved.submittedResult ?? null,
        frozen: true,
      };

      setAnswers(attempt.current.answers);
      setRemainingSeconds(saved.remainingSeconds);
      setRestoreReady(true);

      if (saved.submittedResult) {
        setSubmitted(true);
        setSubmittedResult(saved.submittedResult);
        setResultModalOpen(true);
      }

      return saved;
    },
    [
      id,
      type,
      governmentExamsSlug,
      cid,
      uid,
      normalizedQuestions,
      totalDurationSeconds,
    ]
  );

  function checkpoint(action) {
    return saveGuestExamHandoff({
      ...attempt.current,
      examId: id,
      examType: type,
      cid,
      governmentExamsSlug,
      action,

      questionIds:
        normalizedQuestions.map(
          (question) => String(question.id)
        ),
    });
  }

  /* SAVE PAUSE / FINISH */

  async function save(action) {
    if (lock.current || !restoreReady) {
      return false;
    }

    if (attempt.current.submittedResult) {
      setResultModalOpen(true);
      return true;
    }

    lock.current = true;
    setSaving(true);
    setSaveError("");

    attempt.current.frozen = true;

    if (action === "submit") {
      attempt.current.endTime ??= Date.now();
    }

    try {
      /*
       * Guest finish:
       * save locally, then open login.
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

      const current = attempt.current;

      const resultStats = statsFor(
        current.answers
      );

      const payload = {
        cid,
        exam_id: id,
        exam_type: type,
        lastposition: lastPosition ?? type,

        total_questions: totalQuestions,
        total_mark: totalMark,

        remaining_seconds:
          current.remainingSeconds,

        start_time:
          current.startTime,

        ...(action === "submit"
          ? { end_time: current.endTime }
          : {}),

        answer_array:
          answerArray,

        user_answers:
          normalizedQuestions.map(
            (question) =>
              current.answers[question.id] ?? 0
          ),

        total_attempted:
          resultStats.attempted,

        total_correct:
          resultStats.correct,

        total_wrong:
          resultStats.wrong,

        user_score:
          resultStats.score,

        minus_mark:
          resultStats.negativeMark,

        __scoring: {
          markPerCorrect,
          negativeMarkPerWrong,
        },
      };

      const isResuming = Boolean(current.pauseId);
      const result = await postAttempt(
        "/api/pyq-attempt",
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
        const savedId = positiveId(
          getAttemptId(result)
        );

        if (!savedId) {
          throw new Error(
            "The backend saved the attempt but did not return its ID. Please contact support before retrying."
          );
        }

        current.pauseId = savedId;
        current.boundUid = Number(uid);

        if (
          ["pause", "submit"].includes(guestAction)
        ) {
          checkpoint(action);
        }
      }

      if (action === "submit") {
        const finalResult = {
          ...payload,
          ...result.savedResult,

          id: current.pauseId,
          pauseid: current.pauseId,
          exam_status: "finish",

          exam_name:
            exam?.exam_name ??
            exam?.title ??
            "",

          status: true,
        };

        current.submittedResult = finalResult;

        setSubmittedResult(finalResult);
        setSubmitted(true);
        setResultModalOpen(true);

        /*
         * Retain the saved result for refresh.
         * View Analysis clears guest storage.
         */
        if (
          ["pause", "submit"].includes(guestAction)
        ) {
          try {
            checkpoint(action);
          } catch {
            // Backend save succeeded; show result.
          }
        }
      } else {
        setPaused(true);
      }

      return result;
    } catch (error) {
      if (error.status === 401) {
        try {
          checkpoint(action);

          window.location.assign(
            `/login?redirect=${encodeURIComponent(
              guestExamLoginRedirectPath(action)
            )}`
          );
        } catch (storageError) {
          setSaveError(storageError.message);
        }
      } else {
        setSaveError(
          error.message ||
          "Unable to save this exam. Retry using the button below."
        );
      }

      return false;
    } finally {
      lock.current = false;
      setSaving(false);
    }
  }

  /* PAGINATION */

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalQuestions / QUESTIONS_PER_PAGE
    )
  );

  const startIndex =
    (currentPage - 1) * QUESTIONS_PER_PAGE;

  function pageTo(page) {
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

  /* ANSWER SELECTION */

  function handleAnswer(questionId, optionKey) {
    if (
      submitted ||
      paused ||
      saving ||
      !restoreReady ||
      attempt.current.frozen ||
      (
        totalDurationSeconds > 0 &&
        attempt.current.remainingSeconds <= 0
      )
    ) {
      return;
    }

    const next = {
      ...attempt.current.answers,
      [questionId]: optionKey,
    };

    attempt.current.answers = next;
    setAnswers(next);
  }

  return {
    currentPage,
    totalPages,
    startIndex,

    endIndex: Math.min(
      startIndex + QUESTIONS_PER_PAGE,
      totalQuestions
    ),

    currentQuestions:
      normalizedQuestions.slice(
        startIndex,
        startIndex + QUESTIONS_PER_PAGE
      ),

    totalQuestions,
    answers,

    answeredCount:
      stats.attempted,

    unansweredCount:
      totalQuestions - stats.attempted,

    progress:
      totalQuestions > 0
        ? Math.round(
          (stats.attempted / totalQuestions) * 100
        )
        : 0,

    submitted,
    saving,
    paused,
    saveError,
    restoreReady,

    correctCount:
      submitted
        ? submittedResult?.total_correct ??
        stats.correct
        : 0,

    wrongCount:
      submitted
        ? submittedResult?.total_wrong ??
        stats.wrong
        : 0,

    durationMinutes,
    totalDurationSeconds,
    remainingSeconds,

    elapsedSeconds:
      totalDurationSeconds - remainingSeconds,

    timerFinished:
      restoreReady &&
      totalDurationSeconds > 0 &&
      remainingSeconds === 0,

    handleAnswer,

    handlePreviousPage:
      () => pageTo(currentPage - 1),

    handleNextPage:
      () => pageTo(currentPage + 1),

    handlePageChange:
      pageTo,

    handlePause:
      () => save("pause"),

    handleSubmit:
      () => save("submit"),

    restoreGuestAttempt,
    resultModalOpen,
    submittedResult,

    closeResultModal:
      () => setResultModalOpen(false),
  };
}