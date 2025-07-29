import {Aa, Document, ChatBoxFilled} from "./IconsIMGSVG";
import TextArea from "./TextArea";
import {useState, useContext} from "react";
import * as Types from "@/lib/types/types_new";
import {DataContextProvider} from "@/app/context_providers/data_context/DataProvider";

const AiMenu: React.FC = () => {

    const [textAreaValue, setTextAreaValue] = useState<string>("");

    const handleEnterPress = (e: React.KeyboardEvent<HTMLTextAreaElement> | React.MouseEvent<HTMLButtonElement>) => {
        if (
            (e.nativeEvent instanceof KeyboardEvent && e.nativeEvent.key === "Enter" && !e.nativeEvent.shiftKey) || e.nativeEvent instanceof MouseEvent
        ) {
            e.preventDefault(); // Prevent default behavior for Enter key
            const newMessage: Types.TextContentItem = {
                id: -1,
                type: "text",
                items: textAreaValue,
                createdAt: new Date(), // Assigns a Date object directly
                updatedAt: new Date(), // Assigns a Date object directly
                isAiResponse: false, // Assuming this is a user message
            };
            dispatch({ type: "ADD_FOLDER", payload: {setActive: true} });
            dispatch({ type: "ADD_FILE", payload: {setActive: true, type: 'conversation'} });
            dispatch({ type: "ADD_CONTENT", payload: {type: 'text', contentItem: newMessage} });
            dispatch({ type: "SET_PAGE", payload: 'CHAT' });
            // Start a new conversation logic here.
            setTextAreaValue(""); // Clear the text area after submission
        }
    }

    const context = useContext(DataContextProvider);
    if (!context) {
        throw new Error("DataContextProvider must be used within a DataContextProvider");
    }
    const { data, dispatch } = context;

    const handleDiscussionClick = () => {
        const newMessage: Types.TextContentItem = {
            id: -1,
            type: "text",
            items: "I need help writing a discussion post",
            createdAt: new Date(), // Assigns a Date object directly
            updatedAt: new Date(), // Assigns a Date object directly
            isAiResponse: false, // Assuming this is a user message
        };
        if (data && data.sortedData) {
            if (!data.sortedData.currentFolderId) {
                dispatch({ type: "ADD_FOLDER", payload: {setActive: true} });
            }
            dispatch({ type: "ADD_FILE", payload: {setActive: true, type: 'conversation'} });
            dispatch({ type: "ADD_CONTENT", payload: {type: 'text', contentItem: newMessage} });
            dispatch({ type: "SET_PAGE", payload: 'CHAT' });
        }
    }

    const handleWritingEssayClick = () => {
        dispatch({ type: "SET_PAGE", payload: 'ESSAY' });
    }

    const handleFormattingClick = () => {
        const newMessage: Types.TextContentItem = {
            id: -1,
            type: "text",
            items: "Can you help me figure out how to write in a certain format?",
            createdAt: new Date(), // Assigns a Date object directly
            updatedAt: new Date(), // Assigns a Date object directly
            isAiResponse: false, // Assuming this is a user message
        };
        if (data && data.sortedData) {
            if (!data.sortedData.currentFolderId) {
                dispatch({ type: "ADD_FOLDER", payload: {setActive: true} });
            }
            dispatch({ type: "ADD_FILE", payload: {setActive: true, type: 'conversation'} });
            dispatch({ type: "ADD_CONTENT", payload: {type: 'text', contentItem: newMessage} });
            dispatch({ type: "SET_PAGE", payload: 'CHAT' });
        }
    }


    return (
        <div className="card w-full h-full flex flex-col gap-4 p-4 bg-surface-200 dark:bg-surface-800 shadow-lg">
                {/* First Row */}
                <div className="flex flex-col md:grid md:grid-rows-2 gap-2">
                    {/* Entry Text */}
                    <div className="grid grid-rows-2 place-items-center gap-2 mb-4 md:mb-0">
                        <h1 className="h2 text-center text-primary-500 dark:text-surface-50 text-4xl md:text-7xl">How Can I Help You Today?</h1>
                        <p className="text-center dark:text-surface-50">Our AI learning assistant is designed to provide personalized, real-time support to help you learn more effectively. Whether yout&#39;re studying for an exam, picking up a new skill, or tackling a tough topic, our AI assistant makes learning engaging and efficient.</p>
                    </div>

                    {/* Three Buttons To Start a Conversation */}
                    <div className="grid grid-rows-3 md:grid-rows-1 md:grid-cols-3 gap-2 [&>button]:hover:cursor-pointer [&>button]:p-2 [&>button]:rounded-md [&>button]:border [&>button]:border-transparent dark:[&>button]:hover:bg-surface-500 [&>button]:dark:bg-surface-600 [&>button]:bg-surface-50 [&>button]:hover:bg-surface-200 [&>button]:grid [&>button]:grid-rows-[1fr_auto] [&>button]:place-items-center [&>button]:gap-2 [&>button]:text-black [&>button]:dark:text-white [&>button]:text-center [&>button>span]:text-xs">
                        {/* Essay Help Button */}
                        <button aria-label="Get help writing an essay" onClick={handleWritingEssayClick}>
                            <Document background={false} width="full" special={true}/>
                            <div>
                                <h2>I Need To Write An Essay</h2>
                                <span>Get help with you writing, look like a pro.</span>
                            </div>
                        </button>
                        {/* Dicussion Help Button */}
                        <button aria-label="Get help writing a discussion" onClick={handleDiscussionClick}>
                            <ChatBoxFilled background={false} width="full" special={true}/>
                            <div>
                                <h2>I Need Help With A Discussion Post</h2>
                                <span>Turn your insights into a discussion response.</span>
                            </div>
                        </button>
                        {/* Format Button */}
                        <button aria-label="Get help formatting an essay" onClick={handleFormattingClick}>
                            <Aa background={false} width="full" special={true}/>
                            <div>
                                <h2>How Do I Write In __ Format&#39;?</h2>
                                <span>Make sure your paper follows the correct format.</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Text Area */}
                <TextArea handleEnterPress={handleEnterPress} setTextAreaValue={setTextAreaValue} textAreaValue={textAreaValue} attach={false} />

        </div>
    );
}
export default AiMenu;
