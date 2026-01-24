import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { UserProfile } from "@/models/User";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      userId,
      name,
      age,
      phone,
      address,
      incomeRange,
      expenditureRange,
      maritalStatus,
      children,
      jobType,
      job,
      monthlyIncome,
      sideIncome,
      investmentGoal,
      investmentDuration,
      riskPreference,
      investingYears,
      retirementAge,
      stocks,
      holdings,
      lifestyle,
    } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!name || !age || !phone || !address) {
      return NextResponse.json(
        { error: "Personal information is required" },
        { status: 400 }
      );
    }

    if (!incomeRange || !expenditureRange || !maritalStatus) {
      return NextResponse.json(
        { error: "Financial information is required" },
        { status: 400 }
      );
    }

    // Convert userId to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Check if profile already exists
    const existingProfile = await UserProfile.findOne({ userId: userObjectId });
    
    if (existingProfile) {
      // Update existing profile
      existingProfile.name = name;
      existingProfile.age = age;
      existingProfile.phone = phone;
      existingProfile.address = address;
      existingProfile.incomeRange = incomeRange;
      existingProfile.expenditureRange = expenditureRange;
      existingProfile.maritalStatus = maritalStatus;
      existingProfile.children = children || 0;
      existingProfile.jobType = jobType || "";
      existingProfile.job = job || "";
      existingProfile.monthlyIncome = monthlyIncome ?? null;
      existingProfile.sideIncome = sideIncome ?? null;
      existingProfile.investmentGoal = investmentGoal || "";
      existingProfile.investmentDuration = investmentDuration || "";
      existingProfile.riskPreference = riskPreference ?? null;
      existingProfile.investingYears = investingYears ?? null;
      existingProfile.retirementAge = retirementAge ?? null;
      existingProfile.stocks = stocks || [];
      existingProfile.holdings = holdings || [];
      existingProfile.lifestyle = lifestyle || "";
      existingProfile.onboardingCompleted = true;
      
      await existingProfile.save();

      return NextResponse.json(
        {
          success: true,
          profile: {
            id: existingProfile._id.toString(),
            userId: existingProfile.userId.toString(),
            onboardingCompleted: true,
          },
        },
        { status: 200 }
      );
    }

    // Create new profile
    const newProfile = await UserProfile.create({
      userId: userObjectId,
      name,
      age,
      phone,
      address,
      incomeRange,
      expenditureRange,
      maritalStatus,
      children: children || 0,
      jobType: jobType || "",
      job: job || "",
      monthlyIncome: monthlyIncome ?? null,
      sideIncome: sideIncome ?? null,
      investmentGoal: investmentGoal || "",
      investmentDuration: investmentDuration || "",
      riskPreference: riskPreference ?? null,
      investingYears: investingYears ?? null,
      retirementAge: retirementAge ?? null,
      stocks: stocks || [],
      holdings: holdings || [],
      lifestyle: lifestyle || "",
      onboardingCompleted: true,
    });

    return NextResponse.json(
      {
        success: true,
        profile: {
          id: newProfile._id.toString(),
          userId: newProfile.userId.toString(),
          onboardingCompleted: true,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const profile = await UserProfile.findOne({ userId: userObjectId });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found", onboardingCompleted: false },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        profile: {
          id: profile._id.toString(),
          userId: profile.userId.toString(),
          name: profile.name,
          age: profile.age,
          phone: profile.phone,
          address: profile.address,
          incomeRange: profile.incomeRange,
          expenditureRange: profile.expenditureRange,
          maritalStatus: profile.maritalStatus,
          children: profile.children,
          jobType: profile.jobType,
          job: profile.job,
          monthlyIncome: profile.monthlyIncome,
          sideIncome: profile.sideIncome,
          investmentGoal: profile.investmentGoal,
          investmentDuration: profile.investmentDuration,
          riskPreference: profile.riskPreference,
          investingYears: profile.investingYears,
          retirementAge: profile.retirementAge,
          stocks: profile.stocks,
          holdings: profile.holdings,
          lifestyle: profile.lifestyle,
          onboardingCompleted: profile.onboardingCompleted,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
