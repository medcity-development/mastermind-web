import QuestionCard from "./QuestionCard";

import {
  QUESTIONS_PER_PAGE,
} from "../utils/examUtils";

export default function ExamQuestions({
  questions,
  currentPage,
  answers,
  onAnswer,
  disabled,
}) {
  return (
    <section className="mt-6 space-y-5">
      {questions.map(
        (
          question,
          index
        ) => (
          <QuestionCard
            key={
              question.id
            }
            question={
              question
            }
            number={
              (currentPage -
                1) *
                QUESTIONS_PER_PAGE +
              index +
              1
            }
            selected={
              answers[
                question.id
              ]
            }
            onAnswer={
              onAnswer
            }
            disabled={
              disabled
            }
          />
        )
      )}
    </section>
  );
}