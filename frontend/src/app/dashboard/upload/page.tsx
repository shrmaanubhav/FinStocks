"use client";

import { useEffect, useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        "http://localhost:8000/api/onboarding/upload-pdf",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) throw new Error();

      setSuccess(true);
      setFile(null);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-[#0b1220] flex items-center justify-center px-6">
      <div className="-translate-y-10 w-full max-w-lg">
        <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-2xl p-8 dark:bg-gray-900/90 dark:border-white/10 backdrop-blur-xl">

          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-brand-500/20 to-brand-600/20 border border-brand-500/30 dark:border-brand-500/40 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-brand-600 dark:text-brand-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h5l5 5v9a2 2 0 01-2 2z"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Upload Portfolio PDF
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add your portfolio document to continue
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                setSuccess(false);
                setError(null);
              }}
              className="w-full text-sm text-gray-800 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-brand-500/15 file:text-brand-600 hover:file:bg-brand-500/25 dark:file:bg-brand-500/20 dark:file:text-brand-400 dark:hover:file:bg-brand-500/30"
            />

            {file && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Selected file:{" "}
                <span className="text-gray-900 dark:text-gray-200">{file.name}</span>
              </p>
            )}

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            {success && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-full mt-4 px-5 py-3 text-sm font-medium rounded-xl bg-linear-to-r from-brand-500 to-brand-600 text-white disabled:opacity-40 shadow-sm"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Portfolio uploaded successfully
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="w-full mt-4 px-5 py-3 text-sm font-medium rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white disabled:opacity-40"
            >
              {loading ? "Uploading..." : "Upload PDF"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
