"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowDown, Sparkles } from "lucide-react"

const roles = [
  { text: "Creative Technologist", color: "var(--cobalt-blue)" },
  { text: "CTO & Builder", color: "var(--vermilion)" },
  { text: "VR/AR Pioneer", color: "var(--pistachio)" },
  { text: "AI Architect", color: "var(--flax)" },
  { text: "Visual Artist", color: "var(--salmon-pink)" },
]

export function Hero() {
  const [currentRole, setCurrentRole] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentRole((prev) => (prev + 1) % roles.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const scrollToContent = () => {
    const nextSection = document.getElementById("manifesto")
    nextSection?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div 
      ref={containerRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Ambient glow effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div 
          className="absolute -left-1/4 top-1/4 h-[600px] w-[600px] rounded-full blur-[120px] animate-pulse-slow"
          style={{ background: "radial-gradient(circle, rgba(59, 102, 243, 0.15) 0%, transparent 70%)" }}
        />
        <div 
          className="absolute -right-1/4 bottom-1/4 h-[500px] w-[500px] rounded-full blur-[100px] animate-pulse-slow animation-delay-500"
          style={{ background: "radial-gradient(circle, rgba(238, 74, 68, 0.12) 0%, transparent 70%)" }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        {/* Status badge */}
        <div 
          className={`mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-2 ${isVisible ? "animate-fade-in-down" : "opacity-0"}`}
          style={{ 
            background: "var(--surface-glass)", 
            borderColor: "var(--border-subtle)",
            backdropFilter: "blur(10px)"
          }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="text-sm font-medium text-gray-300">Available for ambitious projects</span>
        </div>

        {/* Main heading */}
        <h1 
          className={`mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl leading-tight-custom ${isVisible ? "animate-blur-in" : "opacity-0"}`}
          style={{ fontFamily: "var(--font-display)" }}
        >
          <span className="block text-white">Eliáš Bauer</span>
        </h1>

        {/* Role rotator */}
        <div 
          className={`mb-8 h-12 overflow-hidden ${isVisible ? "animate-fade-in-up animation-delay-300" : "opacity-0"}`}
        >
          <div 
            className="transition-transform duration-500 ease-out"
            style={{ transform: `translateY(-${currentRole * 48}px)` }}
          >
            {roles.map((role, idx) => (
              <div 
                key={idx}
                className="flex h-12 items-center justify-center text-2xl font-bold sm:text-3xl md:text-4xl"
                style={{ color: role.color }}
              >
                {role.text}
              </div>
            ))}
          </div>
        </div>

        {/* Tagline */}
        <p 
          className={`mx-auto mb-10 max-w-2xl text-lg text-gray-400 sm:text-xl md:text-2xl ${isVisible ? "animate-fade-in-up animation-delay-500" : "opacity-0"}`}
          style={{ lineHeight: 1.6 }}
        >
          Bridging <span className="text-white font-semibold">creative vision</span> and{" "}
          <span className="text-white font-semibold">technical execution</span> to build 
          what others say is impossible.
        </p>

        {/* CTA buttons */}
        <div 
          className={`flex flex-col items-center justify-center gap-4 sm:flex-row ${isVisible ? "animate-fade-in-up animation-delay-700" : "opacity-0"}`}
        >
          <a 
            href="/portfolio-s"
            className="btn-primary group"
          >
            <Sparkles size={18} className="transition-transform group-hover:rotate-12" />
            Explore My Work
          </a>
          <a 
            href="mailto:zenbauhaus@gmail.com"
            className="btn-secondary"
          >
            Let's Collaborate
          </a>
        </div>

        {/* Quick stats */}
        <div 
          className={`mt-16 grid grid-cols-3 gap-4 sm:gap-8 ${isVisible ? "animate-fade-in-up animation-delay-900" : "opacity-0"}`}
        >
          {[
            { value: "10+", label: "Years Creating" },
            { value: "VR/AI", label: "Specialization" },
            { value: "CTO", label: "Current Role" },
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <div 
                className="text-2xl font-bold sm:text-3xl md:text-4xl"
                style={{ color: "var(--vista-blue)" }}
              >
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 sm:text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToContent}
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 transition-colors hover:text-white ${isVisible ? "animate-fade-in animation-delay-1100" : "opacity-0"}`}
        aria-label="Scroll to content"
      >
        <span className="text-xs uppercase tracking-widest">Discover</span>
        <ArrowDown size={20} className="animate-bounce" />
      </button>
    </div>
  )
}
