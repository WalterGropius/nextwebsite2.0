"use client"

import { motion, useInView } from "motion/react"
import { useRef } from "react"
import { ExternalLink } from "lucide-react"
import { MotionText } from "./motion-text"
import { InkLine } from "./ink-line"
import { useI18n } from "@/lib/i18n/provider"

// Real client words only — no stand-ins. One genuine quote beats three
// invented ones; more get added here as they land. Quotes are
// hand-translated per language (en/cs/fr) and fall back to en.
type Localized = { en: string; cs: string; fr: string }
type Testimonial = {
  quote: Localized
  name: string
  role: string
  href?: string
  hrefLabel?: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: {
      en: "Eliáš did an amazing job on our project for Colin Stetson's new album, The Love It Took to Leave You. He took extra care at each step to ensure proper completion — which built trust and faith as a new client. The output was amazing: the animation of the album cover for Apple Motion was clean, simple and impactful, and the AR filter that works with the vinyl cover is a feast for the eyes. The longer we looked at it, the more we liked it. The details coming into frame, subtly and tactfully, show Eli's experience and good eye. We couldn't be happier with the final result and would happily work with him again.",
      cs: "Eliáš odvedl na našem projektu pro nové album Colina Stetsona, The Love It Took to Leave You, skvělou práci. V každém kroku si dal záležet, aby bylo všechno dotažené — a jako u nového klienta tím postupně získal naši důvěru. Výsledek byl výborný: animace obalu v Apple Motion byla čistá, jednoduchá a úderná a AR filtr na vinylovém obalu je pastva pro oči. Čím déle jsme se na to dívali, tím víc se nám to líbilo. Detaily, které do záběru přicházejí citlivě a nenápadně, prozrazují Eliho zkušenost a dobré oko. S výsledkem jsme maximálně spokojení a kdykoli si ho najmeme znovu.",
      fr: "Eliáš a fait un travail formidable sur notre projet pour le nouvel album de Colin Stetson, The Love It Took to Leave You. Il a soigné chaque étape pour que tout soit bien abouti — ce qui, en tant que nouveau client, nous a peu à peu mis en confiance. Le résultat était superbe : l'animation de la pochette dans Apple Motion était nette, simple et percutante, et le filtre AR qui accompagne la pochette vinyle est un régal pour les yeux. Plus on le regardait, plus on l'aimait. Les détails qui entrent dans le cadre, avec finesse et tact, trahissent l'expérience et le bon œil d'Eli. On ne pourrait être plus satisfaits du résultat et on retravaillerait avec lui sans hésiter.",
    },
    name: "Lisa Wells",
    role: "Redbird Music",
    href: "https://www.redbirdmusic.com",
    hrefLabel: "redbirdmusic.com",
  },
]

export function Testimonials({ embedded = false }: { embedded?: boolean }) {
  // embedded — rendered inside an existing section-container (the CV
  // article): skip the outer container and the landing-scale heading.
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.15 })
  const { t, lang } = useI18n()

  const inner = (
    <>
      <h2
        className={
          embedded
            ? "mb-10 text-3xl sm:text-4xl"
            : "mb-12 text-[clamp(2.4rem,5vw,4.2rem)] leading-[0.92] sm:mb-16"
        }
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        {embedded ? (
          <span className="ink-underline">
            {t("testimonials.title.0")} {t("testimonials.title.1")}
          </span>
        ) : (
          <>
            <MotionText
              key={`tt0-${lang}`}
              text={t("testimonials.title.0")}
              split="word"
              from="up"
            />{" "}
            <MotionText
              key={`tt1-${lang}`}
              text={t("testimonials.title.1")}
              split="word"
              from="up"
              delay={0.15}
              className="ink-underline"
            />
          </>
        )}
      </h2>

      <ul className="flex flex-col gap-12 sm:gap-16">
        {TESTIMONIALS.map((tst, i) => (
          <TestimonialCard
            key={tst.name + i}
            t={tst}
            i={i}
            inView={inView}
            lang={lang}
          />
        ))}
      </ul>
    </>
  )

  if (embedded) {
    return (
      <section className="relative" ref={ref}>
        {inner}
      </section>
    )
  }

  return (
    <section className="relative py-20 sm:py-32" ref={ref}>
      <div className="section-container">{inner}</div>
    </section>
  )
}

function TestimonialCard({
  t,
  i,
  inView,
  lang,
}: {
  t: Testimonial
  i: number
  inView: boolean
  lang: string
}) {
  const quote =
    (t.quote as Record<string, string>)[lang] ?? t.quote.en
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
          {quote}
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
        </figcaption>
      </figure>
    </motion.li>
  )
}
