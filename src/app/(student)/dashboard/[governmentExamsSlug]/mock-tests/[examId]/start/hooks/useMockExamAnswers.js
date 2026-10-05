import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  normalizeAnswer,
} from "../utils/mockTestUtils";

export default function useMockExamAnswers({
  questions = [],
  disabled = false,
}) {
  const [
    answers,
    setAnswers,
  ] = useState({});

  const answersRef =
    useRef({});

  useEffect(() => {
    answersRef.current =
      answers;
  }, [
    answers,
  ]);

  const handleAnswer =
    useCallback(
      (
        questionId,
        answer
      ) => {
        if (disabled) {
          return;
        }

        setAnswers(
          (previous) => {
            const updated = {
              ...previous,

              [questionId]:
                answer,
            };

            answersRef.current =
              updated;

            return updated;
          }
        );
      },
      [
        disabled,
      ]
    );

  const answeredCount =
    useMemo(
      () =>
        Object.values(
          answers
        ).filter(
          (answer) =>
            Boolean(
              normalizeAnswer(
                answer
              )
            )
        ).length,
      [
        answers,
      ]
    );

  const unansweredCount =
    Math.max(
      0,
      questions.length -
        answeredCount
    );

  function restoreAnswers(
    restored = {}
  ) {
    answersRef.current =
      restored;

    setAnswers(
      restored
    );
  }

  function resetAnswers() {
    answersRef.current =
      {};

    setAnswers({});
  }

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