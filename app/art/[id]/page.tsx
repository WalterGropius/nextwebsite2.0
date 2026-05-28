"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { motion } from "motion/react"
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { PageLoader } from "@/components/page-loader"
import { InkLine } from "@/components/ink-line"
import { useI18n } from "@/lib/i18n/provider"
import { pick, type Localized } from "@/lib/i18n/localize"

interface SeriesLink {
  label: Localized
  href: string
}
interface Series {
  id: string
  title: Localized
  medium: Localized
  home: Localized
  statement: Localized
  cover: string
  images: string[]
  links?: SeriesLink[]
}

export default function ArtSeriesPage() {
  const { lang } = useI18n()
  const params = useParams()
  const id = String(params?.id ?? "")
  const [all, setAll] = useState<Series[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    fetch("/art.json")
      .then((r) => r.json())
      .then((d) => {
        if (!ignore) setAll(Array.isArray(d) ? d : [])
      })
      .catch(() => {})
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [])

  const index = all.findIndex((s) => s.id === id)
  const series = index >= 0 ? all[index] : null
  const next = all.length ? all[(index + 1) % all.length] : null

  return (
    <PageLoader>
      <main className="min-h-screen" style={{ background: "var(--surface-dark)" }}>
        <Navigation />

        <article className="section-container pb-24 pt-28 sm:pt-32" style={{ position: "relative", zIndex: 35 }}>
          <Link
            href="/art"
            className="mb-8 inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em]"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}
          >
            <ArrowLeft size={14} className="ink-icon" />
            <span className="ink-underline-hover">art</span>
          </Link>

          {loading ? (
            <p className="py-20" style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>…</p>
          ) : !series ? (
            <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
              {lang === "cs" ? "série nenalezena." : lang === "fr" ? "série introuvable." : "series not found."}
            </p>
          ) : (
            <>
              <header className="mb-8">
                <div className="mb-2 text-xs uppercase tracking-[0.3em]" style={{ color: "var(--text-muted)" }}>
                  {pick(series.medium, lang)} · {pick(series.home, lang)}
                </div>
                <h1
                  className="text-[clamp(2.4rem,6vw,4.6rem)] leading-[0.92]"
                  style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
                >
                  {pick(series.title, lang)}
                </h1>
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-6 max-w-3xl text-lg sm:text-xl"
                  style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)", lineHeight: 1.55 }}
                >
                  {pick(series.statement, lang)}
                </motion.p>

                {series.links && series.links.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-4">
                    {series.links.map((l) => (
                      <a
                        key={l.href}
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-baseline gap-2"
                        style={{ color: "var(--ink)", fontFamily: "var(--font-display)" }}
                      >
                        <span className="ink-underline-hover">{pick(l.label, lang)}</span>
                        <ExternalLink size={13} className="ink-icon" />
                      </a>
                    ))}
                  </div>
                )}
              </header>

              <div className="my-8 opacity-50" style={{ color: "var(--ink)" }}>
                <InkLine fade={false} thickness={1.2} />
              </div>

              {/* Image gallery — true aspect, single column on phones,
                  two up on wider screens. The book is the content. */}
              <div className="columns-1 gap-5 sm:columns-2 [&>figure]:mb-5">
                {series.images.map((src, i) => (
                  <figure key={src} className="relative break-inside-avoid overflow-hidden" style={{ zIndex: 35 }}>
                    <img
                      src={src}
                      alt={`${pick(series.title, lang)} — ${i + 1}`}
                      loading={i < 2 ? "eager" : "lazy"}
                      decoding="async"
                      className="block w-full"
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0"
                      style={{ border: "1.5px solid var(--ink)", filter: "url(#ink-wobble)" }}
                    />
                  </figure>
                ))}
              </div>

              {next && next.id !== series.id && (
                <div className="mt-16 flex justify-end">
                  <Link
                    href={`/art/${next.id}`}
                    className="group inline-flex items-baseline gap-3 text-right"
                    style={{ color: "var(--ink)", fontFamily: "var(--font-display)" }}
                  >
                    <span className="text-xs uppercase tracking-[0.3em]" style={{ color: "var(--text-muted)" }}>
                      {lang === "cs" ? "další" : lang === "fr" ? "suivant" : "next"}
                    </span>
                    <span className="text-xl sm:text-2xl">
                      <span className="ink-underline-hover">{pick(next.title, lang).toLowerCase()}</span>
                    </span>
                    <ArrowRight size={16} className="ink-icon" />
                  </Link>
                </div>
              )}
            </>
          )}
        </article>
      </main>
    </PageLoader>
  )
}
