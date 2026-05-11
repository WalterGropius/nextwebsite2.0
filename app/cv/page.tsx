"use client"

import { Navigation } from "@/components/navigation"
import { PageLoader } from "@/components/page-loader"
import { 
  Download, 
  ExternalLink, 
  Briefcase, 
  GraduationCap, 
  Code, 
  Award,
  Globe,
  Heart,
  Mic,
  Calendar
} from "lucide-react"

const experience = [
  {
    title: "Co-founder & CTO",
    company: "Flipas | GenZ AI Life Accelerator",
    period: "May 2024 – June 2025",
    highlights: [
      "Architected MVP with Firebase and MUI, securing seed funding",
      "Co-conceptualized Sombra AI, the empathetic conversational AI mentor",
      "Built and led a high-performing tech team of 5 engineers",
      "Pioneered Dynamic UI framework for AI-driven, context-aware interfaces",
    ],
    color: "var(--cobalt-blue)",
  },
  {
    title: "VFX Supervisor #2",
    company: "Wilma Film | Hagen",
    period: "2023",
    highlights: [
      "On-set VFX data collection with chrome ball, color chart",
      "Coordinated with script supervisors for accurate VFX documentation",
    ],
    color: "var(--vermilion)",
  },
  {
    title: "Technical Artist",
    company: "Numinos | VR Historical City Recreations",
    period: "May 2023 – Nov 2023",
    highlights: [
      "Pushed real-time rendering boundaries in VR development",
      "Engineered custom real-time flood simulation for VR",
    ],
    color: "var(--pistachio)",
  },
  {
    title: "SPIDER",
    company: "NEW LIFE | Global Innovation Network",
    period: "Apr 2018 – Present",
    highlights: [
      "Product integration, development, and talent acquisition",
      "Collaborated with international teams on emerging technologies",
    ],
    color: "var(--vista-blue)",
  },
]

const skills = {
  "VR/AR & 3D": ["Unreal Engine", "React Three Fiber", "Blender", "Substance Suite", "Houdini", "Maya"],
  "Development": ["Next.js", "TypeScript", "Python", "PostgreSQL", "Docker", "AWS/GCP"],
  "AI/ML": ["Gemini 2", "LangChain", "PyTorch", "TensorFlow.js", "RAG", "YOLO"],
  "Creative": ["Photography", "Graphic Design", "Sound Design", "Music Production"],
}

export default function CVPage() {
  return (
    <PageLoader>
      <main className="min-h-screen" style={{ background: "var(--surface-dark)" }}>
        <Navigation />
        
        <div className="section-container pt-24">
          {/* Header */}
          <div className="mb-16 text-center animate-fade-in-up">
            <h1 
              className="mb-4 text-5xl font-bold sm:text-6xl md:text-7xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="gradient-text">zenbauhaus</span>
            </h1>
            <p className="mb-6 text-xl text-gray-400">
              Art & Tech Polymath | CTO | Creative Technologist
            </p>
            <p className="mx-auto max-w-2xl text-gray-500">
              Bridging creative vision and technical execution to drive impactful innovation
            </p>
            
            {/* Download button */}
            <div className="mt-8">
              <a 
                href="/cvBauer.html"
                download
                className="btn-primary inline-flex items-center gap-2"
              >
                <Download size={18} />
                Download Full CV
              </a>
            </div>
          </div>

          {/* Experience Section */}
          <section className="mb-20">
            <div className="mb-8 flex items-center gap-3 animate-fade-in-up animation-delay-200">
              <Briefcase size={24} style={{ color: "var(--vista-blue)" }} />
              <h2 
                className="text-3xl font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Experience
              </h2>
            </div>

            <div className="space-y-6">
              {experience.map((job, idx) => (
                <div 
                  key={idx}
                  className="glass-card p-6 animate-fade-in-up"
                  style={{ animationDelay: `${0.3 + idx * 0.1}s` }}
                >
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 
                        className="text-xl font-bold text-white"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {job.title}
                      </h3>
                      <p style={{ color: job.color }}>{job.company}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={14} />
                      {job.period}
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {job.highlights.map((highlight, hidx) => (
                      <li key={hidx} className="flex items-start gap-2 text-gray-400">
                        <span style={{ color: job.color }}>→</span>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Skills Section */}
          <section className="mb-20">
            <div className="mb-8 flex items-center gap-3 animate-fade-in-up">
              <Code size={24} style={{ color: "var(--pistachio)" }} />
              <h2 
                className="text-3xl font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Technical Skills
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {Object.entries(skills).map(([category, items], idx) => (
                <div 
                  key={category}
                  className="glass-card p-6 animate-fade-in-up"
                  style={{ animationDelay: `${0.4 + idx * 0.1}s` }}
                >
                  <h3 
                    className="mb-4 text-lg font-semibold"
                    style={{ color: "var(--flax)" }}
                  >
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {items.map((skill) => (
                      <span key={skill} className="skill-pill">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Education & Languages */}
          <div className="mb-20 grid gap-6 md:grid-cols-2">
            {/* Education */}
            <section className="animate-fade-in-up animation-delay-500">
              <div className="mb-6 flex items-center gap-3">
                <GraduationCap size={24} style={{ color: "var(--salmon-pink)" }} />
                <h2 
                  className="text-2xl font-bold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Education
                </h2>
              </div>
              <div className="glass-card p-6">
                <h3 className="font-semibold text-white">BAC Scientifique</h3>
                <p className="text-sm text-gray-400">Lycée Français de Prague • 2013</p>
                <div className="mt-4 border-t pt-4" style={{ borderColor: "var(--border-subtle)" }}>
                  <h4 className="text-sm font-semibold text-gray-300">Self-Taught Expertise</h4>
                  <p className="text-sm text-gray-500">
                    Full-Stack Web, VR/AR Development, AI/ML, Real-time Graphics
                  </p>
                </div>
              </div>
            </section>

            {/* Languages */}
            <section className="animate-fade-in-up animation-delay-600">
              <div className="mb-6 flex items-center gap-3">
                <Globe size={24} style={{ color: "var(--cobalt-blue)" }} />
                <h2 
                  className="text-2xl font-bold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Languages
                </h2>
              </div>
              <div className="glass-card p-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">English</span>
                  <span style={{ color: "var(--pistachio)" }}>Fluent</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Czech</span>
                  <span style={{ color: "var(--vista-blue)" }}>Working Knowledge</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">French</span>
                  <span style={{ color: "var(--vista-blue)" }}>Working Knowledge</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Spanish</span>
                  <span style={{ color: "var(--thistle)" }}>Reading</span>
                </div>
              </div>
            </section>
          </div>

          {/* Speaking & Interests */}
          <div className="mb-20 grid gap-6 md:grid-cols-2">
            {/* Speaking */}
            <section className="animate-fade-in-up animation-delay-700">
              <div className="mb-6 flex items-center gap-3">
                <Mic size={24} style={{ color: "var(--vermilion)" }} />
                <h2 
                  className="text-2xl font-bold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Speaking
                </h2>
              </div>
              <div className="glass-card p-6">
                <div className="flex flex-wrap gap-2">
                  {["Nike Berlin", "Fashion Tech Berlin", "CzechVRFest", "CVUT", "CIIRC", "UMPRUM"].map((event) => (
                    <span key={event} className="skill-pill">
                      {event}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* Interests */}
            <section className="animate-fade-in-up animation-delay-800">
              <div className="mb-6 flex items-center gap-3">
                <Heart size={24} style={{ color: "var(--flax)" }} />
                <h2 
                  className="text-2xl font-bold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Passions
                </h2>
              </div>
              <div className="glass-card p-6">
                <div className="flex flex-wrap gap-2">
                  {["Art & Tech Synergy", "Skateboarding", "Music Production", "DIY Innovation", "Philosophy", "VR/AR"].map((interest) => (
                    <span key={interest} className="skill-pill">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* CTA */}
          <div className="pb-16 text-center animate-fade-in-up animation-delay-900">
            <p className="mb-6 text-xl text-gray-400">
              Ready to work together?
            </p>
            <a 
              href="mailto:zenbauhaus@gmail.com"
              className="btn-primary inline-flex items-center gap-2"
            >
              Get in Touch
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </main>
    </PageLoader>
  )
}
