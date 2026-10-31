
import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  isValidQuestionAnswer,
  normalizeAnswer,
} from "../utils/mockTestUtils";

export default function useMockExamAnswers({
  questions = [],
  disabled = false,
}) {
  const [answers, setAnswers] = useState({});
  const answersRef = useRef({});

  const questionMap = useMemo(
    () =>
      new Map(
        questions.map((question, index) => [
          String(question?.id ?? index + 1),
          question,
        ])
      ),
    [questions]
  );

  const handleAnswer = useCallback(
    (questionId, answer) => {
      if (disabled) return;

      const question = questionMap.get(
        String(questionId)
      );

      const selected = normalizeAnswer(answer);

      if (
        !question ||
        !selected ||
        !isValidQuestionAnswer(question, selected)
      ) {
        return;
      }

      setAnswers((previous) => {
        const updated = {
          ...previous,
          [questionId]: selected,
        };

        answersRef.current = updated;

        return updated;
      });
    },
    [disabled, questionMap]
  );

  const answeredCount = useMemo(
    () =>
      questions.reduce((count, question, index) => {
        const id = question?.id ?? index + 1;

        return (
          count +
          Number(
            isValidQuestionAnswer(
              question,
              answers[id]
            )
          )
        );
      }, 0),
    [questions, answers]
  );

  const unansweredCount = Math.max(
    0,
    questions.length - answeredCount
  );

  const restoreAnswers = useCallback(
    (restored = {}) => {
      const next =
        restored &&
        typeof restored === "object" &&
        !Array.isArray(restored)
          ? { ...restored }
          : {};

      answersRef.current = next;
      setAnswers(next);
    },
    []
  );

  const resetAnswers = useCallback(() => {
    answersRef.current = {};
    setAnswers({});
  }, []);

  return {
    answers,
    answersRef,
    answeredCount,
    unansweredCount,
    handleAnswer,
    restoreAnswers,
    resetAnswers,
  };
}
