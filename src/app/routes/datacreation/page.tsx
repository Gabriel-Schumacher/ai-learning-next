"use client";

import { useState, useEffect, useRef } from "react";
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
  const chatContainerRef = useRef<HTMLDivElement>(null);

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

    if (!message) return;

    // Immediately update chat history with user's message
    setChatHistory((prev: ChatMessage[]) => [
      ...prev,
      { role: "user", content: message },
    ]);

    // Send updated chat history to API (safe to construct here)
    const updatedChatHistory = [
      ...chatHistory,
      { role: "user", content: message },
    ];

    try {
      const answer = response.request(
        new Request("/api/dataCreation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chats: updatedChatHistory,
            systemPrompt: "jsondata",
            subject: "General",
          }),
        })
      );

      event.currentTarget.reset();

      const answerText = (await answer) as string;
      console.log("Server response:", answerText);

      const parsedAnswer = await marked.parse(answerText);
      const purifiedText = DOMPurify.sanitize(parsedAnswer)
        .replace(/<script>/g, "&lt;script&gt;")
        .replace(/<\/script>/g, "&lt;/script&gt;");

      // Use functional update again to avoid stale state
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

  // Add copy button to code blocks
  useEffect(() => {
    const addCopyButtons = () => {
      if (!chatContainerRef.current) return;

      const codeBlocks = chatContainerRef.current.querySelectorAll("pre code");

      codeBlocks.forEach((codeBlock) => {
        const pre = codeBlock.parentElement;
        if (!pre || pre.querySelector(".copy-button")) return;

        // Create copy button
        const button = document.createElement("button");
        button.className = "copy-button";

        // Apply styles directly to the button
        Object.assign(button.style, {
          position: "absolute",
          top: "4px",
          right: "4px",
          height: "20px",
          width: "20px",
          borderRadius: "3px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#4b5563",
          cursor: "pointer",
          padding: "0",
          margin: "0",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
        });

        button.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                        <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                    </svg>
                `;

        button.addEventListener("click", () => {
          const code = codeBlock.textContent || "";
          navigator.clipboard.writeText(code).then(() => {
            button.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                            </svg>
                        `;
            setTimeout(() => {
              button.innerHTML = `
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                                    <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                                </svg>
                            `;
            }, 1500);
          });
        });

        pre.style.position = "relative";
        pre.insertBefore(button, pre.firstChild); // Insert button as the first child

        // Add hover effect manually
        pre.addEventListener("mouseenter", () => {
          button.style.opacity = "1";
        });

        pre.addEventListener("mouseleave", () => {
          button.style.opacity = "0";
        });
      });
    };

    // Run initially and after chat updates
    addCopyButtons();

    // Use MutationObserver to detect when new code blocks are added
    const observer = new MutationObserver(addCopyButtons);
    if (chatContainerRef.current) {
      observer.observe(chatContainerRef.current, {
        childList: true,
        subtree: true,
      });
    }

    return () => observer.disconnect();
  }, [chatHistory, responseText]);

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
              <div>1 Setup</div>
              <div>2 Customize</div>
            </div>       
            <div>
              <label className="text-primary-500">Test Type</label>
              <input className="input bg-white rounded-xl shadow-lg" type="text" />
            </div>
            <div>
              <label className="text-primary-500">Test Format</label>
              <input className="input bg-white rounded-xl shadow-lg" type="text" />
            </div>
            <div>
              <label className="text-primary-500">Upload</label>
              <div className="flex gap-2 mb-2">
                 <button className="bg-white text-primary-500 rounded-full p-2 shadow-lg flex gap-1 hover:bg-surface-100"><div className="w-[24px] h-[24px]"><FolderIcon /></div>File Upload</button>
                 <button className="bg-primary-500 text-white rounded-full p-2 shadow-lg flex gap-1 hover:bg-primary-300"><div className="w-[24px] h-[24px]"><PencilIcon /></div>Question Type</button>
                 <button className="bg-white text-primary-500 rounded-full p-2 shadow-lg flex gap-1 hover:bg-surface-100"><div className="w-[24px] h-[24px]"><DriveIcon /></div>Google Drive Upload</button>
 
              </div>
              <textarea className="textarea bg-white rounded-xl shadow-lg h-28" name="prompt" id="prompt"></textarea>
            </div>
            <div className="flex justify-end">
              <button className="bg-primary-500 text-white rounded-full px-6 py-2 shadow-lg hover:bg-primary-300">Next</button>
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
            <br />
          </div>
          <div className="flex space-x-4">
            <textarea
              className="textarea border p-2 rounded-lg w-full"
              required
              placeholder="Type your message..."
              name="message"
              rows={3}
              onKeyDown={handleKeydown}
            ></textarea>
            <div className="flex flex-col justify-between">
              <button
                type="submit"
                className="btn bg-blue-500 text-white p-2 rounded-lg"
              >
                Send
              </button>
              <button
                type="button"
                className="btn bg-red-500 text-white p-2 rounded-lg"
                onClick={deleteAllChats}
              >
                Clear Chats
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
export default DataCreation;
