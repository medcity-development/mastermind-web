import MockQuestionCard from "./MockQuestionCard";

export default function MockQuestionsSection({
    questions,
    startIndex,
    answers,
    imagePath,
    disabled,
    onAnswer,
}) {
    return (
        <div
            className="
        space-y-5
        px-5
        py-7
        sm:px-7
      "
        >
            {questions.map(
                (
                    question,
                    index
                ) => {
                    const questionNumber =
                        startIndex +
                        index +
                        1;

                    const questionId =
                        question?.id ??
                        questionNumber;

                    return (
                        <MockQuestionCard
                            key={
                                questionId
                            }
                            question={
                                question
                            }
                            questionNumber={
                                questionNumber
                            }
                            selectedAnswer={
                                answers[
                                questionId
                                ]
                            }
                            imagePath={
                                imagePath
                            }
                            disabled={
                                disabled
                            }
                            onAnswer={(
                                answer
                            ) =>
                                onAnswer(
                                    questionId,
                                    answer
                                )
                            }
                        />
                    );
                }
            )}
        </div>
    );
}