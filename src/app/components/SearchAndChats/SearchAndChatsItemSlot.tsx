'use client';
import {useState, useContext, useEffect} from 'react';
import { Bullet, Folder, ChatBox, ThreeDotsEllipsis } from '../IconsIMGSVG';
import { AiDataProviderContext } from '../AiContextProvider/AiDataProvider';
import { LocalStorageContextProvider } from '@/app/context_providers/local_storage/LocalStorageProvider';

interface SlotProps {
    header: string;
    type: 'folder' | 'chat';
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
    const context = useContext(AiDataProviderContext);
        if (!context) {
            throw new Error("AiDataProviderContext must be used within a AiDataProvider");
        }
    const { dispatch } = context;

    const localContext = useContext(LocalStorageContextProvider);
    if (!localContext) {
        throw new Error("LocalStorageContextProvider must be used within a LocalStorageProvider");
    }
    const { local_dispatch } = localContext;

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
        <li className='grid grid-cols-[1fr_auto] relative bg-surface-50 dark:bg-surface-900 rounded-lg place-items-center hover:cursor-pointer transition-all '>
            {/* Icon and File Name */}
            {/* FOLDER */}
                {(type === 'folder') && (
                    <button type='button' className="grid grid-cols-[auto_1fr] gap-2 h-full place-items-center justify-items-start relative w-full hover:bg-surface-100 dark:hover:bg-surface-950 p-2 rounded-lg rounded-r-none"
                    onClick={() => {
                        dispatch({
                            type: "TOGGLE_CURRENT_FOLDER",
                            payload: dataID !== undefined ? dataID : -1,
                        });
                        local_dispatch({type: "TOGGLE_ACTIVE", payload: dataID || -1})
                    }}>
                        <div className='flex flex-row gap-2'>{isActive && <Bullet background={false}  />}<Folder width='w-3' background={false} special={true} /></div>
                        <span className="text-black dark:text-white block w-full text-start truncate h-min text-sm">{header}</span>
                    </button>
                )}
            {/* CHAT OR QUIZ OR NOTE TYPES */}
                {(type !== 'folder') && (
                    <button type='button' className="grid grid-cols-[auto_1fr] gap-2 h-full place-items-center justify-items-start relative w-full hover:bg-surface-100 dark:hover:bg-surface-950 p-2 rounded-lg rounded-r-none"
                    onClick={() => {
                        dispatch({
                            type: "TOGGLE_CURRENT_ITEM",
                            payload: dataID !== undefined ? dataID : -1,
                        });
                        local_dispatch({type: "TOGGLE_ACTIVE", payload: dataID || -1})
                    }}>
                        <div className='flex flex-row gap-2'>{isActive && <Bullet background={false}  />}<ChatBox width='w-3' background={false} special={true} /></div>
                        <span className="text-black dark:text-white block w-full text-start truncate h-min text-sm">{header}</span>
                    </button>
                )}
            {/* Options Button */}
            <div className='rounded-r-lg hover:bg-surface-100 dark:hover:bg-surface-950 grid place-items-center focus-within:[&>ul]:flex focus:[&>ul]:opacity-100 transition-all'>
                <button className="p-2 bg-transparent border-none m-0 cursor-pointer focus:[&_+_ul]:flex focus:[&_+_ul]:opacity-100" onClick={()=>{handleButtonClick()}}><ThreeDotsEllipsis width='w-3' background={false} /></button>
                
                <ul data-key={dataID} className={`hidden focus:flex focus-within:flex focus:opacity-100 focus-within:opacity-100 opacity-0 transition-all absolute right-3 top-5 rounded-lg shadow-lg flex-col gap-0 cursor-pointer z-10`}>
                    <li className='border-transparent rounded-tl-lg hover:bg-error-800 bg-error-500 transition-all'>
                        <button
                            type="button"
                            className='w-full p-2 text-black hover:text-white text-left' 
                            onClick={() => {
                                dispatch({type: "REMOVE_ITEM", payload: dataID ?? 0});
                                local_dispatch({type: "REMOVE", payload: dataID ?? 0});
                            }}>
                            Delete
                        </button>
                    </li>
                    <li className='border-transparent rounded-b-lg hover:bg-surface-800 bg-surface-500 transition-all'>
                        <button
                            type="button"
                            className='w-full p-2 text-white text-left' 
                            onClick={() => console.log('Rename clicked')}>
                            Rename
                        </button>
                    </li>
                </ul>
                
            </div>
        </li>
    );
}

export default Slot;