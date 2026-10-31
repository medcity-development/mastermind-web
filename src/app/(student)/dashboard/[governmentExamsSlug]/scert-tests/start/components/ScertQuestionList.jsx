
import ScertQuestionCard from "./ScertQuestionCard";

export default function ScertQuestionList({
  questions = [],
  imagePath = "",
  getSelectedAnswer,
  onAnswer,
  disabled = false,
  startIndex = 0,
}) {
  const safeQuestions = Array.isArray(questions)
    ? questions
    : [];

  if (safeQuestions.length === 0) {
    return (
      <div
        className="
          rounded-xl
          border border-dashed border-slate-300
          bg-slate-50
          px-6 py-12
          text-center
          text-sm text-slate-500
        "
      >
        No questions available.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {safeQuestions.map((question, index) => {
        const selectedAnswer =
          typeof getSelectedAnswer === "function"
            ? getSelectedAnswer(question)
            : "";

        return (
          <ScertQuestionCard
            key={
              question?.id ??
              `question-${startIndex + index}`
            }
            question={question}
            questionNumber={startIndex + index + 1}
            selectedAnswer={selectedAnswer}
            onAnswer={onAnswer}
            imagePath={imagePath}
            disabled={disabled}
          />
        );
      })}
    </div>
  );
}
