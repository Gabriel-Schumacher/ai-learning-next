import React, { useReducer } from "react";
import { AiDataReducer, DATA_ACTION_TYPES } from "./AiDataReducer";
import { Folder, Conversation, Quiz } from "../../types/client-server-types";


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
    _currentFolderID: undefined,
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

    return (
        <AiDataProviderContext.Provider value={{ data, dispatch }}>
            {children}
        </AiDataProviderContext.Provider>
    );
}

export default AiDataProvider;