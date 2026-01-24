"use client";
import React, { useEffect, useState } from "react";

interface Holding {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  change: number;
  changePercent: number;
  value: number;
  allocation: number;
  sector: string;
}

interface PortfolioData {
  totalValue: number;
  totalInvested: number;
  totalGain: number;
  totalGainPercent: number;
  holdings: Holding[];
}

// Stock names mapping for common Indian stocks
const stockNames: Record<string, { name: string; sector: string }> = {
  RELIANCE: { name: "Reliance Industries", sector: "Energy" },
  TCS: { name: "Tata Consultancy", sector: "IT" },
  HDFCBANK: { name: "HDFC Bank", sector: "Banking" },
  INFY: { name: "Infosys", sector: "IT" },
  ICICIBANK: { name: "ICICI Bank", sector: "Banking" },
  TATAMOTORS: { name: "Tata Motors", sector: "Auto" },
  SBIN: { name: "State Bank of India", sector: "Banking" },
  BHARTIARTL: { name: "Bharti Airtel", sector: "Telecom" },
  ITC: { name: "ITC Limited", sector: "FMCG" },
  KOTAKBANK: { name: "Kotak Bank", sector: "Banking" },
  LT: { name: "Larsen & Toubro", sector: "Infrastructure" },
  WIPRO: { name: "Wipro", sector: "IT" },
  ASIANPAINT: { name: "Asian Paints", sector: "Consumer" },
  AXISBANK: { name: "Axis Bank", sector: "Banking" },
  MARUTI: { name: "Maruti Suzuki", sector: "Auto" },
  TITAN: { name: "Titan Company", sector: "Consumer" },
  SUNPHARMA: { name: "Sun Pharma", sector: "Pharma" },
  HINDUNILVR: { name: "Hindustan Unilever", sector: "FMCG" },
  ADANIPORTS: { name: "Adani Ports", sector: "Infrastructure" },
  BAJFINANCE: { name: "Bajaj Finance", sector: "Finance" },
};

// Mock prices for demo (in production, fetch from API)
const mockPrices: Record<string, { current: number; change: number }> = {
  RELIANCE: { current: 2485, change: 1.43 },
  TCS: { current: 3456, change: -0.8 },
  HDFCBANK: { current: 1624, change: 0.74 },
  INFY: { current: 1385, change: -1.28 },
  ICICIBANK: { current: 1085, change: 0.74 },
  TATAMOTORS: { current: 725, change: 6.62 },
  SBIN: { current: 625, change: 1.2 },
  BHARTIARTL: { current: 1125, change: 0.5 },
  ITC: { current: 425, change: -0.3 },
  KOTAKBANK: { current: 1750, change: 1.1 },
};

export default function PortfolioOverview() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"value" | "change" | "allocation">("value");
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check for user data in localStorage
        const profileData = localStorage.getItem("finStocksProfile");
        const portfolioData = localStorage.getItem("finStocksPortfolio");

        if (profileData) {
          const profile = JSON.parse(profileData);
          setUserName(profile.name || "");
        }

        if (portfolioData) {
          const stocks = JSON.parse(portfolioData);
          
          // Transform user's stocks into holdings
          const holdings: Holding[] = stocks
            .filter((s: any) => s.symbol && s.quantity > 0)
            .map((s: any) => {
              const stockInfo = stockNames[s.symbol] || { name: s.symbol, sector: "Other" };
              const priceInfo = mockPrices[s.symbol] || { current: s.buyPrice * 1.1, change: 2.5 };
              const value = s.quantity * priceInfo.current;
              const invested = s.quantity * s.buyPrice;
              const changeAmt = priceInfo.current - s.buyPrice;
              
              return {
                symbol: s.symbol,
                name: stockInfo.name,
                quantity: s.quantity,
                avgPrice: s.buyPrice,
                currentPrice: priceInfo.current,
                change: changeAmt,
                changePercent: priceInfo.change,
                value: value,
                allocation: 0, // Will be calculated after
                sector: stockInfo.sector,
              };
            });

          // Calculate allocations
          const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
          holdings.forEach(h => {
            h.allocation = totalValue > 0 ? (h.value / totalValue) * 100 : 0;
          });

          const totalInvested = holdings.reduce((sum, h) => sum + (h.quantity * h.avgPrice), 0);
          const totalGain = totalValue - totalInvested;

          setData({
            totalValue,
            totalInvested,
            totalGain,
            totalGainPercent: totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0,
            holdings,
          });
        } else {
          // Fallback to demo data if no portfolio found
          setData({
            totalValue: 1247500,
            totalInvested: 1100000,
            totalGain: 147500,
            totalGainPercent: 13.41,
            holdings: [
              { symbol: "RELIANCE", name: "Reliance Industries", quantity: 50, avgPrice: 2200, currentPrice: 2485, change: 35, changePercent: 1.43, value: 124250, allocation: 9.96, sector: "Energy" },
              { symbol: "TCS", name: "Tata Consultancy", quantity: 30, avgPrice: 3200, currentPrice: 3456, change: -28, changePercent: -0.8, value: 103680, allocation: 8.31, sector: "IT" },
              { symbol: "HDFCBANK", name: "HDFC Bank", quantity: 80, avgPrice: 1500, currentPrice: 1624, change: 12, changePercent: 0.74, value: 129920, allocation: 10.41, sector: "Banking" },
              { symbol: "INFY", name: "Infosys", quantity: 60, avgPrice: 1400, currentPrice: 1385, change: -18, changePercent: -1.28, value: 83100, allocation: 6.66, sector: "IT" },
              { symbol: "TATAMOTORS", name: "Tata Motors", quantity: 100, avgPrice: 580, currentPrice: 725, change: 45, changePercent: 6.62, value: 72500, allocation: 5.81, sector: "Auto" },
              { symbol: "ICICIBANK", name: "ICICI Bank", quantity: 90, avgPrice: 900, currentPrice: 1085, change: 8, changePercent: 0.74, value: 97650, allocation: 7.83, sector: "Banking" },
            ],
          });
        }
      } catch (error) {
        console.error("Failed to fetch portfolio:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`;
    } else {
      return `₹${value.toLocaleString("en-IN")}`;
    }
  };

  const sortedHoldings = data?.holdings.slice().sort((a, b) => {
    switch (sortBy) {
      case "change": return b.changePercent - a.changePercent;
      case "allocation": return b.allocation - a.allocation;
      default: return b.value - a.value;
    }
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Portfolio Overview</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your holdings at a glance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Value</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(data.totalValue)}</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Invested</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(data.totalInvested)}</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Gain</p>
            <p className={`text-xl font-bold ${data.totalGain >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              {data.totalGain >= 0 ? "+" : ""}{formatCurrency(data.totalGain)}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Returns</p>
            <p className={`text-xl font-bold ${data.totalGainPercent >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              {data.totalGainPercent >= 0 ? "+" : ""}{data.totalGainPercent.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Holdings</h3>
          <div className="flex gap-2">
            {["value", "change", "allocation"].map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s as typeof sortBy)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                  sortBy === s
                    ? "bg-brand-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="pb-3">Stock</th>
                <th className="pb-3 text-right">Qty</th>
                <th className="pb-3 text-right">LTP</th>
                <th className="pb-3 text-right">Change</th>
                <th className="pb-3 text-right">Value</th>
                <th className="pb-3 text-right">Allocation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {sortedHoldings?.map((holding) => (
                <tr key={holding.symbol} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{holding.symbol}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{holding.sector}</p>
                    </div>
                  </td>
                  <td className="py-3 text-right text-gray-600 dark:text-gray-300">{holding.quantity}</td>
                  <td className="py-3 text-right text-gray-900 dark:text-white font-medium">₹{holding.currentPrice.toLocaleString()}</td>
                  <td className={`py-3 text-right font-medium ${holding.changePercent >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {holding.changePercent >= 0 ? "+" : ""}{holding.changePercent.toFixed(2)}%
                  </td>
                  <td className="py-3 text-right text-gray-900 dark:text-white font-medium">{formatCurrency(holding.value)}</td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand-500 rounded-full"
                          style={{ width: `${holding.allocation * 10}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">{holding.allocation}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
