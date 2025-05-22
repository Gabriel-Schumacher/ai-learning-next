import { useReducer, createContext} from "react";
import { Quiz } from "../../types/client-server-types";
import { change_response } from "./quiz-utils";

interface QuizContextProviderProps {
    children: React.ReactNode;
}
// The types the state can be.
export interface QUIZ_DATA_TYPES {
    quizData: Quiz | null;
    error: string | null;
}
// The initial state of the quiz data context.
const QUIZ_DATA: QUIZ_DATA_TYPES = {
    quizData: null,
    error: null,
}
// Relates to switch cases and the types that can be passed on the dispatch function.
type QUIZ_DATA_ACTION_TYPES = 
    | { type: 'SET_QUIZ_DATA'; payload: Quiz }
    | { type: 'CHANGE_RESPONSE'; payload: { questionIndex: number; answer: string } }

export const QuizContext = createContext<{ data: QUIZ_DATA_TYPES; dispatch: React.Dispatch<QUIZ_DATA_ACTION_TYPES> } | undefined>(undefined);

function QuizContextProvider({ children }: QuizContextProviderProps) {

    const dataReducer = (state: QUIZ_DATA_TYPES, action: QUIZ_DATA_ACTION_TYPES): QUIZ_DATA_TYPES => {
            const newState = { ...state }; // Create a new state object to avoid mutating the original state.
    
            switch (action.type) {
                case 'SET_QUIZ_DATA':
                    console.log("Setting Quiz Data: ", action.payload);
                    return { 
                        ...newState,
                        quizData: action.payload,
                    };
                case 'CHANGE_RESPONSE':
                    return {
                        ...newState,
                        quizData: change_response(newState.quizData, action.payload),
                    }
                default:
                    return {
                        ...state,
                        error: `Unhandled action type: ${(action as QUIZ_DATA_ACTION_TYPES).type}`,
                    };
            } // End of switch statement
        }

    const [dataQuiz, dispatchQuiz] = useReducer(dataReducer, QUIZ_DATA)

    return (
        <QuizContext.Provider value={{ data: dataQuiz, dispatch: dispatchQuiz }}>
            {children}
        </QuizContext.Provider>
    );
}
export default QuizContextProvider;