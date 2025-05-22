import { Quiz } from "../../types/client-server-types";


export function change_response(quiz: Quiz | null, payload: { questionIndex: number; answer: string; }): Quiz {
    if (!quiz) {
        throw new Error("Quiz data is null. Cannot change response.");
    }
    const updatedResponses = [...quiz.responses];
    const question = updatedResponses.find((q) => q.id === payload.questionIndex);
    if (!question) {
        throw new Error(`Question with ID ${payload.questionIndex} not found.`);
    }

    // First remove any selected answer.
    question.selected_answer = undefined;
    question.is_correct = undefined; // Reset the is_correct flag.
    // Then set the selected answer to the new one.
    question.selected_answer = payload.answer;
    question.is_correct = payload.answer === question.correct_answer; // Set the is_correct flag based on the new answer.

    return {
        ...quiz,
        responses: updatedResponses,
    };
}