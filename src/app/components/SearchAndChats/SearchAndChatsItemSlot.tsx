'use client';
import {useState, useContext, useEffect} from 'react';
import { Bullet, Folder, ChatBox, ThreeDotsEllipsis, QuizIcon } from '../IconsIMGSVG';
import { DataContextProvider } from '@/app/context_providers/data_context/DataProvider';
import RenamePopup from './SearchAndChatsRename';

interface SlotProps {
    header: string;
    type: 'folder' | 'chat' | 'quiz';
    isActive?: boolean;
    dataID?: number;
}
/**
 * This local Slot Component is used to display a folder or chat item in the sidebar.
 * 
 * @param type folder or chat
 * @param header name of the folder or chat
 * @param isActive if the slot is active or not
 * @param dataID the id of the folder or chat
 * @returns A li item with a header and a button to remove the folder or chat. Can appear with a bullet if active.
 */
const Slot: React.FC<SlotProps> = ({header, type, isActive=false, dataID}) => {
    const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);
    const context = useContext(DataContextProvider);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    if (!context) {
        throw new Error(
            "DataContextProvider must be used within a DataContextProvider"
        );
    }
    const { dispatch } = context;

    // console.log("Slot Rendered: ", header, type, isActive, dataID);
    // console.log("When Slot was rendered, the current folder in data is: ", data._currentFolderID);

    /* Close other submenus while opening this one. */
    const handleButtonClick = () => {
        const allSubMenus = document.querySelectorAll('.subMenu') as NodeListOf<HTMLUListElement>;
        allSubMenus.forEach((menu) => {
            if (menu !== null && menu !== undefined && menu.classList.contains('flex')) {
                menu.classList.add('hidden');
                menu.classList.remove('flex');
            }
        });
        setMenuIsOpen(prev => !prev)
    }

    /* Manage the state so it stays consistent in cases where other submenus closed the this one. */
    useEffect(() => {
        const checkIfMenuWasForceClosed = () => {
            if (!dataID) return;
            const thisMenu = document.querySelector(`.subMenu.hidden[data-key="${dataID}"]`) as HTMLUListElement;
            if (thisMenu) {
                if (setMenuIsOpen) {
                    setMenuIsOpen(false);
                }
            }
        }
        checkIfMenuWasForceClosed()
    }, [menuIsOpen, dataID])

    return (
        <li className='flex flex-row justify-between relative bg-surface-50 dark:bg-surface-900 rounded-lg place-items-center hover:cursor-pointer transition-all '>
            {/* Icon and File Name */}
    
                <button type='button' className="grid grid-cols-[auto_1fr] gap-2 h-full place-items-center justify-items-start relative w-full hover:bg-surface-100 dark:hover:bg-surface-950 p-2 rounded-lg rounded-r-none"
                onClick={() => {
                    dispatch({
                        type: (type === "folder") ? "TOGGLE_CURRENT_FOLDER" : "TOGGLE_CURRENT_FILE",
                        payload: dataID !== undefined ? dataID : -1,
                    });
                }}>
                    <div className='flex flex-row gap-2'>
                        {isActive && <Bullet background={false}  />}
                        {(() => {
                            switch (type) {
                                case "folder":
                                    return <Folder width='w-3' background={false} special={true} />;
                                case "chat":
                                    return <ChatBox width='w-3' background={false} special={true} />;
                                case "quiz":
                                    return <QuizIcon width='w-3' background={false} special={true} />;
                                // Add more cases here for new types
                                default:
                                    return null;
                            }
                        })()}
                    </div>
                    <span className="text-black dark:text-white block w-full text-start truncate h-min text-sm">{header}</span>
                </button>

            {/* Options Button */}
            <div className='rounded-r-lg hover:bg-surface-100 dark:hover:bg-surface-950 grid place-items-center focus-within:[&>ul]:flex focus:[&>ul]:opacity-100 transition-all'>
                <button className="p-2 bg-transparent border-none m-0 cursor-pointer focus:[&_+_ul]:flex focus:[&_+_ul]:opacity-100" onClick={()=>{handleButtonClick()}}><ThreeDotsEllipsis width='w-3' background={false} /></button>
                
                <ul data-key={dataID} className={`hidden focus:flex focus-within:flex focus:opacity-100 focus-within:opacity-100 opacity-0 transition-all absolute right-3 top-5 rounded-lg shadow-lg flex-col gap-0 cursor-pointer z-10`}>
                    <li className='border-transparent rounded-tl-lg hover:bg-error-800 bg-error-500 transition-all'>
                        <button
                            type="button"
                            className='w-full p-2 text-black hover:text-white text-left' 
                            onClick={() => {
                                dispatch({type: "DELETE_ITEM", payload: {id: dataID ?? 0}});
                            }}>
                            Delete
                        </button>
                    </li>
                    <li className='border-transparent rounded-b-lg hover:bg-surface-800 bg-surface-500 transition-all'>
                        <button
                            type="button"
                            className='w-full p-2 text-white text-left' 
                            onClick={() => setShowPopup(true)}>
                            Rename
                        </button>
                    </li>
                </ul>
                {showPopup &&
                    <RenamePopup
                        header={`Rename ${header}`}
                        text={`Enter a new name for the ${type} named ${header}.`}
                        componentId={dataID ?? -1}
                        onCancel={() => setShowPopup(false)}
                    />
                }
            </div>
        </li>
    );
}

export default Slot;