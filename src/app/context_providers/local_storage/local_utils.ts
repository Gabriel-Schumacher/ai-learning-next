import { Folder, Conversation, ChatResponse, Quiz, QuizQuestion } from '../../../lib/types/types';
import { INITIAL_STATE_LOCAL_STORAGE_TYPE as StateType } from "./LocalStorageProvider";

export function getLocalStorageData(): string | null {
    try {
        const data = localStorage.getItem('user_info_ai_data');
        return data ? data : null;
    } catch (error) {
        console.error("Error accessing localStorage:", error);
        return null;
    }
}

/**
 * Converts a JSON string into a sorted JSON object.
 *
 * @param data - The JSON string to be parsed and converted.
 * @returns A JSON object if the input is valid, or `undefined` if parsing fails.
 * @throws Will log an error to the console if the input is not valid JSON.
 */
export function convertToSortedJson(data: string): object | undefined {
    try {
        const parsedData = JSON.parse(data);
        return parsedData
    } catch (error) {
        console.error("Error parsing JSON data:", error);
        return undefined;
    }
}

function generateUniqueID(usedIDs: Set<number>): number {
    let id;
    do {
        id = Math.floor(Math.random() * 100000) + 1; // Generate random ID
    } while (usedIDs.has(id)); // Ensure ID is unique
    usedIDs.add(id);
    return id;
}

function returnSetOfIds(data: Folder[]): Set<number> {
    const ids = new Set<number>();

    function collectIdsFromFolder(folder: Folder) {
        ids.add(folder.id);
        folder.attached_items.forEach(item => {
            ids.add(item.id);
            if ('responses' in item && Array.isArray(item.responses)) {
                item.responses.forEach(response => {
                    ids.add(response.id);
                });
            }
        });
    }

    data.forEach(collectIdsFromFolder);
    return ids;
}

export function generateRandomTestData(): Folder[] {
    function generateRandomConversation(): Conversation {
        return {
            id: -1,
            title: `Chat ${Math.floor(Math.random() * 100)}`,
            type: "conversation",
            current: false,
            responses: [],
        };
    }
    function generateRandomResponse(): ChatResponse {
        return {
            id: -1,
            type: "response",
            body: `Response ${Math.floor(Math.random() * 100)}`,
            isAiResponse: false,
            time: new Date(),
        };
    }
    function generateRandomFolder(): Folder {
        return {
            id: -1,
            name: `Folder ${Math.floor(Math.random() * 100)}`,
            current: false,
            attached_items: [],
        };
    }
    function giveRandomIDsToAllData(FolderData: Folder[]): Folder[] {
        const usedIDs = new Set<number>();

        function assignIDsRecursively(folder: Folder): Folder {
            folder.id = generateUniqueID(usedIDs);
            folder.attached_items = folder.attached_items.map((item) => {
                item.id = generateUniqueID(usedIDs);
                if (item.responses && item.responses.length > 0) {
                    item.responses = item.responses
                        .filter((response): response is ChatResponse => 'type' in response && 'time' in response && 'body' in response)
                        .map((response) => {
                            response.id = generateUniqueID(usedIDs);
                            return response;
                        });
                }
                return item;
            });
            return folder;
        }

        return FolderData.map(assignIDsRecursively);
    }
    function generateRandomAmountOfAttachedItemsOrResponses(influence: number): number {
        const base = 5; // Base number of responses
        const variation = Math.floor(Math.random() * influence); // Variation based on influence
        return base + variation; // Total responses
    }
    const folders: Folder[] = Array.from({ length: Math.floor(Math.random() * 4) + 1 }, () => {
        const folder = generateRandomFolder();
        folder.attached_items = Array.from({ length: Math.floor(Math.random() * 3) + 2 }, () => {
            const conversation = generateRandomConversation();
            conversation.responses = Array.from({ length: generateRandomAmountOfAttachedItemsOrResponses(2) }, () =>
                generateRandomResponse()
            );
            return conversation;
        });
        return folder;
    });

    return giveRandomIDsToAllData(folders);

}


export const payloadIsValidType = (payload: Folder | Folder[] | Conversation[] | Conversation | Quiz | QuizQuestion | ChatResponse | (Conversation | Quiz)[]): payload is Folder | Conversation | Quiz | QuizQuestion | ChatResponse => {
    if (Array.isArray(payload)) {
        // If payload is an array, check if all items are valid types
        return payload.every(item => payloadIsValidType(item));
    }
    const validTypes = ['folder', 'conversation', 'response', 'quiz', 'question'];
    if (payload.type === undefined) return false;
    return validTypes.includes(payload.type);
}

// @eslint-disable-next-line @typescript-eslint/no-explicit-any
export const payloadExistsAlready = (data: StateType, payload: Folder | Conversation | Quiz | QuizQuestion | ChatResponse): boolean => {
    const existingItem = getExistingItem(data, payload.id);
    if (existingItem) {
        return true;
    }
    return false;
}

const getExistingItem = (data: StateType, id: number): Folder | Conversation | Quiz | QuizQuestion | ChatResponse | undefined => {
    // @eslint-disable-next-line @typescript-eslint/no-explicit-any
    function checkIfExists(VALUE: any): Folder | Conversation | ChatResponse | Quiz | QuizQuestion | undefined {
        if (Array.isArray(VALUE)) {
            for (const item of VALUE) {
                const found = checkIfExists(item);
                if (found) {
                    return found;
                }
            }
            return undefined;
        } else if (VALUE && typeof VALUE === 'object') {
            if (VALUE.id === id) {
                return VALUE;
            }
            for (const key in VALUE) {
                if (Array.isArray(VALUE[key])) {
                    const found = checkIfExists(VALUE[key]);
                    if (found) {
                        return found;
                    }
                }
            }
        }
        return undefined;
    }
    if (!data || !data.sortedData) return undefined;
    return checkIfExists(data.sortedData);
}

export const saveData = (data: StateType, payload: Folder | Conversation | Quiz | QuizQuestion | ChatResponse): void => {
    const DATA = data?.sortedData as Folder[];
    if (!DATA) {
        throw new Error("No sorted data available to save the payload.");
    }

    // First we change the session data.
    if (payloadExistsAlready(data, payload)) {
        let TARGET_ITEM = getExistingItem(data, payload.id);
        TARGET_ITEM = { ...TARGET_ITEM, ...payload }; // Update the existing item with the new payload data. If there wan't an existing item, this will create a new one.
        return;
    } else {
        if (payload.id === -1) {
            const currentIDs = returnSetOfIds(DATA);
            payload.id = generateUniqueID(currentIDs);
        }

        switch (payload.type) {
            case 'folder':
                // If the payload is a folder, we need to add it to the sortedData array.
                DATA.push(payload as Folder);
                break;
            case 'conversation':
            case 'quiz':
                // If the payload is a conversation or quiz, we need to find the current folder and add it there.
                const CURRENT_FOLDER_1 = DATA.find((folder: Folder) => folder.current);
                if (CURRENT_FOLDER_1) {
                    CURRENT_FOLDER_1.attached_items.push(payload as Conversation | Quiz);
                } else {
                    console.error("No current folder found to add the conversation or quiz to.");
                }
                break;
            case 'response':
                const CURRENT_FOLDER_2 = DATA.find((folder: Folder) => folder.current);
                const CURRENT_ITEM_2 = CURRENT_FOLDER_2?.attached_items.find(item => item.current);

                if (CURRENT_ITEM_2 && CURRENT_ITEM_2.type === 'conversation') {
                    CURRENT_ITEM_2.responses.push(payload as ChatResponse);
                }
                break;
            default:
                console.error("[localStorage Saving] Payload type is not supported yet:", payload.type);
                throw new Error(`Payload type ${payload.type} is not supported for saving.`);
        }
    }

    // Then we save that data to the localStorage.
    localStorage.setItem('user_info_ai_data', JSON.stringify(DATA, null, 2));
    console.log("Data saved successfully to localStorage.");

}

export function removeFolderCurrents(data: StateType, id?: number): void {
    const DATA = data?.sortedData as Folder[];
    if (!DATA) {
        console.error("No sorted data available to remove currents.");
        return;
    }
    if (id === undefined) {
        id = -2; // Default to -2 if no id is provided. -1 isn't used since it is used for test data.
    }

    // We remove the currents for everything except the folder with the given id.
    DATA.forEach(folder => {
        if (folder.id !== id) {
            folder.attached_items.forEach(item => {
                if (item.current) {
                    item.current = false; // Set the current state of the item to false
                }
            });
            folder.current = false; // Set the current state of the folder to false
        }
    });
}

export function getParentFolderOfItemID(data: StateType, id: number): Folder | undefined {
    const DATA = data?.sortedData as Folder[];
    if (!DATA) {
        console.error("No sorted data available to find the parent of the item.");
        return undefined;
    }

    for (const folder of DATA) {
        if (folder.id === id) {
            return folder;
        }
        const found = folder.attached_items.find(item => item.id === id);
        if (found) {
            return folder; // Return the folder that contains the item with the given id
        }
    }
    console.warn(`[getParentFolderOfItemID] Item with ID ${id} not found in any attached_items of any folder.`);
    return undefined; // Return undefined if no parent is found
}

export function toggleActiveState(data: StateType, id: number): void {
    const item = getExistingItem(data, id);
    const FOLDER_OF_ID = getParentFolderOfItemID(data, id);
    if (!item || !FOLDER_OF_ID) {
        console.error(`Item with ID ${id} not found in data.`);
        return;
    }
    // console.debug("Toggling active state for item:", item);
    // console.debug("Parent folder of item:", FOLDER_OF_ID);
    if (item.type === 'folder') {
        if (FOLDER_OF_ID.current) { 
            // If the folder is already current, then we should remove all currents from all folders.
            removeFolderCurrents(data);
        } else {
            // If the folder is not current, we should remove currents from other folders and set this folder as current.
            removeFolderCurrents(data, id);
            FOLDER_OF_ID.current = true;
        }
    } else if ('current' in item && !item.current) {
        if (item.current) {
            item.current = false;
        } else {
            FOLDER_OF_ID.attached_items.forEach((attachedItem) => {
                if ('current' in attachedItem) {
                    attachedItem.current = false; // Set all other items in the folder to not current
                }
            });
            item.current = true; // Set the current state of the item to true
        }
    } else {
        console.warn(`Item with ID ${id} is not a folder or does not have a current state.`);
    }
}

export interface LocalStorageDataParsedType {
    [key: number]: Folder;
}

export function deleteItem(data: StateType, id: number): void {
    
    const Item = getItemBasedOnID(data, id);
    const Container = getParentBasedOnID(data, id);

    console.log("Deleting id", id, "found in the container", Container, "and the item", Item);

    if (Array.isArray(Container) && Item) {
        // If the container is an array, remove the item from it
        /* eslint-disable-next-line */
        const index = Container.findIndex((el: any) => el && el.id === id);
        if (index !== -1) {
            Container.splice(index, 1);
        }
    } else if (
        Container &&
        typeof Container === 'object' &&
        'attached_items' in Container &&
        /* eslint-disable-next-line */
        Array.isArray((Container as { attached_items: any[] }).attached_items) &&
        Item
    ) {
        // If the container has attached_items, remove the item from there
        /* eslint-disable-next-line */
        const attachedItems = (Container as { attached_items: any[] }).attached_items;
        /* eslint-disable-next-line */
        const index = attachedItems.findIndex((el: any) => el && el.id === id);
        if (index !== -1) {
            attachedItems.splice(index, 1);
        }
    } else {
        console.warn(`Could not remove item with ID ${id}: container structure not recognized.`);
    }

    if (Array.isArray(data.sortedData) === false && typeof data.sortedData === 'object' && data.sortedData !== null) {
        data.sortedData = Object.values(data.sortedData);
    }
    localStorage.setItem('user_info_ai_data', JSON.stringify(data.sortedData, null, 2));
    console.log(`Item with ID ${id} deleted successfully.`);
}

// eslint-disable-next-line
function getItemBasedOnID(data: any, id: number): unknown | undefined {
    let searchableData
    if (data.sortedData !== undefined) {
        searchableData = data.sortedData;
    } else {
        searchableData = data;
    }

    // eslint-disable-next-line
    function _getItemBasedOnID(array: any[], id: number) {
        if (!Array.isArray(array)) return _getItemBasedOnID(Object.values(array), id);
        for (const item of array) {
            if (item.id === id) {
                return item;
            }
            if (item.attached_items && Array.isArray(item.attached_items)) {
                // eslint-disable-next-line
                const found: any = _getItemBasedOnID(item.attached_items, id);
                if (found) {
                    return found;
                }
            }
        }
    }

    const foundItem = _getItemBasedOnID(searchableData, id);
    if (foundItem) {
        return foundItem;
    } else {
        console.warn(`Item with ID ${id} not found in data.`);
        return undefined;
    }
}
// eslint-disable-next-line
function getParentBasedOnID(data: any, id: number): unknown | undefined {
    let searchableData
    if (data.sortedData !== undefined) {
        searchableData = data.sortedData;
    } else if (data.attached_items !== undefined) {
        searchableData = data.attached_items;
    } else {
        // If data is not in the expected format, we assume it's already a flat structure
        searchableData = data;
    }

    // eslint-disable-next-line
    function _getParentBasedOnID(array: any[] | { id?: number }, id: number) {
        if (!Array.isArray(array) && array.id && array.id === id) {
            return array; // If the array itself has the id, return it
        }
        if (!Array.isArray(array)) return _getParentBasedOnID(Object.values(array), id);
        for (const item of array) {
            if (item.id === id) {
                return array;
            }
            if (item.attached_items && Array.isArray(item.attached_items)) {
                // eslint-disable-next-line
                const found: any = _getParentBasedOnID(item.attached_items, id);
                if (found) {
                    return found;
                }
            }
        }
    }

    const foundItem = _getParentBasedOnID(searchableData, id);
    if (foundItem) {
        return foundItem;
    } else {
        console.warn(`Item with ID ${id} not found in data.`);
        return undefined;
    }
}