"use client"

// ContactGame — "make contact". Pull back and fling an envelope into a
// mailbox that won't hold still. Each delivery moves the box; streaks
// ("threads") score more and every third one wins back a bounce; three
// bounces and the round is over, at which point the game turns into the
// real thing: a mailto with the score in the subject.
//
// Everything is drawn on one 2d canvas in the theme ink, with a slow line
// "boil" (points re-jittered ~8×/s) so the drawing reads hand-inked rather
// than vector-clean. The loop only runs while a round is live, the canvas
// is on screen and the tab is visible; the start screen is a single frame.

import { useCallback, useEffect, useRef, useState } from "react"
import { useI18n } from "@/lib/i18n/provider"
import { pick, type Localized } from "@/lib/i18n/localize"

const EMAIL = "zenbauhaus@gmail.com"
const ACCENT = "#ee4a44"
const BEST_KEY = "zb_contact_best"

const S = {
  label: { en: "make contact", cs: "navaž kontakt", fr: "prendre contact" },
  hint: {
    en: "pull back, let go. land it in the box.",
    cs: "natáhni, pusť. trefa do schránky.",
    fr: "tire, lâche. vise la boîte.",
  },
  keys: { en: "or arrows + space", cs: "nebo šipky + mezerník", fr: "ou flèches + espace" },
  play: { en: "play", cs: "hrát", fr: "jouer" },
  score: { en: "score", cs: "skóre", fr: "score" },
  best: { en: "best", cs: "rekord", fr: "record" },
  thread: { en: "thread", cs: "série", fr: "fil" },
  delivered: { en: "delivered", cs: "doručeno", fr: "livré" },
  bounced: { en: "bounced", cs: "vráceno", fr: "rejeté" },
  spam: { en: "spam", cs: "spam", fr: "spam" },
  filter: { en: "spam filter", cs: "spamový filtr", fr: "filtre anti-spam" },
  ooo: { en: "out of office", cs: "mimo kancelář", fr: "absent" },
  drag: { en: "drag back from anywhere", cs: "táhni zpět odkudkoli", fr: "tire depuis n'importe où" },
  over: { en: "three bounces.", cs: "třikrát vráceno.", fr: "trois rejets." },
  now: { en: "now the real thing.", cs: "a teď naostro.", fr: "maintenant, pour de vrai." },
  send: { en: "send the real one", cs: "pošli ten pravý", fr: "envoyer le vrai" },
  again: { en: "again", cs: "znovu", fr: "rejouer" },
  subject: {
    en: "I scored {n} on your contact game",
    cs: "Skóre {n} v tvojí kontaktní hře",
    fr: "J'ai fait {n} à ton jeu de contact",
  },
  aria: {
    en: "Mini-game: fling an envelope into a moving mailbox. Drag back and release, or aim with the arrow keys and throw with space.",
    cs: "Minihra: hoď obálku do pohyblivé schránky. Natáhni a pusť, nebo miř šipkami a hoď mezerníkem.",
    fr: "Mini-jeu : lance une enveloppe dans une boîte aux lettres mobile. Tire et relâche, ou vise avec les flèches et lance avec espace.",
  },
  liveHit: { en: "delivered, score {n}", cs: "doručeno, skóre {n}", fr: "livré, score {n}" },
  liveMiss: { en: "bounced, {n} left", cs: "vráceno, zbývá {n}", fr: "rejeté, reste {n}" },
} satisfies Record<string, Localized>

type Phase = "idle" | "playing" | "over"

type Hud = {
  phase: Phase
  score: number
  thread: number
  lives: number
  best: number
  event?: "hit" | "miss"
}

type Words = {
  delivered: string
  bounced: string
  spam: string
  filter: string
  ooo: string
  drag: string
}

type Engine = {
  start: () => void
  key: (e: KeyboardEvent) => boolean
  redraw: () => void
  destroy: () => void
}

const MAX_LIVES = 3

function readBest(): number {
  try {
    return Number(window.localStorage.getItem(BEST_KEY)) || 0
  } catch {
    return 0
  }
}

function writeBest(n: number) {
  try {
    window.localStorage.setItem(BEST_KEY, String(n))
  } catch {
    // private mode / blocked storage — the best score just won't persist
  }
}

const rand = (a: number, b: number) => a + Math.random() * (b - a)
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

// -------------------------------------------------------------------------
//  Engine
// -------------------------------------------------------------------------

function createEngine(
  canvas: HTMLCanvasElement,
  wrap: HTMLDivElement,
  emit: (h: Hud) => void,
  words: () => Words,
): Engine {
  const ctx = canvas.getContext("2d")!
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const css = () => getComputedStyle(document.documentElement)
  let ink = css().getPropertyValue("--ink").trim() || "#1a1d28"
  let paper = css().getPropertyValue("--surface-elevated").trim() || "#ffffff"
  let font = getComputedStyle(wrap).fontFamily || "serif"
  const themeObs = new MutationObserver(() => {
    ink = css().getPropertyValue("--ink").trim() || ink
    paper = css().getPropertyValue("--surface-elevated").trim() || paper
    redraw()
  })
  themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })

  // ---- world -----------------------------------------------------------
  // The world is 1000 units wide on desktop and 640 on phones (zoomed in
  // so the envelope stays thumb-sized); height follows the box's aspect.
  const G = 900
  let dpr = Math.min(window.devicePixelRatio || 1, 2)
  let W = 0
  let H = 0
  let WW = 1000
  let WH = 625
  let s = 1
  let groundY = 560
  let vmax = 1000
  let maxPull = 170
  const anchor = { x: 130, y: 400 }

  // ---- state -----------------------------------------------------------
  let phase: Phase = "idle"
  let score = 0
  let thread = 0
  let lives = MAX_LIVES
  let delivered = 0
  let best = readBest()
  let wind = 0
  let time = 0
  let shake = 0
  let lastWasHit = false
  let overAt = -10

  let throws = 0
  type EnvState = "rest" | "flight" | "spent"
  const env = { x: 0, y: 0, vx: 0, vy: 0, rot: 0, state: "rest" as EnvState, t: 0, life: 0, hidden: false, stuck: false, alpha: 1 }
  const aim = { active: false, sx: 0, sy: 0, px: 0, py: 0, id: -1 }
  const kb = { active: false, angle: (-42 * Math.PI) / 180, power: 0.72 }
  const box = { x0: 720, x: 720, baseH: 170, h: 170, bobA: 0, bobW: 2, slideA: 0, ph: 0, flag: 0 }
  const wall = { on: false, x: 0, top: 0, grow: 0 }
  const cloud = { on: false, x: -200, y: 120, rx: 104, ry: 44, vx: 46 }

  type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number; c: string }
  type Floater = { x: number; y: number; text: string; life: number; max: number; c: string; rot: number; size: number; stamp: boolean }
  type Splat = { x: number; y: number; life: number; max: number; pts: number[] }
  const particles: Particle[] = []
  const floaters: Floater[] = []
  const splats: Splat[] = []
  const streaks = Array.from({ length: 9 }, () => ({ x: Math.random(), y: Math.random(), len: rand(40, 90), ph: Math.random() * 6 }))

  function layout() {
    const r = wrap.getBoundingClientRect()
    W = Math.max(1, r.width)
    H = Math.max(1, r.height)
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    const prevWW = WW
    WW = W < 640 ? 640 : 1000
    if (prevWW !== WW) {
      // crossing the phone/desktop threshold rescales the world — carry
      // the scenery across so the box can't end up off the edge
      const k = WW / prevWW
      box.x0 *= k
      box.x = box.x0
      wall.x *= k
      cloud.x *= k
    }
    s = W / WW
    WH = H / s
    groundY = WH - 46
    anchor.x = WW * 0.14
    anchor.y = groundY - Math.min(200, WH * 0.32)
    vmax = Math.sqrt(1.5 * G * WW)
    maxPull = WW < 1000 ? 150 : 170
    box.baseH = clamp(box.baseH, 120, maxBoxH())
    if (env.state === "rest") {
      env.x = anchor.x
      env.y = anchor.y
    }
  }

  const maxBoxH = () => Math.min(WH * 0.68, 400)

  function placeBox(first: boolean) {
    const d = delivered
    box.x0 = first ? WW * 0.74 : rand(WW * 0.56, WW * 0.88)
    box.baseH = first ? Math.min(170, maxBoxH()) : rand(125, maxBoxH())
    box.bobA = d >= 3 ? Math.min(36 + (d - 3) * 12, 120) : 0
    box.bobW = (2 * Math.PI) / Math.max(1.8, 3.2 - (d - 3) * 0.15)
    box.slideA = d >= 11 ? Math.min(50 + (d - 11) * 10, 110) : 0
    box.ph = Math.random() * Math.PI * 2
    wind = d >= 2 ? (Math.random() < 0.5 ? -1 : 1) * rand(0.35, 1) * Math.min(60 + d * 24, 280) : 0
    wall.on = d >= 5
    if (wall.on) {
      const span = box.x0 - 70 - anchor.x
      wall.x = anchor.x + span * rand(0.42, 0.62)
      const hgt = Math.min(WH * 0.26 + (d - 5) * 14, WH * 0.55, box.baseH + 70)
      wall.top = groundY - hgt
    }
    if (d >= 8 && !cloud.on) {
      cloud.on = true
      cloud.x = -cloud.rx
    }
    if (cloud.on) {
      cloud.y = rand(WH * 0.14, Math.max(WH * 0.16, groundY - box.baseH - 140))
      cloud.vx = (Math.random() < 0.5 ? 1 : -1) * rand(36, 70)
    }
  }

  function reset() {
    score = 0
    thread = 0
    throws = 0
    lives = MAX_LIVES
    delivered = 0
    wind = 0
    lastWasHit = false
    wall.on = false
    cloud.on = false
    particles.length = 0
    floaters.length = 0
    splats.length = 0
    placeBox(true)
    reload()
  }

  function reload() {
    env.state = "rest"
    env.x = anchor.x
    env.y = anchor.y
    env.vx = env.vy = 0
    env.rot = 0
    env.hidden = false
    env.stuck = false
    env.alpha = 1
    if (lastWasHit) placeBox(false)
    lastWasHit = false
  }

  function hud(event?: Hud["event"]) {
    emit({ phase, score, thread, lives, best, event })
  }

  function start() {
    reset()
    phase = "playing"
    hud()
    kick()
  }

  // ---- aiming ----------------------------------------------------------

  function pullVector(): { x: number; y: number; p: number } | null {
    if (aim.active) {
      let dx = aim.sx - aim.px
      let dy = aim.sy - aim.py
      const len = Math.hypot(dx, dy)
      if (len < 1) return { x: 0, y: 0, p: 0 }
      const c = Math.min(len, maxPull)
      dx = (dx / len) * c
      dy = (dy / len) * c
      return { x: dx, y: dy, p: c / maxPull }
    }
    if (kb.active) {
      const c = kb.power * maxPull
      return { x: Math.cos(kb.angle) * c, y: Math.sin(kb.angle) * c, p: kb.power }
    }
    return null
  }

  function launch() {
    const pv = pullVector()
    aim.active = false
    kb.active = false
    if (!pv || pv.p < 0.12 || env.state !== "rest" || phase !== "playing") {
      requestDraw()
      return
    }
    const len = Math.hypot(pv.x, pv.y)
    env.x = anchor.x - pv.x
    env.y = anchor.y - pv.y
    env.vx = (pv.x / len) * vmax * pv.p
    env.vy = (pv.y / len) * vmax * pv.p
    env.state = "flight"
    env.t = 0
    throws += 1
    kick()
  }

  // ---- outcomes --------------------------------------------------------

  function slotY() {
    return groundY - box.h
  }

  function hit() {
    thread += 1
    delivered += 1
    score += thread
    lastWasHit = true
    env.state = "spent"
    env.hidden = true
    env.life = env.t = 0.55
    const mx = box.x - 70
    const my = slotY()
    box.flag = 1.4
    if (!reduced) shake = 4
    splats.push({ x: mx + 6, y: my, life: 0.9, max: 0.9, pts: Array.from({ length: 14 }, () => rand(0.55, 1.25)) })
    const n = reduced ? 6 : 16
    for (let i = 0; i < n; i++) {
      const a = rand(-Math.PI, Math.PI)
      const v = rand(90, 330)
      particles.push({ x: mx, y: my, vx: Math.cos(a) * v - 60, vy: Math.sin(a) * v - 120, life: rand(0.5, 0.9), max: 0.9, r: rand(2, 5), c: i % 3 ? ACCENT : ink })
    }
    const w = words()
    floaters.push({ x: mx - 10, y: my - 76, text: thread > 1 ? `${w.delivered} ×${thread}` : w.delivered, life: 1.3, max: 1.3, c: ACCENT, rot: -0.12, size: 34, stamp: true })
    if (thread % 3 === 0 && lives < MAX_LIVES) {
      lives += 1
      floaters.push({ x: anchor.x, y: anchor.y - 90, text: "+1", life: 1.2, max: 1.2, c: ACCENT, rot: 0, size: 34, stamp: false })
    }
    hud("hit")
  }

  function miss(kind: "bounced" | "spam" | "ooo", x: number, y: number) {
    thread = 0
    lives -= 1
    env.state = "spent"
    env.life = env.t = 0.9
    if (!reduced) shake = 2
    const w = words()
    floaters.push({
      x: clamp(x, 70, WW - 70),
      y: clamp(y - 40, 40, groundY - 30),
      text: kind === "spam" ? w.spam : kind === "ooo" ? w.ooo : w.bounced,
      life: 1.1,
      max: 1.1,
      c: ink,
      rot: rand(-0.1, 0.1),
      size: 26,
      stamp: false,
    })
    if (lives <= 0) {
      phase = "over"
      overAt = time
      if (score > best) {
        best = score
        writeBest(best)
      }
    }
    hud("miss")
  }

  // ---- simulation ------------------------------------------------------

  function step(dt: number) {
    time += dt
    // mailbox: telescoping post + slide
    const bob = box.bobA ? Math.sin(time * box.bobW + box.ph) * box.bobA : 0
    box.h = clamp(box.baseH + bob, 110, maxBoxH() + 40)
    box.x = box.x0 + (box.slideA ? Math.sin(time * 0.9 + box.ph) * box.slideA : 0)
    if (box.flag > 0) box.flag = Math.max(0, box.flag - dt)
    if (cloud.on) {
      cloud.x += cloud.vx * dt
      if (cloud.vx > 0 && cloud.x - cloud.rx > WW) cloud.x = -cloud.rx
      if (cloud.vx < 0 && cloud.x + cloud.rx < 0) cloud.x = WW + cloud.rx
    }
    for (const k of streaks) {
      k.x += ((wind * 0.0016 + 0.012) * dt * 1000) / WW
      if (k.x > 1.1) k.x = -0.1
      if (k.x < -0.1) k.x = 1.1
      k.ph += dt * 3
    }

    if (env.state === "flight") {
      // sub-step so fast throws can't tunnel through the slot or the wall
      const n = Math.ceil(dt / (1 / 240))
      const h = dt / n
      for (let i = 0; i < n && env.state === "flight"; i++) flight(h)
    } else if (env.state === "spent") {
      env.t -= dt
      if (!env.hidden) {
        if (env.stuck) {
          if (cloud.on && env.y < groundY - 40) env.x += cloud.vx * dt
          env.y += 30 * dt
        } else {
          env.vy += G * dt
          env.x += env.vx * dt
          env.y += env.vy * dt
          if (env.y > groundY - 10) {
            env.y = groundY - 10
            env.vy = -env.vy * 0.25
            env.vx *= 0.6
          }
          env.rot += env.vx * 0.002
        }
        env.alpha = clamp(env.t / env.life, 0, 1)
      }
      if (env.t <= 0) {
        if (phase === "playing") reload()
        else env.hidden = true
      }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      p.life -= dt
      if (p.life <= 0) {
        particles.splice(i, 1)
        continue
      }
      p.vy += G * 0.6 * dt
      p.x += p.vx * dt
      p.y += p.vy * dt
    }
    for (let i = floaters.length - 1; i >= 0; i--) {
      const f = floaters[i]
      f.life -= dt
      f.y -= 26 * dt
      if (f.life <= 0) floaters.splice(i, 1)
    }
    for (let i = splats.length - 1; i >= 0; i--) {
      splats[i].life -= dt
      if (splats[i].life <= 0) splats.splice(i, 1)
    }
    shake = Math.max(0, shake - dt * 16)
  }

  function flight(h: number) {
    env.t += h
    env.vx += wind * h
    env.vy += G * h
    const drag = Math.exp(-0.12 * h)
    env.vx *= drag
    env.vy *= drag
    env.x += env.vx * h
    env.y += env.vy * h
    env.rot = Math.atan2(env.vy, env.vx) * 0.6 + Math.sin(env.t * 16) * 0.07

    const sy = slotY()
    const bx = box.x
    // the slot: the open end of the box, facing the sling
    if (env.x > bx - 92 && env.x < bx - 46 && env.y > sy - 32 && env.y < sy + 30 && env.vx > -40) {
      hit()
      return
    }
    // the body (and the domed top) — a clang, not a delivery
    if (env.x > bx - 74 && env.x < bx + 82 && env.y > sy - 58 && env.y < sy + 46) {
      env.vx = -Math.abs(env.vx) * 0.45
      env.vy = -Math.abs(env.vy) * 0.35 - 80
      miss("bounced", env.x, env.y)
      return
    }
    // the post
    if (Math.abs(env.x - bx) < 14 && env.y > sy + 40 && env.y < groundY) {
      env.vx = -env.vx * 0.4
      miss("bounced", env.x, env.y)
      return
    }
    if (wall.on && Math.abs(env.x - wall.x) < 16 && env.y > wall.top) {
      env.stuck = true
      env.x = wall.x - 14
      miss("spam", wall.x, Math.max(env.y, wall.top + 30))
      return
    }
    if (cloud.on) {
      const qx = (env.x - cloud.x) / cloud.rx
      const qy = (env.y - cloud.y) / cloud.ry
      if (qx * qx + qy * qy < 1) {
        env.stuck = true
        miss("ooo", cloud.x, cloud.y - cloud.ry)
        return
      }
    }
    if (env.y > groundY - 12) {
      env.y = groundY - 12
      env.vy = -Math.abs(env.vy) * 0.3
      env.vx *= 0.5
      miss("bounced", env.x, env.y)
      return
    }
    if (env.x > WW + 80 || env.x < -80 || env.t > 7) {
      miss("bounced", env.x, groundY - 60)
    }
  }

  // ---- drawing ---------------------------------------------------------

  let boil = 0
  const jit = (x: number, y: number, k: number) => {
    const v = Math.sin(x * 12.9898 + y * 78.233 + boil * 37.719) * 43758.5453
    return (v - Math.floor(v) - 0.5) * 2 * k
  }

  // Wobbly polyline: long edges are subdivided and every point nudged a
  // hair, re-seeded on the boil tick.
  function wpath(pts: Array<[number, number]>, closed = false, k = 1.3) {
    const out: Array<[number, number]> = []
    const n = pts.length
    const segs = closed ? n : n - 1
    for (let i = 0; i < segs; i++) {
      const [x1, y1] = pts[i]
      const [x2, y2] = pts[(i + 1) % n]
      const steps = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1) / 26))
      for (let j = 0; j < steps; j++) {
        const t = j / steps
        const x = x1 + (x2 - x1) * t
        const y = y1 + (y2 - y1) * t
        out.push([x + jit(x, y, k), y + jit(y, x, k)])
      }
    }
    if (!closed) {
      const [x, y] = pts[n - 1]
      out.push([x + jit(x, y, k), y + jit(y, x, k)])
    }
    ctx.beginPath()
    out.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
    if (closed) ctx.closePath()
  }

  function arcPts(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n = 18): Array<[number, number]> {
    const out: Array<[number, number]> = []
    for (let i = 0; i <= n; i++) {
      const a = a0 + ((a1 - a0) * i) / n
      out.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry])
    }
    return out
  }

  function stroke(width = 2.4, color = ink, alpha = 1) {
    ctx.globalAlpha = alpha
    ctx.strokeStyle = color
    ctx.lineWidth = Math.max(width, 1.3 / s)
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  function fill(color: string, alpha = 1) {
    ctx.globalAlpha = alpha
    ctx.fillStyle = color
    ctx.fill()
    ctx.globalAlpha = 1
  }

  function text(t: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = "center", alpha = 1) {
    ctx.globalAlpha = alpha
    ctx.fillStyle = color
    ctx.font = `${size}px ${font}`
    ctx.textAlign = align
    ctx.textBaseline = "middle"
    ctx.fillText(t, x, y)
    ctx.globalAlpha = 1
  }

  function drawEnvelope(x: number, y: number, rot: number, alpha: number) {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rot)
    const w = 30
    const h = 20
    wpath([[-w, -h], [w, -h], [w, h], [-w, h]], true, 1)
    fill(paper, alpha)
    stroke(2.4, ink, alpha)
    wpath([[-w, -h], [0, 3], [w, -h]], false, 1)
    stroke(2, ink, alpha)
    // a little stamp in the corner, the one bit of colour
    wpath([[w - 12, -h + 5], [w - 4, -h + 5], [w - 4, -h + 14], [w - 12, -h + 14]], true, 0.6)
    fill(ACCENT, alpha * 0.9)
    ctx.restore()
  }

  function drawSling(front: boolean) {
    const ax = anchor.x
    const ay = anchor.y
    if (!front) {
      // stem + back prong
      wpath([[ax + 4, groundY], [ax, ay + 70], [ax - 2, ay + 46]])
      stroke(3.4)
      wpath([[ax - 2, ay + 46], [ax - 26, ay + 4]])
      stroke(3.2)
      // ground tuft at its foot
      wpath([[ax - 18, groundY], [ax - 10, groundY - 12]])
      stroke(1.6, ink, 0.6)
      wpath([[ax + 14, groundY], [ax + 20, groundY - 10]])
      stroke(1.6, ink, 0.6)
    } else {
      wpath([[ax - 2, ay + 46], [ax + 24, ay + 2]])
      stroke(3.2)
    }
  }

  function drawBands(ex: number, ey: number, front: boolean) {
    const [px, py] = front ? [anchor.x + 24, anchor.y + 2] : [anchor.x - 26, anchor.y + 4]
    wpath([[px, py], [ex, ey]], false, 0.8)
    stroke(2, ink, 0.85)
  }

  function drawBox() {
    const bx = box.x
    const sy = slotY()
    // post: telescoping, so draw it as two nested sleeves
    wpath([[bx - 6, groundY], [bx - 6, sy + 40]])
    stroke(2.6)
    wpath([[bx + 6, groundY], [bx + 6, sy + 40]])
    stroke(2.6)
    const mid = (groundY + sy + 40) / 2
    wpath([[bx - 9, mid], [bx + 9, mid]])
    stroke(2)
    // body: open end faces the sling, domed top
    const L = bx - 70
    const R = bx + 70
    const T = sy - 40
    const B = sy + 40
    const body: Array<[number, number]> = [
      [L, B],
      [R, B],
      [R, T + 24],
      ...arcPts(R - 24, T + 24, 24, 24, 0, -Math.PI / 2, 6),
      [L + 24, T],
      ...arcPts(L + 24, T + 24, 24, 24, -Math.PI / 2, -Math.PI, 6),
    ]
    wpath(body, true)
    fill(paper)
    stroke(2.6)
    // the mouth — a dark arch, the thing to aim at
    const mouth: Array<[number, number]> = [
      [L + 6, B - 6],
      ...arcPts(L + 6, sy + 2, 14, 36, Math.PI / 2, -Math.PI / 2, 10),
      [L + 6, T + 8],
    ]
    wpath(mouth, true, 0.8)
    fill(ink, 0.82)
    // hinged door hanging open below the mouth
    wpath([[L, B], [L - 34, B + 30], [L - 40, B + 22], [L - 4, B - 8]], true, 0.9)
    fill(paper)
    stroke(2.2)
    // banding on the body
    wpath([[bx + 20, T + 2], [bx + 20, B]], false, 0.8)
    stroke(1.4, ink, 0.45)
    // flag: down at rest, up and red after a delivery
    const up = box.flag > 0
    const fx = R - 18
    const fy = sy + 4
    ctx.save()
    ctx.translate(fx, fy)
    ctx.rotate(up ? -Math.PI / 2 : 0)
    wpath([[0, 0], [44, 0]])
    stroke(2.2)
    wpath([[44, -2], [44, -18], [62, -18], [62, -2]], true, 0.8)
    if (up) fill(ACCENT)
    stroke(2)
    ctx.restore()
  }

  function drawWall() {
    if (!wall.on) return
    const x = wall.x
    const t = wall.top
    wpath([[x - 14, groundY], [x - 14, t]])
    stroke(2.6)
    wpath([[x + 14, groundY], [x + 14, t]])
    stroke(2.6)
    // mesh
    ctx.save()
    ctx.beginPath()
    ctx.rect(x - 14, t, 28, groundY - t)
    ctx.clip()
    for (let y = t - 30; y < groundY + 30; y += 18) {
      wpath([[x - 16, y], [x + 16, y + 22]], false, 0.6)
      stroke(1.2, ink, 0.6)
      wpath([[x - 16, y + 22], [x + 16, y]], false, 0.6)
      stroke(1.2, ink, 0.6)
    }
    ctx.restore()
    wpath([[x - 20, t], [x + 20, t]])
    stroke(3)
    ctx.save()
    ctx.translate(x + 26, t + 6)
    ctx.rotate(Math.PI / 2)
    text(words().filter, 0, 0, 17, ink, "left", 0.75)
    ctx.restore()
  }

  function drawCloud() {
    if (!cloud.on) return
    const { x, y, rx, ry } = cloud
    const pts: Array<[number, number]> = []
    const bumps = 7
    for (let i = 0; i <= bumps * 6; i++) {
      const a = (i / (bumps * 6)) * Math.PI * 2
      const b = 1 + 0.16 * Math.abs(Math.sin((a * bumps) / 2))
      pts.push([x + Math.cos(a) * rx * b, y + Math.sin(a) * ry * b])
    }
    wpath(pts, true, 1)
    fill(paper, 0.92)
    stroke(2.2)
    text(words().ooo, x, y + 2, 18, ink, "center", 0.8)
  }

  function drawGround() {
    wpath([[-10, groundY], [WW + 10, groundY]], false, 1.6)
    stroke(2.4)
    for (let x = 30; x < WW; x += 74) {
      const off = (x * 7) % 23
      wpath([[x + off, groundY + 8], [x + off + 16, groundY + 18]], false, 0.6)
      stroke(1.2, ink, 0.35)
    }
  }

  function drawWind() {
    for (const k of streaks) {
      const x = k.x * WW
      const y = 30 + k.y * Math.max(60, groundY - 260)
      const dir = wind >= 0 ? 1 : -1
      const a = Math.min(0.5, 0.12 + Math.abs(wind) / 600)
      const pts: Array<[number, number]> = []
      for (let i = 0; i <= 4; i++) {
        const t = i / 4
        pts.push([x + dir * t * k.len, y + Math.sin(k.ph + t * 4) * 3])
      }
      wpath(pts, false, 0.4)
      stroke(1.2, ink, a)
    }
    // windsock: chevrons in the top-left corner, one per strength band
    if (phase === "playing" && wind !== 0) {
      const n = Math.abs(wind) < 110 ? 1 : Math.abs(wind) < 200 ? 2 : 3
      const dir = wind > 0 ? 1 : -1
      const cx = 56
      const cy = 40
      for (let i = 0; i < n; i++) {
        const ox = cx + dir * (i * 16 - (n - 1) * 8)
        wpath([[ox - dir * 7, cy - 10], [ox + dir * 7, cy], [ox - dir * 7, cy + 10]], false, 0.6)
        stroke(2.4, ink, 0.75)
      }
    }
  }

  function drawPreview(pv: { x: number; y: number; p: number }) {
    const len = Math.hypot(pv.x, pv.y) || 1
    let x = anchor.x - pv.x
    let y = anchor.y - pv.y
    let vx = (pv.x / len) * vmax * pv.p
    let vy = (pv.y / len) * vmax * pv.p
    const h = 1 / 120
    // no wind in the preview — reading the wind is the skill
    for (let i = 1; i <= 90; i++) {
      vy += G * h
      const d = Math.exp(-0.12 * h)
      vx *= d
      vy *= d
      x += vx * h
      y += vy * h
      if (i % 6 === 0) {
        const t = i / 90
        ctx.beginPath()
        ctx.arc(x, y, 4.2 * (1 - t * 0.6), 0, Math.PI * 2)
        fill(ACCENT, 0.9 - t * 0.6)
      }
    }
  }

  function drawSplat(sp: Splat) {
    const k = sp.life / sp.max
    const grow = 1 - Math.pow(k, 3)
    const r = 34 * (0.5 + grow * 0.6)
    const pts: Array<[number, number]> = sp.pts.map((m, i) => {
      const a = (i / sp.pts.length) * Math.PI * 2
      return [sp.x + Math.cos(a) * r * m, sp.y + Math.sin(a) * r * m * 0.9]
    })
    wpath(pts, true, 1.5)
    fill(ACCENT, Math.min(1, k * 1.6) * 0.55)
  }

  function draw() {
    boil = reduced ? 0 : Math.floor(time * 8)
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const sx = shake ? jit(time * 97, 3.1, shake) : 0
    const sy = shake ? jit(5.7, time * 89, shake) : 0
    ctx.setTransform(dpr * s, 0, 0, dpr * s, sx * dpr, sy * dpr)
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    drawWind()
    drawGround()
    drawCloud()
    drawWall()
    drawBox()

    const pv = phase === "playing" && env.state === "rest" ? pullVector() : null
    const ex = pv ? anchor.x - pv.x : env.x
    const ey = pv ? anchor.y - pv.y : env.y

    drawSling(false)
    const loaded = env.state === "rest" && phase !== "over"
    if (loaded) drawBands(ex - 26, ey + 4, false)
    if (!env.hidden && (env.state !== "rest" || phase !== "over")) {
      const rot = pv ? Math.atan2(pv.y, pv.x) * 0.5 : env.rot
      drawEnvelope(ex, ey, rot, env.state === "spent" ? env.alpha : 1)
    }
    if (loaded) drawBands(ex - 26, ey + 4, true)
    drawSling(true)
    if (pv && pv.p > 0.05) drawPreview(pv)
    if (phase === "playing" && throws === 0 && !pv) {
      text(words().drag, anchor.x - 40, anchor.y - 74, 26, ink, "left", 0.6 + 0.3 * Math.sin(time * 4))
    }

    for (const sp of splats) drawSplat(sp)
    for (const p of particles) {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      fill(p.c, clamp(p.life / p.max, 0, 1))
    }
    for (const f of floaters) {
      const a = clamp(f.life / f.max, 0, 1)
      const pop = f.stamp ? 1 + Math.max(0, f.life - f.max + 0.15) * 3 : 1
      ctx.save()
      ctx.translate(f.x, f.y)
      ctx.rotate(f.rot)
      ctx.scale(pop, pop)
      if (f.stamp) {
        ctx.font = `${f.size}px ${font}`
        const w = ctx.measureText(f.text).width / 2 + 14
        wpath([[-w, -f.size * 0.64], [w, -f.size * 0.64], [w, f.size * 0.64], [-w, f.size * 0.64]], true, 1.2)
        fill(paper, a * 0.85)
        stroke(3, f.c, a)
        // a stamp is inked hard: stroke the letters to fatten them
        ctx.globalAlpha = a
        ctx.strokeStyle = f.c
        ctx.lineWidth = 1.6
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.strokeText(f.text, 0, 1)
        ctx.globalAlpha = 1
      }
      text(f.text, 0, 1, f.size, f.c, "center", a)
      ctx.restore()
    }
  }

  // ---- loop ------------------------------------------------------------

  let raf = 0
  let running = false
  let last = 0
  let onScreen = false
  let visible = !document.hidden
  let drawQueued = 0

  const busy = () =>
    phase === "playing" ||
    particles.length > 0 ||
    floaters.length > 0 ||
    splats.length > 0 ||
    env.state === "spent" ||
    shake > 0 ||
    time - overAt < 0.4

  function frame(now: number) {
    const dt = Math.min(0.033, (now - last) / 1000)
    last = now
    step(dt)
    draw()
    if (onScreen && visible && busy()) {
      raf = requestAnimationFrame(frame)
    } else {
      running = false
      raf = 0
    }
  }

  function kick() {
    if (running || !onScreen || !visible) return
    running = true
    last = performance.now()
    raf = requestAnimationFrame(frame)
  }

  function requestDraw() {
    if (running || drawQueued) return
    drawQueued = requestAnimationFrame(() => {
      drawQueued = 0
      draw()
    })
  }

  function redraw() {
    layout()
    draw()
  }

  // ---- input -----------------------------------------------------------

  const toWorld = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect()
    return { x: (e.clientX - r.left) / s, y: (e.clientY - r.top) / s }
  }

  function onDown(e: PointerEvent) {
    if (phase === "over") return
    if (phase === "idle") {
      // touch has to press "play" first so the page can still scroll past
      if (e.pointerType !== "mouse") return
      start()
    }
    if (env.state !== "rest" || aim.active) return
    const p = toWorld(e)
    aim.active = true
    aim.id = e.pointerId
    aim.sx = aim.px = p.x
    aim.sy = aim.py = p.y
    kb.active = false
    try {
      canvas.setPointerCapture(e.pointerId)
    } catch {
      // capture can fail if the pointer is already gone; aiming still works
    }
    e.preventDefault()
    requestDraw()
  }

  function onMove(e: PointerEvent) {
    if (!aim.active || e.pointerId !== aim.id) return
    const p = toWorld(e)
    aim.px = p.x
    aim.py = p.y
    requestDraw()
  }

  function onUp(e: PointerEvent) {
    if (!aim.active || e.pointerId !== aim.id) return
    const p = toWorld(e)
    aim.px = p.x
    aim.py = p.y
    launch()
  }

  function onCancel() {
    aim.active = false
    requestDraw()
  }

  function key(e: KeyboardEvent): boolean {
    const k = e.key
    if (k === " " || k === "Enter") {
      if (phase !== "playing") {
        start()
        return true
      }
      if (env.state === "rest") {
        if (!kb.active) {
          kb.active = true
          requestDraw()
        } else launch()
      }
      return true
    }
    if (phase !== "playing" || env.state !== "rest") return k.startsWith("Arrow")
    const inc = e.shiftKey ? 4 : 1
    if (k === "ArrowLeft") kb.angle -= (inc * Math.PI) / 180
    else if (k === "ArrowRight") kb.angle += (inc * Math.PI) / 180
    else if (k === "ArrowUp") kb.power += 0.02 * inc
    else if (k === "ArrowDown") kb.power -= 0.02 * inc
    else return false
    kb.angle = clamp(kb.angle, (-85 * Math.PI) / 180, (10 * Math.PI) / 180)
    kb.power = clamp(kb.power, 0.15, 1)
    kb.active = true
    requestDraw()
    return true
  }

  canvas.addEventListener("pointerdown", onDown)
  canvas.addEventListener("pointermove", onMove)
  canvas.addEventListener("pointerup", onUp)
  canvas.addEventListener("pointercancel", onCancel)

  const ro = new ResizeObserver(() => redraw())
  ro.observe(wrap)

  const io = new IntersectionObserver(
    ([entry]) => {
      onScreen = entry.isIntersecting
      if (onScreen) {
        draw()
        if (busy()) kick()
      }
    },
    { rootMargin: "80px" },
  )
  io.observe(canvas)

  const onVis = () => {
    visible = !document.hidden
    if (visible && busy()) kick()
  }
  document.addEventListener("visibilitychange", onVis)

  // the display font may land after the first frame
  document.fonts?.ready.then(() => {
    font = getComputedStyle(wrap).fontFamily || font
    if (!running) draw()
  })

  layout()
  placeBox(true)
  reload()
  draw()

  return {
    start,
    key,
    redraw,
    destroy() {
      if (raf) cancelAnimationFrame(raf)
      if (drawQueued) cancelAnimationFrame(drawQueued)
      ro.disconnect()
      io.disconnect()
      themeObs.disconnect()
      document.removeEventListener("visibilitychange", onVis)
      canvas.removeEventListener("pointerdown", onDown)
      canvas.removeEventListener("pointermove", onMove)
      canvas.removeEventListener("pointerup", onUp)
      canvas.removeEventListener("pointercancel", onCancel)
    },
  }
}

// -------------------------------------------------------------------------
//  Component
// -------------------------------------------------------------------------

function Lives({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-1.5" aria-hidden>
      {Array.from({ length: MAX_LIVES }, (_, i) => (
        <svg
          key={i}
          width="20"
          height="14"
          viewBox="0 0 20 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
          style={{ opacity: i < n ? 1 : 0.25, transition: "opacity 300ms" }}
        >
          <rect x="1" y="1" width="18" height="12" />
          <path d="M1 1 L10 8 L19 1" />
        </svg>
      ))}
    </span>
  )
}

export function ContactGame() {
  const { lang } = useI18n()
  const tr = useCallback((v: Localized) => pick(v, lang), [lang])
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<Engine | null>(null)
  const [hud, setHud] = useState<Hud>({ phase: "idle", score: 0, thread: 0, lives: MAX_LIVES, best: 0 })
  const [live, setLive] = useState("")

  // The canvas reads its stamp words through a ref so a language switch
  // doesn't tear down the running round.
  const wordsRef = useRef<Words>({ delivered: "", bounced: "", spam: "", filter: "", ooo: "", drag: "" })
  wordsRef.current = {
    delivered: tr(S.delivered),
    bounced: tr(S.bounced),
    spam: tr(S.spam),
    filter: tr(S.filter),
    ooo: tr(S.ooo),
    drag: tr(S.drag),
  }
  const liveRef = useRef({ hit: "", miss: "" })
  liveRef.current = { hit: tr(S.liveHit), miss: tr(S.liveMiss) }

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const engine = createEngine(
      canvas,
      wrap,
      (h) => {
        setHud(h)
        if (h.event === "hit") setLive(liveRef.current.hit.replace("{n}", String(h.score)))
        if (h.event === "miss") setLive(liveRef.current.miss.replace("{n}", String(h.lives)))
      },
      () => wordsRef.current,
    )
    engineRef.current = engine
    setHud((h) => ({ ...h, best: readBest() }))
    return () => {
      engine.destroy()
      engineRef.current = null
    }
  }, [])

  // Re-render the still frame when the language changes (canvas labels).
  useEffect(() => {
    engineRef.current?.redraw()
  }, [lang])

  const start = () => {
    engineRef.current?.start()
    wrapRef.current?.focus({ preventScroll: true })
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return
    if (engineRef.current?.key(e.nativeEvent)) e.preventDefault()
  }

  const { phase, score, thread, lives, best } = hud
  const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(tr(S.subject).replace("{n}", String(score)))}`
  const display = { fontFamily: "var(--font-display)" }

  return (
    <div className="relative mx-auto w-full" style={{ maxWidth: 960, zIndex: 35 }}>
      {/* HUD */}
      <div
        className="mb-3 flex items-end justify-between gap-4"
        style={{ ...display, color: "var(--ink)" }}
      >
        <span className="text-[0.65rem] uppercase tracking-[0.3em]" style={{ color: "var(--text-muted)" }}>
          {tr(S.label)}
        </span>
        <span className="flex items-center gap-3 text-sm sm:gap-5 sm:text-base">
          {phase === "playing" && thread >= 2 && (
            <span style={{ color: ACCENT }}>
              {tr(S.thread)} ×{thread}
            </span>
          )}
          <span>
            <span style={{ color: "var(--text-muted)" }}>{tr(S.score)}</span>{" "}
            <strong className="tabular-nums">{score}</strong>
          </span>
          <Lives n={phase === "idle" ? MAX_LIVES : lives} />
        </span>
      </div>

      <div
        ref={wrapRef}
        tabIndex={0}
        role="group"
        aria-roledescription="game"
        aria-label={tr(S.aria)}
        onKeyDown={onKeyDown}
        className="relative aspect-[4/5] w-full outline-none sm:aspect-[16/10]"
        style={{
          ...display,
          // a sheet laid on the page: the grid still reads through, the
          // margin doodles behind it don't
          background: "color-mix(in srgb, var(--surface-elevated) 76%, transparent)",
        }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block size-full"
          style={{
            // Touch can only scroll the page *or* aim. Outside a live round
            // the page wins; once "play" is pressed the canvas owns the drag.
            touchAction: phase === "playing" ? "none" : "pan-y",
            cursor: phase === "over" ? "default" : "crosshair",
          }}
        />
        {/* hand-inked frame; a separate layer so the filter never touches
            the per-frame canvas */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ border: "1.5px solid var(--ink)", filter: "url(#ink-wobble)", opacity: 0.8 }}
        />

        {phase === "idle" && (
          <div className="pointer-events-none absolute inset-x-0 top-[12%] flex flex-col items-center gap-3 px-6 text-center sm:top-[14%]">
            <p
              className="text-[clamp(1.6rem,6vw,2.6rem)] leading-none"
              style={{ color: "var(--ink)" }}
            >
              {tr(S.label)}
            </p>
            <p className="max-w-xs text-[0.8rem] leading-snug sm:max-w-md" style={{ color: "var(--text-muted)" }}>
              {tr(S.hint)}
            </p>
            <button type="button" onClick={start} className="btn-primary pointer-events-auto mt-2">
              {tr(S.play)}
            </button>
            <p className="hidden text-[0.6rem] uppercase tracking-[0.25em] sm:block" style={{ color: "var(--text-muted)" }}>
              {tr(S.keys)}
              {best > 0 && (
                <>
                  {" · "}
                  {tr(S.best)} {best}
                </>
              )}
            </p>
          </div>
        )}

        {phase === "over" && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 45%, color-mix(in srgb, var(--surface-dark) 92%, transparent) 30%, transparent 100%)",
            }}
          >
            <p className="text-[clamp(1.6rem,6vw,2.6rem)] leading-none" style={{ color: "var(--ink)" }}>
              {tr(S.over)}
            </p>
            <p className="text-[0.85rem]" style={{ color: "var(--text-muted)" }}>
              {tr(S.score)} <strong style={{ color: "var(--ink)" }}>{score}</strong>
              {"  ·  "}
              {tr(S.best)} <strong style={{ color: "var(--ink)" }}>{best}</strong>
            </p>
            <p className="text-[0.85rem]" style={{ color: "var(--ink)" }}>
              {tr(S.now)}
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <a href={mailto} className="btn-primary group">
                <span>{tr(S.send)}</span>
                <span aria-hidden className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </a>
              <button
                type="button"
                onClick={start}
                className="btn-secondary"
                style={{ background: "var(--surface-elevated)" }}
              >
                {tr(S.again)}
              </button>
            </div>
          </div>
        )}
      </div>
      <p aria-live="polite" className="sr-only">
        {live}
      </p>
    </div>
  )
}
