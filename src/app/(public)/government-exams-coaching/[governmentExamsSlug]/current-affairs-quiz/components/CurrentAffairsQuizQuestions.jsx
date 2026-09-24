"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import QuizSummary from "./quiz-questions/QuizSummary";
import QuizQuestionCard from "./quiz-questions/QuizQuestionCard";
import QuizPagination from "./quiz-questions/QuizPagination";
import QuizMessage from "./quiz-questions/QuizMessage";
import QuizQuestionsHeader from "./quiz-questions/QuizQuestionsHeader";

import showQuizResultAlert from "./quiz-questions/QuizResultAlert";
import showQuizPageAlert from "./quiz-questions/QuizPageAlert";

const QUESTIONS_PER_PAGE = 5;

export default function CurrentAffairsQuizQuestions({
  quiz,
  monthId,
  uid = 0,
}) {
  const [questions, setQuestions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [
    selectedAnswers,
    setSelectedAnswers,
  ] = useState({});

  const [
    resultShown,
    setResultShown,
  ] = useState(false);

  const sectionRef =
    useRef(null);

  /* =================================
     LOAD QUESTIONS
  ================================= */

  useEffect(() => {
    if (!quiz?.id) {
      setQuestions([]);
      setLoading(false);
      return;
    }

    let active = true;

    async function loadQuestions() {
      try {
        setLoading(true);
        setError("");

        setQuestions([]);
        setCurrentPage(1);
        setSelectedAnswers({});
        setResultShown(false);

        const response =
          await fetch(
            `/api/current-affairs-quiz/quiz-questions?cid=${encodeURIComponent(
              quiz.id
            )}&uid=${encodeURIComponent(
              uid
            )}`,
            {
              cache: "no-store",
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Unable to load questions."
          );
        }

        if (!active) {
          return;
        }

        const data =
          Array.isArray(
            result?.data
          )
            ? result.data
            : [];

        const matchedQuestions =
          data.filter(
            (question) =>
              String(
                question?.qid
              ) ===
                String(
                  quiz.id
                ) &&
              String(
                question?.c_id
              ) ===
                String(
                  monthId
                )
          );

        setQuestions(
          matchedQuestions
        );
      } catch (error) {
        console.error(
          "Quiz questions error:",
          error
        );

        if (active) {
          setError(
            error?.message ||
              "Unable to load quiz questions."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadQuestions();

    return () => {
      active = false;
    };
  }, [
    quiz?.id,
    monthId,
    uid,
  ]);

  /* =================================
     PAGINATION
  ================================= */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        questions.length /
          QUESTIONS_PER_PAGE
      )
    );

  const startIndex =
    (currentPage - 1) *
    QUESTIONS_PER_PAGE;

  const endIndex =
    startIndex +
    QUESTIONS_PER_PAGE;

  const visibleQuestions =
    questions.slice(
      startIndex,
      endIndex
    );

  /* =================================
     SCORE
  ================================= */

  const answeredCount =
    Object.keys(
      selectedAnswers
    ).length;

  const correctCount =
    useMemo(() => {
      return questions.reduce(
        (
          total,
          question
        ) => {
          const selected =
            selectedAnswers[
              question.id
            ];

          const isCorrect =
            selected &&
            String(
              selected
            ) ===
              String(
                question?.answer
              );

          return isCorrect
            ? total + 1
            : total;
        },
        0
      );
    }, [
      questions,
      selectedAnswers,
    ]);

  const wrongCount =
    answeredCount -
    correctCount;

  const progress =
    questions.length > 0
      ? Math.round(
          (answeredCount /
            questions.length) *
            100
        )
      : 0;

  const score =
    questions.length > 0
      ? Math.round(
          (correctCount /
            questions.length) *
            100
        )
      : 0;

  /* =================================
     FINAL RESULT
  ================================= */

  useEffect(() => {
    const completed =
      questions.length > 0 &&
      answeredCount ===
        questions.length;

    if (
      !completed ||
      resultShown
    ) {
      return;
    }

    setResultShown(true);

    showQuizResultAlert({
      quizName:
        quiz?.name,

      answeredCount,

      totalQuestions:
        questions.length,

      correctCount,

      wrongCount,

      score,

      progress,
    });
  }, [
    answeredCount,
    correctCount,
    wrongCount,
    score,
    progress,
    questions.length,
    quiz?.name,
    resultShown,
  ]);

  /* =================================
     ANSWER
  ================================= */

  function handleSelectAnswer(
    questionId,
    value
  ) {
    setSelectedAnswers(
      (previous) => {
        /*
         * Do not allow the answer
         * to change after selecting.
         */

        if (
          previous[
            questionId
          ]
        ) {
          return previous;
        }

        return {
          ...previous,
          [questionId]:
            value,
        };
      }
    );
  }

  /* =================================
     CHECK CURRENT PAGE
  ================================= */

  function getUnansweredQuestions() {
    return visibleQuestions.filter(
      (question) =>
        !selectedAnswers[
          question.id
        ]
    );
  }

  /* =================================
     PAGE CHANGE
  ================================= */

  async function handlePageChange(
    page
  ) {
    /*
     * Invalid page
     */

    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    /*
     * Already on this page
     */

    if (
      page === currentPage
    ) {
      return;
    }

    /*
     * Only block FORWARD navigation.
     *
     * Previous navigation is always
     * allowed.
     */

    if (
      page > currentPage
    ) {
      const unansweredQuestions =
        getUnansweredQuestions();

      if (
        unansweredQuestions.length >
        0
      ) {
        await showQuizPageAlert({
          unansweredCount:
            unansweredQuestions.length,
        });

        return;
      }
    }

    /*
     * Page is valid.
     */

    setCurrentPage(page);

    requestAnimationFrame(
      () => {
        sectionRef.current?.scrollIntoView(
          {
            behavior:
              "smooth",
            block:
              "start",
          }
        );
      }
    );
  }

  /* =================================
     STATES
  ================================= */

  if (loading) {
    return (
      <QuizMessage
        type="loading"
        message="Loading questions..."
      />
    );
  }

  if (error) {
    return (
      <QuizMessage
        type="error"
        message={error}
      />
    );
  }

  if (
    questions.length ===
    0
  ) {
    return (
      <QuizMessage
        type="empty"
        message={`No questions available for ${
          quiz?.name ||
          "this quiz"
        }.`}
      />
    );
  }

  /* =================================
     UI
  ================================= */

  return (
    <div
      ref={sectionRef}
      className="
        mt-7
        scroll-mt-24
      "
    >
      {/* SUMMARY */}

      <QuizSummary
        quiz={quiz}
        totalQuestions={
          questions.length
        }
        questionsPerPage={
          QUESTIONS_PER_PAGE
        }
        answeredCount={
          answeredCount
        }
        correctCount={
          correctCount
        }
        progress={progress}
      />

      {/* QUESTION INFO */}

      <QuizQuestionsHeader
        startIndex={
          startIndex
        }
        endIndex={
          endIndex
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

      {/* QUESTIONS */}

      <div
        className="
          space-y-5
        "
      >
        {visibleQuestions.map(
          (
            question,
            index
          ) => (
            <QuizQuestionCard
              key={
                question?.id ??
                index
              }
              question={
                question
              }
              number={
                startIndex +
                index +
                1
              }
              selectedOption={
                selectedAnswers[
                  question.id
                ] || null
              }
              onSelect={(
                value
              ) =>
                handleSelectAnswer(
                  question.id,
                  value
                )
              }
            />
          )
        )}
      </div>

      {/* PAGINATION */}

      <QuizPagination
        currentPage={
          currentPage
        }
        totalPages={
          totalPages
        }
        onChange={
          handlePageChange
        }
      />
    </div>
  );
}