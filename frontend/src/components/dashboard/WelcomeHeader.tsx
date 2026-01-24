"use client";
import React, { useEffect, useState } from "react";

interface UserProfile {
  name: string;
  age: number;
  annualIncome: string;
  lifestyle: string;
}

export default function WelcomeHeader() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    // Get user profile from localStorage
    const profileData = localStorage.getItem("finStocksProfile");
    if (profileData) {
      setProfile(JSON.parse(profileData));
    }

    // Update greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) {
      setCurrentTime("Good Morning");
    } else if (hour < 17) {
      setCurrentTime("Good Afternoon");
    } else {
      setCurrentTime("Good Evening");
    }
  }, []);

  const getFirstName = (fullName: string) => {
    return fullName.split(" ")[0];
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6 border border-white/10">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-gray-400 text-sm mb-1">{currentTime} 👋</p>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {profile ? (
              <>
                Welcome back, <span className="text-brand-400">{getFirstName(profile.name)}</span>
              </>
            ) : (
              "Welcome to FinStocks"
            )}
          </h1>
          <p className="text-gray-400 mt-2 text-sm md:text-base">
            Here's your portfolio's health report for today
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Quick Stats */}
          <div className="hidden sm:flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </p>
              <p className="text-xs text-gray-400">Market Day</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-green-400">Markets Open</span>
              </div>
              <p className="text-xs text-gray-400">NSE • BSE</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
