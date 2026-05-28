"use client"

import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { useTheme } from "next-themes"
import { Hero } from "@/components/hero"
import { Manifesto } from "@/components/manifesto"
import { Arsenal } from "@/components/arsenal"
import { Philosophy } from "@/components/philosophy"
import { Contact } from "@/components/contact"
import { Creations } from "@/components/creations"
import { Highlights } from "@/components/highlights"
import { ScrollToTop } from "@/components/scroll-to-top"
import { Navigation } from "@/components/navigation"
import { PageLoader } from "@/components/page-loader"
import { MotionPermission } from "@/components/motion-permission"
import { InkLine } from "@/components/ink-line"

// Three.js + the splat loader are pulled in only after the page mounts,
// so they stay out of the initial JS bundle for the landing route.
const HeroCanvas = dynamic(() => import("@/components/canvas/HeroCanvas"), {
  ssr: false,
})

function Divider() {
  return (
    <div
      className="mx-auto w-full max-w-3xl px-6 opacity-40"
      style={{ color: "var(--ink)" }}
    >
      <InkLine fade thickness={1} />
    </div>
  )
}

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [canvasVisible, setCanvasVisible] = useState(true)
  const canvasRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  const dark = mounted && resolvedTheme === "dark"

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Pause R3F's render loop once the user has scrolled past the
    // first third of the hero canvas. The Three.js scene stays
    // mounted (snapping back up resumes it instantly) but the GPU
    // and main-thread cost drops to zero, leaving headroom for the
    // Framer Motion scroll animations on the content below.
    let raf = 0
    const update = () => {
      raf = 0
      const el = canvasRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const threshold = rect.height / 3
      setCanvasVisible(-rect.top < threshold)
    }
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [mounted])

  return (
    <PageLoader>
      <main className="min-h-screen overflow-x-hidden">
        <Navigation />
        {/* Hero with 3D splat background. The section lifts above the
            global paper backdrop (z-30) and carries an opaque
            surface-dark fill so the millimeter grid does not bleed
            through the transparent 3D canvas. */}
        <section
          className="relative z-[40] min-h-screen w-full"
          style={{ background: "var(--surface-dark)" }}
        >
          <div
            ref={canvasRef}
            className="absolute inset-0 z-0"
            suppressHydrationWarning
          >
            {mounted ? (
              <HeroCanvas dark={dark} active={canvasVisible} />
            ) : null}
          </div>

          {/* Gradient overlay fading hero into the page */}
          <div
            className="pointer-events-none absolute inset-0 z-[1]"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, transparent 65%, var(--surface-dark) 100%)",
            }}
          />

          <div className="absolute inset-0 z-10">
            <Hero />
          </div>
        </section>

        {/* Content. `relative` only — no z-index — so this div is
            *not* a stacking context. Children with their own
            z-index resolve in the document root, which lets the
            project cards (z-36) sit above the paper grid (z-30)
            without dragging every text section along with them. */}
        <div
          className="relative"
          style={{ background: "var(--surface-dark)" }}
        >
          <div
            className="pointer-events-none absolute -top-40 left-0 right-0 h-40"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, var(--surface-dark) 100%)",
            }}
          />

          <Manifesto />
          <Divider />
          <Highlights />
          <Divider />
          <Philosophy />
          <Divider />
          <Arsenal />
          <Divider />
          <Creations randomCount={6} />
          <Divider />
          <Contact />
        </div>

        <ScrollToTop />
        <MotionPermission />
      </main>
    </PageLoader>
  )
}
