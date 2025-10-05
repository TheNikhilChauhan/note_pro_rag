"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatBox() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  //auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            ...messages,
            userMessage,
          ],
          apiKey: process.env.OPENAI_API_KEY,
        }),
      });

      if (!res.body) {
        throw new Error("No response body");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantMessage += decoder.decode(value, { stream: true });

        // assistant msg update
        setMessages((prev) => {
          const updated = [...prev];

          if (
            updated.length > 0 &&
            updated[updated.length - 1].role === "assistant"
          ) {
            updated[updated.length - 1].content = assistantMessage;
          } else {
            updated.push({
              role: "assistant",
              content: assistantMessage,
            });
          }
          return [...updated];
        });
      }
    } catch (error: any) {
      console.error("Chat error: ", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${error.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[90vh] max-w-2xl border rounded-2xl shadow-md">
      {/* Chat window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-600">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl max-w-[80%] ${
              m.role === "user"
                ? "bg-blue-500 text-white ml-auto"
                : "bg-gray-300 text-gray-800"
            }`}
          >
            {m.content}
          </div>
        ))}
      </div>

      {/* Input window */}
      <div className="p-4 border-t flex gap-2">
        <input
          className="flex-1 border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Ask me anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
          disabled={loading}
          onClick={sendMessage}
        >
          <Send size={25} /> {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
