import { useState, useRef, useEffect } from "react";
import DOMPurify from "dompurify";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import css from "highlight.js/lib/languages/css";
import cpp from "highlight.js/lib/languages/cpp";
import csharp from "highlight.js/lib/languages/csharp";
import LoadingIcon from "./LoadingIcon";

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

interface WritingAidChatProps {
  writingText: string;
}

const WritingAidChat: React.FC<WritingAidChatProps> = ({ writingText }) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("writingAidChatHistory");
      if (stored) setChatHistory(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("writingAidChatHistory", JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (loading || !input.trim()) return;

    if (!writingText || writingText.trim() === "") {
      setError("Please enter some text in the writing editor before chatting.");
      return;
    }

    const userMsg = { role: "user" as const, content: input.trim() };
    setInput("");
    setLoading(true);

    setChatHistory(prev => [...prev, userMsg]);

    try {
      const body = {
        chats: [...chatHistory, userMsg],
        writingText: writingText,
      };

      const res = await fetch("/api/writingAid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        let errorMsg = "Bad Request";
        try {
          const errText = await res.text();
          errorMsg = errText || errorMsg;
        } catch {}
        setChatHistory(prev => [
          ...prev,
          { role: "assistant", content: `Sorry, there was an error: ${errorMsg}` },
        ]);
        setLoading(false);
        return;
      }

      const text = await res.text();
      const parsed = await marked.parse(text);
      const purified = DOMPurify.sanitize(parsed)
        .replace(/<script>/g, "&lt;script&gt;")
        .replace(/<\/script>/g, "&lt;/script&gt;");
      setChatHistory(prev => [
        ...prev,
        { role: "assistant", content: purified }
      ]);
    } catch (err) {
      setChatHistory(prev => [
        ...prev,
        { role: "assistant", content: "Sorry, there was an error." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.closest("form");
      if (form) form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    }
  }

  function deleteAllChats() {
    setChatHistory([]);
  }

  const safeChatHistory: ChatMessage[] = Array.isArray(chatHistory) ? chatHistory : [];

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex flex-col gap-4">
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2">
            {error}
          </div>
        )}
        {/* Chat Area */}
        <div
          ref={chatContainerRef}
          className="w-full"
          style={{
            height: "400px",
            maxHeight: "400px",
            minHeight: "200px",
            background: "white",
            borderRadius: "0.5rem",
            border: "1px solid #e5e7eb",
            padding: "0.5rem",
            marginBottom: "0.5rem",
            overflowY: "auto",
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {safeChatHistory.length === 0 && !loading && (
            <div className="flex items-center justify-center h-32">
              <div className="p-6 bg-gray-50 rounded-lg shadow-sm max-w-md dark:bg-gray-800">
                <h2 className="text-xl font-medium text-gray-700 mb-2 dark:text-gray-50">Welcome!</h2>
                <p className="text-gray-600 dark:text-gray-50">
                  Paste your writing and chat with the AI for feedback or suggestions!
                </p>
              </div>
            </div>
          )}
          {safeChatHistory.map((chat, idx) =>
            chat.role === "user" ? (
              <div key={idx} className="flex justify-end my-2">
                <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none max-w-[80%] shadow-sm">
                  {chat.content}
                </div>
              </div>
            ) : (
              <div key={idx} className="flex justify-start my-2">
                <div
                  className="bg-gray-50 border-l-4 border-blue-500 pl-4 py-3 pr-5 text-gray-800 dark:bg-gray-800 max-w-[90%]"
                  dangerouslySetInnerHTML={{ __html: chat.content }}
                />
              </div>
            )
          )}
          {loading && (
            <div className="flex justify-start my-2 max-w-[90%]">
              <div className="bg-gray-50 border-l-4 border-blue-500 pl-4 py-3 pr-5 text-gray-800 dark:bg-gray-800">
                <div className="flex items-center">
                  <LoadingIcon />
                  <span className="ml-2">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Input Area */}
        <form className="w-full flex flex-row gap-2" onSubmit={handleSubmit}>
          <textarea
            className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 p-3 rounded-lg w-full resize-none transition-colors"
            required
            placeholder="Type your message..."
            name="message"
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex flex-col justify-between gap-2">
            <button
              type="submit"
              className="btn bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors flex-grow"
              disabled={loading}
            >
              Send
            </button>
            <button
              type="button"
              className="btn bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors flex-grow"
              onClick={deleteAllChats}
            >
              Clear Chat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WritingAidChat;
