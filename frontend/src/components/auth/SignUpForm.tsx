"use client";

import Button from "@/components/ui/button/Button";
import Link from "next/link";
import React from "react";
import { useRouter } from 'next/navigation';

export default function SignUpForm() {
  const router = useRouter();

  const handleContinue = () => {
    router.push('/dashboard');
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5 px-4">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Home
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 xl:text-title-md">
            Get Started!
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Authentication has been removed. Click below to continue to the dashboard.
          </p>
        </div>
        <div className="space-y-6">
          <Button
            onClick={handleContinue}
            className="w-full"
          >
            Continue to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
