"use client"

import { useRef, useState, useEffect } from "react"
import { Mail, ArrowUpRight, Github, Linkedin, Instagram, Music } from "lucide-react"

const socialLinks = [
  { name: "GitHub", href: "https://github.com/WalterGropius", icon: Github, color: "var(--thistle)" },
  { name: "LinkedIn", href: "https://linkedin.com/in/zenbauhaus", icon: Linkedin, color: "var(--cobalt-blue)" },
  { name: "Instagram", href: "https://instagram.com/y4ngyin", icon: Instagram, color: "var(--salmon-pink)" },
  { name: "Skate", href: "https://instagram.com/tra5her_sk8", icon: Instagram, color: "var(--lion)" },
  { name: "Music", href: "https://soundcloud.com/mczenbauhaus", icon: Music, color: "var(--vermilion)" },
]

export function Contact() {
  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsInView(true)
      },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="contact" className="relative py-16 sm:py-20">
      <div ref={ref} className="section-container relative z-10">
        {/* Main CTA */}
        <div className={`mx-auto max-w-3xl text-center ${isInView ? "animate-fade-in-up" : "opacity-0"}`}>
          <h2 
            className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Let&apos;s Build Something <span className="gradient-text">Extraordinary</span>
          </h2>
          
          <p className="mx-auto mb-8 max-w-xl text-gray-400">
            Whether it&apos;s VR, AI, or something entirely new—I&apos;m here to make it happen.
          </p>

          {/* CTA buttons */}
          <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
            <a href="mailto:zenbauhaus@gmail.com" className="btn-primary group">
              <Mail size={18} />
              Get in Touch
              <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <a href="/portfolio-s" className="btn-secondary">
              View Portfolio
            </a>
          </div>
        </div>

        {/* Social links - compact row */}
        <div className={`flex flex-wrap items-center justify-center gap-3 ${isInView ? "animate-fade-in animation-delay-300" : "opacity-0"}`}>
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-all hover:scale-105"
              style={{ background: "var(--surface-glass)", border: "1px solid var(--border-subtle)" }}
            >
              <social.icon size={14} style={{ color: social.color }} />
              <span className="text-gray-400">{social.name}</span>
            </a>
          ))}
        </div>

        {/* Footer line */}
        <div 
          className={`mt-12 flex flex-col items-center gap-3 border-t pt-6 text-xs text-gray-500 sm:flex-row sm:justify-between ${
            isInView ? "animate-fade-in animation-delay-500" : "opacity-0"
          }`}
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div className="flex items-center gap-2">
            <div 
              className="flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold"
              style={{ background: "var(--gradient-primary)" }}
            >
              EB
            </div>
            <span>zenbauhaus</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Prague, CZ</span>
            <span>© {new Date().getFullYear()}</span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Available
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
