import { NextRequest, NextResponse } from "next/server";

// Yahoo Finance API endpoint for stock quotes
const YAHOO_FINANCE_API = "https://query1.finance.yahoo.com/v7/finance/quote";

// Fallback mock data when Yahoo Finance is unavailable
const FALLBACK_STOCK_DATA: { [key: string]: Partial<YahooQuote> } = {
  AAPL: { symbol: "AAPL", shortName: "Apple Inc.", regularMarketPrice: 178.25, regularMarketChange: 2.35, regularMarketChangePercent: 1.34 },
  MSFT: { symbol: "MSFT", shortName: "Microsoft Corporation", regularMarketPrice: 415.50, regularMarketChange: -3.25, regularMarketChangePercent: -0.78 },
  GOOGL: { symbol: "GOOGL", shortName: "Alphabet Inc.", regularMarketPrice: 142.80, regularMarketChange: 1.85, regularMarketChangePercent: 1.31 },
  AMZN: { symbol: "AMZN", shortName: "Amazon.com Inc.", regularMarketPrice: 168.90, regularMarketChange: 4.20, regularMarketChangePercent: 2.55 },
  NVDA: { symbol: "NVDA", shortName: "NVIDIA Corporation", regularMarketPrice: 825.30, regularMarketChange: 15.60, regularMarketChangePercent: 1.93 },
  META: { symbol: "META", shortName: "Meta Platforms Inc.", regularMarketPrice: 445.20, regularMarketChange: -5.40, regularMarketChangePercent: -1.20 },
  TSLA: { symbol: "TSLA", shortName: "Tesla Inc.", regularMarketPrice: 210.75, regularMarketChange: 8.30, regularMarketChangePercent: 4.10 },
  NFLX: { symbol: "NFLX", shortName: "Netflix Inc.", regularMarketPrice: 595.40, regularMarketChange: 12.80, regularMarketChangePercent: 2.20 },
};


interface YahooQuote {
  symbol: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketPreviousClose?: number;
  regularMarketOpen?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  regularMarketVolume?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  marketCap?: number;
}

async function fetchYahooFinanceQuotes(symbols: string[]): Promise<YahooQuote[]> {
  try {
    const symbolsParam = symbols.join(",");
    const response = await fetch(
      `${YAHOO_FINANCE_API}?symbols=${symbolsParam}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Accept": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.warn(`Yahoo Finance API returned ${response.status}, using fallback data`);
      return [];
    }

    const data = await response.json();
    return data.quoteResponse?.result || [];
  } catch (error) {
    console.error("Yahoo Finance fetch error:", error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const { symbols } = await request.json();

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return NextResponse.json(
        { error: "Invalid symbols provided" },
        { status: 400 }
      );
    }

    // Fetch live data from Yahoo Finance
    const yahooQuotes = await fetchYahooFinanceQuotes(symbols);

    // Transform Yahoo Finance data to our format
    const stocks = symbols.map((symbol: string) => {
      const upperSymbol = symbol.toUpperCase();
      const quote = yahooQuotes.find(
        (q) => q.symbol?.toUpperCase() === upperSymbol
      );

      if (quote) {
        return {
          symbol: quote.symbol,
          name: quote.shortName || quote.longName || symbol,
          currentPrice: quote.regularMarketPrice || 0,
          previousClose: quote.regularMarketPreviousClose || 0,
          dayChange: quote.regularMarketChange || 0,
          changePercent: quote.regularMarketChangePercent || 0,
          dayHigh: quote.regularMarketDayHigh || 0,
          dayLow: quote.regularMarketDayLow || 0,
          volume: quote.regularMarketVolume || 0,
          fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh || 0,
          fiftyTwoWeekLow: quote.fiftyTwoWeekLow || 0,
          marketCap: quote.marketCap || 0,
        };
      }

      // Try fallback data
      const fallback = FALLBACK_STOCK_DATA[upperSymbol];
      if (fallback) {
        return {
          symbol: fallback.symbol || upperSymbol,
          name: fallback.shortName || upperSymbol,
          currentPrice: fallback.regularMarketPrice || 0,
          previousClose: 0,
          dayChange: fallback.regularMarketChange || 0,
          changePercent: fallback.regularMarketChangePercent || 0,
          dayHigh: 0,
          dayLow: 0,
          volume: 0,
          fiftyTwoWeekHigh: 0,
          fiftyTwoWeekLow: 0,
          marketCap: 0,
        };
      }

      // Return placeholder if Yahoo Finance doesn't have data
      return {
        symbol: upperSymbol,
        name: upperSymbol,
        currentPrice: 0,
        previousClose: 0,
        dayChange: 0,
        changePercent: 0,
        dayHigh: 0,
        dayLow: 0,
        volume: 0,
        fiftyTwoWeekHigh: 0,
        fiftyTwoWeekLow: 0,
        marketCap: 0,
        error: "Data not available",
      };
    });

    return NextResponse.json({
      stocks,
      timestamp: new Date().toISOString(),
      source: "Yahoo Finance",
    });
  } catch (error) {
    console.error("Stock API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock data" },
      { status: 500 }
    );
  }
}

