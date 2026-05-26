"use client"

import { useRef } from "react"
import {
  motion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react"
import { Github, Linkedin, Instagram, Music } from "lucide-react"
import { MotionText } from "./motion-text"
import { InkLine } from "./ink-line"
import { ContactRadar } from "./contact-radar"
import { useT } from "@/lib/i18n/provider"

const socials = [
  { key: "contact.social.github", href: "https://github.com/WalterGropius", icon: Github },
  { key: "contact.social.linkedin", href: "https://linkedin.com/in/zenbauhaus", icon: Linkedin },
  { key: "contact.social.instagram", href: "https://instagram.com/y4ngyin", icon: Instagram },
  { key: "contact.social.soundcloud", href: "https://soundcloud.com/mczenbauhaus", icon: Music },
]

export function Contact() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  const t = useT()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const smooth = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 22,
    mass: 0.5,
  })
  // Email grows as you reach it then drifts upward. The status pill
  // crawls in slow from the left. The line stretches across the page.
  const emailY = useTransform(smooth, [0, 0.5, 1], [120, 0, -60])
  const emailScale = useTransform(smooth, [0, 0.5, 1], [0.92, 1.02, 0.98])
  const statusX = useTransform(smooth, [0, 0.5, 1], [-30, 0, 20])
  const lineScale = useTransform(smooth, [0.2, 0.6], [0.4, 1.05])
  const socialsY = useTransform(smooth, [0, 1], [60, -20])

  return (
    <section id="contact" className="relative py-28 sm:py-40" ref={ref}>
      <div className="section-container">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.7 }}
            className="mb-8 inline-flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.35em]"
            style={{ color: "var(--text-muted)", x: statusX }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-600" />
            </span>
            <span>{t("contact.status")}</span>
          </motion.div>

          <motion.h2
            className="text-[clamp(2rem,7vw,5.5rem)] leading-[0.95]"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--ink)",
              letterSpacing: "-0.01em",
              y: emailY,
              scale: emailScale,
              transformOrigin: "0 50%",
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
          </motion.h2>

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
            {t("contact.body.0")} <strong>{t("contact.body.ai")}</strong>
            {t("contact.body.1")} <strong>{t("contact.body.spatial")}</strong>
            {t("contact.body.2")} <em>{t("contact.body.zero")}</em>{" "}
            {t("contact.body.3")}{" "}
            <span className="humph">{t("contact.body.tag")}</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 0.6 } : { opacity: 0 }}
            transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="my-14 origin-left"
            style={{ color: "var(--ink)", scaleX: lineScale }}
          >
            <InkLine fade={false} thickness={1.2} />
          </motion.div>

          {/* radar contact game — play on the word "contact": tag a
              blip as the sweep passes it to score. */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.9, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="my-16"
          >
            <ContactRadar />
          </motion.div>

          <motion.div
            className="flex flex-wrap items-center gap-x-6 gap-y-3"
            style={{ y: socialsY }}
          >
            {socials.map((s, i) => (
              <motion.a
                key={s.key}
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
                <span className="ink-underline">{t(s.key)}</span>
              </motion.a>
            ))}
          </motion.div>

          <div
            className="mt-20 flex flex-col items-baseline justify-between gap-2 text-xs sm:flex-row"
            style={{ color: "var(--text-muted)" }}
          >
            <span>
              <strong>{t("contact.footer.brand")}</strong> * {t("contact.footer.city")}
            </span>
            <span className="og-note" title={t("contact.footer.og")}>
              <em>y4ngyin</em> * <em>tra5her</em> * mc zenbauhaus
            </span>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
