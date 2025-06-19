"use client";
import React, { useEffect, useReducer} from "react";
import { AiDataReducer, DATA_ACTION_TYPES } from "./AiDataReducer";
import { Folder, Conversation, Quiz } from "../../../lib/types/types";


export const pageOptions = ['HOME', 'CHAT', 'QUIZ', 'DATA_CREATION'];

export interface INITIAL_DATA_STATE_TYPE {
    folders: Folder[] | undefined;
    _currentFolderID: number | undefined;
    conversations: (Conversation | Quiz)[] | undefined;
    currentConversation: Conversation | Quiz | undefined;
    _currentConversationID: number | undefined;
    _idsInUse: number[];
    loading: boolean;
    error: null | string;
    currentPage: (typeof pageOptions)[number];
}

const INITIAL_DATA_STATE: INITIAL_DATA_STATE_TYPE = {
    folders: undefined,
    _currentFolderID: 1,
    conversations: undefined,
    currentConversation: undefined,
    _currentConversationID: undefined,
    _idsInUse: [],
    loading: false,
    error: null,
    currentPage: 'HOME',
};

export const AiDataProviderContext = React.createContext<{
    data: INITIAL_DATA_STATE_TYPE;
    dispatch: React.Dispatch<DATA_ACTION_TYPES>;
} | undefined>(undefined);

function AiDataProvider({ children }: { children: React.ReactNode }) {
    const [data, dispatch] = useReducer(AiDataReducer, INITIAL_DATA_STATE);

    useEffect(() => {
        // Load initial data from localStorage or any other source
        const storedData = localStorage.getItem('user_info_ai_data');
        if (storedData && data.folders === undefined) {
            try {
                console.log("Loading data from localStorage...");
                const parsedData = JSON.parse(storedData);
                console.log("Data loaded and parsed:", parsedData);
                dispatch({ type: 'INITIALIZE_DATA', payload: parsedData });
            } catch (error) {
                console.error("Error parsing stored data:", error);
                dispatch({ type: 'SET_ERROR', payload: "Failed to load data." });
            }
        } else {
            // If no data is found, initialize with default state
            if (data.folders === undefined) {
                console.log("No data found in localStorage, initializing with default state.");
                dispatch({ type: 'INITIALIZE_DATA' });
            }
            else {
                console.log("Data already initialized, skipping initialization.");
            }
        }
    }, [data.folders]);

    return (
        <AiDataProviderContext.Provider value={{ data, dispatch }}>
            {children}
        </AiDataProviderContext.Provider>
    );
}

export default AiDataProvider;