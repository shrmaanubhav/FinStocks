"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

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
  status: "Excellent" | "Good" | "Fair" | "Needs Attention";
  lastUpdated: string;
}

interface UserContextType {
  userProfile: UserProfile | null;
  portfolio: Portfolio | null;
  healthScore: HealthScore | null;
  isLoading: boolean;
  isOnboarded: boolean;
  error: string | null;
  setUserProfile: (profile: UserProfile) => void;
  setPortfolio: (portfolio: Portfolio) => void;
  setHealthScore: (score: HealthScore) => void;
  saveUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  savePortfolio: (holdings: Holding[]) => Promise<void>;
  refreshData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user has completed onboarding
  const isOnboarded = Boolean(userProfile?.name && userProfile?.pan);

  // Fetch user data from Supabase on auth
  useEffect(() => {
    if (isLoaded && user) {
      fetchUserData();
    } else if (isLoaded && !user) {
      setIsLoading(false);
      setUserProfile(null);
      setPortfolio(null);
      setHealthScore(null);
    }
  }, [isLoaded, user]);

  const fetchUserData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("clerk_id", user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error fetching profile:", profileError);
      }

      if (profileData) {
        setUserProfile({
          id: profileData.id,
          clerkId: profileData.clerk_id,
          name: profileData.name,
          age: profileData.age,
          pan: profileData.pan,
          phone: profileData.phone,
          address: profileData.address,
          annualIncome: profileData.annual_income,
          monthlyExpenditure: profileData.monthly_expenditure,
          maritalStatus: profileData.marital_status,
          children: profileData.children,
          lifestyle: profileData.lifestyle,
          createdAt: profileData.created_at,
          updatedAt: profileData.updated_at,
        });

        // Fetch portfolio
        const { data: portfolioData, error: portfolioError } = await supabase
          .from("portfolios")
          .select("*, holdings(*)")
          .eq("user_id", profileData.id)
          .single();

        if (portfolioError && portfolioError.code !== "PGRST116") {
          console.error("Error fetching portfolio:", portfolioError);
        }

        if (portfolioData) {
          setPortfolio({
            id: portfolioData.id,
            userId: portfolioData.user_id,
            holdings: portfolioData.holdings?.map((h: any) => ({
              id: h.id,
              symbol: h.symbol,
              name: h.name,
              quantity: h.quantity,
              buyPrice: h.buy_price,
              currentPrice: h.current_price,
              sector: h.sector,
            })) || [],
            totalValue: portfolioData.total_value,
            createdAt: portfolioData.created_at,
            updatedAt: portfolioData.updated_at,
          });

          // Calculate health score (mock for now, will be replaced with API call)
          setHealthScore({
            overallScore: 78,
            factors: {
              diversification: 72,
              volatility: 85,
              overlap: 68,
              cashExposure: 82,
            },
            status: "Good",
            lastUpdated: new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserProfile = async (profile: Partial<UserProfile>) => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const profileData = {
        clerk_id: user.id,
        name: profile.name,
        age: profile.age,
        pan: profile.pan,
        phone: profile.phone,
        address: profile.address,
        annual_income: profile.annualIncome,
        monthly_expenditure: profile.monthlyExpenditure,
        marital_status: profile.maritalStatus,
        children: profile.children,
        lifestyle: profile.lifestyle,
        updated_at: new Date().toISOString(),
      };

      const { data, error: upsertError } = await supabase
        .from("user_profiles")
        .upsert(profileData, { onConflict: "clerk_id" })
        .select()
        .single();

      if (upsertError) throw upsertError;

      if (data) {
        setUserProfile({
          id: data.id,
          clerkId: data.clerk_id,
          name: data.name,
          age: data.age,
          pan: data.pan,
          phone: data.phone,
          address: data.address,
          annualIncome: data.annual_income,
          monthlyExpenditure: data.monthly_expenditure,
          maritalStatus: data.marital_status,
          children: data.children,
          lifestyle: data.lifestyle,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        });
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Failed to save profile");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const savePortfolio = async (holdings: Holding[]) => {
    if (!user || !userProfile?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      // First, upsert the portfolio
      const { data: portfolioData, error: portfolioError } = await supabase
        .from("portfolios")
        .upsert(
          { user_id: userProfile.id, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        )
        .select()
        .single();

      if (portfolioError) throw portfolioError;

      if (portfolioData) {
        // Delete existing holdings
        await supabase
          .from("holdings")
          .delete()
          .eq("portfolio_id", portfolioData.id);

        // Insert new holdings
        const holdingsData = holdings.map((h) => ({
          portfolio_id: portfolioData.id,
          symbol: h.symbol,
          name: h.name,
          quantity: h.quantity,
          buy_price: h.buyPrice,
          sector: h.sector,
        }));

        const { error: holdingsError } = await supabase
          .from("holdings")
          .insert(holdingsData);

        if (holdingsError) throw holdingsError;

        setPortfolio({
          id: portfolioData.id,
          userId: userProfile.id,
          holdings,
          createdAt: portfolioData.created_at,
          updatedAt: portfolioData.updated_at,
        });
      }
    } catch (err) {
      console.error("Error saving portfolio:", err);
      setError("Failed to save portfolio");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    await fetchUserData();
  };

  return (
    <UserContext.Provider
      value={{
        userProfile,
        portfolio,
        healthScore,
        isLoading,
        isOnboarded,
        error,
        setUserProfile,
        setPortfolio,
        setHealthScore,
        saveUserProfile,
        savePortfolio,
        refreshData,
      }}
    >
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
