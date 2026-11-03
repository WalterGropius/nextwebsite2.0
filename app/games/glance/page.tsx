"use client"

// Glance — reading-fluency drills. Three exercises share one page:
//   flash   — a word or line flashes, then is masked; type what you saw.
//             The duration halves on every hit, then binary-searches
//             your threshold after the first miss.
//   vanish  — the page erases itself slightly faster than you read
//             (Breznitz's reading-acceleration paradigm).
//   timed   — read a passage, retell it, get speed × comprehension;
//             the retell is checked by Claude via /api/glance/grade.
// Any of them can run on text the reader pastes in — a page of the
// book they're actually stuck on.

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { GameShell } from "@/components/game-shell"
import { useI18n } from "@/lib/i18n/provider"
import { pick } from "@/lib/i18n/localize"
import { C, LINES, WORDS, contentLang, fill } from "./copy"
import { KEYS, load, pagesOf, phrasesOf, save, wordCount, wordsOf } from "./lib"
import { Flash, type Pools } from "./flash"
import { Vanish } from "./vanish"
import { Timed } from "./timed"
import { buildSources } from "./sources"
import { Btn, label, muted, READING_FONT, Seg } from "./shared"

type Mode = "flash" | "vanish" | "timed"
const MODES: Mode[] = ["flash", "vanish", "timed"]
const MIN_POOL = 8
const BLOG_SLUG = "reading-without-thinking-about-it"

export default function GlancePage() {
  const { lang } = useI18n()
  const p = (l: Parameters<typeof pick>[0]) => pick(l, lang)

  const [mode, setMode] = useState<Mode>("flash")
  const [mine, setMine] = useState("")
  const [draft, setDraft] = useState("")
  const [useMine, setUseMine] = useState(false)
  const [editing, setEditing] = useState(false)

  // restore after mount (no localStorage during SSR); #flash / #vanish /
  // #timed deep-link to a mode
  useEffect(() => {
    const saved = load<string>(KEYS.mine, "")
    setMine(saved)
    setDraft(saved)
    setUseMine(Boolean(saved) && load<boolean>("glance.useMine", false))
    const h = window.location.hash.slice(1) as Mode
    if (MODES.includes(h)) setMode(h)
  }, [])

  const pickMode = (m: Mode) => {
    setMode(m)
    history.replaceState(null, "", `#${m}`)
  }

  const setSource = (v: "builtin" | "mine") => {
    if (v === "mine" && !mine.trim()) {
      setEditing(true)
      return
    }
    setUseMine(v === "mine")
    save("glance.useMine", v === "mine")
  }

  const saveMine = () => {
    const text = draft.trim()
    setMine(text)
    save(KEYS.mine, text)
    setUseMine(Boolean(text))
    save("glance.useMine", Boolean(text))
    setEditing(false)
  }

  const cl = contentLang(lang)
  const active = useMine && mine.trim() ? mine : ""

  const { pools, fallback } = useMemo(() => {
    const builtIn: Pools = {
      word: { short: WORDS[cl].short, long: WORDS[cl].long },
      line: { short: LINES[cl].short, long: LINES[cl].long },
    }
    if (!active) return { pools: builtIn, fallback: undefined }
    const w = wordsOf(active)
    const fromText: Pools = {
      word: { short: w.short, long: w.long },
      line: { short: phrasesOf(active, 2, 4), long: phrasesOf(active, 5, 8) },
    }
    const out = { word: { ...builtIn.word }, line: { ...builtIn.line } } as Pools
    const fb = { word: { short: true, long: true }, line: { short: true, long: true } }
    for (const k of ["word", "line"] as const)
      for (const s of ["short", "long"] as const)
        if (fromText[k][s].length >= MIN_POOL) {
          out[k][s] = fromText[k][s]
          fb[k][s] = false
        }
    return { pools: out, fallback: fb }
  }, [active, cl])

  const sources = useMemo(() => buildSources(lang, active ? pagesOf(active) : null), [lang, active])
  const draftWords = wordCount(draft)
  const draftPages = draft.trim() ? pagesOf(draft).length : 0

  return (
    <GameShell title={p(C.title)} blurb={p(C.blurb)}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <Seg
            ariaLabel="exercise"
            value={mode}
            onChange={pickMode}
            options={[
              { v: "flash", label: p(C.modeFlash) },
              { v: "vanish", label: p(C.modeVanish) },
              { v: "timed", label: p(C.modeTimed) },
            ]}
          />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Seg
              ariaLabel="text source"
              value={active ? "mine" : "builtin"}
              onChange={setSource}
              options={[
                { v: "builtin", label: p(C.builtin) },
                { v: "mine", label: p(C.mineTitle) },
              ]}
            />
            <button onClick={() => setEditing((e) => !e)} className="text-sm underline underline-offset-4" style={muted}>
              {p(C.mineEdit)}
            </button>
          </div>
        </div>

        {editing && (
          <div className="flex flex-col gap-3 rounded-2xl p-5" style={{ border: "1.5px dashed var(--border-subtle)" }}>
            <div className={label} style={muted}>
              {p(C.mineTitle)}
            </div>
            <p className="max-w-2xl text-sm" style={muted}>
              {p(C.mineHint)}
            </p>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={8}
              maxLength={20000}
              placeholder={p(C.minePlaceholder)}
              className="w-full rounded-xl bg-transparent p-4 text-base outline-none"
              style={{ fontFamily: READING_FONT, color: "var(--ink)", border: "1.5px solid var(--border-subtle)", lineHeight: 1.6 }}
            />
            <div className="flex flex-wrap items-center gap-4">
              <Btn onClick={saveMine} disabled={draftWords < 10}>
                {p(C.mineUse)}
              </Btn>
              <button
                onClick={() => {
                  setDraft("")
                  setMine("")
                  setUseMine(false)
                  save(KEYS.mine, "")
                  save("glance.useMine", false)
                }}
                className="text-sm underline underline-offset-4"
                style={muted}
              >
                {p(C.mineClear)}
              </button>
              {draftWords > 0 && (
                <span className="text-sm" style={muted}>
                  {fill(p(C.mineStats), { w: draftWords, p: draftPages })}
                </span>
              )}
            </div>
          </div>
        )}

        {mode === "flash" && (
          <Flash lang={lang} pools={pools} fallback={fallback} note={p(C.mineTooShort)} />
        )}
        {mode === "vanish" && <Vanish key={`v-${active.length}`} lang={lang} sources={sources} />}
        {mode === "timed" && <Timed key={`t-${active.length}`} lang={lang} sources={sources} />}

        <div className="mt-4">
          <Link href={`/blog/${BLOG_SLUG}`} className="ink-underline-hover text-sm" style={muted}>
            {p(C.why)}
          </Link>
        </div>
      </div>
    </GameShell>
  )
}
