"use client";

import { DataContextProvider } from "@/app/context_providers/data_context/DataProvider";
import * as Types from "@/lib/types/types_new";
import * as DataUtils from "@/app/context_providers/data_context/data_utils"
import React, {useContext, useState, useEffect } from "react";

function Quiz() {
    const [quizzes, setQuizzes] = useState<Types.QuizFile[] | []>([]);
    const [currentQuiz, setCurrentQuiz] = useState<Types.QuizFile | null>(null);
    const [selectedQuizIndex, setSelectedQuizIndex] = useState<number | null>(null);
    const [userAnswers, setUserAnswers] = useState<{ [questionId: number]: string }>({});
    const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
    const [studyMode, setStudyMode] = useState(false);
    const [title, setTitle] = useState<string>("All Quizzes");

    /**
     * OLD USE EFFECT HOOK.
     * NEW ONE BELOW (THAT USES THE DATA CONTEXT)
     */
    // useEffect(() => {
    //     if (typeof window !== 'undefined') {
    //         const savedQuizSets = localStorage.getItem('savedQuizSets');
    //         try {
    //             const parsedQuizSets = savedQuizSets ? JSON.parse(savedQuizSets) : [];
    //             if (Array.isArray(parsedQuizSets)) {
    //                 setQuizzes(parsedQuizSets);
    //             } else {
    //                 console.error("Invalid format for savedQuizSets:", parsedQuizSets);
    //                 setQuizzes([]);
    //             }
    //         } catch (error) {
    //             console.error("Error parsing savedQuizSets:", error);
    //             setQuizzes([]);
    //         }
    //     }
    // }, []);

    // New useEffect hook that uses the data context
    
    const context = useContext(DataContextProvider);
    if (!context) {
        throw new Error("DataContextProvider must be used within a AiDataProvider");
    }
    const { data, dispatch } = context;

    // Get the quiz files from the data context.
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (!data || !data.sortedData || !data.sortedData.folders) {
            console.error("Data is not available or in the expected format.");
            return;
        }
        setStudyMode(false);
        setCurrentQuiz(null);

        let quizFiles: Types.QuizFile[] = [];
        // If there is a selected folder, filter the quizes shown to be those from the folder.
        if (data.sortedData.currentFolderId) {
            const targetFolder = DataUtils.getItemById(data.sortedData.folders, data.sortedData.currentFolderId) as Types.FolderStructure | undefined;
            if (targetFolder && 'files' in targetFolder && targetFolder.files) {
                quizFiles = targetFolder.files.filter(file => file.type === 'quiz') as Types.QuizFile[];
            }
            setTitle(targetFolder ? `${targetFolder.name}'s Quizzes` : "Selected Folder Quizzes");
        } else {
            quizFiles = data.sortedData.folders.flatMap(folder => 
                folder.files.filter(file => file.type === 'quiz')
            ) as Types.QuizFile[];
            setTitle("All Quizzes");
        }

        if (data.sortedData.currentFileId) {
            const currentFile = DataUtils.getItemById(data.sortedData.folders, data.sortedData.currentFileId) as Types.BaseDataFile | undefined;
            if (currentFile && 'id' in currentFile && currentFile.type === 'quiz') {
                setCurrentQuiz(currentFile as Types.QuizFile);
                setStudyMode(true);
                setTitle(currentFile.title);
            }
        }

        setQuizzes(quizFiles);
    }, [data]);

    // // When the currently selected file changes, we should reset the screen to the study mode.
    // useEffect(() => {
    //     if (data.sortedData && data.sortedData.currentFileId && data.sortedData.currentFileId !== -1) {
    //         if (selectedQuizIndex !== null && data.sortedData.currentFileId === quizzes[selectedQuizIndex]?.id) {
    //             setSelectedQuizIndex(null);
    //             setUserAnswers({});
    //             setShowCorrectAnswers(false);
    //             setStudyMode(true);
    //         } else {
    //             setStudyMode(false);
    //         }
    //     } else {
    //         setStudyMode(false);
    //     }
    // }, [data.sortedData, data.sortedData?.currentFileId, quizzes, selectedQuizIndex]);


    const handleQuizSelection = (index: number) => {
        dispatch({ type: "TOGGLE_CURRENT_FILE", payload: quizzes[index].id });
    };

    const handleAnswerChange = (questionId: number, answer: string) => {
        setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
    };

    const handleSubmit = () => {
        setShowCorrectAnswers(true);
        console.log("User Answers:", userAnswers);
    };

    return (
        <main>
            <h1 className="text-4xl font-bold mb-4">{title ? title : "Quiz App"}</h1>
            {/* Display Available Quizzes */}   
            { studyMode === false && (
            <div>
                {quizzes.length > 0 && (
                    <div className="mt-4">
                        <h2 className="text-2xl font-semibold mb-2">What would you like to study?</h2>
                        <ul className="flex flex-col gap-4">
                            {quizzes.map((quizFile, index) => (
                                <li className="bg-surface-200 dark:bg-surface-800 p-4 rounded-lg shadow-md w-full" key={index}>
                                    <p className="text-lg font-medium mb-2">
                                        {quizFile.title ? `Collection ${index + 1}: ${quizFile.title}` : `Quiz ${index + 1}`}                                        
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

            {/* Submit Button */}
            {currentQuiz && currentQuiz.content.length > 0 && (
                <button
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={handleSubmit}
                >
                    Submit Quiz
                </button>
            )}
        </main>
    );
}
export default Quiz;