"use client";

import React, { useState } from "react";

function Quiz() {
    const [questionLog] = useState(
        typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('savedChats') || '[]') : []
    );
    const [selectedQuizIndex, setSelectedQuizIndex] = useState<number | null>(null);
    const [userAnswers, setUserAnswers] = useState<{ [questionId: number]: string }>({});

    const handleQuizSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const index = parseInt(event.target.value, 10);
        setSelectedQuizIndex(index);
        setUserAnswers({});
    };

    const handleAnswerChange = (questionId: number, answer: string) => {
        setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
    };

    const selectedQuiz = selectedQuizIndex !== null ? questionLog[selectedQuizIndex] : null;
    const parsedQuestions =
        selectedQuiz?.messages[0]?.content ? JSON.parse(selectedQuiz.messages[0].content) : [];

    return (
        <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold mb-4">Quiz App</h1>

            {/* Quiz Selection Dropdown */}
            <select
                className="mb-4 p-2 border rounded"
                onChange={handleQuizSelection}
                defaultValue=""
            >
                <option value="" disabled>
                    Select a Quiz
                </option>
                {questionLog.map((log: any, index: number) => (
                    <option key={index} value={index}>
                        Quiz {index + 1} - {log.id}
                    </option>
                ))}
            </select>

            {/* Display Questions */}
            {selectedQuizIndex !== null && (
                <div className="w-full max-w-2xl">
                    {parsedQuestions.map((question: any) => (
                        <div key={question.id} className="mb-6 bg-gray-100 p-4 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold">{question.question}</h2>
                            <ul className="list-disc pl-5">
                                {question.options.map((option: string, optionIndex: number) => (
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
                        </div>
                    ))}
                </div>
            )}

            {/* Submit Button */}
            {selectedQuizIndex !== null && (
                <button
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => console.log("User Answers:", userAnswers)}
                >
                    Submit Quiz
                </button>
            )}
        </div>
    );
}
export default Quiz;