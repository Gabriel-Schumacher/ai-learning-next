"use client"
import SearchAndChats from "../../components/SearchAndChats/SearchAndChats"
import AiChat from "../../components/AiChat"
import AiMenu from "../../components/AiMenu"
import FigmaNavigation from "../../components/FigmaNavigation"
import { useEffect, useContext } from "react"
import { AiDataProviderContext } from "../../components/AiContextProvider/AiDataProvider"
import AiQuiz from "../../components/AiQuiz/AiQuiz"
import QuizContextProvider from "../../components/AiQuiz/QuizContext"
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

function ChatBot() {
    const context = useContext(AiDataProviderContext);
    if (!context) {
        throw new Error("AiDataProviderContext must be used within a AiDataProvider");
    }
    const { data, dispatch } = context;


    /*
        What to do when rendering the page.
    */
    useEffect(() => {
        const fetchChatHistory = async () => {
            dispatch({ type: "SET_LOADING", payload: true })
            try {
                if (data.folders && data.folders.length > 0) {
                    return // Don't override it if there already is data.
                }
                let USER_ID = localStorage.getItem("userId")
                if (!USER_ID) {
                    USER_ID = "guest"
                }
                const chatHistory = await fetch(`${BASE_URL}/api/chatHistory/${USER_ID}`)
                if (!chatHistory.ok) {
                    dispatch({ type: "SET_ERROR", payload: "Failed to fetch chat history" })
                }
                const DATA = await chatHistory.json()
                dispatch({ type: "SET_FOLDERS", payload: DATA.folders })
            } catch (error) {
                console.error("Error fetching conversations:", error)
                dispatch({ type: "SET_ERROR", payload: (error as Error).message })
            }
        }
        fetchChatHistory().then(() => {
            dispatch({ type: "SET_LOADING", payload: false })
        })
    }
    , [dispatch, data.folders])

    return (
      <div className="flex flex-col h-full lg:flex-row gap-2 w-full">
        <SearchAndChats />
        <div className="w-full grid grid-rows-[auto_1fr]">
            <FigmaNavigation actions={() => {}}/>
            <div className="w-full h-full">
                { !data.error &&
                    <>
                        {/* Menu, What greets the user or what shows when they are starting a new conversation. */}
                        {data.currentPage === "HOME" &&
                            <AiMenu />
                        }
                        {/* When Chatting */}
                        {data.currentPage === "CHAT" &&
                            <AiChat />
                        }
                        {/* Quiz */}
                        {data.currentPage === "QUIZ" &&
                            <QuizContextProvider>
                                <AiQuiz />
                            </QuizContextProvider>
                        }
                        {/* Data Creation */}
                        {data.currentPage === "DATA_CREATION" &&
                            <div className="w-full h-full grid place-items-center">
                                <div>
                                    <p className="bg-error-500 rounded py-1 px-2 text-surface-950-50 font-bold mb-2">Not set up yet 😞</p>
                                </div>
                            </div>
                        }
                    </>
                }

                {/* Error Message */}
                {data.error &&
                    <div className="w-full h-full grid place-items-center">
                        <div>
                            <p className="bg-error-500 rounded py-1 px-2 text-surface-950-50 font-bold mb-2">Sorry, there was an error:</p>
                            <p className="text-surface-900 dark:text-surface-50 text-center">{data.error}</p>
                        </div>
                    </div>
                }
            </div>
        </div>
      </div>
    )
  }
  
  export default ChatBot