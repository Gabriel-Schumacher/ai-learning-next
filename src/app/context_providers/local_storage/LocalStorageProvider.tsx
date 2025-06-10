"use client";
import React, { useReducer, useEffect } from "react";
import { LocalStorageReducer, LOCAL_DATA_ACTION_TYPES } from "./LocalStorageReducer";

export interface INITIAL_STATE_LOCAL_STORAGE_TYPE {
    rawData: string | null;
    sortedData: string | undefined;
    localStorageError: string | undefined;
}

const INITIAL_LOCAL_STORAGE_STATE: INITIAL_STATE_LOCAL_STORAGE_TYPE = {
    rawData: null,
    sortedData: undefined,
    localStorageError: undefined,
};

export const LocalStorageContextProvider = React.createContext<{
    local_data: INITIAL_STATE_LOCAL_STORAGE_TYPE;
    local_dispatch: React.Dispatch<LOCAL_DATA_ACTION_TYPES>;
} | undefined>(undefined);

function LocalStorageProvider({ children }: { children: React.ReactNode }) {
    const [local_data, local_dispatch] = useReducer(LocalStorageReducer, INITIAL_LOCAL_STORAGE_STATE);

    // On render, get the localStorage data and dispatch it to the reducer to save that data.
    useEffect(() => {
        // Load state from localStorage on initial render
        const storedState = localStorage.getItem('user_info_ai_data');
        if (storedState) {
          local_dispatch({
            type: 'SAVE',
            payload: JSON.parse(storedState),
          });
        }
      }, []);

    // useEffect(() => {
    //     // TESTING PURPOSES, DELETE LATER OR IF ACTUALLY TRYING TO USE THE LOCAL STORAGE
    //     local_dispatch({ type: 'TEST_CASE_RESET' });
    // })

    return (
        <LocalStorageContextProvider.Provider value={{ local_data, local_dispatch }}>
            {children}
        </LocalStorageContextProvider.Provider>
    );
}

export default LocalStorageProvider;