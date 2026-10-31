
import {
  useCallback,
  useMemo,
} from "react";

import {
  calculatePreviousQuestionResult,
  isValidOptionAnswer,
} from "../utils/examUtils";

export default function useExamScoring({
  exam,
  normalizedQuestions,
  answers,
}) {
  const totalQuestions =
    normalizedQuestions.length;

  const markTotal = Number(
    exam?.total_mark ??
    exam?.total_marks ??
    exam?.mark
  );

  const totalMark =
    Number.isFinite(markTotal) &&
    markTotal > 0
      ? markTotal
      : totalQuestions;

  const markPerCorrect = 1;
  const negativeMarkPerWrong = 0.333;

  const statsFor = useCallback(
    (selected) =>
      calculatePreviousQuestionResult({
        questions:
          normalizedQuestions,
        answers: selected,
      }),
    [normalizedQuestions]
  );

  const stats = useMemo(
    () => statsFor(answers),
    [answers, statsFor]
  );

  const answeredCount = useMemo(
    () =>
      normalizedQuestions.filter(
        (question) =>
          isValidOptionAnswer(
            question,
            answers[question.id]
          )
      ).length,
    [
      answers,
      normalizedQuestions,
    ]
  );

  return {
    totalMark,
    markPerCorrect,
    negativeMarkPerWrong,
    statsFor,
    stats,
    answeredCount,
  };
}
