"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, useInView } from "motion/react"
import { useRef } from "react"
import { Navigation } from "@/components/navigation"
import { PageLoader } from "@/components/page-loader"
import { MotionText } from "@/components/motion-text"
import { InkLine } from "@/components/ink-line"
import { useI18n } from "@/lib/i18n/provider"
import { pick, type Localized } from "@/lib/i18n/localize"

interface Series {
  id: string
  title: Localized
  medium: Localized
  home: Localized
  statement: Localized
  cover: string
  images: string[]
}

export default function ArtPage() {
  const { lang } = useI18n()
  const [series, setSeries] = useState<Series[]>([])
  const [loading, setLoading] = useState(true)
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { once: true, amount: 0.05 })

  useEffect(() => {
    let ignore = false
    fetch("/art.json")
      .then((r) => r.json())
      .then((d) => {
        if (!ignore) setSeries(Array.isArray(d) ? d : [])
      })
      .catch(() => {})
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [])

  return (
    <PageLoader>
      <main className="min-h-screen" style={{ background: "var(--surface-dark)" }}>
        <Navigation />

        <section className="section-container pb-10 pt-28 sm:pt-32">
          <header className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <h1
              className="text-[clamp(2.6rem,6vw,5rem)] leading-[0.9]"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
            >
              <MotionText text="art" split="char" from="up" stagger={0.05} className="ink-underline" />
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-md text-base"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}
            >
              {lang === "cs"
                ? "Soubor fotek na cloudu — knížka ve čtrnácti sériích. Povrchy, krajina, divno, rozpad, světlo, plast."
                : lang === "fr"
                ? "« Soubor fotek na cloudu » — un livre en quatorze séries. Surfaces, paysage, étrange, décomposition, lumière, plastique."
                : "Soubor fotek na cloudu — a book in fourteen series. Surfaces, landscape, the weird, decay, light, plastic."}
            </motion.p>
          </header>

          <div className="mb-8" style={{ color: "var(--ink)", opacity: 0.6 }}>
            <InkLine fade={false} thickness={1.2} />
          </div>

          {loading ? (
            <p className="py-20 text-center" style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
              …
            </p>
          ) : (
            <div ref={ref} className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
              {series.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                  animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                  transition={{ type: "spring", stiffness: 170, damping: 24, delay: 0.04 * i }}
                  style={{ position: "relative", zIndex: 36 }}
                >
                  <Link href={`/art/${s.id}`} className="group block">
                    <div className="relative aspect-[4/5] overflow-hidden">
                      {/* Pre-optimized webp from the book; plain img keeps
                          the true aspect without a layout-shift dance. */}
                      <img
                        src={s.cover}
                        alt={pick(s.title, lang)}
                        loading={i < 3 ? "eager" : "lazy"}
                        decoding="async"
                        className="absolute inset-0 size-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.04]"
                      />
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0"
                        style={{ border: "2px solid var(--ink)", filter: "url(#ink-wobble-strong)", zIndex: 2 }}
                      />
                    </div>
                    <div className="mt-3 flex items-baseline justify-between gap-3">
                      <h2
                        className="text-xl sm:text-2xl"
                        style={{ fontFamily: "var(--font-display)", color: "var(--ink)", lineHeight: 1 }}
                      >
                        {pick(s.title, lang).toLowerCase()}
                      </h2>
                      <span className="shrink-0 text-xs" style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
                        {s.images.length}
                      </span>
                    </div>
                    <p
                      className="mt-1 text-sm"
                      style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}
                    >
                      {pick(s.medium, lang)}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          <div className="mt-12 flex flex-wrap gap-4">
            <a href="/artBauer.pdf" target="_blank" rel="noopener noreferrer" className="btn-secondary">
              <span>{lang === "cs" ? "celá kniha (pdf)" : lang === "fr" ? "le livre entier (pdf)" : "the full book (pdf)"}</span>
              <span aria-hidden>↗</span>
            </a>
            <a href="/sketchfab" className="btn-secondary">
              <span>3d</span>
              <span aria-hidden>→</span>
            </a>
            <a href="/reel" className="btn-secondary">
              <span>reel</span>
              <span aria-hidden>→</span>
            </a>
          </div>
        </section>
      </main>
    </PageLoader>
  )
}
