"use client";
import { useRouter } from "next/navigation";

export default function HinglishNewsFeed() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/dashboard/news")}
      className="group flex w-full items-center mx-6 dark:mx-0 gap-5 rounded-3xl border border-gray-200 bg-white px-6 py-5 text-left shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-black/10 focus-visible:outline focus-visible:outline-brand-500 focus-visible:outline-offset-2 dark:border-gray-800 dark:bg-gray-900 dark:ring-white/5"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-gray-900 dark:text-white">News</span>
          <span className="flex items-center gap-1 text-xs text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Filtered news for your holdings</p>
      </div>

      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10 text-brand-500 transition group-hover:bg-brand-500 group-hover:text-white">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
