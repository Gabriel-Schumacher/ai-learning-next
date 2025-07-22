import * as Types from "@/lib/types/types_new";
interface QuizDisplayProps {
    currentQuiz: Types.QuizFile;
    userAnswers: { [questionId: number]: string };
    showCorrectAnswers: boolean;
    handleAnswerChange: (questionId: number, answer: string) => void;
}

const QuizDisplay = ({ currentQuiz, userAnswers, showCorrectAnswers, handleAnswerChange }: QuizDisplayProps) => {

    return (
        <>
            {/* Display Questions */}
            {currentQuiz?.content && currentQuiz?.content.length > 0 && (
                <div className="w-full max-w-2xl">
                    {currentQuiz?.content.map((question) => (
                        <div key={question.id} className="mb-6 dark:bg-surface-800 bg-gray-100 p-4 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold">{question.items.question}</h2>
                            <ul className="list-none pl-2">
                                {question.items.answers.map((option: string, optionIndex: number) => (
                                    <li key={optionIndex}>
                                        <label>
                                            <input
                                                type="radio"
                                                name={`question-${question.id}`}
                                                value={option}
                                                checked={userAnswers[question.id] === option}
                                                onChange={() =>
                                                    handleAnswerChange(question.id, option)
                                                }
                                            />
                                            {` ${option}`}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                            {showCorrectAnswers && (
                                <p className="mt-2 text-green-600">
                                    Correct Answer: {question.items.correctAnswer}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Display fallback message if no questions are available */}
            {currentQuiz?.content.length === 0 && (
                <div className="w-full h-full grid place-items-center">
                    <div>
                        <p className="bg-error-500 rounded py-1 px-2 dark:text-black text-surface-950-50 font-bold mb-2">Sorry, there was an error:</p>
                        <p className="text-surface-900 dark:text-surface-100 text-center">No questions available for the selected quiz.</p>
                    </div>
                </div>
            )}
            </>
    )
}

export default QuizDisplay;