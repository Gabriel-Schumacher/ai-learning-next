import * as Types from "@/lib/types/types_new";
import TextArea from "./TextArea";
import {useCallback, useEffect, useState, useContext} from "react";
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

import { DataContextProvider } from "@/app/context_providers/data_context/DataProvider";
import { text } from "stream/consumers";

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

type AiChatProps = {
    initialMessages?: { role: 'user' | 'assistant', content: string }[];
    customEndpoint?: string;
    customSystemPrompt?: string;
};

const AiChat: React.FC<AiChatProps> = ({
    initialMessages,
    customEndpoint,
    customSystemPrompt
}) => {

    const [textAreaValue, setTextAreaValue] = useState<string>("");
    const [currentConversation, setCurrentConversation] = useState<Types.ConversationFile | null>(null);
    const [prevConversationObjForDisplay, setPrevConversationObjForDisplay] = useState<Types.ConversationFile | null>(null);

    const context = useContext(DataContextProvider);
    if (!context) {
        throw new Error("DataContextProvider must be used within a DataContextProvider");
    }
    const { data, dispatch } = context;

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

    // // If initialMessages is provided, initialize responses with them
    // useEffect(() => {
    //     if (initialMessages && initialMessages.length && data.currentConversation) {
    //         // Only add if not already present
    //         if (data.currentConversation.responses.length === 0) {
    //             initialMessages.forEach(msg => {
    //                 dispatch({
    //                     type: "ADD_RESPONSE",
    //                     payload: {
    //                         body: msg.content,
    //                         isAiResponse: msg.role === 'assistant',
    //                         type: 'response',
    //                         id: -1,
    //                         time: new Date(),
    //                     }
    //                 });
    //             });
    //         }
    //     }
    // // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [initialMessages, data.currentConversation]);

    // FUNCTIONAL START

    const handleAiMessage = useCallback(async (MESSAGE: string) => {

        /** SERVER STUFF */
        // Send the text to the server and attempt to get a response.
        // The readable stream isn't handled here, this is just sending the info and handeling the final result.
        // The readable stream is handled in the useReadableStream hook component.
        try {
            // Convert the chat history to what openAI wants to receive.
            if (data.sortedData?.currentFileId === undefined) return;
            type aiChatsType = {
                role: 'user' | 'assistant';
                content: string | Types.QuestionItemsType[];
            };
            // Casting it as a conversation because this page should only show when it's a conversation and not a quiz.
            const currentConversation = data.sortedData.folders.flatMap((folder: Types.FolderStructure) => folder.files)
                .find((file: Types.BaseDataFile) => file.id === data.sortedData?.currentFileId) as Types.ConversationFile | undefined;
            const chatHistoryAiSubmission: aiChatsType[] | [] = currentConversation?.content.map((message) => {
                if ('isAiResponse' in message) {
                    // TextContentItem
                    return {
                        role: message.isAiResponse ? 'assistant' : 'user',
                        content: typeof message.items === 'string'
                            ? message.items : "", // Ensure content is a string
                    };
                } else {
                    // QuestionContentItem fallback
                    return {
                        role: 'user',
                        content: '', // or handle appropriately for your use case
                    };
                }
            }) || [];
            // Since react handles dispatches after the funciton is done, we need to add the new response to the chat history. If we don't, the second to last response will be the one that is sent to the server.
            chatHistoryAiSubmission.push({
                role: 'user',
                content: MESSAGE,
            });

                const endpoint = customEndpoint || '/api/chat';
                const systemPrompt = customSystemPrompt || 'teacher';
                const answer = readableStream.request(
                    new Request(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            chats: chatHistoryAiSubmission,
                            systemPrompt,
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

            const newAiChatResponse: Types.TextContentItem = {
                items: purifiedText,
                isAiResponse: true,
                type: 'text', // Need to figure out how to figure out the type of response.
                id: -1,
                createdAt: new Date(), // Assigns a Date object directly
            };

            // Use functional update again to avoid stale state
            dispatch({ type: "ADD_CONTENT", payload: { type: 'text', contentItem: newAiChatResponse }});
            //setPrevConversationObjForDisplay(updatedConversationObjForDisplay);

        } catch (e) {
            console.error('Error in handleEnterPress, SERVER STUFF:', e);
        }
    }, [data.sortedData, readableStream, dispatch]);
    
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
            const newResponse: Types.TextContentItem = {
                items: textAreaValue,
                isAiResponse: false,
                type: 'text', // Need to figure out how to figure out the type of response.
                id: -1,
                createdAt: new Date(), // Assigns a Date object directly
            };
            dispatch({ type: "ADD_CONTENT", payload: { type: 'text', contentItem: newResponse } });
            setTextAreaValue("");

            handleAiMessage(textAreaValue);
        }
    }

    // If this is a conversation with one message, sent by the user, we should automatically send the message to the AI so it can respond.
    useEffect(() => {
        if (
            currentConversation &&
            currentConversation.content.length === 1 &&
            currentConversation.content[0].type === 'text' &&
            !currentConversation.content[0].isAiResponse &&
            readableStream.loading === false
            ) {
            // If the current conversation has only one message and it's from the user, send it to the AI.
            handleAiMessage(currentConversation.content[0].items as string);
        }
    }, [currentConversation, handleAiMessage]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentConversation && prevConversationObjForDisplay !== currentConversation) {
                setPrevConversationObjForDisplay(currentConversation);
            }
        }, 0);

        return () => clearTimeout(timer);
    }, [prevConversationObjForDisplay, currentConversation]);

    useEffect(() => {
        if (data.sortedData?.currentFileId !== undefined) {
            const currentConversation = data.sortedData.folders.flatMap((folder: Types.FolderStructure) => folder.files)
                .find((file: Types.BaseDataFile) => file.id === data.sortedData?.currentFileId) as Types.ConversationFile | undefined;
            setCurrentConversation(currentConversation || null);
        }
    }, [data.sortedData?.currentFileId, data.sortedData?.folders]);

    // FUNCTIONAL END

    // Need an attachment function that will pass up to the parent.

    return (
        <div className="w-full h-full grid place-items-center grid-cols-1 place-self-center">
            <div className="w-full grid grid-rows-[1fr_auto] gap-4 h-full">
                {/* Ai Chat Area */}
                {/* Response Classes are done here so that tailwind actually works */}
                <div className="chat overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-surface-400 scrollbar-track-surface-200 dark:scrollbar-thumb-surface-700 dark:scrollbar-track-surface-800">
                    {/* Loading Icon */}
                    {!currentConversation && <div className="w-full h-full grid place-items-center"><LoadingIcon /></div>}

                    {/* If there is no chat history, show a message */}
                    {!currentConversation && (
                        <div className="w-full h-full grid place-items-center">
                            <p className="text-surface-900 dark:text-surface-50">No chat history available.</p>
                        </div>
                    )}

                    {/* Chat History */}
                    { currentConversation && (
                        <>
                        {currentConversation.content?.map((response, index) => {
                            return (
                                <Response key={index} chatResponse={response as Types.TextContentItem} />
                            );
                        })}
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
