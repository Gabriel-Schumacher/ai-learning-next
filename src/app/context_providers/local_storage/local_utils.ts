import { Folder, Conversation, ChatResponse } from '../../../lib/types/types';

export function getLocalStorageData(): string | null {
    try {
        const data = localStorage.getItem('user_info_ai_data');
        return data ? data : null;
    } catch (error) {
        console.error("Error accessing localStorage:", error);
        return null;
    }
}

export function convertToSortedJson(data: string): string | undefined {
    try {
        const parsedData = JSON.parse(data);
        return JSON.stringify(parsedData, null, 2);
    } catch (error) {
        console.error("Error parsing JSON data:", error);
        return undefined;
    }
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
            type: "text",
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

        function generateUniqueID(): number {
            let id;
            do {
                id = Math.floor(Math.random() * 100000) + 1; // Generate random ID
            } while (usedIDs.has(id)); // Ensure ID is unique
            usedIDs.add(id);
            return id;
        }

        function assignIDsRecursively(folder: Folder): Folder {
            folder.id = generateUniqueID();
            folder.attached_items = folder.attached_items.map((item) => {
                item.id = generateUniqueID();
                if (item.responses && item.responses.length > 0) {
                    item.responses = item.responses
                        .filter((response): response is ChatResponse => 'type' in response && 'time' in response && 'body' in response)
                        .map((response) => {
                            response.id = generateUniqueID();
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
    const folders: Folder[] = Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => {
        const folder = generateRandomFolder();
        folder.attached_items = Array.from({ length: Math.floor(Math.random() * 4) + 2 }, () => {
            const conversation = generateRandomConversation();
            conversation.responses = Array.from({ length: generateRandomAmountOfAttachedItemsOrResponses(5) }, () =>
                generateRandomResponse()
            );
            return conversation;
        });
        return folder;
    });

    return giveRandomIDsToAllData(folders);

}