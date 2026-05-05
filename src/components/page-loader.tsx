"use client"

import { useState, useEffect } from "react"

interface PageLoaderProps {
  children: React.ReactNode
}

export function PageLoader({ children }: PageLoaderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        // Accelerating progress
        const increment = Math.random() * 15 + 5
        return Math.min(prev + increment, 100)
      })
    }, 100)

    // Minimum display time
    const minDisplayTime = setTimeout(() => {
      setProgress(100)
    }, 800)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(minDisplayTime)
    }
  }, [])

  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => setIsExiting(true), 200)
      setTimeout(() => setIsLoading(false), 800)
    }
  }, [progress])

  return (
    <div className="relative">
      {children}

      {/* Loader overlay — kept conditionally so children never unmount */}
      {isLoading && (
      <div
        className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-all duration-700 ${
          isExiting ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        style={{ background: "var(--surface-dark)" }}
      >
        {/* Background pattern */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, var(--vista-blue) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Glow effects */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div 
            className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[150px] animate-pulse-slow"
            style={{ background: "radial-gradient(circle, var(--cobalt-blue) 0%, transparent 70%)", opacity: 0.15 }}
          />
        </div>

        {/* Loader content */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Logo mark animation */}
          <div className="relative mb-8">
            {/* Rotating ring */}
            <svg
              className="h-24 w-24 animate-spin"
              style={{ animationDuration: "3s" }}
              viewBox="0 0 100 100"
            >
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--cobalt-blue)" />
                  <stop offset="100%" stopColor="var(--vista-blue)" />
                </linearGradient>
              </defs>
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="70 200"
              />
            </svg>
            
            {/* Center logo */}
            <div 
              className="absolute inset-0 flex items-center justify-center"
            >
              <div 
                className="flex h-16 w-16 items-center justify-center rounded-xl text-xl font-bold text-white"
                style={{ 
                  background: "var(--gradient-primary)",
                  fontFamily: "var(--font-display)"
                }}
              >
                EB
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-6 w-48">
            <div 
              className="h-1 overflow-hidden rounded-full"
              style={{ background: "var(--surface-elevated)" }}
            >
              <div 
                className="h-full rounded-full transition-all duration-300 ease-out"
                style={{ 
                  width: `${progress}%`,
                  background: "var(--gradient-primary)"
                }}
              />
            </div>
          </div>

          {/* Loading text */}
          <div className="text-center">
            <p 
              className="text-sm font-medium tracking-wide"
              style={{ color: "var(--vista-blue)" }}
            >
              {progress < 100 ? "Loading experience" : "Ready"}
            </p>
          </div>
        </div>

        {/* Corner accents */}
        <div 
          className="absolute left-8 top-8 h-16 w-[1px]"
          style={{ background: "linear-gradient(180deg, var(--vista-blue), transparent)" }}
        />
        <div 
          className="absolute left-8 top-8 h-[1px] w-16"
          style={{ background: "linear-gradient(90deg, var(--vista-blue), transparent)" }}
        />
        <div 
          className="absolute bottom-8 right-8 h-16 w-[1px]"
          style={{ background: "linear-gradient(0deg, var(--vista-blue), transparent)" }}
        />
        <div
          className="absolute bottom-8 right-8 h-[1px] w-16"
          style={{ background: "linear-gradient(270deg, var(--vista-blue), transparent)" }}
        />
      </div>
      )}
    </div>
  )
}
