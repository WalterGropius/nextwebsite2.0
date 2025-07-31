"use client"

import { Suspense, useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { Hero } from "@/components/hero"
import { Manifesto } from "@/components/manifesto"
import { Creations } from "@/components/creations"
import { Arsenal } from "@/components/arsenal"
import { Philosophy } from "@/components/philosophy"
import { Contact } from "@/components/contact"
import { Navigation } from "@/components/navigation"
import { Flowers } from "@/components/canvas/Flowers"
import { LoadingSpinner } from "@/components/loading-spinner"
import { SketchfabEmbed } from "@/components/sketchfab-embed"
import { PerformanceDebugger } from "@/components/performance-debugger"
import { PerformanceAnalysis } from "@/components/performance-analysis"
import { PageLoader } from "@/components/page-loader"

export default function Home() {
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <PageLoader>
      <main className="min-h-screen overflow-x-hidden text-gray-100">
        <Navigation />

        {/* Hero Section with Optimized 3D Background */}
        <section className="relative h-screen w-full bg-[#f2f2f2]">
          <div className="absolute inset-0 z-0" suppressHydrationWarning>
            {mounted ? (
              <Canvas
                style={{ backgroundColor: "transparent" }}
                camera={{ position: [0, 0, 5], fov: 75 }}
                className="size-full"
                dpr={[1, 2]}
                performance={{ min: 0.5 }}
                gl={{
                  antialias: true,
                  alpha: true,
                  powerPreference: "high-performance"
                }}
              >

                <Flowers />
              </Canvas>
            ) : (
              <div className="absolute inset-0 z-0" />
            )}
          </div>

          <div className="absolute inset-0 z-10">
            <Hero />
          </div>
        </section>
        <div className="relative z-20 bg-blue">
          <Manifesto />
          <Philosophy />
          <Creations randomCount={6} />
          <Arsenal />
        </div>
      </main>
    </PageLoader>
  )
}
