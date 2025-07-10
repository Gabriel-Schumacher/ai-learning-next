import * as Types from "@/lib/types/types_new";


// Utility Functions used across the data context utility functions.

export function newId(idSet: Set<number>): number {
    let newId = Date.now(); // Using timestamp as a unique ID for simplicity
    while (idSet.has(newId)) {
        newId++; // Increment until we find a unique ID
    }
    idSet.add(newId);
    return newId;
}

export function checkItemQuestions(items: Types.QuestionItemsType[]): Types.QuestionItemsType[] {
    // The checkItemQuestions function checks if every object in the array is of type QuestionItemsType, or a valid object that can be converted to it. In cases where the items are not valid, it will throw out that object and continue with the rest. (Meaning if there was a random string or boolean, for example, the returned array would not contain those items.

    return items.filter(item => {
        // Check if the item is an object and has the required properties
        return typeof item === 'object' &&
            item !== null &&
            'question' in item &&
            typeof item.question === 'string' &&
            'answers' in item &&
            Array.isArray(item.answers) &&
            item.answers.every(answer => typeof answer === 'string') &&
            'correctAnswer' in item && 
            typeof item.correctAnswer === 'string';
    }) as Types.QuestionItemsType[];

}

//
// Functions to create various data structures
//

export function createFolder(idSet: Set<number>, name: string, createdAt: Date, files?: Types.BaseDataFile[]): Types.FolderStructure {
    return {
        id: newId(idSet),
        name,
        type: "folder",
        createdAt,
        files: files || []
    };
}

export function createFile(idSet: Set<number>, type: Types.DataFileTypes, title: string, content: any[] = []): Types.BaseDataFile {
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

export function createConversation(idSet: Set<number>, title: string, content: any[] = []): Types.BaseDataFile {
    return createFile(idSet, "conversation", title, content);
}

export function createQuiz(idSet: Set<number>, title: string, content: any[] = []): Types.BaseDataFile {
    return createFile(idSet, "quiz", title, content);
}

export function createTextContentItem(idSet: Set<number>, text: string, isAiResponse: boolean = false): Types.TextContentItem {
    return {
        id: newId(idSet),
        type: "text",
        items: text,
        createdAt: new Date(),
        isAiResponse,
    };
}
export function createQuestionContentItem(idSet: Set<number>, items: Types.QuestionItemsType[]): Types.QuestionContentItem {
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
            createQuestionContentItem(idSet, [
                createQuestionItem(`Quiz ${i + 1} Question ${j + 1}`, [`Answer A`, `Answer B`, `Answer C`], `Answer A`)
            ])
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
        ids: idSet,
        folders: foldersFiles,
    };
    return ROOT;
        
}

export function getLocalStorageData(): string | null {
    const data = localStorage.getItem("user_info_ai_data");
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
    localStorage.setItem("user_info_ai_data", dataString);
}