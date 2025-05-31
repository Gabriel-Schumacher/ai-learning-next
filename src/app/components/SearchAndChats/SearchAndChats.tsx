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
        <aside className="card lg:h-full max-h-[600px] lg:max-h-[80vh] w-full lg:max-w-[300px] p-2 bg-surface-200 dark:bg-surface-800 shadow-lg grid grid-rows-[1fr_auto] gap-4">
            {/* Top Content */}
            <div className="max-h-[clamp(0,100%,800px)] lg:max-h-[clamp(0,100%,800px)] [&>div>.subheader]:grid [&>div>.subheader]:place-items-center [&>div>.subheader]:w-full [&>div>.subheader]:py-2 flex flex-col gap-4 overflow-y-auto">
                {/* Search Bar */}
                <label
                    htmlFor="search-input"
                    className="grid grid-cols-[1fr_auto] gap-2 bg-surface-50 dark:bg-surface-700 rounded-lg p-2 cursor-text"
                >
                    <input
                        type="text"
                        placeholder="What are you looking for?"
                        className="w-full text-surface-950 placeholder:text-surface-900 dark:text-surface-50 dark:placeholder:text-surface-200 bg-transparent focus:outline-none"
                    />
                    <SearchIcon />
                </label>

                {/* Search Results */}
                <div className="">
                    {/* Folders */}
                    <div className="subheader grid-cols-[1fr_auto_auto] gap-2">
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
                        {/* Collapse or Expand */}
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

                    {/* Folders List */}
                    <ul
                        className={`flex flex-col gap-2 mb-4 ${
                            foldersHidden ? "hidden" : ""
                        }`}
                        onClick={(e) => {
                            const target = e.target as HTMLElement;
                            const li = target.closest("li");
                            if (li) {
                                const folderId =
                                    li.getAttribute("data-folder-id");
                                if (folderId) {
                                    dispatch({
                                        type: "TOGGLE_CURRENT_FOLDER",
                                        payload: parseInt(folderId),
                                    });
                                }
                            }
                        }}
                    >
                        {data.folders &&
                            data.folders.map((folder, index) => (
                                <li
                                    key={index}
                                    data-folder-id={folder.id}
                                >
                                    <Slot
                                        header={folder.name}
                                        type={"folder"}
                                        isActive={
                                            folder.id === data._currentFolderID
                                        }
                                        dataID={folder.id}
                                    />
                                </li>
                            ))}
                    </ul>

                    {/* Chats */}
                    <div className="subheader grid-cols-[1fr_auto] gap-2">
                        <span className="block w-full font-semibold text-surface-950 dark:text-surface-50">
                            Chats
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

                    <ul
                        className={`max-h-full flex flex-col gap-2 mb-4 overflow-y-hidden ${chatsHidden ? "hidden" : "" }`}
                    >
                        {data.conversations &&
                            data.conversations.map((chat, index) => (
                                <li
                                    key={index}
                                    data-chat-id={chat.id}
                                    data-chat-active={
                                        chat.current ? true : false
                                    }
                                    onClick={() => {
                                        dispatch({
                                            type: "TOGGLE_CURRENT_ITEM",
                                            payload: chat.id,
                                        });
                                    }}
                                >
                                    <Slot
                                        header={chat.title}
                                        type={"chat"}
                                        isActive={
                                            chat.id ===
                                            data._currentConversationID
                                        }
                                        dataID={chat.id}
                                    />
                                </li>
                            ))}
                    </ul>
                </div>
            </div>

            {/* Action Button */}
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
        </aside>
    );
};

export default SearchAndChats;
