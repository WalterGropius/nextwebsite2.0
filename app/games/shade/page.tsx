"use client"

// Shade — match the swatch. A target colour, five candidates, exactly
// one identical; the other four differ along ONE axis (tone, hue or
// saturation, in OKLCH). Distractors sit at distinct whole multiples
// of the current step from the target, so every swatch is at least one
// step from every other one — no accidental duplicates. The step
// shrinks ×0.75 per hit and relaxes a little per miss.

import { useCallback, useEffect, useRef, useState } from "react"
import { motion } from "motion/react"
import { GameShell } from "@/components/game-shell"
import { useI18n, useT } from "@/lib/i18n/provider"
import { pick } from "@/lib/i18n/localize"
import { C, fill } from "./copy"

type Mode = "tone" | "hue" | "sat"
const MODES: Mode[] = ["tone", "hue", "sat"]
const TOTAL_ROUNDS = 10
const ROUND_MS = 6000
const REVEAL_MS = 700
const SHRINK = 0.75
const RELAX = 1.2

// Starting step and floor per axis (L in 0..1, hue in degrees, chroma).
const STEP0: Record<Mode, number> = { tone: 0.14, hue: 30, sat: 0.055 }
const STEP_MIN: Record<Mode, number> = { tone: 0.012, hue: 2, sat: 0.006 }

interface Colour { l: number; c: number; h: number }
interface Round { target: Colour; options: Colour[]; answer: number }

const rnd = (a: number, b: number) => a + Math.random() * (b - a)
const css = ({ l, c, h }: Colour) => `oklch(${l.toFixed(4)} ${c.toFixed(4)} ${((h % 360) + 360) % 360})`

function shuffle<T>(a: T[]): T[] {
  const r = a.slice()
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}

function makeRound(mode: Mode, step: number): Round {
  // Base colours leave room for ±3 steps along the varied axis.
  const base: Colour = { l: rnd(0.55, 0.78), c: rnd(0.08, 0.14), h: rnd(0, 360) }
  if (mode === "tone") {
    base.l = rnd(0.3 + 3 * step, 0.9 - 3 * step)
    base.c = rnd(0.06, 0.12)
  }
  if (mode === "sat") {
    base.c = rnd(0.02 + 3 * step, 0.2 - 3 * step)
    base.l = rnd(0.6, 0.72)
  }
  const apply = (k: number): Colour => {
    const o = { ...base }
    if (mode === "tone") o.l += k * step
    else if (mode === "hue") o.h += k * step
    else o.c += k * step
    return o
  }
  // Four distinct non-zero multiples, so neighbours differ by >= 1 step.
  const ks = shuffle([-3, -2, -1, 1, 2, 3]).slice(0, 4)
  const options = shuffle([base, ...ks.map(apply)])
  return { target: base, options, answer: options.indexOf(base) }
}

function levelOf(mode: Mode, step: number) {
  return 1 + Math.round(Math.log(STEP0[mode] / step) / Math.log(1 / SHRINK))
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

const bestKey = (m: Mode) => `shade.best.${m}`
function loadBest(m: Mode): number {
  try {
    return Number(localStorage.getItem(bestKey(m))) || 0
  } catch {
    return 0
  }
}
function saveBest(m: Mode, v: number) {
  try {
    localStorage.setItem(bestKey(m), String(v))
  } catch {
    /* no-op */
  }
}

export default function ShadePage() {
  const t = useT()
  const { lang } = useI18n()
  const p = (l: Parameters<typeof pick>[0]) => pick(l, lang)

  const [stage, setStage] = useState<"intro" | "playing" | "results">("intro")
  const [mode, setMode] = useState<Mode>("tone")
  const [index, setIndex] = useState(0)
  const [step, setStep] = useState(STEP0.tone)
  const [round, setRound] = useState<Round | null>(null)
  const [picked, setPicked] = useState<number | null>(null) // -1 = timeout
  const [score, setScore] = useState(0)
  const [hits, setHits] = useState(0)
  const [topLevel, setTopLevel] = useState(1)
  const [last, setLast] = useState(0)
  const [bests, setBests] = useState<Record<Mode, number>>({ tone: 0, hue: 0, sat: 0 })
  const [isNew, setIsNew] = useState(false)
  const startedAt = useRef(0)
  const arena = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setBests({ tone: loadBest("tone"), hue: loadBest("hue"), sat: loadBest("sat") })
  }, [])

  const start = useCallback(() => {
    setScore(0)
    setHits(0)
    setTopLevel(1)
    setIndex(0)
    setStep(STEP0[mode])
    setRound(makeRound(mode, STEP0[mode]))
    setPicked(null)
    setLast(0)
    setIsNew(false)
    startedAt.current = Date.now()
    setStage("playing")
    arena.current?.scrollIntoView({ block: "center", behavior: "smooth" })
  }, [mode])

  const answer = useCallback(
    (i: number) => {
      if (!round || picked !== null) return
      const ok = i === round.answer
      const lvl = levelOf(mode, step)
      let gained = 0
      if (ok) {
        const left = Math.max(0, 1 - (Date.now() - startedAt.current) / ROUND_MS)
        gained = 10 * lvl + Math.round(5 * left)
        setHits((h) => h + 1)
        setTopLevel((v) => Math.max(v, lvl))
        setStep((s) => Math.max(STEP_MIN[mode], s * SHRINK))
        playSfx("/correct.wav", 0.4)
      } else {
        setStep((s) => Math.min(STEP0[mode], s * RELAX))
        playSfx(i < 0 ? "/nb.wav" : "/incorrect.wav", 0.35)
      }
      setLast(gained)
      setScore((s) => s + gained)
      setPicked(i)
    },
    [round, picked, mode, step],
  )

  // Auto-advance after the reveal.
  useEffect(() => {
    if (picked === null || stage !== "playing") return
    const id = setTimeout(() => {
      const next = index + 1
      if (next >= TOTAL_ROUNDS) {
        setStage("results")
        return
      }
      setIndex(next)
      setRound(makeRound(mode, step))
      setPicked(null)
      startedAt.current = Date.now()
    }, REVEAL_MS)
    return () => clearTimeout(id)
  }, [picked, stage, index, mode, step])

  // Round countdown; running out counts as a miss.
  useEffect(() => {
    if (stage !== "playing" || picked !== null) return
    const id = setTimeout(() => answer(-1), ROUND_MS)
    return () => clearTimeout(id)
  }, [stage, picked, index, answer])

  // Save the best once the game ends.
  useEffect(() => {
    if (stage !== "results") return
    if (score > bests[mode]) {
      saveBest(mode, score)
      setBests((b) => ({ ...b, [mode]: score }))
      setIsNew(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (stage === "playing" && /^[1-5]$/.test(e.key)) {
        e.preventDefault()
        answer(Number(e.key) - 1)
      } else if ((e.key === "Enter" || e.key === " ") && stage !== "playing") {
        e.preventDefault()
        start()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [stage, answer, start])

  const modeLabel = (m: Mode) => p(m === "tone" ? C.modeTone : m === "hue" ? C.modeHue : C.modeSat)
  const muted = { color: "var(--text-muted)" }

  return (
    <GameShell title={p(C.title)} blurb={p(C.blurb)}>
      <div
        ref={arena}
        className="relative flex w-full flex-col overflow-hidden"
        style={{
          minHeight: "max(540px, min(78vh, 640px))",
          background: "color-mix(in srgb, var(--surface-dark) 96%, var(--ink) 4%)",
        }}
      >
        {/* wobbly frame only: the filter must not touch the swatches */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-30"
          style={{ border: "1.5px solid var(--ink)", filter: "url(#ink-wobble)" }}
        />

        {stage === "intro" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 overflow-auto p-6 text-center">
            <p className="max-w-lg text-base sm:text-lg" style={{ ...muted, fontFamily: "var(--font-display)" }}>
              {p(C.intro)}
            </p>
            <div className="grid w-full max-w-md grid-cols-3 gap-2">
              {MODES.map((m) => {
                const on = m === mode
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    aria-pressed={on}
                    className="flex min-h-14 flex-col items-center justify-center gap-1 px-1 py-2 text-sm transition-colors"
                    style={{
                      border: "1.5px solid var(--ink)",
                      background: on ? "var(--ink)" : "transparent",
                      color: on ? "var(--surface-dark)" : "var(--ink)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    <span>{modeLabel(m)}</span>
                    <span className="text-[10px] uppercase tracking-[0.2em]" style={{ opacity: 0.7 }}>
                      {p(C.best)} {bests[m]}
                    </span>
                  </button>
                )
              })}
            </div>
            <button onClick={start} className="btn-primary">
              <span>{t("game.start")}</span>
              <span aria-hidden style={{ filter: "url(#ink-wobble)" }}>→</span>
            </button>
            <div className="hidden text-xs uppercase tracking-[0.3em] sm:block" style={muted}>
              {p(C.keys)}
            </div>
          </div>
        )}

        {stage === "playing" && round && (
          <>
            <div
              className="flex items-baseline justify-between gap-2 px-3 pt-3 text-[11px] sm:px-4 sm:pt-4 uppercase tracking-[0.3em] sm:text-xs"
              style={muted}
            >
              <span>{t("game.round")} {index + 1}/{TOTAL_ROUNDS}</span>
              <span>
                {p(C.level)} <strong style={{ color: "var(--ink)" }}>{levelOf(mode, step)}</strong>
              </span>
              <span>
                {t("game.score")} <strong style={{ color: "var(--ink)" }}>{score}</strong>
              </span>
            </div>

            {/* countdown */}
            <div className="mx-3 mt-2 h-1.5 sm:mx-4 sm:mt-3" style={{ background: "color-mix(in srgb, var(--ink) 12%, transparent)" }}>
              <motion.div
                key={`${index}-${picked === null}`}
                className="h-full"
                style={{ background: "var(--ink)", transformOrigin: "left" }}
                initial={{ scaleX: picked === null ? 1 : 0 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: ROUND_MS / 1000, ease: "linear" }}
              />
            </div>

            {/* neutral panel */}
            <div className="m-2 flex min-h-0 flex-1 flex-col gap-3 p-2 sm:m-4 sm:gap-4 sm:p-5" style={{ background: "#808080" }}>
              <div className="flex flex-1 flex-col items-center justify-center gap-2">
                <div className="text-[10px] uppercase tracking-[0.3em]" style={{ color: "rgba(255,255,255,0.75)" }}>
                  {p(C.target)}
                </div>
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className="min-h-[110px] w-full max-w-md flex-1"
                  style={{ background: css(round.target) }}
                />
              </div>

              <div className="grid w-full shrink-0 grid-cols-5 gap-1 sm:mx-auto sm:max-w-md sm:gap-3">
                {round.options.map((o, i) => {
                  const isAnswer = i === round.answer
                  const showRight = picked !== null && isAnswer
                  const showWrong = picked === i && !isAnswer
                  return (
                    <div key={`${index}-${i}`} className="flex min-w-0 flex-col items-center gap-1">
                      <button
                        type="button"
                        onClick={() => answer(i)}
                        disabled={picked !== null}
                        aria-label={`${i + 1}`}
                        className="h-24 w-full sm:h-28"
                        style={{
                          background: css(o),
                          outline: showRight
                            ? "3px solid #fff"
                            : showWrong
                              ? "3px solid var(--vermilion, #ee4a44)"
                              : "none",
                          outlineOffset: 2,
                          opacity: picked !== null && !showRight && !showWrong ? 0.55 : 1,
                          transition: "opacity 0.15s",
                        }}
                      />
                      <span className="hidden text-xs sm:block" style={{ color: "rgba(255,255,255,0.75)" }}>
                        {i + 1}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div
              className="h-8 pb-3 text-center text-sm uppercase tracking-[0.3em]"
              style={{
                fontFamily: "var(--font-display)",
                color: picked === null ? "transparent" : last > 0 ? "#3a9d4e" : "var(--vermilion, #ee4a44)",
              }}
            >
              {picked === null ? "." : last > 0 ? `${p(C.hit)} +${last}` : p(picked === -1 ? C.late : C.miss)}
            </div>
          </>
        )}

        {stage === "results" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-8 text-center">
            <div className="text-xs uppercase tracking-[0.3em]" style={muted}>
              {t("game.final")} · {modeLabel(mode)}
            </div>
            <div
              className="text-[clamp(3rem,10vw,6rem)] leading-[0.9]"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
            >
              {score}
            </div>
            <div className="text-sm uppercase tracking-[0.3em]" style={{ color: isNew ? "#3a9d4e" : "var(--text-muted)" }}>
              {isNew ? p(C.newBest) : `${p(C.best)} ${bests[mode]}`}
            </div>
            <div style={muted}>
              {fill(p(C.hits), { n: hits, t: TOTAL_ROUNDS })} · {fill(p(C.topLevel), { n: topLevel })}
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
