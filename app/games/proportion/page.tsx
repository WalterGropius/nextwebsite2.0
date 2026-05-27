"use client"

// Proportion — guess the aspect ratio of the displayed rectangle.
// Direct rewrite of the original pygame `proportion.py` with the
// same scoring rules, plus a slider so the answer is continuous
// rather than typed (no easy "10,1" cheat code).

import { useCallback, useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { GameShell } from "@/components/game-shell"

type Verdict = "spot-on" | "ballpark" | "miss"

interface Round {
  ratio: number // target width / height, 1..3
  width: number
  height: number
}

const TOTAL_ROUNDS = 10
const SLIDER_MIN = 1
const SLIDER_MAX = 3

function randomRound(area: { w: number; h: number }): Round {
  const ratio = Math.random() * 2 + 1 // 1..3
  const maxW = area.w * 0.65
  const maxH = area.h * 0.7
  // start from a target width, clamp height; if too tall, start from
  // a target height and recompute width.
  let width = Math.random() * (maxW - 120) + 120
  let height = width / ratio
  if (height > maxH) {
    height = Math.random() * (maxH - 80) + 80
    width = height * ratio
  }
  return { ratio, width, height }
}

function verdictFor(guess: number, target: number): Verdict {
  const lo10 = 0.9 * target,  hi10 = 1.1 * target
  const lo20 = 0.8 * target,  hi20 = 1.2 * target
  if (guess >= lo10 && guess <= hi10) return "spot-on"
  if (guess >= lo20 && guess <= hi20) return "ballpark"
  return "miss"
}

function deltaFor(v: Verdict) {
  if (v === "spot-on") return 2
  if (v === "ballpark") return 1
  return -3
}

function playSfx(path: string, volume = 0.5) {
  try {
    const a = new Audio(path)
    a.volume = volume
    a.play().catch(() => {})
  } catch {
    /* no-op */
  }
}

export default function ProportionPage() {
  const [stage, setStage] = useState<"intro" | "playing" | "results">("intro")
  const [round, setRound] = useState<Round | null>(null)
  const [guess, setGuess] = useState(2)
  const [score, setScore] = useState(0)
  const [triesLeft, setTriesLeft] = useState(TOTAL_ROUNDS)
  const [verdict, setVerdict] = useState<{ v: Verdict; delta: number; target: number } | null>(null)
  const [reveal, setReveal] = useState(false)
  const arenaRef = useRef<HTMLDivElement | null>(null)

  const measure = useCallback(() => {
    const el = arenaRef.current
    if (!el) return { w: 800, h: 480 }
    const rect = el.getBoundingClientRect()
    return { w: rect.width, h: rect.height }
  }, [])

  const nextRound = useCallback(() => {
    setRound(randomRound(measure()))
    setGuess(2)
    setReveal(false)
    setVerdict(null)
  }, [measure])

  const start = useCallback(() => {
    setScore(0)
    setTriesLeft(TOTAL_ROUNDS)
    setStage("playing")
    nextRound()
  }, [nextRound])

  const submit = useCallback(() => {
    if (!round || reveal) return
    const v = verdictFor(guess, round.ratio)
    const delta = deltaFor(v)
    setVerdict({ v, delta, target: round.ratio })
    setScore((s) => s + delta)
    setReveal(true)
    if (v === "spot-on") playSfx("/correct.wav", 0.4)
    else if (v === "ballpark") playSfx("/nb.wav", 0.4)
    else playSfx("/incorrect.wav", 0.35)
  }, [round, guess, reveal])

  const advance = useCallback(() => {
    const left = triesLeft - 1
    setTriesLeft(left)
    if (left <= 0) {
      setStage("results")
    } else {
      nextRound()
    }
  }, [triesLeft, nextRound])

  // Keyboard: Enter submits, Space/Enter advances to next round.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (stage !== "playing") return
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        if (reveal) advance()
        else submit()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [stage, reveal, submit, advance])

  // Resize: rebuild the current rectangle so it fits the new arena.
  useEffect(() => {
    if (stage !== "playing") return
    const onResize = () => {
      if (round && !reveal) setRound(randomRound(measure()))
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [stage, round, reveal, measure])

  return (
    <GameShell
      title="proportion"
      blurb="A rectangle appears. Slide your guess of its width-to-height ratio. Within 10% = spot-on (+2), 20% = ballpark (+1), further = miss (−3). Ten rounds."
    >
      <div
        ref={arenaRef}
        className="relative w-full overflow-hidden"
        style={{
          height: "min(60vh, 560px)",
          background: "color-mix(in srgb, var(--surface-dark) 96%, var(--ink) 4%)",
          border: "1.5px solid var(--ink)",
          filter: "url(#ink-wobble)",
        }}
      >
        {stage === "intro" && (
          <Intro onStart={start} />
        )}

        {stage === "playing" && round && (
          <Playing
            round={round}
            reveal={reveal}
            verdict={verdict}
            guess={guess}
            onGuess={setGuess}
            onSubmit={submit}
            onNext={advance}
            score={score}
            triesLeft={triesLeft}
          />
        )}

        {stage === "results" && (
          <Results score={score} onRestart={start} />
        )}
      </div>
    </GameShell>
  )
}

// --- subviews ----------------------------------------------------

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8 text-center">
      <p
        className="max-w-lg text-base sm:text-lg"
        style={{
          color: "var(--text-muted)",
          fontFamily: "var(--font-display)",
        }}
      >
        Slide the bar to your best guess of the rectangle&rsquo;s ratio,
        hit <kbd>enter</kbd> to lock it in. Ten rounds.
      </p>
      <button onClick={onStart} className="btn-primary">
        <span>start</span>
        <span aria-hidden style={{ filter: "url(#ink-wobble)" }}>→</span>
      </button>
    </div>
  )
}

function Playing({
  round, reveal, verdict, guess, onGuess, onSubmit, onNext, score, triesLeft,
}: {
  round: Round
  reveal: boolean
  verdict: { v: Verdict; delta: number; target: number } | null
  guess: number
  onGuess: (n: number) => void
  onSubmit: () => void
  onNext: () => void
  score: number
  triesLeft: number
}) {
  return (
    <>
      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-baseline justify-between p-4 text-xs uppercase tracking-[0.3em]" style={{ color: "var(--text-muted)" }}>
        <span>round {TOTAL_ROUNDS - triesLeft + 1} / {TOTAL_ROUNDS}</span>
        <span>score <strong style={{ color: "var(--ink)" }}>{score}</strong></span>
      </div>

      {/* The rectangle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          key={`${round.width}-${round.height}`}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: round.width,
            height: round.height,
            background: "var(--ink)",
            borderRadius: 2,
          }}
        />
      </div>

      {/* Slider + submit / next */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-3 p-5">
        <div
          className="text-sm uppercase tracking-[0.3em]"
          style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}
        >
          your guess:{" "}
          <strong style={{ color: "var(--ink)" }}>{guess.toFixed(2)} : 1</strong>
        </div>
        <input
          type="range"
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          step={0.01}
          value={guess}
          onChange={(e) => onGuess(parseFloat(e.target.value))}
          disabled={reveal}
          className="w-full max-w-md cursor-pointer"
          style={{ accentColor: "var(--ink)" }}
        />
        {reveal ? (
          <button onClick={onNext} className="btn-primary">
            <span>next</span>
            <span aria-hidden style={{ filter: "url(#ink-wobble)" }}>→</span>
          </button>
        ) : (
          <button onClick={onSubmit} className="btn-primary">
            <span>guess</span>
            <span aria-hidden style={{ filter: "url(#ink-wobble)" }}>→</span>
          </button>
        )}
      </div>

      <AnimatePresence>
        {reveal && verdict && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-x-0 top-12 z-20 flex flex-col items-center"
          >
            <div
              className="text-2xl sm:text-3xl"
              style={{
                fontFamily: "var(--font-display)",
                color:
                  verdict.v === "spot-on" ? "#3a9d4e" :
                  verdict.v === "ballpark" ? "#c08a2c" :
                  "var(--vermilion, #ee4a44)",
              }}
            >
              {verdict.v === "spot-on" ? "spot on!" : verdict.v === "ballpark" ? "in the ballpark" : "miss"}{" "}
              <span style={{ color: "var(--text-muted)", fontSize: "0.7em" }}>
                {verdict.delta > 0 ? `+${verdict.delta}` : verdict.delta}
              </span>
            </div>
            <div
              className="mt-1 text-sm uppercase tracking-[0.3em]"
              style={{ color: "var(--text-muted)" }}
            >
              actual {verdict.target.toFixed(2)} : 1
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function Results({ score, onRestart }: { score: number; onRestart: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8 text-center">
      <div
        className="text-xs uppercase tracking-[0.3em]"
        style={{ color: "var(--text-muted)" }}
      >
        final
      </div>
      <div
        className="text-[clamp(3rem,10vw,6rem)] leading-[0.9]"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        {score}
      </div>
      <div style={{ color: "var(--text-muted)" }}>
        out of {TOTAL_ROUNDS * 2} possible.
      </div>
      <button onClick={onRestart} className="btn-primary">
        <span>again</span>
        <span aria-hidden style={{ filter: "url(#ink-wobble)" }}>↻</span>
      </button>
    </div>
  )
}
