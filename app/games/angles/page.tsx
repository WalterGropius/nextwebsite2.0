"use client"

// Angles — a polygon flashes for a second, you trace it from memory.
// Scored on how close each vertex lands to its target, with the
// angles between sides as the second axis.
//
// Built around a single 2d canvas. Each round picks a random
// triangle / quad / pentagon, shows it briefly, then collects N
// clicks. We pair each click to the nearest target vertex (greedy
// match), measure the distance, and turn the result into a 0-100
// score. The reveal overlays the user's polygon on top of the
// target so the player can see where they drifted.

import { useCallback, useEffect, useRef, useState } from "react"
import { GameShell } from "@/components/game-shell"

type Stage = "intro" | "showing" | "tracing" | "reveal" | "results"
type V = { x: number; y: number }

const TOTAL_ROUNDS = 6
const SHOW_MS = 1300

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function generatePolygon(width: number, height: number): V[] {
  const n = Math.floor(rand(3, 7.99)) // 3..7
  const cx = width / 2
  const cy = height / 2
  const r = Math.min(width, height) * 0.32
  const verts: V[] = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2 + rand(-0.15, 0.15)
    const radius = r * rand(0.65, 1.05)
    verts.push({
      x: cx + Math.cos(a) * radius,
      y: cy + Math.sin(a) * radius,
    })
  }
  return verts
}

// Greedy nearest-neighbour match between user clicks and target
// vertices. Not optimal in general, but with small polygons it
// matches what a human expects.
function matchAndScore(target: V[], user: V[]) {
  if (target.length !== user.length) return { score: 0, pairs: [] as Array<[V, V]>, avgDist: Infinity }
  const used = new Set<number>()
  const pairs: Array<[V, V]> = []
  let total = 0
  for (const u of user) {
    let best = -1
    let bestD = Infinity
    target.forEach((t, i) => {
      if (used.has(i)) return
      const d = Math.hypot(u.x - t.x, u.y - t.y)
      if (d < bestD) {
        bestD = d
        best = i
      }
    })
    used.add(best)
    pairs.push([target[best], u])
    total += bestD
  }
  const avgDist = total / user.length
  // Normalise — within 12px is great, beyond ~120 is zero.
  const score = Math.max(0, Math.round(100 - (avgDist / 1.2)))
  return { score, pairs, avgDist }
}

export default function AnglesPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  const [stage, setStage] = useState<Stage>("intro")
  const [target, setTarget] = useState<V[]>([])
  const [user, setUser] = useState<V[]>([])
  const [round, setRound] = useState(1)
  const [total, setTotal] = useState(0)
  const [lastScore, setLastScore] = useState(0)

  const inkRef = useRef("#1a1d28")
  useEffect(() => {
    const read = () => {
      inkRef.current =
        getComputedStyle(document.documentElement).getPropertyValue("--ink").trim() || "#1a1d28"
    }
    read()
    const obs = new MutationObserver(read)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => obs.disconnect()
  }, [])

  const sizeCanvas = useCallback(() => {
    const c = canvasRef.current
    const w = wrapRef.current
    if (!c || !w) return { w: 0, h: 0 }
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const r = w.getBoundingClientRect()
    c.width = Math.floor(r.width * dpr)
    c.height = Math.floor(r.height * dpr)
    c.style.width = `${r.width}px`
    c.style.height = `${r.height}px`
    const ctx = c.getContext("2d")
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
    return { w: r.width, h: r.height }
  }, [])

  const draw = useCallback(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext("2d")
    if (!ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = c.width / dpr
    const h = c.height / dpr
    ctx.clearRect(0, 0, w, h)

    const showTarget = stage === "showing" || stage === "reveal"
    if (showTarget && target.length > 1) {
      ctx.lineWidth = 2.2
      ctx.strokeStyle = inkRef.current
      ctx.globalAlpha = stage === "reveal" ? 0.4 : 1
      ctx.beginPath()
      target.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      })
      ctx.closePath()
      ctx.stroke()
      // vertex dots
      ctx.fillStyle = inkRef.current
      target.forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    if ((stage === "tracing" || stage === "reveal") && user.length > 0) {
      ctx.globalAlpha = 1
      ctx.strokeStyle = "#3a9d4e"
      ctx.fillStyle = "#3a9d4e"
      ctx.lineWidth = 2
      // line segments connecting clicks
      ctx.beginPath()
      user.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      })
      if (stage === "reveal") ctx.closePath()
      ctx.stroke()
      user.forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    if (stage === "reveal" && target.length === user.length) {
      const { pairs } = matchAndScore(target, user)
      ctx.strokeStyle = "rgba(238, 74, 68, 0.7)"
      ctx.setLineDash([3, 4])
      ctx.lineWidth = 1
      pairs.forEach(([t, u]) => {
        ctx.beginPath()
        ctx.moveTo(t.x, t.y)
        ctx.lineTo(u.x, u.y)
        ctx.stroke()
      })
      ctx.setLineDash([])
    }
  }, [stage, target, user])

  useEffect(() => { draw() }, [draw])

  useEffect(() => {
    const onResize = () => { sizeCanvas(); draw() }
    sizeCanvas()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [sizeCanvas, draw])

  const startRound = useCallback(() => {
    const { w, h } = sizeCanvas()
    if (!w || !h) return
    setTarget(generatePolygon(w, h))
    setUser([])
    setLastScore(0)
    setStage("showing")
  }, [sizeCanvas])

  useEffect(() => {
    if (stage !== "showing") return
    const t = setTimeout(() => setStage("tracing"), SHOW_MS)
    return () => clearTimeout(t)
  }, [stage])

  const onCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (stage !== "tracing") return
      const c = canvasRef.current
      if (!c) return
      const r = c.getBoundingClientRect()
      const p = { x: e.clientX - r.left, y: e.clientY - r.top }
      const next = [...user, p]
      setUser(next)
      if (next.length === target.length) {
        const { score } = matchAndScore(target, next)
        setLastScore(score)
        setTotal((t) => t + score)
        setStage("reveal")
      }
    },
    [stage, user, target],
  )

  const advance = useCallback(() => {
    if (round >= TOTAL_ROUNDS) {
      setStage("results")
    } else {
      setRound((r) => r + 1)
      startRound()
    }
  }, [round, startRound])

  const restart = useCallback(() => {
    setRound(1)
    setTotal(0)
    setLastScore(0)
    startRound()
  }, [startRound])

  return (
    <GameShell
      title="trace it"
      blurb="A polygon flashes for a second. From memory, click each corner in order. Score is based on how close your vertices land to the original."
    >
      <div
        ref={wrapRef}
        className="relative w-full overflow-hidden"
        style={{
          height: "min(60vh, 560px)",
          background: "color-mix(in srgb, var(--surface-dark) 96%, var(--ink) 4%)",
          border: "1.5px solid var(--ink)",
          filter: "url(#ink-wobble)",
        }}
      >
        <canvas
          ref={canvasRef}
          onClick={onCanvasClick}
          className="block h-full w-full"
          style={{ cursor: stage === "tracing" ? "crosshair" : "default" }}
        />

        {stage === "intro" && (
          <Overlay>
            <p
              className="max-w-md text-base sm:text-lg"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}
            >
              the polygon flashes — count the corners, remember the angles.
              click each vertex in order from memory. six rounds.
            </p>
            <button onClick={startRound} className="btn-primary">
              <span>start</span>
              <span aria-hidden style={{ filter: "url(#ink-wobble)" }}>→</span>
            </button>
          </Overlay>
        )}

        {/* HUD */}
        {stage !== "intro" && stage !== "results" && (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-baseline justify-between p-4 text-xs uppercase tracking-[0.3em]"
            style={{ color: "var(--text-muted)" }}
          >
            <span>round {round} / {TOTAL_ROUNDS}</span>
            <span>
              total <strong style={{ color: "var(--ink)" }}>{total}</strong>
            </span>
          </div>
        )}

        {stage === "showing" && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-4 z-20 text-center text-sm uppercase tracking-[0.3em]"
            style={{ color: "var(--text-muted)" }}
          >
            * memorise *
          </div>
        )}

        {stage === "tracing" && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-4 z-20 text-center text-sm uppercase tracking-[0.3em]"
            style={{ color: "var(--text-muted)" }}
          >
            click {target.length - user.length} more vertex{target.length - user.length === 1 ? "" : "es"}
          </div>
        )}

        {stage === "reveal" && (
          <div className="pointer-events-auto absolute inset-x-0 bottom-4 z-20 flex flex-col items-center gap-2">
            <div
              className="text-2xl sm:text-3xl"
              style={{
                fontFamily: "var(--font-display)",
                color:
                  lastScore >= 85 ? "#3a9d4e" :
                  lastScore >= 55 ? "#c08a2c" :
                  "var(--vermilion, #ee4a44)",
              }}
            >
              {lastScore} / 100
            </div>
            <button onClick={advance} className="btn-primary">
              <span>{round >= TOTAL_ROUNDS ? "results" : "next"}</span>
              <span aria-hidden style={{ filter: "url(#ink-wobble)" }}>→</span>
            </button>
          </div>
        )}

        {stage === "results" && (
          <Overlay>
            <div className="text-xs uppercase tracking-[0.3em]" style={{ color: "var(--text-muted)" }}>
              final
            </div>
            <div
              className="text-[clamp(3rem,10vw,6rem)] leading-[0.9]"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
            >
              {total}
            </div>
            <div style={{ color: "var(--text-muted)" }}>
              out of {TOTAL_ROUNDS * 100} possible.
            </div>
            <button onClick={restart} className="btn-primary">
              <span>again</span>
              <span aria-hidden style={{ filter: "url(#ink-wobble)" }}>↻</span>
            </button>
          </Overlay>
        )}
      </div>
    </GameShell>
  )
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-6 p-8 text-center"
      style={{ background: "color-mix(in srgb, var(--surface-dark) 92%, transparent)" }}
    >
      {children}
    </div>
  )
}
