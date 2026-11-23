"use client"

// Complement — find the colour opposite the one shown.
//
// A base colour is drawn at a readable saturation/value. Five swatches
// follow: the true complement (hue + 180°, same S and V) and four
// decoys. The decoys sit at hue offsets from the complement, at least
// `spread` degrees apart and away from it. Spread starts wide, shrinks
// ×0.75 per hit down to a floor, and relaxes a little after a miss.

import { useCallback, useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { GameShell } from "@/components/game-shell"
import { useI18n, useT } from "@/lib/i18n/provider"
import { pick as pickLang } from "@/lib/i18n/localize"
import { C, fill } from "./copy"

const TOTAL_ROUNDS = 10
const ROUND_MS = 7000
const REVEAL_MS = 900
const SPREAD_START = 60
const SPREAD_FLOOR = 8
const SHRINK = 0.75
const RELAX = 1.3
const POINTS_PER_LEVEL = 10
const SPEED_BONUS = 10
const BEST_KEY = "complement.best"
const NEUTRAL = "hsl(0 0% 50%)"

interface Round {
  h: number
  s: number // 0..100
  v: number // 0..100
  hues: number[] // 5 candidate hues
  answer: number // index of the true complement
  spread: number
}

interface Result {
  picked: number | null // null = timed out
  correct: boolean
  points: number
  gap: number // degrees between picked hue and the answer
}

const mod = (h: number) => ((h % 360) + 360) % 360

function hsvCss(h: number, s: number, v: number) {
  const S = s / 100
  const V = v / 100
  const f = (n: number) => {
    const k = (n + h / 60) % 6
    return V - V * S * Math.max(0, Math.min(k, 4 - k, 1))
  }
  const c = (x: number) => Math.round(x * 255)
  return `rgb(${c(f(5))}, ${c(f(3))}, ${c(f(1))})`
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a)

function makeDecoys(spread: number): number[] {
  const reach = Math.min(150, Math.max(spread * 4, 100))
  for (let t = 0; t < 300; t++) {
    const offs: number[] = []
    for (let i = 0; i < 4; i++) {
      offs.push((Math.random() < 0.5 ? -1 : 1) * rnd(spread, reach))
    }
    let ok = true
    for (let i = 0; i < 4 && ok; i++) {
      for (let j = i + 1; j < 4; j++) {
        if (Math.abs(offs[i] - offs[j]) < spread) {
          ok = false
          break
        }
      }
    }
    if (ok) return offs
  }
  return [-spread, spread, -spread * 2, spread * 2]
}

function makeRound(spread: number, prevH: number | null): Round {
  let h = Math.random() * 360
  for (let i = 0; prevH !== null && i < 10 && Math.abs(mod(h - prevH + 180) - 180) < 40; i++) {
    h = Math.random() * 360
  }
  // Saturation and value kept where hue reads clearly.
  const s = rnd(55, 95)
  const v = rnd(65, 95)
  const comp = mod(h + 180)
  const hues = makeDecoys(spread).map((o) => mod(comp + o))
  const answer = Math.floor(Math.random() * 5)
  hues.splice(answer, 0, comp)
  return { h, s, v, hues, answer, spread }
}

const levelOf = (spread: number) =>
  Math.max(1, Math.round(Math.log(SPREAD_START / spread) / Math.log(1 / SHRINK)) + 1)

const angDiff = (a: number, b: number) => Math.abs(mod(a - b + 180) - 180)

function playSfx(path: string, volume = 0.5) {
  try {
    const a = new Audio(path)
    a.volume = volume
    a.play().catch(() => {})
  } catch {
    /* no-op */
  }
}

function loadBest(): number {
  try {
    const n = Number(localStorage.getItem(BEST_KEY))
    return Number.isFinite(n) ? n : 0
  } catch {
    return 0
  }
}

function saveBest(n: number) {
  try {
    localStorage.setItem(BEST_KEY, String(n))
  } catch {
    /* no-op */
  }
}

export default function ComplementPage() {
  const t = useT()
  const { lang } = useI18n()
  const p = (l: Parameters<typeof pickLang>[0]) => pickLang(l, lang)

  const [stage, setStage] = useState<"intro" | "playing" | "results">("intro")
  const [index, setIndex] = useState(0)
  const [spread, setSpread] = useState(SPREAD_START)
  const [round, setRound] = useState<Round | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [score, setScore] = useState(0)
  const [hits, setHits] = useState(0)
  const [maxLevel, setMaxLevel] = useState(1)
  const [best, setBest] = useState(0)
  const [isNewBest, setIsNewBest] = useState(false)

  const remaining = useRef(ROUND_MS)
  const barRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => setBest(loadBest()), [])

  const start = useCallback(() => {
    setScore(0)
    setHits(0)
    setIndex(0)
    setSpread(SPREAD_START)
    setMaxLevel(1)
    setIsNewBest(false)
    setRound(makeRound(SPREAD_START, null))
    setResult(null)
    setStage("playing")
  }, [])

  const finish = useCallback(
    (finalScore: number) => {
      const prev = loadBest()
      if (finalScore > prev) {
        saveBest(finalScore)
        setBest(finalScore)
        setIsNewBest(prev > 0)
      } else setBest(prev)
      setStage("results")
    },
    [],
  )

  const answer = useCallback(
    (picked: number | null) => {
      if (!round || result) return
      const correct = picked === round.answer
      const level = levelOf(round.spread)
      const frac = Math.max(0, remaining.current / ROUND_MS)
      const points = correct ? POINTS_PER_LEVEL * level + Math.round(SPEED_BONUS * frac) : 0
      const gap = picked === null ? 180 : Math.round(angDiff(round.hues[picked], round.hues[round.answer]))
      setResult({ picked, correct, points, gap })
      setScore((s) => s + points)
      if (correct) {
        setHits((n) => n + 1)
        setMaxLevel((m) => Math.max(m, levelOf(Math.max(SPREAD_FLOOR, round.spread * SHRINK))))
        setSpread(Math.max(SPREAD_FLOOR, round.spread * SHRINK))
        playSfx("/correct.wav", 0.4)
      } else {
        setSpread(Math.min(SPREAD_START, round.spread * RELAX))
        playSfx(picked === null ? "/nb.wav" : "/incorrect.wav", 0.35)
      }
    },
    [round, result],
  )

  const advance = useCallback(() => {
    if (!result) return
    const next = index + 1
    if (next >= TOTAL_ROUNDS) {
      finish(score)
      return
    }
    setIndex(next)
    setRound((prev) => makeRound(spread, prev ? prev.h : null))
    setResult(null)
  }, [result, index, spread, score, finish])

  // Countdown for the current round. Timeout counts as wrong.
  useEffect(() => {
    if (stage !== "playing" || !round || result) return
    remaining.current = ROUND_MS
    const t0 = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const left = Math.max(0, ROUND_MS - (now - t0))
      remaining.current = left
      if (barRef.current) barRef.current.style.transform = `scaleX(${left / ROUND_MS})`
      if (left <= 0) answer(null)
      else raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [stage, round, result, answer])

  // Reveal, then auto-advance.
  useEffect(() => {
    if (!result) return
    const id = setTimeout(advance, REVEAL_MS)
    return () => clearTimeout(id)
  }, [result, advance])

  // Keyboard: 1-5 pick; Enter/Space start, restart or skip the reveal.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (stage === "playing" && /^[1-5]$/.test(e.key)) {
        e.preventDefault()
        answer(Number(e.key) - 1)
      } else if (e.key === "Enter" || e.key === " ") {
        if (stage === "playing") {
          if (result) {
            e.preventDefault()
            advance()
          }
        } else {
          e.preventDefault()
          start()
        }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [stage, result, answer, advance, start])

  const level = round ? levelOf(round.spread) : 1

  return (
    <GameShell title={p(C.title)} blurb={p(C.blurb)}>
      <div className="relative w-full" style={{ minHeight: 560 }}>
        {/* The inky frame is its own layer so the wobble never touches the colours. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: "color-mix(in srgb, var(--surface-dark) 96%, var(--ink) 4%)",
            border: "1.5px solid var(--ink)",
            filter: "url(#ink-wobble)",
          }}
        />

        {stage === "intro" && (
          <div className="relative flex min-h-[560px] flex-col items-center justify-center gap-6 p-8 text-center">
            <p
              className="max-w-lg text-base sm:text-lg"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}
            >
              {p(C.intro)}
            </p>
            <button onClick={start} className="btn-primary">
              <span>{t("game.start")}</span>
              <span aria-hidden style={{ filter: "url(#ink-wobble)" }}>→</span>
            </button>
          </div>
        )}

        {stage === "playing" && round && (
          <div className="relative flex min-h-[560px] flex-col gap-3 p-3 sm:gap-4 sm:p-5">
            <div
              className="flex items-baseline justify-between gap-2 whitespace-nowrap text-[11px] uppercase tracking-[0.12em] sm:text-xs sm:tracking-[0.3em]"
              style={{ color: "var(--text-muted)" }}
            >
              <span>{t("game.round")} {index + 1} / {TOTAL_ROUNDS}</span>
              <span>{p(C.level)} <strong style={{ color: "var(--ink)" }}>{level}</strong></span>
              <span>{t("game.score")} <strong style={{ color: "var(--ink)" }}>{score}</strong></span>
            </div>

            <div className="h-1.5 w-full" style={{ background: "color-mix(in srgb, var(--ink) 12%, transparent)" }}>
              <div
                key={index}
                ref={barRef}
                className="h-full w-full origin-left"
                style={{
                  background: result ? "transparent" : "var(--ink)",
                  transform: "scaleX(1)",
                }}
              />
            </div>

            {/* swatches on a neutral panel */}
            <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4" style={{ background: NEUTRAL }}>
              <div className="flex flex-1 items-stretch gap-3">
                <motion.div
                  key={`base-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  role="img"
                  aria-label={p(C.base)}
                  className="min-h-[120px] flex-1"
                  style={{ background: hsvCss(round.h, round.s, round.v) }}
                />
                <div className="flex w-[124px] shrink-0 flex-col items-center justify-center sm:w-[160px]">
                  {result ? (
                    <HueWheel round={round} result={result} />
                  ) : (
                    <span
                      className="text-center text-xs uppercase tracking-[0.3em]"
                      style={{ color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-display)" }}
                    >
                      {p(C.base)}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 sm:gap-3">
                {round.hues.map((h, i) => {
                  const isAnswer = result && i === round.answer
                  const isPick = result && i === result.picked
                  return (
                    <button
                      key={`${index}-${i}`}
                      type="button"
                      onClick={() => answer(i)}
                      disabled={!!result}
                      aria-label={fill(p(C.pickLabel), { n: i + 1 })}
                      className="relative flex h-24 items-end justify-center pb-1 text-xs sm:h-32 sm:text-sm"
                      style={{
                        background: hsvCss(h, round.s, round.v),
                        outline: isAnswer
                          ? "3px solid #fff"
                          : isPick
                            ? "3px dashed var(--vermilion, #ee4a44)"
                            : "none",
                        outlineOffset: 3,
                        opacity: result && !isAnswer && !isPick ? 0.55 : 1,
                        transition: "opacity 0.2s",
                        color: "rgba(255,255,255,0.9)",
                        textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {i + 1}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex h-8 items-center justify-center">
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-xl sm:text-2xl"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: result.correct ? "#3a9d4e" : "var(--vermilion, #ee4a44)",
                    }}
                  >
                    {result.correct ? p(C.right) : result.picked === null ? p(C.late) : p(C.wrong)}{" "}
                    <span style={{ color: "var(--text-muted)", fontSize: "0.7em" }}>
                      {result.correct ? `+${result.points}` : result.picked !== null ? fill(p(C.gap), { n: result.gap }) : ""}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {stage === "results" && (
          <div className="relative flex min-h-[560px] flex-col items-center justify-center gap-5 p-8 text-center">
            <div className="text-xs uppercase tracking-[0.3em]" style={{ color: "var(--text-muted)" }}>
              {t("game.final")}
            </div>
            <div
              className="text-[clamp(3rem,10vw,6rem)] leading-[0.9]"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
            >
              {score}
            </div>
            <div className="text-sm uppercase tracking-[0.3em]" style={{ color: "var(--text-muted)" }}>
              {isNewBest ? p(C.newBest) : `${p(C.best)} ${best}`}
            </div>
            <div style={{ color: "var(--text-muted)" }}>
              {fill(p(C.hits), { n: hits, m: TOTAL_ROUNDS })} · {fill(p(C.reached), { n: maxLevel })}
            </div>
            <button onClick={start} className="btn-primary">
              <span>{t("game.again")}</span>
              <span aria-hidden style={{ filter: "url(#ink-wobble)" }}>↻</span>
            </button>
          </div>
        )}
      </div>
    </GameShell>
  )
}

// --- hue wheel ------------------------------------------------------

function HueWheel({ round, result }: { round: Round; result: Result }) {
  const { lang } = useI18n()
  const size = 100
  const c = size / 2
  const rOut = 46
  const rIn = 34
  const rMid = (rOut + rIn) / 2
  const pt = (hue: number, r: number) => {
    const a = ((hue - 90) * Math.PI) / 180
    return [c + r * Math.cos(a), c + r * Math.sin(a)] as const
  }
  const segs = Array.from({ length: 72 }, (_, i) => {
    const h0 = i * 5
    const h1 = h0 + 5.6
    const [x0, y0] = pt(h0, rOut)
    const [x1, y1] = pt(h1, rOut)
    const [x2, y2] = pt(h1, rIn)
    const [x3, y3] = pt(h0, rIn)
    return (
      <path
        key={i}
        d={`M${x0} ${y0}A${rOut} ${rOut} 0 0 1 ${x1} ${y1}L${x2} ${y2}A${rIn} ${rIn} 0 0 0 ${x3} ${y3}Z`}
        fill={hsvCss(h0 + 2.5, round.s, round.v)}
      />
    )
  })
  const comp = round.hues[round.answer]
  const [bx, by] = pt(round.h, rMid)
  const [cx, cy] = pt(comp, rMid)
  const picked = result.picked !== null && !result.correct ? round.hues[result.picked] : null
  const pk = picked !== null ? pt(picked, rMid) : null
  return (
    <motion.svg
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      viewBox={`0 0 ${size} ${size}`}
      className="h-full max-h-[124px] w-full max-w-[124px] sm:max-h-[160px] sm:max-w-[160px]"
      role="img"
      aria-label={pickLang(C.legendBase, lang) + " / " + pickLang(C.legendComp, lang)}
    >
      {segs}
      <line x1={bx} y1={by} x2={cx} y2={cy} stroke="#fff" strokeWidth={1.2} strokeDasharray="3 2" />
      <circle cx={bx} cy={by} r={5} fill={hsvCss(round.h, round.s, round.v)} stroke="#111" strokeWidth={2} />
      <circle cx={cx} cy={cy} r={6} fill={hsvCss(comp, round.s, round.v)} stroke="#fff" strokeWidth={2.5} />
      {pk && (
        <g stroke="#111" strokeWidth={2.5} strokeLinecap="round">
          <line x1={pk[0] - 4} y1={pk[1] - 4} x2={pk[0] + 4} y2={pk[1] + 4} />
          <line x1={pk[0] - 4} y1={pk[1] + 4} x2={pk[0] + 4} y2={pk[1] - 4} />
        </g>
      )}
    </motion.svg>
  )
}
