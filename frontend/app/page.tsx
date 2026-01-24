"use client";

import { motion } from "framer-motion";
import React from "react";
import { AuroraBackground } from "../components/ui/aurora-background";
import { MacbookScroll } from "@/components/ui/macbook-scroll";
import { Badge } from "lucide-react";

export function AuroraBackgroundDemo() {
  return (
    <>
    <AuroraBackground className="">
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 items-center justify-center px-4"
      >
        <div className="text-3xl md:text-7xl font-bold dark:text-white text-center">
          All your financial tools, <br /> in one place.
        </div>
        <div className="font-extralight text-base md:text-4xl dark:text-neutral-200 py-4">
          AI based financial insights at your fingertips.
        </div>
        <button className="bg-black dark:bg-white rounded-full w-fit text-white dark:text-black px-4 py-2">
          Start Exploring Now
        </button>
      </motion.div>
    </AuroraBackground>
    <div className="w-full overflow-hidden bg-white dark:bg-[#0B0B0F]">
      <MacbookScroll
        title={
          <span>
            This Macbook is built with Tailwindcss. <br /> No kidding.
          </span>
        }
        src="./dashboard.png"
        showGradient={false}
      />
    </div>
    </>
  );
}

export default function Page() {
  return <AuroraBackgroundDemo />;
}
