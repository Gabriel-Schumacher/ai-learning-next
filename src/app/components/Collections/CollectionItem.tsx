'use client';
import {useContext} from 'react';
import { DataContextProvider } from '@/app/context_providers/data_context/DataProvider';
import * as Types from "@/lib/types/types_new";
import * as Utils from "@/app/context_providers/data_context/data_utils";


interface CollectionItemProps {
    index: number;
    collectionFile: Types.QuizFile;
}
const CollectionItem: React.FC<CollectionItemProps> = ({index, collectionFile}) => {

    const context = useContext(DataContextProvider);
    if (!context) {
        throw new Error(
            "DataContextProvider must be used within a DataContextProvider"
        );
    }
    const { data, dispatch } = context;

    const handleClick = () => {
        if (!collectionFile || !data || !data.sortedData) return;
        const quizFolder = Utils.getParentByItemId(data.sortedData.folders, collectionFile.id);
        if (!quizFolder || !quizFolder.id) return;

        if (data.sortedData.currentFileId === collectionFile.id) {
            // If the list item being clicked is already selected, we should just switch the page
            dispatch({ type: "SET_PAGE", payload: "QUIZ" });
        }
        if (data.sortedData.currentFolderId !== quizFolder.id) {
            // If the folder of the selected file is not already selected, we should select it
            dispatch({ type: "TOGGLE_CURRENT_FOLDER", payload: quizFolder.id });
        }

        dispatch({ type: "TOGGLE_CURRENT_FILE", payload: collectionFile.id });
    }

    return (
        <li key={index}>
            <button className="bg-surface-50 p-4 rounded-lg shadow-md w-full hover:bg-surface-300 dark:bg-surface-700 hover:dark:bg-surface-700 hover:cursor-pointer hover:shadow-xl focus:outline-2 focus:outline-surface-500 dark:focus:outline-surface-400 transition-colors duration-200 grid grid-cols-[1fr_auto]" onClick={handleClick}>
                <p className="text-lg font-medium text-start">Collection {index + 1}: {collectionFile.title}</p>
                <p>{collectionFile.content.length} Terms</p>
            </button>
        </li>
    );
}

export default CollectionItem;