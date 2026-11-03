"use client"

import { pick } from "@/lib/i18n/localize"
import { C, PASSAGES, contentLang, fill, type Question } from "./copy"
import { label, muted, READING_FONT } from "./shared"

export type Source = {
  key: string
  label: string
  group: string
  text: string
  questions: Question[] | null
}

// Built-in passages in the reader's language, plus their own pasted
// text cut into pages. With "my text" on, their pages come first.
export function buildSources(lang: string, minePages: string[] | null): Source[] {
  const cl = contentLang(lang)
  const builtIn: Source[] = PASSAGES.map((p) => ({
    key: `b:${p.id}`,
    label: pick(p.title, lang),
    group: pick(p.level === "young" ? C.young : C.grown, lang),
    text: p.text[cl],
    questions: p.questions[cl],
  }))
  if (!minePages?.length) return builtIn
  const mine: Source[] = minePages.map((text, i) => ({
    key: `m:${i}:${text.length}`,
    label: fill(pick(C.yourPage, lang), { n: i + 1 }),
    group: pick(C.mineTitle, lang),
    text,
    questions: null,
  }))
  return [...mine, ...builtIn]
}

export function SourcePicker({
  sources,
  value,
  onChange,
  lang,
}: {
  sources: Source[]
  value: string
  onChange: (key: string) => void
  lang: string
}) {
  const groups = Array.from(new Set(sources.map((s) => s.group)))
  return (
    <label className="flex flex-wrap items-center gap-3">
      <span className={label} style={muted}>
        {pick(C.passage, lang)}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="max-w-full rounded-full bg-transparent px-4 py-2 text-base"
        style={{ fontFamily: READING_FONT, color: "var(--ink)", border: "1.5px solid var(--border-subtle)" }}
      >
        {groups.map((g) => (
          <optgroup key={g} label={g}>
            {sources
              .filter((s) => s.group === g)
              .map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
          </optgroup>
        ))}
      </select>
    </label>
  )
}
