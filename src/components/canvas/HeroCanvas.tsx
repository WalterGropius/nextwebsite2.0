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

// Per-tier dpr floor / baseline / boost ceiling. The ladder starts at
// the baseline and walks in BOTH directions from measured fps: down to
// the floor when frames sag, up toward the boost ceiling when the
// device proves it has headroom (the ceiling is additionally capped by
// the screen's real devicePixelRatio — no point rendering pixels the
// panel can't show). MSAA stays off everywhere per Spark's guidance —
// splats composite their own soft edges, so the budget goes to
// resolution instead.
const DPR_STOPS: Record<string, { floor: number; base: number; boost: number }> = {
  low: { floor: 0.6, base: 1, boost: 1.25 },
  mid: { floor: 0.75, base: 1.25, boost: 1.75 },
  high: { floor: 0.85, base: 1.5, boost: 2.25 },
}

// Ladder steps: -4 (survival) … 0 (baseline) … +3 (overdrive).
const LEVEL_MIN = -4
const LEVEL_MAX = 3

// HeroCanvas — the landing-page splat background, isolated into its own
// module so the landing page can pull it in with `next/dynamic`
// ({ ssr: false }). That keeps Three.js, the fiber reconciler, and the
// splat loader out of the initial JS bundle: they only download once the
// hero actually mounts, which slashes First Load JS and main-thread
// blocking on the most-visited route.
//
// Runtime quality is symmetric around the static device tier:
//   decline → dpr down, stars thin, and (Spark 2 LoD, non-high tiers)
//             the splat itself renders a downsampled set
//   incline → dpr climbs past the baseline toward the panel's true
//             pixel ratio and the star field overdrives a touch
//   sustained misery → freeze the frameloop; a still splat beats a
//             15fps slideshow.
export default function HeroCanvas({
  dark,
  active,
}: {
  dark: boolean
  active: boolean
}) {
  const { tier, reducedMotion, hud, deviceDpr } = useMemo(
    () => ({
      tier: getDeviceTier(),
      reducedMotion: prefersReducedMotion(),
      hud: perfHudEnabled(),
      deviceDpr:
        typeof window === "undefined" ? 1 : window.devicePixelRatio || 1,
    }),
    [],
  )
  const stops = DPR_STOPS[tier]
  const [level, setLevel] = useState(0)
  // Set when the monitor gives up: render on demand only.
  const [frozen, setFrozen] = useState(false)

  // Derive every knob from the single ladder position.
  const dpr = Math.min(
    level >= 0
      ? stops.base + (level / LEVEL_MAX) * (stops.boost - stops.base)
      : stops.base + (level / -LEVEL_MIN) * (stops.floor - stops.base),
    deviceDpr,
  )
  const quality =
    level >= 0
      ? 1 + level * 0.12 // up to 1.36× stars on proven-fast machines
      : Math.max(0.3, 1 + level * 0.175)

  const running = active && !reducedMotion && !frozen

  return (
    <Canvas
      style={{ backgroundColor: "transparent" }}
      camera={{ position: [0, 0, 5], fov: 60 }}
      className="size-full"
      dpr={dpr}
      performance={{ min: 0.5 }}
      gl={{
        // Spark composites its own soft splat edges and explicitly
        // recommends antialias: false — MSAA was pure cost even on
        // strong GPUs. The saved budget funds the dpr boost instead.
        antialias: false,
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
        // Incline threshold tracks the panel's refresh rate so 60Hz
        // screens (which can never exceed ~60fps) can still climb.
        bounds={(hz) => [40, Math.min(Math.max(hz - 6, 50), 90)]}
        onDecline={() => setLevel((l) => Math.max(LEVEL_MIN, l - 1))}
        onIncline={() => setLevel((l) => Math.min(LEVEL_MAX, l + 1))}
        flipflops={4}
        onFallback={() => {
          setLevel(LEVEL_MIN)
          setFrozen(true)
        }}
      >
        <Suspense fallback={null}>
          <Flowers dark={dark} tier={tier} quality={quality} />
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
