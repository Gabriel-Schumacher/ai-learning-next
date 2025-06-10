'use client';
import { useState, useContext } from "react";
import { PlusSign, Chevron, SearchIcon } from "../IconsIMGSVG";
import { AiDataProviderContext } from "../AiContextProvider/AiDataProvider";
import Slot from "./SearchAndChatsItemSlot";

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * This component is used to display the search bar, the folders provided to it, and the chats found in the folders.
 */
const SearchAndChats: React.FC = () => {
    const [foldersHidden, setFoldersHidden] = useState<boolean>(false);
    const [chatsHidden, setChatsHidden] = useState<boolean>(false);

    const context = useContext(AiDataProviderContext);
    if (!context) {
        throw new Error(
            "AiDataProviderContext must be used within a AiDataProvider"
        );
    }
    const { data, dispatch } = context;

    // Causes the rotation of the chevron icon when clicked. This also results in the folders or chats being hidden or shown.
    const toggleRotation = (e: React.MouseEvent, type: "files" | "chats") => {
        const button = e.currentTarget.closest("button");
        if (button) {
            button.classList.toggle("rotate");
            if (type === "files") {
                setFoldersHidden(!foldersHidden);
            } else if (type === "chats") {
                setChatsHidden(!chatsHidden);
            }
        }
    };

    return (
        <aside className="card lg:h-full max-h-[600px] lg:max-h-[80vh] w-full lg:max-w-[300px] p-2 bg-surface-200 dark:bg-surface-800 shadow-lg grid grid-rows-[1fr_auto] gap-0">
            {/* Top Content */}
            <div className="max-h-[clamp(0,100%,800px)] lg:max-h-[clamp(0,100%,800px)] [&>div>.subheader]:grid [&>div>.subheader]:place-items-center [&>div>.subheader]:w-full [&>div>.subheader]:py-2 flex flex-col gap-0 overflow-y-scroll [&>*]:pr-2">
                {/* Search Bar */}
                <label
                    htmlFor="search-input"
                    className="grid grid-cols-[1fr_auto] gap-2 bg-surface-50 dark:bg-surface-700 rounded-lg p-2 mr-2 cursor-text mb-4"
                >
                    <input
                        type="text"
                        placeholder="What are you looking for?"
                        className="w-full text-surface-950 placeholder:text-surface-900 dark:text-surface-50 dark:placeholder:text-surface-200 bg-transparent focus:outline-none"
                    />
                    <SearchIcon />
                </label>
                {/* End of Search Bar */}

                {/* Search Results */}
                {/* End of Search Results */}

                {/* Folders Section */}
                <div>
                    {/* Header (Section title, collapse button, and add file button) */}
                    <div className="subheader grid-cols-[1fr_auto_auto] gap-2">
                        {/* Section Title */}
                        <span className="block w-full font-semibold text-surface-950 dark:text-surface-50">
                            Folders
                        </span>
                        {/* Add File */}
                        <button
                            className="bg-transparent border-none p-0 m-0"
                            onClick={() => {dispatch({ type: "ADD_FOLDER" });}}
                        >
                            <PlusSign
                                width="w-3"
                                background={false}
                            />
                        </button>
                        {/* Collapse or Expand  Button*/}
                        <button
                            className="bg-transparent border-none p-0 m-0 can-rotate"
                            onClick={(e) => toggleRotation(e, "files")}
                        >
                            <Chevron
                                width="w-3"
                                background={false}
                            />
                        </button>
                    </div>

                    {/* Folder List */}
                    <ul
                        className={`flex flex-col gap-2 mb-4 ${foldersHidden ? "hidden" : ""}`}
                    >
                        {data.folders &&
                            data.folders.map((folder, index) => (
                                <Slot
                                    key={index}
                                    header={folder.name}
                                    type={"folder"}
                                    isActive={
                                        folder.id === data._currentFolderID
                                    }
                                    dataID={folder.id}
                                />
                            ))}
                    </ul>
                </div>
                {/* End of Folders Section */}

                {/* Folder Items Section */}
                <div className="max-h-full">
                    {/* Header (Section title, Collapse Button */}
                    <div className="subheader grid-cols-[1fr_auto] gap-2">
                        <span className="block w-full font-semibold text-surface-950 dark:text-surface-50">
                            Folder Content
                        </span>
                        {/* Collapse or Expand */}
                        <button
                            className="bg-transparent border-none p-0 m-0 can-rotate"
                            onClick={(e) => toggleRotation(e, "chats")}
                        >
                            <Chevron
                                width="w-3"
                                background={false}
                            />
                        </button>
                    </div>

                    {/* Folder Content */}
                    <ul
                        className={`max-h-full flex flex-col gap-2 mb-4 ${chatsHidden ? "hidden" : "" }`}
                    >
                        {data.conversations &&
                            data.conversations.map((chat, index) => (
                                <Slot
                                    key={index}
                                    data-chat-active={
                                        chat.current ? true : false
                                    }
                                    header={chat.title}
                                    type={"chat"}
                                    isActive={
                                        chat.id ===
                                        data._currentConversationID
                                    }
                                    dataID={chat.id}
                                />
                            ))}
                    </ul>
                </div>
                {/* End of Folder Items Section */}
            </div>
            {/* End of Top Content */}

            {/* New Conversation Button */}
            <button
                disabled={data._currentFolderID ? false : true}
                onClick={() => {
                    dispatch({ type: "ADD_CONVERSATION" });
                }}
                className="btn w-full flex justify-between"
            >
                <span className="flip-text-color">New Chat</span>
                <PlusSign
                    background={true}
                    special={true}
                    width="w-3"
                />
            </button>
            {/* End of New Conversation Button */}
        </aside>
    );
};

export default SearchAndChats;
