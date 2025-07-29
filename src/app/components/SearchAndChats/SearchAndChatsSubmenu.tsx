'use client';
import {useContext} from 'react';
import { DataContextProvider } from '@/app/context_providers/data_context/DataProvider';

interface SubMenuPopupProps {
    header: string;
    componentId: number;
    onCancel: () => void;
    onDelete: () => void;
    onRename: () => void;
}

const SubMenuPopup: React.FC<SubMenuPopupProps> = ({header, componentId, onCancel, onDelete, onRename}) => {

    const context = useContext(DataContextProvider);
    if (!context) {
        throw new Error(
            "DataContextProvider must be used within a DataContextProvider"
        );
    }

    const handleClickOutsidePopup = (event: React.MouseEvent<HTMLDivElement>) => {
        if ((event.target as HTMLElement).id === `rename-slot-popup-${componentId}`) {
            console.debug('[SearchAndChatsSubMenu] Clicked outside the popup, closing it.');
            onCancel();
        }
    }
    

    return (
        <div className="fixed inset-0 flex items-center bg-[rgba(0,0,0,0.25)] justify-center z-50 w-full h-screen cursor-default" id={`rename-slot-popup-${componentId}`} onClick={handleClickOutsidePopup}>
            <div className="flex flex-col p-4 gap-2 bg-surface-50 dark:bg-surface-700 rounded-lg shadow-lg place-items-center max-w-5/6 min-w-[300px]">
                <h3 className="text-lg font-semibold">{header}</h3>
                <div className="buttons flex flex-col gap-2 w-full">
                    <button type="button" className="btn btn-primary w-full" onClick={onDelete}>Delete</button>
                    <button type="button" className="btn btn-primary w-full" onClick={onRename}>Rename</button>
                    <button type="button" className="btn btn-primary w-full" onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default SubMenuPopup;