import React from "react";

export default function Quiz({
  parsedQuestions,
  quizCurrentIndex,
  setQuizCurrentIndex,
  quizSelectedOption,
  setQuizSelectedOption,
  quizShowFeedback,
  setQuizShowFeedback,
  quizCorrect,
  setQuizCorrect,
  quizFinished,
  setQuizFinished,
  quizScore,
  setQuizScore,
  handleQuizOptionSelect,
  handleQuizSubmit,
  handleQuizNext,
  handleQuizFinish,
  handleQuizBackToMenu,
}: any) {
  return (
    <div className="flex flex-col items-center gap-6">
      {!quizFinished ? (
        <>
          <div className="flex justify-between w-full items-center max-w-md">
            <p>
              Question {quizCurrentIndex + 1}/{parsedQuestions.length}
            </p>
            <button className="btn" onClick={handleQuizFinish}>
              Finish
            </button>
          </div>
          <div className="w-full bg-surface-100 dark:bg-surface-700 rounded-lg shadow-md p-4 max-w-md">
            <p className="text-lg font-medium mb-4">
              {parsedQuestions[quizCurrentIndex].question}
            </p>
            <div className="flex flex-col gap-2">
              {parsedQuestions[quizCurrentIndex].options.map(
                (option: string, idx: number) => {
                  // Determine button style
                  let btnClass =
                    "btn bg-primary-500 w-full text-left border-3 border-primary-500";
                  if (quizShowFeedback) {
                    if (option === parsedQuestions[quizCurrentIndex].answer) {
                      btnClass += "bg-green-200 border-green-600 border-3 ";
                    } else if (option === quizSelectedOption) {
                      btnClass += "bg-red-200 border-red-600 border-3 ";
                    } else {
                      btnClass += "bg-surface-50-950 ";
                    }
                  } else {
                    if (quizSelectedOption === option) {
                      btnClass +=
                        "bg-primary-500 border-tertiary-500 border-3 ";
                    } else {
                      btnClass += "bg-surface-50-950 ";
                    }
                  }
                  return (
                    <button
                      key={idx}
                      className={btnClass}
                      disabled={quizShowFeedback}
                      onClick={() => handleQuizOptionSelect(option)}
                    >
                      {option}
                    </button>
                  );
                }
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
          <div className="flex justify-between w-full mt-4 max-w-md">
            <button className="btn" onClick={handleQuizBackToMenu}>
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
  );
}
