import { NextRequest, NextResponse } from "next/server";

// Your backend API endpoint
const BACKEND_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Stock name mapping for NASDAQ stocks
const STOCK_NAMES: { [key: string]: string } = {
  AAPL: "Apple Inc.",
  MSFT: "Microsoft Corporation",
  GOOGL: "Alphabet Inc. Class A",
  GOOG: "Alphabet Inc. Class C",
  AMZN: "Amazon.com Inc.",
  NVDA: "NVIDIA Corporation",
  META: "Meta Platforms Inc.",
  TSLA: "Tesla Inc.",
  NFLX: "Netflix Inc.",
  AMD: "Advanced Micro Devices",
  INTC: "Intel Corporation",
  PYPL: "PayPal Holdings Inc.",
  ADBE: "Adobe Inc.",
  CRM: "Salesforce Inc.",
  CSCO: "Cisco Systems Inc.",
  QCOM: "Qualcomm Inc.",
  AVGO: "Broadcom Inc.",
  TXN: "Texas Instruments",
  COST: "Costco Wholesale",
  PEP: "PepsiCo Inc.",
};

interface StockDataPoint {
  Date: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
}

interface BackendResponse {
  stocks: {
    [symbol: string]: StockDataPoint[];
  };
}

async function fetchFromBackend(symbols: string[]): Promise<BackendResponse | null> {
  try {
    const response = await fetch(`${BACKEND_API}/api/myStocks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ stocks: symbols }),
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn(`Backend API returned ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Backend API fetch error:", error);
    return null;
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

    // Fetch data from your backend API
    const backendData = await fetchFromBackend(symbols);

    // Transform backend data to our format
    const stocks = symbols.map((symbol: string) => {
      const upperSymbol = symbol.toUpperCase();
      const stockHistory = backendData?.stocks?.[upperSymbol];

      if (stockHistory && stockHistory.length > 0) {
        // Get the latest data point (last in array = most recent week)
        const latestData = stockHistory[stockHistory.length - 1];
        // Get previous week's data for calculating change
        const previousData = stockHistory.length > 1 
          ? stockHistory[stockHistory.length - 2] 
          : null;

        const currentPrice = latestData.Close;
        const previousClose = previousData?.Close || latestData.Open;
        const dayChange = currentPrice - previousClose;
        const changePercent = previousClose > 0 
          ? ((dayChange / previousClose) * 100) 
          : 0;

        return {
          symbol: upperSymbol,
          name: STOCK_NAMES[upperSymbol] || upperSymbol,
          currentPrice: currentPrice,
          previousClose: previousClose,
          dayChange: dayChange,
          changePercent: changePercent,
          dayHigh: latestData.High,
          dayLow: latestData.Low,
          weekOpen: latestData.Open,
          volume: latestData.Volume,
          lastUpdated: latestData.Date,
          // Include historical data for charts (full range)
          history: stockHistory.map((point: StockDataPoint) => ({
            date: point.Date,
            open: point.Open,
            high: point.High,
            low: point.Low,
            close: point.Close,
            volume: point.Volume,
          })),
        };
      }

      // Return placeholder if no data available
      return {
        symbol: upperSymbol,
        name: STOCK_NAMES[upperSymbol] || upperSymbol,
        currentPrice: 0,
        previousClose: 0,
        dayChange: 0,
        changePercent: 0,
        dayHigh: 0,
        dayLow: 0,
        weekOpen: 0,
        volume: 0,
        lastUpdated: null,
        history: [],
        error: "Data not available",
      };
    });

    return NextResponse.json({
      stocks,
      timestamp: new Date().toISOString(),
      source: "Backend API",
    });
  } catch (error) {
    console.error("Stock API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock data" },
      { status: 500 }
    );
  }
}

