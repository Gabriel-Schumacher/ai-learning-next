import { useContext } from "react";
import { QuizQuestion } from "../../../lib/types/types";
import { QuizContext } from "./QuizContext";

export const QuizQuestionLI: React.FC<{ question: QuizQuestion }> = ({ question }) => {

    return (
        <li className="bg-surface-200 dark:bg-surface-800 p-2 rounded-lg text-black dark:text-surface-50">
            <p className="text-lg font-bold mb-1">{question.question}</p>
            <ul className="list-none flex flex-col gap-1">
                {question.answers.map((option, i) => (
                    <li key={i} className="text-sm">
                        <RadioInput
                            questionID={question.id}
                            index_key={i}
                            text={option}
                            isSelected={question.selected_answer === option}
                            isCorrect={question.correct_answer === option}
                        />
                    </li>
                ))}
            </ul>
        </li>
    )
}

interface RadioInputProps {
    questionID: number;
    index_key: number;
    text: string;
    isSelected: boolean;
    isCorrect: boolean;
}
const RadioInput: React.FC<RadioInputProps> = ({ questionID, index_key, text, isSelected, isCorrect }) => {
    const quizContext = useContext(QuizContext)
    if (!quizContext) {
        throw new Error("QuizContextProvider must be used within a QuizContextProvider");
    }
    const { dispatch } = quizContext;

    const handleInputChange = (value: string) => () => {
        dispatch({ type: "CHANGE_RESPONSE", payload: { questionIndex: questionID, answer: value } });
    }

    const defaultClasses = {
        default: {
            class: "[&]:text-gray-300",
            stroke: "white"
        },
        selected: {
            class: "[&]:text-gray-800",
            stroke: "black"
        },
        correct: {
            class: "[.GRADED_&]:text-green-500",
            stroke: "green"
        },
        incorrect: {
            class: "[.GRADED_&]:text-red-500",
            stroke: "red"
        }
    };

    return (
        <label className="flex flex-row gap-2 items-center cursor-pointer">
            {/* Hidden input that actually gets passed to the form. */}
            <input
                type="radio"
                name={`key-${index_key}`}
                value={text}
                checked={isSelected}
                className="hidden"
                onChange={handleInputChange(text)}
            />
            {/* The radio button */}
            <svg
                className={`w-4 h-4 text-current ${
                    !isSelected ?
                            // Default Colors. When not selected, show gray and red when graded
                        (!isCorrect ? defaultClasses.default.class + " " + defaultClasses.incorrect.class
                            // If it was the correct answer, show gray and green when graded
                            : defaultClasses.default.class + " " + defaultClasses.correct.class)
                        : (
                            // If selected and correct, show black and green when graded
                            isCorrect ? defaultClasses.selected.class + " " + defaultClasses.correct.class
                            // If selected and incorrect, show black and red when graded
                            : defaultClasses.selected.class + " " + defaultClasses.incorrect.class
                        )
                    
                }`}
                viewBox="0 0 18 18"
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle
                    cx="9"
                    cy="9"
                    r="6"
                    fill={"white"}
                    stroke={"currentColor"}
                    strokeWidth="1"
                />
                {isSelected && (
                    <circle
                        cx="9"
                        cy="9"
                        r="2"
                        fill={"currentColor"}
                    />
                )}
            </svg>
            {/* The Question */}
            <span className="text-sm">{text}</span>
        </label>
    );
}