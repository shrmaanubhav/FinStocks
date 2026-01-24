"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";

interface StockNews {
  [symbol: string]: string[];
}

interface NewsCard {
  id: string;
  stock: string;
  headline: string;
  index: number;
}

const STOCK_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  AAPL: { bg: "bg-gradient-to-br from-gray-900 to-gray-800", text: "text-white", border: "border-gray-700" },
  MSFT: { bg: "bg-gradient-to-br from-blue-900 to-blue-800", text: "text-white", border: "border-blue-700" },
  TSLA: { bg: "bg-gradient-to-br from-red-900 to-red-800", text: "text-white", border: "border-red-700" },
  GOOGL: { bg: "bg-gradient-to-br from-green-900 to-green-800", text: "text-white", border: "border-green-700" },
  AMZN: { bg: "bg-gradient-to-br from-orange-900 to-orange-800", text: "text-white", border: "border-orange-700" },
  META: { bg: "bg-gradient-to-br from-indigo-900 to-indigo-800", text: "text-white", border: "border-indigo-700" },
  NVDA: { bg: "bg-gradient-to-br from-emerald-900 to-emerald-800", text: "text-white", border: "border-emerald-700" },
  NFLX: { bg: "bg-gradient-to-br from-rose-900 to-rose-800", text: "text-white", border: "border-rose-700" },
  DEFAULT: { bg: "bg-gradient-to-br from-purple-900 to-purple-800", text: "text-white", border: "border-purple-700" },
};

const STOCK_ICONS: Record<string, string> = {
  AAPL: "🍎",
  MSFT: "🪟",
  TSLA: "⚡",
  GOOGL: "🔍",
  AMZN: "📦",
  META: "👥",
  NVDA: "🎮",
  NFLX: "🎬",
  DEFAULT: "📊",
};

export default function NewsPage() {
  const [newsData, setNewsData] = useState<StockNews>({});
  const [allCards, setAllCards] = useState<NewsCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [portfolioData, setProfileData] = useState({})
  const cardRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance
  const minSwipeDistance = 50;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        
        // Get user's portfolio stocks from localStorage
        const email = localStorage.getItem("user_email");
        // will hold profile returned from getUser
        let userProfile: any = null;
        if (email) {
          try {
            // Use GET with query param to avoid sending a body with GET
            const response = await fetch(
              `/api/auth/getUser?email=${encodeURIComponent(email)}`
            );

            const data = await response.json();
            console.log(data);
            // route returns { success: true, user: { profile: ... } }
            const profile = data.user?.profile ?? data.profile ?? {};
            setProfileData(profile);
            userProfile = profile;

            if (!response.ok) {
              throw new Error(data.error || "Failed to fetch user");
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
          }
        } else {
          // no email stored; skip user fetch
          setProfileData({});
        }

        // Build stockSymbols from returned profile (or existing state)
        let stockSymbols: string[] = [];
        const sourceProfile = userProfile ?? (portfolioData as any) ?? null;
        if (sourceProfile && Array.isArray(sourceProfile.holdings)) {
          stockSymbols = Array.from(
            new Set(
              sourceProfile.holdings
                .map((s: any) => String(s.symbol ?? "").trim().toUpperCase())
                .filter(Boolean),
            ),
          );
        }
        console.log("stockSymbols:", stockSymbols);

        // Fallback to default stocks if no portfolio
        if (stockSymbols.length === 0) {
          stockSymbols = ["AAPL", "MSFT", "TSLA"];
        }

        // Fetch news from API
        const response = await fetch("http://localhost:8000/api/news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stocks: stockSymbols,
            limit: 5,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch news");
        }

        const data = await response.json();
        setNewsData(data.stocks || {});
        
        // Transform news data into swipeable cards
        const cards: NewsCard[] = [];
        Object.entries(data.stocks || {}).forEach(([stock, headlines]) => {
          (headlines as string[]).forEach((headline, idx) => {
            cards.push({
              id: `${stock}-${idx}`,
              stock,
              headline,
              index: idx,
            });
          });
        });
        
        // Shuffle cards for variety
        const shuffledCards = cards.sort(() => Math.random() - 0.5);
        setAllCards(shuffledCards);
        
      } catch (err) {
        console.error("Error fetching news:", err);
        setError("Failed to load news. Please try again later.");
        
        // Fallback mock data
        const mockData: StockNews = {
          AAPL: [
            "Apple's latest iPhone sales exceed expectations in Q4.",
            "Apple announces new AI features for upcoming iOS update.",
            "Tim Cook highlights growth in services revenue.",
          ],
          MSFT: [
            "Microsoft Azure revenue grows 30% year-over-year.",
            "Microsoft announces major AI partnership expansion.",
            "Xbox Game Pass reaches 40 million subscribers.",
          ],
          TSLA: [
            "Tesla breaks delivery records in latest quarter.",
            "Cybertruck production ramps up significantly.",
            "Tesla FSD showing promising improvement metrics.",
          ],
        };
        setNewsData(mockData);
        
        const fallbackCards: NewsCard[] = [];
        Object.entries(mockData).forEach(([stock, headlines]) => {
          headlines.forEach((headline, idx) => {
            fallbackCards.push({
              id: `${stock}-${idx}`,
              stock,
              headline,
              index: idx,
            });
          });
        });
        setAllCards(fallbackCards.sort(() => Math.random() - 0.5));
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  const getStockColor = (symbol: string) => {
    return STOCK_COLORS[symbol] || STOCK_COLORS.DEFAULT;
  };

  const getStockIcon = (symbol: string) => {
    return STOCK_ICONS[symbol] || STOCK_ICONS.DEFAULT;
  };

  const goToNext = useCallback(() => {
    if (isAnimating || currentIndex >= allCards.length - 1) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => prev + 1);
    setTimeout(() => setIsAnimating(false), 300);
  }, [currentIndex, allCards.length, isAnimating]);

  const goToPrev = useCallback(() => {
    if (isAnimating || currentIndex <= 0) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => prev - 1);
    setTimeout(() => setIsAnimating(false), 300);
  }, [currentIndex, isAnimating]);

  // Touch handlers for swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    setSwipeOffset(currentTouch - touchStart);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setSwipeOffset(0);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrev();
    }
    
    setSwipeOffset(0);
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Mouse handlers for desktop swipe
  const [mouseStart, setMouseStart] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const onMouseDown = (e: React.MouseEvent) => {
    setMouseStart(e.clientX);
    setIsDragging(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || mouseStart === null) return;
    setSwipeOffset(e.clientX - mouseStart);
  };

  const onMouseUp = () => {
    if (!isDragging || mouseStart === null) {
      setSwipeOffset(0);
      setIsDragging(false);
      return;
    }
    
    if (swipeOffset < -minSwipeDistance) {
      goToNext();
    } else if (swipeOffset > minSwipeDistance) {
      goToPrev();
    }
    
    setSwipeOffset(0);
    setMouseStart(null);
    setIsDragging(false);
  };

  const onMouseLeave = () => {
    if (isDragging) {
      setSwipeOffset(0);
      setMouseStart(null);
      setIsDragging(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        goToNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        goToPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading news from your portfolio...</p>
        </div>
      </div>
    );
  }

  const currentCard = allCards[currentIndex];
  const stockColor = currentCard ? getStockColor(currentCard.stock) : getStockColor("DEFAULT");
  const stockIcon = currentCard ? getStockIcon(currentCard.stock) : "📊";

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <PageBreadCrumb pageTitle="News Feed" />
      
      <div className="flex-1 relative max-w-2xl mx-auto px-4 w-full">
        {/* Header */}
          {/* Stock Filter Pills */}
            <div className="mt-4 mb-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 text-center">
                Filter by stock
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {Object.keys(newsData).map((stock) => {
                  const color = getStockColor(stock);
                  const icon = getStockIcon(stock);
                  const stockCards = allCards.filter((c) => c.stock === stock);
                  const firstIndex = allCards.findIndex((c) => c.stock === stock);
                  
                  return (
                    <button
                      key={stock}
                      onClick={() => firstIndex >= 0 && setCurrentIndex(firstIndex)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                        currentCard?.stock === stock
                          ? `${color.bg} ${color.border} text-white`
                          : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      <span>{icon}</span>
                      <span className="font-medium">{stock}</span>
                      <span className="text-xs opacity-60">({stockCards.length})</span>
                    </button>
                  );
                })}
              </div>
            </div>
        {error && allCards.length === 0 ? (
          <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 text-center">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="relative">
            {/* Left Navigation Button */}
            <button
              onClick={goToPrev}
              disabled={currentIndex === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Right Navigation Button */}
            <button
              onClick={goToNext}
              disabled={currentIndex >= allCards.length - 1}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 p-4 rounded-full bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Swipeable Card Container */}
            <div className="relative h-[60vh] min-h-[400px] max-h-[600px] perspective-1000 mx-16">
              {/* Background cards for stack effect */}
              {currentIndex + 2 < allCards.length && (
                <div
                  className={`absolute inset-0 rounded-3xl opacity-30 scale-90 translate-y-8 ${getStockColor(allCards[currentIndex + 2]?.stock).bg}`}
                />
              )}
              {currentIndex + 1 < allCards.length && (
                <div
                  className={`absolute inset-0 rounded-3xl opacity-50 scale-95 translate-y-4 ${getStockColor(allCards[currentIndex + 1]?.stock).bg}`}
                />
              )}
              
              {/* Main Card */}
              {currentCard && (
                <div
                  ref={cardRef}
                  className={`absolute inset-0 rounded-3xl border-2 ${stockColor.bg} ${stockColor.border} shadow-2xl cursor-grab active:cursor-grabbing select-none overflow-hidden transition-transform duration-300 ease-out`}
                  style={{
                    transform: `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.02}deg)`,
                  }}
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                  onMouseDown={onMouseDown}
                  onMouseMove={onMouseMove}
                  onMouseUp={onMouseUp}
                  onMouseLeave={onMouseLeave}
                >
                  
                  {/* Card Content */}
                  <div className="h-full flex flex-col p-8">
                    {/* Stock Badge */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{stockIcon}</span>
                        <div>
                          <span className="text-2xl font-bold text-white">{currentCard.stock}</span>
                          <p className="text-white/60 text-sm">Portfolio Stock</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-white/80 text-sm">Live</span>
                      </div>
                    </div>

                    {/* News Content */}
                    <div className="flex-1 flex items-center">
                      <p className={`text-2xl md:text-3xl font-medium leading-relaxed ${stockColor.text}`}>
                        {currentCard.headline}
                      </p>
                    </div>

                    {/* Swipe Indicator */}
                    <div className="flex items-center justify-center gap-4 mt-6">
                      <div className="flex items-center gap-2 text-white/40">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="text-sm">Previous</span>
                      </div>
                      <div className="w-px h-4 bg-white/20" />
                      <div className="flex items-center gap-2 text-white/40">
                        <span className="text-sm">Next</span>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>
              )}

              {/* Swipe Direction Indicators */}
              {swipeOffset < -20 && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400 animate-pulse">
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
              {swipeOffset > 20 && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400 animate-pulse">
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
              )}
            </div>

            {/* Progress Indicator */}
            <div className="mt-8 flex flex-col items-center gap-4">
              {/* Dot indicators */}
              <div className="flex items-center gap-2 flex-wrap justify-center max-w-md">
                {allCards.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      idx === currentIndex
                        ? "w-6 bg-brand-500"
                        : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                    }`}
                  />
                ))}
              </div>

              {/* Counter */}
              <p className="text-gray-500 dark:text-gray-400">
                <span className="text-brand-500 font-semibold">{currentIndex + 1}</span>
                <span> / {allCards.length}</span>
              </p>
            </div>

          
          </div>
        )}
      </div>
    </div>
  );
}
