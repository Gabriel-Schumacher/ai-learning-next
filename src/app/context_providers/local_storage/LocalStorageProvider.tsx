"use client";
import React, { useReducer, useEffect } from "react";
import { LocalStorageReducer, LOCAL_DATA_ACTION_TYPES } from "./LocalStorageReducer";

export interface INITIAL_STATE_LOCAL_STORAGE_TYPE {
    rawData: string | null;
    sortedData: object | undefined;
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

    // While we don't need to load the data on every render, we do need to load it when the component mounts or when the data changes.
    useEffect(() => {
        if (local_data.rawData === null) {
            local_dispatch({ type: 'LOAD' });
        }
    }, [local_data.rawData]);

    return (
        <LocalStorageContextProvider.Provider value={{ local_data, local_dispatch }}>
            {children}
        </LocalStorageContextProvider.Provider>
    );
}

export default LocalStorageProvider;