// TYPES IN HERE SHOULD MATCH THE TYPES IN THE SERVER SIDE. FAILING TO TO DO SO WILL CAUSE MISMATCHES AND THUS ERRORS
// MISMATCHES ON PURPOSE SHOULD INDICATE AS SUCH

/* eslint-disable @typescript-eslint/no-explicit-any */

// This is for the new data file system. 

//
// Folder Structure Outline and types
//

/*
    The folder structure is as follows:

    - root
        - folders
            - conversations
                - conversation1
                    - content (array of TextContentItem)
                - conversation2
                    - content (array of TextContentItem)
            - quizzes
                - quiz1
                    - content (array of QuizQuestion)
                - quiz2
                    - content (array of QuizQuestion)
            - flashcards
                - flashcard1
                    - content (array of FlashCardItem)
                - flashcard2
                    - content (array of FlashCardItem)
*/

export type PageOptions = 'HOME' | 'CHAT' | 'QUIZ' | 'DATA_CREATION' | 'ESSAY' | 'LIBRARY' | 'STUDY'; // Used to determine the current page in the application. For an example, look at FigmaNavigation.tsx

export interface FolderStructureRoot {
    ids: Set<number> | number[]; // Set of unique identifiers for the folders
    folders: FolderStructure[]; // FolderStructure, representing the folders in the root
    currentFolderId?: number; // Optional ID of the current folder, if any. This makes it much easier to figure out what folder is currently being viewed.
    currentFileId?: number; // Optional ID of the current file, if any. This makes it much easier to figure out what file is currently being viewed.
    currentPage?: PageOptions; // Optional current page number for pagination
}

export interface FolderStructure {
    id: number; // Unique identifier for the folder
    name: string; // Name of the folder
    type: 'folder'; // Type of the item, always 'folder' for folders
    createdAt: Date; // Date the folder was created
    updatedAt?: Date; // Date the folder was last updated
    files: BaseDataFile[]; // Array of any extension of BaseDataFile (can be empty)
}



//
// Data Files
//

/*
    These are items that we would expect under a folder. These is not the content of the files themselves.
*/

export const DataFileTypesList = ["conversation", "quiz", "flashcard"] as const; // This is used to determine the type of data file for error messages and types.
export type DataFileTypes = typeof DataFileTypesList[number];

// Here the T = any refers to the content type of the item. This allows for flexibility in the content type stored within each data item.
// For example, a conversation might have content of type TextContentItem, while a quiz might have content of type QuizQuestion.
// We can find the specific content type by looking at the interface that extends from BaseDataFile, such as ConversationFile or QuizFile.
export interface BaseDataFile<T = any> {
    id: number;
    type: DataFileTypes;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    content: T[];
}

// Files that extend from BaseDataFile

export interface FlashCardDeckFile extends BaseDataFile {
    type: "flashcard";
}
export interface ConversationFile extends BaseDataFile<TextContentItem | QuestionContentItem> {
    type: "conversation";
}
export interface QuizFile extends BaseDataFile<QuestionContentItem> {
    type: "quiz";
}


//
// Content of the files
//

export const ContentItemTypes = ["text", "image", "video", "audio", "question"] as const; // This is used to determine the type of content for error messages and types.
export type ContentTypes = typeof ContentItemTypes[number]; // This is used to determine the type of content.

export interface BaseContentItem {
    id: number;
    type: ContentTypes;
    items: string | QuestionItemsType; // This is the actual content, like text, image URL, video URL, etc.
    createdAt: Date; // This is used to sort the content in the conversation.
    updatedAt?: Date; // This is optional and can be used to track updates to the content.
}

// content items that extend from ContentItem

export interface TextContentItem extends BaseContentItem {
    type: "text";
    isAiResponse: boolean;
    items: string;
}

export type QuestionItemsType = {
    question: string; // The question text
    answers: string[]; // Array of possible answers
    correctAnswer: string; // The correct answer
    selectedAnswer?: string; // The answer selected by the user, if any
    isCorrect?: boolean; // Indicates if the selected answer is correct
};
export interface QuestionContentItem extends BaseContentItem {
    type: "question";
    items: QuestionItemsType;
}

export interface ImageContentItem extends BaseContentItem {
    type: "image";
}

export interface VideoContentItem extends BaseContentItem {
    type: "video";
}

export interface AudioContentItem extends BaseContentItem {
    type: "audio";
}







// I don't think I used these anywhere, but they are here for reference in case I need them in the future.
// Utility function to check if a value is a valid DataFileTypes
export function DataFileTypes(value: any): value is DataFileTypes {
    return value === "conversation" || value === "quiz" || value === "flashcard";
}

// Utility function to check if a value is a valid ContentTypes
export function ContentTypes(value: any): value is ContentTypes {
    return value === "text" || value === "image" || value === "video" || value === "audio" || value === "question";
}
// // CONVERSATIONS
// export interface ChatResponse {
//     id: number;
//     type: "response"; // This is used to determine the type of response. It can be a quiz, a file, etc.
//     time: Date; // This is used to sort the responses in the conversation.
//     body: string; // This is the body of the response. It contains the message, header, and data.
//     isAiResponse?: boolean; // If true, the response will be styled as an AI response.
// }
// export interface Conversation {
//     id: number;
//     type: "conversation";
//     title: string;
//     current?: boolean;
//     responses: ChatResponse[];
// }


// // QUIZZES
// export interface QuizQuestion {
//     id: number;
//     type: "question";
//     question: string;
//     answers: string[];
//     correct_answer: string;
//     selected_answer?: string; // This is used to store the answer selected by the user.
//     is_correct?: boolean; // This is used to determine if the answer is correct or not.
// }
// export interface Quiz {
//     id: number;
//     type: "quiz"; // This is used to determine the type of response. It can be a quiz, a file, etc.
//     responses: QuizQuestion[];
//     title: string;
//     current?: boolean;
// }
// // FOLDERS
// // Folders are used to group conversations together. They are not used for anything else at the moment, but may be in the future.
// export interface Folder {
//     id: number;
//     name: string;
//     type?: "folder";
//     current?: boolean;
//     attached_items: (Conversation | Quiz)[]; // This is used to store the conversations and quizzes attached to the folder.
// }

// export interface ResponseBody {
//     msg: string;
//     header?: string;
//     data?: object;
// }

// interface Message {
//     role: 'user' | 'assistant';
//     content: string;
// }

// export interface MessageBody {
//     chats: Message[];
//     systemPrompt: string;
//     subject: string;
//     deepSeek: boolean;
// }

// export interface CollectionBody {
//     prompt: Message[];
//     systemPrompt: string;
//     subject: string;
//     deepSeek: boolean;
// }

// export interface DataSubmitBody {
//     prompt: Message[];
//     systemPrompt: string;
//     subject: string;
//     deepSeek: boolean;
//     numberOfQuestions: number; // Ensure this matches the backend
// }

// export interface studyGuideSubmitBody {
//     studyContent: Quiz[]
// }

// // Additional type to help with handling the API response
// export interface QuizQuestionResponse {
//     id: number;
//     question: string;
//     options: string[];
//     answer: string;
// }