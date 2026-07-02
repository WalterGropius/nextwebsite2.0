"use client"

import { Suspense, useMemo } from "react"
import { Canvas } from "@react-three/fiber"
import { Flowers } from "@/components/canvas/Flowers"
import { getDeviceTier, prefersReducedMotion } from "@/lib/device-tier"

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
  // Classified once on mount — the tier drives resolution, MSAA and the
  // particle budgets inside Flowers so a mid-range phone renders a lighter
  // scene instead of dropping frames on the desktop one.
  const { tier, reducedMotion } = useMemo(
    () => ({ tier: getDeviceTier(), reducedMotion: prefersReducedMotion() }),
    [],
  )
  const dpr: [number, number] =
    tier === "low" ? [0.75, 1] : tier === "mid" ? [1, 1.25] : [1, 1.5]

  return (
    <Canvas
      style={{ backgroundColor: "transparent" }}
      camera={{ position: [0, 0, 5], fov: 60 }}
      className="size-full"
      dpr={dpr}
      performance={{ min: 0.5 }}
      gl={{
        // Splats composite their own soft edges — MSAA is pure cost on
        // weaker GPUs.
        antialias: tier === "high",
        alpha: true,
        powerPreference: "high-performance",
      }}
      frameloop={active && !reducedMotion ? "always" : "demand"}
    >
      <Suspense fallback={null}>
        <Flowers dark={dark} tier={tier} />
      </Suspense>
    </Canvas>
  )
}
