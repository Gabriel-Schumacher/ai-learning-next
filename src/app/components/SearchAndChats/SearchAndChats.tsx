'use client';
import { useState, useContext, useEffect } from "react";
import { PlusSign, Chevron, SearchIcon } from "../IconsIMGSVG";
import { AiDataProviderContext } from "../AiContextProvider/AiDataProvider";
import Slot from "./SearchAndChatsItemSlot";
import { LocalStorageContextProvider } from "@/app/context_providers/local_storage/LocalStorageProvider";
import { Conversation, Folder, Quiz } from "@/lib/types/types";

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * This component is used to display the search bar, the folders provided to it, and the chats found in the folders.
 */
const SearchAndChats: React.FC = () => {
    const [foldersHidden, setFoldersHidden] = useState<boolean>(false);
    const [chatsHidden, setChatsHidden] = useState<boolean>(false);

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [folders, setFolders] = useState<Folder[]>([]);
    const [chats, setChats] = useState<(Conversation | Quiz)[]>([]);

    const context = useContext(AiDataProviderContext);
    if (!context) {
        throw new Error(
            "AiDataProviderContext must be used within a AiDataProvider"
        );
    }
    const { data, dispatch } = context;

    const localContext = useContext(LocalStorageContextProvider)
    if (!localContext) {
        throw new Error(
            "LocalStorageContextProvider must be used within a LocalStorageProvider"
        );
    }
    const { local_data, local_dispatch } = localContext;

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

    // Update the folders and chats when the data is loaded.
    // This doesn't update it if the folders and chats are already set, to prevent unnecessary re-renders, or rerenders caused by just selecting or chatting. 
    useEffect(() => {
        if (!folders && data.folders) {
            setFolders(data.folders);
        }
        if (!chats && data.conversations) {
            setChats(data.conversations);
        }
    }, [data.folders, data.conversations, folders, chats]);

    // Testing purposes console logging.
    useEffect(() => {
        if (searchQuery !== "" && searchQuery !== undefined)
            console.debug("Search query updated: ", searchQuery);
        else
            console.debug("Search query cleared.");
    }, [searchQuery]);

    // Update the search query state when the search is removed.
    useEffect(() => {
        if ((searchQuery == "" || searchQuery == undefined) && data.folders) {
            console.debug("Search query cleared, updating folders.", data.folders);
            setFolders(data.folders);
        }
        if ((searchQuery == "" || searchQuery == undefined) && data.conversations) {
            console.debug("Search query cleared, updating chats.", data.conversations);
            setChats(data.conversations);
        }
    }, [searchQuery, data.folders, data.conversations]);

    useEffect(() => {
        // When the search query changes, filter the folders and chats based on the search query.
        if (searchQuery !== "") {
            const filteredFolders = data.folders?.filter(folder =>
                folder.name.toLowerCase().includes(searchQuery.toLowerCase())
            ) || [];
            const filteredChats = data.conversations?.filter(chat =>
                chat.title.toLowerCase().includes(searchQuery.toLowerCase())
            ) || [];

            setFolders(filteredFolders);
            setChats(filteredChats);
        } else {
            // If the search query is empty, reset to the original folders and chats.
            setFolders(data.folders || []);
            setChats(data.conversations || []);
        }
    }, [searchQuery, data.folders, data.conversations]);

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
                        onChange={(e) => setSearchQuery(e.target.value)}
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
                            onClick={() => {
                                dispatch({ type: "ADD_FOLDER" });
                                local_dispatch({
                                    type: "SAVE",
                                    payload: {
                                        id: -1,
                                        name: "Saved Folder",
                                        type: "folder",
                                        current: false,
                                        attached_items: []
                                    },
                                });
                            }}
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
                        {folders &&
                            folders.map((folder, index) => (
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
                        {chats &&
                            chats.map((chat, index) => (
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
                className="btn w-full flex justify-between mt-1"
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
