import { Arrow } from "./IconsIMGSVG";
interface TextAreaProps {
    // eslint-disable-next-line -- This is a custom type for handling both keyboard and mouse events
    handleEnterPress: (e: React.KeyboardEvent<HTMLTextAreaElement> | React.MouseEvent<HTMLButtonElement>) => void;
    setTextAreaValue: React.Dispatch<React.SetStateAction<string>>;
    textAreaValue: string;
}
/**
 * 
 * TextArea component for user input in a chat interface.
 * 
 * @param handleEnterPress - Function to handle Enter key press or button click
 * @param setTextAreaValue - Function to set the value of the text area
 * @param textAreaValue - Current value of the text area
 * @returns 
 */
const TextArea: React.FC<TextAreaProps> = ({ handleEnterPress, setTextAreaValue, textAreaValue }) => {
    return (
        <div className="w-full p-2 card border-black border-solid bg-surface-100 dark:bg-surface-900 min-h-24 grid grid-rows-[1fr_min-content] gap-2 relative">
            <textarea 
                className="w-full text-surface-950 border-none outline-none hover:outline-none focus:outline-none hover:border-none focus:border-none placeholder:text-surface-950 dark:text-surface-200 dark:placeholder:text-surface-200 cursor-text resize-none overflow-auto"
                placeholder="Type your message here..."
                value={textAreaValue}
                onChange={(e) => setTextAreaValue(e.target.value)}
                onKeyDown={handleEnterPress} 
            />

            <div className="flex w-full justify-between items-center gap-2">
                <button className="btn lg">+ Attach</button>
                <div className="flex flex-row items-center gap-2">
                    <span className="text-sm text-surface-50-950">shift+enter for a new line</span>
                    <button className="btn rounded-full" onClick={handleEnterPress}>
                        <Arrow width="w-3" background={false} special={true} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TextArea