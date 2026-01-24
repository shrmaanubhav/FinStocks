import type { Metadata } from "next";
import StockHoldings from "@/components/dashboard/StockHoldings";
import PortfolioDoctor from "@/components/dashboard/PortfolioDoctor";
import HinglishNewsFeed from "@/components/dashboard/HinglishNewsFeed";
import PortfolioOverview from "@/components/dashboard/PortfolioOverview";
import RiskSignals from "@/components/dashboard/RiskSignals";
import SafetyDisclaimer from "@/components/dashboard/SafetyDisclaimer";
import WelcomeHeader from "@/components/dashboard/WelcomeHeader";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard | FinStocks - AI-Powered Portfolio Intelligence",
  description: "Your portfolio's medical report with AI-driven insights",
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Header with User Name */}
      {/* <WelcomeHeader /> */}
      
      {/* Stock Holdings - First thing shown */}
      <StockHoldings />
      
      {/* Safety Disclaimer */}
      
      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Portfolio Health Score */}

        {/* Hinglish News Feed */}
        <div className="col-span-12 xl:col-span-5">
          <Link href="/dashboard/news">
          <HinglishNewsFeed />
          </Link>
        </div>
      </div>
      <SafetyDisclaimer />
    </div>
  );
}
