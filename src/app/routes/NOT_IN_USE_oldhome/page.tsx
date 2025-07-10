"use client"
import Link from 'next/link'

export default function Home() {
  return (
    <main>
        <div className="w-full grid place-items-center grid-cols-1 lg:grid-cols-2 place-self-center gap-2">
            
            <div className="w-full flex flex-col justify-center items-start gap-2">
                <h1 className="h2 dark:text-surface-50">AI Learning Assistant</h1>
                <p className="dark:text-surface-50">Our AI learning assistant is designed to provide personalized, real-time support to help you learn more effectively. Whether you&#39;re studying for an exam, picking up a new skill, or tackling a tough topic, our AI assistant makes learning engaging and efficient. It&#39;s like having a tutor available 24/7 to guide you through challenges and help you reach your goals faster.</p>
                <div className="flex flex-row gap-2">
                    <Link href="/AiChat"><button type="button" className="btn lg">Get Started</button></Link>
                    <Link href="/AiChat"><button className="btn lg">Practice Test</button></Link>
                </div>
            </div>

            <div className="w-full flex flex-col justify-center items-start gap-2">
                <div className="h-[100px] lg:h-36 bg-gray-500 rounded-xl grid justify-start items-end p-8 w-full">
                    <h2 className="text-white font-semibold text-lg">Essay Builder</h2>
                </div>
                <div className="h-[100px] lg:h-36 bg-gray-500 rounded-xl grid justify-start items-end p-8 w-full">
                    <h2 className="text-white font-semibold text-lg">Flashcard Generator</h2>
                </div>
                <div className="h-[100px] lg:h-36 bg-gray-500 rounded-xl grid justify-start items-end p-8 w-full">
                    <h2 className="text-white font-semibold text-lg">ePub Reader</h2>
                </div>
            </div>

        </div>

        <div className="card w-full bg-primary-900 p-4 grid place-items-center place-self-center my-8">
            <h2 className="h4 text-white text-center">Designed to Maximize Your Learning</h2>
        </div>

        <div className="w-full grid place-items-center grid-cols-1 gap-4 place-self-center">

            <div className="w-full grid place-items-center grid-cols-1 lg:grid-cols-2 place-self-center gap-4">
                <div className="w-full flex flex-col justify-center items-start gap-2">
                    <h2 className="h2 dark:text-surface-50">Essay Building, made easy.</h2>
                    <p className="dark:text-surface-50">Our AI learning assistant is designed to provide personalized, real-time support to help you learn more effectively. Whether you&#39;re studying for an exam, picking up a new skill, or tackling a tough topic, our AI assistant makes learning engaging and efficient. It&#39;s like having a tutor available 24/7 to guide you through challenges and help you reach your goals faster.</p>
                </div>

                <div className="w-full flex flex-col justify-center items-start gap-2">
                    <div className="h-[300px] lg:h-72 bg-gray-200 rounded-xl grid justify-start items-end p-8 w-full">
                        <h2 className="text-[#2D2D2A] font-semibold text-lg">Image Text</h2>
                    </div>
                </div>
            </div>

            <div className="w-full grid place-items-center grid-cols-1 lg:grid-cols-2 place-self-center gap-4">
                <div className="w-full flex flex-col justify-center items-start gap-2">
                    <h2 className="h2 dark:text-surface-50">Create Flashcards with no hassle</h2>
                    <p className="dark:text-surface-50">Our AI learning assistant is designed to provide personalized, real-time support to help you learn more effectively. Whether you&#39;re studying for an exam, picking up a new skill, or tackling a tough topic, our AI assistant makes learning engaging and efficient. It&#39;s like having a tutor available 24/7 to guide you through challenges and help you reach your goals faster.</p>
                </div>
                <div className="w-full flex flex-col justify-center items-start gap-2">
                    <div className="h-[300px] lg:h-72 bg-gray-200 rounded-xl grid justify-start items-end p-8 w-full">
                        <h2 className="text-[#2D2D2A] font-semibold text-lg">Image Text</h2>
                    </div>
                </div>
            </div>

        </div>
    </main>
  );
}
