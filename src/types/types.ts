// RESPONSES
// Responses are used to store the responses from both the user and the AI. It also can contain the type (is it a  quiz? Was there an attached file, if so, what file? etc. )
// and the time it was sent. The time is used to sort the responses in the conversation.
export interface ChatResponse {
    id: number;
    type: "quiz" | "text" | "file"; // This is used to determine the type of response. It can be a quiz, a file, etc.
    time: Date; // This is used to sort the responses in the conversation.
    body: string; // This is the body of the response. It contains the message, header, and data.
    isAiResponse?: boolean; // If true, the response will be styled as an AI response.
}
export type ChatResponses = ChatResponse[] | [];


// CONVERSATIONS
// Conversations are used to group messages together. They are not used for anything else at the moment, but may be in the future.
export interface Conversation {
    id: number;
    title: string;
    messages?: ChatResponses;
}
export type Conversations = Conversation[] | [];

// FOLDERS
// Folders are used to group conversations together. They are not used for anything else at the moment, but may be in the future.
export interface Folder {
    id: number;
    name: string;
    attached_conversations: Conversations;
}
export type Folders = Folder[] | [];

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