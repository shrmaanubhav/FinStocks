"use client";

import { useEffect, useState } from "react";
import { EncryptedText } from "@/components/ui/encrypted-text";

export default function LoadingScreen() {
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const text = "Welcome to FinStock";
    const revealDelayMs = 150;
    const extraDelayMs = 1000; // 1 second after full reveal

    // Calculate total time: (text length * reveal delay) + extra delay
    const totalTime = (text.length * revealDelayMs) + extraDelayMs;

    const timer = setTimeout(() => {
      setShowLoading(false);
    }, totalTime);

    return () => clearTimeout(timer);
  }, []);

  if (!showLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="text-2xl font-light text-white mb-4">
          <EncryptedText
            text="Welcome to FinStock"
            revealDelayMs={150}
            flipDelayMs={100}
            revealedClassName="text-white"
            encryptedClassName="text-gray-500"
          />
        </div>
      </div>
    </div>
  );
}