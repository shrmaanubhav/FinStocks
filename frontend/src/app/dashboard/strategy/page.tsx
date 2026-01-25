"use client";

import { useEffect, useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useUser } from "@/context/UserContext";

type StrategyResponse = {
  strategy: StrategyData | string;
};

type StrategyData = {
  investorProfile?: {
    name?: string;
    age?: number;
    familyStatus?: string;
    incomeRange?: string;
    expenseRange?: string;
    profession?: string;
    riskProfile?: string;
    experienceLevel?: string;
  };
  portfolio?: {
    totalStocks?: number;
    holdings?: {
      symbol: string;
      quantity?: number;
      allocationPercent?: number;
      trend?: "bullish" | "neutral" | "bearish";
      sentimentScore?: number;
    }[];
  };
  portfolioCharts?: {
    allocationPieChart?: { symbol: string; value: number }[];
    sentimentBarChart?: { symbol: string; score: number }[];
  };
  marketSentiment?: {
    overallMood?: "Bullish" | "Neutral" | "Bearish";
    stocks?: { symbol: string; trend?: "bullish" | "neutral" | "bearish"; confidence?: number }[];
  };
  recommendedPortfolio?: {
    allocations?: { symbol: string; recommendedPercent: number }[];
  };
  portfolioComparison?: {
    symbol: string;
    currentPercent: number;
    recommendedPercent: number;
    change: number;
  }[];
  insights?: {
    symbol: string;
    action?: "increase" | "reduce" | "hold";
    reasons?: string[];
  }[];
  riskAnalysis?: {
    overallRisk?: "Low" | "Medium" | "High";
    stockRisks?: { symbol: string; riskLevel?: "Low" | "Medium" | "High" }[];
  };
  forecast?: {
    today?: { symbol: string; action: string }[];
    "3days"?: { symbol: string; action: string }[];
    "1week"?: { symbol: string; action: string }[];
  };
  actionPlan?: { symbol: string; action: string }[];
  financialAdvice?: string[];
};

type AdviceResponse = {
  stocks: string[];
  advice: string;
  type: string;
};

type PortfolioHolding = {
  symbol: string;
  quantity?: number;
  allocationPercent?: number;
  trend?: "bullish" | "neutral" | "bearish";
  sentimentScore?: number;
};
type PortfolioHoldings = PortfolioHolding[];

type Message = {
  role: "user" | "bot";
  content: string;
  stocks?: string[];
};

export default function StrategyPage() {
  const { userId } = useUser();
  const [strategy, setStrategy] = useState<StrategyData | string>("");
  const [loadingStrategy, setLoadingStrategy] = useState(true);

  const [showAdvice, setShowAdvice] = useState(false);
  const [expandAdvice, setExpandAdvice] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loadingAdvice, setLoadingAdvice] = useState(false);

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

        const initial = buildInitialStrategyData(profile);
        setStrategy(initial);

        const summaryRes = await fetch("http://localhost:8000/api/strategy/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profile),
        });
        if (!summaryRes.ok) throw new Error();
        const summaryData = await summaryRes.json();

        const marketRes = await fetch("http://localhost:8000/api/strategy/market", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stocks: summaryData.stocks,
            portfolio: summaryData.portfolio,
            user_query: summaryData.user_query,
          }),
        });
        if (!marketRes.ok) throw new Error();
        const marketData = await marketRes.json();

        const finalRes = await fetch("http://localhost:8000/api/strategy/final", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stocks: marketData.stocks,
            portfolio: marketData.portfolio,
            user_query: marketData.user_query,
            market_news: marketData.market_news,
            macro_economics: marketData.macro_economics,
            market_trends: marketData.market_trends,
          }),
        });
        if (!finalRes.ok) throw new Error();
        const finalData: StrategyResponse = await finalRes.json();
        setStrategy(finalData.strategy);
      } catch {
        setStrategy("Unable to load strategy.");
      } finally {
        setLoadingStrategy(false);
      }
    };
    fetchStrategy();
  }, [userId]);

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
    <div className="w-full min-h-screen bg-gray-50 dark:bg-[#0b1220] px-6 py-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-brand-500/30 to-brand-600/30 border border-brand-500/40 flex items-center justify-center">
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
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Investment Strategy
            </h1>
          </div>

          {!showAdvice && (
            <button
              onClick={() => setShowAdvice(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-linear-to-r from-brand-500 to-brand-600 text-white"
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
              <div className="bg-white dark:bg-gray-900/70 border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl p-8">
                {loadingStrategy ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">Loading strategy…</p>
                ) : typeof strategy === "string" ? (
                  <div className="prose dark:prose-invert prose-lg max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {strategy}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <StrategyDashboard data={strategy} />
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
                className={`bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl flex flex-col overflow-hidden ${
                  expandAdvice ? "h-[80vh]" : "h-77.5"
                }`}
              >
                {/* Advice Header */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 flex items-center justify-between bg-gray-100 dark:bg-gray-900/60">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-brand-500/30 to-brand-600/30 flex items-center justify-center">
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
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Advisor AI
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandAdvice((p) => !p)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/5 transition"
                    >
                      {expandAdvice ? "−" : "+"}
                    </button>

                    <button
                      onClick={() => {
                        setShowAdvice(false);
                        setExpandAdvice(false);
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/5 transition"
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
                            : "bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-gray-200"
                        }`}
                      >
                        {msg.stocks && (
                          <div className="flex gap-1 mb-1 flex-wrap">
                            {msg.stocks.map((s) => (
                              <span
                                key={s}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-600 dark:text-brand-400"
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
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Advisor is thinking…
                    </p>
                  )}
                </div>

                {/* Input */}
                <div className="p-3 border-t border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-gray-900/60">
                  <div className="flex gap-2">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Ask advice…"
                      className="flex-1 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-500"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={loadingAdvice}
                      className="flex items-center gap-1 px-3 py-2 text-xs rounded-lg bg-linear-to-r from-brand-500 to-brand-600 text-white disabled:opacity-40"
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

function StrategyDashboard({ data }: { data: StrategyData }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InvestorProfileCard profile={data.investorProfile} />
        </div>
        <div className="space-y-6">
          <HealthScoreCard />
          <RiskMeterCard risk={data.riskAnalysis} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PortfolioAllocationCard charts={data.portfolioCharts} />
        <SentimentBarCard charts={data.portfolioCharts} sentiment={data.marketSentiment} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PriceTrendCard holdings={data.portfolio?.holdings} />
        <ComparisonCard comparison={data.portfolioComparison} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StockCardsSection
          holdings={data.portfolio?.holdings}
          risk={data.riskAnalysis}
          insights={data.insights}
          sentiment={data.marketSentiment}
        />
        <RecommendedAllocationCard data={data.recommendedPortfolio} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InsightsPanel insights={data.insights} />
        <AIRecommendationPanel actionPlan={data.actionPlan} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ForecastCard forecast={data.forecast} />
        <ActionPlanCard actionPlan={data.actionPlan} />
      </div>

      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FinancialAdviceCard advice={data.financialAdvice} />
        <ComponentMapCard />
      </div> */}
    </div>
  );
}

function CardShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-white/10 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function HealthScoreCard() {
  const score = 72;
  return (
    <CardShell title="Portfolio Health Score">
      <div className="flex items-center justify-between">
        <span className="text-2xl font-semibold text-gray-900 dark:text-white">{score}</span>
        <span className="text-xs text-gray-600 dark:text-gray-400">Gauge</span>
      </div>
      <div className="h-2 rounded-full bg-gray-200 dark:bg-white/10">
        <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${score}%` }} />
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400">Balanced risk with growth tilt.</p>
    </CardShell>
  );
}

function InvestorProfileCard({ profile }: { profile?: StrategyData["investorProfile"] }) {
  return (
    <CardShell title="Investor Profile">
      <div className="grid grid-cols-2 gap-4 text-xs text-gray-700 dark:text-gray-300">
        <ProfileItem label="Name" value={profile?.name || "N/A"} />
        <ProfileItem label="Age" value={profile?.age?.toString() || "N/A"} />
        <ProfileItem label="Family" value={profile?.familyStatus || "N/A"} />
        <ProfileItem label="Profession" value={profile?.profession || "N/A"} />
        <ProfileItem label="Income" value={profile?.incomeRange || "N/A"} />
        <ProfileItem label="Expenses" value={profile?.expenseRange || "N/A"} />
        <ProfileItem label="Risk Profile" value={profile?.riskProfile || "N/A"} />
        <ProfileItem label="Experience" value={profile?.experienceLevel || "N/A"} />
      </div>
    </CardShell>
  );
}

function ProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-sm text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function RiskMeterCard({ risk }: { risk?: StrategyData["riskAnalysis"] }) {
  const level = risk?.overallRisk || "Medium";
  const color =
    level === "Low"
      ? "bg-green-500/20 text-green-600 dark:text-green-300"
      : level === "High"
      ? "bg-red-500/20 text-red-600 dark:text-red-300"
      : "bg-yellow-500/20 text-yellow-600 dark:text-yellow-300";

  return (
    <CardShell title="Portfolio Risk">
      <div className="flex items-center justify-between">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
          {level}
        </span>
        <span className="text-xs text-gray-600 dark:text-gray-400">Risk Meter</span>
      </div>
      <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
        {(risk?.stockRisks || []).slice(0, 4).map((item) => (
          <div key={item.symbol} className="flex items-center justify-between">
            <span>{item.symbol}</span>
            <span className="text-gray-600 dark:text-gray-400">{item.riskLevel || "N/A"}</span>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function InsightsPanel({ insights }: { insights?: StrategyData["insights"] }) {
  return (
    <CardShell title="Insights Panel">
      <div className="space-y-3 text-xs text-gray-700 dark:text-gray-300">
        {(insights || []).map((item) => (
          <div key={item.symbol} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-900 dark:text-white">{item.symbol}</span>
              <span className={actionToColor(item.action || "hold")}>{item.action || "hold"}</span>
            </div>
            {(item.reasons || []).slice(0, 3).map((reason, idx) => (
              <div key={`${item.symbol}-insight-${idx}`} className="flex gap-2 text-gray-600 dark:text-gray-400">
                <span className="text-brand-500 dark:text-brand-400">•</span>
                <span>{reason}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function AIRecommendationPanel({ actionPlan }: { actionPlan?: StrategyData["actionPlan"] }) {
  return (
    <CardShell title="AI Recommendation Panel">
      <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
        {(actionPlan || []).slice(0, 4).map((item) => (
          <div key={item.symbol} className="flex items-start gap-2">
            <span className="text-green-500 dark:text-green-400">•</span>
            <span>{item.symbol}: {item.action}</span>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function PortfolioAllocationCard({ charts }: { charts?: StrategyData["portfolioCharts"] }) {
  const allocations = charts?.allocationPieChart || [];
  return (
    <CardShell title="Portfolio Allocation (Pie)">
      <div className="space-y-3">
        {allocations.map((item) => (
          <div key={item.symbol} className="space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-700 dark:text-gray-300">
              <span>{item.symbol}</span>
              <span>{item.value}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 dark:bg-white/10">
              <div
                className="h-2 rounded-full bg-brand-500"
                style={{ width: `${clampPercent(item.value)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function SentimentBarCard({
  charts,
  sentiment,
}: {
  charts?: StrategyData["portfolioCharts"];
  sentiment?: StrategyData["marketSentiment"];
}) {
  const bars = charts?.sentimentBarChart || [];
  return (
    <CardShell title="Market Sentiment (Bar)">
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
        <span>Overall Mood</span>
        <span>{sentiment?.overallMood || "Neutral"}</span>
      </div>
      <div className="space-y-3">
        {bars.map((item) => (
          <div key={item.symbol} className="space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-700 dark:text-gray-300">
              <span>{item.symbol}</span>
              <span>{item.score}</span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 dark:bg-white/10">
              <div
                className="h-2 rounded-full bg-emerald-500"
                style={{ width: `${clampPercent(Math.abs(item.score) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function PriceTrendCard({ holdings }: { holdings?: PortfolioHoldings }) {
  return (
    <CardShell title="Price Trend (Line)">
      <div className="space-y-3 text-xs text-gray-700 dark:text-gray-300">
        {(holdings || []).map((item: any) => (
          <div key={item.symbol} className="space-y-1">
            <div className="flex items-center justify-between">
              <span>{item.symbol}</span>
              <span className="text-gray-600 dark:text-gray-400">{item.trend || "neutral"}</span>
            </div>
            <div className="h-10 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-[11px] text-gray-500">
              Trend line data not provided
            </div>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function RecommendedAllocationCard({ data }: { data?: StrategyData["recommendedPortfolio"] }) {
  return (
    <CardShell title="Recommended Allocation">
      <div className="space-y-3">
        {(data?.allocations || []).map((item) => (
          <div key={item.symbol} className="space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-700 dark:text-gray-300">
              <span>{item.symbol}</span>
              <span>{item.recommendedPercent}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 dark:bg-white/10">
              <div
                className="h-2 rounded-full bg-emerald-500"
                style={{ width: `${clampPercent(item.recommendedPercent)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function StockCardsSection({
  holdings,
  risk,
  insights,
  sentiment,
}: {
  holdings?: PortfolioHoldings;
  risk?: StrategyData["riskAnalysis"];
  insights?: StrategyData["insights"];
  sentiment?: StrategyData["marketSentiment"];
}) {
  const riskMap = new Map((risk?.stockRisks || []).map((r) => [r.symbol, r.riskLevel]));
  const insightMap = new Map((insights || []).map((i) => [i.symbol, i]));
  const sentimentMap = new Map((sentiment?.stocks || []).map((s) => [s.symbol, s]));

  return (
    <CardShell title="Stock Cards">
      <div className="space-y-4">
        {(holdings || []).map((holding: any) => (
          <div key={holding.symbol} className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-gray-50 dark:bg-black/20 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{holding.symbol}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Qty: {holding.quantity || 0}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${trendToColor(holding.trend)}`}>
                {holding.trend || "neutral"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-gray-700 dark:text-gray-300">
              <Badge label="Risk" value={riskMap.get(holding.symbol) || "N/A"} />
              <Badge label="Sentiment" value={sentimentMap.get(holding.symbol)?.confidence?.toFixed(2) || "N/A"} />
              <Badge label="Allocation" value={`${holding.allocationPercent || 0}%`} />
            </div>
            <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
              {(insightMap.get(holding.symbol)?.reasons || []).slice(0, 3).map((reason, idx) => (
                <div key={`${holding.symbol}-reason-${idx}`} className="flex gap-2">
                  <span className="text-brand-500 dark:text-brand-400">•</span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function ComparisonCard({ comparison }: { comparison?: StrategyData["portfolioComparison"] }) {
  return (
    <CardShell title="Current vs Recommended">
      <div className="space-y-3">
        {(comparison || []).map((item) => (
          <div key={item.symbol} className="space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-700 dark:text-gray-300">
              <span>{item.symbol}</span>
              <span>{item.change > 0 ? `+${item.change}%` : `${item.change}%`}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 dark:text-gray-400">
              <div className="space-y-1">
                <span>Current {item.currentPercent}%</span>
                <div className="h-2 rounded-full bg-gray-200 dark:bg-white/10">
                  <div className="h-2 rounded-full bg-gray-400/60" style={{ width: `${clampPercent(item.currentPercent)}%` }} />
                </div>
              </div>
              <div className="space-y-1">
                <span>Recommended {item.recommendedPercent}%</span>
                <div className="h-2 rounded-full bg-gray-200 dark:bg-white/10">
                  <div className="h-2 rounded-full bg-brand-500" style={{ width: `${clampPercent(item.recommendedPercent)}%` }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function ForecastCard({ forecast }: { forecast?: StrategyData["forecast"] }) {
  return (
    <CardShell title="Timeline Forecast">
      <div className="grid grid-cols-3 gap-4 text-xs text-gray-700 dark:text-gray-300">
        <ForecastColumn label="Today" items={forecast?.today} />
        <ForecastColumn label="3 Days" items={forecast?.["3days"]} />
        <ForecastColumn label="1 Week" items={forecast?.["1week"]} />
      </div>
    </CardShell>
  );
}

function ForecastColumn({ label, items }: { label: string; items?: { symbol: string; action: string }[] }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] uppercase text-gray-500">{label}</p>
      {(items || []).map((item) => (
        <div key={`${label}-${item.symbol}`} className="flex items-center justify-between">
          <span>{item.symbol}</span>
          <span className={actionToColor(item.action)}>{item.action}</span>
        </div>
      ))}
    </div>
  );
}

function ActionPlanCard({ actionPlan }: { actionPlan?: StrategyData["actionPlan"] }) {
  return (
    <CardShell title="Action Plan">
      <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
        {(actionPlan || []).map((item) => (
          <div key={item.symbol} className="flex items-start gap-2">
            <span className="text-brand-500 dark:text-brand-400">•</span>
            <span>{item.symbol}: {item.action}</span>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function FinancialAdviceCard({ advice }: { advice?: StrategyData["financialAdvice"] }) {
  return (
    <CardShell title="Investor Advice">
      <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
        {(advice || []).map((item, idx) => (
          <div key={`advice-${idx}`} className="flex items-start gap-2">
            <span className="text-green-500 dark:text-green-400">•</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function ComponentMapCard() {
  const items = [
    "Investor Profile Card → investorProfile",
    "Portfolio Allocation (Pie) → portfolioCharts.allocationPieChart",
    "Sentiment Bar → portfolioCharts.sentimentBarChart",
    "Stock Cards → portfolio.holdings + insights + riskAnalysis",
    "Comparison Chart → portfolioComparison",
    "Forecast Timeline → forecast",
    "Action Plan Panel → actionPlan",
    "Investor Advice → financialAdvice",
  ];

  return (
    <CardShell title="JSON → UI Map">
      <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-2">
            <span className="text-brand-500 dark:text-brand-400">•</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 px-2 py-1 text-[11px] text-gray-700 dark:text-gray-300">
      <span className="text-gray-500">{label}: </span>
      {value}
    </div>
  );
}

function clampPercent(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function trendToColor(trend?: string) {
  if (trend === "bullish") return "bg-green-500/15 dark:bg-green-500/15 text-green-700 dark:text-green-300";
  if (trend === "bearish") return "bg-red-500/15 dark:bg-red-500/15 text-red-700 dark:text-red-300";
  return "bg-yellow-500/15 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-300";
}

function actionToColor(action: string) {
  const normalized = action.toLowerCase();
  if (normalized.includes("buy") || normalized.includes("increase")) return "text-green-700 dark:text-green-300";
  if (normalized.includes("sell") || normalized.includes("reduce")) return "text-red-700 dark:text-red-300";
  return "text-yellow-700 dark:text-yellow-300";
}

function buildInitialStrategyData(profile: any): StrategyData {
  const rawHoldings = Array.isArray(profile?.holdings) ? profile.holdings : [];
  const holdings: PortfolioHoldings = (rawHoldings as PortfolioHoldings) || [];
  const totalQty = holdings.reduce((sum: number, h: PortfolioHolding) => sum + (h?.quantity || 0), 0) || 1;
  const allocation = holdings.map((h: PortfolioHolding) => ({
    symbol: String(h.symbol || "").toUpperCase(),
    quantity: h.quantity || 0,
    allocationPercent: Math.round(((h.quantity || 0) / totalQty) * 100),
    trend: "neutral" as const,
    sentimentScore: 0,
  }));

  return {
    investorProfile: {
      name: profile?.name,
      age: profile?.age,
      familyStatus: profile?.maritalStatus
        ? `${profile.maritalStatus} with ${profile.children || 0} children`
        : undefined,
      incomeRange: profile?.incomeRange,
      expenseRange: profile?.expenditureRange,
      profession: profile?.job || profile?.jobType,
      riskProfile: profile?.riskPreference ? "Moderate" : undefined,
      experienceLevel: profile?.investingYears ? "Experienced" : "Beginner",
    },
    portfolio: {
      totalStocks: holdings.length,
      holdings: allocation,
    },
    portfolioCharts: {
      allocationPieChart: allocation.map((h) => ({
        symbol: h.symbol,
        value: h.allocationPercent || 0,
      })),
      sentimentBarChart: allocation.map((h) => ({
        symbol: h.symbol,
        score: 0,
      })),
    },
  };
}
