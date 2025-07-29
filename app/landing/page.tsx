"use client"

import { Suspense, useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { Hero } from "@/components/hero"
import { Manifesto } from "@/components/manifesto"
import { Creations } from "@/components/creations"
import { Arsenal } from "@/components/arsenal"
import { Contact } from "@/components/contact"
import { Navigation } from "@/components/navigation"
import Flowers from "@/components/canvas/Flowers"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function Home() {
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-gray-100">
      <Navigation />

      {/* Hero Section with Optimized 3D Background */}
      <section className="relative h-screen w-full">
        <div className="absolute inset-0 z-0" suppressHydrationWarning>
          {mounted ? (
            <Canvas
              camera={{ position: [0, 0, 5], fov: 75 }}
              className="size-full bg-gradient-to-br from-gray-900 via-black to-gray-800"
              dpr={[1, 2]}
              performance={{ min: 0.5 }}
              gl={{
                antialias: true,
                alpha: false,
                powerPreference: "high-performance"
              }}
            >
              <Suspense fallback={null}>
                <Flowers />
              </Suspense>
            </Canvas>
          ) : (
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-900 via-black to-gray-800" />
          )}
        </div>

        <div className="absolute inset-0 z-10">
          <Hero />
        </div>
      </section>

      {/* Content Sections with improved performance */}
      <div className="relative z-20 bg-white">
        <Suspense fallback={<LoadingSpinner />}>
          <Manifesto />
        </Suspense>

        <Suspense fallback={<LoadingSpinner />}>
          <Creations />
        </Suspense>

        <Suspense fallback={<LoadingSpinner />}>
          <Arsenal />
        </Suspense>

        <Suspense fallback={<LoadingSpinner />}>
          <Contact />
        </Suspense>
      </div>
    </main>
  )
}
