"use client";
import { useState, useEffect, useRef, useCallback } from "react";

interface Stock {
  symbol: string;
  name: string;
}

interface StockSearchProps {
  onSelect: (stock: Stock) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function StockSearch({
  onSelect,
  placeholder = "Search NASDAQ stocks...",
  disabled = false,
}: StockSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  const searchStocks = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 1) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.stocks || []);
        setIsOpen(true);
      }
    } catch (error) {
      console.error("Stock search error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        searchStocks(query);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchStocks]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (stock: Stock) => {
    onSelect(stock);
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="relative flex-1">
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="w-full px-4 py-3 pl-10 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all disabled:opacity-50"
          placeholder={placeholder}
        />
        {/* Search Icon */}
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 py-2 rounded-xl bg-gray-900 border border-white/10 shadow-2xl max-h-64 overflow-y-auto"
        >
          {results.map((stock, index) => (
            <button
              key={stock.symbol}
              type="button"
              onClick={() => handleSelect(stock)}
              className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-white/5 transition-colors ${
                index === selectedIndex ? "bg-white/10" : ""
              }`}
            >
              <div>
                <span className="font-semibold text-white">{stock.symbol}</span>
                <span className="ml-2 text-sm text-gray-400">{stock.name}</span>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-brand-500/20 text-brand-400">
                NASDAQ
              </span>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {isOpen && query && !isLoading && results.length === 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 py-4 px-4 rounded-xl bg-gray-900 border border-white/10 shadow-2xl text-center"
        >
          <p className="text-gray-400">No NASDAQ stocks found for &quot;{query}&quot;</p>
          <p className="text-xs text-gray-500 mt-1">Try searching by symbol or company name</p>
        </div>
      )}
    </div>
  );
}
