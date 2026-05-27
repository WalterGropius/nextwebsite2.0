"use client"

import { type ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { PageLoader } from "@/components/page-loader"
import { InkLine } from "@/components/ink-line"

// GameShell — the small frame every eye-trainer page sits in. Pulls
// in the site nav, the surface bg, a back-to-/more link, a title and
// a short blurb. The game itself goes in `children`.
export function GameShell({
  title,
  blurb,
  children,
}: {
  title: string
  blurb: string
  children: ReactNode
}) {
  return (
    <PageLoader>
      <main
        className="relative min-h-screen"
        style={{ background: "var(--surface-dark)" }}
      >
        <Navigation />

        <section
          className="section-container relative pb-16 pt-28 sm:pt-32"
          style={{ zIndex: 35 }}
        >
          <Link
            href="/more"
            className="mb-6 inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em]"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-display)",
            }}
          >
            <ArrowLeft size={14} className="ink-icon" />
            <span className="ink-underline-hover">more</span>
          </Link>

          <h1
            className="text-[clamp(2.4rem,6vw,5rem)] leading-[0.9]"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          >
            {title}
          </h1>
          <p
            className="mt-3 max-w-2xl text-sm sm:text-base"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-display)",
            }}
          >
            {blurb}
          </p>

          <div className="mt-8 mb-8 opacity-50" style={{ color: "var(--ink)" }}>
            <InkLine fade={false} thickness={1.2} />
          </div>

          {children}
        </section>
      </main>
    </PageLoader>
  )
}
