"use client"

import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { Hero } from "@/components/hero"
import { Manifesto } from "@/components/manifesto"
import { Creations } from "@/components/creations"
import { Arsenal } from "@/components/arsenal"
import { Contact } from "@/components/contact"
import { Navigation } from "@/components/navigation"
import { Scene3D } from "@/components/scene-3d"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 overflow-x-hidden">
      <Navigation />

      {/* Hero Section with 3D Background */}
      <section className="relative h-screen w-full">
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 5], fov: 75 }} className="w-full h-full">
            <Suspense fallback={null}>
              <Scene3D />
            </Suspense>
          </Canvas>
        </div>
        <div className="absolute inset-0 z-10">
          <Hero />
        </div>
      </section>

      {/* Content Sections */}
      <div className="relative z-20 bg-zinc-950">
        <Manifesto />
        <Creations />
        <Arsenal />
        <Contact />
      </div>

      {/* Loading Overlay */}
      <Suspense fallback={<LoadingSpinner />}>
        <div />
      </Suspense>
    </div>
  )
}
