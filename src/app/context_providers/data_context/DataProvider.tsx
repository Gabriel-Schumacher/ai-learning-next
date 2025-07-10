"use client";
import React, { useReducer, useEffect } from "react";
import { DataReducer, DATA_ACTION_TYPES } from "./DataReducer";
import { FolderStructureRoot } from "@/lib/types/types_new";

export interface INITIAL_STATE_TYPE {
    rawData: string | null;
    sortedData: FolderStructureRoot | undefined;
    errorMessage: string | undefined;
}

const INITIAL_STATE: INITIAL_STATE_TYPE = {
    rawData: null,
    sortedData: undefined,
    errorMessage: undefined,
};

export const DataContextProvider = React.createContext<{
    data: INITIAL_STATE_TYPE;
    dispatch: React.Dispatch<DATA_ACTION_TYPES>;
} | undefined>(undefined);

function DataStorageProvider({ children }: { children: React.ReactNode }) {
    const [data, dispatch] = useReducer(DataReducer, INITIAL_STATE);

    // While we don't need to load the data on every render, we do need to load it when the component mounts or when the data changes.
    useEffect(() => {
        if (data.rawData === null) {
            dispatch({ type: 'LOAD' });
        }
    }, [data.rawData]);

    return (
        <DataContextProvider.Provider value={{ data, dispatch }}>
            {children}
        </DataContextProvider.Provider>
    );
}

export default DataStorageProvider;