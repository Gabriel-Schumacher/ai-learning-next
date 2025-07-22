import { useState } from "react";
import { useRouter } from "next/router";
import { Aa, Document, ChatBoxFilled, Arrow } from "./IconsIMGSVG";



function AiEssay() {
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();
  return (
    <div className="w-full h-[80vh] grid place-items-center grid-cols-1 place-self-center">
        <div className="h-[80vh] w-full flex flex-col justify-center items-start py-16 px-8 gap-4 bg-surface-200 dark:bg-surface-400 border border-transparent rounded-xl drop-shadow-md">
            <h1 className="lg:text-6xl text-4xl text-primary-500 font-bold my-0 text-center w-full">How Can I Help You Today?</h1>
            <p className="text-center dark:text-white">Our AI learning assistant is designed to provide personalized, real-time support to help you learn more effectively. Whether you&39;re studying for an exam, picking up a new skill, or tackling a tough topic, our AI assistant makes learning engaging and efficient.</p>
            <div className="grid grid-cols-3 gap-2 [&>a]:hover:cursor-pointer [&>a]:p-4 [&>a]:rounded-md [&>a]:border [&>a]:border-transparent [&>a]:dark:bg-surface-600 [&>a]:bg-white [&>a]:flex [&>a]:flex-col [&>a]:items-center [&>a]:gap-2 [&>a]:text-black [&>a]:dark:text-white [&>a]:text-center [&>a>span]:text-xs">
                <a className="flex flex-col items-center gap-2 text-black dark:text-white text-center p-4 rounded-md border border-transparent dark:bg-surface-600 bg-white hover:cursor-pointer">
                    <Document background={false} width="w-8" special={true}/>
                    <h2>I Need To Write An Essay</h2>
                    <span>Get help with your writing, look like a pro.</span>
                </a>
                <a className="flex flex-col items-center gap-2 text-black dark:text-white text-center p-4 rounded-md border border-transparent dark:bg-surface-600 bg-white hover:cursor-pointer">
                    <ChatBoxFilled background={false} width="w-8" special={true}/>
                    <h2>I Need Help With A Discussion Post</h2>
                    <span>Turn your insights into a discussion response.</span>
                </a>
                <a className="flex flex-col items-center gap-2 text-black dark:text-white text-center p-4 rounded-md border border-transparent dark:bg-surface-600 bg-white hover:cursor-pointer">
                    <Aa background={false} width="w-8" special={true}/>
                    <h2>How Do I Write In __ Format?</h2>
                    <span>Make sure your paper follows the correct format.</span>
                </a>
            </div>
            <div className="bg-white dark:bg-surface-300 rounded-lg px-4 py-2 w-full grid grid-cols-[1fr_auto] gap-2 drop-shadow-md">
                <input 
                    type="text" 
                    placeholder="Type your prompt here..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2 border border-transparent rounded focus:outline-none focus:ring-2 focus:ring-transparent focus:border-transparent focus:text-[#2D2D2A] [&:focus::placeholder]:text-[#2D2D2A] truncate dark:bg-surface-300 [&:focus::placeholder]:dark:text-white focus:dark:text-white [&::placeholder]:dark:text-surface-100 dark:text-white"
                />
                <button 
                    onClick={() => {
                        router.push(`/figma/aiChat/${searchQuery.replace(/\s/g, '|').toLowerCase()}`);
                    }}
                >
                    <Arrow special={true} background={false} width="w-4"/>
                </button>
            </div>
        </div>
    </div>
  );
}

export default AiEssay;
