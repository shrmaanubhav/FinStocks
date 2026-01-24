"use client";
import React, { useEffect, useState } from "react";

interface RiskSignal {
  id: string;
  type: "concentration" | "overlap" | "volatility" | "sector" | "liquidity";
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  affectedStocks: string[];
  recommendation: string;
}

// Mock data - in production, this comes from Python backend
const mockRiskSignals: RiskSignal[] = [
  {
    id: "1",
    type: "concentration",
    severity: "high",
    title: "High Single-Stock Concentration",
    description: "HDFCBANK represents 10.4% of your portfolio, which is above the recommended 8% threshold for individual stocks.",
    affectedStocks: ["HDFCBANK"],
    recommendation: "Consider reducing position size or adding more diversified holdings.",
  },
  {
    id: "2",
    type: "overlap",
    severity: "medium",
    title: "Duplicate Holdings Detected",
    description: "RELIANCE appears in both your direct equity and 2 of your mutual funds, creating 15% effective exposure.",
    affectedStocks: ["RELIANCE"],
    recommendation: "Review your mutual fund holdings to avoid unintended concentration.",
  },
  {
    id: "3",
    type: "sector",
    severity: "medium",
    title: "Sector Overweight: Banking",
    description: "18% allocation to Banking sector. Market cap exposure is skewed towards large-cap financials.",
    affectedStocks: ["HDFCBANK", "ICICIBANK"],
    recommendation: "Consider adding exposure to other sectors like healthcare or consumer goods.",
  },
  {
    id: "4",
    type: "volatility",
    severity: "low",
    title: "High Beta Holdings",
    description: "TATAMOTORS has a beta of 1.8, contributing to overall portfolio volatility.",
    affectedStocks: ["TATAMOTORS"],
    recommendation: "If risk-averse, consider balancing with low-beta dividend stocks.",
  },
];

export default function RiskSignals() {
  const [signals, setSignals] = useState<RiskSignal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 700));
        setSignals(mockRiskSignals);
      } catch (error) {
        console.error("Failed to fetch risk signals:", error);
        setSignals(mockRiskSignals);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSignals();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "concentration":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case "overlap":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case "sector":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        );
      case "volatility":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "high":
        return {
          bg: "bg-red-500/10",
          border: "border-red-500/30",
          text: "text-red-400",
          icon: "bg-red-500/20",
          badge: "bg-red-500/20 text-red-400 border-red-500/30",
        };
      case "medium":
        return {
          bg: "bg-yellow-500/10",
          border: "border-yellow-500/30",
          text: "text-yellow-400",
          icon: "bg-yellow-500/20",
          badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        };
      default:
        return {
          bg: "bg-blue-500/10",
          border: "border-blue-500/30",
          text: "text-blue-400",
          icon: "bg-blue-500/20",
          badge: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        };
    }
  };

  const highCount = signals.filter(s => s.severity === "high").length;
  const mediumCount = signals.filter(s => s.severity === "medium").length;

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 h-full">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Risk Signals</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Overlap & concentration warnings</p>
            </div>
          </div>
        </div>

        {/* Summary badges */}
        <div className="flex gap-3 mt-4">
          {highCount > 0 && (
            <span className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              {highCount} High Risk
            </span>
          )}
          {mediumCount > 0 && (
            <span className="px-3 py-1.5 text-xs font-medium rounded-lg bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              {mediumCount} Medium
            </span>
          )}
        </div>
      </div>

      {/* Signals List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {signals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <svg className="w-12 h-12 mb-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-emerald-400">No risk signals detected</p>
            <p className="text-xs text-gray-500 mt-1">Your portfolio looks healthy!</p>
          </div>
        ) : (
          signals.map((signal) => {
            const styles = getSeverityStyles(signal.severity);
            const isExpanded = expandedId === signal.id;

            return (
              <div 
                key={signal.id}
                className={`rounded-xl border transition-all cursor-pointer ${styles.bg} ${styles.border} ${isExpanded ? "ring-2 ring-offset-2 ring-offset-gray-900" : ""}`}
                onClick={() => setExpandedId(isExpanded ? null : signal.id)}
              >
                <div className="p-4">
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-lg ${styles.icon} flex items-center justify-center flex-shrink-0 ${styles.text}`}>
                      {getTypeIcon(signal.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`font-medium ${styles.text} text-sm`}>
                          {signal.title}
                        </h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border flex-shrink-0 ${styles.badge}`}>
                          {signal.severity.charAt(0).toUpperCase() + signal.severity.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {signal.description}
                      </p>
                      
                      {/* Affected stocks */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {signal.affectedStocks.map(stock => (
                          <span key={stock} className="px-2 py-0.5 text-xs font-medium rounded bg-white/10 text-gray-300">
                            {stock}
                          </span>
                        ))}
                      </div>

                      {/* Expanded recommendation */}
                      {isExpanded && (
                        <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Recommendation</p>
                          <p className="text-sm text-gray-300">{signal.recommendation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
