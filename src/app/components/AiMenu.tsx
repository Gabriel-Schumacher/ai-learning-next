import {Arrow, Aa, Document, ChatBoxFilled} from "./IconsIMGSVG";
import {useState} from "react";
import { ChatResponse, Conversation } from "../types/client-server-types";
interface AiMenuProps {
    addToHistory: (response: ChatResponse) => Conversation;
}
const AiMenu: React.FC<AiMenuProps> = ({addToHistory}) => {

    const [textAreaValue, setTextAreaValue] = useState<string>("");

    const handleEnterPress = (e: React.KeyboardEvent<HTMLTextAreaElement> | React.MouseEvent<HTMLButtonElement>) => {
        if (
            (e.nativeEvent instanceof KeyboardEvent && e.nativeEvent.key === "Enter" && !e.nativeEvent.shiftKey) || e.nativeEvent instanceof MouseEvent
        ) {
            e.preventDefault(); // Prevent default behavior for Enter key
            console.log("Text Area Value:", textAreaValue);
            let newMessage: ChatResponse = {
            body: textAreaValue,
            isAiResponse: false,
            type: 'text',
            id: -1,
            time: new Date(), // Assigns a Date object directly
            };
            addToHistory(newMessage);
            // Start a new conversation logic here.
            setTextAreaValue(""); // Clear the text area after submission
        } else {
            console.log(1)
        }
    }

    // Need an attachment function that will pass up to the parent.

    return (
        <div className="card w-full h-full grid grid-rows-[1fr_max-content] gap-4 p-4 bg-surface-200 dark:bg-surface-800 shadow-lg">
                {/* First Row */}
                <div className="flex flex-col gap-2">
                    {/* Entry Text */}
                    <h1 className="h2 text-center dark:text-surface-50">How Can I Help You Today?</h1>
                    <p className="text-center dark:text-surface-50">Our AI learning assistant is designed to provide personalized, real-time support to help you learn more effectively. Whether you're studying for an exam, picking up a new skill, or tackling a tough topic, our AI assistant makes learning engaging and efficient.</p>

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
                            <h2>How Do I Write In __ Format?</h2>
                            <span>Make sure your paper follows the correct format.</span>
                        </button>
                    </div>
                </div>

                {/* Text Area */}{/* Second Row */}
                <div className="w-full p-2 card border-black border-solid bg-surface-50 dark:bg-surface-900 h-24 grid grid-rows-[1fr_min-content] gap-2 relative">
                    <textarea 
                        className="all-unset w-full text-surface-950 placeholder:text-surface-900 dark:text-surface-200 dark:placeholder:text-surface-200 cursor-text resize-none overflow-auto"
                        placeholder="Type your message here..."
                        value={textAreaValue}
                        onChange={(e) => setTextAreaValue(e.target.value)}
                        onKeyDown={handleEnterPress}
                        style={{ height: "auto", maxHeight: "100%" }}
                        rows={1}
                    />

                    <div className="flex w-full justify-between items-center gap-2">
                        <button className="btn lg">+ Attach</button>
                        <div className="flex flex-row items-center gap-2">
                            <span className="text-sm text-surface-900 dark:text-surface-50">shift+enter for a new line</span>
                            <button className="btn rounded-full" onClick={handleEnterPress}>
                                <Arrow width="w-3" background={false} special={true} />
                            </button>
                        </div>
                    </div>
                </div>

        </div>
    );
}
export default AiMenu;
