// API client for communicating with the Python backend
// All business logic, statement parsing, and data intelligence are handled by the Python backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Generic fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `HTTP error ${response.status}`,
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(`API error for ${endpoint}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Types for API responses
export interface PortfolioHealthResponse {
  overall_score: number;
  factors: {
    name: string;
    score: number;
    max_score: number;
    status: "excellent" | "good" | "warning" | "critical";
    description: string;
  }[];
  last_updated: string;
}

export interface HinglishNewsResponse {
  news: {
    id: string;
    title: string;
    hinglish_summary: string;
    related_stock: string;
    sentiment: "positive" | "negative" | "neutral";
    source: string;
    time_ago: string;
    impact: "high" | "medium" | "low";
  }[];
}

export interface RiskSignalsResponse {
  signals: {
    id: string;
    type: "concentration" | "overlap" | "volatility" | "sector" | "liquidity";
    severity: "high" | "medium" | "low";
    title: string;
    description: string;
    affected_stocks: string[];
    recommendation: string;
  }[];
}

export interface OnboardingData {
  userId: string;
  personalInfo: {
    name: string;
    age: string;
    pan: string;
    phone: string;
  };
  financialInfo: {
    address: string;
    income: string;
    expenditure: string;
    maritalStatus: string;
    children: string;
  };
  lifestyle: string;
  stocks?: Array<{ symbol: string; quantity: string }>;
}

export interface PDFParseResponse {
  success: boolean;
  holdings: Array<{
    symbol: string;
    quantity: number;
    name?: string;
  }>;
  source_type: "demat" | "bank" | "broker";
  parsed_date: string;
}

// API endpoints
export const portfolioApi = {
  /**
   * Get portfolio health score and analysis
   */
  async getHealthScore(userId: string): Promise<ApiResponse<PortfolioHealthResponse>> {
    return fetchApi<PortfolioHealthResponse>(`/api/portfolio/health?userId=${userId}`);
  },

  /**
   * Get risk signals and warnings
   */
  async getRiskSignals(userId: string): Promise<ApiResponse<RiskSignalsResponse>> {
    return fetchApi<RiskSignalsResponse>(`/api/portfolio/risks?userId=${userId}`);
  },

  /**
   * Trigger a new portfolio analysis
   */
  async analyzePortfolio(userId: string): Promise<ApiResponse<PortfolioHealthResponse>> {
    return fetchApi<PortfolioHealthResponse>(`/api/portfolio/analyze`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  },
};

export const newsApi = {
  /**
   * Get Hinglish news summaries filtered for user's holdings
   */
  async getHinglishNews(userId: string, limit = 10): Promise<ApiResponse<HinglishNewsResponse>> {
    return fetchApi<HinglishNewsResponse>(`/api/news/hinglish?userId=${userId}&limit=${limit}`);
  },

  /**
   * Get news for a specific stock
   */
  async getStockNews(symbol: string): Promise<ApiResponse<HinglishNewsResponse>> {
    return fetchApi<HinglishNewsResponse>(`/api/news/stock/${symbol}`);
  },
};

export const onboardingApi = {
  /**
   * Submit onboarding data (excluding file upload)
   */
  async submitOnboarding(data: OnboardingData): Promise<ApiResponse<{ userId: string }>> {
    return fetchApi<{ userId: string }>(`/api/onboarding`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Upload and parse a PDF statement
   */
  async uploadPDF(userId: string, file: File): Promise<ApiResponse<PDFParseResponse>> {
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/onboarding/upload-pdf`, {
        method: "POST",
        body: formData,
        // Don't set Content-Type header - browser will set it with boundary for FormData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || `HTTP error ${response.status}`,
        };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("PDF upload error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },
};

export const adviceApi = {
  /**
   * Get AI-generated advice (uses LangGraph pipeline from Python backend)
   */
  async getAdvice(userId: string): Promise<ApiResponse<{ advice: string; type: "advice" | "strategy" }>> {
    return fetchApi<{ advice: string; type: "advice" | "strategy" }>(`/api/advice?userId=${userId}`);
  },

  /**
   * Get strategy recommendations
   */
  async getStrategy(userId: string): Promise<ApiResponse<{ strategy: string; recommendations: string[] }>> {
    return fetchApi<{ strategy: string; recommendations: string[] }>(`/api/strategy?userId=${userId}`);
  },
};

export const marketApi = {
  /**
   * Get macro economic indicators
   */
  async getMacroData(): Promise<ApiResponse<Record<string, unknown>>> {
    return fetchApi<Record<string, unknown>>(`/api/market/macro`);
  },

  /**
   * Get market trends
   */
  async getTrends(): Promise<ApiResponse<Record<string, unknown>>> {
    return fetchApi<Record<string, unknown>>(`/api/market/trends`);
  },
};
