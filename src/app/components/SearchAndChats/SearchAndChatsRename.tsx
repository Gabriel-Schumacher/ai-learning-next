'use client';
import {useState, useContext} from 'react';
import { DataContextProvider } from '@/app/context_providers/data_context/DataProvider';

interface RenamePopupProps {
    header: string;
    text: string;
    componentId: number;
    onCancel: () => void;
}

const RenamePopup: React.FC<RenamePopupProps> = ({header, text, componentId, onCancel}) => {
    const [error, setError] = useState<string | null>(null);

    const context = useContext(DataContextProvider);
    if (!context) {
        throw new Error(
            "DataContextProvider must be used within a DataContextProvider"
        );
    }
    const { dispatch } = context;

    const handleErrorMessage = (message: string) => {
        setError(message);
        setTimeout(() => {
            setError(null);
        }, 3000);
    }

    const checkIfKeyIsEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onSaveHandle();
        }
    }

    const onSaveHandle = () => {
        const inputElement = document.querySelector(`#slot-rename-${componentId}`) as HTMLInputElement;
        if (inputElement && inputElement.value.trim() !== "") {
            dispatch({
                type: 'RENAME_SLOT',
                payload: {
                    id: componentId,
                    newName: inputElement.value.trim()
                }
            });
            onCancel();
        }
        else {
            handleErrorMessage("Slot name cannot be empty");
        }
    }

    const handleClickOutsidePopup = (event: React.MouseEvent<HTMLDivElement>) => {
        if ((event.target as HTMLElement).id === 'rename-slot-popup') {
            console.debug('[SearchAndChatsRename] Clicked outside the popup, closing it.');
            onCancel();
        }
    }
    

    return (
        <div className="fixed inset-0 flex items-center bg-[rgba(0,0,0,0.25)] justify-center z-50 w-full h-screen cursor-default" id="rename-slot-popup" onClick={handleClickOutsidePopup}>
            <div className="flex flex-col p-4 gap-2 bg-surface-50 dark:bg-surface-700 rounded-lg shadow-lg place-items-center max-w-5/6">
                <h3 className="text-lg font-semibold">{header}</h3>
                <p className="text-sm text-surface-950-50 w-full max-w-[35ch] place-self-start">{text}</p>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <span className='grid w-full grid-cols-[1fr] gap-2 bg-surface-200 dark:bg-surface-400 rounded-lg p-2 cursor-pointer'>
                    <input type="text" name={`slot-rename-${componentId}`} id={`slot-rename-${componentId}`} onKeyDown={checkIfKeyIsEnter} autoFocus className='w-full text-black placeholder:text-surface-900 bg-transparent focus:outline-none cursor-pointer'/></span>
                <div className="buttons grid grid-cols-2 gap-2 w-full">
                    <button type="button" className="btn btn-primary w-full" onClick={onSaveHandle}>Save</button>
                    <button type="button" className="btn btn-error w-full" onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default RenamePopup;