import * as Types from "@/lib/types/types_new";
/* eslint-disable @typescript-eslint/no-explicit-any */

// Utility Functions used across the data context utility functions.

export function newId(idSet: Set<number> | number[]): number {
    let newId = Date.now(); // Using timestamp as a unique ID for simplicity
    if (Array.isArray(idSet)) {
        idSet = new Set(idSet); // Convert array to Set for easier ID management
    }
    while (idSet.has(newId)) {
        newId++; // Increment until we find a unique ID
    }
    idSet.add(newId);
    return newId;
}

export function checkItemQuestions(Question: Types.QuestionContentItem): boolean {
    /**
     * Checks the Question Item to make sure that it has the valid data it needs.
     */

    function _checkAttributes(Question: Types.QuestionContentItem): boolean {
        return typeof Question === 'object' &&
            typeof Question.items === 'object' &&
            Question.items !== null &&
            'question' in Question.items &&
            typeof Question.items.question === 'string' &&
            'answers' in Question.items &&
            Array.isArray(Question.items.answers) &&
            Question.items.answers.every((answer:string) => typeof answer === 'string') &&
            'correctAnswer' in Question.items &&
            typeof Question.items.correctAnswer === 'string';
    }

    return _checkAttributes(Question) ? true : false;

}

//
// Functions to create various data structures
//

export function createFolder(idSet: Set<number> | number[], name: string, createdAt: Date, files?: Types.BaseDataFile[]): Types.FolderStructure {
    return {
        id: newId(idSet),
        name,
        type: "folder",
        createdAt,
        files: files || []
    };
}

export function createFile(idSet: Set<number> | number[], type: Types.DataFileTypes, title: string, content: any[] = []): Types.BaseDataFile {
    const date = new Date();
    return {
        id: newId(idSet),
        type,
        title,
        createdAt: date,
        updatedAt: date,
        content,
    };
}

export function createConversation(idSet: Set<number> | number[], title: string, content: any[] = []): Types.BaseDataFile {
    return createFile(idSet, "conversation", title, content);
}

export function createQuiz(idSet: Set<number> | number[], title: string, content: any[] = []): Types.BaseDataFile {
    return createFile(idSet, "quiz", title, content);
}

export function createTextContentItem(idSet: Set<number> | number[], text: string, isAiResponse: boolean = false): Types.TextContentItem {
    return {
        id: newId(idSet),
        type: "text",
        items: text,
        createdAt: new Date(),
        isAiResponse,
    };
}
export function createQuestionContentItem(idSet: Set<number> | number[], items: Types.QuestionItemsType): Types.QuestionContentItem {
    return {
        id: newId(idSet),
        type: "question",
        items: items,
        createdAt: new Date(),
    };
}
export function createQuestionItem(question: string, answers: string[], correctAnswer: string): Types.QuestionItemsType {
    return {
        question,
        answers,
        correctAnswer,
        selectedAnswer: undefined, // Initially no answer is selected
        isCorrect: undefined, // Initially we don't know if the answer is correct
    };
}

type GetParentByIdReturnType = Types.FolderStructure | Types.BaseDataFile | Types.BaseContentItem;
export function getParentByItemId(folders: Types.FolderStructure[], id: number): GetParentByIdReturnType | null {

    function _getParentByItemId(parent: any, items: Types.FolderStructure[] | GetParentByIdReturnType, id:number) : any | null {

        // Check if items is an array of objects (e.g., [{}, {}, {}])
        if (Array.isArray(items) && items.every(item => typeof item === 'object' && item !== null)) {
            for (const obj of items as Types.FolderStructure[]) {
            const [foundParent, found] = _getParentByItemId(parent, obj as Types.FolderStructure, id);
            if (found) return foundParent;
            }
        }

        // if 'items' is a FolderStructureRoot... (state.sortedData)
        if ('folders' in items && Array.isArray((items as any).folders)) {
            // You can safely access items.files here
            for (const file of (items as unknown as Types.FolderStructure).files) {
                const [foundParent, found] = _getParentByItemId(items, file, id);
                if (found) return foundParent;
            }
        }

        // If 'items' is a FolderStructure... (state.sortedData.folders[i])
        if ('files' in items && Array.isArray((items as any).files)) {
            if ('id' in items && items.id === id) {
                return [parent, items]; // Return the file if it matches the id
            } else {
                for (const file of (items as unknown as Types.FolderStructure).files) {
                    const [foundParent, found] = _getParentByItemId(items, file, id);
                    if (found) return [foundParent, found];
                }
            }
        }

        // if 'items' is a BaseDataFile... (state.sortedData.folders[i].files[i])
        if ('content' in items && Array.isArray((items as any).content)) {
            if ('id' in items && items.id === id) {
                return [parent, items]; // Return the file if it matches the id
            } else {
                for (const contentItem of (items as unknown as Types.BaseDataFile).content) {
                    const [foundParent, found] = _getParentByItemId(items, contentItem, id);
                    if (found) return [foundParent, found];
                }
            }
        }

        // if 'items' is a BaseContentItem... (state.sortedData.folders[i].files[i].content[i])
        if ('items' in items && Array.isArray((items as any).items)) {
            if ('id' in items && items.id === id) {
                return items; // Return the file if it matches the id
            } else {
                // Unlike the others, we need to check if items is a string or an array. (since this type includes the QuestionContentItem type)
                if (typeof items.items === 'string') {
                    // If it's a string, we can't dig deeper, so we return null.
                    return null;
                } else if (Array.isArray(items.items)) {
                    // If it's an array, we can dig deeper.
                    /**
                     * Not in use since questions don't actually have ids. (we can add them if we want.)
                    for (const contentItem of items.items) {
                        const [foundParent, found] = _getParentByItemId(items.items, contentItem, id);
                        if (found) return [foundParent, found];
                    }
                    */
                   return null; // Since we don't have ids for questions, we can't find a parent for them.
                }
            }
        }

        return null;
    }
    return _getParentByItemId(null, folders, id);
}

type GetItemByIdReturnType = Types.FolderStructure | Types.BaseDataFile | Types.BaseContentItem;
export function getItemById(folders: Types.FolderStructure[], id: number): GetItemByIdReturnType | null {
    function _getItemById(items: Types.FolderStructure[] | GetItemByIdReturnType, id:number) : GetItemByIdReturnType | null {

         // Check if items is an array of objects (e.g., [{}, {}, {}])
        if (Array.isArray(items) && items.every(item => typeof item === 'object' && item !== null)) {
            for (const obj of items as Types.FolderStructure[]) {
            const found = _getItemById(obj as Types.FolderStructure, id);
            if (found) return found;
            }
        }

        // if 'items' is a FolderStructureRoot... (state.sortedData)
        if ('folders' in items && Array.isArray((items as any).folders)) {
            // You can safely access items.files here
            for (const file of (items as unknown as Types.FolderStructure).files) {
                const found = _getItemById(file, id);
                if (found) return found;
            }
        }

        // If 'items' is a FolderStructure... (state.sortedData.folders[i])
        if ('files' in items && Array.isArray((items as any).files)) {
            if ('id' in items && items.id === id) {
                return items; // Return the file if it matches the id
            } else {
                for (const file of (items as unknown as Types.FolderStructure).files) {
                    const found = _getItemById(file, id);
                    if (found) return found;
                }
            }
        }

        // if 'items' is a BaseDataFile... (state.sortedData.folders[i].files[i])
        if ('content' in items && Array.isArray((items as any).content)) {
            if ('id' in items && items.id === id) {
                return items; // Return the file if it matches the id
            } else {
                for (const contentItem of (items as unknown as Types.BaseDataFile).content) {
                    const found = _getItemById(contentItem, id);
                    if (found) return found;
                }
            }
        }

        // if 'items' is a BaseContentItem... (state.sortedData.folders[i].files[i].content[i])
        if ('items' in items && Array.isArray((items as any).items)) {
            if ('id' in items && items.id === id) {
                return items; // Return the file if it matches the id
            } else {
                // Unlike the others, we need to check if items is a string or an array. (since this type includes the QuestionContentItem type)
                if (typeof items.items === 'string') {
                    // If it's a string, we can't dig deeper, so we return null.
                    return null;
                } else if (Array.isArray(items.items)) {
                    // If it's an array, we COULD dig deeper. But we don't since they don't currently have ids.
                    /**
                    for (const contentItem of items.items) {
                        const found = _getItemById(contentItem, id);
                        if (found) return found;
                    }
                    */
                    return null; // Since we don't have ids for questions, we can't find them.
                }
            }
        }

        return null;
    }
    return _getItemById(folders, id);
}


//
// Function having to do with data loading and saving.
//

export function generateFakeFolderStructureRoot(): Types.FolderStructureRoot {
    // NOT IMPLEMENTED

    // IDs Property 
    const idSet = new Set<number>();

    // Folders Property
    /** Generate a random amount of folders, from 1-4  */
    const folderCount = Math.floor(Math.random() * 4) + 1; // 1 to 4 folders
    const foldersFiles = Array.from({ length: folderCount }, (_, i) =>
        createFolder(idSet, `Folder ${i + 1}`, new Date())
    );
    /** Generate a random amount of files to put into the folders, from 1-12  */
    const fileCount = Math.floor(Math.random() * 12) + 1; // 1 to 12 files
    const splitAmount = Math.floor(fileCount / 2); // Used to generate the amount of conversations
    const remainingAmount = fileCount - splitAmount; // Used to generate the amount of quizzes

    /** Creates an array of conversations */
    const conversations = Array.from({ length: splitAmount }, (_, i) => {
        const content: Types.TextContentItem[] = Array.from({ length: 3 }, (_, j) =>
            createTextContentItem(idSet, `Conversation response ${j + 1} for conversation ${i + 1}`, j % 2 === 0)
        );
        return createConversation(idSet, `Conversation ${i + 1}`, content);
    });
    /** Creates an array of quizzes */
    const quizzes = Array.from({ length: remainingAmount }, (_, i) => {
        const content: Types.QuestionContentItem[] = Array.from({ length: 3 }, (_, j) =>
            createQuestionContentItem(idSet, 
                createQuestionItem(`Quiz ${i + 1} Question ${j + 1}`, [`Answer A`, `Answer B`, `Answer C`], `Answer A`)
            )
        );
        return createQuiz(idSet, `Quiz ${i + 1}`, content);
    });
    /** Combines the conversations and quizzes (the files) and then evenly distributes them among the folders */
    const allFiles = [...conversations, ...quizzes];
    foldersFiles.forEach((folder, idx) => {
        folder.files = allFiles.filter((_, fileIdx) => fileIdx % folderCount === idx);
    });

    // We then create the root structure and return it.
    const ROOT : Types.FolderStructureRoot = {
        ids: Array.from(idSet),
        folders: foldersFiles,
    };
    return ROOT;
        
}

export function getLocalStorageData(): string | null {
    const data = localStorage.getItem("user_saved_data_01");
    return data ? data : null;
}

export function convertToSortedJson(rawData: string | null): Types.FolderStructureRoot | undefined {
    if (!rawData) return undefined;
    const parsedData = JSON.parse(rawData);
    if (parsedData && typeof parsedData === "object") {
        // Assuming the parsed data is in the correct format
        return parsedData as Types.FolderStructureRoot;
    }
    return undefined;
}

export function saveData(data: Types.FolderStructureRoot): void {
    const dataString = JSON.stringify(data, null, 2);
    localStorage.setItem("user_saved_data_01", dataString);
}