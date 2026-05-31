"use client"

// /boids was double-mounting Canvas (Boids.tsx already ships its own
// <Canvas>) which crashed R3F with "Canvas is not part of the THREE
// namespace". Now we just render the scene directly and dress it with
// the site's navigation + a short header.

import dynamic from "next/dynamic"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { PageLoader } from "@/components/page-loader"
import { useI18n } from "@/lib/i18n/provider"

// Boids pulls in three/examples + leva; dynamic import keeps it out
// of the shared bundle and avoids SSR for the WebGL bits.
const Boids = dynamic(() => import("./Boids"), { ssr: false })

export default function BoidsPage() {
  const { t } = useI18n()
  return (
    <PageLoader>
      <main
        className="relative min-h-screen"
        style={{ background: "var(--surface-dark)" }}
      >
        <Navigation />

        <header
          className="section-container relative pb-6 pt-28 sm:pt-32"
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
            <span className="ink-underline-hover">{t("common.back")}</span>
          </Link>
          <h1
            className="text-[clamp(2.4rem,6vw,5rem)] leading-[0.9]"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          >
            boids
          </h1>
          <p
            className="mt-3 max-w-xl text-sm sm:text-base"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-display)",
            }}
          >
            {t("boids.intro")}
          </p>
        </header>

        <div
          className="relative mx-auto w-full"
          style={{
            height: "min(78vh, 720px)",
            border: "1.5px solid var(--ink)",
            filter: "url(#ink-wobble)",
            maxWidth: "min(1400px, 96vw)",
            zIndex: 35,
          }}
        >
          <Boids />
        </div>
      </main>
    </PageLoader>
  )
}
