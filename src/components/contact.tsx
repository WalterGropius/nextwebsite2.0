"use client"

import { useRef, useState, useEffect } from "react"
import { Mail, ArrowUpRight, Github, Linkedin, Instagram, Music, Send } from "lucide-react"
import { SectionHeader } from "./section-header"

const socialLinks = [
  { name: "GitHub", href: "https://github.com/WalterGropius", icon: Github, color: "var(--cobalt-blue)" },
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
    <section id="contact" className="relative py-12 sm:py-16">
      <div ref={ref} className="section-container relative z-10">
        {/* Main CTA */}
        <div
          className={`mx-auto max-w-3xl text-center ${
            isInView ? "animate-reveal-blur" : "opacity-0"
          }`}
        >
          <SectionHeader
            icon={Send}
            title={
              <>
                Let&apos;s build something{" "}
                <span style={{ color: "var(--vermilion)" }}>extraordinary</span>
              </>
            }
            kicker="Get in touch"
            color="var(--vermilion)"
            align="center"
          />

          <p
            className="mx-auto mb-8 mt-5 max-w-xl text-base"
            style={{ color: "var(--text-muted)" }}
          >
            Whether it&apos;s VR, AI, or something entirely new — I&apos;m here to make
            it happen.
          </p>

          {/* CTA buttons */}
          <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
            <a href="mailto:zenbauhaus@gmail.com" className="btn-primary group">
              <Mail size={16} />
              Get in Touch
              <ArrowUpRight
                size={14}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
            <a href="/portfolio-s" className="btn-secondary">
              View Portfolio
            </a>
          </div>
        </div>

        {/* Social pills */}
        <div
          className={`flex flex-wrap items-center justify-center gap-2 ${
            isInView ? "animate-fade-in animation-delay-300" : "opacity-0"
          }`}
        >
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="skill-pill group"
            >
              <social.icon
                size={13}
                style={{ color: social.color }}
                className="mr-1.5 transition-transform duration-300 group-hover:scale-110"
              />
              <span style={{ color: "var(--text-primary)" }}>{social.name}</span>
            </a>
          ))}
        </div>

        {/* Footer line */}
        <div
          className={`mt-12 flex flex-col items-center gap-3 pt-6 text-xs sm:flex-row sm:justify-between ${
            isInView ? "animate-fade-in animation-delay-500" : "opacity-0"
          }`}
          style={{
            borderTop: "1px solid rgba(15, 17, 23, 0.08)",
            color: "var(--text-muted)",
          }}
        >
          <div className="flex items-center gap-2">
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
