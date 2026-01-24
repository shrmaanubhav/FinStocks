import { NextRequest, NextResponse } from "next/server";

// Mock stock data - replace with real API calls (Alpha Vantage, Finnhub, etc.)
const MOCK_STOCKS: { [key: string]: any } = {
  "RELIANCE": {
    symbol: "RELIANCE",
    name: "Reliance Industries",
    currentPrice: 2945.50,
    changePercent: 2.35,
    dayChange: 68.50,
    high: 2950,
    low: 2900,
    volume: 1200000,
  },
  "INFY": {
    symbol: "INFY",
    name: "Infosys",
    currentPrice: 1654.00,
    changePercent: 1.45,
    dayChange: 23.50,
    high: 1660,
    low: 1640,
    volume: 800000,
  },
  "TCS": {
    symbol: "TCS",
    name: "Tata Consultancy Services",
    currentPrice: 3850.75,
    changePercent: -0.85,
    dayChange: -33.00,
    high: 3880,
    low: 3840,
    volume: 600000,
  },
  "HDFC": {
    symbol: "HDFC",
    name: "HDFC Bank",
    currentPrice: 1640.25,
    changePercent: 1.12,
    dayChange: 18.25,
    high: 1645,
    low: 1630,
    volume: 900000,
  },
  "ICICIBANK": {
    symbol: "ICICIBANK",
    name: "ICICI Bank",
    currentPrice: 999.50,
    changePercent: 0.95,
    dayChange: 9.50,
    high: 1005,
    low: 990,
    volume: 1100000,
  },
  "WIPRO": {
    symbol: "WIPRO",
    name: "Wipro",
    currentPrice: 475.30,
    changePercent: -1.25,
    dayChange: -6.00,
    high: 485,
    low: 470,
    volume: 700000,
  },
  "ITC": {
    symbol: "ITC",
    name: "ITC",
    currentPrice: 465.80,
    changePercent: 2.10,
    dayChange: 9.65,
    high: 468,
    low: 460,
    volume: 500000,
  },
  "SBIN": {
    symbol: "SBIN",
    name: "State Bank of India",
    currentPrice: 645.25,
    changePercent: 1.55,
    dayChange: 9.90,
    high: 650,
    low: 640,
    volume: 1300000,
  },
};

export async function POST(request: NextRequest) {
  try {
    const { symbols } = await request.json();

    if (!symbols || !Array.isArray(symbols)) {
      return NextResponse.json(
        { error: "Invalid symbols provided" },
        { status: 400 }
      );
    }

    // Fetch stock data
    const stocks = symbols.map((symbol: string) => {
      const upperSymbol = symbol.toUpperCase();
      // Return mock data or real data from an API
      return (
        MOCK_STOCKS[upperSymbol] || {
          symbol: upperSymbol,
          name: upperSymbol,
          currentPrice: Math.random() * 5000,
          changePercent: (Math.random() - 0.5) * 10,
          dayChange: (Math.random() - 0.5) * 500,
        }
      );
    });

    return NextResponse.json({
      stocks,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Stock API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock data" },
      { status: 500 }
    );
  }
}
