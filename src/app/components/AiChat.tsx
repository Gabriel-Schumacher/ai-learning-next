import { ChatResponse, Conversation } from "../../lib/types/types";
import TextArea from "./TextArea";
import {useEffect, useState, useContext} from "react";
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
import { AiDataProviderContext } from "./AiContextProvider/AiDataProvider";
import { LocalStorageContextProvider } from "../context_providers/local_storage/LocalStorageProvider";
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('html', javascript); // Use JavaScript highlighting for HTML
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

// AI STUFF END FROM TESTCHAT
const AiChat: React.FC = () => {

    const [textAreaValue, setTextAreaValue] = useState<string>("");
    const [prevConversationObjForDisplay, setPrevConversationObjForDisplay] = useState<Conversation | null>(null);

    const context = useContext(AiDataProviderContext);
    if (!context) {
        throw new Error("AiDataProviderContext must be used within a AiDataProvider");
    }
    const { data, dispatch } = context;

    const localContext = useContext(LocalStorageContextProvider)
        if (!localContext) {
            throw new Error(
                "LocalStorageContextProvider must be used within a LocalStorageProvider"
            );
        }
        const { local_dispatch } = localContext;

    // AI RESPONSE STUFF START
    const readableStream = useReadableStream();
    const [aiResponseText, setAiResponseText] = useState('');

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
            // Prevent default behavior for Enter key
            e.preventDefault(); 
            // If we're already getting a response, don't let the user send a message.
            if (readableStream.loading) return; 
            // If the text area is empty, don't send a message.
            if (textAreaValue.trim() === "") return; 
            
            /** CLIENT STUFF */
            const newResponse: ChatResponse = {
                body: textAreaValue,
                isAiResponse: false,
                type: 'response', // Need to figure out how to figure out the type of response.
                id: -1,
                time: new Date(), // Assigns a Date object directly
            };
            dispatch({ type: "ADD_RESPONSE", payload: newResponse });
            local_dispatch({ type: "SAVE", payload: newResponse });
            setTextAreaValue(""); 

            /** SERVER STUFF */
            // Send the text to the server and attempt to get a response.
            // The readable stream isn't handled here, this is just sending the info and handeling the final result.
            // The readable stream is handled in the useReadableStream hook component.
            try {
                // Convert the chat history to what openAI wants to receive.
                if (data.currentConversation === undefined) return;
                type aiChatsType = {
                    role: 'user' | 'assistant';
                    content: string;
                };
                // Casting it as a conversation because this page should only show when it's a conversation and not a quiz.
                const chatHistoryAiSubmission: aiChatsType[] = (data.currentConversation as Conversation).responses.map((message: ChatResponse) => {
                    return {
                        role: message.isAiResponse ? 'assistant' : 'user',
                        content: message.body,
                    };
                });
                // Since react handles dispatches after the funciton is done, we need to add the new response to the chat history. If we don't, the second to last response will be the one that is sent to the server.
                chatHistoryAiSubmission.push({
                    role: 'user',
                    content: newResponse.body,
                });

                const answer = readableStream.request(
                    new Request('/api/chat', {
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
    
                const parsedAnswer = await MARKED.parse(answerText);
                const purifiedText = DOMPurify.sanitize(parsedAnswer)
                    .replace(/<script>/g, '&lt;script&gt;')
                    .replace(/<\/script>/g, '&lt;/script&gt;');
    
                const newAiChatResponse: ChatResponse = {
                    body: purifiedText,
                    isAiResponse: true,
                    type: 'response', // Need to figure out how to figure out the type of response.
                    id: -1,
                    time: new Date(), // Assigns a Date object directly
                };

                // Use functional update again to avoid stale state
                dispatch({ type: "ADD_RESPONSE", payload: newAiChatResponse });
                local_dispatch({ type: "SAVE", payload: newAiChatResponse });
                    //setPrevConversationObjForDisplay(updatedConversationObjForDisplay);
    
            } catch (e) {
                console.error('Error in handleEnterPress, SERVER STUFF:', e);
            }
        }
    }

    const removeFromHistoryHandler = (id: number) => {
        // Passes it up so that the component that handles the parent of ConversationObjForDisplay can remove it from the history and cause a rerender.
       dispatch({ type: "REMOVE_RESPONSE", payload: id });
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            if (data.currentConversation && prevConversationObjForDisplay !== data.currentConversation) {
                setPrevConversationObjForDisplay(data.currentConversation as Conversation);
            }
        }, 0);

        return () => clearTimeout(timer);
    }, [prevConversationObjForDisplay, data.currentConversation]);

    // FUNCTIONAL END

    // Need an attachment function that will pass up to the parent.

    return (
        <div className="w-full h-full grid place-items-center grid-cols-1 place-self-center">
            <div className="w-full grid grid-rows-[1fr_auto] gap-4 h-full">
                {/* Ai Chat Area */}
                {/* Response Classes are done here so that tailwind actually works */}
                <div className="chat overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-surface-400 scrollbar-track-surface-200 dark:scrollbar-thumb-surface-700 dark:scrollbar-track-surface-800">
                    {/* Loading Icon */}
                    {(data.loading || !data.currentConversation) && <div className="w-full h-full grid place-items-center"><LoadingIcon /></div>}

                    {/* If there is no chat history, show a message */}
                    {!data.loading && !data.currentConversation && (
                        <div className="w-full h-full grid place-items-center">
                            <p className="text-surface-900 dark:text-surface-50">No chat history available.</p>
                        </div>
                    )}

                    {/* Chat History */}
                    {!data.loading && data.currentConversation && (
                        <>
                        {data.currentConversation.responses?.map((response, index) => {
                            return (
                                <Response key={index} chatResponse={response as ChatResponse} removeFromHistory={() => removeFromHistoryHandler(index)} />
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
                <TextArea handleEnterPress={handleEnterPress} setTextAreaValue={setTextAreaValue} textAreaValue={textAreaValue} />

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
