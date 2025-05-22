import React, { useState, useEffect, useRef } from 'react';
import { Bullet, PlusSign, Chevron, Folder, ChatBox, ThreeDotsEllipsis } from './IconsIMGSVG';
import { Conversations, Folders } from "../types/client-server-types"

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
        <div className="grid grid-cols-[auto_1fr_auto] gap-2 bg-surface-50 dark:bg-surface-900 rounded-lg p-2 place-items-center relative">
            {type === 'folder' ? 
                <div className='flex flex-row gap-2'>{isActive && <Bullet background={false}  />}<Folder width='w-3' background={false} special={true} /></div>
                : 
                <div className='flex flex-row gap-2'>{isActive && <Bullet background={false}  />}<ChatBox width='w-3' background={false} special={true} /></div>
            }
            <span className="text-black dark:text-white block w-full truncate h-min text-sm">{header}</span>
            <button className="bg-transparent border-none p-0 m-0 cursor-pointer" onClick={()=>{handleButtonClick()}}><ThreeDotsEllipsis width='w-3' background={false} /></button>
            <ul data-key={dataID} className={`subMenu ${menuIsOpen ? 'flex' : 'hidden'} absolute right-3 top-5 rounded-lg shadow-lg p-0 flex-col gap-0 cursor-pointer z-10`}>
                <li className='border-transparent rounded-tl-lg hover:bg-error-800 bg-error-500 p-2 text-black hover:text-white transition-all'>Delete</li>
                <li className='border-transparent rounded-b-lg hover:bg-surface-800 bg-surface-500 p-2 text-white transition-all'>Rename</li>
            </ul>
        </div>
    );
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

interface SearchAndChatsProps {
    folders: Folders;
    chats: Array<Omit<Conversations[number], 'messages'>>;
    folderActions: {
        addFolder: () => void;
        removeFolder: (index: number) => void;
        addConversation: () => Folders;
        removeChat: (index: number) => void;
        toggleFolders: (index: number) => void;
        toggleChats: (index: number) => void;
        handleDifferentChat: (index: number) => void;
    };
}
/**
 * This component is used to display the search bar, the folders provided to it, and the chats found in the folders.
 * It DOES NOT handle the actual logic functional items, it just displays the information and calls the functions provided to it.
 * 
 * @param folders The array of folders [Folders]
 * @param chats chats should be the attached_conversations of the active folder [Conversations]
 * @param folderActions The logical functions that this component should use for any intended actions
 * 
 */
const SearchAndChats: React.FC<SearchAndChatsProps> = ({folders, chats, folderActions}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [foldersHidden, setFoldersHidden] = useState<boolean>(false);
    const [chatsHidden, setChatsHidden] = useState<boolean>(false);
    const [activeFolder, setActiveFolder] = useState<boolean>(false);

    // NOT SET UP - Tells the page to remove the conversation from the folder and all its conversations
    const handleRemoveChat = (index: number) => {
        if (loading) return;
        setLoading(true);
        folderActions.removeChat(index)
        setLoading(false)
    }
    // NOT SET UP - Tells the page to remove the folder and all its conversations
    const handleRemoveFolder = (index: number) => {
        if (loading) return;
        setLoading(true);
        folderActions.removeFolder(index)
        setLoading(false)
    }

    // NOT SET UP * Placeholder functions for the buttons
    const handleToggleFolders = () => {
        console.log('Toggle folders clicked');
    }
    const handleToggleChats = () => {
        console.log('Toggle chats clicked');
    }

    // Causes the rotation of the chevron icon when clicked. This also results in the folders or chats being hidden or shown.
    const toggleRotation = (e: React.MouseEvent, type: 'files' | 'chats') => {
        const button = e.currentTarget.closest('button');
        if (button) {
            button.classList.toggle('rotate');
            if (type === "files") {
                setFoldersHidden(!foldersHidden);
            } else if (type === "chats") {
                setChatsHidden(!chatsHidden);
            }
        }
    }

    useEffect(() => {
        setActiveFolder(folders.some(folder => folder.current));
    }
    , [folders, chats]);

    return (
        <aside className='card lg:h-full max-h-[600px] lg:max-h-[80vh] w-full lg:max-w-[300px] p-2 bg-surface-200 dark:bg-surface-800 shadow-lg grid grid-rows-[1fr_auto] gap-4'>
            {/* Top Content */}
            <div className='max-h-[clamp(0,100%,800px)] lg:max-h-[clamp(0,100%,800px)] [&>div>.subheader]:grid [&>div>.subheader]:place-items-center [&>div>.subheader]:w-full [&>div>.subheader]:py-2 flex flex-col gap-4 overflow-y-auto'>
                {/* Search Bar */}
                <label htmlFor="search-input" className='grid grid-cols-[1fr_auto] gap-2 bg-surface-50 dark:bg-surface-700 rounded-lg p-2 cursor-text'>
                    <input 
                    type="text" 
                    placeholder="What are you looking for?"
                    className="w-full text-surface-950 placeholder:text-surface-900 dark:text-surface-50 dark:placeholder:text-surface-200 bg-transparent focus:outline-none"
                />
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-search text-surface-950 dark:text-surface-50 cursor-pointer"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </label>
                {/* Search Results */}
                <div className=''>
                    {/* Folders */}
                    <div className="subheader grid-cols-[1fr_auto_auto] gap-2">
                        <span className="block w-full font-semibold text-surface-950 dark:text-surface-50">Folders</span>
                        {/* Add File */}
                        <button className="bg-transparent border-none p-0 m-0" onClick={() => {folderActions.addFolder()}}><PlusSign width="w-3" background={false}/></button>
                        {/* Collapse or Expand */}
                        <button className="bg-transparent border-none p-0 m-0 can-rotate" onClick={(e) => {handleToggleFolders(); toggleRotation(e, "files")}}><Chevron width="w-3" background={false}/></button>
                    </div>

                    <ul 
                        className={`flex flex-col gap-2 mb-4 ${folders.length <= 0 && 'hidden'} ${foldersHidden ? 'hidden' : ''}`} 
                        onClick={(e) => {
                            const target = e.target as HTMLElement;
                            const li = target.closest('li');
                            if (li) {
                                const folderId = li.getAttribute('data-folder-id');
                                if (folderId) {
                                    folderActions.toggleFolders(parseInt(folderId));
                                }
                            }
                        }}
                    >
                        {folders.map((folder, index) => (
                            <li key={index} data-folder-id={folder.id}><Slot header={folder.name} type={'folder'} isActive={folder.current ? folder.current : false} dataID={folder.id}/></li>
                        ))}
                    </ul>



                    {/* Chats */}
                    <div className="subheader grid-cols-[1fr_auto] gap-2">
                        <span className="block w-full font-semibold text-surface-950 dark:text-surface-50">Chats</span>
                        {/* Collapse or Expand */}
                        <button className="bg-transparent border-none p-0 m-0 can-rotate" onClick={(e) => {handleToggleChats(); toggleRotation(e, "chats")}}><Chevron width="w-3" background={false}/></button>
                    </div>

                    <ul 
                        className={`max-h-full flex flex-col gap-2 mb-4 overflow-y-hidden ${chats.length <= 0 && 'hidden'} ${chatsHidden ? 'hidden' : ''}`}
                        onClick={(e) => {
                            const target = e.target as HTMLElement;
                            const li = target.closest('li');
                            if (li) {
                                const chatid = li.getAttribute('data-chat-id');
                                if (chatid) {
                                    folderActions.toggleChats(parseInt(chatid));
                                }
                            }
                        }}
                    >
                        {chats.map((chat, index) => (
                            <li key={index} data-chat-id={chat.id} data-chat-active={chat.current ? true : false} onClick={() => {folderActions.handleDifferentChat(chat.id)}}><Slot header={chat.title} type={'chat'} isActive={chat.current ? true : false} dataID={chat.id}/></li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Action Button */}
            <button disabled={!activeFolder} onClick={()=>{folderActions.addConversation()}} className='btn w-full flex justify-between'><span className='flip-text-color'>New Chat</span><PlusSign background={true} special={true} width='w-3' /></button>
        </aside>
    );
};

export default SearchAndChats;