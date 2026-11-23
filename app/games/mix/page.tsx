"use client"

// Mix — match a target colour with three sliders, against the clock.
//
// Two models: "light" (additive RGB, start dark grey) and "paint"
// (subtractive CMY, start white, each slider removes its complement).
// Both are linear in sRGB, so every target is reachable and each
// slider track is an exact two-stop gradient given the other two.
// Score comes from CIELAB ΔE: ≤ 2 is full marks, 0 by ΔE 25, plus a
// small speed bonus when the match is good.

import { useCallback, useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { GameShell } from "@/components/game-shell"
import { useI18n, useT } from "@/lib/i18n/provider"
import { pick } from "@/lib/i18n/localize"
import { C } from "./copy"

type Model = "light" | "paint"
type Vals = [number, number, number]
type Verdict = 0 | 1 | 2 | 3 | 4

interface Result {
  dE: number
  base: number
  bonus: number
  points: number
  mine: Vals
  timedOut: boolean
}

const TOTAL_ROUNDS = 6
const ROUND_MS = 15000
const FULL_AT = 2
const ZERO_AT = 25
const MAX_BONUS = 2
const MAX_PER_ROUND = 10 + MAX_BONUS
const MAX_TOTAL = TOTAL_ROUNDS * MAX_PER_ROUND

const START: Record<Model, Vals> = { light: [0.5, 0.5, 0.5], paint: [0, 0, 0] }
const KEYS: Record<Model, [keyof typeof C, keyof typeof C, keyof typeof C]> = {
  light: ["r", "g", "b"],
  paint: ["c", "m", "y"],
}
const TRACK_TINT: Record<Model, string[]> = {
  light: ["#ff4a4a", "#3fe05a", "#5a7bff"],
  paint: ["#00bcd4", "#e0208c", "#f2d400"],
}

// --- colour maths ------------------------------------------------

function toRgb(model: Model, v: Vals): Vals {
  return model === "light" ? v : [1 - v[0], 1 - v[1], 1 - v[2]]
}

function css(rgb: Vals) {
  const [r, g, b] = rgb.map((x) => Math.round(Math.min(1, Math.max(0, x)) * 255))
  return `rgb(${r}, ${g}, ${b})`
}

function lab(rgb: Vals): Vals {
  const lin = rgb.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  const [r, g, b] = lin
  const x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047
  const y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b
  const z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / 1.08883
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116)
  const fx = f(x), fy = f(y), fz = f(z)
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}

function deltaE(a: Vals, b: Vals) {
  const la = lab(a), lb = lab(b)
  return Math.hypot(la[0] - lb[0], la[1] - lb[1], la[2] - lb[2])
}

function makeTarget(model: Model): Vals {
  const start = toRgb(model, START[model])
  for (let i = 0; i < 50; i++) {
    const v: Vals = [0, 0, 0].map(() => 0.06 + Math.random() * 0.88) as Vals
    // far enough from the starting swatch that it takes a real mix
    if (deltaE(start, toRgb(model, v)) > 22) return v
  }
  return [0.8, 0.3, 0.6]
}

function score(dE: number, timeLeftFrac: number, timedOut: boolean) {
  const t = Math.min(1, Math.max(0, (dE - FULL_AT) / (ZERO_AT - FULL_AT)))
  const base = 10 * (1 - t) ** 1.2
  // the bonus only exists for a good match, and fades with the clock
  const good = Math.min(1, Math.max(0, (9 - dE) / 7))
  const bonus = timedOut ? 0 : MAX_BONUS * good * timeLeftFrac
  const r = (x: number) => Math.round(x * 10) / 10
  return { base: r(base), bonus: r(bonus), points: r(base + bonus) }
}

function verdictOf(dE: number): Verdict {
  return dE <= 2 ? 0 : dE <= 5 ? 1 : dE <= 10 ? 2 : dE <= 18 ? 3 : 4
}

const verdictColor = (v: Verdict) =>
  v <= 1 ? "#3a9d4e" : v === 2 ? "#c08a2c" : "var(--vermilion, #ee4a44)"

function playSfx(path: string, volume = 0.5) {
  try {
    const a = new Audio(path)
    a.volume = volume
    a.play().catch(() => {})
  } catch {
    /* no-op */
  }
}

function loadBest(model: Model): number {
  try {
    const n = Number(localStorage.getItem(`mix.best.${model}`))
    return Number.isFinite(n) ? n : 0
  } catch {
    return 0
  }
}

function saveBest(model: Model, n: number) {
  try {
    localStorage.setItem(`mix.best.${model}`, String(n))
  } catch {
    /* no-op */
  }
}

// --- page --------------------------------------------------------

export default function MixPage() {
  const { lang } = useI18n()
  const p = (l: Parameters<typeof pick>[0]) => pick(l, lang)

  const [stage, setStage] = useState<"intro" | "playing" | "results">("intro")
  const [model, setModel] = useState<Model>("light")
  const [index, setIndex] = useState(0)
  const [target, setTarget] = useState<Vals>([0.5, 0.5, 0.5])
  const [vals, setVals] = useState<Vals>(START.light)
  const [result, setResult] = useState<Result | null>(null)
  const [total, setTotal] = useState(0)
  const [deltas, setDeltas] = useState<number[]>([])
  const [best, setBest] = useState<Record<Model, number>>({ light: 0, paint: 0 })
  const [isNewBest, setIsNewBest] = useState(false)

  useEffect(() => {
    setBest({ light: loadBest("light"), paint: loadBest("paint") })
  }, [])

  const valsRef = useRef(vals)
  valsRef.current = vals
  const resultRef = useRef(result)
  resultRef.current = result
  const lockedAt = useRef(0)
  const arenaRef = useRef<HTMLDivElement | null>(null)

  const begin = useCallback((m: Model) => {
    setModel(m)
    setTotal(0)
    setDeltas([])
    setIndex(0)
    setTarget(makeTarget(m))
    setVals(START[m])
    setResult(null)
    setIsNewBest(false)
    setStage("playing")
    // bring the whole arena under the nav so sliders and button are in reach
    requestAnimationFrame(() => arenaRef.current?.scrollIntoView({ block: "start", behavior: "smooth" }))
  }, [])

  const lock = useCallback(
    (timeLeftFrac: number, timedOut: boolean) => {
      if (resultRef.current) return
      const mine = valsRef.current
      const dE = deltaE(toRgb(model, mine), toRgb(model, target))
      const s = score(dE, timeLeftFrac, timedOut)
      const r: Result = { dE, ...s, mine, timedOut }
      lockedAt.current = performance.now()
      setResult(r)
      setTotal((x) => Math.round((x + s.points) * 10) / 10)
      setDeltas((d) => [...d, dE])
      const v = verdictOf(dE)
      if (v <= 1) playSfx("/correct.wav", 0.4)
      else if (v <= 3) playSfx("/nb.wav", 0.4)
      else playSfx("/incorrect.wav", 0.35)
    },
    [model, target],
  )

  const advance = useCallback(() => {
    if (!resultRef.current) return
    const next = index + 1
    if (next >= TOTAL_ROUNDS) {
      setBest((b) => {
        if (total > b[model]) {
          saveBest(model, total)
          setIsNewBest(true)
          return { ...b, [model]: total }
        }
        return b
      })
      setStage("results")
      return
    }
    setIndex(next)
    setTarget(makeTarget(model))
    setVals(START[model])
    setResult(null)
  }, [index, model, total])

  // Enter / Space locks in, then moves on. A short guard stops a held
  // key from skipping straight through the result.
  useEffect(() => {
    if (stage !== "playing") return
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return
      if (e.key !== "Enter" && e.key !== " ") return
      if ((e.target as HTMLElement | null)?.tagName === "BUTTON") return
      e.preventDefault()
      if (!resultRef.current) {
        lock(timeLeftRef.current, false)
      } else if (performance.now() - lockedAt.current > 350) {
        advance()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [stage, lock, advance])

  const timeLeftRef = useRef(1)

  return (
    <GameShell title={p(C.title)} blurb={p(C.blurb)}>
      <style>{RANGE_CSS}</style>
      <div
        ref={arenaRef}
        className="relative flex w-full flex-col overflow-hidden"
        style={{
          scrollMarginTop: 128,
          minHeight: stage === "playing" ? undefined : 420,
          background: "color-mix(in srgb, var(--surface-dark) 96%, var(--ink) 4%)",
        }}
      >
        {/* the wobbly border lives on its own layer so the swatches stay true */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-30"
          style={{ border: "1.5px solid var(--ink)", filter: "url(#ink-wobble)" }}
        />

        {stage === "intro" && <Intro best={best} onStart={begin} />}

        {stage === "playing" && (
          <Playing
            key={`${model}-${index}`}
            model={model}
            index={index}
            target={target}
            vals={vals}
            setVals={setVals}
            result={result}
            total={total}
            timeLeftRef={timeLeftRef}
            onLock={lock}
            onNext={advance}
          />
        )}

        {stage === "results" && (
          <Results
            model={model}
            total={total}
            best={best[model]}
            isNewBest={isNewBest}
            deltas={deltas}
            onRestart={() => begin(model)}
            onMenu={() => setStage("intro")}
          />
        )}
      </div>
      <p className="sr-only" aria-live="polite">
        {result ? `${result.dE.toFixed(1)} ${result.points}` : ""}
      </p>
    </GameShell>
  )
}

// --- intro -------------------------------------------------------

function Intro({
  best,
  onStart,
}: {
  best: Record<Model, number>
  onStart: (m: Model) => void
}) {
  const { lang } = useI18n()
  const p = (l: Parameters<typeof pick>[0]) => pick(l, lang)
  const opts: { m: Model; name: { en: string; cs: string; fr: string }; hint: { en: string; cs: string; fr: string }; sw: string[] }[] = [
    { m: "light", name: C.modeLight, hint: C.modeLightHint, sw: TRACK_TINT.light },
    { m: "paint", name: C.modePaint, hint: C.modePaintHint, sw: TRACK_TINT.paint },
  ]
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 py-10 text-center sm:p-8">
      <p
        className="max-w-lg text-base sm:text-lg"
        style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}
      >
        {p(C.intro)}
      </p>
      <div className="grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
        {opts.map((o) => (
          <button
            key={o.m}
            type="button"
            onClick={() => onStart(o.m)}
            className="group flex min-h-[44px] flex-col items-center gap-2 px-4 py-5 transition-colors hover:bg-[var(--ink)] hover:text-[var(--surface-dark)]"
            style={{ border: "1.5px solid var(--ink)", color: "var(--ink)" }}
          >
            <span className="flex gap-1" aria-hidden>
              {o.sw.map((c) => (
                <span key={c} style={{ width: 22, height: 22, background: c }} />
              ))}
            </span>
            <span className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>
              {p(o.name)}
            </span>
            <span className="text-xs opacity-70">{p(o.hint)}</span>
            <span className="text-xs uppercase tracking-[0.3em] opacity-70">
              {p(C.best)} {best[o.m]}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// --- playing -----------------------------------------------------

function Playing({
  model, index, target, vals, setVals, result, total, timeLeftRef, onLock, onNext,
}: {
  model: Model
  index: number
  target: Vals
  vals: Vals
  setVals: (v: Vals) => void
  result: Result | null
  total: number
  timeLeftRef: React.MutableRefObject<number>
  onLock: (timeLeftFrac: number, timedOut: boolean) => void
  onNext: () => void
}) {
  const t = useT()
  const { lang } = useI18n()
  const p = (l: Parameters<typeof pick>[0]) => pick(l, lang)
  const barRef = useRef<HTMLDivElement | null>(null)
  const firstRef = useRef<HTMLInputElement | null>(null)

  // countdown; the bar is updated straight in the DOM to stay smooth
  useEffect(() => {
    timeLeftRef.current = 1
    const t0 = performance.now()
    let raf = 0
    let done = false
    const tick = () => {
      const left = Math.max(0, 1 - (performance.now() - t0) / ROUND_MS)
      timeLeftRef.current = left
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${left})`
        barRef.current.style.background =
          left < 0.25 ? "var(--vermilion, #ee4a44)" : "var(--ink)"
      }
      if (left <= 0) {
        if (!done) {
          done = true
          onLock(0, true)
        }
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      done = true
      cancelAnimationFrame(raf)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // stop the clock once locked
  useEffect(() => {
    if (result && barRef.current) barRef.current.style.transition = "none"
  }, [result])

  useEffect(() => {
    firstRef.current?.focus({ preventScroll: true })
  }, [])

  const mineRgb = toRgb(model, vals)
  const targetRgb = toRgb(model, target)
  const keys = KEYS[model]
  const v = result ? verdictOf(result.dE) : 0

  const setOne = (i: number, x: number) => {
    const nv = [...vals] as Vals
    nv[i] = x
    setVals(nv)
  }

  return (
    <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
      {/* HUD */}
      <div
        className="flex items-baseline justify-between text-xs uppercase tracking-[0.3em]"
        style={{ color: "var(--text-muted)" }}
      >
        <span>{t("game.round")} {index + 1} / {TOTAL_ROUNDS}</span>
        <span>{t("game.score")} <strong style={{ color: "var(--ink)" }}>{total}</strong></span>
      </div>

      {/* countdown */}
      <div className="h-1.5 w-full" style={{ background: "color-mix(in srgb, var(--ink) 15%, transparent)" }}>
        <div
          ref={barRef}
          className="h-full w-full origin-left"
          style={{ background: "var(--ink)", transform: "scaleX(1)" }}
        />
      </div>

      <div className="mx-auto grid w-full max-w-4xl gap-3 lg:grid-cols-2 lg:items-center lg:gap-6">
      {/* swatches, touching, on a mid-neutral panel */}
      <div
        className="w-full p-3 sm:p-4"
        style={{ background: "#7a7a7a" }}
      >
        <div className="flex" style={{ height: "clamp(100px, 20vh, 190px)" }}>
          <div className="flex-1" style={{ background: css(targetRgb) }} data-testid="target" />
          <div className="flex-1" style={{ background: css(mineRgb) }} data-testid="mine" />
        </div>
        <div className="mt-2 flex text-[10px] uppercase tracking-[0.3em] text-white/80">
          <span className="flex-1 text-center">{p(C.target)}</span>
          <span className="flex-1 text-center">{p(C.yours)}</span>
        </div>
      </div>

      {/* sliders */}
      <div className="flex w-full flex-col gap-1">
        {[0, 1, 2].map((i) => {
          const lo = [...vals] as Vals
          const hi = [...vals] as Vals
          lo[i] = 0
          hi[i] = 1
          return (
            <MixSlider
              key={i}
              inputRef={i === 0 ? firstRef : undefined}
              label={p(C[keys[i]])}
              tint={TRACK_TINT[model][i]}
              value={vals[i]}
              truth={result ? target[i] : null}
              from={css(toRgb(model, lo))}
              to={css(toRgb(model, hi))}
              disabled={!!result}
              onChange={(x) => setOne(i, x)}
            />
          )
        })}
      </div>
      </div>

      {/* action area, fixed height so nothing jumps */}
      <div className="mx-auto flex min-h-[7.5rem] w-full max-w-4xl flex-col items-center justify-end gap-2">
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="res"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="flex w-full flex-col items-center gap-2"
            >
              <div
                className="text-center text-2xl sm:text-3xl"
                style={{ fontFamily: "var(--font-display)", color: verdictColor(v) }}
              >
                {result.timedOut ? `${p(C.timeUp)} · ` : ""}
                {p(C[`verdict${v}` as "verdict0"])}{" "}
                <span style={{ color: "var(--text-muted)", fontSize: "0.7em" }}>+{result.points}</span>
              </div>
              <div
                className="text-center text-xs uppercase tracking-[0.3em]"
                style={{ color: "var(--text-muted)" }}
              >
                {p(C.deltaE)} ΔE {result.dE.toFixed(1)}
                {result.bonus > 0 && ` · ${p(C.speed)} +${result.bonus}`}
              </div>
              <div className="text-center text-[11px]" style={{ color: "var(--text-muted)" }}>
                {p(C.tickHint)}
              </div>
              <button key="next" onClick={onNext} className="btn-primary">
                <span>{t("game.next")}</span>
                <span aria-hidden style={{ filter: "url(#ink-wobble)" }}>→</span>
              </button>
            </motion.div>
          ) : (
            <motion.div key="lock" exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
              <button
                key="lockbtn"
                onClick={() => onLock(timeLeftRef.current, false)}
                className="btn-primary"
              >
                <span>{p(C.lock)}</span>
                <span aria-hidden style={{ filter: "url(#ink-wobble)" }}>✓</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function MixSlider({
  label, tint, value, truth, from, to, disabled, onChange, inputRef,
}: {
  label: string
  tint: string
  value: number
  truth: number | null
  from: string
  to: string
  disabled: boolean
  onChange: (x: number) => void
  inputRef?: React.Ref<HTMLInputElement>
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em]" style={{ color: "var(--text-muted)" }}>
        <span aria-hidden style={{ width: 8, height: 8, background: tint, display: "inline-block" }} />
        {label}
      </span>
      <span className="relative block" style={{ height: 44 }}>
        <input
          ref={inputRef}
          type="range"
          min={0}
          max={1}
          step={0.005}
          value={value}
          disabled={disabled}
          aria-label={label}
          onChange={(e) => onChange(Number(e.target.value))}
          className="mix-range"
          style={{ background: `linear-gradient(to right, ${from}, ${to})` }}
        />
        {truth !== null && (
          <span
            aria-hidden
            className="pointer-events-none absolute"
            style={{
              left: `calc(${THUMB / 2}px + (100% - ${THUMB}px) * ${truth})`,
              top: 2,
              bottom: 2,
              width: 4,
              marginLeft: -2,
              background: "#fff",
              boxShadow: "0 0 0 1.5px #000",
            }}
          />
        )}
      </span>
    </label>
  )
}

const THUMB = 26
const RANGE_CSS = `
.mix-range{-webkit-appearance:none;appearance:none;display:block;width:100%;height:44px;margin:0;padding:0;border:1.5px solid var(--ink);border-radius:0;background-clip:padding-box;cursor:pointer;touch-action:pan-y;outline:none}
.mix-range:focus-visible{outline:2px solid var(--ink);outline-offset:2px}
.mix-range:disabled{cursor:default}
.mix-range::-webkit-slider-runnable-track{height:100%;background:transparent}
.mix-range::-moz-range-track{height:100%;background:transparent}
.mix-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:${THUMB}px;height:100%;background:var(--surface-dark);border:2px solid var(--ink);border-radius:0;box-shadow:0 0 0 1px #fff}
.mix-range::-moz-range-thumb{width:${THUMB - 4}px;height:calc(100% - 4px);background:var(--surface-dark);border:2px solid var(--ink);border-radius:0;box-shadow:0 0 0 1px #fff}
`

// --- results -----------------------------------------------------

function Results({
  model, total, best, isNewBest, deltas, onRestart, onMenu,
}: {
  model: Model
  total: number
  best: number
  isNewBest: boolean
  deltas: number[]
  onRestart: () => void
  onMenu: () => void
}) {
  const t = useT()
  const { lang } = useI18n()
  const p = (l: Parameters<typeof pick>[0]) => pick(l, lang)
  const avg = deltas.length ? deltas.reduce((a, b) => a + b, 0) / deltas.length : 0
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 p-8 py-12 text-center">
      <div className="text-xs uppercase tracking-[0.3em]" style={{ color: "var(--text-muted)" }}>
        {t("game.final")} · {p(model === "light" ? C.modeLight : C.modePaint)}
      </div>
      <div
        className="text-[clamp(3rem,10vw,6rem)] leading-[0.9]"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        {total}
      </div>
      <div style={{ color: "var(--text-muted)" }}>
        {p(C.outOf).replace("{n}", String(MAX_TOTAL))}
      </div>
      <div className="text-xs uppercase tracking-[0.3em]" style={{ color: isNewBest ? "#3a9d4e" : "var(--text-muted)" }}>
        {isNewBest ? p(C.newBest) : `${p(C.best)} ${best}`} · {p(C.avgDiff)} ΔE {avg.toFixed(1)}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={onRestart} className="btn-primary">
          <span>{t("game.again")}</span>
          <span aria-hidden style={{ filter: "url(#ink-wobble)" }}>↻</span>
        </button>
        <button
          onClick={onMenu}
          className="min-h-[44px] px-4 text-xs uppercase tracking-[0.3em]"
          style={{ color: "var(--text-muted)", border: "1.5px solid var(--ink)" }}
        >
          {p(C.modeLight)} / {p(C.modePaint)}
        </button>
      </div>
    </div>
  )
}
