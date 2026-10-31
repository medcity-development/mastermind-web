
import { CheckCircle2 } from "lucide-react";

import QuestionCard from "./QuestionCard";

import {
  isValidOptionAnswer,
  normalizeOptionAnswer,
} from "./utils/examUtils";

export default function ExamQuestions({
  questions = [],
  startIndex = 0,
  answers = {},
  submitted = false,
  imagePath = "",
  onAnswer,
}) {
  if (!Array.isArray(questions)) {
    return null;
  }

  return (
    <div className="space-y-5">
      {questions.map((question, index) => {
        const questionId =
          question?.id ?? startIndex + index + 1;

        const selectedAnswer =
          normalizeOptionAnswer(
            answers?.[questionId]
          );

        const isAnswered =
          isValidOptionAnswer(
            question,
            selectedAnswer
          );

        return (
          <div
            key={questionId}
            id={`exam-question-${questionId}`}
            className="
              rounded-[24px]
              border
              border-slate-200
              bg-white
              p-3
              shadow-[0_12px_38px_rgba(15,23,42,0.04)]
              transition-all
              duration-300
              hover:border-blue-200
              hover:shadow-[0_18px_45px_rgba(15,23,42,0.07)]
              sm:p-4
            "
          >
            {/* QUESTION HEADER */}

            <div
              className="
                mb-3
                flex
                items-center
                justify-between
                gap-3
                px-1
              "
            >
              <div className="flex items-center gap-2">
                <span
                  className="
                    flex
                    h-8
                    min-w-8
                    items-center
                    justify-center
                    rounded-[10px]
                    bg-[#0b216c]
                    px-2
                    text-[10px]
                    font-extrabold
                    text-white
                  "
                >
                  Q{startIndex + index + 1}
                </span>

                <span
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.08em]
                    text-slate-400
                  "
                >
                  Question
                </span>
              </div>

              {/* ANSWERED STATUS */}

              {isAnswered && (
                <span
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    bg-emerald-50
                    px-3
                    py-1.5
                    text-[10px]
                    font-bold
                    text-emerald-700
                  "
                >
                  <CheckCircle2 size={13} />
                  Answered
                </span>
              )}
            </div>

            {/* QUESTION CARD */}

            <QuestionCard
              question={question}
              selectedAnswer={selectedAnswer}
              onAnswer={onAnswer}
              submitted={submitted}
              imagePath={imagePath}
            />
          </div>
        );
      })}
    </div>
  );
}
