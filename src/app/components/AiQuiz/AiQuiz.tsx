import { Quiz } from "../../types/client-server-types";
import {useEffect, useContext} from "react";
import { AiDataProviderContext } from "../AiContextProvider/AiDataProvider";
import { QuizContext } from "./QuizContext";
import { QuizForm } from "./QuizForm";

// AI STUFF END FROM TESTCHAT
const AiQuiz: React.FC = () => {

    const context = useContext(AiDataProviderContext);
    if (!context) {
        throw new Error("AiDataProviderContext must be used within a AiDataProvider");
    }
    const { data: folderData, dispatch } = context;

    const quizContext = useContext(QuizContext)
    if (!quizContext) {
        throw new Error("QuizContextProvider must be used within a QuizContextProvider");
    }
    const { data, dispatch: quizDispatch } = quizContext;

    useEffect(() => {
        if (folderData.currentConversation) {
            const CURRENT_IS_QUIZ = folderData.currentConversation.type === "quiz"
            if (CURRENT_IS_QUIZ) {
                quizDispatch({ type: "SET_QUIZ_DATA", payload: folderData.currentConversation as Quiz });
            } else {
                dispatch({ type: "SET_ERROR", payload: "The Quiz route can't display items that are not quizes" });
            }
        }
    }, [folderData.currentConversation, dispatch, quizDispatch]);

    return (
        <div className="w-full h-full grid place-items-center grid-cols-1 place-self-center">
            <div className="w-full grid grid-rows-[1fr_auto] gap-4 h-full">
                {data.quizData && <QuizForm quiz={data.quizData} />}
            </div>
        </div>
    );
}
export default AiQuiz;
/**
 * AiChat Component Works By:
 * User Message is sent to page.tsx. The page adds the message to the conversation.
 * NO RESPONSE IS CURRENTLY GIVEN.
 * 
 */
