
"use client";

import {
  normalizeOptionAnswer,
  isValidOptionAnswer,
} from "../utils/examUtils";

import {
  QUESTIONS_PER_PAGE,
  clampPage,
} from "../utils/examControllerHelpers";

export default function useExamAnswers(ctx) {
  const {
    currentPage,
    totalQuestions,
    restoreReady,
    submitted,
    paused,
    saving,
    interactionFrozen,
    attempt,
    setCurrentPage,
    totalDurationSeconds,
    normalizedQuestions,
    setAnswers,
    setLastAnsweredQuestionId,
  } = ctx;

  const totalPages = Math.max(
    1,
    Math.ceil(totalQuestions / QUESTIONS_PER_PAGE)
  );

  const startIndex =
    (currentPage - 1) * QUESTIONS_PER_PAGE;

  function pageTo(page) {
    if (
      !restoreReady ||
      submitted ||
      paused ||
      saving ||
      interactionFrozen
    ) {
      return;
    }

    const nextPage = clampPage(
      page,
      totalQuestions
    );

    attempt.current.currentPage = nextPage;
    setCurrentPage(nextPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleAnswer(questionId, optionKey) {
    if (
      submitted ||
      paused ||
      saving ||
      !restoreReady ||
      interactionFrozen ||
      attempt.current.frozen ||
      (
        totalDurationSeconds > 0 &&
        attempt.current.remainingSeconds <= 0
      )
    ) {
      return;
    }

    const question = normalizedQuestions.find(
      (item) =>
        String(item.id) === String(questionId)
    );

    const selected = normalizeOptionAnswer(optionKey);

    if (
      !question ||
      !isValidOptionAnswer(question, selected)
    ) {
      return;
    }

    const next = {
      ...attempt.current.answers,
      [questionId]: selected,
    };

    attempt.current.answers = next;
    attempt.current.lastAnsweredQuestionId = questionId;

    setAnswers(next);
    setLastAnsweredQuestionId(questionId);
  }

  return {
    totalPages,
    startIndex,
    pageTo,
    handleAnswer,
  };
}
