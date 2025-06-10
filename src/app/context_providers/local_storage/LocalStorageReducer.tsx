"use client";

import { INITIAL_STATE_LOCAL_STORAGE_TYPE as StateType } from "./LocalStorageProvider";
import { getLocalStorageData, convertToSortedJson, generateRandomTestData } from "./local_utils";

export type LOCAL_DATA_ACTION_TYPES =
    | { type: 'LOAD'; payload: string }
    | { type: 'SAVE'; payload: string }
    | { type: 'TEST_CASE_RESET' };

export const LocalStorageReducer = (state: StateType, action: LOCAL_DATA_ACTION_TYPES): StateType => {
    const newState = { ...state }; // Create a new state object to avoid mutating the original state. In cases where errors are thrown, we return the original state as to prevent rerendering.
    
    newState.localStorageError = undefined; // Reset the error message every time the reducer is called. This helps to ensure that if an error occurs, it will be set to the new error message instead of retaining the previous one. And if no error occurs, the error message will automatically be cleared.


    switch (action.type) {
        case 'LOAD':
            try {
                const storedData = getLocalStorageData();
                if (storedData === null) { throw new Error("No data found in localStorage"); }
                
                const sortedData = convertToSortedJson(storedData);
                if (sortedData === undefined) { throw new Error("Error converting data to sorted JSON format"); }

                newState.rawData = storedData;
                newState.sortedData = sortedData;
            } catch (error) {
                newState.localStorageError = `[LocalStorageReducer] Error loading data: ${error instanceof Error ? error.message : 'Unknown error'}`;
            }
            return newState;
        case 'SAVE':
            try {
                const jsonifiableData = JSON.parse(action.payload);
                if (typeof jsonifiableData !== 'object' || jsonifiableData === null) {
                    throw new Error("Provided data is not JSONifiable");
                }

                newState.rawData = action.payload;
                localStorage.setItem('user_info_ai_data', action.payload);

                const sortedData = convertToSortedJson(action.payload);
                if (sortedData === undefined) {
                    throw new Error("Error converting data to sorted JSON format");
                }

                newState.sortedData = sortedData;
            } catch (error) {
                newState.localStorageError = `[LocalStorageReducer] Error saving data: ${error instanceof Error ? error.message : 'Unknown error'}`;
            }
            return newState;
        case 'TEST_CASE_RESET':
            // Resets the state to prepopulated values used for testing purposes.
            try {
                const testFolderData = generateRandomTestData();
                const testDataString = JSON.stringify(testFolderData, null, 2);
                localStorage.setItem('user_info_ai_data', testDataString);
                newState.rawData = testDataString;
                const sortedData = convertToSortedJson(testDataString);
                if (sortedData === undefined) {
                    throw new Error("Error converting test data to sorted JSON format");
                }
                newState.sortedData = sortedData;
                console.log("[LocalStorageReducer] Test data reset successfully.");
                console.log(sortedData);
            } catch (error) {
                newState.localStorageError = `[LocalStorageReducer] Error resetting to test data: ${error instanceof Error ? error.message : 'Unknown error'}`;
            }
        default:
            return state;
    }
};