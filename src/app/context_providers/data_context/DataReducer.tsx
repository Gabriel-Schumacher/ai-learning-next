"use client";

import * as Types from "../types_new";
import { INITIAL_STATE_TYPE as StateType } from "./DataProvider";
import * as Utils from "./data_utils";

export type DATA_ACTION_TYPES =
    | { type: 'LOAD'}
    | { type: 'SAVE'; }
    | { type: 'SET_ERROR'; payload: string; }
    | { type: 'SET_PAGE'; payload: Types.PageOptions; } // This is used to set the current page in the application. For an example, look at FigmaNavigation.tsx
    | { type: 'TOGGLE_CURRENT_FOLDER'; payload: number; } // This is used to toggle the visibility of a folder in the UI. The payload is the folder ID.
    | { type: 'TOGGLE_CURRENT_FILE'; payload: number; } // This is used to toggle the visibility of a file in the UI. The payload is the file ID.
    | { type: 'ADD_FOLDER'; payload: { setActive: boolean } } // This is used to add a new folder to the state.
    | { type: 'ADD_FILE'; payload: { type: Types.DataFileTypes, setActive: boolean } } // This is used to add a new file to the state.
    | { type: 'ADD_CONTENT'; payload: { type: Types.ContentTypes, contentItem: Types.BaseContentItem } } // This is used to add content to a file. The payload contains the type of the file and the content to be added.
    | { type: 'DELETE_ITEM'; payload: { id: number; } } // This is used to delete an item from the state. The payload contains the ID of the item to be deleted.
    | { type: 'DELETE_ITEM_IN_FILE'; payload: { createdAt: string; } } // This is used to delete an item from a file. The payload contains the creation date of the item to be deleted.
    | { type: 'Unused'; } // Just stops the never typescript error from showing up.

export const DataReducer = (state: StateType, action: DATA_ACTION_TYPES): StateType => {
    // Create a new state object to avoid mutating the original state. In cases where errors are thrown, we return the original state as to prevent rerendering.
    const newState = { ...state };
    // Reset the error message every time the reducer is called. This helps to ensure that if an error occurs, it will be set to the new error message instead of retaining the previous one. And if no error occurs, the error message will automatically be cleared.
    newState.errorMessage = undefined;

    try {
        switch (action.type) {
            case 'LOAD': 
                // This action should happen whenever rawdata is null/undefined.
                // In this case, we want to get the data from localStorage, convert it to a sorted JSON format, and then set the rawData and sortedData properties of the state. The sorted data should be in the FolderStructureRoot format.

                // In the case that the data is not found in localStorage, we will initialize the state with an empty FolderStructureRoot object. (Unless you want to implment a testing case, in which case we create random test data. [which is what we do right now])

                const localRawData = Utils.getLocalStorageData();
                if (localRawData === null) {
                    let fakeData: Types.FolderStructureRoot = Utils.generateFakeFolderStructureRoot();
                    newState.rawData = JSON.stringify(fakeData);
                } else {
                    newState.rawData = localRawData;
                }

                const sortedData = Utils.convertToSortedJson(newState.rawData);

                if (sortedData === undefined) {
                    throw new Error("[DataReducer | Action: LOAD] Error converting data to sorted JSON format");
                }
                
                newState.sortedData = sortedData;

                /** Load should only be called when a user loads the site after a while away, or for the first time. Thus, we should set these initial values to undefined and HOME. */
                newState.sortedData.currentPage = 'HOME';
                newState.sortedData.currentFolderId = undefined;
                newState.sortedData.currentFileId = undefined;

                return newState;
            case 'SAVE':
                // Since all changes happen to the sorted Data, and the sorted data SHOULD be of type FolderStructureRoot, we can just save the sorted data to localStorage.
                
                if (!newState.sortedData) {
                    throw new Error("[DataReducer | Action: SAVE] No sorted data available to save.");
                }

                Utils.saveData(newState.sortedData);

                return state; // Since we are only updating the localStorage, there is no need to cause a rerender of components.
            case 'SET_ERROR':
                // This action is used to set an error message in the state.
                // It can be used to display error messages in the UI.
                newState.errorMessage = action.payload;
                return newState;
            case 'SET_PAGE':
                // This action is used to set the current page in the application.
                // It can be used to navigate between different pages in the application.
                if (!newState.sortedData) {
                    throw new Error("[DataReducer | Action: SET_PAGE] No sorted data available to set page.");
                }
                newState.sortedData.currentPage = action.payload;
                return newState;
            case 'TOGGLE_CURRENT_FOLDER':
                if (!newState.sortedData) {
                    throw new Error("[DataReducer | Action: TOGGLE_FOLDER] No sorted data available to toggle folder.");
                }
                if (!newState.sortedData.ids.has(action.payload)) {
                    throw new Error(`[DataReducer | Action: TOGGLE_FOLDER] No data has the id ${action.payload}.`);
                }

                newState.sortedData.currentFolderId = (newState.sortedData.currentFolderId === action.payload) ? undefined : action.payload;

                return newState;
            case 'TOGGLE_CURRENT_FILE':
                if (!newState.sortedData) {
                    throw new Error("[DataReducer | Action: TOGGLE_FILE] No sorted data available to toggle file.");
                }
                if (!newState.sortedData.ids.has(action.payload)) {
                    throw new Error(`[DataReducer | Action: TOGGLE_FILE] No data has the id ${action.payload}.`);
                }

                newState.sortedData.currentFileId = (newState.sortedData.currentFileId === action.payload) ? undefined : action.payload;
                return newState;
            case 'ADD_FOLDER':
                if (!newState.sortedData) {
                    throw new Error("[DataReducer | Action: ADD_FOLDER] No sorted data available to add folder.");
                }
                let ids_folderblock = newState.sortedData.ids
                if (!ids_folderblock) {
                    throw new Error("[DataReducer | Action: ADD_FOLDER] No sorted data available to add folder.");
                }

                let folderId = Utils.newId(ids_folderblock);
                let newFolder: Types.FolderStructure = Utils.createFolder(ids_folderblock, `New Folder ${folderId}`, new Date());
                
                newState.sortedData.folders.push(newFolder);

                if (action.payload.setActive) {
                    // If the action payload indicates to set this folder as active, we do so.
                    newState.sortedData.currentFolderId = newFolder.id;
                }
                return newState;
            case 'ADD_FILE':
                // Check if the sortedData is available and has the necessary properties.
                if (!newState.sortedData || !newState.sortedData.ids) {
                    throw new Error("[DataReducer | Action: ADD_FILE] No sorted data available to add file.");
                }

                // Check to see if the folder with the currentFolderId exists in the sortedData.
                let currentFolder = newState.sortedData.folders.find(folder => folder.id === newState.sortedData?.currentFolderId);
                if (!newState.sortedData.currentFolderId) {
                    throw new Error("[DataReducer | Action: ADD_FILE] No current folder selected to add file to.");
                } else if (!currentFolder) {
                    throw new Error("[DataReducer | Action: ADD_FILE] Current folder not found in sorted data.");
                }
                
                // Check if the file type being created is a valid type.
                if (!Object.values(Types.DataFileTypes).includes(action.payload.type)) {
                    throw new Error(`[DataReducer | Action: ADD_FILE] Invalid file type: ${action.payload.type}. Expected one of: ${Object.values(Types.DataFileTypes).join(', ')}.`);
                }

                // Ease of reading variables.
                let ids_fileblock = newState.sortedData.ids;
                let capitalizedType = action.payload.type.charAt(0).toUpperCase() + action.payload.type.slice(1);

                let fileId = Utils.newId(ids_fileblock);
                let newFile: Types.BaseDataFile = Utils.createFile(ids_fileblock, action.payload.type, `New ${capitalizedType} ${fileId}`, []);
                currentFolder.files.push(newFile);

                if (action.payload.setActive) {
                    newState.sortedData.currentFileId = newFile.id;
                }

                return newState;
            case 'ADD_CONTENT':
                // Check if the sortedData is available and has the necessary properties.
                if (!newState.sortedData || !newState.sortedData.ids) {
                    throw new Error("[DataReducer | Action: ADD_CONTENT] No sorted data available to add content.");
                }
                // Check to see if the file with the currentFileId exists in the sortedData.
                let currentFile = newState.sortedData.folders
                    .flatMap(folder => folder.files)
                    .find(file => file.id === newState.sortedData?.currentFileId);
                if (!currentFile) {
                    throw new Error("[DataReducer | Action: ADD_CONTENT] Current file for the content to be added to was not found in the sorted data.");
                }
                // Check if the content type being added is a valid type.
                if (!Object.values(Types.ContentTypes).includes(action.payload.type)) {
                    throw new Error(`[DataReducer | Action: ADD_CONTENT] Invalid content type: ${action.payload.type}. Expected one of: ${Object.values(Types.ContentTypes).join(', ')}.`);
                }
                // Checks if the type passed and the type being requested to be added match.
                if (action.payload.contentItem.type !== action.payload.type) {
                    throw new Error(`[DataReducer | Action: ADD_CONTENT] Mismatched content type. Expected ${currentFile.type}, but received ${action.payload.type}.`);
                }

                let itemToBeAdded = action.payload.contentItem;

                if (!itemToBeAdded.createdAt) {
                    itemToBeAdded.createdAt = new Date();
                }

                switch (itemToBeAdded.type) {
                    case 'text':
                        // First we have to make sure that the content that was passed is a valid TextContentItem. (Since any BaseContentItem can be passed in.)
                        if (typeof itemToBeAdded.items !== 'string') {
                            throw new Error("[DataReducer | Action: ADD_CONTENT] Text content item must have items of type string.");
                        }
                        if ('isAiResponse' in itemToBeAdded && itemToBeAdded.isAiResponse !== true) {
                            (itemToBeAdded as Types.TextContentItem).isAiResponse = false;
                        }

                        // Convert the text content item to a TextContentItem type.
                        itemToBeAdded = Utils.createTextContentItem(
                            newState.sortedData.ids,
                            itemToBeAdded.items,
                            (itemToBeAdded as Types.TextContentItem).isAiResponse
                        );
                        break;
                    case 'question':
                        // We have to make sure that the content that was passed is a valid QuestionContentItem. (Since any BaseContentItem can be passed in.)
                        // This means we have to special checks on the items property, since it SHOULD be an array of QuestionItemsType.
                        if (!Array.isArray(itemToBeAdded.items)) {
                            throw new Error("[DataReducer | Action: ADD_CONTENT] Question content item must have items of type array.");
                        }

                        // The checkItemQuestions function checks if every object in the array is of type QuestionItemsType, or a valid object that can be converted to it. In cases where the items are not valid, it will throw out that object and continue with the rest. (Meaning if there was a random string or boolean, for example, the returned array would not contain those items.)
                        itemToBeAdded.items = Utils.checkItemQuestions(itemToBeAdded.items);

                        itemToBeAdded = Utils.createQuestionContentItem(
                            newState.sortedData.ids,
                            itemToBeAdded.items as Types.QuestionItemsType[]
                        );

                        break;
                    case 'image':
                    case 'video':
                    case 'audio':
                    default:
                        throw new Error(`[DataReducer | Action: ADD_CONTENT] Content type ${itemToBeAdded.type}'s ability to be added has not been implemented.`);
                }

                currentFile.content.push(itemToBeAdded);
                return newState;
            case 'DELETE_ITEM':
                if (!newState.sortedData) throw new Error("[DataReducer | Action: DELETE_ITEM] No sorted data available to delete item.");

                // Check if the item with the given ID exists in the sortedData.
                const itemToDelete = newState.sortedData.folders
                    .flatMap(folder => folder.files)
                    .flatMap(file => file.content)
                    .find(item => item.id === action.payload.id);

                if (!itemToDelete) throw new Error(`[DataReducer | Action: DELETE_ITEM] Item with ID ${action.payload.id} not found.`);

                // If the item is a folder, we should check to see if the active file is a member of it.
                if (itemToDelete.type === 'folder' && newState.sortedData.currentFileId) {
                    // Check if the current file is in the folder being deleted.
                    const currentFile = newState.sortedData.folders
                        .flatMap(folder => folder.files)
                        .find(file => file.id === newState.sortedData?.currentFileId);
                    
                    if (currentFile && currentFile.content.some(contentItem => contentItem.id === action.payload.id)) {
                        // If the current file is in the folder being deleted, we should reset the currentFileId.
                        newState.sortedData.currentFileId = undefined;
                        newState.sortedData.currentPage = 'HOME'; // Reset to home page if the current file is deleted.
                    }
                }

                // Remove the item from the sortedData.
                newState.sortedData.folders.forEach(folder => {
                    folder.files.forEach(file => {
                        file.content = file.content.filter(item => item.id !== action.payload.id);
                    });
                });

                // If the item was the current file or folder, reset the currentFileId or currentFolderId.
                if (newState.sortedData.currentFileId === action.payload.id) {
                    newState.sortedData.currentFileId = undefined;
                    newState.sortedData.currentPage = 'HOME'; // Reset to home page if the current file is deleted.
                }
                if (newState.sortedData.currentFolderId === action.payload.id) {
                    newState.sortedData.currentFolderId = undefined;
                    newState.sortedData.currentPage = 'HOME'; // Reset to home page if the current folder is deleted.
                }
                return newState;
            case 'DELETE_ITEM_IN_FILE':
                if (!newState.sortedData) throw new Error("[DataReducer | Action: DELETE_ITEM_IN_FILE] No sorted data available to delete item in file.");
                if (!newState.sortedData.currentFileId) throw new Error("[DataReducer | Action: DELETE_ITEM_IN_FILE] No current file selected to figure out what to delete.");
                
                function removeItemByCreationDate(array: any[], creationDate: string): void {
                    const index = array.findIndex(item => item.createdAt === creationDate);
                    if (index !== -1) {
                        array.splice(index, 1);
                    }
                }

                // The payload should contain a createdAt value to identify the item to delete. We then use the currentFileId to first find where the item requested to be deleted is located, and then search for the item in that file that has a matching createdAt.

                // Remove the item from the content array of the current file
                const currentFile_DeleteItemBlock = newState.sortedData.folders
                    .flatMap(folder => folder.files)
                    .find(file => file.id === newState.sortedData?.currentFileId);

                if (!currentFile_DeleteItemBlock) throw new Error(`[DataReducer | Action: DELETE_ITEM_IN_FILE] Current file not found.`);

                removeItemByCreationDate(currentFile_DeleteItemBlock.content, action.payload.createdAt);

                return newState;
            default:
                throw new Error(`Unknown action type: ${action.type}`);
        }
    } catch (error) {
        console.error("[DataReducer] Error processing action:", error);
        newState.errorMessage = `[DataReducer] Error processing action: ${error instanceof Error ? error.message : 'Unknown error'}`;
        return newState;
    }
};