"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react"
import { shuffle } from "./lib"
import type { Question } from "./copy"

// A book face for anything meant to be read. The site's handwritten
// display font is lovely for chrome and wrong for a reading test.
export const READING_FONT = `"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, var(--font-cormorant), serif`

export const muted: CSSProperties = { color: "var(--text-muted)", fontFamily: "var(--font-display)" }
export const ink: CSSProperties = { color: "var(--ink)", fontFamily: "var(--font-display)" }
export const label = "text-xs uppercase tracking-[0.3em]"
export const GREEN = "#3a9d4e"
export const RED = "var(--vermilion, #ee4a44)"

// The inked frame the other eye-trainers use. The wobble filter sits on
// a border layer only — on the content it would bend the letters.
export function Arena({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div
      className={`relative w-full ${className}`}
      style={{ background: "color-mix(in srgb, var(--surface-dark) 96%, var(--ink) 4%)", ...style }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ border: "1.5px solid var(--ink)", filter: "url(#ink-wobble)" }}
      />
      {children}
    </div>
  )
}

export function Seg<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T
  options: Array<{ v: T; label: string }>
  onChange: (v: T) => void
  ariaLabel: string
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {options.map((o) => {
        const on = o.v === value
        return (
          <button
            key={o.v}
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.v)}
            className={`${label} pb-1`}
            style={{
              color: on ? "var(--ink)" : "var(--text-muted)",
              borderBottom: `2px solid ${on ? "var(--ink)" : "transparent"}`,
              fontFamily: "var(--font-display)",
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function Btn({
  children,
  onClick,
  kind = "primary",
  disabled,
  type = "button",
}: {
  children: ReactNode
  onClick?: () => void
  kind?: "primary" | "secondary"
  disabled?: boolean
  type?: "button" | "submit"
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={kind === "primary" ? "btn-primary" : "btn-secondary"}
      style={disabled ? { opacity: 0.45, pointerEvents: "none" } : undefined}
    >
      <span>{children}</span>
    </button>
  )
}

// Median requestAnimationFrame interval — one screen frame. Flash
// durations are rounded to whole frames, so this is the floor.
export function useFrameMs(): number {
  const [ms, setMs] = useState(1000 / 60)
  useEffect(() => {
    let id = 0
    let last = 0
    const deltas: number[] = []
    const tick = (t: number) => {
      if (last) deltas.push(t - last)
      last = t
      if (deltas.length < 30) id = requestAnimationFrame(tick)
      else {
        const s = deltas.sort((a, b) => a - b)
        const m = s[Math.floor(s.length / 2)]
        if (m > 4 && m < 60) setMs(m)
      }
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [])
  return ms
}

// Three-option multiple choice. Each answer locks and shows right /
// wrong immediately; `onDone(score)` fires from the continue button.
export function Quiz({
  questions,
  title,
  cont,
  onDone,
}: {
  questions: Question[]
  title: string
  cont: string
  onDone: (score: number) => void
}) {
  const shuffled = useMemo(
    () => questions.map(([q, right, ...wrong]) => ({ q, right, options: shuffle([right, ...wrong.slice(0, 2)]) })),
    [questions],
  )
  const [picked, setPicked] = useState<Array<string | null>>(() => questions.map(() => null))
  const all = picked.every((p) => p !== null)
  const score = shuffled.filter((s, i) => picked[i] === s.right).length
  return (
    <div className="flex flex-col gap-6">
      <div className={label} style={muted}>
        {title}
      </div>
      {shuffled.map((s, i) => (
        <fieldset key={i} className="flex flex-col gap-2">
          <legend className="mb-2 text-lg" style={{ ...ink, lineHeight: 1.25 }}>
            {s.q}
          </legend>
          <div className="flex flex-wrap gap-2">
            {s.options.map((o) => {
              const chosen = picked[i] === o
              const locked = picked[i] !== null
              const color = locked && o === s.right ? GREEN : chosen ? RED : "var(--ink)"
              return (
                <button
                  key={o}
                  disabled={locked}
                  onClick={() => setPicked((p) => p.map((x, k) => (k === i ? o : x)))}
                  className="rounded-full px-4 py-2 text-left text-base"
                  style={{
                    fontFamily: READING_FONT,
                    color,
                    border: `1.5px solid ${locked && (chosen || o === s.right) ? color : "var(--border-subtle)"}`,
                    opacity: locked && !chosen && o !== s.right ? 0.45 : 1,
                  }}
                >
                  {o}
                </button>
              )
            })}
          </div>
        </fieldset>
      ))}
      {all && (
        <div>
          <Btn onClick={() => onDone(score)}>{cont} →</Btn>
        </div>
      )}
    </div>
  )
}

// Two-line sparkline: raw speed faint, effective speed in ink.
export function Spark({ points }: { points: Array<{ wpm: number; eff: number | null }> }) {
  if (points.length < 2) return null
  const W = 280
  const H = 64
  const max = Math.max(...points.map((p) => p.wpm), 1) * 1.08
  const x = (i: number) => (i / (points.length - 1)) * (W - 8) + 4
  const y = (v: number) => H - 4 - (v / max) * (H - 8)
  const raw = points.map((p, i) => `${x(i)},${y(p.wpm)}`).join(" ")
  const eff = points
    .map((p, i) => (p.eff == null ? null : `${x(i)},${y(p.eff)}`))
    .filter(Boolean)
    .join(" ")
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="reading speed over time" style={{ color: "var(--ink)", maxWidth: "100%" }}>
      <polyline points={raw} fill="none" stroke="currentColor" strokeOpacity={0.3} strokeWidth={1.5} />
      {eff && <polyline points={eff} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" />}
      {points.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p.eff ?? p.wpm)} r={2.2} fill="currentColor" fillOpacity={p.eff == null ? 0.3 : 1} />
      ))}
    </svg>
  )
}

// ---------------------------------------------------------------- dictation

type Recognition = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
  start: () => void
  stop: () => void
}

const SPEECH_LANG: Record<string, string> = { en: "en-US", cs: "cs-CZ", fr: "fr-FR" }

// Browser speech-to-text, appended to whatever is already typed.
export function useDictation(lang: string, value: string, setValue: (s: string) => void) {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const recRef = useRef<Recognition | null>(null)
  const baseRef = useRef("")
  const finalRef = useRef("")

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition }
    setSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition))
    return () => recRef.current?.stop()
  }, [])

  const start = useCallback(() => {
    const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition }
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!Ctor) return
    const rec = new Ctor()
    rec.lang = SPEECH_LANG[lang] ?? lang
    rec.continuous = true
    rec.interimResults = true
    baseRef.current = value.trim() ? value.trim() + " " : ""
    finalRef.current = ""
    rec.onresult = (e) => {
      let interim = ""
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (r.isFinal) finalRef.current += r[0].transcript + " "
        else interim += r[0].transcript
      }
      setValue(baseRef.current + finalRef.current + interim)
    }
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    recRef.current = rec
    try {
      rec.start()
      setListening(true)
    } catch {
      setListening(false)
    }
  }, [lang, value, setValue])

  const stop = useCallback(() => {
    recRef.current?.stop()
    setListening(false)
  }, [])

  return { supported, listening, start, stop }
}
