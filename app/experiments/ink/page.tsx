"use client"

// Ink — a fluid ink-wash toy built on vgpu (Vercel Labs' typed-WGSL
// WebGPU library). Two ping-pong fields — velocity and dye — advected
// semi-Lagrangian style by fragment passes, stirred by the pointer,
// fed by slow ambient drops while idle, and composited over the site's
// paper backdrop in the theme's --ink colour.
//
// WebGPU-only by design: /experiments/flow carries the
// everyone-gets-something story (three TSL with a WebGL 2 fallback);
// this page is the lab piece for the newest pipeline. Browsers without
// WebGPU get a graceful card, same as flow used to.

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { PageLoader } from "@/components/page-loader"
import { getDeviceTier } from "@/lib/device-tier"
import { VEL_WGSL, DYE_WGSL, COMPOSITE_WGSL } from "./shaders"
import { perfHudEnabled } from "@/lib/perf"

type Stage = "probing" | "running" | "unsupported" | "error"

// Simulation grid height per device tier; width follows the canvas
// aspect. Fragment-pass fluid at these sizes is cheap even on phones
// that do have WebGPU.
const SIM_H: Record<string, number> = { low: 160, mid: 224, high: 320 }

// Read the theme's ink colour (Zenhand-dark in light mode, warm amber
// in dark mode) as 0..1 rgb.
function readInkColor(): [number, number, number] {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--ink")
    .trim()
  const m = raw.match(/^#?([0-9a-f]{6})$/i)
  if (!m) return [0.1, 0.11, 0.16]
  const n = parseInt(m[1], 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

export default function InkPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const pointer = useRef({ x: 0.5, y: 0.5, vx: 0, vy: 0, active: 0, lastT: 0 })
  const [stage, setStage] = useState<Stage>("probing")
  const [reason, setReason] = useState("")
  const [fps, setFps] = useState(0)
  const hud = useRef(false)

  useEffect(() => {
    hud.current = perfHudEnabled()
    let cancelled = false
    let cleanup: (() => void) | null = null
    ;(async () => {
      // navigator.gpu existing does not guarantee an adapter (headless
      // browsers, blocklisted GPUs) — probe before committing, so those
      // visitors get the friendly card instead of an error.
      const nav = navigator as Navigator & {
        gpu?: { requestAdapter?: () => Promise<unknown> }
      }
      if (!nav.gpu?.requestAdapter) {
        setStage("unsupported")
        return
      }
      try {
        const adapter = await nav.gpu.requestAdapter().catch(() => null)
        if (cancelled) return
        if (!adapter) {
          setStage("unsupported")
          return
        }
        const { init, effect, surface, target, sampler, frameLoop } =
          await import("vgpu")
        if (cancelled) return

        const canvas = canvasRef.current
        const wrap = wrapRef.current
        if (!canvas || !wrap) return

        const gpu = await init()
        if (cancelled) {
          gpu.dispose?.()
          return
        }

        // A lost device (driver reset, tab backgrounded too hard,
        // software adapters giving up) would otherwise leave a frozen
        // dish — surface it as the friendly card instead.
        // eslint-disable-next-line
        ;(gpu as any).device?.lost?.then((info: { message?: string }) => {
          if (!cancelled) {
            setReason(info?.message || "the gpu device was lost")
            setStage("error")
          }
        })

        const canvasSurface = surface(gpu, canvas, { dpr: [1, 2] })

        // Simulation grid — height by tier, width by canvas aspect.
        const tier = getDeviceTier()
        const rect = wrap.getBoundingClientRect()
        const aspect = Math.max(0.5, rect.width / Math.max(1, rect.height))
        const simH = SIM_H[tier]
        const simW = Math.min(768, Math.round(simH * aspect))

        const mkPair = () =>
          [
            target(gpu, { size: [simW, simH], format: "rgba16float" }),
            target(gpu, { size: [simW, simH], format: "rgba16float" }),
          ] as const
        const vel = { t: mkPair(), i: 0 }
        const dye = { t: mkPair(), i: 0 }

        // clamp-to-edge is the WebGPU default address mode — exactly
        // what a dish of ink wants at its walls.
        const linear = sampler(gpu, { minFilter: "linear", magFilter: "linear" })

        const velFx = effect(gpu, VEL_WGSL, {
          set: {
            params: {
              dt: 0.016,
              time: 0,
              decay: 0.985,
              noiseAmp: 1.1,
              pointer: [0.5, 0.5],
              pointerVel: [0, 0],
              pointerActive: 0,
              aspect,
            },
            src: vel.t[0],
            samp: linear,
          },
        })
        const dyeFx = effect(gpu, DYE_WGSL, {
          set: {
            params: {
              dt: 0.016,
              dissipation: 0.995,
              pointer: [0.5, 0.5],
              pointerActive: 0,
              aspect,
              drop: [0.5, 0.35],
              dropAge: 0,
            },
            vel: vel.t[0],
            dye: dye.t[0],
            samp: linear,
          },
        })
        const compositeFx = effect(gpu, COMPOSITE_WGSL, {
          set: {
            params: {
              inkColor: readInkColor(),
              texel: [1 / simW, 1 / simH],
            },
            dye: dye.t[0],
            samp: linear,
          },
        })

        // Track theme switches so the ink re-dyes itself.
        const themeObserver = new MutationObserver(() => {
          compositeFx.set({ params: { inkColor: readInkColor() } })
        })
        themeObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["class"],
        })

        // Pointer → uv space (top-origin, matching vgpu's uv varying).
        const setPointer = (clientX: number, clientY: number) => {
          const r = wrap.getBoundingClientRect()
          const x = (clientX - r.left) / r.width
          const y = (clientY - r.top) / r.height
          const now = performance.now()
          const p = pointer.current
          const dt = Math.max(1, now - (p.lastT || now)) / 1000
          p.vx = Math.max(-3, Math.min(3, (x - p.x) / dt * 0.08))
          p.vy = Math.max(-3, Math.min(3, (y - p.y) / dt * 0.08))
          p.x = x
          p.y = y
          p.active = 1
          p.lastT = now
        }
        const onMove = (e: PointerEvent) => setPointer(e.clientX, e.clientY)
        const onTouch = (e: TouchEvent) => {
          if (e.touches[0]) setPointer(e.touches[0].clientX, e.touches[0].clientY)
        }
        const onLeave = () => {
          pointer.current.active = 0
        }
        wrap.addEventListener("pointermove", onMove)
        wrap.addEventListener("touchmove", onTouch, { passive: true })
        wrap.addEventListener("pointerleave", onLeave)
        wrap.addEventListener("touchend", onLeave)

        // Ambient drops while idle — the dish stays alive untouched.
        let drop = { x: 0.3 + Math.random() * 0.4, y: 0.25 + Math.random() * 0.5, born: 0 }
        let lastInteraction = 0

        setStage("running")

        let elapsed = 0
        let last = performance.now()
        let frames = 0
        let fpsStart = last
        const loop = frameLoop(gpu, (frame) => {
          const now = performance.now()
          const dt = Math.min(0.033, (now - last) / 1000)
          last = now
          elapsed += dt
          const p = pointer.current
          if (p.active) lastInteraction = elapsed
          // spawn a new drop every few idle seconds
          if (elapsed - lastInteraction > 2.5 && elapsed - drop.born > 3.5) {
            drop = {
              x: 0.15 + Math.random() * 0.7,
              y: 0.15 + Math.random() * 0.7,
              born: elapsed,
            }
          }

          // --- velocity ping-pong
          const vRead = vel.t[vel.i]
          const vWrite = vel.t[1 - vel.i]
          velFx.set({
            params: {
              dt,
              time: elapsed,
              pointer: [p.x, p.y],
              pointerVel: [p.vx, p.vy],
              pointerActive: p.active,
            },
            src: vRead,
          })
          frame.pass({ target: vWrite, clear: false }, (pass) => pass.draw(velFx))
          vel.i = 1 - vel.i

          // --- dye ping-pong
          const dRead = dye.t[dye.i]
          const dWrite = dye.t[1 - dye.i]
          dyeFx.set({
            params: {
              dt,
              pointer: [p.x, p.y],
              pointerActive: p.active,
              drop: [drop.x, drop.y],
              dropAge: elapsed - drop.born,
            },
            vel: vWrite,
            dye: dRead,
          })
          frame.pass({ target: dWrite, clear: false }, (pass) => pass.draw(dyeFx))
          dye.i = 1 - dye.i

          // --- composite over the paper
          compositeFx.set({ dye: dWrite })
          frame.pass({ target: canvasSurface, clear: [0, 0, 0, 0] }, (pass) =>
            pass.draw(compositeFx),
          )

          // decay pointer influence so a stopped cursor stops pushing
          p.active *= 0.92
          p.vx *= 0.9
          p.vy *= 0.9

          if (hud.current) {
            frames++
            if (now - fpsStart >= 500) {
              setFps(Math.round((frames * 1000) / (now - fpsStart)))
              frames = 0
              fpsStart = now
            }
          }
        })

        cleanup = () => {
          loop.stop()
          themeObserver.disconnect()
          wrap.removeEventListener("pointermove", onMove)
          wrap.removeEventListener("touchmove", onTouch)
          wrap.removeEventListener("pointerleave", onLeave)
          wrap.removeEventListener("touchend", onLeave)
          gpu.dispose?.()
        }
      } catch (e) {
        if (cancelled) return
        setReason(e instanceof Error ? e.message : String(e))
        setStage("error")
      }
    })()
    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [])

  return (
    <PageLoader>
      <main
        className="relative min-h-screen"
        style={{ background: "var(--surface-dark)" }}
      >
        <Navigation />
        <section
          className="section-container relative pb-12 pt-28 sm:pt-32"
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
            <span className="ink-underline-hover">more</span>
          </Link>
          <h1
            className="text-[clamp(2.4rem,6vw,5rem)] leading-[0.9]"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          >
            ink * vgpu
          </h1>
          <p
            className="mt-3 max-w-2xl text-sm sm:text-base"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-display)",
            }}
          >
            ink in restless water — two fields advected entirely on the gpu,
            written in typed wgsl on vercel&apos;s vgpu. drag to stir; leave it
            alone and it drips on its own. webgpu only, on purpose.
          </p>
        </section>

        <div
          ref={wrapRef}
          className="relative mx-auto w-full overflow-hidden"
          style={{
            height: "min(72vh, 720px)",
            border: "1.5px solid var(--ink)",
            filter: "url(#ink-wobble)",
            maxWidth: "min(1400px, 96vw)",
            zIndex: 35,
          }}
        >
          <canvas
            ref={canvasRef}
            className="block h-full w-full"
            style={{ cursor: "crosshair" }}
          />
          {stage === "running" && fps > 0 && (
            <div
              className="pointer-events-none absolute left-3 top-3 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em]"
              style={{
                color: "var(--text-muted)",
                background:
                  "color-mix(in srgb, var(--surface-dark) 82%, transparent)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              webgpu * {fps} fps
            </div>
          )}
          {stage !== "running" && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center"
              style={{
                background:
                  "color-mix(in srgb, var(--surface-dark) 92%, transparent)",
              }}
            >
              {stage === "probing" && (
                <span
                  className="text-sm uppercase tracking-[0.3em]"
                  style={{ color: "var(--text-muted)" }}
                >
                  grinding the ink stick…
                </span>
              )}
              {stage === "unsupported" && (
                <>
                  <span
                    className="text-sm uppercase tracking-[0.3em]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    webgpu unavailable
                  </span>
                  <p
                    style={{
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-display)",
                    }}
                    className="max-w-md"
                  >
                    this dish only fills in browsers with webgpu (chrome, edge,
                    recent safari). the{" "}
                    <Link
                      href="/experiments/flow"
                      className="ink-underline"
                      style={{ color: "var(--ink)" }}
                    >
                      flow experiment
                    </Link>{" "}
                    runs everywhere, if you want moving pixels right now.
                  </p>
                </>
              )}
              {stage === "error" && (
                <>
                  <span
                    className="text-sm uppercase tracking-[0.3em]"
                    style={{ color: "var(--vermilion, #ee4a44)" }}
                  >
                    the ink spilled
                  </span>
                  <p
                    style={{
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-display)",
                    }}
                    className="max-w-md text-xs"
                  >
                    {reason}
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </PageLoader>
  )
}
