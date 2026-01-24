"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// Types for user profile data
export interface UserProfile {
  id?: string;
  clerkId: string;
  name: string;
  age: number;
  pan: string;
  phone: string;
  address: string;
  annualIncome: string;
  monthlyExpenditure: string;
  maritalStatus: string;
  children: number;
  lifestyle: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Holding {
  id?: string;
  symbol: string;
  name: string;
  quantity: number;
  buyPrice: number;
  currentPrice?: number;
  change?: number;
  changePercent?: number;
  value?: number;
  sector?: string;
}

export interface Portfolio {
  id?: string;
  userId: string;
  holdings: Holding[];
  totalValue?: number;
  totalChange?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface HealthScore {
  overallScore: number;
  factors: {
    diversification: number;
    volatility: number;
    overlap: number;
    cashExposure: number;
  };
  recommendations: string[];
}

interface UserContextType {
  userProfile: UserProfile | null;
  portfolio: Portfolio | null;
  healthScore: HealthScore | null;
  isLoading: boolean;
  error: string | null;
  isOnboarded: boolean;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updatePortfolio: (portfolio: Partial<Portfolio>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>({
    id: "demo",
    clerkId: "demo-user",
    name: "Demo User",
    age: 30,
    pan: "ABCDE1234F",
    phone: "+91-9876543210",
    address: "Demo Address",
    annualIncome: "1200000",
    monthlyExpenditure: "50000",
    maritalStatus: "single",
    children: 0,
    lifestyle: "moderate",
  });
  const [portfolio, setPortfolio] = useState<Portfolio | null>({
    id: "demo-portfolio",
    userId: "demo-user",
    holdings: [
      {
        id: "1",
        symbol: "RELIANCE",
        name: "Reliance Industries Ltd",
        quantity: 10,
        buyPrice: 2500,
        currentPrice: 2600,
        change: 100,
        changePercent: 4.0,
        value: 26000,
        sector: "Energy"
      },
      {
        id: "2",
        symbol: "TCS",
        name: "Tata Consultancy Services Ltd",
        quantity: 5,
        buyPrice: 3200,
        currentPrice: 3100,
        change: -100,
        changePercent: -3.13,
        value: 15500,
        sector: "Technology"
      }
    ],
    totalValue: 41500,
    totalChange: 0,
  });
  const [healthScore, setHealthScore] = useState<HealthScore | null>({
    overallScore: 75,
    factors: {
      diversification: 80,
      volatility: 70,
      overlap: 60,
      cashExposure: 85
    },
    recommendations: [
      "Consider adding more diversification across sectors",
      "Review your risk exposure",
      "Monitor portfolio performance regularly"
    ]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user has completed onboarding
  const isOnboarded = Boolean(userProfile?.name && userProfile?.pan);

  const updateProfile = (profile: Partial<UserProfile>) => {
    if (userProfile) {
      setUserProfile({ ...userProfile, ...profile });
    }
  };

  const updatePortfolio = (portfolioUpdate: Partial<Portfolio>) => {
    if (portfolio) {
      setPortfolio({ ...portfolio, ...portfolioUpdate });
    }
  };

  const value: UserContextType = {
    userProfile,
    portfolio,
    healthScore,
    isLoading,
    error,
    isOnboarded,
    updateProfile,
    updatePortfolio,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
}
