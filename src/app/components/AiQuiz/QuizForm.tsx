import {Quiz, QuizQuestion} from "../../../lib/types/types";
import { QuizQuestionLI } from "./QuizQuestionLI";
import { useState } from "react";


export const QuizForm: React.FC<{ quiz: Quiz }> = ({ quiz }) => {
    const [graded, setGraded] = useState(false);
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setGraded(!graded)
    };
    return (
        <form onSubmit={handleSubmit} className={graded ? "GRADED" : ""}>
            <ul className="flex flex-col gap-2">
                {quiz.responses.map((question: QuizQuestion, i: number) => (
                    <QuizQuestionLI question={question} key={i} />
                ))}
            </ul>
            <div className="flex justify-center mt-2">
                <button type="submit" className="bg-primary-500 text-surface-50 w-full px-2 py-1 rounded hover:bg-primary-800 transition-all disabled:text-surface-50 disabled:bg-surface-950 dark:disabled:bg-surface-300 dark:disabled:text-surface-800">
                    Submit
                </button>
            </div>
        </form>
    )
}