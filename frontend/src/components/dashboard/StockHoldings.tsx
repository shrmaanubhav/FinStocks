"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { useUser } from "@/context/UserContext";
import { Holding } from "@/context/UserContext";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface StockHistoryPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface StockData extends Holding {
  changePercent?: number;
  value?: number;
  dayChange?: number;
  dayHigh?: number;
  dayLow?: number;
  history?: StockHistoryPoint[];
}

export default function StockHoldings() {
  const { userProfile, isLoading, userId } = useUser();
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [stocksLoading, setStocksLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [totalChange, setTotalChange] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);

  const cacheKey = userId ? `finstock_stock_cache_${userId}` : "finstock_stock_cache";

  const fetchStockData = useCallback(async (holdings: Holding[]) => {
    try {
      setStocksLoading(true);
      
      // Fetch live stock data from Yahoo Finance API
      const response = await fetch("/api/stocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          symbols: holdings.map(h => h.symbol) 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const enrichedStocks = holdings.map((holding) => {
          const stockInfo = data.stocks.find((s: any) => s.symbol?.toUpperCase() === holding.symbol?.toUpperCase());
          return {
            ...holding,
            name: stockInfo?.name || holding.name || holding.symbol,
            currentPrice: stockInfo?.currentPrice || 0,
            changePercent: stockInfo?.changePercent || 0,
            value: (holding.quantity || 0) * (stockInfo?.currentPrice || 0),
            dayChange: (holding.quantity || 0) * (stockInfo?.dayChange || 0),
            dayHigh: stockInfo?.dayHigh || 0,
            dayLow: stockInfo?.dayLow || 0,
            history: stockInfo?.history || [],
          };
        });

        const updatedAt = new Date();
        setStocks(enrichedStocks);
        setLastUpdated(updatedAt);
        setSelectedStock((prev) => {
          if (!prev) return enrichedStocks[0] || null;
          const match = enrichedStocks.find(
            (item) => item.symbol?.toUpperCase() === prev.symbol?.toUpperCase()
          );
          return match || prev;
        });

        // Calculate totals
        const total = enrichedStocks.reduce((sum, stock) => sum + (stock.value || 0), 0);
        const change = enrichedStocks.reduce((sum, stock) => sum + (stock.dayChange || 0), 0);

        setTotalValue(total);
        setTotalChange(change);

        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            stocks: enrichedStocks,
            totalValue: total,
            totalChange: change,
            lastUpdated: updatedAt.toISOString(),
          })
        );
      }
    } catch (error) {
      console.error("Failed to fetch stock data:", error);
      // Use holdings as fallback without real-time data
      setStocks(
        holdings.map((h) => ({
          ...h,
          name: h.name || h.symbol,
          value: 0,
          changePercent: 0,
        }))
      );
    } finally {
      setStocksLoading(false);
    }
  }, [cacheKey]);

  useEffect(() => {
    if (userProfile?.holdings && userProfile.holdings.length > 0) {
      const cachedRaw = localStorage.getItem(cacheKey);
      if (cachedRaw) {
        try {
          const cached = JSON.parse(cachedRaw);
          if (cached?.stocks?.length) {
            setStocks(cached.stocks);
            setTotalValue(cached.totalValue || 0);
            setTotalChange(cached.totalChange || 0);
            setLastUpdated(cached.lastUpdated ? new Date(cached.lastUpdated) : null);
            setSelectedStock((prev) => {
              if (!prev) return cached.stocks[0] || null;
              const match = cached.stocks.find(
                (item: StockData) => item.symbol?.toUpperCase() === prev.symbol?.toUpperCase()
              );
              return match || prev;
            });
            setStocksLoading(false);
            return;
          }
        } catch (error) {
          console.warn("Invalid stock cache, clearing:", error);
          localStorage.removeItem(cacheKey);
        }
      }

      fetchStockData(userProfile.holdings);
    } else {
      setStocksLoading(false);
    }
  }, [userProfile, fetchStockData, cacheKey]);

  const handleRefresh = () => {
    if (userProfile?.holdings && userProfile.holdings.length > 0) {
      fetchStockData(userProfile.holdings);
    }
  };

  const chartData = useMemo(() => {
    const history = selectedStock?.history || [];
    return {
      categories: history.map((point) => point.date),
      series: [
        {
          name: "Close",
          data: history.map((point) => Number(point.close)),
        },
      ],
    };
  }, [selectedStock]);

  const chartOptions: ApexOptions = useMemo(() => {
    return {
      chart: {
        type: "area",
        height: 320,
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      colors: ["#2563eb"],
      stroke: { curve: "smooth", width: 2 },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.05,
          stops: [0, 90, 100],
        },
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: chartData.categories,
        labels: { rotate: -45, hideOverlappingLabels: true },
      },
      yaxis: {
        labels: {
          formatter: (value) => `$${value.toFixed(2)}`,
        },
      },
      tooltip: {
        x: {
          formatter: (value) => String(value),
        },
      },
      grid: {
        borderColor: "#e5e7eb",
        strokeDashArray: 4,
      },
    };
  }, [chartData.categories]);

  if (isLoading || stocksLoading) {
    return (
      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-dark p-6 md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stocks || stocks.length === 0) {
    return (
      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-dark p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Your Holdings
        </h2>
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No stocks in your portfolio yet. Complete onboarding to add stocks.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-dark p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Your Holdings
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                NASDAQ
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Live market prices (weekly data)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={handleRefresh}
              disabled={stocksLoading}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              title="Refresh prices"
            >
              <svg
                className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${stocksLoading ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
              Total Value
            </p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className={`rounded-2xl p-4 border ${
            totalChange >= 0
              ? "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800"
              : "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800"
          }`}>
            <p className={`text-sm font-medium mb-1 ${
              totalChange >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}>
              Week&apos;s Change
            </p>
            <p className={`text-2xl font-bold ${
              totalChange >= 0
                ? "text-green-900 dark:text-green-200"
                : "text-red-900 dark:text-red-200"
            }`}>
              {totalChange >= 0 ? '+' : ''}${totalChange.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 border border-purple-200 dark:border-purple-800">
            <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
              Total Holdings
            </p>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-200">
              {stocks.length} stocks
            </p>
          </div>
        </div>
      </div>

      {/* Stocks Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                Stock
              </th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                Shares
              </th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                Price (USD)
              </th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                Value (USD)
              </th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                Change
              </th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => (
              <tr
                key={stock.symbol}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                onClick={() => setSelectedStock(stock)}
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500/20 to-purple-500/20 flex items-center justify-center">
                      <span className="text-brand-600 dark:text-brand-400 font-bold text-sm">
                        {stock.symbol?.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {stock.symbol}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[200px] truncate">
                        {stock.name}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-right text-gray-700 dark:text-gray-300 font-medium">
                  {stock.quantity}
                </td>
                <td className="py-4 px-4 text-right text-gray-700 dark:text-gray-300">
                  ${(stock.currentPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-4 px-4 text-right font-semibold text-gray-900 dark:text-white">
                  ${(stock.value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-4 px-4 text-right">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      (stock.changePercent || 0) >= 0
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                    }`}
                  >
                    {(stock.changePercent || 0) >= 0 ? "▲" : "▼"} {Math.abs(stock.changePercent || 0).toFixed(2)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected Stock Chart */}
      {selectedStock && (
        <div className="mt-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-dark p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedStock.symbol} Price History
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedStock.name}
              </p>
            </div>
            <button
              onClick={() => setSelectedStock(null)}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Close
            </button>
          </div>
          {selectedStock.history && selectedStock.history.length > 0 ? (
            <ReactApexChart
              options={chartOptions}
              series={chartData.series}
              type="area"
              height={320}
            />
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No historical data available for this stock.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
