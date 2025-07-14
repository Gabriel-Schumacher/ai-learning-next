"use client"
import SearchAndChats from "./components/SearchAndChats/SearchAndChats"
import AiChat from "./components/AiChat"
import AiMenu from "./components/AiMenu"
import FigmaNavigation from "./components/FigmaNavigation"
import { useContext } from "react"
import { DataContextProvider } from "@/app/context_providers/data_context/DataProvider"
// import AiQuiz from "./components/AiQuizNOTINUSE/AiQuiz"
import Quiz from "./routes/quiz/page"
import DataCreation from "./routes/datacreation/page"
import WritingAid from "./routes/writingaid/page"
// import QuizContextProvider from "./components/AiQuizNOTINUSE/QuizContext"

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

function Home() {
    const context = useContext(DataContextProvider);
    if (!context) {
        throw new Error("DataContextProvider must be used within a DataContextProvider");
    }
    const { data } = context;

    return (
      <main className="flex flex-col h-full lg:flex-row gap-2 w-full">
        <SearchAndChats />
        <div className="w-full mr-2 grid grid-rows-[auto_1fr]">
            <FigmaNavigation actions={() => {}}/>
            <div className="w-full h-full">
                { !data.errorMessage &&
                    <>
                        {/* Menu, What greets the user or what shows when they are starting a new conversation. */}
                        {data.sortedData?.currentPage === "HOME" &&
                            <AiMenu />
                        }
                        {/* When Chatting */}
                        {data.sortedData?.currentPage === "CHAT" &&
                            <AiChat />
                        }
                        {/* Data Creation */}
                        {data.sortedData?.currentPage === "DATA_CREATION" &&
                            <DataCreation />
                        }
                        {/* Quiz */}
                        {data.sortedData?.currentPage === "QUIZ" &&
                            <Quiz />
                            /*
                                OLD QUIZ COMPONENT, NOT IN USE
                            <QuizContextProvider>
                                <AiQuiz />
                            </QuizContextProvider>
                            */
                        }
                        {/*WritingAid/Essay */}
                        {data.sortedData?.currentPage === "ESSAY" &&
                            <WritingAid />
                        }
                        {/* Error when no page is set. */}
                        {!data.sortedData?.currentPage &&
                        <div className="w-full h-full grid place-items-center">
                            <div>
                                <p className="bg-error-500 rounded py-1 px-2 text-surface-950-50 font-bold mb-2">Sorry, there was an error:</p>
                                <p className="text-surface-900 dark:text-surface-50 text-center">No Page Set</p>
                            </div>
                        </div>  
                        }
                    </>
                }

                {/* Error Message */}
                {data.errorMessage &&
                    <div className="w-full h-full grid place-items-center">
                        <div>
                            <p className="bg-error-500 rounded py-1 px-2 dark:text-black text-surface-950-50 font-bold mb-2">Sorry, there was an error:</p>
                            <p className="text-surface-900 dark:text-surface-100 text-center">{data.errorMessage}</p>
                        </div>
                    </div>
                }
            </div>
        </div>
      </main>
    )
  }
  
  export default Home