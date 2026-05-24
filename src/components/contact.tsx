"use client"

import { useRef } from "react"
import { motion, useInView } from "motion/react"
import { Github, Linkedin, Instagram, Music } from "lucide-react"
import { MotionText } from "./motion-text"
import { InkLine } from "./ink-line"

const socials = [
  { name: "github", href: "https://github.com/WalterGropius", icon: Github },
  { name: "linkedin", href: "https://linkedin.com/in/zenbauhaus", icon: Linkedin },
  { name: "instagram", href: "https://instagram.com/y4ngyin", icon: Instagram },
  { name: "soundcloud", href: "https://soundcloud.com/mczenbauhaus", icon: Music },
]

export function Contact() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section id="contact" className="relative py-24 sm:py-32" ref={ref}>
      <div className="section-container">
        <div className="mx-auto max-w-4xl">
          {/* Status */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.7 }}
            className="mb-8 inline-flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.35em]"
            style={{ color: "var(--text-muted)" }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-600" />
            </span>
            <span>taking on work · 2026</span>
          </motion.div>

          {/* Email as the headline */}
          <h2
            className="text-[clamp(2rem,7vw,5.5rem)] leading-[0.95]"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--ink)",
              letterSpacing: "-0.01em",
            }}
          >
            <a
              href="mailto:zenbauhaus@gmail.com"
              className="ink-underline inline-block transition-transform hover:-translate-y-1"
              style={{ color: "var(--ink)" }}
            >
              <MotionText
                text="zenbauhaus@gmail.com"
                split="char"
                from="up"
                stagger={0.025}
              />
            </a>
          </h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.9, delay: 0.6 }}
            className="mt-8 max-w-xl text-lg sm:text-xl"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-display)",
              lineHeight: 1.5,
            }}
          >
            open to interesting problems. <strong>ai</strong>, <strong>spatial
            computing</strong>, <em>zero-to-one</em> product — or just system
            architecture talk. <span className="humph">if it&apos;s nearly
            impossible, even better.</span>
          </motion.p>

          {/* Wobbled rule */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0.5 }}
            animate={
              inView ? { opacity: 0.6, scaleX: 1 } : { opacity: 0, scaleX: 0.5 }
            }
            transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="my-14 origin-left"
            style={{ color: "var(--ink)" }}
          >
            <InkLine fade={false} thickness={1.2} />
          </motion.div>

          {/* Socials */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {socials.map((s, i) => (
              <motion.a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={
                  inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
                }
                transition={{
                  duration: 0.6,
                  delay: 1 + i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group ink-icons inline-flex items-center gap-2 text-base sm:text-lg"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--ink)",
                }}
              >
                <s.icon size={16} />
                <span className="ink-underline">{s.name}</span>
              </motion.a>
            ))}
          </div>

          {/* Footer */}
          <div
            className="mt-20 flex flex-col items-baseline justify-between gap-2 text-xs sm:flex-row"
            style={{ color: "var(--text-muted)" }}
          >
            <span>
              <strong>zenbauhaus</strong> · prague
            </span>
            <span className="og-note" title="for the ones who know">
              <em>y4ngyin</em> · <em>tra5her</em> · mc zenbauhaus
            </span>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
