"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message =
  | { role: "user"; content: string }
  | { role: "bot"; content: string; stocks?: string[]; structured?: StructuredAdvice };

type AdviceResponse = {
  stocks: string[];
  advice: string | StructuredAdvice;
  type: string;
};

type Recommendation = "BUY" | "HOLD" | "SELL";
type Trend = "bullish" | "neutral" | "bearish";
type RiskLevel = "low" | "medium" | "high";

type StructuredAdvice = {
  summary?: string;
  global_risk?: RiskLevel;
  stocks?: StockAdvice[];
};

type StockAdvice = {
  symbol: string;
  company_name?: string;
  overall_recommendation: Recommendation;
  confidence: number;
  trend: Trend;
  risk_level: RiskLevel;
  reasons?: string[];
  full_advice?: string;
  tips?: string[];
  time_horizon?: {
    today?: HorizonAdvice;
    three_days?: HorizonAdvice;
    one_week?: HorizonAdvice;
  };
  risk_meter?: { label: RiskLevel; score: number };
  confidence_meter?: { score: number };
};

type HorizonAdvice = {
  recommendation: Recommendation;
  confidence: number;
  target_range?: string;
};

function parseStructuredAdvice(raw: string): StructuredAdvice | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.stocks)) {
      return parsed as StructuredAdvice;
    }
  } catch {
    return null;
  }
  return null;
}

function normalizeAdvice(advice: AdviceResponse["advice"]): StructuredAdvice | null {
  if (typeof advice === "string") {
    return parseStructuredAdvice(advice);
  }
  if (advice && typeof advice === "object") {
    return advice as StructuredAdvice;
  }
  return null;
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    setUserId(storedUserId);

    if (!storedUserId) return;

    const loadChats = async () => {
      try {
        const res = await fetch(`/api/advice-chat?userId=${storedUserId}`);
        if (!res.ok) return;
        const data = await res.json();
        const loadedMessages: Message[] = [];
        (data.chats || []).forEach((chat: { query: string; advice: string }) => {
          loadedMessages.push({ role: "user", content: chat.query });
          const parsed = parseStructuredAdvice(chat.advice);
          loadedMessages.push({
            role: "bot",
            content: parsed ? "" : chat.advice,
            structured: parsed || undefined,
          });
        });
        setMessages(loadedMessages);
      } catch (error) {
        console.warn("Failed to load advice chats:", error);
      }
    };

    loadChats();
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
      const structured = normalizeAdvice(data.advice);

      setMessages((p) => [
        ...p,
        {
          role: "bot",
          content: structured ? "" : String(data.advice),
          stocks: data.stocks,
          structured: structured || undefined,
        },
      ]);

      if (userId) {
        await fetch("/api/advice-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            query,
            advice: structured ? JSON.stringify(structured) : String(data.advice),
            timestamp: new Date().toISOString(),
          }),
        });
      }
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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] w-full px-4 py-6">
      <div className="flex flex-col w-full max-w-5xl h-[calc(100vh-140px)] bg-gradient-to-b from-gray-900/90 via-gray-900/80 to-gray-950/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-8 py-5 border-b border-white/10 shrink-0 bg-black/20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500/30 to-brand-600/30 border border-white/15 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Advisor AI</h2>
                <p className="text-xs text-gray-400">Your personal portfolio advisor</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
              <span className="px-2.5 py-1 rounded-full border border-white/10 bg-white/5">Live</span>
              <span>Structured insights</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
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
                <div className="bg-gradient-to-r from-brand-500 to-brand-600 text-white px-4 py-3 rounded-2xl rounded-br-md max-w-[70%] text-sm shadow-lg">
                  {msg.content}
                </div>
              ) : (
                <div className="bg-white/5 backdrop-blur-sm text-gray-200 px-5 py-5 rounded-2xl rounded-bl-md w-full text-sm leading-relaxed border border-white/10">
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
                  {msg.structured ? (
                    <StructuredAdviceView data={msg.structured} />
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
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
        <div className="p-5 border-t border-white/10 bg-black/20 shrink-0">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask about your portfolio, stocks, or investment strategy…"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 transition-all"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="px-5 py-3 text-sm font-medium rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white disabled:opacity-40 hover:shadow-lg hover:shadow-brand-500/20 transition-all"
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

function StructuredAdviceView({ data }: { data: StructuredAdvice }) {
  const summary = data.summary || "";
  const stocks = data.stocks || [];

  return (
    <div className="space-y-4">
      {summary && (
        <div className="text-xs text-gray-300 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
          {summary}
        </div>
      )}
      <div className="space-y-4">
        {stocks.map((stock) => (
          <StockAdviceCard key={stock.symbol} stock={stock} />
        ))}
      </div>
    </div>
  );
}

function StockAdviceCard({ stock }: { stock: StockAdvice }) {
  const [showFull, setShowFull] = useState(false);
  const recommendationColor =
    stock.overall_recommendation === "BUY"
      ? "bg-green-500/15 text-green-300 border-green-500/30"
      : stock.overall_recommendation === "HOLD"
      ? "bg-yellow-500/15 text-yellow-300 border-yellow-500/30"
      : "bg-red-500/15 text-red-300 border-red-500/30";

  const trendColor =
    stock.trend === "bullish"
      ? "text-green-300"
      : stock.trend === "neutral"
      ? "text-yellow-300"
      : "text-red-300";

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-white">{stock.symbol}</p>
          {stock.company_name && (
            <p className="text-xs text-gray-400">{stock.company_name}</p>
          )}
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${recommendationColor}`}>
          {stock.overall_recommendation}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg bg-white/5 border border-white/10 p-2">
          <p className="text-gray-400">Confidence</p>
          <p className="text-white font-semibold">{clampPercent(stock.confidence)}%</p>
          <ProgressBar value={stock.confidence} color="bg-brand-500" />
        </div>
        <div className="rounded-lg bg-white/5 border border-white/10 p-2">
          <p className="text-gray-400">Trend</p>
          <p className={`font-semibold ${trendColor}`}>{capitalize(stock.trend)}</p>
          <p className="text-gray-500">Risk: {capitalize(stock.risk_level)}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-[11px]">
        <HorizonBadge label="Today" data={stock.time_horizon?.today} />
        <HorizonBadge label="3 Days" data={stock.time_horizon?.three_days} />
        <HorizonBadge label="1 Week" data={stock.time_horizon?.one_week} />
      </div>

      {stock.reasons && stock.reasons.length > 0 && (
        <ul className="space-y-1 text-xs text-gray-300">
          {stock.reasons.slice(0, 3).map((reason, idx) => (
            <li key={`${stock.symbol}-reason-${idx}`} className="flex gap-2">
              <span className="text-brand-400">•</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      )}

      {(stock.full_advice || (stock.tips && stock.tips.length > 0)) && (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowFull((prev) => !prev)}
            className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
          >
            {showFull ? "Hide Full Advice" : "View Full Advice"}
          </button>
          {showFull && (
            <div className="mt-3 space-y-3 text-xs text-gray-300 bg-white/5 border border-white/10 rounded-lg px-3 py-3">
              {stock.full_advice && <p className="leading-relaxed">{stock.full_advice}</p>}
              {stock.tips && stock.tips.length > 0 && (
                <ul className="space-y-1">
                  {stock.tips.map((tip, idx) => (
                    <li key={`${stock.symbol}-tip-${idx}`} className="flex gap-2">
                      <span className="text-green-400">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HorizonBadge({ label, data }: { label: string; data?: HorizonAdvice }) {
  const recommendation = data?.recommendation || "HOLD";
  const color =
    recommendation === "BUY"
      ? "bg-green-500/15 text-green-300 border-green-500/30"
      : recommendation === "HOLD"
      ? "bg-yellow-500/15 text-yellow-300 border-yellow-500/30"
      : "bg-red-500/15 text-red-300 border-red-500/30";

  return (
    <div className={`rounded-lg border px-2 py-2 ${color}`}>
      <p className="text-[10px] uppercase tracking-wide opacity-80">{label}</p>
      <p className="text-xs font-semibold">{recommendation}</p>
      {data?.target_range && <p className="text-[10px] opacity-80">{data.target_range}</p>}
    </div>
  );
}

function ProgressBar({ value, color }: { value?: number; color: string }) {
  const width = clampPercent(value);
  return (
    <div className="mt-1 h-1.5 w-full rounded-full bg-white/10">
      <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${width}%` }} />
    </div>
  );
}

function clampPercent(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function capitalize(value?: string) {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

