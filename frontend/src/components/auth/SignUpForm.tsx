"use client";

import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState, useCallback } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";

// Multi-step signup with complete onboarding
type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface FormData {
  // Step 1 - Auth
  email: string;
  password: string;
  confirmPassword: string;
  // Step 2 - Personal
  firstName: string;
  lastName: string;
  age: number;
  phone: string;
  // Step 3 - Location
  city: string;
  state: string;
  // Step 4 - Financial
  annualIncome: string;
  monthlyExpenditure: string;
  maritalStatus: string;
  children: number;
  // Step 5 - Other Investments
  otherInvestments: string;
  // Step 6 - Portfolio & Lifestyle
  portfolioMethod: "manual" | "pdf";
  stocks: Array<{ symbol: string; quantity: number; buyPrice: number }>;
  pdfFile: File | null;
  lifestyle: string;
}

export default function SignUpForm() {
  const [step, setStep] = useState<Step>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { signUp, setActive } = useSignUp();
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    age: 25,
    phone: "",
    city: "",
    state: "",
    annualIncome: "",
    monthlyExpenditure: "",
    maritalStatus: "",
    children: 0,
    otherInvestments: "",
    portfolioMethod: "manual",
    stocks: [],
    pdfFile: null,
    lifestyle: "",
  });

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // PDF Upload dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      updateFormData("pdfFile", acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  // Stock management
  const addStock = () => {
    setFormData((prev) => ({
      ...prev,
      stocks: [...prev.stocks, { symbol: "", quantity: 0, buyPrice: 0 }],
    }));
  };

  const removeStock = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      stocks: prev.stocks.filter((_, i) => i !== index),
    }));
  };

  const updateStock = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      stocks: prev.stocks.map((stock, i) =>
        i === index ? { ...stock, [field]: value } : stock
      ),
    }));
  };

  // Handle Google Sign Up
  const handleGoogleSignUp = async () => {
    try {
      await signUp?.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/onboarding",
      });
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "An error occurred");
    }
  };

  // Step validation
  const validateStep = (): boolean => {
    setError("");
    switch (step) {
      case 1:
        if (!formData.email || !formData.password) {
          setError("Email and password are required");
          return false;
        }
        if (formData.password.length < 8) {
          setError("Password must be at least 8 characters");
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          return false;
        }
        if (!isChecked) {
          setError("Please agree to the Terms and Conditions");
          return false;
        }
        return true;
      case 2:
        if (!formData.firstName || !formData.lastName) {
          setError("Name is required");
          return false;
        }
        if (!formData.phone || formData.phone.length !== 10) {
          setError("Please enter a valid 10-digit phone number");
          return false;
        }
        return true;
      case 3:
        if (!formData.city || !formData.state) {
          setError("City and state are required");
          return false;
        }
        return true;
      case 4:
        if (!formData.annualIncome || !formData.monthlyExpenditure) {
          setError("Income details are required");
          return false;
        }
        return true;
      case 5:
        // Other investments is optional, so no validation needed
        return true;
      case 6:
        if (formData.portfolioMethod === "manual" && formData.stocks.some((s) => !s.symbol)) {
          setError("Please enter at least one stock symbol");
          return false;
        }
        if (formData.portfolioMethod === "pdf" && !formData.pdfFile) {
          setError("Please upload your portfolio PDF");
          return false;
        }
        if (!formData.lifestyle) {
          setError("Please select your lifestyle");
          return false;
        }
        return true;
      default:
        return false;
    }
  };

  // Handle step navigation
  const nextStep = async () => {
    if (!validateStep()) return;
    if (step === 1) {
      setIsLoading(true);
      try {
        const result = await signUp?.create({
          emailAddress: formData.email,
          password: formData.password,
        });
        if (result?.status === "complete") {
          await setActive?.({ session: result.createdSessionId });
          setStep(2);
        } else if (result?.status === "missing_requirements") {
          await signUp?.prepareEmailAddressVerification({ strategy: "email_code" });
          setStep(2);
        }
      } catch (err: any) {
        setError(err.errors?.[0]?.message || "Failed to create account");
      } finally {
        setIsLoading(false);
      }
    } else if (step < 6) {
      setStep((prev) => (prev + 1) as Step);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep((prev) => (prev - 1) as Step);
  };

  // Final submission
  const handleSubmit = async () => {
    if (!validateStep()) return;
    setIsLoading(true);
    try {
      const profilePayload = {
        name: `${formData.firstName} ${formData.lastName}`,
        age: formData.age,
        phone: formData.phone,
        city: formData.city,
        state: formData.state,
        annualIncome: formData.annualIncome,
        monthlyExpenditure: formData.monthlyExpenditure,
        maritalStatus: formData.maritalStatus,
        children: formData.children,
        otherInvestments: formData.otherInvestments,
        lifestyle: formData.lifestyle,
      };
      localStorage.setItem("finStocksProfile", JSON.stringify(profilePayload));
      if (formData.portfolioMethod === "manual") {
        localStorage.setItem("finStocksPortfolio", JSON.stringify(formData.stocks));
      } else if (formData.pdfFile) {
        localStorage.setItem("finStocksPDFUploaded", "true");
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to complete signup");
    } finally {
      setIsLoading(false);
    }
  };

  // Progress indicator
  const ProgressBar = () => (
    <div className="flex items-center gap-2 mb-8">
      {[1, 2, 3, 4, 5, 6].map((s) => (
        <React.Fragment key={s}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${s === step ? "bg-brand-500 text-white" : s < step ? "bg-brand-500 text-white" : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"}`}>
            {s < step ? (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>) : s}
          </div>
          {s < 6 && <div className={`flex-1 h-1 rounded ${s < step ? "bg-brand-500" : "bg-gray-200 dark:bg-gray-700"}`} />}
        </React.Fragment>
      ))}
    </div>
  );

  const stepTitles = {
    1: { title: "Create Account", subtitle: "Start your FinStocks journey" },
    2: { title: "Personal Details", subtitle: "Tell us about yourself" },
    3: { title: "Location", subtitle: "Where are you located?" },
    4: { title: "Financial Profile", subtitle: "Help us understand your finances" },
    5: { title: "Other Investments", subtitle: "Tell us about your other investments" },
    6: { title: "Portfolio & Lifestyle", subtitle: "Add your investments and lifestyle" },
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5 px-4">
        <Link href="/" className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
          <ChevronLeftIcon />
          Back to home
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4 pb-10">
        <div>
          <ProgressBar />
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">{stepTitles[step].title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stepTitles[step].subtitle}</p>
          </div>
          {error && <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">{error}</div>}

          {/* Step 1: Auth */}
          {step === 1 && (
            <div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 mb-6">
                <button onClick={handleGoogleSignUp} className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z" fill="#4285F4"/><path d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z" fill="#34A853"/><path d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z" fill="#FBBC05"/><path d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z" fill="#EB4335"/></svg>
                  Sign up with Google
                </button>
                <button className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10">
                  <svg width="21" className="fill-current" height="20" viewBox="0 0 21 20"><path d="M15.6705 1.875H18.4272L12.4047 8.75833L19.4897 18.125H13.9422L9.59717 12.4442L4.62554 18.125H1.86721L8.30887 10.7625L1.51221 1.875H7.20054L11.128 7.0675L15.6705 1.875ZM14.703 16.475H16.2305L6.37054 3.43833H4.73137L14.703 16.475Z"/></svg>
                  Sign up with X
                </button>
              </div>
              {/* Clerk CAPTCHA element for bot protection */}
              <div id="clerk-captcha"></div>
              <div className="relative py-3 sm:py-5">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-800"></div></div>
                <div className="relative flex justify-center text-sm"><span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">Or</span></div>
              </div>
              <div className="space-y-5">
                <div><Label>Email<span className="text-error-500">*</span></Label><Input type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => updateFormData("email", e.target.value)}/></div>
                <div><Label>Password<span className="text-error-500">*</span></Label><div className="relative"><Input type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" value={formData.password} onChange={(e) => updateFormData("password", e.target.value)}/><span onClick={() => setShowPassword(!showPassword)} className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2">{showPassword ? <EyeIcon className="fill-gray-500 dark:fill-gray-400"/> : <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400"/>}</span></div></div>
                <div><Label>Confirm Password<span className="text-error-500">*</span></Label><div className="relative"><Input type={showConfirmPassword ? "text" : "password"} placeholder="Re-enter password" value={formData.confirmPassword} onChange={(e) => updateFormData("confirmPassword", e.target.value)}/><span onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2">{showConfirmPassword ? <EyeIcon className="fill-gray-500 dark:fill-gray-400"/> : <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400"/>}</span></div></div>
                <div className="flex items-center gap-3"><Checkbox className="w-5 h-5" checked={isChecked} onChange={setIsChecked}/><p className="text-sm text-gray-500 dark:text-gray-400">I agree to the <span className="text-brand-500">Terms and Conditions</span> and <span className="text-brand-500">Privacy Policy</span></p></div>
              </div>
            </div>
          )}

          {/* Step 2: Personal */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4"><div><Label>First Name<span className="text-error-500">*</span></Label><Input type="text" placeholder="John" value={formData.firstName} onChange={(e) => updateFormData("firstName", e.target.value)}/></div><div><Label>Last Name<span className="text-error-500">*</span></Label><Input type="text" placeholder="Doe" value={formData.lastName} onChange={(e) => updateFormData("lastName", e.target.value)}/></div></div>
              <div><Label>Age<span className="text-error-500">*</span></Label><Input type="number" placeholder="25" value={String(formData.age)} onChange={(e) => updateFormData("age", parseInt(e.target.value) || 0)}/></div>
              <div><Label>Phone Number<span className="text-error-500">*</span></Label><div className="flex gap-2"><div className="flex items-center px-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 text-sm">+91</div><Input type="tel" placeholder="9876543210" value={formData.phone} onChange={(e) => updateFormData("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}/></div></div>
            </div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>City<span className="text-error-500">*</span></Label><Input type="text" placeholder="Mumbai" value={formData.city} onChange={(e) => updateFormData("city", e.target.value)}/></div>
                <div><Label>State<span className="text-error-500">*</span></Label><select className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:border-brand-500 focus:outline-none" value={formData.state} onChange={(e) => updateFormData("state", e.target.value)}><option value="">Select state</option><option value="AN">Andaman & Nicobar</option><option value="AP">Andhra Pradesh</option><option value="AR">Arunachal Pradesh</option><option value="AS">Assam</option><option value="BR">Bihar</option><option value="CH">Chandigarh</option><option value="CT">Chhattisgarh</option><option value="DN">Dadra & Nagar Haveli</option><option value="DD">Daman & Diu</option><option value="DL">Delhi</option><option value="GA">Goa</option><option value="GJ">Gujarat</option><option value="HR">Haryana</option><option value="HP">Himachal Pradesh</option><option value="JK">Jammu & Kashmir</option><option value="JH">Jharkhand</option><option value="KA">Karnataka</option><option value="KL">Kerala</option><option value="LA">Ladakh</option><option value="LD">Lakshadweep</option><option value="MP">Madhya Pradesh</option><option value="MH">Maharashtra</option><option value="MN">Manipur</option><option value="ML">Meghalaya</option><option value="MZ">Mizoram</option><option value="NL">Nagaland</option><option value="OR">Odisha</option><option value="PY">Puducherry</option><option value="PB">Punjab</option><option value="RJ">Rajasthan</option><option value="SK">Sikkim</option><option value="TN">Tamil Nadu</option><option value="TG">Telangana</option><option value="TR">Tripura</option><option value="UP">Uttar Pradesh</option><option value="UK">Uttarakhand</option><option value="WB">West Bengal</option></select></div>
              </div>
            </div>
          )}

          {/* Step 4: Financial */}
          {step === 4 && (
            <div className="space-y-5">
              <div><Label>Annual Income<span className="text-error-500">*</span></Label><select className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:border-brand-500 focus:outline-none" value={formData.annualIncome} onChange={(e) => updateFormData("annualIncome", e.target.value)}><option value="">Select income range</option><option value="0-5L">Below ₹5 Lakhs</option><option value="5-10L">₹5 - 10 Lakhs</option><option value="10-25L">₹10 - 25 Lakhs</option><option value="25-50L">₹25 - 50 Lakhs</option><option value="50L-1Cr">₹50 Lakhs - 1 Crore</option><option value="1Cr+">Above ₹1 Crore</option></select></div>
              <div><Label>Monthly Expenditure<span className="text-error-500">*</span></Label><select className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:border-brand-500 focus:outline-none" value={formData.monthlyExpenditure} onChange={(e) => updateFormData("monthlyExpenditure", e.target.value)}><option value="">Select expenditure range</option><option value="0-25K">Below ₹25,000</option><option value="25-50K">₹25,000 - 50,000</option><option value="50-1L">₹50,000 - 1 Lakh</option><option value="1-2L">₹1 - 2 Lakhs</option><option value="2L+">Above ₹2 Lakhs</option></select></div>
              <div className="grid grid-cols-2 gap-4"><div><Label>Marital Status</Label><select className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:border-brand-500 focus:outline-none" value={formData.maritalStatus} onChange={(e) => updateFormData("maritalStatus", e.target.value)}><option value="single">Single</option><option value="married">Married</option><option value="divorced">Divorced</option><option value="widowed">Widowed</option></select></div><div><Label>Children</Label><Input type="number" placeholder="0" value={String(formData.children)} onChange={(e) => updateFormData("children", parseInt(e.target.value) || 0)}/></div></div>
            </div>
          )}

          {/* Step 5: Other Investments */}
          {step === 5 && (
            <div className="space-y-5">
              <div><Label>Other Investments (Optional)</Label><textarea className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent text-gray-800 dark:text-white placeholder-gray-400 focus:border-brand-500 focus:outline-none" rows={4} placeholder="Tell us about any other investments you have (mutual funds, bonds, real estate, etc.)..." value={formData.otherInvestments} onChange={(e) => updateFormData("otherInvestments", e.target.value)}/></div>
            </div>
          )}

          {/* Step 6: Portfolio & Lifestyle */}
          {step === 6 && (
            <div className="space-y-5">
              <div><Label>How would you like to add your portfolio?</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button type="button" onClick={() => updateFormData("portfolioMethod", "manual")} className={`p-4 rounded-xl border-2 transition-all ${formData.portfolioMethod === "manual" ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300"}`}><div className="text-2xl mb-2">✏️</div><div className="font-medium text-gray-800 dark:text-white">Manual Entry</div><div className="text-xs text-gray-500">Add stocks one by one</div></button>
                  <button type="button" onClick={() => updateFormData("portfolioMethod", "pdf")} className={`p-4 rounded-xl border-2 transition-all ${formData.portfolioMethod === "pdf" ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300"}`}><div className="text-2xl mb-2">📄</div><div className="font-medium text-gray-800 dark:text-white">Upload PDF</div><div className="text-xs text-gray-500">CDSL/NSDL statement</div></button>
                </div>
              </div>
              {formData.portfolioMethod === "manual" ? (
                <div className="space-y-3"><Label>Your Holdings</Label>
                  {formData.stocks.map((stock, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input type="text" placeholder="RELIANCE" value={stock.symbol} onChange={(e) => updateStock(index, "symbol", e.target.value.toUpperCase())} className="flex-1"/>
                      <Input type="number" placeholder="Qty" value={stock.quantity || ""} onChange={(e) => updateStock(index, "quantity", parseInt(e.target.value) || 0)} className="w-20"/>
                      <Input type="number" placeholder="Avg ₹" value={stock.buyPrice || ""} onChange={(e) => updateStock(index, "buyPrice", parseFloat(e.target.value) || 0)} className="w-24"/>
                      {formData.stocks.length > 1 && <button type="button" onClick={() => removeStock(index)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>}
                    </div>
                  ))}
                  <button type="button" onClick={addStock} className="w-full py-2 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:border-brand-500 hover:text-brand-500 transition-colors">+ Add Another Stock</button>
                </div>
              ) : (
                <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragActive ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20" : formData.pdfFile ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20" : "border-gray-200 dark:border-gray-700 hover:border-brand-500"}`}>
                  <input {...getInputProps()} />
                  {formData.pdfFile ? (<div><div className="text-4xl mb-2">✅</div><p className="font-medium text-gray-800 dark:text-white">{formData.pdfFile.name}</p><p className="text-sm text-gray-500 mt-1">Click or drag to replace</p></div>) : (<div><div className="text-4xl mb-2">📤</div><p className="font-medium text-gray-800 dark:text-white">{isDragActive ? "Drop your file here" : "Drag & drop your PDF"}</p><p className="text-sm text-gray-500 mt-1">or click to browse (max 10MB)</p></div>)}
                </div>
              )}
              <div><Label>Lifestyle & Investment Goals<span className="text-error-500">*</span></Label><textarea className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent text-gray-800 dark:text-white placeholder-gray-400 focus:border-brand-500 focus:outline-none" rows={3} placeholder="Tell us about your lifestyle, risk appetite, and investment goals..." value={formData.lifestyle} onChange={(e) => updateFormData("lifestyle", e.target.value)}/></div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && <button type="button" onClick={prevStep} className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Back</button>}
            <Button className="flex-1" size="sm" disabled={isLoading} onClick={step === 6 ? handleSubmit : nextStep}>{isLoading ? "Please wait..." : step === 6 ? "Complete Setup 🚀" : "Continue"}</Button>
          </div>
          {step === 1 && <div className="mt-5"><p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">Already have an account? <Link href="/signin" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">Sign In</Link></p></div>}
        </div>
      </div>
    </div>
  );
}
