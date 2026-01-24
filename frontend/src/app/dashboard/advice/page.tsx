"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message =
  | { role: "user"; content: string }
  | { role: "bot"; content: string; stocks?: string[] };

type AdviceResponse = {
  stocks: string[];
  advice: string;
  type: string;
};

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const query = input;

    setMessages((p) => [...p, { role: "user", content: query }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) throw new Error();

      const data: AdviceResponse = await res.json();

      setMessages((p) => [
        ...p,
        { role: "bot", content: data.advice, stocks: data.stocks },
      ]);
    } catch {
      setMessages((p) => [
        ...p,
        { role: "bot", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0b1220]">
      <div className="flex flex-col w-[380px] h-[560px] bg-[#0f172a] border border-white/10 rounded-xl shadow-xl">

        <div className="px-4 py-3 text-sm font-medium text-gray-200 border-b border-white/10 shrink-0">
          Advisor AI
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "user" ? (
                <div className="bg-blue-600 text-white px-3 py-2 rounded-lg max-w-[85%] text-xs">
                  {msg.content}
                </div>
              ) : (
                <div className="bg-white/5 text-gray-300 px-3 py-3 rounded-lg max-w-[90%] text-xs leading-relaxed">
                  {msg.stocks && (
                    <div className="flex gap-2 mb-2 flex-wrap">
                      {msg.stocks.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded-full text-[10px] bg-blue-600/20 text-blue-400 border border-blue-600/30"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="prose prose-invert prose-xs max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="text-xs text-gray-500">Analyzing…</div>
          )}
        </div>

        <div className="p-3 border-t border-white/10 bg-[#0b1220] shrink-0">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask advisor…"
              className="flex-1 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="px-3 py-2 text-xs rounded-lg bg-blue-600 text-white disabled:opacity-40"
            >
              Send
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
