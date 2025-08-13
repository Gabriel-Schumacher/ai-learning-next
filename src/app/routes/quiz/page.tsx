"use client";

import { DataContextProvider } from "@/app/context_providers/data_context/DataProvider";
import * as Types from "@/lib/types/types_new";
import * as DataUtils from "@/app/context_providers/data_context/data_utils"
import React, {useContext, useState, useEffect } from "react";
import EditIcon from "@/app/components/customSvg/Edit";
import CardIcon from "@/app/components/customSvg/Card";
import ListIcon from "@/app/components/customSvg/List";
import BookIcon from "@/app/components/customSvg/Book";
import { handleStudyGuide } from "./quizUtils";
import LoadingIcon from "@/app/components/LoadingIcon";
import { Marked } from "marked";
import DOMPurify from "dompurify";
import QuizComponent from "./QuizComponent";

const marked = new Marked();

function Quiz() {
    const [module, setModule] = useState<'QUIZ' | 'FLASHCARD' | 'STUDY' | 'HOME'>('HOME')
    const [currentQuizFile, setCurrentQuizFile] = useState<Types.QuizFile | null>(null);
    const [quizData, setQuizData] = useState<
    {showCorrectAnswers: boolean, userAnswers: Record<number, string>} | null>({showCorrectAnswers: false, userAnswers: {}});
    const [flashCardData, setFlashCardData] = useState<{currentQuestionIndex: number, isFlipped: boolean}>({
        currentQuestionIndex: 0,
        isFlipped: false
    });
    const [studyGuideData, setStudyGuideData] = useState<{
        html: string | null,
        loading: boolean,
        error: string | null
    }>({
        html: null,
        loading: false,
        error: null
    });

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

        if (data.sortedData.currentFileId) {
            const currentFile = DataUtils.getItemById(data.sortedData.folders, data.sortedData.currentFileId) as Types.BaseDataFile | undefined;
            if (currentFile && 'id' in currentFile && currentFile.type === 'quiz') {
                setCurrentQuizFile(currentFile as Types.QuizFile);
            }
        }
    }, [data]);

    // Flashcard functions
    const toggleFlip = () => {
        setFlashCardData((prev) => ({ ...prev, isFlipped: !prev.isFlipped }));
    }
    const handlePreviousQuestion = () => {
        setFlashCardData((prev) => ({
            ...prev,
            currentQuestionIndex: Math.max(prev.currentQuestionIndex - 1, 0),
            isFlipped: false
        }));
    }
    const handleNextQuestion = () => {
        if (!currentQuizFile) {
            console.error("No current quiz file selected for flashcards.");
            return;
        }
        setFlashCardData((prev) => ({
            ...prev,
            currentQuestionIndex: Math.min(prev.currentQuestionIndex + 1, currentQuizFile?.content.length - 1),
            isFlipped: false
        }));
    }

    // Study Guide Functions
    const localHandleStudyGuide = async () => {
        if (!currentQuizFile) {
            console.error("No current quiz file selected for study guide generation.");
            return;
        }
        try {
            setStudyGuideData({ html: null, loading: true, error: null });
            const parsedQuestions = JSON.stringify(currentQuizFile.content);
            const selectedQuizTitle = currentQuizFile.title;
            const response = await handleStudyGuide(parsedQuestions, selectedQuizTitle);

            const parsed = await marked.parse(response);
            const sanitized = DOMPurify.sanitize(parsed)
                .replace(/<script>/g, "&lt;script&gt;")
                .replace(/<\/script>/g, "&lt;/script&gt;");

            setStudyGuideData({ html: sanitized, loading: false, error: null });
        } catch (error) {
            console.error("Error generating study guide:", error);
            setStudyGuideData({ html: null, loading: false, error: (error as Error).message });
        }
    }

    // This page should only show up when the user has SELECTED a collection to study from.
    // If they have not selected a collection, we should show a message that they need to select one.
    return (
        <div className="rounded-lg card w-full h-max flex flex-col gap-4 p-2 md:p-4 bg-surface-200 dark:bg-surface-800 shadow-lg">
            {currentQuizFile && (
                <>
                    {/* Header */}
                    <div className="grid grid-cols-[1fr_auto] mb-4">
                        <h1 className="text-4xl font-bold">
                            {currentQuizFile.title}
                        </h1>
                        <button className="flex items-center gap-2" title="Edit Collection" onClick={() => dispatch({ type: "SET_PAGE", payload: 'DATA_CREATION' })}>
                            <p>{currentQuizFile?.content.length} Terms</p>
                            <div className="w-[32px] h-[32px] text-primary-500 mx-auto"><EditIcon/></div>
                        </button>
                    </div>

                    {/* Modules */}

                    {module === 'HOME' && <>
                        {/* Home Header */}
                        <h2 className="text-2xl font-bold w-full text-center block">How would you like to study?</h2>
                        {/* Study Activity Options */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                            {/* Flash Card Button */}
                            <button title="Flashcards" className="card bg-surface-50-950 dark:bg-surface-700 p-4 rounded-lg shadow-lg flex flex-col gap-2 py-6 hover:cursor-pointer hover:shadow-xl"
                                onClick={() => setModule('FLASHCARD')}
                            >
                                <div className="text-center flex flex-col items-center gap-2 w-full">
                                    <div className="w-[48px] h-[48px] text-primary-500 mx-auto">
                                        <CardIcon />
                                    </div>
                                    <p className="text-xl">Flashcards</p>
                                </div>
                                <p className="mt-4 md:mt-8"> Make studying fun! Test yourseslf, build speed, and lock in your knowledge.</p>
                            </button>

                            {/* Quiz Button */}
                            <button title="Practice Tests" className="card bg-surface-50-950 dark:bg-surface-700 p-4 rounded-lg shadow-lg flex flex-col gap-2 py-6 hover:cursor-pointer hover:shadow-xl"
                                onClick={() => setModule('QUIZ')}
                            >
                                <div className="text-center flex flex-col items-center gap-2 w-full">
                                    <div className="w-[48px] h-[48px] text-primary-500 mx-auto">
                                        <ListIcon />
                                    </div>
                                    <p className="text-xl">Practice Tests</p>
                                </div>
                                <p className="mt-4 md:mt-8">Simulate the real thing. Build confidence, find weak spots in your knowledge, and track your progress.</p>
                            </button>

                            {/* Study Guide Button */}
                            <button
                                className="card bg-surface-50-950 dark:bg-surface-700 p-4 rounded-lg shadow-lg flex flex-col gap-2 py-6 hover:cursor-pointer hover:shadow-xl"
                                onClick={() => {
                                setModule('STUDY');
                                localHandleStudyGuide();
                                }}
                            >
                                <div className="text-center flex flex-col items-center gap-2 w-full">
                                    <div className="w-[48px] h-[48px] text-primary-500 mx-auto">
                                        <BookIcon />
                                    </div>
                                    <p className="text-xl">Study Guide</p>
                                </div>
                                <p className="mt-4 md:mt-8">Break it down, keep it clear. A quick-glance tool to review the most important stuff fast.</p>
                            </button>
                        </div>
                    </>
                    }

                    {module === 'QUIZ' && <>
                        {/* Display Questions */}
                        {currentQuizFile?.content && currentQuizFile?.content.length > 0 && (
                            <div className="w-full flex flex-col gap-4">
                                {/* {currentQuizFile?.content.map((question) => (
                                    <div key={question.id} className="bg-surface-50 p-4 rounded-lg shadow-md w-full hover:bg-surface-300 dark:bg-surface-700 hover:dark:bg-surface-700 hover:shadow-xl transition-all">
                                        <h2 className="text-xl font-semibold">{question.items.question}</h2>
                                        <ul className="list-none pl-2">
                                            {question.items.answers.map((option: string, optionIndex: number) => (
                                                <li key={optionIndex}>
                                                    <label className="cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={`question-${question.id}`}
                                                            value={option}
                                                            checked={quizData?.userAnswers[question.id] === option}
                                                            onChange={() =>
                                                                setQuizData((prev) => {
                                                                    if (!prev) return { showCorrectAnswers: false, userAnswers: { [question.id]: option } };
                                                                    return {
                                                                        showCorrectAnswers: prev.showCorrectAnswers,
                                                                        userAnswers: {
                                                                            ...prev.userAnswers,
                                                                            [question.id]: option
                                                                        }
                                                                    };
                                                                })
                                                            }
                                                        />
                                                        {` ${option}`}
                                                    </label>
                                                </li>
                                            ))}
                                        </ul>
                                        {quizData && quizData.showCorrectAnswers && (
                                            <p className="mt-2 text-green-600">
                                                Correct Answer: {question.items.correctAnswer}
                                            </p>
                                        )}
                                    </div>
                                ))} */}
                                <QuizComponent backBtnClicked={() => setModule('HOME')} ></QuizComponent>
                            </div>

                        )}

                        {/* Display fallback message if no questions are available */}
                        {currentQuizFile?.content.length === 0 || currentQuizFile?.content === null && (
                            <div className="w-full h-full grid place-items-center">
                                <div>
                                    <p className="bg-error-500 rounded py-1 px-2 dark:text-black text-surface-950-50 font-bold mb-2">Sorry, there was an error:</p>
                                    <p className="text-surface-900 dark:text-surface-100 text-center">No questions available for the selected quiz.</p>
                                </div>
                            </div>
                        )}
                        </>
                    }

                    {module === 'FLASHCARD' && <>
                        <div className="flex flex-col items-center gap-6">
                            {/* Top Bar */}
                            <div className="grid grid-cols-[1fr_max-content] w-full max-w-md items-center">
                                <p>{flashCardData.currentQuestionIndex + 1}/{currentQuizFile.content.length}</p>    
                                <button className="btn w-full" title="Back to Collection Options" onClick={() => {
                                    setModule('HOME')
                                    setFlashCardData({ currentQuestionIndex: 0, isFlipped: false });
                                }}>
                                    Finish
                                </button>
                            </div>

                            {/* Flash Card */}
                            <div
                                className="flashcard card-3d relative bg-transparent rounded-lg w-full max-w-md cursor-pointer h-[300px]"
                                onClick={toggleFlip}
                            >
                                <div
                                className={`card-inner w-full h-full transition-transform duration-500 transform ${
                                    flashCardData.isFlipped ? "rotate-y-180" : ""
                                }`}
                                >
                                    {/* Front */}
                                    <div className="card-face card-front absolute w-full h-full backface-hidden bg-surface-100 dark:bg-surface-700 rounded-lg shadow-md">
                                        <div className="flex flex-col justify-center items-center w-full h-full p-4 text-center">
                                        <p className="text-sm">Question:</p>
                                        <p className="text-xl font-medium">
                                            {currentQuizFile.content[flashCardData.currentQuestionIndex].items.question}
                                        </p>
                                        </div>
                                    </div>

                                    {/* Back */}
                                    <div className="card-face card-back absolute w-full h-full backface-hidden bg-surface-100 dark:bg-surface-700 rounded-lg shadow-md transform rotate-y-180">
                                        <div className="flex flex-col justify-center items-center w-full h-full p-4 text-center">
                                        <p className="text-sm">Answer:</p>
                                        <p className="text-xl font-medium">
                                            {currentQuizFile.content[flashCardData.currentQuestionIndex].items.correctAnswer}
                                        </p>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Nav Buttons */}
                            <div className="flex justify-between w-full max-w-md">
                                <button className="btn" onClick={handlePreviousQuestion} disabled={flashCardData.currentQuestionIndex === 0}>
                                Previous
                                </button>
                                <button className="btn" onClick={handleNextQuestion} disabled={flashCardData.currentQuestionIndex === currentQuizFile.content.length - 1}>
                                Next
                                </button>
                            </div>
                        </div>
                    </>
                    }

                    {module === 'STUDY' && <>
                        {/* Study Guide Display */}
                        <div className="flex flex-col items-center gap-6">
                            {/* Study Guide Header */}
                            <div className="grid grid-cols-[1fr_max-content] w-full max-w-md items-center">
                                <p>Study Guide</p>    
                                <button className="btn w-full" title="Back to Collection Options" onClick={() => {
                                    setModule('HOME')
                                    setStudyGuideData({ html: null, loading: false, error: null });
                                }}>
                                    Finish
                                </button>
                            </div>

                            {/* Study Guide Content */}
                            <div className="flex flex-col items-center gap-6 bg-surface-300-700 w-full p-4 rounded-lg shadow-md">
                                {studyGuideData.loading && (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="text-center text-primary-900-50">Generating study guide...</div>
                                        <LoadingIcon />                
                                    </div>
                                )}
                                {studyGuideData.error && (
                                    <div className="text-center text-red-600">{studyGuideData.error}</div>
                                )}
                                {studyGuideData.html && (
                                    <div
                                    className="prose max-w-none whitespace-pre-wrap"
                                    dangerouslySetInnerHTML={{ __html: studyGuideData.html }}
                                    />
                                )}
                            </div>
                        </div>
                    </>
                    }
                </>
            )}

            {!currentQuizFile && (
                <div className="text-center">
                    <p className="text-surface-950-50">No collection selected. Please click on &quot;Study&quot; above and select a collection</p>
                </div>
            )}
        </div>
    );
}
export default Quiz;