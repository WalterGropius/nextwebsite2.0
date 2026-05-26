"use client"

// ContactRadar — a tiny physics-driven mini-game shaped like the
// site's hand-drawn radar. Blips drift around the dish, the
// sweeping line picks them up, and the visitor "makes contact" by
// clicking near a blip the moment the sweep passes it.
//
// Why: the user asked for a "play on word *contact*" — clicking is
// literally a contact. The game is intentionally short, lo-fi, and
// rewards-curious rather than skill-gated.
//
// All drawing happens on a single 2d canvas with currentColor (so it
// inherits --ink for theme). The sweep, blips, and ripples animate
// at 60fps but the simulation is deterministic per-frame so RAF
// throttling doesn't make it feel laggy.

import { useEffect, useRef, useState } from "react"

type Blip = {
  x: number
  y: number
  vx: number
  vy: number
  found: boolean
  pulse: number // 0..1 fade after being contacted
  ttl: number
}

type Ripple = { x: number; y: number; r: number; a: number }

const COLORS = {
  ink: "rgba(15, 17, 23, 0.85)",
  inkSoft: "rgba(15, 17, 23, 0.35)",
  inkFaint: "rgba(15, 17, 23, 0.12)",
}

export function ContactRadar() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [misses, setMisses] = useState(0)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Pull --ink at runtime so we follow the theme switch
    const readInk = () => {
      const s = getComputedStyle(document.documentElement)
      const ink = s.getPropertyValue("--ink").trim() || "#1a1d28"
      return ink
    }
    let inkColor = readInk()
    const themeObs = new MutationObserver(() => { inkColor = readInk() })
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })

    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0, h = 0, cx = 0, cy = 0, radius = 0
    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // Half-dish: centre anchored to the bottom edge, radius
      // determined by whichever bound is tighter. Reads as a
      // widescreen radar viewport.
      cx = w / 2
      cy = h
      radius = Math.min(w / 2, h) * 0.95
    }
    resize()
    const onResize = () => resize()
    window.addEventListener("resize", onResize)

    // Pre-seed blips inside the upper half-dish only.
    const blips: Blip[] = []
    const spawnBlip = () => {
      // Upper half: angle in [-PI, 0] (sin <= 0)
      const ang = -Math.PI + Math.random() * Math.PI
      const r = radius * (0.18 + Math.random() * 0.78)
      const x = cx + Math.cos(ang) * r
      const y = cy + Math.sin(ang) * r
      const speed = 14 + Math.random() * 22
      // Aim each blip into the upper half too so it doesn't
      // immediately slam into the floor.
      const dir = -Math.PI + Math.random() * Math.PI
      blips.push({
        x, y,
        vx: Math.cos(dir) * speed,
        vy: Math.sin(dir) * speed,
        found: false,
        pulse: 0,
        ttl: 5 + Math.random() * 4,
      })
    }
    for (let i = 0; i < 6; i++) spawnBlip()

    const ripples: Ripple[] = []
    // Half-dish sweep: rotate from -PI (left edge) to 0 (right edge),
    // then wrap back. One sweep every ~3s reads as a recognisable
    // search-radar cadence.
    let sweepAngle = -Math.PI
    const sweepSpeed = Math.PI / 3
    let raf = 0
    let last = performance.now()
    let visibilityActive = true

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const px = e.clientX - rect.left
      const py = e.clientY - rect.top
      const dx = px - cx
      const dy = py - cy
      const distFromCenter = Math.hypot(dx, dy)
      if (distFromCenter > radius) return
      setActive(true)
      ripples.push({ x: px, y: py, r: 0, a: 0.9 })

      // Did we hit a blip near the current sweep?
      const sweepX = cx + Math.cos(sweepAngle) * radius
      const sweepY = cy + Math.sin(sweepAngle) * radius
      // angle of the click relative to the centre
      const clickAng = Math.atan2(dy, dx)
      // angular distance between click and sweep
      let da = Math.abs(((clickAng - sweepAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI)

      let hit = false
      for (const b of blips) {
        if (b.found) continue
        const d = Math.hypot(b.x - px, b.y - py)
        if (d < 26) {
          // sweep proximity reward: bigger ring if the sweep is near
          if (da < 0.6) {
            b.found = true
            b.pulse = 1
            setScore((s) => s + (da < 0.25 ? 3 : 1))
            hit = true
            // Replace with a fresh blip elsewhere
            setTimeout(spawnBlip, 600)
            break
          }
        }
      }
      if (!hit) setMisses((m) => m + 1)
      // unused vars retained for future tuning
      void sweepX; void sweepY
    }
    canvas.addEventListener("click", onClick)

    const onVis = () => { visibilityActive = !document.hidden }
    document.addEventListener("visibilitychange", onVis)

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!visibilityActive) {
        raf = requestAnimationFrame(draw)
        return
      }

      // Sweep marches left → right across the upper half, wraps back.
      sweepAngle += sweepSpeed * dt
      if (sweepAngle > 0) sweepAngle = -Math.PI
      // physics step — blips bounce off the half-dish (curved top and
      // the horizontal floor at cy).
      for (const b of blips) {
        b.ttl -= dt
        b.x += b.vx * dt
        b.y += b.vy * dt
        // curved arc boundary
        const dx = b.x - cx
        const dy = b.y - cy
        const d = Math.hypot(dx, dy)
        if (d > radius - 6) {
          const nx = dx / d, ny = dy / d
          const vd = b.vx * nx + b.vy * ny
          b.vx -= 2 * vd * nx
          b.vy -= 2 * vd * ny
          b.x = cx + nx * (radius - 7)
          b.y = cy + ny * (radius - 7)
        }
        // horizontal floor (the diameter line at the bottom)
        if (b.y > cy - 6) {
          b.y = cy - 6
          if (b.vy > 0) b.vy = -b.vy
        }
        // gentle drag
        b.vx *= 0.995
        b.vy *= 0.995
        if (b.pulse > 0) b.pulse = Math.max(0, b.pulse - dt * 1.4)
      }
      // recycle expired blips so the field stays alive
      for (let i = blips.length - 1; i >= 0; i--) {
        if (blips[i].ttl < 0) {
          blips.splice(i, 1)
          spawnBlip()
        }
      }

      // ---- render
      ctx.clearRect(0, 0, w, h)
      ctx.save()

      // dish background (subtle inner fill) — upper half only
      ctx.beginPath()
      ctx.arc(cx, cy, radius, Math.PI, 0, false)
      ctx.closePath()
      ctx.fillStyle = "rgba(127,127,127,0.04)"
      ctx.fill()

      // concentric half-rings
      ctx.strokeStyle = inkColor
      ctx.globalAlpha = 0.18
      ctx.lineWidth = 1
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath()
        ctx.arc(cx, cy, (radius * i) / 4, Math.PI, 0, false)
        ctx.stroke()
      }
      // baseline (diameter) + vertical zenith
      ctx.beginPath()
      ctx.moveTo(cx - radius, cy)
      ctx.lineTo(cx + radius, cy)
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx, cy - radius)
      ctx.stroke()
      // tick marks at 30°/60° on either side, like a real instrument
      ctx.globalAlpha = 0.35
      for (const a of [-150, -120, -60, -30]) {
        const r = (a * Math.PI) / 180
        const r1 = radius
        const r2 = radius - 10
        ctx.beginPath()
        ctx.moveTo(cx + Math.cos(r) * r2, cy + Math.sin(r) * r2)
        ctx.lineTo(cx + Math.cos(r) * r1, cy + Math.sin(r) * r1)
        ctx.stroke()
      }
      // outer arc (bold)
      ctx.globalAlpha = 0.6
      ctx.lineWidth = 1.8
      ctx.beginPath()
      ctx.arc(cx, cy, radius, Math.PI, 0, false)
      ctx.stroke()

      // sweep cone — gradient from centre to the rim, narrow wedge
      const wedge = 0.45
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
      grad.addColorStop(0, "rgba(80, 200, 120, 0.0)")
      grad.addColorStop(0.6, "rgba(80, 200, 120, 0.15)")
      grad.addColorStop(1, "rgba(80, 200, 120, 0.0)")
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, radius, sweepAngle - wedge, sweepAngle)
      ctx.closePath()
      ctx.globalAlpha = 1
      ctx.fill()

      // leading edge line
      ctx.strokeStyle = inkColor
      ctx.globalAlpha = 0.7
      ctx.lineWidth = 1.4
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(sweepAngle) * radius, cy + Math.sin(sweepAngle) * radius)
      ctx.stroke()

      // blips
      for (const b of blips) {
        const dx = b.x - cx, dy = b.y - cy
        const ang = Math.atan2(dy, dx)
        let da = Math.abs(((ang - sweepAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI)
        const litByWedge = da < wedge && !b.found
        const blipAlpha = litByWedge ? 0.95 : 0.35
        ctx.globalAlpha = blipAlpha
        ctx.fillStyle = b.found ? "rgba(80, 200, 120, 0.9)" : inkColor
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.found ? 6 : 4, 0, Math.PI * 2)
        ctx.fill()
        // contact pulse
        if (b.pulse > 0) {
          ctx.globalAlpha = b.pulse * 0.4
          ctx.strokeStyle = "rgba(80, 200, 120, 0.9)"
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(b.x, b.y, 6 + (1 - b.pulse) * 24, 0, Math.PI * 2)
          ctx.stroke()
        }
      }

      // click ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i]
        r.r += 90 * dt
        r.a -= 1.2 * dt
        if (r.a <= 0) {
          ripples.splice(i, 1)
          continue
        }
        ctx.globalAlpha = r.a
        ctx.strokeStyle = inkColor
        ctx.lineWidth = 1.4
        ctx.beginPath()
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2)
        ctx.stroke()
      }

      ctx.restore()
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
      canvas.removeEventListener("click", onClick)
      document.removeEventListener("visibilitychange", onVis)
      themeObs.disconnect()
    }
  }, [])

  return (
    <div
      className="relative mx-auto w-full"
      style={{ maxWidth: 960, aspectRatio: "2 / 1", zIndex: 35 }}
    >
      <div
        ref={wrapRef}
        className="relative h-full w-full overflow-hidden"
        style={{
          // Half-dish frame: top border is the curved arc (drawn by
          // canvas), bottom is the flat instrument base.
          borderBottom: "1.5px solid var(--ink)",
          filter: "url(#ink-wobble)",
          cursor: "crosshair",
        }}
      >
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>
      {/* HUD */}
      <div
        className="pointer-events-none absolute -top-3 left-0 right-0 flex items-baseline justify-between text-[0.65rem] uppercase tracking-[0.3em]"
        style={{ color: "var(--text-muted)" }}
      >
        <span>radar * contact</span>
        <span>
          hits <strong style={{ color: "var(--ink)" }}>{score}</strong>
          {misses > 0 && (
            <span style={{ opacity: 0.6 }}> &nbsp;miss {misses}</span>
          )}
        </span>
      </div>
      <p
        className="mt-3 text-center text-[0.7rem] uppercase tracking-[0.3em]"
        style={{ color: "var(--text-muted)" }}
      >
        {active
          ? "tag the blip as the sweep passes it"
          : "click a blip when the sweep lights it up"}
      </p>
    </div>
  )
}
