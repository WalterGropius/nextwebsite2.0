"use client"

import { useRef, useEffect, useState } from "react"
import { Brain, Zap, Code, Layers, Cpu, Palette, Wrench } from "lucide-react"
import { SectionHeader } from "./section-header"

const skillCategories = [
  {
    title: "3D, VFX & XR",
    icon: Zap,
    color: "var(--salmon-pink)",
    description:
      "Immersive experiences that blur the line between digital and reality",
    skills: [
      { name: "Blender", level: 95 },
      { name: "Unreal Engine", level: 90 },
      { name: "Houdini", level: 75 },
      { name: "Three.js/R3F", level: 92 },
      { name: "WebGL/WebGPU", level: 85 },
      { name: "Unity 3D", level: 80 },
      { name: "Substance Suite", level: 88 },
      { name: "WebXR", level: 85 },
      { name: "Virtual Production", level: 78 },
      { name: "GLSL Shaders", level: 82 },
    ],
  },
  {
    title: "Development",
    icon: Code,
    color: "var(--cobalt-blue)",
    description: "Full-stack mastery from systems to stunning interfaces",
    skills: [
      { name: "TypeScript", level: 95 },
      { name: "React/Next.js", level: 95 },
      { name: "Node.js", level: 90 },
      { name: "Python", level: 88 },
      { name: "PostgreSQL", level: 85 },
      { name: "Docker/DevOps", level: 82 },
      { name: "C++/C#", level: 75 },
      { name: "GraphQL", level: 85 },
      { name: "AWS/GCP", level: 80 },
      { name: "System Design", level: 88 },
    ],
  },
  {
    title: "AI & Machine Learning",
    icon: Brain,
    color: "var(--fern-green)",
    description: "Intelligence that augments human creativity",
    skills: [
      { name: "LLMs & Prompting", level: 95 },
      { name: "Agentic AI", level: 90 },
      { name: "RAG Systems", level: 88 },
      { name: "Computer Vision", level: 82 },
      { name: "PyTorch", level: 78 },
      { name: "Neural Networks", level: 80 },
      { name: "NLP", level: 85 },
      { name: "YOLO/CV", level: 75 },
      { name: "LangChain", level: 88 },
      { name: "Embeddings", level: 85 },
    ],
  },
]

const additionalSkills = [
  "DaVinci Resolve",
  "Adobe CC",
  "Mocha Pro",
  "EmberGen",
  "Matte Painting",
  "Real-time ICVFX",
  "ARKit/ARCore",
  "Spline",
  "Arduino",
  "3D Printing",
  "Photography",
  "Game Design",
  "Sound Design",
  "Music Production",
]

export function Arsenal() {
  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)
  const [activeCategory, setActiveCategory] = useState(0)
  const [animateSkills, setAnimateSkills] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          setTimeout(() => setAnimateSkills(true), 500)
        }
      },
      { threshold: 0.1, rootMargin: "-50px" }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    setAnimateSkills(false)
    const timer = setTimeout(() => setAnimateSkills(true), 100)
    return () => clearTimeout(timer)
  }, [activeCategory])

  const active = skillCategories[activeCategory]

  return (
    <section id="arsenal" className="relative overflow-hidden py-12 sm:py-16">
      <div ref={ref} className="section-container relative z-10">
        {/* Section header */}
        <div
          className={`mb-10 max-w-2xl ${
            isInView ? "animate-reveal-blur" : "opacity-0"
          }`}
        >
          <SectionHeader
            icon={Wrench}
            title={
              <>
                Technical{" "}
                <span style={{ color: "var(--fern-green)" }}>arsenal</span>
              </>
            }
            kicker="Arsenal"
            color="var(--fern-green)"
          />
          <p
            className="mt-4 text-lg"
            style={{ color: "var(--text-muted)" }}
          >
            A decade of mastering the tools that bring visions to life.
          </p>
        </div>

        {/* Category tabs — soft pill */}
        <div
          className={`mb-8 flex flex-wrap gap-3 ${
            isInView ? "animate-fade-in-up animation-delay-200" : "opacity-0"
          }`}
        >
          {skillCategories.map((category, idx) => {
            const isActive = activeCategory === idx
            return (
              <button
                key={idx}
                onClick={() => setActiveCategory(idx)}
                className="group inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all duration-300"
                style={{
                  background: isActive
                    ? `linear-gradient(180deg, ${category.color}, ${category.color}c0)`
                    : "linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.35) 100%)",
                  color: isActive ? "#ffffff" : "var(--text-primary)",
                  border: `1px solid ${
                    isActive ? `${category.color}` : "rgba(255,255,255,0.7)"
                  }`,
                  borderRadius: "9999px",
                  boxShadow: isActive
                    ? `0 14px 30px -14px ${category.color}`
                    : "0 8px 20px -14px rgba(15,17,23,0.2)",
                }}
              >
                <category.icon size={16} />
                {category.title}
              </button>
            )
          })}
        </div>

        {/* Active category content */}
        <div
          key={activeCategory}
          className={`glass-card mx-auto max-w-5xl p-6 lg:p-10 ${
            isInView ? "animate-reveal-blur animation-delay-300" : "opacity-0"
          }`}
        >
          {/* Soft category wash */}
          <div
            className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full opacity-40 blur-3xl"
            style={{ background: active.color }}
          />

          {/* Category header */}
          <div className="relative mb-6 flex items-start gap-4">
            <div
              className="icon-chip h-14 w-14 shrink-0"
              style={{ color: active.color }}
            >
              <active.icon size={26} />
            </div>
            <div>
              <h3
                className="text-2xl lg:text-3xl"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--text-primary)",
                }}
              >
                {active.title}
              </h3>
              <p
                className="text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                {active.description}
              </p>
            </div>
          </div>

          {/* Skills grid with bars */}
          <div className="relative grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {active.skills.map((skill, idx) => (
              <div key={skill.name} className="group">
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className="text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {skill.name}
                  </span>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: active.color }}
                  >
                    {skill.level}%
                  </span>
                </div>
                <div
                  className="h-1.5 overflow-hidden"
                  style={{
                    background: "rgba(15, 17, 23, 0.07)",
                    borderRadius: "9999px",
                  }}
                >
                  <div
                    className="h-full transition-all duration-1000 ease-out"
                    style={{
                      width: animateSkills ? `${skill.level}%` : "0%",
                      background: `linear-gradient(90deg, ${active.color}, ${active.color}80)`,
                      transitionDelay: `${idx * 50}ms`,
                      borderRadius: "9999px",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional skills cloud */}
        <div
          className={`mt-12 ${
            isInView ? "animate-fade-in animation-delay-600" : "opacity-0"
          }`}
        >
          <h4 className="section-kicker mb-5">Also Proficient In</h4>
          <div className="flex flex-wrap gap-2">
            {additionalSkills.map((skill, idx) => (
              <span
                key={skill}
                className="skill-pill"
                style={{ animationDelay: `${600 + idx * 50}ms` }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div
          className={`mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 ${
            isInView ? "animate-fade-in-up animation-delay-800" : "opacity-0"
          }`}
        >
          {[
            { value: "50+", label: "Technologies", icon: Layers, color: "var(--cobalt-blue)" },
            { value: "10+", label: "Years", icon: Cpu, color: "var(--vermilion)" },
            { value: "3", label: "Core Domains", icon: Brain, color: "var(--fern-green)" },
            { value: "∞", label: "Curiosity", icon: Palette, color: "var(--lion)" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="glass-card glass-card-hover flex flex-col items-center p-5 text-center"
            >
              <stat.icon
                size={20}
                className="mx-auto mb-2"
                style={{ color: stat.color }}
              />
              <div
                className="text-2xl"
                style={{
                  color: stat.color,
                  fontFamily: "var(--font-display)",
                }}
              >
                {stat.value}
              </div>
              <div
                className="text-[0.65rem] uppercase tracking-[0.22em]"
                style={{ color: "var(--text-muted)" }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
