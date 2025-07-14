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
    const { dispatch } = context;

    return (
        <div className="card w-full h-full grid grid-rows-[1fr_max-content] gap-4 p-4 bg-surface-200 dark:bg-surface-800 shadow-lg">
                {/* First Row */}
                <div className="flex flex-col gap-2">
                    {/* Entry Text */}
                    <h1 className="h2 text-center dark:text-surface-50">How Can I Help You Today?</h1>
                    <p className="text-center dark:text-surface-50">Our AI learning assistant is designed to provide personalized, real-time support to help you learn more effectively. Whether yout&#39;re studying for an exam, picking up a new skill, or tackling a tough topic, our AI assistant makes learning engaging and efficient.</p>

                    {/* Three Buttons To Start a Conversation */}
                    <div className="grid grid-cols-3 gap-2 [&>button]:hover:cursor-pointer [&>button]:p-2 [&>button]:rounded-md [&>button]:border [&>button]:border-transparent [&>button]:dark:bg-surface-600 [&>button]:bg-white [&>button]:flex [&>button]:flex-col [&>button]:items-center [&>button]:gap-2 [&>button]:text-black [&>button]:dark:text-white [&>button]:text-center [&>button>span]:text-xs">
                        {/* Essay Help Button */}
                        <button aria-label="Get help writing an essay">
                            <Document background={false} width="w-6" special={true}/>
                            <h2>I Need To Write An Essay</h2>
                            <span>Get help with you writing, look like a pro.</span>
                        </button>
                        {/* Dicussion Help Button */}
                        <button aria-label="Get help writing a discussion">
                            <ChatBoxFilled background={false} width="w-6" special={true}/>
                            <h2>I Need Help With A Discussion Post</h2>
                            <span>Turn your insights into a discussion response.</span>
                        </button>
                        {/* Format Button */}
                        <button aria-label="Get help formatting an essay">
                            <Aa background={false} width="w-6" special={true}/>
                            <h2>How Do I Write In __ Format&#39;?</h2>
                            <span>Make sure your paper follows the correct format.</span>
                        </button>
                    </div>
                </div>

                {/* Text Area */}
                <TextArea handleEnterPress={handleEnterPress} setTextAreaValue={setTextAreaValue} textAreaValue={textAreaValue} />

        </div>
    );
}
export default AiMenu;
