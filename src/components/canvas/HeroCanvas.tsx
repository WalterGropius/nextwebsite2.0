"use client"

import { Suspense, lazy, useMemo, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { PerformanceMonitor } from "@react-three/drei"
import { Flowers } from "@/components/canvas/Flowers"
import { getDeviceTier, prefersReducedMotion } from "@/lib/device-tier"
import { perfHudEnabled } from "@/lib/perf"

// r3f-perf is a dev/inspection tool — it only ever loads when the page
// is opened with ?perf, so it costs the ordinary visitor zero bytes.
const Perf = lazy(() => import("r3f-perf").then((m) => ({ default: m.Perf })))

// Per-tier dpr ceiling/floor. The PerformanceMonitor walks between them
// at runtime, so a device that *claims* to be high-tier but renders the
// splat at 20fps still ends up on a cheap frame.
const DPR_RANGE: Record<string, [number, number]> = {
  low: [0.6, 1],
  mid: [0.75, 1.25],
  high: [0.85, 1.5],
}

// HeroCanvas — the landing-page splat background, isolated into its own
// module so the landing page can pull it in with `next/dynamic`
// ({ ssr: false }). That keeps Three.js, the fiber reconciler, and the
// splat loader out of the initial JS bundle: they only download once the
// hero actually mounts, which slashes First Load JS and main-thread
// blocking on the most-visited route.
//
// Runtime quality is adaptive on top of the static device tier:
//   PerformanceMonitor watches real fps →
//     decline: step dpr down, thin the star layers
//     incline: step back up toward the tier ceiling
//     fallback (sustained misery): freeze the frameloop entirely —
//       the splat becomes a still image, which beats a 15fps slideshow.
export default function HeroCanvas({
  dark,
  active,
}: {
  dark: boolean
  active: boolean
}) {
  // Classified once on mount — the tier picks the starting resolution,
  // MSAA and particle budgets; the monitor below refines from there.
  const { tier, reducedMotion, hud } = useMemo(
    () => ({
      tier: getDeviceTier(),
      reducedMotion: prefersReducedMotion(),
      hud: perfHudEnabled(),
    }),
    [],
  )
  const [dprMin, dprMax] = DPR_RANGE[tier]
  const [dpr, setDpr] = useState(dprMax)
  // 1 → full star budget, stepped down when frames drop.
  const [starScale, setStarScale] = useState(1)
  // Set when the monitor gives up: render on demand only.
  const [frozen, setFrozen] = useState(false)

  const running = active && !reducedMotion && !frozen

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
      frameloop={running ? "always" : "demand"}
    >
      <PerformanceMonitor
        // Only judge frames while we are actually animating — a paused
        // (demand) canvas produces no frames and would read as 0fps.
        ms={running ? 250 : 1e9}
        iterations={8}
        bounds={() => [40, 60]}
        onDecline={() => {
          setDpr((d) => Math.max(dprMin, +(d - 0.2).toFixed(2)))
          setStarScale((s) => Math.max(0.35, +(s - 0.25).toFixed(2)))
        }}
        onIncline={() => {
          setDpr((d) => Math.min(dprMax, +(d + 0.15).toFixed(2)))
          setStarScale((s) => Math.min(1, +(s + 0.15).toFixed(2)))
        }}
        flipflops={4}
        onFallback={() => {
          // Still losing after four decline/incline cycles: stop paying
          // per-frame at all. The captured splat reads perfectly as a
          // still; parallax quietly turns off.
          setDpr(dprMin)
          setStarScale(0.3)
          setFrozen(true)
        }}
      >
        <Suspense fallback={null}>
          <Flowers dark={dark} tier={tier} starScale={starScale} />
        </Suspense>
      </PerformanceMonitor>
      {hud && (
        <Suspense fallback={null}>
          <Perf position="bottom-left" minimal={tier !== "high"} />
        </Suspense>
      )}
    </Canvas>
  )
}
