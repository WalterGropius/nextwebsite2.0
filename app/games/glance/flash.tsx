"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { pick } from "@/lib/i18n/localize"
import { C, fill } from "./copy"
import { KEYS, load, maskOf, save, scoreAnswer, shuffle, startLadder, stepLadder, type FlashEntry, type Ladder } from "./lib"
import { Arena, Btn, GREEN, ink, label, muted, READING_FONT, RED, Seg, useFrameMs } from "./shared"

type Kind = "word" | "line"
type Size = "short" | "long"
type Phase = "intro" | "fix" | "flash" | "answer" | "feedback" | "done"
type Trial = { item: string; shown: number; ok: boolean; answer: string; hits: boolean[] }

const START_MS: Record<Kind, Record<Size, number>> = {
  word: { short: 1000, long: 1000 },
  line: { short: 1500, long: 3000 },
}
const FIX_MS = 700 // fixation cross before each flash
const MASK_MS = 250
const LIVES = 3
const MAX_TRIALS = 24

export type Pools = Record<Kind, Record<Size, string[]>>

export function Flash({
  lang,
  pools,
  fallback,
  note,
}: {
  lang: string
  pools: Pools
  // which pools fell back to built-in because the pasted text was too short
  fallback?: Record<Kind, Record<Size, boolean>>
  note?: string
}) {
  const p = (l: Parameters<typeof pick>[0]) => pick(l, lang)
  const frame = useFrameMs()

  const [kind, setKind] = useState<Kind>("word")
  const [size, setSize] = useState<Size>("short")
  const [phase, setPhase] = useState<Phase>("intro")
  const [answer, setAnswer] = useState("")
  const [trials, setTrials] = useState<Trial[]>([])
  const [misses, setMisses] = useState(0)
  const [result, setResult] = useState<{ ms: number | null; best: number | null; isBest: boolean; atFloor: boolean } | null>(null)

  const rootRef = useRef<HTMLDivElement>(null)
  const stimRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const ladderRef = useRef<Ladder>(startLadder(1000))
  const queueRef = useRef<string[]>([])
  const itemRef = useRef("")
  const shownRef = useRef(0)
  const timers = useRef<number[]>([])
  const rafRef = useRef(0)

  const pool = pools[kind][size]

  const clearTimers = () => {
    timers.current.forEach((t) => clearTimeout(t))
    timers.current = []
    cancelAnimationFrame(rafRef.current)
  }
  useEffect(() => clearTimers, [])

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }

  const setStim = (text: string, opts?: { fix?: boolean; mask?: boolean }) => {
    const el = stimRef.current
    if (!el) return
    el.textContent = text
    const len = Math.max(text.length, 4)
    el.style.fontSize =
      opts?.fix ? "40px" : kind === "word" ? "clamp(30px, 9cqw, 64px)" : `clamp(17px, calc(100cqw / ${len} * 1.75), 34px)`
    el.style.opacity = opts?.fix || opts?.mask ? "0.55" : "1"
    el.style.letterSpacing = opts?.mask ? "0.04em" : "0"
  }

  const nextItem = () => {
    if (queueRef.current.length === 0) queueRef.current = shuffle(pool)
    return queueRef.current.pop() ?? ""
  }

  // Show the item for ladder.d ms, measured in real frames. The rAF
  // timestamps bracket what the compositor actually put on screen, so
  // `shown` is reported, not assumed.
  const runFlash = useCallback(() => {
    const target = ladderRef.current.d
    const item = itemRef.current
    let t0 = 0
    const tick = (t: number) => {
      if (!t0) {
        t0 = t
        setStim(item)
        setPhase("flash")
        rafRef.current = requestAnimationFrame(tick)
        return
      }
      if (t - t0 >= target - frame * 0.5) {
        shownRef.current = t - t0
        setStim(maskOf(item), { mask: true })
        later(() => {
          setStim("")
          setPhase("answer")
          inputRef.current?.focus()
        }, MASK_MS)
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame, kind])

  const beginTrial = useCallback(() => {
    clearTimers()
    itemRef.current = nextItem()
    setAnswer("")
    setStim("+", { fix: true })
    setPhase("fix")
    later(runFlash, FIX_MS)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runFlash, pool])

  const start = useCallback(() => {
    clearTimers()
    ladderRef.current = startLadder(START_MS[kind][size])
    queueRef.current = shuffle(pool)
    setTrials([])
    setMisses(0)
    setResult(null)
    // focus inside the click so phones open the keyboard once and keep it
    inputRef.current?.focus()
    rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    beginTrial()
  }, [kind, size, pool, beginTrial])

  const finish = useCallback(
    (ladder: Ladder, atFloor: boolean) => {
      const ms = ladder.hi == null ? null : Math.round(ladder.hi)
      const log = load<FlashEntry[]>(KEYS.flash, [])
      const prev = log.filter((e) => e.kind === kind && e.size === size && e.ms != null).map((e) => e.ms as number)
      const prevBest = prev.length ? Math.min(...prev) : null
      log.push({ d: new Date().toISOString(), kind, size, ms })
      save(KEYS.flash, log.slice(-200))
      const isBest = ms != null && (prevBest == null || ms < prevBest)
      setResult({ ms, best: isBest ? ms : prevBest, isBest: isBest && prevBest != null, atFloor })
      setAnswer("")
      setPhase("done")
    },
    [kind, size],
  )

  const submit = useCallback(
    (given: string) => {
      if (phase !== "answer") return
      const item = itemRef.current
      const { ok, hits } = scoreAnswer(item, given, kind)
      const shown = shownRef.current
      const trial: Trial = { item, shown, ok, answer: given, hits }
      const all = [...trials, trial]
      setTrials(all)
      // step on the measured duration so the ladder tracks the screen
      const stepped = stepLadder({ ...ladderRef.current, d: shown }, ok, frame)
      ladderRef.current = stepped
      const m = misses + (ok ? 0 : 1)
      setMisses(m)
      setPhase("feedback")
      const over = m >= LIVES || stepped.atFloor || all.length >= MAX_TRIALS
      if (over) later(() => finish(stepped, stepped.atFloor), ok ? 900 : 1800)
      else if (ok) later(beginTrial, 800)
    },
    [phase, kind, trials, misses, frame, finish, beginTrial],
  )

  const advance = useCallback(() => {
    if (phase !== "feedback") return
    inputRef.current?.focus()
    const l = ladderRef.current as Ladder & { atFloor?: boolean }
    if (misses >= LIVES || l.atFloor || trials.length >= MAX_TRIALS) {
      clearTimers()
      finish(l, Boolean(l.atFloor))
    } else beginTrial()
  }, [phase, misses, trials.length, finish, beginTrial])

  // Enter / space with nothing focused: start, or continue. Anything
  // focusable (the answer box, the pasted-text area, a button) keeps
  // its own keys.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement
      if (el && el !== document.body && el.matches("input, textarea, select, button, a, [contenteditable]")) return
      if (e.key !== "Enter" && e.key !== " ") return
      if (phase === "intro" || phase === "done") {
        e.preventDefault()
        start()
      } else if (phase === "feedback") {
        e.preventDefault()
        advance()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [phase, start, advance])

  // Changing word/line or short/long resets to the intro.
  useEffect(() => {
    clearTimers()
    setPhase("intro")
    setStim("")
    setTrials([])
    setMisses(0)
    setResult(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, size, pools])

  const last = trials[trials.length - 1]
  const playing = phase !== "intro" && phase !== "done"
  // read after mount — localStorage doesn't exist during SSR
  const [bestSoFar, setBestSoFar] = useState<number | null>(null)
  useEffect(() => {
    if (phase !== "intro") return
    const log = load<FlashEntry[]>(KEYS.flash, [])
    const xs = log.filter((e) => e.kind === kind && e.size === size && e.ms != null).map((e) => e.ms as number)
    setBestSoFar(xs.length ? Math.min(...xs) : null)
  }, [phase, kind, size])

  return (
    <div ref={rootRef} className="flex flex-col gap-5" style={{ scrollMarginTop: 88 }}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Seg<Kind>
          ariaLabel="word or line"
          value={kind}
          onChange={setKind}
          options={[
            { v: "word", label: p(C.word) },
            { v: "line", label: p(C.line) },
          ]}
        />
        <Seg<Size>
          ariaLabel="length"
          value={size}
          onChange={setSize}
          options={[
            { v: "short", label: p(C.short) },
            { v: "long", label: p(C.long) },
          ]}
        />
      </div>
      {note && fallback?.[kind][size] && (
        <p className="text-sm" style={muted}>
          {note}
        </p>
      )}

      <Arena
        className={
          // fixed height while flashing; the result screen grows to fit
          phase === "done"
            ? "min-h-[clamp(230px,34svh,300px)] overflow-hidden sm:min-h-[clamp(300px,46vh,460px)]"
            : "h-[clamp(230px,34svh,300px)] overflow-hidden sm:h-[clamp(300px,46vh,460px)]"
        }
      >
        {/* HUD */}
        {playing && (
          <div className={`pointer-events-none absolute inset-x-0 top-0 z-20 flex items-baseline justify-between p-4 ${label}`} style={muted}>
            <span>
              #{trials.length + (phase === "feedback" ? 0 : 1)}
              {phase !== "feedback" && <> · {Math.round(ladderRef.current.d)} ms</>}
            </span>
            <span aria-label={`${misses} / ${LIVES}`}>
              {p(C.flashMisses)}{" "}
              {Array.from({ length: LIVES }, (_, i) => (
                <span key={i} style={{ color: i < misses ? RED : "var(--ink)", letterSpacing: "0.1em" }}>
                  {i < misses ? "✕" : "○"}
                </span>
              ))}
            </span>
          </div>
        )}

        {/* the stimulus — written imperatively, frame by frame */}
        <div className="absolute inset-0 flex items-center justify-center px-4" style={{ containerType: "inline-size" }}>
          <div
            ref={stimRef}
            data-stimulus
            aria-hidden
            className="w-full select-none text-center"
            style={{ fontFamily: READING_FONT, color: "var(--ink)", lineHeight: 1.25 }}
          />
        </div>

        {phase === "intro" && (
          <Overlay>
            <p className="max-w-lg text-base sm:text-lg" style={muted}>
              {p(C.flashIntro)}
            </p>
            {bestSoFar != null && (
              <p className={label} style={muted}>
                {fill(p(C.flashBest), { ms: bestSoFar })}
              </p>
            )}
            <Btn onClick={start}>{p(C.start)} →</Btn>
          </Overlay>
        )}

        {phase === "feedback" && last && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-4 text-center">
            <div className="text-2xl sm:text-3xl" style={{ fontFamily: "var(--font-display)", color: last.ok ? GREEN : RED }}>
              {last.ok ? p(C.flashHit) : p(C.flashMiss)}
            </div>
            <div style={{ fontFamily: READING_FONT, color: "var(--ink)", fontSize: kind === "word" ? "1.8rem" : "1.25rem", lineHeight: 1.35 }}>
              {kind === "word" ? (
                last.item
              ) : (
                last.item.split(/\s+/).map((w, i) => (
                  <span
                    key={i}
                    style={{
                      color: last.hits[i] ? "var(--ink)" : RED,
                      textDecoration: last.hits[i] ? "none" : "underline",
                      textUnderlineOffset: 4,
                    }}
                  >
                    {w}{" "}
                  </span>
                ))
              )}
            </div>
            <div className={label} style={muted}>
              {fill(p(C.flashShown), { ms: Math.round(last.shown) })}
            </div>
            {!last.ok && (
              <div className="mt-1">
                <Btn kind="secondary" onClick={advance}>
                  {p(C.next)} →
                </Btn>
              </div>
            )}
          </div>
        )}

        {phase === "done" && result && (
          <Overlay inFlow>
            <div className={label} style={muted}>
              {p(C.flashResult)}
            </div>
            {result.ms != null ? (
              <>
                <div className="text-[clamp(2.6rem,8vw,4.5rem)] leading-[0.9]" style={ink}>
                  {result.ms} ms
                </div>
                <div style={muted}>
                  {result.atFloor ? p(C.flashFloor) : fill(p(C.flashFrames), { n: Math.max(1, Math.round(result.ms / frame)) })}
                </div>
                {result.isBest ? (
                  <div className={label} style={{ color: GREEN }}>
                    {p(C.flashNewBest)}
                  </div>
                ) : (
                  result.best != null && (
                    <div className={label} style={muted}>
                      {fill(p(C.flashBest), { ms: result.best })}
                    </div>
                  )
                )}
              </>
            ) : (
              <p className="max-w-md" style={muted}>
                {p(C.flashNone)}
              </p>
            )}
            <LadderChips trials={trials} title={p(C.flashLadder)} />
            <Btn onClick={start}>{p(C.again)} ↻</Btn>
          </Overlay>
        )}
      </Arena>

      {/* The answer box lives outside the arena and stays mounted so a
          phone keyboard opens once and stays open between flashes. */}
      <form
        className="flex flex-wrap items-center gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          if (phase === "answer") submit(answer)
          else if (phase === "feedback") advance()
        }}
      >
        <input
          ref={inputRef}
          value={answer}
          onChange={(e) => phase === "answer" && setAnswer(e.target.value)}
          // Enter is handled here, not by implicit form submission: the
          // check button is disabled between flashes, and browsers skip
          // implicit submission when the default button is disabled.
          onKeyDown={(e) => {
            if (e.key !== "Enter") return
            e.preventDefault()
            if (phase === "answer") submit(answer)
            else if (phase === "feedback") advance()
            else if (phase === "intro" || phase === "done") start()
          }}
          placeholder={phase === "answer" ? p(C.flashType) : playing ? p(C.flashWait) : ""}
          aria-label={p(C.flashType)}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="go"
          className="w-full min-w-0 rounded-full bg-transparent px-5 py-3 text-lg outline-none sm:w-auto sm:flex-1"
          style={{
            fontFamily: READING_FONT,
            color: "var(--ink)",
            border: `1.5px solid ${phase === "answer" ? "var(--ink)" : "var(--border-subtle)"}`,
          }}
        />
        <Btn type="submit" disabled={phase !== "answer"}>
          {p(C.flashCheck)}
        </Btn>
        {phase === "answer" && (
          <button type="button" onClick={() => submit("")} className="text-sm underline underline-offset-4" style={muted}>
            {p(C.flashNoIdea)}
          </button>
        )}
      </form>
    </div>
  )
}

function LadderChips({ trials, title }: { trials: Trial[]; title: string }) {
  if (!trials.length) return null
  return (
    <div className="flex max-w-xl flex-col items-center gap-2">
      <div className={label} style={muted}>
        {title}
      </div>
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-sm" style={{ fontFamily: "var(--font-display)" }}>
        {trials.map((t, i) => (
          <span key={i} style={{ color: t.ok ? GREEN : RED }}>
            {Math.round(t.shown)}
            {t.ok ? "✓" : "✕"}
          </span>
        ))}
      </div>
    </div>
  )
}

function Overlay({ children, inFlow }: { children: React.ReactNode; inFlow?: boolean }) {
  return (
    <div
      className={`${inFlow ? "relative min-h-[inherit]" : "absolute inset-0 overflow-y-auto"} z-30 flex flex-col items-center justify-center gap-4 p-6 text-center`}
      // "safe" keeps the top reachable when the content outgrows the box
      style={{ background: "color-mix(in srgb, var(--surface-dark) 94%, transparent)", justifyContent: "safe center" }}
    >
      {children}
    </div>
  )
}
