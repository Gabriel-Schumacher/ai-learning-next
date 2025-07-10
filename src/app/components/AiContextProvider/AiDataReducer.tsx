"use client";
import { INITIAL_DATA_STATE_TYPE as StateType, pageOptions } from "./AiDataProvider";
import { Folder, Conversation, ChatResponse, Quiz } from "../../../lib/types/types";
import { addItemToFolder, addResponseToConversation, calculateIDsInUse, checkIfArrayHasCurrent, createConversation, createFolder, createQuiz, createResponse, makeCurrentFolder, makeCurrentItem, removeCurrentsInAttached, removeCurrentsInFolders, removeItemFromFolders, removeResponseFromAttachedItem } from "./AIDataProviders_utils";
import { LocalStorageDataParsedType } from "@/app/context_providers/local_storage/local_utils";
import { useContext } from "react";
import { LocalStorageContextProvider } from "@/app/context_providers/local_storage/LocalStorageProvider";

export type DATA_ACTION_TYPES =
    | { type: 'SET_FOLDERS'; payload: Folder[] }
    | { type: 'SET_ERROR'; payload: string }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_PAGE'; payload: (typeof pageOptions)[number] }
    | { type: 'TOGGLE_CURRENT_FOLDER'; payload: number }
    | { type: 'TOGGLE_CURRENT_ITEM'; payload: number }
    | { type: 'ADD_FOLDER'; payload?: Folder }
    | { type: 'ADD_CONVERSATION'; payload?: Conversation }
    | { type: 'ADD_RESPONSE'; payload: ChatResponse }
    | { type: 'ADD_QUIZ'; payload: Quiz }
    | { type: 'REMOVE_ITEM'; payload: number }
    | { type: 'REMOVE_CURRENT_ITEM' }
    | { type: 'REMOVE_RESPONSE'; payload: number }
    | { type: 'INITIALIZE_DATA'; payload?: LocalStorageDataParsedType };

export const AiDataReducer = (state: StateType, action: DATA_ACTION_TYPES): StateType => {
    const newState = { ...state }; // Create a new state object to avoid mutating the original state. In cases where errors are thrown, we return the original state as to prevent rerendering.

    // Reducer logic
    switch (action.type) {
        case 'INITIALIZE_DATA':
            // Since we are initializing the data from the local storage, we need to get the active Ids that are already in use,
            // We also need to find any current folders and conversations that are already set.
            
            const INITIALIZED_FOLDERS: Folder[] = action.payload as unknown as Folder[];
            if (!INITIALIZED_FOLDERS || INITIALIZED_FOLDERS.length === 0) {
                console.warn("No payload provided for INITIALIZE_DATA");
                return state;
            }

            const AllIdsInUse = calculateIDsInUse(INITIALIZED_FOLDERS);
            
            const currentFolder = INITIALIZED_FOLDERS.find((folder: Folder) => folder.current);
            const currentConversation = currentFolder?.attached_items?.find((item: Conversation | Quiz) => item.current);

            return {
                ...newState,
                folders: INITIALIZED_FOLDERS || [],
                conversations: [],
                currentConversation: currentConversation || undefined,
                _currentConversationID: currentConversation?.id || undefined,
                _currentFolderID: currentFolder?.id || undefined,
                _idsInUse: AllIdsInUse || [],
                loading: false,
                error: null,
            };
        case 'SET_FOLDERS':
            console.log("SET_FOLDERS is being phased out, if I got called then the code that called me needs to be looked at.");
            return state; 
        case 'SET_ERROR':
            return {
                ...newState,
                error: action.payload,
            };
        case 'SET_LOADING':
            return {
                ...newState,
                loading: action.payload,
            };
        case 'SET_PAGE':
            if (!pageOptions.includes(action.payload)) {
                return state;
            }
            return {
                ...newState,
                currentPage: action.payload,
            };
        case 'TOGGLE_CURRENT_FOLDER':
            console.debug("Toggling current folder: ", action.payload);
            if (!newState._idsInUse.includes(action.payload)) return state;


            // First, we should check if the folder being toggled is already the current folder. If so, we should remove the current state from all folders and set the current folder to undefined.
            const CURRENT_FOLDER = newState.folders?.find((folder: Folder) => folder.id === action.payload);
            const ALREADY_CURRENT_FOLDER = CURRENT_FOLDER?.current;
            if (ALREADY_CURRENT_FOLDER) {
                console.warn("Folder is already current, removing current state from all folders.");
            }
            if (ALREADY_CURRENT_FOLDER) return {
                ...newState,
                folders: removeCurrentsInFolders(newState.folders as Folder[]),
                currentPage: 'HOME',
                _currentFolderID: undefined,
                conversations: undefined,
                currentConversation: undefined,
                _currentConversationID: undefined,
            }

            // If the folder is not already current, we should set it to current and remove the current state from all other folders.
            newState.folders = makeCurrentFolder(newState.folders as Folder[], action.payload);
            const folderWithID = newState.folders?.find((folder: Folder) => folder.id === action.payload);
            const newConversations = folderWithID?.attached_items || [];

            return {
                ...newState,
                conversations: newConversations,
                _currentFolderID: action.payload,
                currentConversation: undefined,
                _currentConversationID: undefined,
                currentPage: 'HOME',
            };
        case 'TOGGLE_CURRENT_ITEM':
            if (!newState._idsInUse.includes(action.payload)) return state;

            // First, we should check if the conversation being toggled is already the current conversation. If so, we should remove the current state from all conversations and set the current conversation to undefined.
            const CURRENT_ITEM = newState.conversations?.find((conversation: Conversation | Quiz) => conversation.id === action.payload);
            const ALREADY_CURRENT_ITEM = CURRENT_ITEM?.current;
            if (ALREADY_CURRENT_ITEM) return {
                ...newState,
                conversations: removeCurrentsInAttached(newState.conversations as (Conversation | Quiz)[]),
                _currentConversationID: undefined,
                currentConversation: undefined,
                currentPage: 'HOME',
            }

            newState.conversations = makeCurrentItem(newState.conversations as (Conversation | Quiz)[], action.payload);
            const conversationWithID = newState.conversations?.find((conversation: Conversation | Quiz) => conversation.id === action.payload);
            return {
                ...newState,
                conversations: newState.conversations,
                currentConversation: conversationWithID,
                _currentConversationID: action.payload,
                currentPage: CURRENT_ITEM ? (CURRENT_ITEM.type === 'conversation' ? 'CHAT' : 'QUIZ') : 'HOME',
                error: CURRENT_ITEM ? null : 'This item does not exist.',
            };
        case 'ADD_FOLDER':
            const newFolder = createFolder(newState._idsInUse, action.payload?.current);
            return {
                ...newState,
                folders: [...(newState.folders || []), newFolder],
                _idsInUse: [...newState._idsInUse, newFolder.id],
                currentPage: 'HOME',
            };
        case 'ADD_CONVERSATION':
            const newConversation = createConversation(newState._idsInUse, action.payload, action.payload?.current);
            const foldersWithNewConversationAdded = addItemToFolder(newState.folders as Folder[], newState._currentFolderID as number, newConversation);
            return {
                ...newState,
                folders: foldersWithNewConversationAdded,
                _idsInUse: [...newState._idsInUse, newConversation.id]
            };
        case 'ADD_RESPONSE':
            if (!newState.conversations || !newState.currentConversation) return state;

            const newResponse = createResponse(newState._idsInUse, action.payload);
            const conversationsWithNewResponseAdded = addResponseToConversation(newState.conversations, newState._currentConversationID as number, newResponse);

            return {
                ...newState,
                conversations: conversationsWithNewResponseAdded,
                _idsInUse: [...newState._idsInUse, newResponse.id],
                // I'm assuming currentConversation is automatically updated since conversations adds based on id.
            };
        case 'ADD_QUIZ':
            const newQuiz = createQuiz(newState._idsInUse, action.payload, action.payload?.current);
            const foldersWithNewQuizAdded = addItemToFolder(newState.folders as Folder[], newState._currentFolderID as number, newQuiz);
            return {
                ...newState,
                folders: foldersWithNewQuizAdded,
                conversations: [...(newState.conversations || []), newQuiz],
                _idsInUse: [...newState._idsInUse, newQuiz.id]
            };
        case 'REMOVE_ITEM':
            console.log("Payload for REMOVE_ITEM action: ", action.payload);
            if (!newState.folders || !newState._idsInUse.includes(action.payload)) return state;
            console.log(1)

            const REMOVED_ITEMS_FOLDER_IS_CURRENT = checkIfArrayHasCurrent(newState.folders as Folder[], action.payload);
            const REMOVED_ITEM_IS_CURRENT = REMOVED_ITEMS_FOLDER_IS_CURRENT ? checkIfArrayHasCurrent(newState.conversations as (Conversation | Quiz)[], action.payload) : false;
            const updatedFolders = removeItemFromFolders(newState.folders, action.payload);
            const currentConversationInUpdatedFolders = updatedFolders.find((folder: Folder) => folder.id === newState._currentFolderID)?.attached_items || newState.conversations;
            console.log("New state after removing item: ", updatedFolders);
            if (!currentConversationInUpdatedFolders) {
                console.warn("No current conversation found after removing item, resetting current conversation.");
            }
            if (REMOVED_ITEM_IS_CURRENT && !currentConversationInUpdatedFolders) {
                console.warn("Removed item was current, but no current conversation found in updated folders.");
            }
            
            return {
                ...newState,
                folders: updatedFolders,
                conversations: currentConversationInUpdatedFolders,
                currentConversation: REMOVED_ITEM_IS_CURRENT ? undefined : newState.currentConversation,
                _currentConversationID: REMOVED_ITEM_IS_CURRENT ? undefined : newState._currentConversationID,
                _idsInUse: newState._idsInUse.filter((id) => id !== action.payload),
                currentPage: REMOVED_ITEM_IS_CURRENT ? 'HOME' : newState.currentPage,
            };
        case 'REMOVE_RESPONSE':
            if (!newState.conversations || !newState._idsInUse.includes(action.payload)) return state;
            if (!newState.currentConversation) return state;

            const updatedResponses = removeResponseFromAttachedItem(newState.currentConversation as Conversation, action.payload);
            const updatedConversations = newState.conversations.map((conversation: Conversation | Quiz) => {
                if (conversation.id === newState._currentConversationID) {
                    return updatedResponses;
                }
                return conversation;
            });


            return {
                ...newState,
                conversations: updatedConversations,
                currentConversation: updatedResponses,
                _idsInUse: newState._idsInUse.filter((id) => id !== action.payload),
            };
        case 'REMOVE_CURRENT_ITEM':
            // This action is used to remove the current item from the state without affecting the rest of the state.
            const LOCAL_CURRENT_FOLDER = newState.folders?.find((folder: Folder) => folder.id === newState._currentFolderID);
            if (!LOCAL_CURRENT_FOLDER) {
                console.warn("No current folder found, cannot remove current items.");
                return state;
            }
            removeCurrentsInAttached(LOCAL_CURRENT_FOLDER.attached_items as (Conversation | Quiz)[]);
            return {
                ...newState,
                currentConversation: undefined,
                _currentConversationID: undefined
            };
        default:
            return {
                ...state,
                error: `Unhandled action type: ${(action as DATA_ACTION_TYPES).type}`,
            };
    }
};