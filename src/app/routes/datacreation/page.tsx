"use client";

import { useState, useEffect } from "react";
import { useReadableStream } from "../../components/useReadableStream";
import DOMPurify from "dompurify";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import css from "highlight.js/lib/languages/css";
import cpp from "highlight.js/lib/languages/cpp";
import csharp from "highlight.js/lib/languages/csharp";
// Add a highlight.js theme import
import "highlight.js/styles/github.css"; // You can choose a different theme like 'atom-one-dark.css', 'monokai.css', etc.
import PencilIcon from "@/app/components/customSvg/Pencil";
import DriveIcon from "@/app/components/customSvg/Drive"; 
import FolderIcon from "@/app/components/customSvg/Folder";
import OneIcon from "@/app/components/customSvg/One";
import TwoIcon from "@/app/components/customSvg/Two";
// import { numberOfQustions } from "@/app/api/dataCreation/route";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("css", css);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("csharp", csharp);

const marked = new Marked(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight: (code, lang) => {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  })
);

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function DataCreation() {
  const response = useReadableStream();
  const [responseText, setResponseText] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(1); // Add state for number of questions
  const [subject, setSubject] = useState<string>("General");
  //const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage on the client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedChatHistory = localStorage.getItem("chatHistory");
      if (storedChatHistory) {
        setChatHistory(JSON.parse(storedChatHistory));
      }
    }
  }, []);

  function stripThinkTags(text: string): string {
    const thinkRegex = /<think>[\s\S]*?<\/think>/g;
    return text.replace(thinkRegex, "");
  }

  useEffect(() => {
    if (response.text !== "") {
      (async () => {
        // Strip <think> tags from the response text
        // const cleanedText = stripThinkTags(response.text);
        // Parse the cleaned text as Markdown
        const parsedText = await marked.parse(response.text);
        // Sanitize the parsed HTML
        setResponseText(
          DOMPurify.sanitize(parsedText)
            .replace(/<script>/g, "&lt;script&gt;")
            .replace(/<\/script>/g, "&lt;/script&gt;")
        );
        // setResponseText(parsedText);
      })();
    }
  }, [response.text]); // Added dependency array to avoid infinite re-renders

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    }
  }, [chatHistory]); // Added dependency array to avoid infinite re-renders

  function handleKeydown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const target = event.target as HTMLTextAreaElement;
      const form = target.closest("form");
      if (form) {
        const syntheticEvent = {
          ...event,
          currentTarget: form,
          preventDefault: () => event.preventDefault(),
        } as React.FormEvent<HTMLFormElement>;
        handleSubmit(syntheticEvent);
      }
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (response.loading) return;

    const formData: FormData = new FormData(event.currentTarget);
    const message = formData.get("message")?.toString().trim();
    const topicInput = formData.get("topic")?.toString().trim();
    const numQuestionsInput = formData.get("numQuestions")?.toString().trim(); // Get number of questions from form data

    const numQuestions = parseInt(numQuestionsInput || "1"); // Parse and ensure valid number
    const validNumberOfQuestions = isNaN(numQuestions) || numQuestions < 1 ? 1 : numQuestions;

    if (topicInput) {
      setSubject(topicInput);
    }

    if (!message) return;

    // Immediately update chat history with user's message
    setChatHistory((prev: ChatMessage[]) => [
      ...prev,
      { role: "user", content: message },
    ]);

    // Send updated chat history to API
    const updatedChatHistory = [
      ...chatHistory,
      { role: "user", content: message },
    ];

    try {
      console.log("Sending request with numberOfQuestions:", validNumberOfQuestions);

      const answer = response.request(
        new Request("/api/dataCreation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chats: updatedChatHistory,
            systemPrompt: "jsondata",
            subject: topicInput || subject,
            numberOfQuestions: validNumberOfQuestions, // Pass the correct number of questions
            deepSeek: false,
          }),
        })
      );

      event.currentTarget.reset();

      const answerText = (await answer) as string;
      console.log("Server response:", answerText);

      // Check if the response is an object instead of an array and wrap it if needed
      let formattedAnswer = answerText;
      try {
        const parsedAnswer = JSON.parse(answerText);
        if (parsedAnswer && !Array.isArray(parsedAnswer) && parsedAnswer.question) {
          formattedAnswer = JSON.stringify([parsedAnswer]);
          console.log("Converted single object to array:", formattedAnswer);
        }
      } catch (e) {
        console.error("Error parsing response JSON:", e);
      }

      const parsedAnswer = await marked.parse(formattedAnswer);
      const purifiedText = DOMPurify.sanitize(parsedAnswer)
        .replace(/<script>/g, "&lt;script&gt;")
        .replace(/<\/script>/g, "&lt;/script&gt;");

      setChatHistory((prev: ChatMessage[]): ChatMessage[] => [
        ...prev,
        { role: "assistant", content: purifiedText },
      ]);
    } catch (e) {
      console.error("Error in handleSubmit:", e);
    }
  }

  function deleteAllChats() {
    setChatHistory([]);
  }

  (async () => {
    if (response.text !== "") {
      // Strip <think> tags from the response text
      const cleanedText = stripThinkTags(response.text);
      const parsedText = await marked.parse(cleanedText);
      const sanitizedText = DOMPurify.sanitize(parsedText)
        .replace(/<script>/g, "&lt;script&gt;")
        .replace(/<\/script>/g, "&lt;/script&gt;");
      setResponseText(sanitizedText); // Use state updater function
    }
  })();

  function saveData(index: number): void {
    const chat = chatHistory[index];
    if (chat && chat.role === "assistant") {
      const blob = new Blob([chat.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chat_data_${index}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      console.error("Invalid chat data or index.");
    }
  }
  //End of Logic-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  return (
    <div>
      <div className="flex flex-col">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="bg-surface-200 p-12 rounded-lg shadow-md mb-4 flex flex-col gap-4">
            <div className="mb-4">
              <h1 className="text-primary-500 h2">Welcome to Data Creation!</h1>
              <p>How would you like to study?</p>
            </div>   
            <div className="flex gap-4">
              <div className="flex gap-1 text-primary-500"><div className="w-[24px] h-[24px]"><OneIcon/></div> Setup</div>
              <div className="flex gap-1 text-surface-700"><div className="w-[24px] h-[24px]"><TwoIcon/></div>2 Customize</div>
            </div>       
            <div>
              <label className="text-primary-500">Topic</label>
              <input 
                className="input bg-white rounded-xl shadow-lg" 
                type="text" 
                name="topic"
              />
            </div>
            <div>
              <label className="text-primary-500">Number of Questions</label>
              <input 
                className="input bg-white rounded-xl shadow-lg" 
                type="number" 
                name="numQuestions"
                value={numberOfQuestions}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setNumberOfQuestions(isNaN(value) || value < 1 ? 1 : value); // Ensure valid number
                }}
                min="1"
              />
            </div>
            <div>
              <label className="text-primary-500">Upload</label>
              <div className="flex gap-2 mb-2">
                 <button className="bg-white text-primary-500 rounded-full p-2 shadow-lg flex gap-1 hover:bg-surface-100 hover:shadow-xl"><div className="w-[24px] h-[24px]"><FolderIcon /></div>File Upload</button>
                 <button className="bg-primary-500 text-white rounded-full p-2 shadow-lg flex gap-1 hover:bg-primary-300 hover:shadow-xl"><div className="w-[24px] h-[24px]"><PencilIcon /></div>Question Type</button>
                 <button className="bg-white text-primary-500 rounded-full p-2 shadow-lg flex gap-1 hover:bg-surface-100 hover:shadow-xl"><div className="w-[24px] h-[24px]"><DriveIcon /></div>Google Drive Upload</button>
 
              </div>
              <textarea required onKeyDown={handleKeydown} name="message" className="textarea bg-white rounded-xl shadow-lg h-28" id="prompt" placeholder="Paste text or type about what you'd like to study"></textarea>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="bg-primary-500 text-white rounded-full px-6 py-2 shadow-lg hover:bg-primary-300 hover:shadow-xl">Next</button>
              <button
                type="button"
                className="btn bg-red-500 text-white p-2 rounded-lg"
                onClick={deleteAllChats}
              >
                Clear Chats
              </button>
            </div>
          </div>
          {/* Old stuff starts here */}
          <div className="chat-container h-[60vh] overflow-y-auto space-y-4 px-4">
            {chatHistory.map((chat: ChatMessage, index: number) =>
              chat.role === "user" ? (
                <div key={index} className="ml-auto flex justify-end space-x-2">
                  <div className="user-chat bg-primary-50 p-2 rounded-lg">
                    {chat.content}
                  </div>
                </div>
              ) : (
                <div key={index} className="mr-4 flex space-x-2 ">
                  <div className="assistant-chat bg-white-200 shadow-lg p-2 rounded-lg max-w-[90%]">
                    <button
                      className="my-2 btn preset-filled-primary-500"
                      onClick={() => saveData(index)}
                    >
                      Save Data
                    </button>
                    <code>
                      <div dangerouslySetInnerHTML={{ __html: chat.content }} />
                    </code>
                  </div>
                </div>
              )
            )}
            {response.loading && (
              <div className="flex space-x-2">
                <div className="assistant-chat bg-gray-200 p-2 rounded-lg">
                  {response.text === "" ? (
                    <div className="flex">
                      <p>Collating&nbsp;</p>
                      <span className="animate-pulse">...</span>
                    </div>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: responseText }} />
                  )}
                </div>
              </div>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}
export default DataCreation;
