"use client";
import React, { useEffect, useState } from "react";

interface HealthFactor {
  name: string;
  score: number;
  maxScore: number;
  status: "excellent" | "good" | "warning" | "critical";
  description: string;
}

interface PortfolioHealth {
  overallScore: number;
  factors: HealthFactor[];
  lastUpdated: string;
}

// Mock data - in production, this comes from the Python backend
const mockHealthData: PortfolioHealth = {
  overallScore: 72,
  factors: [
    {
      name: "Diversification",
      score: 18,
      maxScore: 25,
      status: "good",
      description: "Your portfolio spans 6 sectors. Consider adding more exposure to healthcare and consumer goods.",
    },
    {
      name: "Volatility",
      score: 15,
      maxScore: 25,
      status: "warning",
      description: "High exposure to volatile mid-caps. 35% of holdings show beta > 1.5",
    },
    {
      name: "Overlap",
      score: 22,
      maxScore: 25,
      status: "excellent",
      description: "Minimal duplicate holdings across your mutual funds and direct equity.",
    },
    {
      name: "Cash Exposure",
      score: 17,
      maxScore: 25,
      status: "good",
      description: "12% cash allocation. Slightly high for current market conditions.",
    },
  ],
  lastUpdated: "2 hours ago",
};

export default function PortfolioDoctor() {
  const [healthData, setHealthData] = useState<PortfolioHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Simulate API call
    const fetchHealthData = async () => {
      try {
        // In production, call Python backend:
        // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/portfolio/health`);
        // const data = await response.json();
        
        // For now, use mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        setHealthData(mockHealthData);
      } catch (error) {
        console.error("Failed to fetch health data:", error);
        setHealthData(mockHealthData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHealthData();
  }, []);

  // Animate score on load
  useEffect(() => {
    if (healthData) {
      const duration = 1500;
      const steps = 60;
      const increment = healthData.overallScore / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= healthData.overallScore) {
          setAnimatedScore(healthData.overallScore);
          clearInterval(timer);
        } else {
          setAnimatedScore(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [healthData]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return "from-emerald-500 to-emerald-400";
    if (score >= 60) return "from-yellow-500 to-yellow-400";
    if (score >= 40) return "from-orange-500 to-orange-400";
    return "from-red-500 to-red-400";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "good": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "warning": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "critical": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
          <div className="flex items-center justify-center py-12">
            <div className="w-48 h-48 rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="space-y-4 mt-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!healthData) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Portfolio Doctor</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your portfolio&apos;s health checkup</p>
            </div>
          </div>
          <span className="text-xs text-gray-400">Updated {healthData.lastUpdated}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Health Score Circle */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            {/* Background circle */}
            <svg className="w-48 h-48 transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-gray-100 dark:text-gray-800"
              />
              {/* Progress circle */}
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="url(#scoreGradient)"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 88}
                strokeDashoffset={2 * Math.PI * 88 * (1 - animatedScore / 100)}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" className={`${healthData.overallScore >= 60 ? 'stop-color-emerald' : 'stop-color-orange'}`} style={{ stopColor: healthData.overallScore >= 60 ? '#10b981' : '#f59e0b' }} />
                  <stop offset="100%" className={`${healthData.overallScore >= 60 ? 'stop-color-teal' : 'stop-color-red'}`} style={{ stopColor: healthData.overallScore >= 60 ? '#14b8a6' : '#ef4444' }} />
                </linearGradient>
              </defs>
            </svg>
            {/* Score text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-5xl font-bold ${getScoreColor(animatedScore)}`}>
                {animatedScore}
              </span>
              <span className="text-gray-400 text-sm mt-1">out of 100</span>
            </div>
          </div>
          
          {/* Score label */}
          <div className={`mt-4 px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r ${getScoreGradient(healthData.overallScore)} text-white`}>
            {healthData.overallScore >= 80 ? "Excellent Health" : 
             healthData.overallScore >= 60 ? "Good Health" : 
             healthData.overallScore >= 40 ? "Needs Attention" : "Critical"}
          </div>
        </div>

        {/* Health Factors */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Health Factors</h3>
          
          {healthData.factors.map((factor, index) => (
            <div 
              key={index}
              className="group p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900 dark:text-white">{factor.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(factor.status)}`}>
                    {factor.status.charAt(0).toUpperCase() + factor.status.slice(1)}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {factor.score}/{factor.maxScore}
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    factor.status === "excellent" ? "bg-emerald-500" :
                    factor.status === "good" ? "bg-blue-500" :
                    factor.status === "warning" ? "bg-yellow-500" :
                    "bg-red-500"
                  }`}
                  style={{ width: `${(factor.score / factor.maxScore) * 100}%` }}
                />
              </div>
              
              {/* Description */}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {factor.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
