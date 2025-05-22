import { ChatResponse, Conversation } from "../types/client-server-types";
import {Arrow} from "./IconsIMGSVG";
import {useEffect, useState} from "react";
import LoadingIcon from "./LoadingIcon";
import { Response } from "./Response";

// AI STUFF START FROM TESTCHAT
import { useReadableStream } from "../components/useReadableStream";
import DOMPurify from 'dompurify';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import css from 'highlight.js/lib/languages/css';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('css', css);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('csharp', csharp);

const MARKED = new Marked(
    markedHighlight({
        langPrefix: 'hljs language-',
        highlight: (code, lang) => {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext'
            return hljs.highlight(code, { language }).value
        }
    })
)

// ** Helper Functions **/
function SanitizeText(text: string): string {
    const sanitizedText = DOMPurify.sanitize(text, {
        FORBID_TAGS: ['script', 'img', 'a'],
    });
    const thinkRegex = /<think>[\s\S]*?<\/think>/g;
    return sanitizedText.replace(thinkRegex, '');
}
// AI STUFF END FROM TESTCHAT

interface AiChatProps {
    loading: boolean;
    setLoading: (loading: boolean) => void;
    chatHistory: Conversation;
    addToHistory: (response: ChatResponse) => Conversation;
    removeFromHistory: (index: number) => void;
}
/**
 * 
 * @param loading - Whether the component is loading or not
 * @param chatHistory - Array of chat history responses
 * @param addToHistory - Function to add a response to the chat history
 * @param removeFromHistory - Function to remove a response from the chat history
 * 
 * @returns AiChat Component
 */
const AiChat: React.FC<AiChatProps> = ({ loading, setLoading, chatHistory, addToHistory, removeFromHistory }) => {

    const [textAreaValue, setTextAreaValue] = useState<string>("");
    const [prevConversationObjForDisplay, setPrevConversationObjForDisplay] = useState<Conversation | null>(null);
    const [addingMessage, setAddingMessage] = useState<boolean>(false);

    // AI RESPONSE STUFF START
    const readableStream = useReadableStream();
    let [aiResponseText, setAiResponseText] = useState('');

    // Set the ai response text, and make sure to sanitize it.
    useEffect(() => {
        if (readableStream.text !== '') {
            (async () => {
                // Strip <think> tags from the response text
                // const cleanedText = stripThinkTags(response.text);
                // Parse the cleaned text as Markdown
                const parsedText = await MARKED.parse(readableStream.text);
                // Sanitize the parsed HTML
                setAiResponseText(DOMPurify.sanitize(parsedText)
                    .replace(/<script>/g, '&lt;script&gt;')
                    .replace(/<\/script>/g, '&lt;/script&gt;'));
                // setResponseText(parsedText);
            })();
        }
    }, [readableStream.text]);
    // AI RESPONSE STUFF END


    // FUNCTIONAL START

    const handleEnterPress = async (e: React.KeyboardEvent<HTMLTextAreaElement> | React.MouseEvent<HTMLButtonElement>) => {
        if (
            (e.nativeEvent instanceof KeyboardEvent && e.nativeEvent.key === "Enter" && !e.nativeEvent.shiftKey) || e.nativeEvent instanceof MouseEvent
        ) {
            e.preventDefault(); // Prevent default behavior for Enter key
            if (readableStream.loading) return; // If we're already getting a response, don't let the user send a message.
            if (textAreaValue.trim() === "") return; // If the text area is empty, don't send a message.
            
            /** CLIENT STUFF */
            // create user response object
            let newUserChatResponse: ChatResponse = {
                body: textAreaValue,
                isAiResponse: false,
                type: 'text',
                id: -1,
                time: new Date(), // Assigns a Date object directly
            };
            // Add the user response to the conversation
            const updatedConversationObjForDisplay: Conversation = addToHistory(newUserChatResponse);
            setPrevConversationObjForDisplay(updatedConversationObjForDisplay);
            // Clear the text area after submission
            setTextAreaValue(""); 

            /** SERVER STUFF */
            // Send the text to the server and attempt to get a response.
            // The readable stream isn't handled here, this is just sending the info and handeling the final result.
            // The readable stream is handled in the useReadableStream hook component.
            try {
                // Convert the chat history to what openAI wants to receive.
                type aiChatsType = {
                    role: 'user' | 'assistant';
                    content: string;
                };
                const chatHistoryAiSubmission: aiChatsType[] = chatHistory.messages.map((message) => {
                    return {
                        role: message.isAiResponse ? 'assistant' : 'user',
                        content: message.body,
                    };
                });


                const answer = readableStream.request(
                    new Request('http://localhost:3001/api/chat', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            chats: chatHistoryAiSubmission,
                            systemPrompt: 'teacher',
                            subject: 'General',
                            deepSeek: false,
                        }),
                    })
                );

                const answerText = (await answer) as string;
                console.log('Server response:', answerText);
    
                const parsedAnswer = await MARKED.parse(answerText);
                const purifiedText = DOMPurify.sanitize(parsedAnswer)
                    .replace(/<script>/g, '&lt;script&gt;')
                    .replace(/<\/script>/g, '&lt;/script&gt;');
    
                const newAiChatResponse: ChatResponse = {
                    body: purifiedText,
                    isAiResponse: true,
                    type: 'text', // Need to figure out how to figure out the type of response.
                    id: -1,
                    time: new Date(), // Assigns a Date object directly
                };

                // Use functional update again to avoid stale state
                const updatedConversationObjForDisplay: Conversation = addToHistory(newAiChatResponse);
                setPrevConversationObjForDisplay(updatedConversationObjForDisplay);
    
            } catch (e) {
                console.error('Error in handleEnterPress, SERVER STUFF:', e);
            }
        }
    }

    const removeFromHistoryHandler = (index: number) => {
        // Passes it up so that the component that handles the parent of ConversationObjForDisplay can remove it from the history and cause a rerender.
        removeFromHistory(index);
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            if (prevConversationObjForDisplay !== chatHistory) {
                setLoading(false);
                setPrevConversationObjForDisplay(chatHistory);
            }
        }, 0);
        setAddingMessage(false);

        return () => clearTimeout(timer);
    }, [chatHistory, prevConversationObjForDisplay, setLoading]);

    // FUNCTIONAL END

    // Need an attachment function that will pass up to the parent.

    return (
        <div className="w-full h-full grid place-items-center grid-cols-1 place-self-center">
            <div className="w-full grid grid-rows-[1fr_auto] gap-4 h-full">
                {/* Ai Chat Area */}
                {/* Response Classes are done here so that tailwind actually works */}
                <div className="chat overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-surface-400 scrollbar-track-surface-200 dark:scrollbar-thumb-surface-700 dark:scrollbar-track-surface-800">
                    {/* Loading Icon */}
                    {(loading || !chatHistory) && <div className="w-full h-full grid place-items-center"><LoadingIcon /></div>}

                    {/* If there is no chat history, show a message */}
                    {!loading && !chatHistory && (
                        <div className="w-full h-full grid place-items-center">
                            <p className="text-surface-900 dark:text-surface-50">No chat history available.</p>
                        </div>
                    )}

                    {/* Chat History */}
                    {!loading && chatHistory && (
                        <>
                        {chatHistory.messages?.map((response, index) => {
                            return (
                                <Response key={index} chatResponse={response} removeFromHistory={() => removeFromHistoryHandler(index)} />
                            );})
                        }
                        {readableStream.loading && (
                            readableStream.text === '' ? (
                                <div className="AIRESPONSE"><LoadingIcon /></div>
                            ) : (
                                <div className="AIRESPONSE" dangerouslySetInnerHTML={{ __html: aiResponseText }}></div>
                            )
                        )}
                        </>
                    )}

                </div>
                {/* Text Area */}
                <div className="w-full p-2 card border-black border-solid bg-surface-200 dark:bg-surface-800 min-h-24 grid grid-rows-[1fr_min-content] gap-2 relative">
                    <textarea 
                        className="all-unset h-full w-full text-surface-950 placeholder:text-surface-900 dark:text-surface-50 dark:placeholder:text-surface-200 cursor-text" 
                        placeholder="Type your message here..."
                        value={textAreaValue}
                        onChange={(e) => setTextAreaValue(e.target.value)}
                        onKeyDown={handleEnterPress} 
                    />

                    <div className="flex w-full justify-between items-center gap-2">
                        <button className="btn lg">+ Attach</button>
                        <div className="flex flex-row items-center gap-2">
                            <span className="text-sm text-surface-900">shift+enter for a new line</span>
                            <button className="btn rounded-full" onClick={handleEnterPress}>
                                <Arrow width="w-3" background={false} special={true} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default AiChat;

/**
 * AiChat Component Works By:
 * User Message is sent to page.tsx. The page adds the message to the conversation.
 * NO RESPONSE IS CURRENTLY GIVEN.
 * 
 */
