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
  normalizeExamAnswer,
  parseAnswers,
  savedPausedTimeToSeconds,
  timestampToMilliseconds,
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

function getLastAnsweredIndex(questions, answers) {
  return questions.reduce(
    (lastIndex, question, index) => {
      const answer = normalizeExamAnswer(
        answers?.[question.id]
      );

      return /^[A-D]$/.test(answer)
        ? index
        : lastIndex;
    },
    -1
  );
}

function getQuestionIndex(questions, questionId) {
  return questions.findIndex(
    (question) => String(question.id) === String(questionId)
  );
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

  const draftKey =
    `exam_draft_${uid}_${cid}_${type}_${id}`;

  const [currentPage, setCurrentPage] = useState(1);
  const [answers, setAnswers] = useState({});
  const [
    lastAnsweredQuestionId,
    setLastAnsweredQuestionId,
  ] = useState(null);
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
    !initialPauseId &&
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
    lastAnsweredQuestionId: null,
    remainingSeconds: totalDurationSeconds,
    startTime: 0,
    endTime: null,
    pauseId: initialPauseId,
    boundUid: null,
    submittedResult: null,
    frozen: !restoreReady,
  });

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(async () => {
      let savedDraft = null;
      let restoreFailure = "";

      if (initialPauseId) {
        try {
          const draft = JSON.parse(
            localStorage.getItem(draftKey) || "null"
          );

          if (
            draft &&
            String(draft.pauseId) === String(initialPauseId)
          ) {
            savedDraft = draft;
          }
        } catch (error) {
          console.warn(
            "Unable to restore paused PYQ draft:",
            error
          );
        }
      }

      if (initialPauseId && !savedDraft) {
        try {
          const response = await fetch(
            "/api/exam-attempt/analytics-details",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              cache: "no-store",
              body: JSON.stringify({
                cid,
                id: initialPauseId,
                exam_type: type,
              }),
            }
          );
          const result = await response.json();

          if (!response.ok || result?.status === false) {
            throw new Error(
              result?.message ||
              "Unable to load the saved attempt."
            );
          }

          const candidates = [
            result?.details,
            result?.data,
            result?.result,
            result?.results,
          ];
          const rows = candidates.find(Array.isArray);
          const savedAttempt =
            rows?.find(
              (row) =>
                String(
                  row?.pauseid ??
                  row?.pause_id ??
                  row?.attempt_id ??
                  row?.id
                ) === String(initialPauseId)
            ) ??
            (result?.data &&
            !Array.isArray(result.data) &&
            typeof result.data === "object"
              ? result.data
              : null);

          if (!savedAttempt) {
            throw new Error(
              "Saved attempt details were not returned."
            );
          }

          const savedAnswers = parseAnswers(
            savedAttempt.user_answers ??
            savedAttempt.answers
          );
          const restoredAnswers = {};

          normalizedQuestions.forEach((question, index) => {
            const answer = normalizeExamAnswer(
              savedAnswers[index]
            );

            if (/^[A-D]$/.test(answer)) {
              restoredAnswers[question.id] = answer;
            }
          });

          const savedPage = Number(
            savedAttempt.current_page ??
            savedAttempt.currentPage
          );
          const savedQuestionPosition = Number(
            savedAttempt.lastposition ??
            savedAttempt.last_position
          );
          const savedLastAnsweredQuestionId =
            Number.isSafeInteger(savedQuestionPosition) &&
            savedQuestionPosition > 0
              ? normalizedQuestions[
                savedQuestionPosition - 1
              ]?.id ?? null
              : null;
          const lastAnsweredIndex = savedAnswers.reduce(
            (lastIndex, answer, index) =>
              /^[A-D]$/.test(normalizeExamAnswer(answer))
                ? index
                : lastIndex,
            -1
          );

          savedDraft = {
            answers: restoredAnswers,
            lastAnsweredQuestionId:
              savedLastAnsweredQuestionId,
            pauseId: initialPauseId,
            remainingSeconds:
              savedAttempt.paused_time == null
                ? totalDurationSeconds
                : savedPausedTimeToSeconds(
                  savedAttempt.paused_time,
                  totalDurationSeconds
                ),
            currentPage:
              Number.isSafeInteger(savedPage) &&
              savedPage > 0
                ? savedPage
                : Math.floor(
                  Math.max(0, lastAnsweredIndex) /
                  QUESTIONS_PER_PAGE
                ) + 1,
            startTime:
              timestampToMilliseconds(
                savedAttempt.start_time ??
                savedAttempt.startTime ??
                savedAttempt.started_at
              ) ?? Date.now(),
          };

          try {
            localStorage.setItem(
              draftKey,
              JSON.stringify(savedDraft)
            );
          } catch (storageError) {
            console.warn(
              "Unable to cache restored PYQ attempt:",
              storageError
            );
          }
        } catch (error) {
          console.error(
            "Unable to restore saved PYQ attempt:",
            error
          );

          restoreFailure =
            error?.message ||
            "Unable to restore the saved attempt.";
        }
      }

      const restoredAnswers =
        savedDraft?.answers &&
        typeof savedDraft.answers === "object" &&
        !Array.isArray(savedDraft.answers)
          ? savedDraft.answers
          : {};
      const savedQuestionIndex = getQuestionIndex(
        normalizedQuestions,
        savedDraft?.lastAnsweredQuestionId
      );
      const lastAnsweredIndex =
        savedQuestionIndex >= 0
          ? savedQuestionIndex
          : getLastAnsweredIndex(
            normalizedQuestions,
            restoredAnswers
          );
      const restoredLastAnsweredQuestionId =
        lastAnsweredIndex >= 0
          ? normalizedQuestions[lastAnsweredIndex]?.id ?? null
          : null;
      const resumePage = lastAnsweredIndex >= 0
        ? Math.floor(
          lastAnsweredIndex / QUESTIONS_PER_PAGE
        ) + 1
        : Number(savedDraft?.currentPage) || 1;
      const restoredPage = Math.min(
        Math.max(resumePage, 1),
        Math.max(
          1,
          Math.ceil(totalQuestions / QUESTIONS_PER_PAGE)
        )
      );
      const savedRemainingSeconds = Number(
        savedDraft?.remainingSeconds
      );
      const restoredRemainingSeconds =
        Number.isFinite(savedRemainingSeconds)
          ? Math.min(
            totalDurationSeconds,
            Math.max(0, savedRemainingSeconds)
          )
          : totalDurationSeconds;

      if (cancelled) return;

      attempt.current = {
        answers: restoredAnswers,
        lastAnsweredQuestionId:
          restoredLastAnsweredQuestionId,
        remainingSeconds: restoredRemainingSeconds,
        startTime:
          Number(savedDraft?.startTime) || Date.now(),
        endTime: null,
        pauseId: initialPauseId,
        boundUid: null,
        submittedResult: null,
        frozen: ["pause", "submit"].includes(
          guestAction
        ),
      };

      setAnswers(restoredAnswers);
      setLastAnsweredQuestionId(
        restoredLastAnsweredQuestionId
      );
      setCurrentPage(restoredPage);
      setRemainingSeconds(restoredRemainingSeconds);
      setSubmitted(false);
      setPaused(false);
      setSaving(false);
      setSaveError(restoreFailure);
      setSubmittedResult(null);
      setResultModalOpen(false);

      setRestoreReady(
        Boolean(
          savedDraft ||
          (
            !initialPauseId &&
            !["pause", "submit"].includes(guestAction)
          )
        )
      );

      if (initialPauseId && savedDraft) {
        attempt.current.frozen = false;
      }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    id,
    draftKey,
    cid,
    type,
    normalizedQuestions,
    totalQuestions,
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

  const answeredCount = useMemo(
    () =>
      Object.values(answers).filter(
        (answer) =>
          answer != null &&
          String(answer).trim() !== "" &&
          String(answer) !== "0"
      ).length,
    [answers]
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

      const savedQuestionIndex = getQuestionIndex(
        normalizedQuestions,
        saved.lastAnsweredQuestionId
      );
      const lastQuestionIndex =
        savedQuestionIndex >= 0
          ? savedQuestionIndex
          : getLastAnsweredIndex(
            normalizedQuestions,
            saved.answers
          );
      const restoredLastAnsweredQuestionId =
        lastQuestionIndex >= 0
          ? normalizedQuestions[lastQuestionIndex]?.id ?? null
          : null;

      attempt.current = {
        answers: { ...saved.answers },
        lastAnsweredQuestionId:
          restoredLastAnsweredQuestionId,
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
      setLastAnsweredQuestionId(
        restoredLastAnsweredQuestionId
      );
      if (lastQuestionIndex >= 0) {
        setCurrentPage(
          Math.floor(
            lastQuestionIndex / QUESTIONS_PER_PAGE
          ) + 1
        );
      }
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

      const resultStats = action === "submit"
        ? statsFor(current.answers)
        : null;
      const lastAnsweredIndex = getQuestionIndex(
        normalizedQuestions,
        current.lastAnsweredQuestionId
      );
      const resumePosition = lastAnsweredIndex >= 0
        ? lastAnsweredIndex + 1
        : (currentPage - 1) * QUESTIONS_PER_PAGE + 1;

      const payload = {
        cid,
        exam_id: id,
        exam_type: type,
        lastposition: resumePosition,

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

        __scoring: {
          markPerCorrect,
          negativeMarkPerWrong,
        },
      };

      if (resultStats) {
        Object.assign(payload, {
          total_attempted: resultStats.attempted,
          total_correct: resultStats.correct,
          total_wrong: resultStats.wrong,
          user_score: resultStats.score,
          minus_mark: resultStats.negativeMark,
        });
      }

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

      if (action === "pause") {
        try {
          localStorage.setItem(
            draftKey,
            JSON.stringify({
              answers: current.answers,
              lastAnsweredQuestionId:
                current.lastAnsweredQuestionId,
              pauseId: current.pauseId,
              remainingSeconds: current.remainingSeconds,
              currentPage:
                Math.floor(
                  (resumePosition - 1) /
                  QUESTIONS_PER_PAGE
                ) + 1,
              startTime: current.startTime,
            })
          );
        } catch (storageError) {
          console.warn(
            "Unable to save paused PYQ draft:",
            storageError
          );
        }
      } else {
        try {
          localStorage.removeItem(draftKey);
        } catch (storageError) {
          console.warn(
            "Unable to clear submitted PYQ draft:",
            storageError
          );
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
    attempt.current.lastAnsweredQuestionId = questionId;
    setAnswers(next);
    setLastAnsweredQuestionId(questionId);
  }

  return {
    currentPage,
    totalPages,
    startIndex,
    lastAnsweredQuestionId,

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
      answeredCount,

    unansweredCount:
      totalQuestions - answeredCount,

    progress:
      totalQuestions > 0
        ? Math.round(
          (answeredCount / totalQuestions) * 100
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
        0
        : 0,

    wrongCount:
      submitted
        ? submittedResult?.total_wrong ??
        0
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