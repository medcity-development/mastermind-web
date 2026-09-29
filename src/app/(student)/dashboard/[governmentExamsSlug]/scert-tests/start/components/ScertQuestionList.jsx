import ScertQuestionCard from "./ScertQuestionCard";

export default function ScertQuestionList({
  questions = [],
  imagePath = "",
  getSelectedAnswer,
  onAnswer,
  disabled = false,
  startIndex = 0,
}) {
  if (
    !questions.length
  ) {
    return (
      <div
        className="
          rounded-xl
          border
          border-dashed
          border-slate-300
          bg-slate-50
          px-6
          py-12
          text-center
          text-sm
          text-slate-500
        "
      >
        No questions available.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {questions.map(
        (
          question,
          index
        ) => (
          <ScertQuestionCard
            key={
              question?.id ||
              index
            }
            question={
              question
            }
            questionNumber={
              startIndex +
              index +
              1
            }
            selectedAnswer={
              getSelectedAnswer(
                question
              )
            }
            onAnswer={
              onAnswer
            }
            imagePath={
              imagePath
            }
            disabled={
              disabled
            }
          />
        )
      )}
    </div>
  );
}