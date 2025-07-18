import React from "react";

export default function Flashcards({
  parsedQuestions,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  isFlipped,
  setIsFlipped,
  finishFlashCards,
  handleNextQuestion,
  handlePreviousQuestion,
  toggleFlip,
}: any) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex justify-between w-full max-w-md items-center">
        <p>
          {currentQuestionIndex + 1}/{parsedQuestions.length}
        </p>
        <button className="btn" onClick={finishFlashCards}>
          Finish
        </button>
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
          <div className="card-face card-front absolute w-full h-full backface-hidden bg-surface-100 dark:bg-surface-700 rounded-lg shadow-md">
            <div className="flex flex-col justify-center items-center w-full h-full p-4 text-center">
              <p className="text-sm">Question:</p>
              <p className="text-xl font-medium">
                {parsedQuestions[currentQuestionIndex].question}
              </p>
            </div>
          </div>

          {/* Back */}
          <div className="card-face card-back absolute w-full h-full backface-hidden bg-surface-100 dark:bg-surface-700 rounded-lg shadow-md transform rotate-y-180">
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
  );
}
