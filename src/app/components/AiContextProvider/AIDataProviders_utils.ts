import { Folder, Conversation, Quiz, ChatResponse, QuizQuestion} from "../../../lib/types/types";


// ONE PURPOSE FUNCTIONS. ANY ABSTRACTIONS SHOULD BE DONE IN THEIR OWN FUNCTIONS
// AND NOT IN THE REDUCER. THIS IS TO KEEP THE REDUCER SIMPLE AND EASY TO UNDERSTAND.

export const calculateIDsInUse = (folders: Folder[]): number[] => {
    if (!folders) return [];
    if (folders.length === 0) return [];

    const ids: number[] = [];

    function addIDsToArray(array: Array<Folder | Conversation | Quiz | ChatResponse | QuizQuestion | (Conversation | Quiz)[]>): void {
        if (!array) return;
        if (array.length === 0) return;

        array.forEach((item) => {
            if (Array.isArray(item)) {
                addIDsToArray(item);
            } else if (typeof item === 'object' && item !== null && 'id' in item) {
                ids.push(item.id);
                if ('attached_items' in item && Array.isArray(item.attached_items)) {
                    addIDsToArray(item.attached_items);
                }
            }
        });
    }
    
    addIDsToArray(folders);

    return ids;
}

export const getRandomID = (IDS_IN_USE: number[]): number => {
    let randomID;

    do {
        randomID = Math.floor(Math.random() * 1000000);
    } while (IDS_IN_USE.includes(randomID));

    return randomID;
}

export const createFolder = (IDS_IN_USE: number[], IS_ACTIVE: boolean = false): Folder => {
    const NEW_ID = getRandomID(IDS_IN_USE);
    const newFolder: Folder = {
        id: NEW_ID,
        name: `Folder ${NEW_ID}`,
        attached_items: [],
        current: IS_ACTIVE,
    };
    return newFolder;
}

export const createConversation = (IDS_IN_USE: number[], PAYLOAD: Conversation | undefined, IS_ACTIVE: boolean = false): Conversation => {
    const NEW_ID = getRandomID(IDS_IN_USE);
    let newConversation: Conversation;
    if (!PAYLOAD) {
        newConversation = {
            id: NEW_ID,
            title: `Convo ${NEW_ID}`,
            type: "conversation",
            current: IS_ACTIVE,
            responses: [],
        };
    } else {
        newConversation = {
            ...PAYLOAD,
            id: NEW_ID,
            current: IS_ACTIVE,
        };
    }
    return newConversation;
}

export const createQuiz = (IDS_IN_USE: number[], PAYLOAD: Quiz | undefined, IS_ACTIVE: boolean = false): Quiz => {
    const NEW_ID = getRandomID(IDS_IN_USE);
    let newQuiz: Quiz;
    if (!PAYLOAD) {
        newQuiz = {
            id: NEW_ID,
            title: `Quiz ${NEW_ID}`,
            type: "quiz",
            current: IS_ACTIVE,
            responses: [],
        };
    } else {
        newQuiz = {
            ...PAYLOAD,
            id: NEW_ID,
            current: IS_ACTIVE,
        };
    }
    return newQuiz;
}

export const createResponse = (IDS_IN_USE: number[], PAYLOAD: ChatResponse): ChatResponse => {
    const NEW_ID = getRandomID(IDS_IN_USE);
    const newResponse: ChatResponse = {
        id: NEW_ID,
        type: "response",
        time: PAYLOAD.time || new Date(),
        body: PAYLOAD.body,
        isAiResponse: PAYLOAD.isAiResponse || false,
    };
    return newResponse;
}

export const addItemToFolder = (folders: Folder[], currentFolderID: number, item: Conversation | Quiz): Folder[] => {
    if (!folders) return folders;
    if (folders.length === 0) return folders;

    const folder = folders.find((folder: Folder) => folder.id === currentFolderID);
    if (folder) {
        folder.attached_items.push(item);
    }
    return folders;
}

export const addResponseToConversation = (conversations: (Conversation | Quiz)[], currentConversationID: number, response: ChatResponse): (Conversation | Quiz)[] => {
    if (!conversations) return conversations;
    if (conversations.length === 0) return conversations;

    const conversation = conversations.find((conversation: Conversation | Quiz) => conversation.id === currentConversationID);
    if (conversation && conversation.type === "conversation") {
        conversation.responses.push(response);
    }
    return conversations;
}

export const addQuizToAttached = (folders: Folder[], currentFolderID: number, quiz: Quiz): Folder[] => {
    if (!folders) return folders;
    if (folders.length === 0) return folders;

    const folder = folders.find((folder: Folder) => folder.id === currentFolderID);
    if (folder) {
        folder.attached_items.push(quiz);
    }
    return folders;
}

export const removeCurrentsInFolders = (folders: Folder[]): Folder[] => {
    if (!folders) return folders;
    if (folders.length === 0) return folders;

    folders.forEach((folder: Folder) => {
        folder.current = false;
        if (folder.attached_items) {
            folder.attached_items = removeCurrentsInAttached(folder.attached_items) as (Conversation | Quiz)[];
        }
    });
    return folders;
}

export const removeCurrentsInAttached = (attached_items: (Conversation | Quiz)[]): (Conversation | Quiz)[] => {
    if (!attached_items) return attached_items;
    if (attached_items.length === 0) return attached_items;

    attached_items.forEach((item: Conversation | Quiz) => {
        item.current = false;
    });
    return attached_items;
}

export const makeCurrentFolder = (folders: Folder[], id: number): Folder[] => {
    if (!folders) return folders;
    if (folders.length === 0) return folders;

    removeCurrentsInFolders(folders);

    const folder = folders.find((folder: Folder) => folder.id === id);
    if (folder) {
        folder.current = true;
    }
    return folders;
}

export const makeCurrentItem = (attached_items: (Conversation | Quiz)[], id: number): (Conversation | Quiz)[] => {
    if (!attached_items) return attached_items;
    if (attached_items.length === 0) return attached_items;

    removeCurrentsInAttached(attached_items);

    const item = attached_items.find((item: Conversation | Quiz) => item.id === id);
    if (item) {
        item.current = true;
    }
    return attached_items;
}

export const removeFolder = (folders: Folder[], folderID: number): Folder[] => {
    if (!folders) return folders;
    if (folders.length === 0) return folders;

    const folderIndex = folders.findIndex((folder: Folder) => folder.id === folderID);
    if (folderIndex !== -1) {
        folders.splice(folderIndex, 1);
    }
    return folders;
}

/**
 * Removes the item WITHIN A FOLDER that matches the itemID passed to it. This function is not for removing folders.
 */
export const removeItemFromFolders = (folders: Folder[], itemID: number): Folder[] => {
    if (!folders) return folders;
    if (folders.length === 0) return folders;

    const folderIndex = folders.findIndex((folder: Folder) => folder.id === itemID);
    if (folderIndex !== -1) {
        folders.splice(folderIndex, 1);
        return folders;
    }

    folders.forEach((folder: Folder) => {
        folder.attached_items = folder.attached_items.filter((item: Conversation | Quiz) => item.id !== itemID);
    });
    return folders;
}

/**
 * Removes a response from an attached_items.
 */
export const removeResponseFromAttachedItem = (conversation: Conversation, responseID: number): Conversation => {
    if (!conversation) return conversation;
    const RemovedResponseResponses: ChatResponse[] = conversation.responses.filter((response: ChatResponse) => response.id !== responseID);
    conversation.responses = RemovedResponseResponses;
    
    return conversation;
}

export const checkIfArrayHasCurrent = (array: Array<Folder | (Conversation | Quiz)>, id: number): boolean => {
    if (!array) return false;
    if (array.length === 0) return false;

    const item = array.find((item) => item.id === id);
    if (item && item.current) {
        return true;
    }
    return false;
}