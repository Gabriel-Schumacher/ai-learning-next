"use client";

import React, { useState, useEffect } from "react";
import CardIcon from "@/app/components/customSvg/Card";
import ListIcon from "@/app/components/customSvg/List";
import BookIcon from "@/app/components/customSvg/Book";

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
    setIsFlipped(false); // Reset flip state
    setTimeout(() => {
      setCurrentQuestionIndex((prevIndex) =>
        Math.min(prevIndex + 1, parsedQuestions.length - 1)
      );
    }, 300); // Add a delay to ensure flip animation completes
  };

  const handlePreviousQuestion = () => {
    setIsFlipped(false); // Reset flip state
    setTimeout(() => {
      setCurrentQuestionIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    }, 300); // Add a delay to ensure flip animation completes
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
                    className="bg-surface-200 p-4 rounded-lg shadow-md w-full hover:shadow-xl hover:bg-surface-100"
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
                <button className="btn mb-2" onClick={onNewCollection}>
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
          <div className="bg-surface-200 p-4 rounded-lg shadow-md w-full flex flex-col gap-4">
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
                className="card bg-surface-50 p-4 rounded-lg shadow-lg flex flex-col gap-2 py-6"
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
              <div className="card bg-surface-50 p-4 rounded-lg shadow-lg flex flex-col gap-2 py-6">
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
              <div className="card bg-surface-50 p-4 rounded-lg shadow-lg flex flex-col gap-2 py-6">
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
        <div className="flex flex-col items-center gap-6">
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
              <div className="card-face card-front absolute w-full h-full backface-hidden bg-surface-200 rounded-lg shadow-md">
                <div className="flex flex-col justify-center items-center w-full h-full p-4 text-center">
                  <p className="text-sm">Question:</p>
                  <p className="text-xl font-medium">
                    {parsedQuestions[currentQuestionIndex].question}
                  </p>
                </div>
              </div>

              {/* Back */}
              <div className="card-face card-back absolute w-full h-full backface-hidden bg-surface-200 rounded-lg shadow-md transform rotate-y-180">
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
    </div>
  );
}
export default CollectionsDisplay;
