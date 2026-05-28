"use client"

import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { Flowers } from "@/components/canvas/Flowers"

// HeroCanvas — the landing-page splat background, isolated into its own
// module so the landing page can pull it in with `next/dynamic`
// ({ ssr: false }). That keeps Three.js, the fiber reconciler, and the
// splat loader out of the initial JS bundle: they only download once the
// hero actually mounts, which slashes First Load JS and main-thread
// blocking on the most-visited route.
export default function HeroCanvas({
  dark,
  active,
}: {
  dark: boolean
  active: boolean
}) {
  return (
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
      frameloop={active ? "always" : "demand"}
    >
      <Suspense fallback={null}>
        <Flowers dark={dark} />
      </Suspense>
    </Canvas>
  )
}
