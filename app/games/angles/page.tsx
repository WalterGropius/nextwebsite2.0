"use client"

// Angles — a polygon flashes, you click its corners from memory.
//
// Difficulty is adaptive: a level starts at 1 and moves with how well
// you did (up at 70+, down below 40). Level sets the number of corners
// (3..7) and how long the flash lasts. After each round the true shape
// and yours are drawn together with a line from every true corner to
// the corner you gave it.
//
// Coordinates are stored relative to the board centre in units of the
// board's shorter side, so a resize or rotation keeps every round valid.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { GameShell } from "@/components/game-shell"
import { useT, useI18n } from "@/lib/i18n/provider"
import { pick } from "@/lib/i18n/localize"
import { C } from "./copy"

type Stage = "intro" | "showing" | "tracing" | "reveal" | "results"
type V = { x: number; y: number }

interface Entry {
  level: number
  n: number
  flash: number
  score: number
  avg: number // mean corner error, as a fraction of the board's short side
  target: V[]
  user: V[]
}

const TOTAL_ROUNDS = 8
const TOP = 40 // HUD room, px
const GREEN = "#3a9d4e"
const AMBER = "#c08a2c"
const RED = "#ee4a44"
const BEST_KEY = "angles.best"

const cornersFor = (level: number) => Math.min(7, 3 + Math.floor((level - 1) / 2))
const flashFor = (level: number) => Math.max(450, 1500 - 120 * (level - 1))
const scoreColor = (s: number) => (s >= 85 ? GREEN : s >= 55 ? AMBER : RED)

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function generatePolygon(n: number, w: number, h: number): V[] {
  const m = Math.min(w, h)
  const usableH = h - TOP - 12
  const rMax = Math.max(40, Math.min(w / 2 - 22, usableH / 2 - 6))
  const cy = (TOP - 12) / 2 / m // shift the centre below the HUD
  const rot = rand(0, Math.PI * 2)
  return Array.from({ length: n }, (_, i) => {
    const a = rot + (i / n) * Math.PI * 2 + rand(-0.22, 0.22)
    const r = (rMax * rand(0.55, 1)) / m
    return { x: Math.cos(a) * r, y: cy + Math.sin(a) * r }
  })
}

// Best one-to-one pairing of clicks to true corners (n <= 7, so brute
// force). Returns, for each true corner, the click assigned to it.
function bestPairing(target: V[], user: V[]) {
  const n = target.length
  const d = target.map((t) => user.map((u) => Math.hypot(t.x - u.x, t.y - u.y)))
  let best = Infinity
  let bestPerm: number[] = []
  const used = new Array(n).fill(false)
  const perm: number[] = []
  const go = (i: number, sum: number) => {
    if (sum >= best) return
    if (i === n) {
      best = sum
      bestPerm = [...perm]
      return
    }
    for (let j = 0; j < n; j++) {
      if (used[j]) continue
      used[j] = true
      perm[i] = j
      go(i + 1, sum + d[i][j])
      used[j] = false
    }
  }
  go(0, 0)
  const pairs = bestPerm.map((j, i) => ({ t: target[i], u: user[j], d: d[i][j] }))
  return { pairs, avg: best / n }
}

// Mean error of 0 is 100; 0.2 of the short side (~110px) is 0.
const scoreOf = (avg: number) => Math.max(0, Math.round(100 * (1 - avg / 0.2)))

function playSfx(path: string, volume = 0.4) {
  try {
    const a = new Audio(path)
    a.volume = volume
    a.play().catch(() => {})
  } catch {
    /* no-op */
  }
}

function readBest(): number | null {
  try {
    const v = window.localStorage.getItem(BEST_KEY)
    return v === null || Number.isNaN(Number(v)) ? null : Number(v)
  } catch {
    return null
  }
}

function writeBest(n: number) {
  try {
    window.localStorage.setItem(BEST_KEY, String(n))
  } catch {
    /* private mode */
  }
}

export default function AnglesPage() {
  const t = useT()
  const { lang } = useI18n()
  const p = (l: Parameters<typeof pick>[0]) => pick(l, lang)

  const frameRef = useRef<HTMLDivElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [size, setSize] = useState({ w: 0, h: 0 })
  const [stage, setStage] = useState<Stage>("intro")
  const [level, setLevel] = useState(1)
  const [round, setRound] = useState(1)
  const [target, setTarget] = useState<V[]>([])
  const [user, setUser] = useState<V[]>([])
  const [history, setHistory] = useState<Entry[]>([])
  const [best, setBest] = useState<{ prev: number | null; isNew: boolean }>({ prev: null, isNew: false })

  const total = history.reduce((s, e) => s + e.score, 0)
  const last = history[history.length - 1]
  const n = cornersFor(level)

  const inkRef = useRef("#1a1d28")
  useEffect(() => {
    const read = () => {
      inkRef.current =
        getComputedStyle(document.documentElement).getPropertyValue("--ink").trim() || "#1a1d28"
      setSize((s) => ({ ...s })) // repaint
    }
    read()
    const obs = new MutationObserver(read)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] })
    return () => obs.disconnect()
  }, [])

  // Track the board size; the canvas backing store follows it.
  useLayoutEffect(() => {
    const el = boardRef.current
    if (!el) return
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [stage === "intro" || stage === "results"])

  // --- drawing -----------------------------------------------------
  useEffect(() => {
    const c = canvasRef.current
    if (!c || !size.w || !size.h) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    c.width = Math.floor(size.w * dpr)
    c.height = Math.floor(size.h * dpr)
    const ctx = c.getContext("2d")
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size.w, size.h)
    const m = Math.min(size.w, size.h)
    const px = (v: V): V => ({ x: size.w / 2 + v.x * m, y: size.h / 2 + v.y * m })
    const ink = inkRef.current

    const poly = (pts: V[], close: boolean) => {
      ctx.beginPath()
      pts.map(px).forEach((q, i) => (i === 0 ? ctx.moveTo(q.x, q.y) : ctx.lineTo(q.x, q.y)))
      if (close) ctx.closePath()
      ctx.stroke()
    }
    const dots = (pts: V[], r: number, num = false) => {
      pts.map(px).forEach((q, i) => {
        ctx.beginPath()
        ctx.arc(q.x, q.y, r, 0, Math.PI * 2)
        ctx.fill()
        if (num) {
          ctx.save()
          ctx.fillStyle = "#fff"
          ctx.font = "bold 11px sans-serif"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(String(i + 1), q.x, q.y + 0.5)
          ctx.restore()
        }
      })
    }

    if ((stage === "showing" || stage === "reveal") && target.length > 1) {
      ctx.lineWidth = 2.4
      ctx.lineJoin = "round"
      ctx.strokeStyle = ink
      ctx.fillStyle = ink
      ctx.globalAlpha = 1
      poly(target, true)
      dots(target, 4.5)
    }

    if ((stage === "tracing" || stage === "reveal") && user.length > 0) {
      ctx.strokeStyle = GREEN
      ctx.fillStyle = GREEN
      ctx.lineWidth = 2
      if (stage === "reveal") ctx.setLineDash([7, 5])
      poly(user, stage === "reveal")
      ctx.setLineDash([])
      dots(user, stage === "tracing" ? 9 : 4.5, stage === "tracing")
    }

    if (stage === "reveal" && target.length === user.length) {
      const { pairs } = bestPairing(target, user)
      ctx.strokeStyle = RED
      ctx.lineWidth = 1.6
      pairs.forEach(({ t: a, u: b }) => {
        const A = px(a)
        const B = px(b)
        ctx.beginPath()
        ctx.moveTo(A.x, A.y)
        ctx.lineTo(B.x, B.y)
        ctx.stroke()
      })
    }
  }, [stage, target, user, size])

  // --- flow --------------------------------------------------------
  const startRound = useCallback(
    (lvl: number) => {
      const el = boardRef.current
      if (!el) return
      const w = el.clientWidth
      const h = el.clientHeight
      setTarget(generatePolygon(cornersFor(lvl), w, h))
      setUser([])
      setStage("showing")
    },
    [],
  )

  useEffect(() => {
    if (stage !== "showing") return
    const id = window.setTimeout(() => setStage("tracing"), flashFor(level))
    return () => window.clearTimeout(id)
  }, [stage, level, target])

  const startGame = useCallback(() => {
    setHistory([])
    setRound(1)
    setLevel(1)
    setStage("showing") // mounts the board
    // The board mounts on the next paint; deal once it exists.
    requestAnimationFrame(() => {
      startRound(1)
      frameRef.current?.scrollIntoView({ block: "start", behavior: "smooth" })
    })
  }, [startRound])

  const place = useCallback(
    (clientX: number, clientY: number) => {
      if (stage !== "tracing") return
      const c = canvasRef.current
      if (!c) return
      const r = c.getBoundingClientRect()
      const m = Math.min(r.width, r.height)
      const v = { x: (clientX - r.left - r.width / 2) / m, y: (clientY - r.top - r.height / 2) / m }
      const next = [...user, v]
      setUser(next)
      if (next.length === target.length) {
        const { avg } = bestPairing(target, next)
        const score = scoreOf(avg)
        setHistory((hs) => [...hs, { level, n: target.length, flash: flashFor(level), score, avg, target, user: next }])
        setStage("reveal")
        playSfx(score >= 85 ? "/correct.wav" : score >= 55 ? "/nb.wav" : "/incorrect.wav", score >= 85 ? 0.4 : 0.35)
        try {
          navigator.vibrate?.(score >= 55 ? 15 : [30, 40, 30])
        } catch {
          /* no-op */
        }
      }
    },
    [stage, user, target, level],
  )

  const undo = useCallback(() => {
    if (stage === "tracing") setUser((u) => u.slice(0, -1))
  }, [stage])

  const advance = useCallback(() => {
    if (stage !== "reveal" || !last) return
    const nextLevel = last.score >= 70 ? level + 1 : last.score < 40 ? Math.max(1, level - 1) : level
    if (round >= TOTAL_ROUNDS) {
      const prev = readBest()
      const sum = history.reduce((s, e) => s + e.score, 0)
      const isNew = prev === null || sum > prev
      if (isNew) writeBest(sum)
      setBest({ prev, isNew })
      setStage("results")
      return
    }
    setLevel(nextLevel)
    setRound((r) => r + 1)
    startRound(nextLevel)
  }, [stage, last, level, round, history, startRound])

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const go = e.key === "Enter" || e.key === " "
      if (go && stage === "intro") {
        e.preventDefault()
        startGame()
      } else if (go && stage === "reveal") {
        e.preventDefault()
        advance()
      } else if (go && stage === "results") {
        e.preventDefault()
        startGame()
      } else if ((e.key === "Backspace" || e.key.toLowerCase() === "z") && stage === "tracing") {
        e.preventDefault()
        undo()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [stage, startGame, advance, undo])

  const playing = stage === "showing" || stage === "tracing" || stage === "reveal"
  const showHint = (txt: string) => (
    <div
      className="hidden text-[12px] uppercase tracking-[0.2em] [@media(hover:hover)]:block"
      style={{ color: "var(--text-muted)" }}
    >
      {txt}
    </div>
  )

  return (
    <GameShell title={t("angles.title")} blurb={t("angles.blurb")}>
      <div
        ref={frameRef}
        className="relative flex w-full scroll-mb-4 scroll-mt-[96px] lg:scroll-mt-[140px] flex-col"
        style={{
          height: "min(76dvh, 660px)",
          minHeight: 440,
          background: "color-mix(in srgb, var(--surface-dark) 96%, var(--ink) 4%)",
        }}
      >
        {/* ink frame: decorative only, so the wobble never touches clicks */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-40"
          style={{ border: "1.5px solid var(--ink)", filter: "url(#ink-wobble)" }}
        />

        {stage === "intro" && (
          <div className="flex min-h-0 flex-1 flex-col items-center gap-5 overflow-y-auto p-6 text-center sm:p-8 [&>*:first-child]:mt-auto [&>*:last-child]:mb-auto">
            <p
              className="max-w-md text-base sm:text-lg"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}
            >
              {t("angles.intro")}
            </p>
            <p className="max-w-md text-[14px]" style={{ color: "var(--text-muted)" }}>
              {p(C.introMore)}
            </p>
            <button onClick={startGame} className="btn-primary">
              <span>{t("game.start")}</span>
              <span aria-hidden style={{ filter: "url(#ink-wobble)" }}>→</span>
            </button>
            {showHint(p(C.keysStart))}
          </div>
        )}

        {playing && (
          <>
            <div ref={boardRef} className="relative min-h-0 flex-1 overflow-hidden">
              <canvas
                ref={canvasRef}
                aria-label={p(C.board)}
                onPointerDown={(e) => {
                  if (e.pointerType === "mouse" && e.button !== 0) return
                  e.preventDefault()
                  place(e.clientX, e.clientY)
                }}
                className="absolute inset-0 block h-full w-full select-none"
                style={{ touchAction: "none", cursor: stage === "tracing" ? "crosshair" : "default" }}
              />

              <div
                className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-baseline justify-between gap-2 p-3 text-[11px] uppercase tracking-[0.15em] sm:p-4 sm:text-[12px] sm:tracking-[0.25em]"
                style={{ color: "var(--text-muted)" }}
              >
                <span>{t("game.round")} {round}/{TOTAL_ROUNDS}</span>
                <span>
                  {p(C.level)} <strong style={{ color: "var(--ink)" }}>{level}</strong>
                  <span className="hidden sm:inline"> · {n} {p(C.corners)} · {(flashFor(level) / 1000).toFixed(1)}s</span>
                </span>
                <span>{t("game.total")} <strong style={{ color: "var(--ink)" }}>{total}</strong></span>
              </div>
            </div>

            {/* strip below the board: status + actions */}
            <div
              className="z-20 flex min-h-[84px] flex-col items-center justify-center gap-1.5 border-t-[1.5px] border-[var(--ink)] px-3 py-2"
              aria-live="polite"
            >
              {stage === "showing" && (
                <div className="text-[13px] uppercase tracking-[0.3em]" style={{ color: "var(--text-muted)" }}>
                  {t("game.memorise")}
                </div>
              )}

              {stage === "tracing" && (
                <>
                  <div className="flex items-center gap-4">
                    <span className="text-[13px] uppercase tracking-[0.3em]" style={{ color: "var(--text-muted)" }}>
                      {t("angles.left").replace("{n}", String(target.length - user.length))}
                    </span>
                    <button
                      type="button"
                      onClick={undo}
                      disabled={user.length === 0}
                      className="touch-manipulation px-3 py-2 text-[13px] uppercase tracking-[0.2em] underline underline-offset-4 disabled:opacity-30"
                      style={{ color: "var(--ink)" }}
                    >
                      {p(C.undo)}
                    </button>
                  </div>
                  {showHint(p(C.keysTrace))}
                </>
              )}

              {stage === "reveal" && last && (
                <>
                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                    <span
                      className="text-[28px] leading-none"
                      style={{ fontFamily: "var(--font-display)", color: scoreColor(last.score) }}
                    >
                      {last.score} / 100
                    </span>
                    <span className="text-[13px]" style={{ color: "var(--text-muted)" }}>
                      {p(C.off)} {Math.round(last.avg * 100)}%
                      {" · "}
                      {last.score >= 70 ? p(C.nextLevel) : last.score < 40 && level > 1 ? p(C.levelDown) : p(C.steady)}
                    </span>
                    <button onClick={advance} className="btn-primary lg:-my-3 lg:scale-[0.72]">
                      <span>{round >= TOTAL_ROUNDS ? t("game.results") : t("game.next")}</span>
                      <span aria-hidden style={{ filter: "url(#ink-wobble)" }}>→</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-[12px]" style={{ color: "var(--text-muted)" }}>
                    <Legend color="var(--ink)" label={p(C.legendTrue)} />
                    <Legend color={GREEN} label={p(C.legendYours)} dashed />
                    <Legend color={RED} label={p(C.off)} />
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {stage === "results" && (
          <Results
            history={history}
            total={total}
            best={best}
            onRestart={startGame}
            hint={showHint(p(C.keysAgain))}
          />
        )}
      </div>
    </GameShell>
  )
}

function Legend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className="inline-block w-4"
        style={{ borderTop: `2px ${dashed ? "dashed" : "solid"} ${color}` }}
      />
      {label}
    </span>
  )
}

function Thumb({ e }: { e: Entry }) {
  const f = (pts: V[]) => pts.map((v) => `${(50 + v.x * 100).toFixed(1)},${(50 + v.y * 100).toFixed(1)}`).join(" ")
  return (
    <svg viewBox="0 0 100 100" className="h-12 w-12 shrink-0" aria-hidden>
      <polygon points={f(e.target)} fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" />
      <polygon points={f(e.user)} fill="none" stroke={GREEN} strokeWidth="3" strokeDasharray="6 4" strokeLinejoin="round" />
    </svg>
  )
}

function Results({
  history, total, best, onRestart, hint,
}: {
  history: Entry[]
  total: number
  best: { prev: number | null; isNew: boolean }
  onRestart: () => void
  hint: React.ReactNode
}) {
  const t = useT()
  const { lang } = useI18n()
  const p = (l: Parameters<typeof pick>[0]) => pick(l, lang)
  const top = Math.max(...history.map((e) => e.level))
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center gap-3 overflow-y-auto p-4 text-center sm:gap-4 sm:p-8 [&>*:first-child]:mt-auto [&>*:last-child]:mb-auto">
      <div className="text-[12px] uppercase tracking-[0.3em]" style={{ color: "var(--text-muted)" }}>
        {t("game.final")}
      </div>
      <div
        className="text-[clamp(3rem,10vw,5rem)] leading-[0.9]"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        {total}
      </div>
      <div className="text-[14px]" style={{ color: "var(--text-muted)" }}>
        {t("game.outOf").replace("{n}", String(TOTAL_ROUNDS * 100))}{" "}
        {best.isNew ? (
          <strong style={{ color: GREEN }}>{p(C.newBest)}</strong>
        ) : (
          best.prev !== null && <span>{p(C.best)} {best.prev}</span>
        )}
        {" · "}
        {p(C.reached)} {top}
      </div>

      <div className="w-full max-w-md">
        <div className="mb-1 text-left text-[12px] uppercase tracking-[0.25em]" style={{ color: "var(--text-muted)" }}>
          {p(C.recap)}
        </div>
        <ul className="flex flex-col">
          {history.map((e, i) => (
            <li
              key={i}
              className="flex items-center gap-3 py-1 text-left text-[13px]"
              style={{ borderTop: "1px solid color-mix(in srgb, var(--ink) 25%, transparent)", color: "var(--text-muted)" }}
            >
              <span className="w-5 shrink-0">{i + 1}</span>
              <Thumb e={e} />
              <span className="min-w-0 flex-1">
                {p(C.level)} {e.level} · {e.n} {p(C.corners)} · {(e.flash / 1000).toFixed(1)}s
                <br />
                {p(C.off)} {Math.round(e.avg * 100)}%
              </span>
              <strong className="shrink-0 text-[18px]" style={{ color: scoreColor(e.score), fontFamily: "var(--font-display)" }}>
                {e.score}
              </strong>
            </li>
          ))}
        </ul>
      </div>

      <button onClick={onRestart} className="btn-primary">
        <span>{t("game.again")}</span>
        <span aria-hidden style={{ filter: "url(#ink-wobble)" }}>↻</span>
      </button>
      {hint}
    </div>
  )
}
