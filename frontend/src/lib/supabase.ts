import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export interface UserProfile {
  id: string;
  clerk_user_id: string;
  name: string;
  age: number | null;
  pan: string | null;
  phone: string | null;
  address: string | null;
  income_range: string | null;
  expenditure_range: string | null;
  marital_status: string | null;
  children: number | null;
  lifestyle: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserHolding {
  id: string;
  user_id: string;
  symbol: string;
  quantity: number;
  avg_price: number | null;
  source: "manual" | "pdf_upload";
  created_at: string;
  updated_at: string;
}

export interface PortfolioAnalysis {
  id: string;
  user_id: string;
  overall_score: number;
  diversification_score: number;
  volatility_score: number;
  overlap_score: number;
  cash_exposure_score: number;
  analysis_data: Record<string, unknown>;
  created_at: string;
}

// Helper functions for database operations
export const userProfileApi = {
  async getByClerkId(clerkUserId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("clerk_user_id", clerkUserId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
    return data;
  },

  async upsert(profile: Partial<UserProfile> & { clerk_user_id: string }): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from("user_profiles")
      .upsert(profile, { onConflict: "clerk_user_id" })
      .select()
      .single();

    if (error) {
      console.error("Error upserting user profile:", error);
      return null;
    }
    return data;
  },

  async updateOnboardingStatus(clerkUserId: string, completed: boolean): Promise<boolean> {
    const { error } = await supabase
      .from("user_profiles")
      .update({ onboarding_completed: completed, updated_at: new Date().toISOString() })
      .eq("clerk_user_id", clerkUserId);

    if (error) {
      console.error("Error updating onboarding status:", error);
      return false;
    }
    return true;
  },
};

export const holdingsApi = {
  async getByUserId(userId: string): Promise<UserHolding[]> {
    const { data, error } = await supabase
      .from("user_holdings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching holdings:", error);
      return [];
    }
    return data || [];
  },

  async addHoldings(userId: string, holdings: Array<{ symbol: string; quantity: number; source: "manual" | "pdf_upload" }>): Promise<boolean> {
    const holdingsWithUserId = holdings.map(h => ({
      ...h,
      user_id: userId,
    }));

    const { error } = await supabase
      .from("user_holdings")
      .insert(holdingsWithUserId);

    if (error) {
      console.error("Error adding holdings:", error);
      return false;
    }
    return true;
  },

  async clearAndReplaceHoldings(userId: string, holdings: Array<{ symbol: string; quantity: number; source: "manual" | "pdf_upload" }>): Promise<boolean> {
    // First delete existing holdings
    const { error: deleteError } = await supabase
      .from("user_holdings")
      .delete()
      .eq("user_id", userId);

    if (deleteError) {
      console.error("Error clearing holdings:", deleteError);
      return false;
    }

    // Then add new holdings
    if (holdings.length > 0) {
      return this.addHoldings(userId, holdings);
    }
    return true;
  },
};

export const analysisApi = {
  async getLatest(userId: string): Promise<PortfolioAnalysis | null> {
    const { data, error } = await supabase
      .from("portfolio_analyses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching analysis:", error);
      return null;
    }
    return data;
  },

  async save(analysis: Omit<PortfolioAnalysis, "id" | "created_at">): Promise<PortfolioAnalysis | null> {
    const { data, error } = await supabase
      .from("portfolio_analyses")
      .insert(analysis)
      .select()
      .single();

    if (error) {
      console.error("Error saving analysis:", error);
      return null;
    }
    return data;
  },
};
