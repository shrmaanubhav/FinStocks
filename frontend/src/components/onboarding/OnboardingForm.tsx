"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import StockSearch from "./StockSearch";

interface Holding {
  symbol: string;
  name?: string;
  quantity: number;
  source: "manual" | "pdf_upload";
}

interface OnboardingData {
  // Slide 1: Personal Information
  name: string;
  age: string;
  phone: string;
  address: string;
  
  // Slide 2: Financial Information
  incomeRange: string;
  expenditureRange: string;
  maritalStatus: string;
  children: string;
  
  // Slide 3: Investor Profile
  jobType: string;
  job: string;
  monthlyIncome: string;
  sideIncome: string;
  investmentGoal: string;
  investmentDuration: string;
  riskPreference: string;
  investingYears: string;
  retirementAge: string;
  stocks: string[];

  // Slide 4: Investment Information
  holdings: Holding[];
  lifestyle: string;
}

interface OnboardingFormProps {
  userId: string;
  userEmail: string;
  onComplete: () => void;
}

const incomeRanges = [
  { value: "0-3L", label: "₹0 - ₹3 Lakhs" },
  { value: "3L-6L", label: "₹3 - ₹6 Lakhs" },
  { value: "6L-10L", label: "₹6 - ₹10 Lakhs" },
  { value: "10L-20L", label: "₹10 - ₹20 Lakhs" },
  { value: "20L-50L", label: "₹20 - ₹50 Lakhs" },
  { value: "50L+", label: "₹50 Lakhs+" },
];

const expenditureRanges = [
  { value: "0-2L", label: "₹0 - ₹2 Lakhs" },
  { value: "2L-4L", label: "₹2 - ₹4 Lakhs" },
  { value: "4L-8L", label: "₹4 - ₹8 Lakhs" },
  { value: "8L-15L", label: "₹8 - ₹15 Lakhs" },
  { value: "15L-30L", label: "₹15 - ₹30 Lakhs" },
  { value: "30L+", label: "₹30 Lakhs+" },
];

const maritalStatuses = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
];

const jobTypes = [
  { value: "private", label: "Private" },
  { value: "government", label: "Government" },
  { value: "semi private", label: "Semi Private" },
  { value: "non profit", label: "Non Profit" },
  { value: "business", label: "Business" },
];

export default function OnboardingForm({ userId, userEmail, onComplete }: OnboardingFormProps) {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [stocksInput, setStocksInput] = useState("");
  
  const [formData, setFormData] = useState<OnboardingData>({
    name: "",
    age: "",
    phone: "",
    address: "",
    incomeRange: "",
    expenditureRange: "",
    maritalStatus: "",
    children: "0",
    jobType: "",
    job: "",
    monthlyIncome: "",
    sideIncome: "",
    investmentGoal: "",
    investmentDuration: "",
    riskPreference: "",
    investingYears: "",
    retirementAge: "",
    stocks: [],
    holdings: [],
    lifestyle: "",
  });

  const [newHolding, setNewHolding] = useState({ symbol: "", name: "", quantity: "" });

  const updateFormData = <K extends keyof OnboardingData>(
    field: K,
    value: OnboardingData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addHolding = () => {
    if (newHolding.symbol && newHolding.quantity) {
      const holding: Holding = {
        symbol: newHolding.symbol.toUpperCase(),
        name: newHolding.name,
        quantity: parseInt(newHolding.quantity),
        source: "manual",
      };
      updateFormData("holdings", [...formData.holdings, holding]);
      setNewHolding({ symbol: "", name: "", quantity: "" });
    }
  };

  const handleStockSelect = (stock: { symbol: string; name: string }) => {
    setNewHolding({ ...newHolding, symbol: stock.symbol, name: stock.name });
  };

  const removeHolding = (index: number) => {
    const updated = formData.holdings.filter((_, i) => i !== index);
    updateFormData("holdings", updated);
  };

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file only.');
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File size must be less than 10MB.');
        return;
      }

      try {
        // Get user ID from localStorage
        const userId = localStorage.getItem('user_id');
        if (!userId) {
          alert('Please log in first.');
          return;
        }

        // Import the API function dynamically
        const { onboardingApi } = await import('@/lib/api');

        const response = await onboardingApi.uploadPDF(userId, file);
        if (response.success) {
          alert('PDF uploaded successfully! Holdings will be extracted and added to your portfolio.');
          // Optionally refresh the page or update the holdings
          window.location.reload();
        } else {
          alert('Failed to upload PDF. Please try again.');
        }
      } catch (error) {
        console.error('PDF upload error:', error);
        alert('Failed to upload PDF. Please try again.');
      }
    }
  }, []);

  const validateSlide = (slide: number): boolean => {
    switch (slide) {
      case 1:
        return !!(formData.name && formData.age && formData.phone && formData.address);
      case 2:
        return !!(formData.incomeRange && formData.expenditureRange && formData.maritalStatus);
      case 3:
        return true; // Investor profile is optional
      case 4:
        return true; // Holdings and lifestyle are optional
      default:
        return false;
    }
  };

  const nextSlide = () => {
    if (validateSlide(currentSlide)) {
      setCurrentSlide((prev) => Math.min(prev + 1, 4));
      setError("");
    } else {
      setError("Please fill in all required fields");
    }
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 1));
    setError("");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const parsedStocks = stocksInput
        .split(/[\s,]+/g)
        .map((stock) => stock.trim().toUpperCase())
        .filter(Boolean);

      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          ...formData,
          age: parseInt(formData.age),
          children: parseInt(formData.children),
          monthlyIncome: formData.monthlyIncome ? parseFloat(formData.monthlyIncome) : null,
          sideIncome: formData.sideIncome ? parseFloat(formData.sideIncome) : null,
          riskPreference: formData.riskPreference ? parseFloat(formData.riskPreference) : null,
          investingYears: formData.investingYears ? parseInt(formData.investingYears) : null,
          retirementAge: formData.retirementAge ? parseInt(formData.retirementAge) : null,
          stocks: parsedStocks,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save onboarding data");
      }

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Step {currentSlide} of 4</span>
            <span className="text-sm text-gray-400">{userEmail}</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-brand-500 to-purple-600"
              initial={{ width: "0%" }}
              animate={{ width: `${(currentSlide / 4) * 100}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {["Personal Info", "Financial Info", "Investor Profile", "Investments"].map((label, index) => (
              <span
                key={label}
                className={`text-xs ${
                  currentSlide > index ? "text-brand-400" : currentSlide === index + 1 ? "text-white" : "text-gray-600"
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 backdrop-blur-xl rounded-3xl p-8 overflow-hidden">
          {/* Glow Effect */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-500/20 rounded-full blur-[80px]" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-[80px]" />

          <AnimatePresence mode="wait" custom={currentSlide}>
            <motion.div
              key={currentSlide}
              custom={currentSlide}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="relative z-10"
            >
              {/* Slide 1: Personal Information */}
              {currentSlide === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Personal Information</h2>
                    <p className="text-gray-400">Let&apos;s get to know you better</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => updateFormData("name", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                        placeholder="Rahul Sharma"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Age <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        min="18"
                        max="120"
                        value={formData.age}
                        onChange={(e) => updateFormData("age", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                        placeholder="28"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateFormData("phone", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Address <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => updateFormData("address", e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-none"
                        placeholder="123, Sector 15, Gurgaon, Haryana - 122001"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Slide 2: Financial Information */}
              {currentSlide === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Financial Information</h2>
                    <p className="text-gray-400">Help us understand your financial profile</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Annual Income <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={formData.incomeRange}
                        onChange={(e) => updateFormData("incomeRange", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                      >
                        <option value="" className="bg-gray-900">Select income range</option>
                        {incomeRanges.map((range) => (
                          <option key={range.value} value={range.value} className="bg-gray-900">
                            {range.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Annual Expenditure <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={formData.expenditureRange}
                        onChange={(e) => updateFormData("expenditureRange", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                      >
                        <option value="" className="bg-gray-900">Select expenditure range</option>
                        {expenditureRanges.map((range) => (
                          <option key={range.value} value={range.value} className="bg-gray-900">
                            {range.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Marital Status <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={formData.maritalStatus}
                        onChange={(e) => updateFormData("maritalStatus", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                      >
                        <option value="" className="bg-gray-900">Select status</option>
                        {maritalStatuses.map((status) => (
                          <option key={status.value} value={status.value} className="bg-gray-900">
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Number of Children
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={formData.children}
                        onChange={(e) => updateFormData("children", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Slide 3: Investor Profile */}
              {currentSlide === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Investor Profile</h2>
                    <p className="text-gray-400">Share your work and investment preferences</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Job Type
                      </label>
                      <select
                        value={formData.jobType}
                        onChange={(e) => updateFormData("jobType", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                      >
                        <option value="" className="bg-gray-900">Select job type</option>
                        {jobTypes.map((type) => (
                          <option key={type.value} value={type.value} className="bg-gray-900">
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={formData.job}
                        onChange={(e) => updateFormData("job", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                        placeholder="Corporate Job"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Monthly Income 
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.monthlyIncome}
                        onChange={(e) => updateFormData("monthlyIncome", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                        placeholder="60000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Side Income 
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.sideIncome}
                        onChange={(e) => updateFormData("sideIncome", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                        placeholder="0"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Investment Goal
                      </label>
                      <input
                        type="text"
                        value={formData.investmentGoal}
                        onChange={(e) => updateFormData("investmentGoal", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                        placeholder="Wealth building"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Investment Duration
                      </label>
                      <input
                        type="text"
                        value={formData.investmentDuration}
                        onChange={(e) => updateFormData("investmentDuration", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                        placeholder="10 years"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Risk Preference (0-1)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={formData.riskPreference}
                        onChange={(e) => updateFormData("riskPreference", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                        placeholder="0.5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Investing Years
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.investingYears}
                        onChange={(e) => updateFormData("investingYears", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Planned Retirement Age
                      </label>
                      <input
                        type="number"
                        min="18"
                        max="120"
                        value={formData.retirementAge}
                        onChange={(e) => updateFormData("retirementAge", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                        placeholder="55"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Interested Stocks (symbols)
                      </label>
                      <input
                        type="text"
                        value={stocksInput}
                        onChange={(e) => {
                          const value = e.target.value;
                          setStocksInput(value);
                          const parsed = value
                            .split(/[\s,]+/g)
                            .map((stock) => stock.trim().toUpperCase())
                            .filter(Boolean);
                          updateFormData("stocks", parsed);
                        }}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                        placeholder="AAPL, MSFT, TSLA"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Separate symbols with commas or spaces.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Slide 4: Investment Information */}
              {currentSlide === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Your Investments</h2>
                    <p className="text-gray-400">Add your stock holdings for personalized insights</p>
                  </div>

                  {/* NASDAQ Stock Search */}
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add NASDAQ Stocks
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Search and select stocks listed on NASDAQ exchange
                    </p>
                    
                    <div className="flex gap-3 mb-4">
                      {newHolding.symbol ? (
                        <div className="flex-1 px-4 py-3 rounded-xl bg-brand-500/10 border border-brand-500/30 text-white flex items-center justify-between">
                          <div>
                            <span className="font-semibold">{newHolding.symbol}</span>
                            <span className="text-gray-400 ml-2 text-sm">{newHolding.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setNewHolding({ symbol: "", name: "", quantity: newHolding.quantity })}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <StockSearch
                          onSelect={handleStockSelect}
                          placeholder="Search NASDAQ stocks (e.g., AAPL, MSFT)"
                        />
                      )}
                      <input
                        type="number"
                        min="1"
                        value={newHolding.quantity}
                        onChange={(e) => setNewHolding({ ...newHolding, quantity: e.target.value })}
                        className="w-32 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                        placeholder="Qty"
                      />
                      <button
                        type="button"
                        onClick={addHolding}
                        disabled={!newHolding.symbol || !newHolding.quantity}
                        className="px-4 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add
                      </button>
                    </div>

                    {/* Holdings List */}
                    {formData.holdings.length > 0 && (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {formData.holdings.map((holding, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/5 border border-white/5"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-brand-500/20 flex items-center justify-center">
                                <span className="text-brand-400 font-bold text-sm">
                                  {holding.symbol.slice(0, 2)}
                                </span>
                              </div>
                              <div>
                                <span className="font-semibold text-white">{holding.symbol}</span>
                                {holding.name && (
                                  <span className="block text-xs text-gray-400">{holding.name}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-gray-300 font-medium">{holding.quantity} shares</span>
                              <button
                                type="button"
                                onClick={() => removeHolding(index)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* PDF Upload */}
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Or Upload PDF Statement
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Upload your PDF statement from your broker (Zerodha, Groww, etc.) and we&apos;ll extract your holdings automatically.
                    </p>
                    <label className="block">
                      <div className="flex items-center justify-center px-6 py-8 rounded-xl border-2 border-dashed border-white/20 hover:border-brand-500/50 cursor-pointer transition-all">
                        <div className="text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="mt-2 text-sm text-gray-400">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-500">PDF files up to 10MB</p>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Lifestyle Textbox */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tell us about your lifestyle & investment goals
                    </label>
                    <textarea
                      value={formData.lifestyle}
                      onChange={(e) => updateFormData("lifestyle", e.target.value)}
                      rows={4}
                      maxLength={1000}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-none"
                      placeholder="E.g., I'm a salaried professional looking to build a long-term portfolio. I prefer blue-chip stocks and have moderate risk tolerance..."
                    />
                    <p className="text-xs text-gray-500 mt-1 text-right">{formData.lifestyle.length}/1000</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={prevSlide}
              disabled={currentSlide === 1}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                currentSlide === 1
                  ? "opacity-50 cursor-not-allowed text-gray-500"
                  : "text-white hover:bg-white/10"
              }`}
            >
              ← Back
            </button>

            {currentSlide < 4 ? (
              <button
                type="button"
                onClick={nextSlide}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-brand-500/25 transition-all"
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
