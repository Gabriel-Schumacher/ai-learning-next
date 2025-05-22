"use client"
import type { Conversations, Conversation, Folders, Folder, ChatResponses, ChatResponse} from '../../../lib/types/types'

/////////// Auxilary Functions for use by exported Functions ///////////
function removeAllCurrentsInFolders(folders: Folders): Folders {
    const updatedFolders = folders.map(folder => ({
        ...folder,
        current: false,
        attached_conversations: folder.attached_conversations.map(conversation => ({
            ...conversation,
            current: false
        }))
    }))
    return updatedFolders
}
function removeAllCurrentsInConversation(folders: Folders): Folders {
    const updatedFolders = folders.map(folder => ({
        ...folder,
        attached_conversations: folder.attached_conversations.map(conversation => ({
            ...conversation,
            current: false
        }))
    }))
    return updatedFolders
}


/**
 * Adds a message to the current conversation within the specified folder.
 * 
 * This function locates the current conversation in the provided folder and appends
 * the given `response` message to its `messages` array. If the `response` does not
 * have an ID, a unique random ID is generated and assigned to it.
 * 
 * @param response - The message to be added to the current conversation.
 * @param folder - The folder containing the conversations.
 * @returns The updated folder with the new message added to the current conversation, or `void` if no current conversation is found.
 */
export function clientAddMessageToConversation(response: ChatResponse, folder:Folder):Folder|void {
    const currentFolder = folder as Folder
    const currentConversation = currentFolder.attached_conversations.find((conversation: Conversation) => conversation.current)
    if (!currentConversation) {
        console.error("No current conversation found")
        return
    }
    if (response.id === -1) {
        response.id = clientGetRandomID(currentConversation.messages)
    }
    if (Array.isArray(currentConversation.messages)) {
        currentConversation.messages = [...currentConversation.messages, response]
    }
    return folder

}
/**
 * Removes a message with the specified `id` from the current conversation.
 * 
 * This function searches for the message with the given `id` in the `messages` array
 * of the current conversation and removes it if found.
 * 
 * @param id - The ID of the message to be removed.
 * @param currentConversation - The current conversation object containing the messages.
 * @returns The updated conversation object with the message removed, or `undefined` if the message was not found.
 */
export function clientRemoveMessageFromConversation(id: number, currentConversation:any) {
    currentConversation as Conversation
    const index = currentConversation.messages.findIndex((message:any) => message.id === id)
    if (index === -1) {
        console.error("Message not found")
        return
    }
    currentConversation.messages = currentConversation.messages.filter((_:any, i: number) => i !== index)
    return currentConversation
}

/**
 * Handles switching to a different chat by toggling the `current` property of the selected conversation.
 * 
 * This function ensures that only the conversation with the specified `index` is marked as `current`.
 * All other conversations in the provided folders will have their `current` property set to `false`.
 * 
 * @param index - The index of the conversation to be marked as `current`.
 * @param folders - The array of folders containing conversations to be updated.
 * @returns A new array of folders with the updated `current` property for conversations.
 */
export function clientHandleDifferentChat(index: number, folders: Folders): Folders {
    let updatedFolders = removeAllCurrentsInConversation(folders);
    updatedFolders = updatedFolders.map(folder => ({
        ...folder,
        attached_conversations: folder.attached_conversations.map((conversation, i) => ({
            ...conversation,
            current: i === index
        }))
    }));
    return updatedFolders;
}

/**
 * Toggles the `current` property of a folder within the provided folders.
 * 
 * This function updates the `current` property of all folders in the given array,
 * ensuring that only the folder with the specified `id` is marked as `current`.
 * All other folders will have their `current` property set to `false`.
 * 
 * @param id - The ID of the folder to be marked as `current`.
 * @param folders - The array of folders to be updated.
 * @returns A new array of folders with the updated `current` property for folders.
 */
export function clientToggleCurrentFolder(id: number, folders: Folders): Folders {
    const currentActiveFolder = folders.find(folder => folder?.current)
    if (currentActiveFolder && currentActiveFolder.id === id) {
        currentActiveFolder.current = false;
        return folders;
    }
    let updatedFolders = removeAllCurrentsInFolders(folders)
    updatedFolders = updatedFolders.map(folder => {
        return ({
            ...folder,
            current: folder.id === id ? (folder.current === undefined ? true : !folder.current) : false
            })
        }
    )
    return updatedFolders
}

/**
 * Toggles the `current` property of a conversation within the provided folders.
 * 
 * This function updates the `current` property of all conversations in the given folders,
 * ensuring that only the conversation with the specified `id` is marked as `current`.
 * All other conversations will have their `current` property set to `false`.
 * 
 * @param id - The ID of the conversation to be marked as `current`.
 * @param folders - The array of folders containing conversations to be updated.
 * @returns A new array of folders with the updated `current` property for conversations.
 */
export function clientToggleCurrentChat(id:number, folders: Folders): Folders {
    let updatedFolders = removeAllCurrentsInConversation(folders)
    updatedFolders = updatedFolders.map(folder => ({
        ...folder,
        attached_conversations: folder.attached_conversations.map(conversation => ({
            ...conversation,
            current: conversation.id === id ? true : false
        }))
    }))
    return updatedFolders
}

/**
 * Generates a unique random ID that does not conflict with existing IDs in the provided collection.
 * 
 * @param items - A collection of items which can be of type `Folders`, `Conversations`, `Conversation`, or `ChatResponses`.
 *                If the collection contains a `messages` property that is an array, it will use the IDs from `messages`.
 * 
 * @returns A unique random number between 0 and 999,999 that is not already present in the collection.
 * 
 * @remarks
 * This function ensures that the generated ID is unique within the context of the provided collection.
 * It uses a `Set` to track existing IDs for efficient lookup.
 * 
 * @example
 * ```typescript
 * const folders: Folders = [{ id: 1 }, { id: 2 }];
 * const newID = getRandomID(folders);
 * console.log(newID); // Outputs a number that won't be 1 or 2.
 * ```
 */
export function clientGetRandomID(items: Folders | Conversations | Conversation| ChatResponses): number {
    let ITEMS = items as Folders | Conversations | Conversation | ChatResponses
    if ('messages' in items && Array.isArray(items.messages)) {
        ITEMS = items.messages as ChatResponses
    }
    let existingIDs = new Set(
        Array.isArray(ITEMS) ? ITEMS.map(item => item.id) : []
    );
    let randomID;
    do {
        randomID = Math.floor(Math.random() * 1000000);
    } while (existingIDs.has(randomID));
    return randomID;
}

/**
 * Adds a new conversation to the current folder.
 * 
 * This function locates the currently active folder and appends a new conversation
 * to its `attached_conversations` array. The new conversation is assigned a unique ID
 * and a default title based on the total number of folders.
 * 
 * @param folders - The array of folders to which the new conversation will be added.
 * @returns A new array of folders with the updated `attached_conversations` for the current folder.
 *          If no current folder is found, the original folders array is returned.
 */
export function clientAddConversation(folders:Folders): Folders {
    const currentFolder = folders.find(folder => folder?.current);
    if (currentFolder) {
        const newConversationID = clientGetRandomID(currentFolder.attached_conversations);
        const newConversation: Conversation = { id: newConversationID, title: `Convo ${folders.length++}`, current: false, messages: [] };
        currentFolder.attached_conversations = [...currentFolder.attached_conversations, newConversation];
        return folders
    } else {
        console.error("No current folder found to add a new conversation to. Please select a folder first.");
        return folders;
    }
}