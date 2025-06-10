"use client";

import React, { useState, useEffect } from "react";

function Quiz() {
    const [questionLog, setQuestionLog] = useState<any[]>([]);
    const [selectedQuizIndex, setSelectedQuizIndex] = useState<number | null>(null);
    const [userAnswers, setUserAnswers] = useState<{ [questionId: number]: string }>({});
    const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
    const [studyMode, setStudyMode] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedQuizSets = localStorage.getItem('savedQuizSets');
            try {
                const parsedQuizSets = savedQuizSets ? JSON.parse(savedQuizSets) : [];
                if (Array.isArray(parsedQuizSets)) {
                    setQuestionLog(parsedQuizSets);
                } else {
                    console.error("Invalid format for savedQuizSets:", parsedQuizSets);
                    setQuestionLog([]);
                }
            } catch (error) {
                console.error("Error parsing savedQuizSets:", error);
                setQuestionLog([]);
            }
        }
    }, []);


    const handleQuizSelection = (index: number) => {
        setSelectedQuizIndex(index);
        setUserAnswers({});
        setShowCorrectAnswers(false);
        setStudyMode(true);
    };

    const handleAnswerChange = (questionId: number, answer: string) => {
        setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
    };

    const handleSubmit = () => {
        setShowCorrectAnswers(true);
        console.log("User Answers:", userAnswers);
    };

    const selectedQuiz = selectedQuizIndex !== null && questionLog[selectedQuizIndex] 
        ? questionLog[selectedQuizIndex].questions 
        : null;

    // Simplified logic for parsedQuestions
    const parsedQuestions = Array.isArray(selectedQuiz) && selectedQuiz.every(q => q && q.question && q.options) 
        ? selectedQuiz 
        : [];

    console.log("Selected Quiz:", selectedQuiz);
    console.log("Parsed Questions:", parsedQuestions);

    return (
        <div>
            <h1 className="text-4xl font-bold mb-4">Quiz App</h1>
            {/* Display Available Quizzes */}   
            { studyMode === false && (
            <div>
                {questionLog.length > 0 && (
                    <div className="mt-4">
                        <h2 className="text-2xl font-semibold mb-2">What would you like to study?</h2>
                        <ul className="flex flex-col gap-4">
                            {questionLog.map((quizSet, index) => (
                                <li className="bg-surface-200 p-4 rounded-lg shadow-md w-full" key={index}>
                                    <p className="text-lg font-medium mb-2">
                                        {quizSet.title ? `Collection ${index + 1}: ${quizSet.title}` : `Quiz ${index + 1}`}                                        
                                    </p>

                                    <div className="flex gap-2">
                                        <button className="btn" onClick={() => handleQuizSelection(index)}>Study</button>        
                                        <button className="btn">View</button>                                
                                    </div>

                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>                
            )}


            {/* Display Questions */}
            {selectedQuizIndex !== null && parsedQuestions.length > 0 && (
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
                            {showCorrectAnswers && (
                                <p className="mt-2 text-green-600">
                                    Correct Answer: {question.answer}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Display fallback message if no questions are available */}
            {selectedQuizIndex !== null && parsedQuestions.length === 0 && (
                <p className="text-red-500">No questions available for the selected quiz.</p>
            )}

            {/* Submit Button */}
            {selectedQuizIndex !== null && parsedQuestions.length > 0 && (
                <button
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={handleSubmit}
                >
                    Submit Quiz
                </button>
            )}
        </div>
    );
}
export default Quiz;