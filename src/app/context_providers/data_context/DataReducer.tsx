"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Types from "@/lib/types/types_new";
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
    | { type: 'RENAME_SLOT'; payload: { id: number; newName: string; } } // This is used to rename a slot in the state. The payload contains the ID of the slot and the new name.
    | { type: 'UPDATE_ITEM'; payload: { id: number, contentItem: Types.BaseContentItem } }
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
                    console.warn("[DataReducer] No data found in localStorage. Initializing with fake data.");
                    const fakeData: Types.FolderStructureRoot = Utils.generateFakeFolderStructureRoot();
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

                Utils.saveData(newState.sortedData); // Saves it to localStorage so that it can be used later.
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
                // This is MANUALLY done, so we should also reset active folders and files.
                if (!newState.sortedData) {
                    throw new Error("[DataReducer | Action: SET_PAGE] No sorted data available to set page.");
                }
                newState.sortedData.currentPage = action.payload;
                if (action.payload === 'HOME') {
                    newState.sortedData.currentFolderId = undefined;
                    newState.sortedData.currentFileId = undefined;
                }
                return newState;
            case 'TOGGLE_CURRENT_FOLDER':
                if (!newState.sortedData) {
                    throw new Error("[DataReducer | Action: TOGGLE_FOLDER] No sorted data available to toggle folder.");
                }
                const ids = newState.sortedData.ids;
                const hasId = Array.isArray(ids)
                    ? ids.includes(action.payload)
                    : ids.has(action.payload);
                if (!hasId) {
                    throw new Error(`[DataReducer | Action: TOGGLE_FOLDER] No data has the id ${action.payload}.`);
                }

                newState.sortedData.currentFolderId = (newState.sortedData.currentFolderId === action.payload) ? undefined : action.payload;

                return newState;
            case 'TOGGLE_CURRENT_FILE':
                if (!newState.sortedData) {
                    throw new Error("[DataReducer | Action: TOGGLE_FILE] No sorted data available to toggle file.");
                }
                if (action.payload === -1) {
                    // If the payload is -1, it just means to unselect the current file.
                    newState.sortedData.currentFileId = undefined;
                    return newState;
                }
                const ids_file = newState.sortedData.ids;
                const hasFileId = Array.isArray(ids_file)
                    ? ids_file.includes(action.payload)
                    : ids_file.has(action.payload);
                if (!hasFileId) {
                    console.log("[DataReducer | Action: TOGGLE_FILE] Folders Searched", newState.sortedData.ids);
                    throw new Error(`[DataReducer | Action: TOGGLE_FILE] No data has the id ${action.payload}.`);
                }

                // Handle Page Switching (NOT TOGGLING THE FILE VARIABLE)
                if (newState.sortedData.currentFileId === action.payload) {
                    // Reset to home page if the current file is toggled off.
                    const currentItemFile = Utils.getItemById(newState.sortedData.folders, action.payload);
                    if (!currentItemFile) {
                        newState.sortedData.currentPage = 'HOME';
                    } else {
                        switch (currentItemFile.type) {
                            case 'conversation':
                                newState.sortedData.currentPage = 'HOME';
                                break;
                            case 'quiz':
                                newState.sortedData.currentPage = 'QUIZ';
                                break;
                            case 'flashcard':
                                newState.sortedData.currentPage = 'QUIZ'; // Flashcards are treated as quizzes in this context.
                                break;
                            default:
                                throw new Error(`[DataReducer | Action: TOGGLE_FILE] Unhandled file type: ${(currentItemFile as any).type}.`);
                        }
                    }
                    
                } else {
                    const fileType = newState.sortedData.folders
                        .flatMap(folder => folder.files)
                        .find(file => file.id === action.payload)?.type;
                    if (!fileType) {
                        throw new Error(`[DataReducer | Action: TOGGLE_FILE] No file found with id ${action.payload}.`);
                    }

                    switch (fileType) {
                        case 'conversation':
                            newState.sortedData.currentPage = 'CHAT';
                            break;
                        case 'flashcard':
                            newState.sortedData.currentPage = 'QUIZ';
                            break;
                        case 'quiz':
                            newState.sortedData.currentPage = 'QUIZ';
                            break;
                        default:
                            throw new Error(`[DataReducer | Action: TOGGLE_FILE] Unknown file type: ${fileType}.`);
                    }
                }
                // Change the currentFileId to the one being toggled.
                newState.sortedData.currentFileId = (newState.sortedData.currentFileId === action.payload) ? undefined : action.payload;
                return newState;
            case 'ADD_FOLDER':
                if (!newState.sortedData) {
                    throw new Error("[DataReducer | Action: ADD_FOLDER] No sorted data available to add folder.");
                }
                const ids_folderblock = newState.sortedData.ids
                if (!ids_folderblock) {
                    throw new Error("[DataReducer | Action: ADD_FOLDER] No ids found to use to create a new folder.");
                }

                const folderId = Utils.newId(ids_folderblock);
                const newFolder: Types.FolderStructure = Utils.createFolder(ids_folderblock, `New Folder ${folderId}`, new Date());
                
                newState.sortedData.folders.push(newFolder);

                if (action.payload.setActive) {
                    // If the action payload indicates to set this folder as active, we do so.
                    newState.sortedData.currentFolderId = newFolder.id;
                }
                if (
                    (Array.isArray(newState.sortedData.ids) && !newState.sortedData.ids.includes(newFolder.id)) ||
                    (!Array.isArray(newState.sortedData.ids) && !(newState.sortedData.ids as Set<number>).has(newFolder.id))
                ) {
                    if (Array.isArray(newState.sortedData.ids)) {
                        newState.sortedData.ids.push(newFolder.id);
                    } else {
                        (newState.sortedData.ids as Set<number>).add(newFolder.id);
                    }
                }
                return newState;
            case 'ADD_FILE':
                // Check if the sortedData is available and has the necessary properties.

                if (!newState.sortedData || !newState.sortedData.ids) {
                    throw new Error("[DataReducer | Action: ADD_FILE] No sorted data available to add file.");
                }

                // Check to see if the folder with the currentFolderId exists in the sortedData.
                const currentFolder = newState.sortedData.folders.find(folder => folder.id === newState.sortedData?.currentFolderId);
                if (!newState.sortedData.currentFolderId) {
                    throw new Error("[DataReducer | Action: ADD_FILE] No current folder selected to add file to.");
                } else if (!currentFolder) {
                    throw new Error("[DataReducer | Action: ADD_FILE] Current folder not found in sorted data.");
                }
                
                // Check if the file type being created is a valid type.
                if (!Types.DataFileTypes(action.payload.type)) {
                    throw new Error(`[DataReducer | Action: ADD_FILE] Invalid file type: ${action.payload.type}. Expected one of: ${Object.values(Types.DataFileTypes).join(', ')}.`);
                }

                // Ease of reading variables.
                const ids_fileblock = newState.sortedData.ids;
                const capitalizedType = action.payload.type.charAt(0).toUpperCase() + action.payload.type.slice(1);

                const fileId = Utils.newId(ids_fileblock);
                const newFile: Types.BaseDataFile = Utils.createFile(ids_fileblock, action.payload.type, `New ${capitalizedType} ${fileId}`, []);
                currentFolder.files.push(newFile);

                if (action.payload.setActive) {
                    newState.sortedData.currentFileId = newFile.id;
                }
                if (
                    (Array.isArray(newState.sortedData.ids) && !newState.sortedData.ids.includes(newFile.id)) ||
                    (!Array.isArray(newState.sortedData.ids) && !(newState.sortedData.ids as Set<number>).has(newFile.id))
                ) {
                    if (Array.isArray(newState.sortedData.ids)) {
                        newState.sortedData.ids.push(newFile.id);
                    } else {
                        (newState.sortedData.ids as Set<number>).add(newFile.id);
                    }
                }

                return newState;
            case 'ADD_CONTENT':
                // Check if the sortedData is available and has the necessary properties.
                if (!newState.sortedData || !newState.sortedData.ids) {
                    throw new Error("[DataReducer | Action: ADD_CONTENT] No sorted data available to add content.");
                }
                // Check to see if the file with the currentFileId exists in the sortedData.
                const currentFile = newState.sortedData.folders
                    .flatMap(folder => folder.files)
                    .find(file => file.id === newState.sortedData?.currentFileId);
                if (!currentFile) {
                    throw new Error("[DataReducer | Action: ADD_CONTENT] Current file for the content to be added to was not found in the sorted data.");
                }
                // Check if the content type being added is a valid type.
                if (!Types.ContentItemTypes.includes(action.payload.type)) {
                    throw new Error(`[DataReducer | Action: ADD_CONTENT] Invalid content type: ${action.payload.type}. Expected one of: ${Types.ContentItemTypes.join(', ')}.`);
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
                        if (!Utils.checkItemQuestions(itemToBeAdded as Types.QuestionContentItem)) {
                            throw new Error("[DataReducer | Action: ADD_CONTENT] The Question content is either missing information or formatted incorrectly..");
                        }

                        itemToBeAdded = Utils.createQuestionContentItem(
                            newState.sortedData.ids,
                            itemToBeAdded.items as Types.QuestionItemsType
                        );

                        break;
                    case 'image':
                    case 'video':
                    case 'audio':
                    default:
                        throw new Error(`[DataReducer | Action: ADD_CONTENT] Content type ${itemToBeAdded.type}'s ability to be added has not been implemented.`);
                }

                if (
                    (Array.isArray(newState.sortedData.ids) && !newState.sortedData.ids.includes(itemToBeAdded.id)) ||
                    (!Array.isArray(newState.sortedData.ids) && !(newState.sortedData.ids as Set<number>).has(itemToBeAdded.id))
                ) {
                    if (Array.isArray(newState.sortedData.ids)) {
                        newState.sortedData.ids.push(itemToBeAdded.id);
                    } else {
                        (newState.sortedData.ids as Set<number>).add(itemToBeAdded.id);
                    }
                }
                currentFile.content.push(itemToBeAdded);
                return newState;
            case 'DELETE_ITEM':
                if (!newState.sortedData) throw new Error("[DataReducer | Action: DELETE_ITEM] No sorted data available to delete item.");
                
                console.log("[DataReducer | Action: DELETE_ITEM] Deleting item with ID:", action.payload.id);

                const itemToDelete = Utils.getItemById(newState.sortedData.folders, action.payload.id);
                const parentOfItemToDelete = Utils.getParentByItemId(newState.sortedData.folders, action.payload.id);

                if (!itemToDelete) throw new Error(`[DataReducer | Action: DELETE_ITEM] Item with ID ${action.payload.id} not found.`);

                /**
                 * First we need to handle the 'meta' data of the item being deleted.
                 * (Things that would be impacted by the deletion of item, and if not handled, would cause desynchronization of the state.)
                 * For example, if the item being deleted is a folder, we need to check if the current file being displayed is in that folder, and if so, reset the currentFileId so that the UI does not try to display a file that no longer exists.
                 */
                if (itemToDelete.type === 'folder' && newState.sortedData.currentFileId) {
                    
                    // Check if the current file is in the folder being deleted.
                    if (itemToDelete && itemToDelete.files.some((file: Types.BaseDataFile) => file.id === newState.sortedData?.currentFileId)) {
                        // If the current file is in the folder being deleted, we should reset the currentFileId.
                        newState.sortedData.currentFileId = undefined;
                        newState.sortedData.currentPage = 'HOME'; // Reset to home page if the current file is deleted.
                    }
                    
                    // If the current folder is being deleted, we should reset the currentFolderId.
                    if (itemToDelete && itemToDelete.id === newState.sortedData?.currentFolderId) {
                        newState.sortedData.currentFolderId = undefined;
                        newState.sortedData.currentPage = 'HOME'; // Reset to home page if the current folder is deleted.
                    }
                } else {
                    if (newState.sortedData.currentFileId && itemToDelete.id === newState.sortedData.currentFileId) {
                        // If the current file is being deleted, we should reset the currentFileId.
                        newState.sortedData.currentFileId = undefined;
                        newState.sortedData.currentPage = 'HOME'; // Reset to home page if the current file is deleted.
                    }
                }

                /**
                 * Next, we need to handle the actual deletion of the item.
                */
                if (parentOfItemToDelete && typeof parentOfItemToDelete === 'object' && 'type' in parentOfItemToDelete) {
                    switch (parentOfItemToDelete.type) {
                        case 'folder':
                            parentOfItemToDelete.files = parentOfItemToDelete.files.filter(file => file.id !== action.payload.id);
                            break;
                        case 'conversation':
                        case 'quiz':
                        case 'flashcard':
                            parentOfItemToDelete.content = parentOfItemToDelete.content.filter(item => item.id !== action.payload.id);
                            break;
                        case 'text':
                        case 'image':
                        case 'video':
                        case 'audio':
                        case 'question':
                            throw new Error(`[DataReducer | Action: DELETE_ITEM] Cannot delete item of type ${parentOfItemToDelete.type} directly. It should be deleted through its parent file.`);
                        default:
                            throw new Error(`[DataReducer | Action: DELETE_ITEM] Unhandled parent type: ${(parentOfItemToDelete as any).type || 'unknown'}.`);
                    }
                } else if (itemToDelete.type === 'folder') {
                    // If there isn't a parent, it indicates that the target being deleted is a top-level folder.
                    // In this case, we can directly remove the folder from the sortedData.folders array
                    newState.sortedData.folders = newState.sortedData.folders.filter(folder => folder.id !== action.payload.id);
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
            case 'RENAME_SLOT':
                if (!newState.sortedData) throw new Error("[DataReducer | Action: RENAME_SLOT] No sorted data available to rename slot.");
                if (action.payload.id === -1) {
                    // If the id is -1, it means we are renaming the current file.
                    action.payload.id = newState.sortedData.currentFileId || 0;
                } else if (action.payload.id === -2) {
                    // If the id is -2, it means we are renaming the current folder.
                    action.payload.id = newState.sortedData.currentFolderId || 0;
                }
                if (action.payload.id === 0) {
                    throw new Error("[DataReducer | Action: RENAME_SLOT] Attempted to rename a folder or file when there is no current folder or file selected. Please select a folder or file to rename.");
                }
                const slotToRename = Utils.getItemById(newState.sortedData.folders, action.payload.id);

                if (!slotToRename) throw new Error(`[DataReducer | Action: RENAME_SLOT] Slot not found.`);

                if (slotToRename.type === 'folder') {
                    slotToRename.name = action.payload.newName;
                }
                else if ('title' in slotToRename && slotToRename.title) {
                    slotToRename.title = action.payload.newName;
                } else {
                    throw new Error(`[DataReducer | Action: RENAME_SLOT] Item with ID ${action.payload.id} does not have a title or name to rename.`);
                }
                return newState;
            case 'UPDATE_ITEM':
                if (!newState.sortedData) throw new Error("[DataReducer | Action: UPDATE_ITEM] No sorted data available to update item.");
                const itemToUpdate = Utils.getItemById(newState.sortedData.folders, action.payload.id);
                if (!itemToUpdate) throw new Error(`[DataReducer | Action: UPDATE_ITEM] Item with ID ${action.payload.id} not found.`);
                
                if (itemToUpdate.type !== action.payload.contentItem.type) {
                    throw new Error(`[DataReducer | Action: UPDATE_ITEM] Mismatched content type. Expected ${itemToUpdate.type}, but received ${action.payload.contentItem.type}.`);
                }

                Object.assign(itemToUpdate, {
                    ...action.payload.contentItem,
                    updatedAt: new Date() // Update the updatedAt field to the current date.
                });

                console.log(`[DataReducer | Action: UPDATE_ITEM] Updated item with ID ${action.payload.id}.`, itemToUpdate);

                return newState;
            default:
                throw new Error(`Unknown action type: ${action.type}`);
        }
    } catch (error) {
        console.error("[DataReducer] - ", error);
        const errorMessage = `[DataReducer] - ${error instanceof Error ? error.message : 'Unknown error'}`;
        return {...state, errorMessage}; // Return the original state with the error message set, preserving all other state properties. This is in case a error is thrown after changes have been made to the newState and thus corrupt the state.
    }
};