import { Quiz } from "../../../lib/types/types";
import {useState, useEffect, useContext} from "react";
import { DataContextProvider } from "@/app/context_providers/data_context/DataProvider"
import { QuizContext } from "./QuizContext";
import { QuizForm } from "./QuizForm";
import LoadingIcon from "../LoadingIcon";
import * as DataUtils from "@/app/context_providers/data_context/data_utils";

// AI STUFF END FROM TESTCHAT
const AiQuiz: React.FC = () => {

    const [loading, setLoading] = useState<boolean>(true);

    const context = useContext(DataContextProvider);
    if (!context) {
        throw new Error("DataContextProvider must be used within a DataContextProvider");
    }
    const { data: coreData, dispatch } = context;

    const quizContext = useContext(QuizContext)
    if (!quizContext) {
        throw new Error("QuizContextProvider must be used within a QuizContextProvider");
    }
    const { data: quizData, dispatch: quizDispatch } = quizContext;

    useEffect(() => {
        if (!coreData.sortedData || !coreData.sortedData.folders || !coreData.sortedData.currentFileId) {
            setLoading(false);
            dispatch({ type: "SET_ERROR", payload: "No data available to display the quiz." });
            return;
        }
        const coreDataFile = DataUtils.getItemById(coreData.sortedData.folders, coreData.sortedData?.currentFileId);
        if (coreDataFile) {
            const CURRENT_IS_QUIZ = coreDataFile.type === "quiz"
            if (CURRENT_IS_QUIZ) {
                setLoading(false);
                //quizDispatch({ type: "SET_QUIZ_DATA", payload: coreDataFile as Quiz });
            } else {
                //setLoading(false);
                dispatch({ type: "SET_ERROR", payload: "The Quiz route can't display items that are not quizes" });
            }
        }
    }, [coreData.sortedData, dispatch, quizDispatch]);

    return (
        <>
        {!loading && !quizData && (
            <div className="w-full h-full grid place-items-center">
                <p className="text-surface-900 dark:text-surface-50">No Quiz Data Available</p>
            </div>
        )}
        {!loading && quizData && (
            <div className="w-full h-full grid place-items-center grid-cols-1 place-self-center">
                <div className="w-full grid grid-rows-[1fr_auto] gap-4 h-full">
                    {quizData.quizData && <QuizForm quiz={quizData.quizData} />}
                </div>
            </div>
        )}
        {loading && (
            <div className="w-full h-full grid place-items-center">
                <LoadingIcon />
            </div>
        )}
        </>
    );
}
export default AiQuiz;
/**
 * AiChat Component Works By:
 * User Message is sent to page.tsx. The page adds the message to the conversation.
 * NO RESPONSE IS CURRENTLY GIVEN.
 * 
 */
