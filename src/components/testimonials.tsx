"use client"

import { motion, useInView } from "motion/react"
import { useRef } from "react"
import { ExternalLink } from "lucide-react"
import { MotionText } from "./motion-text"
import { InkLine } from "./ink-line"

// Real + placeholder client words. The first entry is real (Redbird /
// Colin Stetson). The three that follow are drawn from CV roles as
// stand-ins — swap in the genuine quotes when they land.
type Testimonial = {
  quote: string
  name: string
  role: string
  href?: string
  hrefLabel?: string
  placeholder?: boolean
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Eliáš did an amazing job on our project for Colin Stetson's new album, The Love It Took to Leave You. He took extra care at each step to ensure proper completion — which built trust and faith as a new client. The output was amazing: the animation of the album cover for Apple Motion was clean, simple and impactful, and the AR filter that works with the vinyl cover is a feast for the eyes. The longer we looked at it, the more we liked it. The details coming into frame, subtly and tactfully, show Eli's experience and good eye. We couldn't be happier with the final result and would happily work with him again.",
    name: "Lisa Wells",
    role: "Redbird Music",
    href: "https://www.redbirdmusic.com",
    hrefLabel: "redbirdmusic.com",
  },
  {
    quote:
      "On set he was the calm one. Chrome ball, colour chart, HDRI — documented so cleanly that post never had to call us back. That kind of quiet thoroughness is rarer than it should be.",
    name: "Placeholder",
    role: "Wilma Film",
    placeholder: true,
  },
  {
    quote:
      "He took a vague brief and a small budget and came back with a working MVP and a team that believed in it. We closed the round on the strength of what he'd built.",
    name: "Placeholder",
    role: "Flipas",
    placeholder: true,
  },
  {
    quote:
      "We booked him to talk about spatial computing and he rewired how half the room thought about it. No slides full of buzzwords — just the work, and why it matters.",
    name: "Placeholder",
    role: "CzechVRFest",
    placeholder: true,
  },
]

export function Testimonials() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.15 })

  return (
    <section className="relative py-20 sm:py-32" ref={ref}>
      <div className="section-container">
        <h2
          className="mb-12 text-[clamp(2.4rem,5vw,4.2rem)] leading-[0.92] sm:mb-16"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          <MotionText text="kind" split="word" from="up" />{" "}
          <MotionText
            text="words"
            split="word"
            from="up"
            delay={0.15}
            className="ink-underline"
          />
        </h2>

        <ul className="flex flex-col gap-12 sm:gap-16">
          {TESTIMONIALS.map((tst, i) => (
            <TestimonialCard key={tst.name + i} t={tst} i={i} inView={inView} />
          ))}
        </ul>
      </div>
    </section>
  )
}

function TestimonialCard({
  t,
  i,
  inView,
}: {
  t: Testimonial
  i: number
  inView: boolean
}) {
  // Alternate which side the card hugs so the column reads like a
  // back-and-forth, not a stack. Featured (real) quote is widest.
  const right = i % 2 === 1
  const featured = i === 0

  return (
    <motion.li
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      animate={
        inView
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y: 24, filter: "blur(8px)" }
      }
      transition={{
        type: "spring",
        stiffness: 150,
        damping: 26,
        delay: 0.1 + i * 0.12,
      }}
      className={`w-full ${right ? "sm:self-end" : "sm:self-start"}`}
      style={{ maxWidth: featured ? "100%" : "72%" }}
    >
      <figure
        className="relative p-6 sm:p-8"
        style={{
          border: "1.5px solid var(--ink)",
          filter: "url(#ink-wobble)",
          background: "var(--surface-ink)",
        }}
      >
        <span
          aria-hidden
          className="absolute -top-5 left-4 select-none leading-none sm:-top-7 sm:left-6"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--ink)",
            fontSize: featured ? "3.4rem" : "2.6rem",
            opacity: 0.35,
          }}
        >
          &ldquo;
        </span>

        <blockquote
          className={featured ? "text-base sm:text-lg" : "text-sm sm:text-base"}
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--ink)",
            lineHeight: 1.55,
          }}
        >
          {t.quote}
        </blockquote>

        <figcaption className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span
            className="text-sm sm:text-base"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          >
            {t.name}
          </span>
          <span
            className="text-xs uppercase tracking-[0.3em]"
            style={{ color: "var(--text-muted)" }}
          >
            {t.role}
          </span>
          {t.href && (
            <a
              href={t.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-baseline gap-1.5 text-xs sm:text-sm"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}
            >
              <span className="ink-underline-hover">{t.hrefLabel}</span>
              <ExternalLink size={12} className="ink-icon translate-y-[1px]" />
            </a>
          )}
          {t.placeholder && (
            <span
              className="text-[0.6rem] uppercase tracking-[0.3em]"
              style={{ color: "var(--vermilion)" }}
            >
              placeholder
            </span>
          )}
        </figcaption>
      </figure>
    </motion.li>
  )
}
