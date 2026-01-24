"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useUser } from "@/context/UserContext";

type StrategyResponse = {
  strategy: string;
};

type Message =
  | { role: "user"; content: string }
  | { role: "bot"; content: string; stocks?: string[] };

type AdviceResponse = {
  stocks: string[];
  advice: string;
  type: string;
};

export default function StrategyPage() {
  const { userId } = useUser();
  const [strategy, setStrategy] = useState("");
  const [strategyLoading, setStrategyLoading] = useState(true);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStrategy = async () => {
      try {
        if (!userId) {
          setStrategy("Please sign in to view your strategy.");
          return;
        }

        const profileRes = await fetch(`/api/onboarding?userId=${userId}`);
        if (!profileRes.ok) throw new Error();
        const profileData = await profileRes.json();
        const profile = profileData.profile;

        console.log(profile)

        const res = await fetch("http://localhost:8000/api/strategy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profile),
        });
        if (!res.ok) throw new Error();
        const data: StrategyResponse = await res.json();
        setStrategy(data.strategy);
      } catch {
        setStrategy("Unable to load strategy at the moment.");
      } finally {
        setStrategyLoading(false);
      }
    };

    fetchStrategy();
  }, [userId]);

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
    <div className="w-full min-h-screen bg-[#0b1220] px-6 py-10 space-y-14">

      {/* STRATEGY SECTION */}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gray-900/70 border border-white/10 rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
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
            <div>
              <h1 className="text-2xl font-semibold text-white">
                Investment Strategy
              </h1>
              <p className="text-xs text-gray-400">
                Market outlook & positioning guidance
              </p>
            </div>
          </div>

          {strategyLoading ? (
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

      {/* ADVICE CHATBOT */}
      <div className="flex justify-center">
        <div className="flex flex-col w-full max-w-2xl h-[600px] bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

          <div className="px-6 py-4 border-b border-white/10 bg-gray-900/50 flex items-center gap-3">
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
                  d="M12 3a7 7 0 00-4 12.74V19a1 1 0 001 1h6a1 1 0 001-1v-3.26A7 7 0 0012 3z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Advisor AI</h2>
              <p className="text-xs text-gray-400">
                Ask questions based on the strategy above
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "bot" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500/30 to-brand-600/30 border border-brand-500/40 flex items-center justify-center shrink-0">
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
                )}

                {msg.role === "user" ? (
                  <div className="bg-gradient-to-r from-brand-500 to-brand-600 text-white px-4 py-3 rounded-2xl rounded-br-md max-w-[80%] text-sm shadow-lg">
                    {msg.content}
                  </div>
                ) : (
                  <div className="bg-white/5 text-gray-200 px-4 py-4 rounded-2xl rounded-bl-md max-w-[85%] text-sm leading-relaxed border border-white/5">
                    {msg.stocks && (
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {msg.stocks.map((s) => (
                          <span
                            key={s}
                            className="px-2.5 py-1 rounded-full text-xs bg-brand-500/20 text-brand-400 border border-brand-500/30"
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
              <div className="text-sm text-gray-400">
                Advisor is thinking…
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/10 bg-gray-900/50">
            <div className="flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask a follow-up question…"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-500"
              />
              <button
                onClick={sendMessage}
                disabled={loading}
                className="px-5 py-3 text-sm rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white disabled:opacity-40"
              >
                Send
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
