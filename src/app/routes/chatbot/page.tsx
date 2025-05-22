"use client"
import SearchAndChats from "../../components/SearchAndChats"
import AiChat from "../../components/AiChat"
import AiMenu from "../../components/AiMenu"
import { useState, useEffect } from "react"
import { Conversations, Folders, Conversation, ChatResponse, Folder } from  '../../../lib/types/types'
import { clientAddMessageToConversation, clientHandleDifferentChat, clientToggleCurrentFolder, clientToggleCurrentChat, clientGetRandomID, clientAddConversation} from "./helperfunctions"
const BASE_URL = process.env.BASE_URL || '../../api/chat/route.ts';

function ChatBot() {
    const [conversations, setConversations] = useState<Conversations>([])
    const [folders, setFolders] = useState<Folders>([])
    const [currentConversation, setCurrentConversation] = useState<Conversation | undefined>(undefined)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<null|string>(null)

    /* 
        Functional Stuff. Created here and passed to children for them to to use. Also can be used to connect to the helepr functions and/or server.
    */
    // CLIENT SIDE - Adds the response to the current conversation and returns the updated conversation.
    // Used as a param in the AiChat and AiMenu component.
    function addToHistory(response: ChatResponse): Conversation {
        let CURRENT_FOLDER = folders.find(folder => folder.current)
        let CURRENT_CONVERSATION = currentConversation
        // First check if there is a current folder/conversation

        if (!CURRENT_FOLDER && !CURRENT_CONVERSATION) {
            // If no current folder then make one and add the conversation to it..
            CURRENT_CONVERSATION = { id: 1, title: "New Conversation", current: true, messages: [response] };
            const newFolder = addFolder([CURRENT_CONVERSATION])
            setConversations(newFolder.attached_conversations as Conversations)
            setCurrentConversation(CURRENT_CONVERSATION as Conversation)
            if (newFolder) {
                CURRENT_FOLDER = newFolder
                console.log("Created Folder: ", newFolder)
            }
        } else if (!CURRENT_CONVERSATION && CURRENT_FOLDER) {
            // If there WAS a current folder but there isn't a current conversation, then add the conversation to the current folder.
            addConversation()
            console.log("Folder with Chat:", folders.find(folder => folder.current))
            const newConversation = folders.find(folder => folder.current)?.attached_conversations.slice(-1)[0]
            if (newConversation) {
                console.log("Found new conversation ID:", newConversation.id)

                // Add the response to the conversation
                newConversation.messages = [...newConversation.messages, response]
                
                // Set it to the current chat
                toggleChats(newConversation.id)

                // Update the States
                setCurrentConversation(newConversation as Conversation)
            }
        } else if (CURRENT_CONVERSATION && CURRENT_FOLDER) {
            // If both already exist, we just need to add the message to the current conversation.
            const UPDATED_FOLDER = clientAddMessageToConversation(response, CURRENT_FOLDER)
            if (UPDATED_FOLDER) {
                setFolders(folders.map(folder => folder.id === UPDATED_FOLDER.id ? UPDATED_FOLDER : folder))
            }
        }

        return CURRENT_CONVERSATION as Conversation
    }

    // NOT SET UP - CLIENT SIDE - Removes the message from the current conversation and returns the updated conversation.
    // Used as a param in the AiChat component.
    function removeFromHistory(index: number) {
       return
    }

    // CLIENT SIDE - Adds a new folder to the folders array and sets it as the current folder if conversations is provided. 
    // Used as a param in the SearchAndChats component.
    function addFolder(conversations:Conversations|null=null):Folder {
        // returns the id of the new folder
        const ID = clientGetRandomID(folders)
        // IF conversations is provided, then this folder is set as the current one.
        const newFolder = { id: ID, name: "New Folder", current: conversations ? true : false, attached_conversations: conversations ? conversations : [] as Conversations }
        setFolders([...folders, newFolder])
        return newFolder
    }

    // NOT SET UP - CLIENT SIDE - Removes the folder from the folders array and sets the first folder as the current one if it exists.
    // Used as a param in the SearchAndChats component.
    function removeFolder(index: number) {
        console.log("Remove folder clicked")
        return
    }

    // CLIENT SIDE - Adds a new conversation to the current folder and sets it as the current conversation.
    // Used as a param in the SearchAndChats component.
    function addConversation():Folders {
        const newFolders = clientAddConversation(folders);
        setFolders(newFolders)
        setConversations(newFolders.find(folder => folder.current)?.attached_conversations as Conversations)
        return newFolders
    }

    // NOT SET UP - CLIENT SIDE - Deletes the conversation from the folder it belongs to.
    // Used as a param in the SearchAndChats component.
    function removeChat(index: number) {
        console.log("Remove chat clicked")
        return
    }

    // CLIENT SIDE - Toggles the DISPLAY OF current folders in the side bar.
    // Used as a param in the SearchAndChats component.
    function toggleFolders(id: number) {
        const updatedFolders = clientToggleCurrentFolder(id, folders)
        setFolders(updatedFolders)
        const currentFolder = updatedFolders.find(folder => folder?.current);
        if (currentFolder && currentFolder.attached_conversations) {
            setConversations(currentFolder.attached_conversations as Conversations);
        } else {
            setConversations([]);
        }
        setCurrentConversation(undefined);
    }

    // CLIENT SIDE - Toggles the DISPLAY OF current conversations in the side bar.
    // Used as a param in the SearchAndChats component.
    function toggleChats(id: number) {
        setLoading(true)
        const updatedFolders = clientToggleCurrentChat(id, folders)
        setFolders(updatedFolders)
        const currentFolder = updatedFolders.find(folder => folder.current);
        if (currentFolder && currentFolder.attached_conversations) {
            setConversations(currentFolder.attached_conversations as Conversations);
        } else {
            setConversations([]);
        }
        const currentConversation = updatedFolders.flatMap(folder => folder.attached_conversations).find(conversation => conversation.current);
        if (currentConversation) {
            setCurrentConversation(currentConversation as Conversation);
        } else {
            setCurrentConversation(undefined);
        }
    }

    // CLIENT SIDE - Handles the different chat when the user clicks on a different chat in the sidebar.
    // Used as a param in the SearchAndChats component.
    function handleDifferentChat(index: number) {
        const updatedFolders = clientHandleDifferentChat(index, folders)
        setFolders(updatedFolders)
    }


    /*
        What to do when rendering the page.
    */
    useEffect(() => {
        const fetchChatHistory = async () => {
            setLoading(true)
            try {
                let USER_ID = localStorage.getItem("userId")
                if (!USER_ID) {
                    USER_ID = "guest"
                }
                console.log('Pinging:', `${BASE_URL}/api/chatHistory/${USER_ID}`)
                const chatHistory = await fetch(`${BASE_URL}/api/chatHistory/${USER_ID}`)
                if (!chatHistory.ok) {
                    throw new Error("Network response was not ok")
                }
                const data = await chatHistory.json()
                setFolders(data.folders.map((folder: any) => ({ ...folder, current: false })))
            } catch (error) {
                console.error("Error fetching conversations:", error)
                setError((error as Error).message)
            }
        }
        fetchChatHistory().then(() => {
            setLoading(false)
        })
    }
    , [])

    return (
      <div className="flex flex-col h-full lg:flex-row gap-4 w-full">
        <SearchAndChats folders={folders} chats={conversations.map(({ title, id, current }) => ({ title, id, current }))} folderActions={{addFolder, removeFolder, addConversation, removeChat, toggleFolders, toggleChats, handleDifferentChat}}/>
        {/* Menu, What greets the user or what shows when they are starting a new conversation. */}
        {!currentConversation && !error && 
            <AiMenu addToHistory={addToHistory}/>
        }
        {/* When Chatting */}
        {currentConversation && !error && 
            <AiChat loading={loading} setLoading={setLoading} chatHistory={currentConversation} addToHistory={addToHistory} removeFromHistory={removeFromHistory}/>
        }
        {/* Error Message */}
        {error && 
            <div className="w-full h-full grid place-items-center">
                <div>
                    <p className="bg-error-500 rounded py-1 px-2 text-surface-50 font-bold mb-2">Sorry, there was an error:</p>
                    <p className="text-surface-900 dark:text-surface-50 text-center">{error}</p>
                </div>
            </div>
        }
      </div>
    )
  }
  
  export default ChatBot