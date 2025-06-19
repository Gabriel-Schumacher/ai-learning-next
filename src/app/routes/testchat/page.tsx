"use client";

import { useState, useEffect, useRef } from "react";
import { useReadableStream } from '../../components/useReadableStream';
import DOMPurify from 'dompurify';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import css from 'highlight.js/lib/languages/css';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
// Add a highlight.js theme import
import 'highlight.js/styles/github.css'; // You can choose a different theme like 'atom-one-dark.css', 'monokai.css', etc.

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('css', css);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('csharp', csharp);

const marked = new Marked(
    markedHighlight({
        langPrefix: 'hljs language-',
        highlight: (code, lang) => {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext'
            return hljs.highlight(code, { language }).value
        }
    })
)


type ChatMessage = {
    role: 'user' | 'assistant';
    content: string;
};

function TestChat() {
    const response = useReadableStream();
    const [responseText, setResponseText] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Load chat history from localStorage on the client side
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedChatHistory = localStorage.getItem('chatHistory');
            if (storedChatHistory) {
                setChatHistory(JSON.parse(storedChatHistory));
            }
        }
    }, []);

    function stripThinkTags(text: string): string {
        const thinkRegex = /<think>[\s\S]*?<\/think>/g;
        return text.replace(thinkRegex, '');
    }

    useEffect(() => {
        if (response.text !== '') {
            (async () => {
                // Strip <think> tags from the response text
                // const cleanedText = stripThinkTags(response.text);
                // Parse the cleaned text as Markdown
                const parsedText = await marked.parse(response.text);
                // Sanitize the parsed HTML
                setResponseText(DOMPurify.sanitize(parsedText)
                    .replace(/<script>/g, '&lt;script&gt;')
                    .replace(/<\/script>/g, '&lt;/script&gt;'));
                // setResponseText(parsedText);
            })();
        }
    }, [response.text]); // Added dependency array to avoid infinite re-renders

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
        }
    }, [chatHistory]); // Added dependency array to avoid infinite re-renders

    function handleKeydown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            const target = event.target as HTMLTextAreaElement;
            const form = target.closest('form');
            if (form) {
                const syntheticEvent = {
                    ...event,
                    currentTarget: form,
                    preventDefault: () => event.preventDefault(),
                } as React.FormEvent<HTMLFormElement>;
                handleSubmit(syntheticEvent);
            }
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (response.loading) return;

        const formData: FormData = new FormData(event.currentTarget);
        const message = formData.get('message')?.toString().trim();

        if (!message) return;

        // Immediately update chat history with user's message
        setChatHistory((prev: ChatMessage[]) => [...prev, { role: 'user', content: message }]);

        // Send updated chat history to API (safe to construct here)
        const updatedChatHistory = [...chatHistory, { role: 'user', content: message }];

        try {
          const answer = response.request(
            new Request('/api/chat', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                chats: updatedChatHistory,
                systemPrompt: 'teacher',
                subject: 'General',
              }),
            })
          );

            event.currentTarget.reset();

            const answerText = (await answer) as string;
            console.log('Server response:', answerText);

            const parsedAnswer = await marked.parse(answerText);
            const purifiedText = DOMPurify.sanitize(parsedAnswer)
                .replace(/<script>/g, '&lt;script&gt;')
                .replace(/<\/script>/g, '&lt;/script&gt;');

            // Use functional update again to avoid stale state
            setChatHistory((prev: ChatMessage[]): ChatMessage[] => [...prev, { role: 'assistant', content: purifiedText }]);

        } catch (e) {
            console.error('Error in handleSubmit:', e);
        }
    }


    function deleteAllChats () {
        setChatHistory([])
    }

    (async () => {
        if (response.text !== '') {
            // Strip <think> tags from the response text
            const cleanedText = stripThinkTags(response.text);
            const parsedText = await marked.parse(cleanedText);
            const sanitizedText = DOMPurify.sanitize(parsedText)
                .replace(/<script>/g, '&lt;script&gt;')
                .replace(/<\/script>/g, '&lt;/script&gt;');
            setResponseText(sanitizedText); // Use state updater function
        }
    })();

    // Add copy button to code blocks
    useEffect(() => {
        const addCopyButtons = () => {
            if (!chatContainerRef.current) return;
            
            const codeBlocks = chatContainerRef.current.querySelectorAll('pre code');
            
            codeBlocks.forEach((codeBlock) => {
                const pre = codeBlock.parentElement;
                if (!pre || pre.querySelector('.copy-button')) return;
                
                // Create copy button
                const button = document.createElement('button');
                button.className = 'copy-button';
                
                // Apply styles directly to the button
                Object.assign(button.style, {
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    height: '20px',
                    width: '20px',
                    borderRadius: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#4b5563',
                    cursor: 'pointer',
                    padding: '0',
                    margin: '0',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)'
                });
                
                button.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                        <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                    </svg>
                `;
                
                button.addEventListener('click', () => {
                    const code = codeBlock.textContent || '';
                    navigator.clipboard.writeText(code).then(() => {
                        button.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                            </svg>
                        `;
                        setTimeout(() => {
                            button.innerHTML = `
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                                    <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                                </svg>
                            `;
                        }, 1500);
                    });
                });
                
                pre.style.position = 'relative';
                pre.insertBefore(button, pre.firstChild); // Insert button as the first child
                
                // Add hover effect manually
                pre.addEventListener('mouseenter', () => {
                    button.style.opacity = '1';
                });
                
                pre.addEventListener('mouseleave', () => {
                    button.style.opacity = '0';
                });
            });
        };
        
        // Run initially and after chat updates
        addCopyButtons();
        
        // Use MutationObserver to detect when new code blocks are added
        const observer = new MutationObserver(addCopyButtons);
        if (chatContainerRef.current) {
            observer.observe(chatContainerRef.current, { childList: true, subtree: true });
        }
        
        return () => observer.disconnect();
    }, [chatHistory, responseText]);

    //End of Logic-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    return (
        <main className="m-4 p-2 flex flex-col md:w-[80%] md:max-w-[75rem] mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg">
            <div className="border-b pb-3 mb-4 dark:bg-gray-900">
                <h1 className="text-2xl font-semibold text-center text-gray-800 dark:text-white">Coding Chat Assistant</h1>
            </div>
            <form className="space-y-4"
                onSubmit={handleSubmit}>
                <div ref={chatContainerRef} className="chat-container h-[60vh] overflow-y-auto break-words space-y-6 px-4 container dark:bg-gray-900">
                    {chatHistory.length === 0 ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="p-6 bg-gray-50 rounded-lg shadow-sm max-w-md dark:bg-gray-800">
                                <h2 className="text-xl font-medium text-gray-700 mb-2 dark:text-gray-50">Welcome!</h2>
                                <p className="text-gray-600 dark:text-gray-50">I am an AI chat here to help you learn how to code! I won&apos;t solve your problems directly, but I&apos;ll help you get there!</p>
                            </div>
                        </div>
                    ) : null}
                    
                    {chatHistory.map((chat: ChatMessage, index: number) => (
                        chat.role === 'user' ? (
                            <div key={index} className="ml-auto flex justify-end">
                                <div className="user-chat bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none max-w-[80%] shadow-sm">
                                    {chat.content}
                                </div>
                            </div>
                        ) : (
                            <div key={index} className="mr-auto flex max-w-[90%]">
                                <div className="assistant-chat bg-gray-50 border-l-4 border-blue-500 pl-4 py-3 pr-5 text-gray-800 dark:bg-gray-800">
                                    <div dangerouslySetInnerHTML={{ __html: chat.content }} className="prose max-w-none dark:text-white" />
                                </div>
                            </div>
                        )
                    ))}
                    {response.loading && (
                        <div className="mr-auto flex max-w-[90%] dark:bg-gray-800 dark:text-white">
                            <div className="assistant-chat bg-gray-50 border-l-4 border-blue-500 pl-4 py-3 pr-5 text-gray-800 dark:bg-gray-800">
                                {response.text === '' ? (
                                    <div className="flex items-center">
                                        <p className="text-gray-600 dark:bg-gray-800 dark:text-white">Thinking</p>
                                        <span className="animate-pulse ml-1 dark:text-white">...</span>
                                    </div>
                                ) : (
                                    <div dangerouslySetInnerHTML={{ __html: responseText }} className="prose max-w-none dark:text-white" />
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className="border-t pt-4">
                    <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 bg-gray-50 p-4 rounded-xl dark:bg-gray-900">
                        <textarea
                            className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 p-3 rounded-lg w-full resize-none transition-colors"
                            required
                            placeholder="Type your message..."
                            name="message"
                            rows={3}
                            onKeyDown={handleKeydown}
                        ></textarea>
                        <div className="flex md:flex-col justify-between gap-2">
                            <button type="submit" className="btn bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors flex-grow md:flex-grow-0">
                                <span className="flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                    Send
                                </span>
                            </button>
                            <button type="button" className="btn bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors flex-grow md:flex-grow-0" onClick={deleteAllChats}>
                                Clear Chat
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </main>
    );


}

export default TestChat;