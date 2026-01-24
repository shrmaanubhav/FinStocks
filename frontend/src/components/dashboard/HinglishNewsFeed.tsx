"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface NewsItem {
  id: string;
  title: string;
  hinglishSummary: string;
  relatedStock: string;
  sentiment: "positive" | "negative" | "neutral";
  source: string;
  timeAgo: string;
  impact: "high" | "medium" | "low";
}

// News templates for different stocks
const stockNewsTemplates: Record<string, NewsItem[]> = {
  RELIANCE: [
    { id: "rel1", title: "Reliance Q4 Results Beat Estimates", hinglishSummary: "Reliance ke Q4 results expectations se zyada ache aaye hain. Jio aur retail ka growth strong raha. Stock mein short-term mein positive momentum expected hai.", relatedStock: "RELIANCE", sentiment: "positive", source: "Economic Times", timeAgo: "15 min ago", impact: "high" },
  ],
  TCS: [
    { id: "tcs1", title: "IT Sector Faces Headwinds", hinglishSummary: "IT companies ko US recession fears se dikkat ho rahi hai. TCS ka guidance cautious hai. Agar aapke portfolio mein IT heavy hai, toh diversify karna consider karein.", relatedStock: "TCS", sentiment: "negative", source: "Business Standard", timeAgo: "2 hours ago", impact: "high" },
  ],
  HDFCBANK: [
    { id: "hdfc1", title: "HDFC Bank's Net Interest Margin Stable", hinglishSummary: "HDFC Bank ka NIM stable raha hai despite competition. Deposit growth bhi theek hai. Long-term investors ke liye ye achi news hai.", relatedStock: "HDFCBANK", sentiment: "neutral", source: "Moneycontrol", timeAgo: "1 hour ago", impact: "medium" },
  ],
  INFY: [
    { id: "infy1", title: "Infosys Announces Buyback", hinglishSummary: "Infosys ne buyback announce kiya hai jo shareholders ke liye positive signal hai. Company confident hai apne future prospects mein.", relatedStock: "INFY", sentiment: "positive", source: "LiveMint", timeAgo: "3 hours ago", impact: "medium" },
  ],
  TATAMOTORS: [
    { id: "tata1", title: "Tata Motors EV Sales Surge", hinglishSummary: "Tata Motors ke EV sales mein 45% growth dekhi gayi. Nexon EV market leader ban gaya hai. Future outlook positive hai lekin valuations thode rich hain.", relatedStock: "TATAMOTORS", sentiment: "positive", source: "LiveMint", timeAgo: "3 hours ago", impact: "medium" },
  ],
  ICICIBANK: [
    { id: "icici1", title: "ICICI Bank Loan Growth Strong", hinglishSummary: "ICICI Bank ka loan growth strong hai at 18% YoY. Retail segment especially well perform kar raha hai. Asset quality bhi stable hai.", relatedStock: "ICICIBANK", sentiment: "positive", source: "Reuters India", timeAgo: "4 hours ago", impact: "medium" },
  ],
  SBIN: [
    { id: "sbi1", title: "SBI NPA Ratio Improves", hinglishSummary: "SBI ka NPA ratio improve hua hai aur profitability bhi badhi hai. PSU banks mein SBI sabse stable performer hai.", relatedStock: "SBIN", sentiment: "positive", source: "Economic Times", timeAgo: "5 hours ago", impact: "medium" },
  ],
};

// Default/fallback news
const defaultNews: NewsItem[] = [
  { id: "mkt1", title: "RBI Policy Update", hinglishSummary: "RBI ne interest rates unchanged rakhe hain. Banking stocks ke liye ye neutral hai. Real estate aur auto sector ko bhi koi immediate boost nahi milega.", relatedStock: "MARKET", sentiment: "neutral", source: "Reuters India", timeAgo: "5 hours ago", impact: "high" },
  { id: "mkt2", title: "Nifty Closes at All-Time High", hinglishSummary: "Nifty ne new all-time high touch kiya. FIIs ka flow positive hai, lekin retail investors ko caution se invest karna chahiye current levels pe.", relatedStock: "MARKET", sentiment: "positive", source: "CNBC", timeAgo: "6 hours ago", impact: "high" },
];

export default function HinglishNewsFeed() {
  const router = useRouter();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "positive" | "negative" | "neutral">("all");
  const [userStocks, setUserStocks] = useState<string[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Get user's portfolio stocks
        const portfolioData = localStorage.getItem("finStocksPortfolio");
        let relevantNews: NewsItem[] = [];
        
        if (portfolioData) {
          const stocks = JSON.parse(portfolioData);
          const stockSymbols = stocks.map((s: any) => s.symbol).filter(Boolean);
          setUserStocks(stockSymbols);
          
          // Get news for user's stocks
          stockSymbols.forEach((symbol: string) => {
            if (stockNewsTemplates[symbol]) {
              relevantNews = [...relevantNews, ...stockNewsTemplates[symbol]];
            }
          });
        }
        
        // Add market news
        relevantNews = [...relevantNews, ...defaultNews];
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setNews(relevantNews.length > 0 ? relevantNews : defaultNews);
      } catch (error) {
        console.error("Failed to fetch news:", error);
        setNews(defaultNews);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  const filteredNews = news.filter(item => 
    filter === "all" ? true : item.sentiment === filter
  );

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        );
      case "negative":
        return (
          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-gray-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
            </svg>
          </div>
        );
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "high":
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-500/20 text-red-400 border border-red-500/30">High Impact</span>;
      case "medium":
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">Medium</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">Low</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 h-full">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border border-2 flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-900 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">News</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Filtered for your holdings</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-gray-400">Live</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {["all", "positive", "negative", "neutral"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as typeof filter)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                filter === f
                  ? "bg-brand-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* News List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredNews.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <p className="text-sm">No news matching this filter</p>
          </div>
        ) : (
          filteredNews.map((item) => (
            <div 
              key={item.id}
              onClick={() => router.push("/dashboard/news")}
              className="group p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700 cursor-pointer"
            >
              <div className="flex gap-3">
                {getSentimentIcon(item.sentiment)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">
                      {item.title}
                    </h3>
                    {getImpactBadge(item.impact)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                    {item.hinglishSummary}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 font-medium">
                      {item.relatedStock}
                    </span>
                    <span>{item.source}</span>
                    <span>•</span>
                    <span>{item.timeAgo}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
        <button 
          onClick={() => router.push("/dashboard/news")}
          className="w-full py-2 text-sm font-medium text-brand-500 hover:text-brand-400 transition-colors flex items-center justify-center gap-2"
        >
          View All News
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
