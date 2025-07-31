"use client"

import { useState, useEffect } from "react"

interface PageLoaderProps {
  children: React.ReactNode
}

export function PageLoader({ children }: PageLoaderProps) {
  const [showOverlay, setShowOverlay] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowOverlay(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative">
      {children}
      {showOverlay && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-blue-50 via-amber-50 to-blue-100 transition-opacity duration-700">
          <div className="flex flex-col items-center space-y-8">
            {/* Sophisticated loader: animated SVG + shimmer + text */}
            <div className="relative mb-4">
              <svg
                className="w-24 h-24 animate-spin-slow"
                viewBox="0 0 100 100"
                fill="none"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#3b82f6"
                  strokeWidth="8"
                  strokeDasharray="62.8 188.4"
                  strokeLinecap="round"
                  className="animate-dash"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="32"
                  stroke="#fbbf24"
                  strokeWidth="6"
                  strokeDasharray="40 100"
                  strokeDashoffset="60"
                  strokeLinecap="round"
                  className="animate-dash-reverse"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="24"
                  stroke="#0ea5e9"
                  strokeWidth="4"
                  strokeDasharray="20 60"
                  strokeDashoffset="30"
                  strokeLinecap="round"
                  className="animate-dash"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="block w-10 h-10 bg-gradient-to-tr from-amber-400 via-blue-400 to-blue-600 rounded-full blur-xl opacity-60 animate-pulse" />
              </div>
            </div>
            <div className="bg-zinc-900/80 rounded-lg px-8 py-6 shadow-2xl border border-zinc-800 text-center space-y-2 backdrop-blur-md">
              <div className="text-blue-600 font-extrabold text-2xl mb-1 tracking-wide animate-shimmer bg-gradient-to-r from-blue-400 via-amber-400 to-blue-600 bg-clip-text text-transparent">
                Loading Experience
              </div>
              <div className="text-zinc-300 text-base animate-fade-in">
                Preparing your journey...
              </div>
            </div>
          </div>
          <style jsx global>{`
            @keyframes dash {
              0% { stroke-dashoffset: 0; }
              100% { stroke-dashoffset: 250; }
            }
            @keyframes dash-reverse {
              0% { stroke-dashoffset: 60; }
              100% { stroke-dashoffset: -180; }
            }
            .animate-dash {
              animation: dash 1.2s linear infinite;
            }
            .animate-dash-reverse {
              animation: dash-reverse 1.2s linear infinite;
            }
            .animate-spin-slow {
              animation: spin 2.5s linear infinite;
            }
            @keyframes shimmer {
              0% { background-position: -400px 0; }
              100% { background-position: 400px 0; }
            }
            .animate-shimmer {
              background-size: 200% 100%;
              animation: shimmer 2s linear infinite;
            }
            @keyframes fade-in {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .animate-fade-in {
              animation: fade-in 1.2s ease-in;
            }
          `}</style>
        </div>
      )}
    </div>
  )
}