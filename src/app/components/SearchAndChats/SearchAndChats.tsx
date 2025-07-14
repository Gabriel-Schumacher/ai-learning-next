'use client';
import { useState, useContext, useEffect } from "react";
import { PlusSign, Chevron, SearchIcon } from "../IconsIMGSVG";
import { DataContextProvider } from "@/app/context_providers/data_context/DataProvider";
import Slot from "./SearchAndChatsItemSlot";
import * as Types from "@/lib/types/types_new";

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * This component is used to display the search bar, the folders provided to it, and the chats found in the folders.
 */
const SearchAndChats: React.FC = () => {
    const [foldersHidden, setFoldersHidden] = useState<boolean>(false);
    const [filesHidden, setFilesHidden] = useState<boolean>(false);

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [folders, setFolders] = useState<Types.FolderStructure[] | undefined>([]);
    const [files, setFiles] = useState<Types.BaseDataFile[] | undefined>([]);
    const [baseFoldersAndFiles, setbaseFoldersAndFiles] = useState<{
        folders: Types.FolderStructure[] | undefined;
        files: Types.BaseDataFile[] | undefined;
    }>({
        folders: undefined,
        files: undefined,
    });

    const context = useContext(DataContextProvider);
    if (!context) {
        throw new Error(
            "DataContextProvider must be used within a DataContextProvider"
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
                setFilesHidden(!filesHidden);
            }
        }
    };

    // Update the Core Local Component States when the provider data changes.
    /**
     * In other words, if something changes in the core data, update the local state of the component to have that data.
     */
    useEffect(() => {
        if (data.sortedData?.folders) {

            // Get all files found in EVERY folder.
            const folderFiles = data.sortedData.folders?.flatMap(folder => folder.files || []) || [];

            // Change the Folders.
            setbaseFoldersAndFiles(() => ({
                folders: data.sortedData?.folders || [],
                files: folderFiles || [],
            }));
        }

    }, [data, data.sortedData?.folders]);

    // Update the LOCAL states used for displaying the folders and chats when the PROVIDER data changes.
    /**
     * This effect is used to update the folders and chats when the data provider updates.
     * It is called when the component mounts and whenever the data provider updates. It does not depend on the search query.
     */ 
    useEffect(() => {
        if (baseFoldersAndFiles.folders) {
            setFolders(baseFoldersAndFiles.folders);
        }
        if (baseFoldersAndFiles.files) {
            setFiles(baseFoldersAndFiles.files);
        }
    }, [baseFoldersAndFiles]);

    // If the search query changes OR if the base folders and chats change, filter the folders and chats based on the search query.
    /**
     * This effect is used to filter the folders and chats based on the search query.
     * It is called whenever the search query changes or when the base folders and chats change.
     * It does not depend on the data provider, but rather on the local state of the component.
    */
    useEffect(() => {
        if (searchQuery && searchQuery !== "") {
            const filteredFolders = baseFoldersAndFiles.folders?.filter(folder =>
                folder.name.toLowerCase().includes(searchQuery.toLowerCase())
            ) || [];
            const filteredChats = baseFoldersAndFiles.files?.filter(chat =>
                chat.title.toLowerCase().includes(searchQuery.toLowerCase())
            ) || [];

            if (filteredFolders.length !== baseFoldersAndFiles.folders?.length) {
                setFolders(filteredFolders);
            }
            if (filteredChats.length !== baseFoldersAndFiles.files?.length) {
                setFiles(filteredChats);
            }
        } else {
            // If the search query is empty, reset to the original folders and chats.
            // We also should only show files that are in the target folder, if there even is one.

            let filesInFolder: Types.BaseDataFile[] | undefined = [];
            if (data.sortedData?.currentFolderId) {
                const targetFolder = baseFoldersAndFiles.folders?.find(folder =>
                    folder.id === data.sortedData?.currentFolderId
                );
                if (targetFolder) {
                    filesInFolder = targetFolder.files || [];
                }
            }
            setFolders(baseFoldersAndFiles.folders);
            setFiles(filesInFolder);
        }
    }, [searchQuery, data.sortedData?.currentFolderId, baseFoldersAndFiles.folders, baseFoldersAndFiles.files]);

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
                                dispatch({ type: "ADD_FOLDER", payload: { setActive: true } });
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
                                        folder.id === data.sortedData?.currentFolderId
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
                            Files
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

                    {/* Files */}
                    <ul
                        className={`max-h-full flex flex-col gap-2 mb-4 ${filesHidden ? "hidden" : "" }`}
                    >
                        {files &&
                            files.map((file, index) => (
                                <Slot
                                    key={index}
                                    data-chat-active={
                                        file.id === data.sortedData?.currentFileId
                                    }
                                    header={file.title}
                                    type={file.type !== 'conversation' ? "quiz" : "chat"}
                                    isActive={
                                        file.id ===
                                        data.sortedData?.currentFileId
                                    }
                                    dataID={file.id}
                                />
                            ))}
                    </ul>
                </div>
                {/* End of Folder Items Section */}
            </div>
            {/* End of Top Content */}

            {/* New Conversation Button */}
            <button
                disabled={data.sortedData?.currentFolderId ? false : true}
                onClick={() => {
                    dispatch({ type: "ADD_FILE", payload: { type: "conversation", setActive: true } });
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
