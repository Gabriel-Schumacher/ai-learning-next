import React, {useContext, useEffect, useState} from "react";
import { DataContextProvider } from '@/app/context_providers/data_context/DataProvider';
import * as Types from '@/lib/types/types_new'
import * as Utils from '@/app/context_providers/data_context/data_utils';

export default function QuizComponent({
    backBtnClicked
}: any) {
    
    const context = useContext(DataContextProvider);
    if (!context) {
        throw new Error(
            "DataContextProvider must be used within a DataContextProvider"
        );
    }
    const { data, dispatch } = context;

    const [questions, setQuestions] = useState<Types.QuizFile | null>(null);
    const [quizCurrentIndex, setQuizCurrentIndex] = useState(0);
    const [quizSelectedOption, setQuizSelectedOption] = useState<string | null>(null);
    const [quizShowFeedback, setQuizShowFeedback] = useState(false);
    const [quizFinished, setQuizFinished] = useState(false);
    const [quizScore, setQuizScore] = useState(0);
    const [quizCorrect, setQuizCorrect] = useState(false);

    useEffect(() => {
        if (data.sortedData && data.sortedData.currentFileId) {
            const currentFile = Utils.getItemById(data.sortedData.folders, data.sortedData.currentFileId);

            if (currentFile && currentFile.type !== "quiz") {
                dispatch({type: "SET_ERROR", payload: "Current file is not a quiz."});
                return;
            }

            setQuestions(currentFile as Types.QuizFile);
            setQuizCurrentIndex(0);
            setQuizSelectedOption(null);
            setQuizShowFeedback(false);
            setQuizFinished(false);
            setQuizScore(0);
            setQuizCorrect(false);

            
        }
    }, [data, dispatch]);


    const handleQuizOptionSelect = (option: string) => {
        if (!quizShowFeedback) {
            setQuizSelectedOption(option);
        }
    };
    const handleQuizSubmit = () => {
        if (quizSelectedOption !== null && !quizShowFeedback) {
            const correctAnswer = questions?.content[quizCurrentIndex].items.correctAnswer;
            const isCorrect = quizSelectedOption === correctAnswer;
            setQuizCorrect(isCorrect);
            setQuizShowFeedback(true);
            if (isCorrect) setQuizScore((prev) => prev + 1);
        }
    };
    // Functions found that handle quiz interactions
    const handleQuizNext = () => {
        if (questions?.content.length && quizCurrentIndex < questions?.content.length - 1) {
          setQuizCurrentIndex((prev) => prev + 1);
          setQuizSelectedOption(null);
          setQuizShowFeedback(false);
          setQuizCorrect(false);
        } else {
          setQuizFinished(true);
        }
      };
    
      const handleQuizFinish = () => {
        setQuizFinished(true);
      };
    
      const handleQuizBackToMenu = () => {
        setQuizFinished(false);
        setQuizScore(0);
        setQuizCurrentIndex(0);
        setQuizSelectedOption(null);
        setQuizShowFeedback(false);
        setQuizCorrect(false);
        backBtnClicked();
      };

  return (
    <div className="flex flex-col items-center gap-6">
      {!quizFinished ? (
        <>
          <div className="flex justify-between w-full items-center max-w-md">
            <p>
              Question {quizCurrentIndex + 1}/{questions?.content.length}
            </p>
            { !quizFinished && (
            <button className="btn" onClick={handleQuizFinish}>
              Finish
            </button>
            )}
          </div>
          <div className="w-full bg-surface-100 dark:bg-surface-700 rounded-lg shadow-md p-4 max-w-md">
            <p className="text-lg font-medium mb-4">
              {questions?.content[quizCurrentIndex].items.question}
            </p>
            <div className="flex flex-col gap-2">
              {questions?.content[quizCurrentIndex].items.answers.map(
                (option: string, idx: number) => {
                  // Determine button style
                  let btnClass =
                    "btn bg-primary-500 w-full text-left border-3 border-primary-500";
                  if (quizShowFeedback) {
                    if (option === questions?.content[quizCurrentIndex].items.correctAnswer) {
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
                      {questions?.content[quizCurrentIndex].items.correctAnswer}
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
                disabled={quizSelectedOption === null}
              >
                {questions?.content.length ? quizCurrentIndex === questions?.content.length - 1
                  ? "Finish"
                  : "Next" : "Next"}
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="w-full text-center">
          <h2 className="text-2xl font-semibold mb-4">Quiz Finished!</h2>
          <p className="mb-2">
            Your score: {quizScore} / {questions?.content.length}
          </p>
          <button className="btn mt-4" onClick={handleQuizBackToMenu}>
            Back to Collections
          </button>
        </div>
      )}
    </div>
  );
}