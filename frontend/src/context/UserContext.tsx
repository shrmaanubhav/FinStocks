"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Types for user profile data
export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  age: number;
  phone: string;
  address: string;
  incomeRange: string;
  expenditureRange: string;
  maritalStatus: string;
  children: number;
  jobType?: string;
  job?: string;
  monthlyIncome?: number | null;
  sideIncome?: number | null;
  investmentGoal?: string;
  investmentDuration?: string;
  riskPreference?: number | null;
  investingYears?: number | null;
  retirementAge?: number | null;
  stocks?: string[];
  holdings: Holding[];
  lifestyle: string;
  onboardingCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Holding {
  id?: string;
  symbol: string;
  name?: string;
  quantity: number;
  buyPrice?: number;
  currentPrice?: number;
  change?: number;
  changePercent?: number;
  value?: number;
  sector?: string;
  source: "manual" | "pdf_upload";
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
  userId: string | null;
  userEmail: string | null;
  userProfile: UserProfile | null;
  portfolio: Portfolio | null;
  healthScore: HealthScore | null;
  isLoading: boolean;
  error: string | null;
  isOnboarded: boolean;
  isAuthenticated: boolean;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updatePortfolio: (portfolio: Partial<Portfolio>) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check localStorage for user session on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    const storedUserEmail = localStorage.getItem("user_email");
    const storedOnboarding = localStorage.getItem("finstock_onboarding_completed");
    
    if (storedUserId) {
      setUserId(storedUserId);
      setUserEmail(storedUserEmail);
      
      // Fetch user profile from API
      if (storedOnboarding === "true") {
        fetchUserProfile(storedUserId);
      }
    }
    
    setIsLoading(false);
  }, []);

  const fetchUserProfile = async (uid: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/onboarding?userId=${uid}`);
      
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.profile);
        
        // Create portfolio from holdings
        if (data.profile.holdings && data.profile.holdings.length > 0) {
          setPortfolio({
            userId: uid,
            holdings: data.profile.holdings,
            totalValue: 0, // Calculate from holdings
          });
        }
        
        // Set demo health score
        setHealthScore({
          overallScore: 72,
          factors: {
            diversification: 65,
            volatility: 78,
            overlap: 82,
            cashExposure: 70,
          },
          recommendations: [
            "Consider adding more defensive sectors",
            "Your portfolio has good volatility management",
            "Review overlapping funds in your holdings",
          ],
        });
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      setError("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (userId) {
      await fetchUserProfile(userId);
    }
  };

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

  const logout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
    localStorage.removeItem("finstock_onboarding_completed");
    setUserId(null);
    setUserEmail(null);
    setUserProfile(null);
    setPortfolio(null);
    setHealthScore(null);
  };

  const isOnboarded = userProfile?.onboardingCompleted ?? false;
  const isAuthenticated = !!userId;

  return (
    <UserContext.Provider
      value={{
        userId,
        userEmail,
        userProfile,
        portfolio,
        healthScore,
        isLoading,
        error,
        isOnboarded,
        isAuthenticated,
        updateProfile,
        updatePortfolio,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
