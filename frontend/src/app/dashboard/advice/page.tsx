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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] w-full px-4">
      <div className="flex flex-col w-full max-w-2xl h-[600px] bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 shrink-0 bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br border-2 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Advisor AI</h2>
              <p className="text-xs text-gray-400">Your personal portfolio advisor</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <svg className="w-12 h-12 mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm">Ask me anything about your portfolio</p>
              <p className="text-xs mt-1 text-gray-600">I can help with stock analysis, advice, and strategy</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "user" ? (
                <div className="bg-gradient-to-r from-brand-500 to-brand-600 text-white px-4 py-3 rounded-2xl rounded-br-md max-w-[80%] text-sm shadow-lg">
                  {msg.content}
                </div>
              ) : (
                <div className="bg-white/5 backdrop-blur-sm text-gray-200 px-4 py-4 rounded-2xl rounded-bl-md max-w-[85%] text-sm leading-relaxed border border-white/5">
                  {msg.stocks && msg.stocks.length > 0 && (
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {msg.stocks.map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-1 rounded-full text-xs font-medium bg-brand-500/20 text-brand-400 border border-brand-500/30"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <span>Analyzing your query...</span>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10 bg-gray-900/50 shrink-0">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask about your portfolio, stocks, or investment strategy…"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="px-5 py-3 text-sm font-medium rounded-xl bg-gradient-to-r border-1 text-white disabled:opacity-40 hover:shadow-lg hover:bg-brand-500/25 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
