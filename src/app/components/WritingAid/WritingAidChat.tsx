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
import LoadingIcon from "../LoadingIcon";
import { Response } from "../Response";
import * as Types from "@/lib/types/types_new";
import TextArea from "../TextArea";

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
          className="chat overflow-y-auto max-h-max overflow-x-hidden scrollbar-thin scrollbar-thumb-surface-400 scrollbar-track-surface-200 dark:scrollbar-thumb-surface-700 dark:scrollbar-track-surface-800"
        >
          {safeChatHistory.length === 0 && !loading && (
            <div className="AIRESPONSE"><b>Welcome!</b> The content of your essay on the right will automatically be combined with what ever message you ask me. So go ahead and chat with me to get feedback or suggestions!</div>
          )}
          {safeChatHistory.map((chat, idx) =>
            chat.role === "user" ? (
              <Response key={idx} chatResponse={{type: 'text', isAiResponse: false, items: chat.content, id: idx, createdAt: new Date()} as Types.TextContentItem} />
            ) : (
              <Response key={idx} chatResponse={{type: 'text', isAiResponse: true, items: chat.content, id: idx, createdAt: new Date()} as Types.TextContentItem} />
            )
          )}
          {loading && (
            <div className="AIRESPONSE"><LoadingIcon /></div>
          )}
        </div>
        {/* Input Area */}
        <form className="w-full flex flex-col gap-2" onSubmit={handleSubmit}>
          <TextArea handleEnterPress={(e) => handleKeyDown(e as React.KeyboardEvent<HTMLTextAreaElement>)} setTextAreaValue={(v) => setInput(v)} textAreaValue={input} attach={false}/>
          {/* <textarea
            className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 p-3 rounded-lg w-full resize-none transition-colors"
            required
            placeholder="Type your message..."
            name="message"
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          /> */}
          <div className="flex flex-col justify-between gap-2">
            {/* <button
              type="submit"
              className="btn bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors flex-grow"
              disabled={loading}
            >
              Send
            </button> */}
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
