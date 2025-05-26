import {Aa, Document, ChatBoxFilled} from "./IconsIMGSVG";
import TextArea from "./TextArea";
import {useState, useContext} from "react";
import { ChatResponse, Conversation, Folder } from "../../lib/types/types";
import { AiDataProviderContext } from "./AiContextProvider/AiDataProvider";

const AiMenu: React.FC = () => {

    const [textAreaValue, setTextAreaValue] = useState<string>("");

    const handleEnterPress = (e: React.KeyboardEvent<HTMLTextAreaElement> | React.MouseEvent<HTMLButtonElement>) => {
        if (
            (e.nativeEvent instanceof KeyboardEvent && e.nativeEvent.key === "Enter" && !e.nativeEvent.shiftKey) || e.nativeEvent instanceof MouseEvent
        ) {
            e.preventDefault(); // Prevent default behavior for Enter key
            const newFolder: Folder = {
                id: -1,
                name: "New Folder",
                current: true,
                attached_items: [],
            }
            const newConversation: Conversation = {
                id: -1,
                title: "New Conversation",
                type: "conversation",
                current: true,
                responses: [],
            };
            const newMessage: ChatResponse = {
                body: textAreaValue,
                isAiResponse: false,
                type: 'text',
                id: -1,
                time: new Date(), // Assigns a Date object directly
            };
            dispatch({ type: "ADD_FOLDER", payload: newFolder });
            dispatch({ type: "ADD_CONVERSATION", payload: newConversation });
            dispatch({ type: "ADD_RESPONSE", payload: newMessage });
            // Start a new conversation logic here.
            setTextAreaValue(""); // Clear the text area after submission
        }
    }

    const context = useContext(AiDataProviderContext);
    if (!context) {
        throw new Error("AiDataProviderContext must be used within a AiDataProvider");
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
