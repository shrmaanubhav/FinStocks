"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type StrategyResponse = {
  strategy: string;
};

type AdviceResponse = {
  stocks: string[];
  advice: string;
  type: string;
};

type Message = {
  role: "user" | "bot";
  content: string;
  stocks?: string[];
};

export default function StrategyPage() {
  const [strategy, setStrategy] = useState("");
  const [loadingStrategy, setLoadingStrategy] = useState(true);

  const [showAdvice, setShowAdvice] = useState(false);
  const [expandAdvice, setExpandAdvice] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  useEffect(() => {
    const fetchStrategy = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/strategy");
        const data: StrategyResponse = await res.json();
        setStrategy(data.strategy);
      } catch {
        setStrategy("Unable to load strategy.");
      } finally {
        setLoadingStrategy(false);
      }
    };
    fetchStrategy();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loadingAdvice) return;

    const query = input;
    setMessages((p) => [...p, { role: "user", content: query }]);
    setInput("");
    setLoadingAdvice(true);

    try {
      const res = await fetch("http://localhost:8000/api/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data: AdviceResponse = await res.json();

      setMessages((p) => [
        ...p,
        { role: "bot", content: data.advice, stocks: data.stocks },
      ]);
    } catch {
      setMessages((p) => [
        ...p,
        { role: "bot", content: "Something went wrong." },
      ]);
    } finally {
      setLoadingAdvice(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0b1220] px-6 py-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/30 to-brand-600/30 border border-brand-500/40 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-brand-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8L11 19l-4-4-6 6"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-white">
              Investment Strategy
            </h1>
          </div>

          {!showAdvice && (
            <button
              onClick={() => setShowAdvice(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3a7 7 0 00-4 12.74V19a1 1 0 001 1h6a1 1 0 001-1v-3.26A7 7 0 0012 3z"
                />
              </svg>
              Advice
            </button>
          )}
        </div>

        {/* Main Layout */}
        <div className="flex gap-6 transition-all">

          {!expandAdvice && (
            <div className="flex-1 transition-all duration-300">
              <div className="bg-gray-900/70 border border-white/10 rounded-2xl shadow-2xl p-8">
                {loadingStrategy ? (
                  <p className="text-sm text-gray-400">Loading strategy…</p>
                ) : (
                  <div className="prose prose-invert prose-lg max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {strategy}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          )}

          {showAdvice && (
            <div
              className={`transition-all duration-300 ${
                expandAdvice ? "w-full" : "w-[30%]"
              }`}
            >
              <div
                className={`bg-gray-900/80 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden ${
                  expandAdvice ? "h-[80vh]" : "h-[310px]"
                }`}
              >
                {/* Advice Header */}
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-gray-900/60">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500/30 to-brand-600/30 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-brand-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 3a7 7 0 00-4 12.74V19a1 1 0 001 1h6a1 1 0 001-1v-3.26A7 7 0 0012 3z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-white">
                      Advisor AI
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandAdvice((p) => !p)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
                    >
                      {expandAdvice ? "−" : "+"}
                    </button>

                    <button
                      onClick={() => {
                        setShowAdvice(false);
                        setExpandAdvice(false);
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${
                        msg.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] px-3 py-2 rounded-xl text-xs ${
                          msg.role === "user"
                            ? "bg-brand-500 text-white"
                            : "bg-white/5 text-gray-200"
                        }`}
                      >
                        {msg.stocks && (
                          <div className="flex gap-1 mb-1 flex-wrap">
                            {msg.stocks.map((s) => (
                              <span
                                key={s}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))}

                  {loadingAdvice && (
                    <p className="text-xs text-gray-400">
                      Advisor is thinking…
                    </p>
                  )}
                </div>

                {/* Input */}
                <div className="p-3 border-t border-white/10 bg-gray-900/60">
                  <div className="flex gap-2">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Ask advice…"
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-500"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={loadingAdvice}
                      className="flex items-center gap-1 px-3 py-2 text-xs rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 text-white disabled:opacity-40"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                      Send
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
