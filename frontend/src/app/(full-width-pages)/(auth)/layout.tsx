import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";

import { ThemeProvider } from "@/context/ThemeContext";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col  dark:bg-gray-900 sm:p-0">
          {children}
          <div className="lg:w-1/2 w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 lg:grid items-center hidden relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>
            
            <div className="relative items-center justify-center flex z-1">
              {/* <!-- ===== Common Grid Shape Start ===== --> */}
              <GridShape />
              <div className="flex flex-col items-center max-w-md px-8">
                <Link href="/" className="flex items-center gap-3 mb-6">
                  <svg
                    width="56"
                    height="56"
                    viewBox="0 0 56 56"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="shrink-0"
                  >
                    <rect width="56" height="56" rx="12" fill="url(#finStocksGradientAuth)" />
                    <path
                      d="M16 40V16H32V22H22V26H30V32H22V40H16Z"
                      fill="white"
                    />
                    <circle cx="36" cy="34" r="6" stroke="white" strokeWidth="2.5" fill="none" />
                    <path d="M36 28V34H42" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="finStocksGradientAuth" x1="0" y1="0" x2="56" y2="56">
                        <stop stopColor="#22c55e" />
                        <stop offset="1" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="text-3xl font-bold text-white">
                    Fin<span className="text-brand-400">Stocks</span>
                  </span>
                </Link>
              </div>
            </div>
          </div>
          <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
