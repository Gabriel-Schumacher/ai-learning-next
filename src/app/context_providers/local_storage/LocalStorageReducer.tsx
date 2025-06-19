"use client";

import { ChatResponse, Conversation, Folder, Quiz, QuizQuestion } from "@/lib/types/types";
import { INITIAL_STATE_LOCAL_STORAGE_TYPE as StateType } from "./LocalStorageProvider";
import { getLocalStorageData, convertToSortedJson, generateRandomTestData, payloadIsValidType, saveData, toggleActiveState, removeFolderCurrents } from "./local_utils";

export type LOCAL_DATA_ACTION_TYPES =
    | { type: 'LOAD'}
    | { type: 'SAVE'; payload: Folder | Folder[] | Conversation | Conversation[] | (Conversation | Quiz)[] | Quiz | QuizQuestion | ChatResponse }
    | { type: 'TEST_CASE_RESET' }
    | { type: 'TOGGLE_ACTIVE'; payload: number }

export const LocalStorageReducer = (state: StateType, action: LOCAL_DATA_ACTION_TYPES): StateType => {
    const newState = { ...state }; // Create a new state object to avoid mutating the original state. In cases where errors are thrown, we return the original state as to prevent rerendering.
    
    newState.localStorageError = undefined; // Reset the error message every time the reducer is called. This helps to ensure that if an error occurs, it will be set to the new error message instead of retaining the previous one. And if no error occurs, the error message will automatically be cleared.

    function TestCaseResetFunction() {
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
                console.error("[LocalStorageReducer] Error resetting to test data:", error);
                newState.localStorageError = `[LocalStorageReducer] Error resetting to test data: ${error instanceof Error ? error.message : 'Unknown error'}`;
            }
            return newState;
    }

    switch (action.type) {
        case 'LOAD':
            try {
                const storedData = getLocalStorageData();
                if (storedData === null) { 
                    console.warn("[LocalStorageReducer] No data found in localStorage. Initializing with empty data.");
                    TestCaseResetFunction();
                    return newState;
                }
                
                const sortedData = convertToSortedJson(storedData);
                if (sortedData === undefined) { throw new Error("Error converting data to sorted JSON format"); }

                newState.rawData = storedData;
                newState.sortedData = sortedData;

                removeFolderCurrents(newState);

                console.log("Got localStorage data successfully.", sortedData);
            } catch (error) {
                console.error("[LocalStorageReducer] Error loading data:", error);
                newState.localStorageError = `[LocalStorageReducer] Error loading data: ${error instanceof Error ? error.message : 'Unknown error'}`;
            }
            return newState;
        case 'SAVE':
            try {
                // Payload should be a type from the lib/types/types.ts file.
                // This script checks if the payload if one of those types, then checks if the already saved data is valid JSON.

                if (!payloadIsValidType(action.payload)) {
                    console.error("[LocalStorageReducer] Invalid payload type:", action.payload);
                    throw new Error("The data you are trying to save is not a supported type.");
                    // Payload is not a valid type from lib/types/types.ts
                }

                // Not sure what I was thinking with this check here, so I'm commetting it out for now.
                // if (!payloadExistsAlready(newState, action.payload) && action.payload.type !== 'folder') {
                //     console.error("[LocalStorageReducer] Payload does not exist in the current data:", action.payload);
                //     throw new Error("The data you are trying to save needs a folder to be saved in.");
                // }

                saveData(newState, action.payload);

            } catch (error) {
                console.error("[LocalStorageReducer] Error saving data:", error);
                newState.localStorageError = `[LocalStorageReducer] Error saving data: ${error instanceof Error ? error.message : 'Unknown error'}`;
            }
            return newState;
        case 'TEST_CASE_RESET':
            TestCaseResetFunction();
            return newState;
        case 'TOGGLE_ACTIVE': 
            // Just changes the session data to reflect the active folder or chat.
            try {
                if (action.payload < 0) {
                    throw new Error("Invalid ID provided for toggling active state.");
                }
                toggleActiveState(newState, action.payload);
            } catch (error) {
                console.error("[LocalStorageReducer] Error toggling active state:", error);
                newState.localStorageError = `[LocalStorageReducer] Error toggling active state: ${error instanceof Error ? error.message : 'Unknown error'}`;
            }
            return newState;
        default:
            return state;
    }
};