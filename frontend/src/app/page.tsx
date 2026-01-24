"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import LoadingScreen from "./loading-screen";

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isRevealed, setIsRevealed] = useState(false);
  const [navRevealed, setNavRevealed] = useState(false);
  const [heroRevealed, setHeroRevealed] = useState(false);
  const [featuresRevealed, setFeaturesRevealed] = useState(false);
  const [footerRevealed, setFooterRevealed] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Staggered reveal animations
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRevealed(true);
      // Start navigation animation immediately
      setTimeout(() => setNavRevealed(true), 200);
      // Hero section after navigation
      setTimeout(() => setHeroRevealed(true), 600);
      // Features after hero
      setTimeout(() => setFeaturesRevealed(true), 1000);
      // Footer last
      setTimeout(() => setFooterRevealed(true), 1400);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <LoadingScreen />
      <div className={`min-h-screen bg-gray-950 text-white overflow-hidden relative transition-all duration-1000 ease-out ${
        isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
      {/* Animated gradient background */}
      <div 
        className="fixed inset-0 opacity-30"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(70, 95, 255, 0.15), transparent 40%)`,
        }}
      />
      
      {/* Grid pattern overlay */}
      <div 
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Floating orbs */}
      <div className="fixed top-20 left-20 w-72 h-72 bg-brand-500/20 rounded-full blur-[100px] animate-pulse" />
      <div className="fixed bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="fixed top-1/2 left-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Navigation */}
      <nav className={`relative z-10 border-b border-white/5 transition-all duration-700 ease-out ${
        navRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl  border border-2 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                FinStocks
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-xl border border-[2px]  text-white font-medium transition-all duration-300 hover:shadow-sm hover:shadow-brand-500/25"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className={`relative z-10 transition-all duration-700 ease-out ${
        heroRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-gray-300">AI-Powered Financial Intelligence for India</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Your Portfolio&apos;s
              </span>
              <br />
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Medical Report
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Get a complete health check of your investments with AI-driven insights, 
              <span className="text-blue-400">News updates</span>, and 
              personalized portfolio analysis for Indian retail investors.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                href="/signup"
                className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-500/20 to-purple-600/20 border-[0.2px] border-white/15 text-white  text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-brand-500/30 hover:scale-105 flex items-center gap-3"
              >
                Get Started
                <svg 
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/signin"
                className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm font-semibold text-lg transition-all duration-300"
              >
                Sign In
              </Link>
            </div>
      
          </div>

          {/* Feature Cards */}
          

          {/* Trust Banner */}
          <div className="mt-32 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>
                <strong>Important:</strong> FinStocks provides intelligence and summaries only. We do not offer personalized buy/sell investment advice.
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`relative z-10 border-t border-white/5 transition-all duration-700 ease-out ${
        footerRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-sm text-gray-500">© 2026 FinStocks. For Indian retail investors.</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="hover:text-white transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}