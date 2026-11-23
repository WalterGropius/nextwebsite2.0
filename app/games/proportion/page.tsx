"use client"

// Proportion — read the aspect ratio of a rectangle by eye.
//
// Every target lives on a 10×10 matrix: width and height are whole
// numbers from 1 to 10. The answer is typed as a fraction in two
// steps (width, then height) and only the ratio counts, so 1:1 and
// 3:3 are the same answer. The first rounds show the shape at a
// fixed size in the centre; after that it is randomly scaled and
// pushed off-centre, further the smaller it gets.
//
// Two ways to play: "calm" has no clock; "speed" gives each round a
// shrinking time limit and pays a bonus for answering fast, the way
// the original Unreal build was tuned.

import { useCallback, useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { GameShell } from "@/components/game-shell"
import { useT } from "@/lib/i18n/provider"

type Verdict = "spot-on" | "ballpark" | "miss"
type Mode = "calm" | "speed"

interface Round {
  a: number // target width units, 1..10
  b: number // target height units, 1..10
  scale: number // multiplier on the base size, 1 while static
  ox: number // offset as a fraction of the free room, -1..1
  oy: number
}

interface Result {
  v: Verdict
  points: number
  bonus: number
  gw: number
  gh: number
  timedOut?: boolean
}

interface Entry extends Result {
  a: number
  b: number
}

const TOTAL_ROUNDS = 10
const STATIC_ROUNDS = 3
const MAX_POINTS = 10
const MAX_BONUS = 5
const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const SCALE_MIN = 0.35
const SCALE_MAX = 1.15
// The log-ratio error at which a guess is worth nothing (≈ 49% off).
const ZERO_AT = 0.4

function gcd(x: number, y: number): number {
  return y === 0 ? x : gcd(y, x % y)
}

function reduce(a: number, b: number): [number, number] {
  const g = gcd(a, b)
  return [a / g, b / g]
}

function randInt(max: number) {
  return Math.floor(Math.random() * max) + 1
}

// The matrix opens up as the game goes on: 5×5 while the shape holds
// still, then 8×8, then the full 10×10.
function matrixSize(index: number) {
  if (index < STATIC_ROUNDS) return 5
  if (index < 6) return 8
  return 10
}

// Seconds on the clock in speed mode; tightens with the matrix.
function timeLimit(index: number) {
  if (index < STATIC_ROUNDS) return 8
  if (index < 6) return 6.5
  return 5
}

function readBest(mode: Mode): number | null {
  try {
    const v = window.localStorage.getItem(`proportion.best.${mode}`)
    return v === null ? null : Number(v)
  } catch {
    return null
  }
}

function writeBest(mode: Mode, score: number) {
  try {
    window.localStorage.setItem(`proportion.best.${mode}`, String(score))
  } catch {
    /* private mode, no-op */
  }
}

function makeRound(index: number, prev: Round | null): Round {
  const max = matrixSize(index)
  let a = randInt(max)
  let b = randInt(max)
  // Never the same ratio twice in a row.
  for (let i = 0; prev && i < 20 && a * prev.b === b * prev.a; i++) {
    a = randInt(max)
    b = randInt(max)
  }
  if (index < STATIC_ROUNDS) return { a, b, scale: 1, ox: 0, oy: 0 }
  const scale = SCALE_MIN + Math.random() * (SCALE_MAX - SCALE_MIN)
  // Displacement is inversely proportional to scale: the smallest
  // shape can land anywhere, a big one stays near the centre.
  const reach = Math.min(1, SCALE_MIN / scale)
  return {
    a,
    b,
    scale,
    ox: (Math.random() * 2 - 1) * reach,
    oy: (Math.random() * 2 - 1) * reach,
  }
}

function judge(gw: number, gh: number, round: Round): Omit<Result, "bonus"> {
  // Cross-multiplying compares the fractions exactly, no rounding.
  if (gw * round.b === gh * round.a) {
    return { v: "spot-on", points: MAX_POINTS, gw, gh }
  }
  const err = Math.abs(Math.log(gw / gh / (round.a / round.b)))
  const points = Math.min(
    MAX_POINTS - 1,
    Math.max(0, Math.round(MAX_POINTS * (1 - err / ZERO_AT))),
  )
  return { v: points >= 5 ? "ballpark" : "miss", points, gw, gh }
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
  const t = useT()
  const [stage, setStage] = useState<"intro" | "playing" | "results">("intro")
  const [mode, setMode] = useState<Mode>("calm")
  const [index, setIndex] = useState(0)
  const [round, setRound] = useState<Round | null>(null)
  const [gw, setGw] = useState<number | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [history, setHistory] = useState<Entry[]>([])
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState<{ prev: number | null; isNew: boolean }>({ prev: null, isNew: false })
  const startedAt = useRef(0)
  const arenaRef = useRef<HTMLDivElement | null>(null)

  const score = history.reduce((s, e) => s + e.points + e.bonus, 0)
  const limit = mode === "speed" ? timeLimit(index) : null

  const deal = useCallback((i: number) => {
    setIndex(i)
    setRound((prev) => makeRound(i, i === 0 ? null : prev))
    setGw(null)
    setResult(null)
    startedAt.current = performance.now()
  }, [])

  const start = useCallback(
    (m: Mode) => {
      setMode(m)
      setHistory([])
      setStreak(0)
      setStage("playing")
      deal(0)
      // On a phone the title pushes the board half off-screen.
      arenaRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" })
    },
    [deal],
  )

  const settle = useCallback(
    (r: Result) => {
      if (!round) return
      setResult(r)
      setHistory((h) => [...h, { ...r, a: round.a, b: round.b }])
      setStreak((s) => (r.v === "spot-on" ? s + 1 : 0))
      if (r.v === "spot-on") playSfx("/correct.wav", 0.4)
      else if (r.v === "ballpark") playSfx("/nb.wav", 0.4)
      else playSfx("/incorrect.wav", 0.35)
      try {
        navigator.vibrate?.(r.v === "miss" ? [30, 40, 30] : 15)
      } catch {
        /* no-op */
      }
    },
    [round],
  )

  const pick = useCallback(
    (n: number) => {
      if (!round || result) return
      if (gw === null) {
        setGw(n)
        return
      }
      const r = judge(gw, n, round)
      let bonus = 0
      if (limit !== null && r.points >= MAX_POINTS / 2) {
        const elapsed = (performance.now() - startedAt.current) / 1000
        bonus = Math.round(MAX_BONUS * Math.max(0, 1 - elapsed / limit))
      }
      settle({ ...r, bonus })
    },
    [round, result, gw, limit, settle],
  )

  // Speed mode: the round scores zero when the clock runs out.
  useEffect(() => {
    if (stage !== "playing" || limit === null || result) return
    const left = limit * 1000 - (performance.now() - startedAt.current)
    const id = window.setTimeout(
      () => settle({ v: "miss", points: 0, bonus: 0, gw: 0, gh: 0, timedOut: true }),
      Math.max(0, left),
    )
    return () => window.clearTimeout(id)
  }, [stage, limit, result, index, settle])

  // Speed mode keeps moving: the answer shows briefly, then the next
  // shape is dealt. Enter skips the wait.
  const advanceRef = useRef<() => void>(() => {})
  useEffect(() => {
    if (stage !== "playing" || mode !== "speed" || !result) return
    const id = window.setTimeout(() => advanceRef.current(), 1500)
    return () => window.clearTimeout(id)
  }, [stage, mode, result])

  const back = useCallback(() => {
    if (!result) setGw(null)
  }, [result])

  const advance = useCallback(() => {
    const next = index + 1
    if (next >= TOTAL_ROUNDS) {
      const prev = readBest(mode)
      const isNew = prev === null || score > prev
      if (isNew) writeBest(mode, score)
      setBest({ prev, isNew })
      setStage("results")
      return
    }
    deal(next)
  }, [index, mode, score, deal])

  useEffect(() => {
    advanceRef.current = advance
  }, [advance])

  // Keyboard: 1–9 and 0 (= 10) pick a number, Backspace reopens the
  // width, Enter/Space moves on once the round is scored.
  useEffect(() => {
    if (stage !== "playing") return
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault()
        pick(e.key === "0" ? 10 : Number(e.key))
      } else if (e.key === "Backspace" || e.key === "Escape") {
        back()
      } else if ((e.key === "Enter" || e.key === " ") && result) {
        e.preventDefault()
        advance()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [stage, result, pick, back, advance])

  return (
    <GameShell title={t("prop.title")} blurb={t("prop.blurb")}>
      <div
        ref={arenaRef}
        className="relative flex w-full scroll-mb-4 scroll-mt-32 flex-col overflow-hidden lg:flex-row"
        style={{
          height: "min(76dvh, 680px)",
          minHeight: 440,
          background: "color-mix(in srgb, var(--surface-dark) 96%, var(--ink) 4%)",
          border: "1.5px solid var(--ink)",
          filter: "url(#ink-wobble)",
        }}
      >
        {stage === "intro" && <Intro onStart={start} />}

        {stage === "playing" && round && (
          <Playing
            round={round}
            index={index}
            gw={gw}
            result={result}
            score={score}
            streak={streak}
            limit={limit}
            onPick={pick}
            onBack={back}
            onNext={advance}
          />
        )}

        {stage === "results" && (
          <Results
            score={score}
            mode={mode}
            history={history}
            best={best}
            onRestart={() => start(mode)}
            onMenu={() => setStage("intro")}
          />
        )}
      </div>
    </GameShell>
  )
}

// --- subviews ----------------------------------------------------

function Intro({ onStart }: { onStart: (m: Mode) => void }) {
  const t = useT()
  // Enter starts the calm game, S the timed one.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") onStart("calm")
      else if (e.key.toLowerCase() === "s") onStart("speed")
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onStart])
  return (
    <div className="absolute inset-0 flex flex-col items-center gap-6 overflow-y-auto p-6 text-center sm:p-8 [&>*:first-child]:mt-auto [&>*:last-child]:mb-auto">
      <p
        className="max-w-lg text-base sm:text-lg"
        style={{
          color: "var(--text-muted)",
          fontFamily: "var(--font-display)",
        }}
      >
        {t("prop.intro")}
      </p>
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-start sm:gap-6">
        {(["calm", "speed"] as const).map((m) => (
          <div key={m} className="flex flex-col items-center gap-2">
            <button onClick={() => onStart(m)} className="btn-primary">
              <span>{t(m === "calm" ? "prop.calm" : "prop.speed")}</span>
              <span aria-hidden style={{ filter: "url(#ink-wobble)" }}>→</span>
            </button>
            <span className="max-w-[14rem] text-xs" style={{ color: "var(--text-muted)" }}>
              {t(m === "calm" ? "prop.calmHint" : "prop.speedHint")}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function useSize() {
  const ref = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState<{ w: number; h: number } | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, size] as const
}

const verdictColor = (v: Verdict) =>
  v === "spot-on" ? "#3a9d4e" : v === "ballpark" ? "#c08a2c" : "var(--vermilion, #ee4a44)"

function Playing({
  round, index, gw, result, score, streak, limit, onPick, onBack, onNext,
}: {
  round: Round
  index: number
  gw: number | null
  result: Result | null
  score: number
  streak: number
  limit: number | null
  onPick: (n: number) => void
  onBack: () => void
  onNext: () => void
}) {
  const t = useT()
  const [stageRef, size] = useSize()

  // Pixel geometry is derived from the measured stage, so a resize
  // keeps the same round instead of dealing a new one.
  let shape: { w: number; h: number; x: number; y: number } | null = null
  let ghost: { w: number; h: number } | null = null
  if (size) {
    const pad = 16
    const top = 44 // room for the HUD
    const availW = Math.max(40, size.w - pad * 2)
    const availH = Math.max(40, size.h - top - pad)
    const base = Math.min(availW, availH) * 0.8
    const unit = Math.min(
      (base * round.scale) / Math.max(round.a, round.b),
      availW / round.a,
      availH / round.b,
    )
    const w = round.a * unit
    const h = round.b * unit
    shape = {
      w,
      h,
      x: (round.ox * (availW - w)) / 2,
      y: (top - pad) / 2 + (round.oy * (availH - h)) / 2,
    }
    if (result && result.v !== "spot-on" && !result.timedOut) {
      // The guessed ratio at the same area, laid over the shape.
      const g = result.gw / result.gh
      const area = w * h
      ghost = { w: Math.sqrt(area * g), h: Math.sqrt(area / g) }
    }
  }

  const [ta, tb] = reduce(round.a, round.b)
  const step = gw === null ? "w" : "h"

  return (
    <>
      {/* Stage */}
      <div ref={stageRef} className="relative min-h-0 flex-1 overflow-hidden">
        {limit !== null && (
          <div className="absolute inset-x-0 top-0 z-20 h-1.5" aria-hidden>
            {!result && (
              <motion.div
                key={index}
                className="h-full origin-left"
                style={{ background: "var(--ink)" }}
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: limit, ease: "linear" }}
              />
            )}
          </div>
        )}

        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-baseline justify-between gap-2 p-4 text-[0.65rem] uppercase tracking-[0.2em] sm:text-xs sm:tracking-[0.3em]"
          style={{ color: "var(--text-muted)" }}
        >
          <span>{t("game.round")} {index + 1} / {TOTAL_ROUNDS}</span>
          {streak > 1 && (
            <span style={{ color: verdictColor("spot-on") }}>
              {t("prop.streak")} ×{streak}
            </span>
          )}
          <span>{t("game.score")} <strong style={{ color: "var(--ink)" }}>{score}</strong></span>
        </div>

        {shape && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex shrink-0 items-center justify-center"
              style={{
                width: shape.w,
                height: shape.h,
                translate: `${shape.x}px ${shape.y}px`,
                background: "var(--ink)",
                borderRadius: 2,
              }}
            >
              {ghost && result && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="absolute shrink-0"
                  style={{
                    width: ghost.w,
                    height: ghost.h,
                    border: `2px dashed ${verdictColor(result.v)}`,
                    borderRadius: 2,
                  }}
                />
              )}
            </motion.div>
          </div>
        )}
      </div>

      {/* Answer: width, then height */}
      <div
        className="z-20 flex min-h-[11.5rem] flex-col items-center justify-center gap-3 border-t-[1.5px] border-[var(--ink)] p-3 sm:p-4 lg:w-[290px] lg:shrink-0 lg:border-l-[1.5px] lg:border-t-0 lg:p-4"
      >
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key="verdict"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center"
              aria-live="polite"
            >
              <div
                className="text-2xl sm:text-3xl lg:text-[40px] lg:leading-tight"
                style={{ fontFamily: "var(--font-display)", color: verdictColor(result.v) }}
              >
                {result.timedOut ? t("prop.timeUp") : result.v === "spot-on" ? t("prop.spotOn") : result.v === "ballpark" ? t("prop.ballpark") : t("prop.miss")}{" "}
                <span className="whitespace-nowrap" style={{ color: "var(--text-muted)", fontSize: "0.7em" }}>
                  +{result.points}
                  {result.bonus > 0 && ` +${result.bonus} ${t("prop.fast")}`}
                </span>
              </div>
              <div
                className="mt-1 text-sm uppercase tracking-[0.3em] lg:text-[17px]"
                style={{ color: "var(--text-muted)" }}
              >
                {t("prop.actual")} <strong style={{ color: "var(--ink)" }}>{ta} : {tb}</strong>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] lg:flex-col lg:gap-2 lg:text-[15px]"
          style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}
        >
          <span className="whitespace-nowrap tracking-[0.2em] sm:tracking-[0.3em]">
            {result ? t("prop.yourGuess") : step === "w" ? t("prop.width") : t("prop.height")}
          </span>
          <div className="flex items-center gap-3 lg:gap-2">
          <button
            type="button"
            onClick={onBack}
            disabled={!!result || gw === null}
            aria-label={t("prop.width")}
            className="min-w-10 px-2 py-1 text-xl tracking-normal lg:min-w-[44px] lg:text-[34px] lg:leading-none"
            style={slotStyle(!result && step === "w")}
          >
            {gw ?? "–"}
          </button>
          <span className="text-xl lg:text-[34px]" style={{ color: "var(--ink)" }}>:</span>
          <span
            aria-label={t("prop.height")}
            className="min-w-10 px-2 py-1 text-center text-xl tracking-normal lg:min-w-[44px] lg:text-[34px] lg:leading-none"
            style={slotStyle(!result && step === "h")}
          >
            {result && !result.timedOut ? result.gh : "–"}
          </span>
          </div>
        </div>

        {result ? (
          <button onClick={onNext} className="btn-primary lg:-my-2 lg:scale-[0.72]">
            <span>{t("game.next")}</span>
            <span aria-hidden style={{ filter: "url(#ink-wobble)" }}>→</span>
          </button>
        ) : (
          <div className="grid w-full max-w-md grid-cols-5 gap-1.5 sm:grid-cols-10 lg:grid-cols-5">
            {NUMBERS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onPick(n)}
                className="h-11 touch-manipulation select-none text-base transition-colors active:bg-[var(--ink)] active:text-[var(--surface-dark)] sm:h-10 lg:flex lg:h-[36px] lg:items-center lg:justify-center lg:text-[24px] lg:leading-none [@media(hover:hover)]:hover:bg-[var(--ink)] [@media(hover:hover)]:hover:text-[var(--surface-dark)]"
                style={{
                  border: "1.5px solid var(--ink)",
                  color: "var(--ink)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {n}
              </button>
            ))}
          </div>
        )}
        {/* Keyboard is the fast way in; only shown where there is one. */}
        <div
          className="hidden text-center text-[14px] uppercase leading-relaxed tracking-[0.2em] [@media(hover:hover)]:block"
          style={{ color: "var(--text-muted)" }}
        >
          {result ? t("prop.keysNext") : t("prop.keys")}
        </div>
      </div>
    </>
  )
}

function slotStyle(active: boolean): React.CSSProperties {
  return {
    color: "var(--ink)",
    border: "1.5px solid transparent",
    borderBottomColor: "var(--ink)",
    outline: active ? "1.5px solid var(--ink)" : "none",
  }
}

function Results({
  score, mode, history, best, onRestart, onMenu,
}: {
  score: number
  mode: Mode
  history: Entry[]
  best: { prev: number | null; isNew: boolean }
  onRestart: () => void
  onMenu: () => void
}) {
  const t = useT()
  const max = TOTAL_ROUNDS * (MAX_POINTS + (mode === "speed" ? MAX_BONUS : 0))
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        onRestart()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onRestart])
  return (
    <div className="absolute inset-0 flex flex-col items-center gap-4 overflow-y-auto p-4 text-center sm:gap-5 sm:p-8 [&>*:first-child]:mt-auto [&>*:last-child]:mb-auto">
      <div
        className="text-xs uppercase tracking-[0.3em]"
        style={{ color: "var(--text-muted)" }}
      >
        {t("game.final")} · {t(mode === "calm" ? "prop.calm" : "prop.speed")}
      </div>
      <div
        className="text-[clamp(3rem,10vw,5rem)] leading-[0.9]"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        {score}
      </div>
      <div className="text-sm" style={{ color: "var(--text-muted)" }}>
        {t("game.outOf").replace("{n}", String(max))}{" "}
        {best.isNew && best.prev !== null ? (
          <strong style={{ color: verdictColor("spot-on") }}>{t("prop.newBest")}</strong>
        ) : (
          best.prev !== null && <span>{t("prop.best")} {best.prev}</span>
        )}
      </div>

      {/* Every round: the shape, what it was, what you said. */}
      <div className="grid w-full max-w-xl grid-cols-5 gap-1.5 sm:grid-cols-10">
        {history.map((e, i) => {
          const [ta, tb] = reduce(e.a, e.b)
          const u = 22 / Math.max(e.a, e.b)
          return (
            <div
              key={i}
              className="flex flex-col items-center gap-1 px-1 py-1.5 text-[0.65rem] leading-tight"
              style={{ border: "1px solid color-mix(in srgb, var(--ink) 30%, transparent)", color: "var(--text-muted)" }}
            >
              <div className="flex h-6 w-6 items-center justify-center">
                <div style={{ width: e.a * u, height: e.b * u, background: "var(--ink)" }} />
              </div>
              <span style={{ color: "var(--ink)" }}>{ta}:{tb}</span>
              <span>{e.timedOut ? "–" : `${e.gw}:${e.gh}`}</span>
              <strong style={{ color: verdictColor(e.v) }}>+{e.points + e.bonus}</strong>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <button onClick={onRestart} className="btn-primary">
          <span>{t("game.again")}</span>
          <span aria-hidden style={{ filter: "url(#ink-wobble)" }}>↻</span>
        </button>
        <button
          onClick={onMenu}
          className="text-xs uppercase tracking-[0.3em] underline underline-offset-4"
          style={{ color: "var(--text-muted)" }}
        >
          {t("prop.changeMode")}
        </button>
      </div>
    </div>
  )
}
