import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { User, UserProfile } from "@/models/User";

async function handleGetUser(request: NextRequest) {
  try {
    await connectDB();

    // Support both POST (JSON body) and GET (query param)
    let email = "";
    if (request.method === "POST") {
      const body = await request.json();
      email = body?.email ?? "";
    } else {
      // NextRequest provides nextUrl with searchParams
      email = String(request.nextUrl.searchParams.get("email") ?? "");
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find user by email
    const user = await User.findOne({ email: (email || "").toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or User Don't Exist" },
        { status: 401 }
      );
    }

    // Check if user has completed onboarding
    const profile = await UserProfile.findOne({ userId: user._id });
    const onboardingCompleted = profile?.onboardingCompleted ?? false;

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id.toString(),
          profile: profile,
          onboardingCompleted,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("User Not Found error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleGetUser(request);
}

export async function POST(request: NextRequest) {
  return handleGetUser(request);
}
