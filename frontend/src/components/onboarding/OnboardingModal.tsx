"use client";
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useUser } from "@clerk/nextjs";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface PersonalInfo {
  name: string;
  age: string;
  pan: string;
  phone: string;
}

interface FinancialInfo {
  address: string;
  income: string;
  expenditure: string;
  maritalStatus: string;
  children: string;
}

interface StockHolding {
  symbol: string;
  quantity: string;
}

interface PortfolioInfo {
  stocks: StockHolding[];
  uploadedFile: File | null;
  lifestyle: string;
}

export default function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: user?.fullName || "",
    age: "",
    pan: "",
    phone: "",
  });

  const [financialInfo, setFinancialInfo] = useState<FinancialInfo>({
    address: "",
    income: "",
    expenditure: "",
    maritalStatus: "",
    children: "0",
  });

  const [portfolioInfo, setPortfolioInfo] = useState<PortfolioInfo>({
    stocks: [{ symbol: "", quantity: "" }],
    uploadedFile: null,
    lifestyle: "",
  });

  const [inputMode, setInputMode] = useState<"manual" | "upload">("manual");

  // File upload handling
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setPortfolioInfo(prev => ({ ...prev, uploadedFile: acceptedFiles[0] }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  // Add/remove stocks
  const addStock = () => {
    setPortfolioInfo(prev => ({
      ...prev,
      stocks: [...prev.stocks, { symbol: "", quantity: "" }],
    }));
  };

  const removeStock = (index: number) => {
    setPortfolioInfo(prev => ({
      ...prev,
      stocks: prev.stocks.filter((_, i) => i !== index),
    }));
  };

  const updateStock = (index: number, field: "symbol" | "quantity", value: string) => {
    setPortfolioInfo(prev => ({
      ...prev,
      stocks: prev.stocks.map((stock, i) => 
        i === index ? { ...stock, [field]: value } : stock
      ),
    }));
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare data for API
      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("personalInfo", JSON.stringify(personalInfo));
      formData.append("financialInfo", JSON.stringify(financialInfo));
      formData.append("lifestyle", portfolioInfo.lifestyle);
      
      if (inputMode === "manual") {
        formData.append("stocks", JSON.stringify(portfolioInfo.stocks.filter(s => s.symbol && s.quantity)));
      } else if (portfolioInfo.uploadedFile) {
        formData.append("portfolioFile", portfolioInfo.uploadedFile);
      }

      // Send to Python backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/onboarding`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to save onboarding data");
      }

      // Mark as onboarded
      localStorage.setItem(`finstock_onboarded_${user.id}`, "true");
      onComplete();
    } catch (error) {
      console.error("Onboarding error:", error);
      // For now, proceed anyway (demo mode)
      localStorage.setItem(`finstock_onboarded_${user.id}`, "true");
      onComplete();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const steps = [
    { number: 1, title: "Personal Details" },
    { number: 2, title: "Financial Profile" },
    { number: 3, title: "Portfolio & Lifestyle" },
  ];

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-950/80 backdrop-blur-xl"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-gray-900 to-gray-950 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/20 rounded-full blur-[100px] -translate-y-1/2" />
        
        {/* Progress bar */}
        <div className="relative px-8 pt-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                      currentStep >= step.number 
                        ? "bg-brand-500 text-white shadow-lg shadow-brand-500/30" 
                        : "bg-white/5 text-gray-500 border border-white/10"
                    }`}
                  >
                    {currentStep > step.number ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>
                  <span className={`text-sm font-medium hidden sm:block ${currentStep >= step.number ? "text-white" : "text-gray-500"}`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 rounded-full transition-all duration-300 ${
                    currentStep > step.number ? "bg-brand-500" : "bg-white/10"
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="text-center mb-6">
            <span className="text-sm text-gray-400">Step {currentStep} of 3</span>
          </div>
        </div>

        {/* Content */}
        <div className="relative px-8 pb-8 max-h-[60vh] overflow-y-auto">
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Let&apos;s get to know you</h2>
                <p className="text-gray-400">This helps us personalize your portfolio analysis</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={personalInfo.name}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
                  <input
                    type="number"
                    value={personalInfo.age}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, age: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    placeholder="Your age"
                    min="18"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">PAN Number</label>
                  <input
                    type="text"
                    value={personalInfo.pan}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, pan: e.target.value.toUpperCase() }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all uppercase"
                    placeholder="ABCDE1234F"
                    maxLength={10}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Financial Info */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Financial Profile</h2>
                <p className="text-gray-400">Help us understand your financial situation</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                  <textarea
                    value={financialInfo.address}
                    onChange={(e) => setFinancialInfo(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all resize-none"
                    placeholder="Enter your address"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Annual Income (₹)</label>
                    <select
                      value={financialInfo.income}
                      onChange={(e) => setFinancialInfo(prev => ({ ...prev, income: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    >
                      <option value="" className="bg-gray-900">Select range</option>
                      <option value="0-5L" className="bg-gray-900">Below ₹5 Lakhs</option>
                      <option value="5-10L" className="bg-gray-900">₹5 - 10 Lakhs</option>
                      <option value="10-25L" className="bg-gray-900">₹10 - 25 Lakhs</option>
                      <option value="25-50L" className="bg-gray-900">₹25 - 50 Lakhs</option>
                      <option value="50L+" className="bg-gray-900">Above ₹50 Lakhs</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Monthly Expenditure (₹)</label>
                    <select
                      value={financialInfo.expenditure}
                      onChange={(e) => setFinancialInfo(prev => ({ ...prev, expenditure: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    >
                      <option value="" className="bg-gray-900">Select range</option>
                      <option value="0-25K" className="bg-gray-900">Below ₹25,000</option>
                      <option value="25-50K" className="bg-gray-900">₹25,000 - 50,000</option>
                      <option value="50-1L" className="bg-gray-900">₹50,000 - 1 Lakh</option>
                      <option value="1L+" className="bg-gray-900">Above ₹1 Lakh</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Marital Status</label>
                    <select
                      value={financialInfo.maritalStatus}
                      onChange={(e) => setFinancialInfo(prev => ({ ...prev, maritalStatus: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    >
                      <option value="" className="bg-gray-900">Select status</option>
                      <option value="single" className="bg-gray-900">Single</option>
                      <option value="married" className="bg-gray-900">Married</option>
                      <option value="divorced" className="bg-gray-900">Divorced</option>
                      <option value="widowed" className="bg-gray-900">Widowed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Number of Children</label>
                    <input
                      type="number"
                      value={financialInfo.children}
                      onChange={(e) => setFinancialInfo(prev => ({ ...prev, children: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                      min="0"
                      max="10"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Portfolio & Lifestyle */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Your Portfolio</h2>
                <p className="text-gray-400">Add your holdings or upload your statement</p>
              </div>

              {/* Toggle between manual and upload */}
              <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
                <button
                  onClick={() => setInputMode("manual")}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    inputMode === "manual" 
                      ? "bg-brand-500 text-white shadow-lg" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Manual Entry
                </button>
                <button
                  onClick={() => setInputMode("upload")}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    inputMode === "upload" 
                      ? "bg-brand-500 text-white shadow-lg" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Upload PDF
                </button>
              </div>

              {inputMode === "manual" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">Stock Holdings</label>
                    <button
                      onClick={addStock}
                      className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Stock
                    </button>
                  </div>
                  
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {portfolioInfo.stocks.map((stock, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        <input
                          type="text"
                          value={stock.symbol}
                          onChange={(e) => updateStock(index, "symbol", e.target.value.toUpperCase())}
                          className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-all uppercase"
                          placeholder="Symbol (e.g., RELIANCE)"
                        />
                        <input
                          type="number"
                          value={stock.quantity}
                          onChange={(e) => updateStock(index, "quantity", e.target.value)}
                          className="w-24 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-all"
                          placeholder="Qty"
                          min="1"
                        />
                        {portfolioInfo.stocks.length > 1 && (
                          <button
                            onClick={() => removeStock(index)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div 
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                    isDragActive 
                      ? "border-brand-500 bg-brand-500/10" 
                      : portfolioInfo.uploadedFile 
                        ? "border-emerald-500 bg-emerald-500/10" 
                        : "border-white/20 hover:border-white/40"
                  }`}
                >
                  <input {...getInputProps()} />
                  {portfolioInfo.uploadedFile ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-medium">{portfolioInfo.uploadedFile.name}</p>
                        <p className="text-sm text-gray-400">{(portfolioInfo.uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setPortfolioInfo(prev => ({ ...prev, uploadedFile: null }));
                        }}
                        className="text-sm text-red-400 hover:text-red-300"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-medium">Drop your PDF here</p>
                        <p className="text-sm text-gray-400">Bank or Demat statement (PDF only)</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Lifestyle Context */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Describe Your Lifestyle
                  <span className="text-gray-500 font-normal ml-2">(helps us personalize advice)</span>
                </label>
                <textarea
                  value={portfolioInfo.lifestyle}
                  onChange={(e) => setPortfolioInfo(prev => ({ ...prev, lifestyle: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all resize-none"
                  placeholder="E.g., I'm a 30-year-old IT professional, planning to buy a house in 5 years, currently saving for my child's education..."
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="relative px-8 py-6 border-t border-white/10 flex items-center justify-between bg-gray-950/50">
          <button
            onClick={currentStep === 1 ? onClose : () => setCurrentStep(prev => prev - 1)}
            className="px-6 py-2.5 text-gray-400 hover:text-white transition-colors"
          >
            {currentStep === 1 ? "Cancel" : "Back"}
          </button>
          
          <button
            onClick={currentStep === 3 ? handleSubmit : () => setCurrentStep(prev => prev + 1)}
            disabled={isSubmitting}
            className="px-8 py-3 bg-gradient-to-r from-brand-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-brand-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </>
            ) : currentStep === 3 ? (
              "Complete Setup"
            ) : (
              <>
                Continue
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
