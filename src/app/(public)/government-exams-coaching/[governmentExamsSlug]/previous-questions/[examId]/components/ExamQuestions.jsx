import { CheckCircle2 } from "lucide-react";
import QuestionCard from "./QuestionCard";

export default function ExamQuestions({
  questions,
  startIndex,
  answers,
  submitted,
  imagePath,
  onAnswer,
}) {
  return (
    <div className="space-y-5">
      {questions.map(
        (question, index) => (
          <div
            key={question.id}
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

              {answers[question.id] != null && (
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

            <QuestionCard
              question={question}
              selectedAnswer={
                answers[question.id]
              }
              onAnswer={onAnswer}
              submitted={submitted}
              imagePath={imagePath}
            />
          </div>
        )
      )}
    </div>
  );
}