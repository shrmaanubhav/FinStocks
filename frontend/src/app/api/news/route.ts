import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { UserNews } from "@/models/News";
import mongoose from "mongoose";

const BACKEND_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { userId, stocks, limit = 3, refresh = false } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    if (!refresh) {
      const existing = await UserNews.findOne({ userId: userObjectId });
      if (existing) {
        const cachedStocks: Record<string, string[]> = {};
        existing.stocks.forEach((stock) => {
          cachedStocks[stock.symbol] = stock.headlines || [];
        });

        return NextResponse.json(
          {
            success: true,
            stocks: cachedStocks,
            updatedAt: existing.updatedAt,
            source: "cache",
          },
          { status: 200 }
        );
      }
    }

    if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {
      return NextResponse.json(
        { error: "Stocks array is required" },
        { status: 400 }
      );
    }

    const backendResponse = await fetch(`${BACKEND_API}/api/news`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stocks, limit }),
    });

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch news from backend" },
        { status: 502 }
      );
    }

    const backendData = await backendResponse.json();
    const backendStocks = backendData.stocks || {};

    const normalizedStocks = Object.entries(backendStocks).map(
      ([symbol, headlines]) => ({
        symbol,
        headlines: Array.isArray(headlines) ? headlines : [],
      })
    );

    const updated = await UserNews.findOneAndUpdate(
      { userId: userObjectId },
      { stocks: normalizedStocks },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(
      {
        success: true,
        stocks: backendStocks,
        updatedAt: updated?.updatedAt || null,
        source: "backend",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("News cache error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
