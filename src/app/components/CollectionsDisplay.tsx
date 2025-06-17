"use client";

import React, { useState, useEffect } from "react";
import CardIcon from "@/app/components/customSvg/Card";
import ListIcon from "@/app/components/customSvg/List";
import BookIcon from "@/app/components/customSvg/Book";
import PlusIcon from "./customSvg/Plus";

function CollectionsDisplay({
  onNewCollection,
}: {
  onNewCollection: () => void;
}) {
  const [questionLog, setQuestionLog] = useState<any[]>([]);
  const [selectedQuizIndex, setSelectedQuizIndex] = useState<number | null>(
    null
  );
  const [userAnswers, setUserAnswers] = useState<{
    [questionId: number]: string;
  }>({});
  //const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [studyMode, setStudyMode] = useState(false);
  const [activity, setActivity] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz mode state
  const [quizCurrentIndex, setQuizCurrentIndex] = useState(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState<string | null>(null);
  const [quizShowFeedback, setQuizShowFeedback] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedQuizSets = localStorage.getItem("savedQuizSets");
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

  function cancelSelectedCollection() {
    setStudyMode(false);
    setSelectedQuizIndex(null);
    setUserAnswers({});
    //setShowCorrectAnswers(false);
  }

  function finishFlashCards() {
    cancelSelectedCollection()
    setActivity(0);
  }

  const handleQuizSelection = (index: number) => {
    setSelectedQuizIndex(index);
    setUserAnswers({});
    //setShowCorrectAnswers(false);
    setStudyMode(true);
  };

  // const handleAnswerChange = (questionId: number, answer: string) => {
  //     setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
  // };

  // const handleSubmit = () => {
  //     setShowCorrectAnswers(true);
  //     console.log("User Answers:", userAnswers);
  // };

  const handleNextQuestion = () => {
    if (isFlipped) {
        setIsFlipped(false); // Reset flip state
        setTimeout(() => {
        setCurrentQuestionIndex((prevIndex) =>
            Math.min(prevIndex + 1, parsedQuestions.length - 1)
        );
        }, 300); // Add a delay to ensure flip animation completes        
    } else {
        setIsFlipped(false); // Reset flip state
        setCurrentQuestionIndex((prevIndex) =>
            Math.min(prevIndex + 1, parsedQuestions.length - 1)
        );
    }
  };

  const handlePreviousQuestion = () => {
    if (isFlipped) {
        setIsFlipped(false); // Reset flip state
        setTimeout(() => {
        setCurrentQuestionIndex((prevIndex) => Math.max(prevIndex - 1, 0));
        }, 300); // Add a delay to ensure flip animation completes        
    } else {
        setIsFlipped(false); // Reset flip state
        setCurrentQuestionIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    }

  };

  const toggleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const selectedQuiz =
    selectedQuizIndex !== null && questionLog[selectedQuizIndex]
      ? questionLog[selectedQuizIndex].questions
      : null;

  // Simplified logic for parsedQuestions
  const parsedQuestions =
    Array.isArray(selectedQuiz) &&
    selectedQuiz.every((q) => q && q.question && q.options)
      ? selectedQuiz
      : [];

  const selectedQuizTitle =
    selectedQuizIndex !== null && questionLog[selectedQuizIndex]
      ? questionLog[selectedQuizIndex].title || `Quiz ${selectedQuizIndex + 1}`
      : null;

  console.log("Selected Quiz:", selectedQuiz);
  console.log("Parsed Questions:", parsedQuestions);

  // Reset quiz state when entering quiz mode or changing collection
  useEffect(() => {
    if (activity === 2 && studyMode) {
      setQuizCurrentIndex(0);
      setQuizSelectedOption(null);
      setQuizShowFeedback(false);
      setQuizCorrect(null);
      setQuizFinished(false);
      setQuizScore(0);
    }
  }, [activity, studyMode, selectedQuizIndex]);

  const handleQuizOptionSelect = (option: string) => {
    if (!quizShowFeedback) {
      setQuizSelectedOption(option);
    }
  };

  const handleQuizSubmit = () => {
    if (quizSelectedOption !== null && !quizShowFeedback) {
      const correctAnswer = parsedQuestions[quizCurrentIndex].answer;
      const isCorrect = quizSelectedOption === correctAnswer;
      setQuizCorrect(isCorrect);
      setQuizShowFeedback(true);
      if (isCorrect) setQuizScore((prev) => prev + 1);
    }
  };

  const handleQuizNext = () => {
    if (quizCurrentIndex < parsedQuestions.length - 1) {
      setQuizCurrentIndex((prev) => prev + 1);
      setQuizSelectedOption(null);
      setQuizShowFeedback(false);
      setQuizCorrect(null);
    } else {
      setQuizFinished(true);
    }
  };

  const handleQuizFinish = () => {
    setQuizFinished(true);
  };

  const handleQuizBackToMenu = () => {
    setActivity(0);
    setStudyMode(false);
    setSelectedQuizIndex(null);
    setQuizFinished(false);
    setQuizScore(0);
    setQuizCurrentIndex(0);
    setQuizSelectedOption(null);
    setQuizShowFeedback(false);
    setQuizCorrect(null);
  };

  return (
    <div>
      {/* Display Available Collections */}
      {studyMode === false && activity === 0 && (
        <div>
          {questionLog.length > 0 && (
            <div className="mt-4">
              <h2 className="text-2xl font-semibold mb-2">
                Your study collections
              </h2>
              <ul className="flex flex-col gap-4">
                {questionLog.map((quizSet, index) => (
                  <li
                    className="bg-surface-200 p-4 rounded-lg shadow-md w-full hover:shadow-xl hover:bg-surface-100  hover:cursor-pointer hover:shadow-xl"
                    key={index}
                    onClick={() => handleQuizSelection(index)}
                  >
                    <div className="flex justify-between">
                      <p className="text-lg font-medium">
                        {quizSet.title
                          ? `Collection ${index + 1}: ${quizSet.title}`
                          : `Quiz ${index + 1}`}
                      </p>
                      <p>{quizSet.questions.length} Terms</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="text-center mt-4">
                <button className="btn" onClick={onNewCollection}>
                    <div className="w-[24px] h-[24px]">
                        <PlusIcon color={"text-surface-50"}/>                        
                    </div>

                  New Collection
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {selectedQuizIndex !== null &&
        parsedQuestions.length > 0 &&
        activity === 0 && (
          <div className="bg-surface-200 p-4 rounded-xl shadow-md w-full flex flex-col gap-4">
            <div className="flex justify-between">
              <p className="text-2xl font-semibold text-primary-500">
                {selectedQuizTitle}
              </p>
              <p>{selectedQuiz.length} Terms</p>
            </div>
            <div className="text-center my-5">
              <p className="text-xl">How would you like to study?</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div
                className="card bg-surface-50 p-4 rounded-lg shadow-lg flex flex-col gap-2 py-6 hover:cursor-pointer hover:shadow-xl"
                onClick={() => setActivity(1)}
              >
                <div className="text-center flex flex-col items-center gap-2">
                  <div className="w-[48px] h-[48px] text-primary-500 mx-auto">
                    <CardIcon />
                  </div>
                  <p className="text-xl">Flashcards</p>
                </div>
                <p className="mt-8">
                  Make studying fun! Test yourseslf, build speed, and lock in
                  your knowledge.
                </p>
              </div>
              <div className="card bg-surface-50 p-4 rounded-lg shadow-lg flex flex-col gap-2 py-6 hover:cursor-pointer hover:shadow-xl"
                onClick={() => setActivity(2)}>
                <div className="text-center flex flex-col items-center gap-2">
                  <div className="w-[48px] h-[48px] text-primary-500 mx-auto">
                    <ListIcon />
                  </div>
                  <p className="text-xl">Practice Tests</p>
                </div>
                <p className="mt-8">
                  Simulate the real thing. Build confidence, find weak spots in
                  your knowledge, and track your progress.
                </p>
              </div>
              <div className="card bg-surface-50 p-4 rounded-lg shadow-lg flex flex-col gap-2 py-6 hover:cursor-pointer hover:shadow-xl">
                <div className="text-center flex flex-col items-center gap-2">
                  <div className="w-[48px] h-[48px] text-primary-500 mx-auto">
                    <BookIcon />
                  </div>
                  <p className="text-xl">Study Guide</p>
                </div>
                <p className="mt-8">
                  Break it down, keep it clear. A quick-glance tool to review
                  the most important stuff fast.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button className="btn" onClick={cancelSelectedCollection}>
                Back
              </button>
            </div>
          </div>
        )}

      {/* Display FlashCards */}
      {studyMode === true && activity === 1 && parsedQuestions.length > 0 && (
        <div className="bg-surface-200 p-4 rounded-xl flex flex-col items-center gap-6">
          <div className="flex justify-between w-full max-w-md items-center">
            <p>{currentQuestionIndex + 1}/{parsedQuestions.length}</p>    
            <button className="btn" onClick={finishFlashCards}>Finish</button>        
          </div>

          <div
            className="flashcard card-3d relative bg-transparent rounded-lg w-full max-w-md cursor-pointer h-[300px]"
            onClick={toggleFlip}
          >
            <div
              className={`card-inner w-full h-full transition-transform duration-500 transform ${
                isFlipped ? "rotate-y-180" : ""
              }`}
            >
              {/* Front */}
              <div className="card-face card-front absolute w-full h-full backface-hidden bg-surface-100 rounded-lg shadow-md">
                <div className="flex flex-col justify-center items-center w-full h-full p-4 text-center">
                  <p className="text-sm">Question:</p>
                  <p className="text-xl font-medium">
                    {parsedQuestions[currentQuestionIndex].question}
                  </p>
                </div>
              </div>

              {/* Back */}
              <div className="card-face card-back absolute w-full h-full backface-hidden bg-surface-100 rounded-lg shadow-md transform rotate-y-180">
                <div className="flex flex-col justify-center items-center w-full h-full p-4 text-center">
                  <p className="text-sm">Answer:</p>
                  <p className="text-xl font-medium">
                    {parsedQuestions[currentQuestionIndex].answer}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Nav Buttons */}
          <div className="flex justify-between w-full max-w-md">
            <button
              className="btn"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </button>
            <button
              className="btn"
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === parsedQuestions.length - 1}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Display Quiz */}
      {studyMode === true && activity === 2 && parsedQuestions.length > 0 && (
        <div className="bg-surface-200 p-4 rounded-xl flex flex-col items-center gap-6 w-full max-w-md mx-auto">
          {!quizFinished ? (
            <>
              <div className="flex justify-between w-full items-center">
                <p>
                  Question {quizCurrentIndex + 1}/{parsedQuestions.length}
                </p>
                <button className="btn" onClick={handleQuizFinish}>
                  Finish
                </button>
              </div>
              <div className="w-full bg-surface-100 rounded-lg shadow-md p-4">
                <p className="text-lg font-medium mb-4">
                  {parsedQuestions[quizCurrentIndex].question}
                </p>
                <div className="flex flex-col gap-2">
                  {parsedQuestions[quizCurrentIndex].options.map(
                    (option: string, idx: number) => (
                      <button
                        key={idx}
                        className={`btn w-full text-left ${
                          quizSelectedOption === option
                            ? "bg-primary-200"
                            : "bg-surface-50"
                        }`}
                        disabled={quizShowFeedback}
                        onClick={() => handleQuizOptionSelect(option)}
                      >
                        {option}
                      </button>
                    )
                  )}
                </div>
                {quizShowFeedback && (
                  <div className="mt-4">
                    {quizCorrect ? (
                      <p className="text-green-600 font-semibold">Correct!</p>
                    ) : (
                      <p className="text-red-600 font-semibold">
                        Incorrect. Correct answer:{" "}
                        <span className="font-bold">
                          {parsedQuestions[quizCurrentIndex].answer}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="flex justify-between w-full mt-4">
                <button
                  className="btn"
                  onClick={handleQuizBackToMenu}
                >
                  Back
                </button>
                {!quizShowFeedback ? (
                  <button
                    className="btn"
                    onClick={handleQuizSubmit}
                    disabled={quizSelectedOption === null}
                  >
                    Submit
                  </button>
                ) : (
                  <button
                    className="btn"
                    onClick={handleQuizNext}
                    disabled={quizCurrentIndex === parsedQuestions.length - 1}
                  >
                    {quizCurrentIndex === parsedQuestions.length - 1
                      ? "Finish"
                      : "Next"}
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="w-full text-center">
              <h2 className="text-2xl font-semibold mb-4">Quiz Finished!</h2>
              <p className="mb-2">
                Your score: {quizScore} / {parsedQuestions.length}
              </p>
              <button className="btn mt-4" onClick={handleQuizBackToMenu}>
                Back to Collections
              </button>
            </div>
          )}
        </div>
      )}
      
    </div>
  );
}
export default CollectionsDisplay;
