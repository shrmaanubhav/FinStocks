import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { UserChat } from "@/models/Chat";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const chatDoc = await UserChat.findOne({ userId: userObjectId });

    return NextResponse.json(
      {
        success: true,
        chats: chatDoc?.chats || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Advice chat fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { userId, query, advice, timestamp } = body;

    if (!userId || !query || !advice) {
      return NextResponse.json(
        { error: "userId, query, and advice are required" },
        { status: 400 }
      );
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const chatEntry = {
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      query,
      advice,
    };

    await UserChat.findOneAndUpdate(
      { userId: userObjectId },
      { $push: { chats: chatEntry } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Advice chat save error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
