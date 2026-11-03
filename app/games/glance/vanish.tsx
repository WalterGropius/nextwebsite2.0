"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { pick } from "@/lib/i18n/localize"
import { C, fill } from "./copy"
import { KEYS, load, median, rawWords, round5, save, type TimedEntry } from "./lib"
import { Arena, Btn, GREEN, ink, label, muted, Quiz, READING_FONT, RED } from "./shared"
import { SourcePicker, type Source } from "./sources"

// The vanishing page. Text erases itself word by word from the top at a
// set pace — the reading-acceleration idea from Breznitz et al. (2013),
// who erased sentences letter by letter slightly faster than the
// reader's own rate and saw speed *and* comprehension improve. Long
// words get proportionally more time: the eraser moves at a constant
// letters-per-second, averaged to the chosen words-per-minute.

const LEAD_MS = 1500
const DEFAULT_WPM = 130

type Phase = "setup" | "reading" | "check" | "result"

export function Vanish({ lang, sources }: { lang: string; sources: Source[] }) {
  const p = (l: Parameters<typeof pick>[0]) => pick(l, lang)
  const [key, setKey] = useState(sources[0]?.key ?? "")
  const [wpm, setWpm] = useState(DEFAULT_WPM)
  const [phase, setPhase] = useState<Phase>("setup")
  const [outcome, setOutcome] = useState<{ up: boolean; score: number | null; m: number; next: number } | null>(null)
  const spansRef = useRef<Array<HTMLSpanElement | null>>([])
  const barRef = useRef<HTMLDivElement>(null)

  // starting speed: last vanish speed, else a bit above their timed reads
  useEffect(() => {
    const stored = load<number | null>(KEYS.vanishWpm, null)
    if (stored) return setWpm(stored)
    const reads = load<TimedEntry[]>(KEYS.timed, []).slice(-3).map((e) => e.wpm)
    const m = median(reads)
    if (m) setWpm(round5(m * 1.05))
  }, [])

  useEffect(() => {
    if (!sources.some((s) => s.key === key)) setKey(sources[0]?.key ?? "")
  }, [sources, key])

  const source = sources.find((s) => s.key === key) ?? sources[0]
  const words = useMemo(() => rawWords(source?.text ?? ""), [source])

  // erase time for each word, in ms after the lead-in
  const thresholds = useMemo(() => {
    const chars = words.map((w) => w.length + 1)
    const total = chars.reduce((a, b) => a + b, 0) || 1
    const msPerChar = (words.length * 60000) / wpm / total
    let acc = 0
    return chars.map((c) => (acc += c) * msPerChar)
  }, [words, wpm])

  useEffect(() => {
    if (phase !== "reading") return
    const n = words.length
    let t0 = 0
    let idx = 0
    let raf = 0
    let timer = 0
    const tick = (t: number) => {
      if (!t0) t0 = t
      const el = t - t0 - LEAD_MS
      while (idx < n && el >= thresholds[idx]) {
        const s = spansRef.current[idx]
        if (s) s.style.opacity = "0"
        idx++
      }
      if (barRef.current) {
        const f = Math.min(1, Math.max(0, el / (thresholds[n - 1] || 1)))
        barRef.current.style.transform = `scaleX(${f})`
      }
      if (idx >= n) {
        timer = window.setTimeout(() => setPhase("check"), 600)
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timer)
    }
  }, [phase, words, thresholds])

  const adapt = (factor: number, score: number | null, m: number) => {
    const next = round5(wpm * factor)
    save(KEYS.vanishWpm, next)
    setOutcome({ up: factor >= 1, score, m, next })
    setPhase("result")
  }

  const nextSource = () => {
    const i = sources.findIndex((s) => s.key === key)
    setKey(sources[(i + 1) % sources.length]?.key ?? key)
  }

  if (!source) return null

  return (
    <div className="flex flex-col gap-5">
      {phase === "setup" && (
        <Arena className="p-6 sm:p-10">
          <div className="relative flex flex-col gap-6">
            <p className="max-w-2xl text-base sm:text-lg" style={muted}>
              {p(C.vanishIntro)}
            </p>
            <SourcePicker sources={sources} value={source.key} onChange={setKey} lang={lang} />
            <div className="flex flex-wrap items-center gap-3">
              <span className={label} style={muted}>
                {p(C.speed)}
              </span>
              <button onClick={() => setWpm((w) => round5(w - 10))} className="h-9 w-9 rounded-full text-lg" style={{ ...ink, border: "1.5px solid var(--border-subtle)" }} aria-label="slower">
                −
              </button>
              <span className="min-w-[7ch] text-center text-2xl" style={ink}>
                {wpm}
              </span>
              <button onClick={() => setWpm((w) => round5(w + 10))} className="h-9 w-9 rounded-full text-lg" style={{ ...ink, border: "1.5px solid var(--border-subtle)" }} aria-label="faster">
                +
              </button>
              <span className={label} style={muted}>
                {p(C.wpm)}
              </span>
            </div>
            <div>
              <Btn onClick={() => setPhase("reading")}>{p(C.go)} →</Btn>
            </div>
          </div>
        </Arena>
      )}

      {phase === "reading" && (
        <Arena className="p-6 sm:p-10">
          <div className="relative">
            <div className="mb-5 h-[2px] w-full overflow-hidden" style={{ background: "var(--border-subtle)" }}>
              <div ref={barRef} className="h-full w-full origin-left" style={{ background: "var(--ink)", transform: "scaleX(0)" }} />
            </div>
            <p className="max-w-[62ch] text-lg sm:text-xl" style={{ fontFamily: READING_FONT, color: "var(--ink)", lineHeight: 1.75 }}>
              {words.map((w, i) => (
                <span key={i} ref={(el) => void (spansRef.current[i] = el)} style={{ transition: "opacity 160ms linear" }}>
                  {w}{" "}
                </span>
              ))}
            </p>
            <div className="mt-6 flex items-center justify-between gap-4">
              <span className={label} style={muted}>
                {wpm} {p(C.wpm)}
              </span>
              <Btn kind="secondary" onClick={() => setPhase("check")}>
                {p(C.stop)}
              </Btn>
            </div>
          </div>
        </Arena>
      )}

      {phase === "check" && (
        <Arena className="p-6 sm:p-10">
          <div className="relative">
            {source.questions ? (
              <Quiz
                questions={source.questions}
                title={p(C.quizTitle)}
                cont={p(C.next)}
                onDone={(score) => {
                  const m = source.questions?.length ?? 3
                  adapt(score >= Math.ceil(m * 0.66) ? 1.08 : 0.9, score, m)
                }}
              />
            ) : (
              <div className="flex flex-col gap-5">
                <div className={label} style={muted}>
                  {p(C.vanishHow)}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Btn kind="secondary" onClick={() => adapt(1.12, null, 0)}>
                    {p(C.vanishEasy)}
                  </Btn>
                  <Btn kind="secondary" onClick={() => adapt(1.05, null, 0)}>
                    {p(C.vanishOk)}
                  </Btn>
                  <Btn kind="secondary" onClick={() => adapt(0.88, null, 0)}>
                    {p(C.vanishLost)}
                  </Btn>
                </div>
              </div>
            )}
          </div>
        </Arena>
      )}

      {phase === "result" && outcome && (
        <Arena className="p-6 sm:p-10">
          <div className="relative flex flex-col items-start gap-4">
            {outcome.score != null && (
              <div className={label} style={muted}>
                {fill(p(C.quizScore), { n: outcome.score, m: outcome.m })}
              </div>
            )}
            <div className="text-2xl sm:text-3xl" style={{ fontFamily: "var(--font-display)", color: outcome.up ? GREEN : RED }}>
              {outcome.up ? p(C.vanishUp) : p(C.vanishDown)}
            </div>
            <div style={muted}>{fill(p(C.vanishNext), { wpm: outcome.next })}</div>
            <div className="mt-2 flex flex-wrap gap-4">
              <Btn
                onClick={() => {
                  setWpm(outcome.next)
                  nextSource()
                  setPhase("setup")
                }}
              >
                {p(C.another)} →
              </Btn>
              <Btn
                kind="secondary"
                onClick={() => {
                  setWpm(outcome.next)
                  setPhase("reading")
                }}
              >
                {p(C.again)} ↻
              </Btn>
            </div>
          </div>
        </Arena>
      )}
    </div>
  )
}
