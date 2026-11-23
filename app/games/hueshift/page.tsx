"use client"

// Hue shift hunt — which way did the hue move?
//
// Two swatches touch. The right one is the left one with its OKLCH hue
// shifted by `shift` degrees, one way or the other. Lightness and chroma are
// fixed within a round so only hue differs. Two big buttons each carry a chip
// showing where that direction leads. Shift starts at 24°, shrinks ×0.75 per
// hit down to 2°, and relaxes ×1.3 after a miss.

import { useCallback, useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { GameShell } from "@/components/game-shell"
import { useI18n, useT } from "@/lib/i18n/provider"
import { pick as pickLang } from "@/lib/i18n/localize"
import { C, fill } from "./copy"

const TOTAL_ROUNDS = 12
const ROUND_MS = 5000
const REVEAL_MS = 700
const SHIFT_START = 24
const SHIFT_FLOOR = 2
const SHRINK = 0.75
const RELAX = 1.3
const POINTS_PER_LEVEL = 10
const SPEED_BONUS = 5
const CHIP_OFFSET = 40 // degrees the button chips lead away, so they read clearly
const BEST_KEY = "hueshift.best"
const NEUTRAL = "hsl(0 0% 50%)"

interface Round {
  h: number
  l: number
  c: number
  dir: 1 | -1
  shift: number
}

interface Result {
  picked: 1 | -1 | null // null = timed out
  correct: boolean
  points: number
}

const mod = (h: number) => ((h % 360) + 360) % 360
const rnd = (a: number, b: number) => a + Math.random() * (b - a)
const oklch = (l: number, c: number, h: number) =>
  `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${mod(h).toFixed(1)})`

function makeRound(shift: number): Round {
  return {
    h: Math.random() * 360,
    l: rnd(0.68, 0.78),
    c: rnd(0.13, 0.16),
    dir: Math.random() < 0.5 ? 1 : -1,
    shift,
  }
}

const levelOf = (shift: number) =>
  Math.max(1, Math.round(Math.log(SHIFT_START / shift) / Math.log(1 / SHRINK)) + 1)

const fmt = (n: number) => (n >= 10 ? n.toFixed(0) : n.toFixed(1))

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

export default function HueShiftPage() {
  const t = useT()
  const { lang } = useI18n()
  const p = (l: Parameters<typeof pickLang>[0]) => pickLang(l, lang)

  const [stage, setStage] = useState<"intro" | "playing" | "results">("intro")
  const [index, setIndex] = useState(0)
  const [shift, setShift] = useState(SHIFT_START)
  const [round, setRound] = useState<Round | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [score, setScore] = useState(0)
  const [hits, setHits] = useState(0)
  const [smallest, setSmallest] = useState<number | null>(null)
  const [best, setBest] = useState(0)
  const [isNewBest, setIsNewBest] = useState(false)

  const remaining = useRef(ROUND_MS)
  const barRef = useRef<HTMLDivElement | null>(null)
  const boardRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => setBest(loadBest()), [])

  const start = useCallback(() => {
    setScore(0)
    setHits(0)
    setIndex(0)
    setShift(SHIFT_START)
    setSmallest(null)
    setIsNewBest(false)
    setRound(makeRound(SHIFT_START))
    setResult(null)
    setStage("playing")
    requestAnimationFrame(() =>
      boardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    )
  }, [])

  const finish = useCallback((finalScore: number) => {
    const prev = loadBest()
    if (finalScore > prev) {
      saveBest(finalScore)
      setBest(finalScore)
      setIsNewBest(prev > 0)
    } else setBest(prev)
    setStage("results")
  }, [])

  const answer = useCallback(
    (picked: 1 | -1 | null) => {
      if (!round || result) return
      const correct = picked === round.dir
      const level = levelOf(round.shift)
      const frac = Math.max(0, remaining.current / ROUND_MS)
      const points = correct ? POINTS_PER_LEVEL * level + Math.round(SPEED_BONUS * frac) : 0
      setResult({ picked, correct, points })
      setScore((s) => s + points)
      if (correct) {
        setHits((n) => n + 1)
        setSmallest((s) => (s === null ? round.shift : Math.min(s, round.shift)))
        setShift(Math.max(SHIFT_FLOOR, round.shift * SHRINK))
        playSfx("/correct.wav", 0.4)
      } else {
        setShift(Math.min(SHIFT_START, round.shift * RELAX))
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
    setRound(makeRound(shift))
    setResult(null)
  }, [result, index, shift, score, finish])

  // Countdown. Timeout counts as a miss.
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

  // Brief reveal, then auto-advance.
  useEffect(() => {
    if (!result) return
    const id = setTimeout(advance, REVEAL_MS)
    return () => clearTimeout(id)
  }, [result, advance])

  // Keyboard: arrows answer; Enter/Space start, restart or skip the reveal.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (stage === "playing" && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        e.preventDefault()
        answer(e.key === "ArrowLeft" ? -1 : 1)
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

  const level = round ? levelOf(round.shift) : 1

  const dirButton = (dir: 1 | -1) => {
    if (!round) return null
    const isAnswer = !!result && dir === round.dir
    const isPick = !!result && dir === result.picked
    const chip = oklch(round.l, round.c, round.h + dir * CHIP_OFFSET)
    return (
      <button
        type="button"
        onClick={() => answer(dir)}
        disabled={!!result}
        aria-label={p(dir === -1 ? C.chipLeft : C.chipRight)}
        className="flex min-h-[72px] flex-1 items-center justify-center gap-3 px-3 py-2"
        style={{
          flexDirection: dir === -1 ? "row" : "row-reverse",
          background: "color-mix(in srgb, var(--surface-dark) 92%, var(--ink) 8%)",
          border: "1.5px solid var(--ink)",
          color: "var(--ink)",
          fontFamily: "var(--font-display)",
          outline: isAnswer ? "3px solid #3a9d4e" : isPick ? "3px dashed var(--vermilion, #ee4a44)" : "none",
          outlineOffset: 3,
          opacity: result && !isAnswer && !isPick ? 0.6 : 1,
          transition: "opacity 0.2s",
        }}
      >
        <span aria-hidden className="text-2xl leading-none">{dir === -1 ? "←" : "→"}</span>
        <span
          aria-hidden
          className="h-11 w-11 shrink-0 sm:h-12 sm:w-12"
          style={{ background: chip, border: "1.5px solid var(--ink)" }}
        />
      </button>
    )
  }

  return (
    <GameShell title={p(C.title)} blurb={p(C.blurb)}>
      <div ref={boardRef} className="relative w-full scroll-mt-4" style={{ minHeight: 560 }}>
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
                style={{ background: result ? "transparent" : "var(--ink)", transform: "scaleX(1)" }}
              />
            </div>

            {/* swatches touch, on a neutral panel */}
            <div className="flex flex-1 p-3 sm:p-4" style={{ background: NEUTRAL }}>
              <div className="flex min-h-[200px] flex-1 items-stretch sm:min-h-[260px]">
                <motion.div
                  key={`base-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  role="img"
                  aria-label={p(C.base)}
                  className="flex-1"
                  style={{ background: oklch(round.l, round.c, round.h) }}
                />
                <motion.div
                  key={`shifted-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  role="img"
                  aria-label={p(C.moved)}
                  className="flex-1"
                  style={{ background: oklch(round.l, round.c, round.h + round.dir * round.shift) }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              {dirButton(-1)}
              {dirButton(1)}
            </div>

            <div className="flex h-8 items-center justify-center">
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="whitespace-nowrap text-lg sm:text-2xl"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: result.correct ? "#3a9d4e" : "var(--vermilion, #ee4a44)",
                    }}
                  >
                    {result.correct ? p(C.right) : result.picked === null ? p(C.late) : p(C.wrong)}{" "}
                    <span style={{ color: "var(--text-muted)", fontSize: "0.65em" }}>
                      {result.correct ? `+${result.points} · ` : ""}
                      {p(C.shift)} {fmt(round.shift)}° → {fmt(shift)}°
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
              {fill(p(C.hits), { n: hits, m: TOTAL_ROUNDS })}
              <br />
              {smallest === null ? p(C.none) : fill(p(C.smallest), { n: fmt(smallest) })}
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
