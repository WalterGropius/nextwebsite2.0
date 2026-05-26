"use client"

import { Suspense, useState, useEffect, useRef } from "react"
import { Canvas } from "@react-three/fiber"
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
import { Flowers } from "@/components/canvas/Flowers"
import { PageLoader } from "@/components/page-loader"
import { MotionPermission } from "@/components/motion-permission"
import { InkLine } from "@/components/ink-line"

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
    if (!canvasRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => setCanvasVisible(entry.isIntersecting),
      { threshold: 0.1 }
    )
    observer.observe(canvasRef.current)
    return () => observer.disconnect()
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
              <Canvas
                style={{ backgroundColor: "transparent" }}
                camera={{ position: [0, 0, 5], fov: 60 }}
                className="size-full"
                dpr={[1, 1.5]}
                performance={{ min: 0.5 }}
                gl={{
                  antialias: true,
                  alpha: true,
                  powerPreference: "high-performance",
                }}
                frameloop={canvasVisible ? "always" : "demand"}
              >
                <Suspense fallback={null}>
                  <Flowers dark={dark} />
                </Suspense>
              </Canvas>
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

        {/* Content */}
        <div
          className="relative z-20"
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
