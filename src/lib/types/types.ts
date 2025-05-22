// TYPES IN HERE SHOULD MATCH THE TYPES IN THE SERVER SIDE. FAILING TO TO DO SO WILL CAUSE MISMATCHES AND THUS ERRORS
// MISMATCHES ON PURPOSE SHOULD INDICATE AS SUCH


// CONVERSATIONS
export interface ChatResponse {
    id: number;
    type: "text"; // This is used to determine the type of response. It can be a quiz, a file, etc.
    time: Date; // This is used to sort the responses in the conversation.
    body: string; // This is the body of the response. It contains the message, header, and data.
    isAiResponse?: boolean; // If true, the response will be styled as an AI response.
}
export interface Conversation {
    id: number;
    type: "conversation";
    title: string;
    current?: boolean;
    responses: ChatResponse[];
}


// QUIZZES
export interface QuizQuestion {
    id: number;
    question: string;
    answers: string[];
    correct_answer: string;
    selected_answer?: string; // This is used to store the answer selected by the user.
    is_correct?: boolean; // This is used to determine if the answer is correct or not.
}
export interface Quiz {
    id: number;
    type: "quiz"; // This is used to determine the type of response. It can be a quiz, a file, etc.
    responses: QuizQuestion[];
    title: string;
    current?: boolean;
}
// FOLDERS
// Folders are used to group conversations together. They are not used for anything else at the moment, but may be in the future.
export interface Folder {
    id: number;
    name: string;
    current?: boolean;
    attached_items: (Conversation | Quiz)[]; // This is used to store the conversations and quizzes attached to the folder.
}

export interface ResponseBody {
    msg: string;
    header?: string;
    data?: object;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export interface MessageBody {
    chats: Message[];
    systemPrompt: string;
    subject: string;
    deepSeek: boolean;
}