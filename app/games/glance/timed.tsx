"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { pick } from "@/lib/i18n/localize"
import { C, contentLang, fill } from "./copy"
import { KEYS, load, save, wordCount, type TimedEntry } from "./lib"
import { Arena, Btn, GREEN, ink, label, muted, Quiz, READING_FONT, RED, Spark, useDictation } from "./shared"
import { SourcePicker, type Source } from "./sources"

// The timed read. Speed is words over seconds; comprehension comes from
// the quiz (built-in texts) and from an AI reading the retell against
// the original. Effective speed = speed × comprehension.

type Phase = "setup" | "reading" | "retell" | "quiz" | "grading" | "result"
type Grade = { recall: number; accuracy: number; summary: string; got: string[]; missed: string[]; mixups: string[]; tip: string }
type Result = {
  wpm: number
  comp: number | null
  quiz: number | null
  m: number
  grade: Grade | null
  err: "off" | "fail" | "busy" | null
  readNo: number
}

export function Timed({ lang, sources }: { lang: string; sources: Source[] }) {
  const p = (l: Parameters<typeof pick>[0]) => pick(l, lang)
  const [key, setKey] = useState(sources[0]?.key ?? "")
  const [phase, setPhase] = useState<Phase>("setup")
  const [ai, setAi] = useState<boolean | null>(null)
  const [retell, setRetell] = useState("")
  const [res, setRes] = useState<Result | null>(null)
  const [history, setHistory] = useState<TimedEntry[]>([])
  const t0 = useRef(0)
  const wpmRef = useRef(0)
  const dict = useDictation(contentLang(lang), retell, setRetell)

  useEffect(() => {
    setHistory(load<TimedEntry[]>(KEYS.timed, []))
    fetch("/api/glance/grade")
      .then((r) => r.json())
      .then((j) => setAi(Boolean(j?.configured)))
      .catch(() => setAi(false))
  }, [])

  useEffect(() => {
    if (!sources.some((s) => s.key === key)) setKey(sources[0]?.key ?? "")
  }, [sources, key])

  const source = sources.find((s) => s.key === key) ?? sources[0]
  const words = useMemo(() => wordCount(source?.text ?? ""), [source])

  const begin = () => {
    setRetell("")
    setRes(null)
    setPhase("reading")
    t0.current = performance.now()
    window.scrollTo({ top: Math.max(0, (document.getElementById("glance-arena")?.offsetTop ?? 0) - 96), behavior: "smooth" })
  }

  const doneReading = () => {
    const secs = Math.max(1, (performance.now() - t0.current) / 1000)
    wpmRef.current = Math.round(words / (secs / 60))
    if (ai) setPhase("retell")
    else if (source?.questions) setPhase("quiz")
    else void finish(null, "")
  }

  const afterRetell = (text: string) => {
    dict.stop()
    setRetell(text)
    if (source?.questions) setPhase("quiz")
    else void finish(null, text)
  }

  const finish = async (quiz: number | null, retellText: string) => {
    if (!source) return
    const m = source.questions?.length ?? 0
    let grade: Grade | null = null
    let err: Result["err"] = ai === false ? "off" : null
    if (retellText.trim() && ai) {
      setPhase("grading")
      try {
        const r = await fetch("/api/glance/grade", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ text: source.text, retell: retellText, lang: contentLang(lang) }),
        })
        const j = await r.json()
        if (j?.ok) grade = j.grade as Grade
        else err = j?.error === "rate_limited" ? "busy" : j?.error === "not_configured" ? "off" : "fail"
      } catch {
        err = "fail"
      }
    }
    const parts: number[] = []
    if (quiz != null && m) parts.push(quiz / m)
    if (grade) parts.push(grade.recall / 100)
    const comp = parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : null

    const log = load<TimedEntry[]>(KEYS.timed, [])
    const readNo = log.filter((e) => e.key === source.key).length + 1
    log.push({ d: new Date().toISOString(), key: source.key, words, wpm: wpmRef.current, comp })
    const trimmed = log.slice(-300)
    save(KEYS.timed, trimmed)
    setHistory(trimmed)
    setRes({ wpm: wpmRef.current, comp, quiz, m, grade, err, readNo })
    setPhase("result")
  }

  const nextSource = () => {
    const i = sources.findIndex((s) => s.key === key)
    setKey(sources[(i + 1) % sources.length]?.key ?? key)
    setPhase("setup")
  }

  if (!source) return null
  const spark = history.slice(-20).map((e) => ({ wpm: e.wpm, eff: e.comp == null ? null : e.wpm * e.comp }))

  return (
    <div id="glance-arena" className="flex flex-col gap-5">
      {phase === "setup" && (
        <Arena className="p-6 sm:p-10">
          <div className="relative flex flex-col gap-6">
            <p className="max-w-2xl text-base sm:text-lg" style={muted}>
              {p(C.timedIntro)}
            </p>
            <SourcePicker sources={sources} value={source.key} onChange={setKey} lang={lang} />
            <div>
              <Btn onClick={begin}>{p(C.startReading)} →</Btn>
            </div>
            {spark.length >= 2 && <History spark={spark} lang={lang} />}
          </div>
        </Arena>
      )}

      {phase === "reading" && (
        <Arena className="p-6 sm:p-10">
          <div className="relative">
            <p className="max-w-[62ch] whitespace-pre-line text-lg sm:text-xl" style={{ fontFamily: READING_FONT, color: "var(--ink)", lineHeight: 1.75 }}>
              {source.text}
            </p>
            <div className="mt-8">
              <Btn onClick={doneReading}>{p(C.done)} ✓</Btn>
            </div>
          </div>
        </Arena>
      )}

      {phase === "retell" && (
        <Arena className="p-6 sm:p-10">
          <form
            className="relative flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              afterRetell(retell)
            }}
          >
            <div className={label} style={muted}>
              {p(C.retell)}
            </div>
            <p className="max-w-2xl" style={muted}>
              {p(C.retellHint)}
            </p>
            <textarea
              value={retell}
              onChange={(e) => setRetell(e.target.value)}
              rows={7}
              maxLength={5000}
              autoFocus
              className="w-full rounded-2xl bg-transparent p-4 text-lg outline-none"
              style={{ fontFamily: READING_FONT, color: "var(--ink)", border: "1.5px solid var(--ink)", lineHeight: 1.6 }}
            />
            <div className="flex flex-wrap items-center gap-4">
              <Btn type="submit" disabled={!retell.trim()}>
                {p(C.next)} →
              </Btn>
              {dict.supported && (
                <Btn kind="secondary" onClick={dict.listening ? dict.stop : dict.start}>
                  {dict.listening ? `● ${p(C.stop)}` : `🎙 ${p(C.speak)}`}
                </Btn>
              )}
              <button type="button" onClick={() => afterRetell("")} className="text-sm underline underline-offset-4" style={muted}>
                {p(C.skip)}
              </button>
            </div>
            {dict.supported && (
              <p className="text-xs" style={muted}>
                {dict.listening ? p(C.listening) : p(C.speakNote)}
              </p>
            )}
          </form>
        </Arena>
      )}

      {phase === "quiz" && source.questions && (
        <Arena className="p-6 sm:p-10">
          <div className="relative">
            <Quiz questions={source.questions} title={p(C.quizTitle)} cont={p(C.next)} onDone={(score) => void finish(score, retell)} />
          </div>
        </Arena>
      )}

      {phase === "grading" && (
        <Arena className="p-6 sm:p-10">
          <p className="relative animate-pulse text-lg" style={muted}>
            {p(C.checking)}
          </p>
        </Arena>
      )}

      {phase === "result" && res && (
        <Arena className="p-6 sm:p-10">
          <div className="relative flex flex-col gap-6">
            <div className="flex flex-wrap items-end gap-x-10 gap-y-4">
              <Stat label={p(C.resEffective)} value={res.comp == null ? "—" : `${Math.round(res.wpm * res.comp)}`} unit={p(C.wpm)} big />
              <Stat label={p(C.resSpeed)} value={`${res.wpm}`} unit={p(C.wpm)} />
              <Stat
                label={p(C.resComp)}
                value={res.comp == null ? p(C.notChecked) : `${Math.round(res.comp * 100)}%`}
                unit={[
                  res.quiz != null ? `${p(C.resQuiz)} ${res.quiz}/${res.m}` : null,
                  res.grade ? `${p(C.resRetell)} ${res.grade.recall}%` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              />
            </div>
            <p className="text-sm" style={muted}>
              {p(C.resEffectiveNote)} · {fill(p(C.readCount), { n: res.readNo })}
            </p>

            {res.err && (
              <p className="text-sm" style={{ ...muted, color: res.err === "off" ? "var(--text-muted)" : RED }}>
                {res.err === "off" ? p(C.aiOff) : res.err === "busy" ? p(C.aiBusy) : p(C.aiFail)}
              </p>
            )}

            {res.grade && (
              <div className="flex max-w-3xl flex-col gap-4">
                <p className="text-lg" style={{ fontFamily: READING_FONT, color: "var(--ink)", lineHeight: 1.55 }}>
                  {res.grade.summary}
                </p>
                <div className="grid gap-5 sm:grid-cols-2">
                  <List title={p(C.resGot)} items={res.grade.got} color={GREEN} />
                  <List title={p(C.resMissed)} items={res.grade.missed} color={RED} />
                  {res.grade.mixups.length > 0 && <List title={p(C.resMixups)} items={res.grade.mixups} color={RED} />}
                  {res.grade.tip && <List title={p(C.resTip)} items={[res.grade.tip]} color="var(--ink)" />}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              <Btn onClick={begin}>{p(C.readAgain)} ↻</Btn>
              <Btn kind="secondary" onClick={nextSource}>
                {p(C.another)} →
              </Btn>
            </div>
            {spark.length >= 2 && <History spark={spark} lang={lang} />}
          </div>
        </Arena>
      )}
    </div>
  )
}

function Stat({ label: l, value, unit, big }: { label: string; value: string; unit?: string; big?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span className={label} style={muted}>
        {l}
      </span>
      <span className={big ? "text-[clamp(2.6rem,8vw,4.5rem)] leading-[0.95]" : "text-2xl"} style={ink}>
        {value}
      </span>
      {unit && (
        <span className="text-sm" style={muted}>
          {unit}
        </span>
      )}
    </div>
  )
}

function List({ title, items, color }: { title: string; items: string[]; color: string }) {
  if (!items.length) return null
  return (
    <div>
      <div className={`${label} mb-2`} style={{ ...muted, color }}>
        {title}
      </div>
      <ul className="flex flex-col gap-1.5">
        {items.map((s, i) => (
          <li key={i} className="text-base" style={{ fontFamily: READING_FONT, color: "var(--ink)", lineHeight: 1.45 }}>
            {s}
          </li>
        ))}
      </ul>
    </div>
  )
}

function History({ spark, lang }: { spark: Array<{ wpm: number; eff: number | null }>; lang: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className={label} style={muted}>
        {pick(C.history, lang)}
      </span>
      <Spark points={spark} />
      <span className="text-xs" style={muted}>
        {pick(C.historyLegend, lang)}
      </span>
    </div>
  )
}
