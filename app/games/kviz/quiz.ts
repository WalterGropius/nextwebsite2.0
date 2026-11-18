// Question generation and answer matching — pure functions over a Deck + Test.

import { type Deck, type Test, type Kind, type Level, type Input, LEVELS, KINDS, INPUTS, promptsFor, fill } from "./deck"

export type Q = { prompt: string; answer: string; options: string[]; note?: string; image?: string; kind: Kind }

export const shuffle = <T,>(a: T[]) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }
export const uniq = (a: string[]) => Array.from(new Set(a))
export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
export const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\p{L}\p{N} ]/gu, " ").replace(/\s+/g, " ").trim()
export const fmt = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.round(ms / 1000) % 60).padStart(2, "0")}`

// Harder levels add options and order distractors by resemblance to the answer.
const first = (s: string) => s.toLowerCase().split(/[\s–-]+/)[0]
function pick(answer: string, pool: string[], n: number, hard: boolean, near: (x: string) => boolean = (x) => first(x) === first(answer)) {
  const c = shuffle(uniq(pool.filter((x) => x !== answer)))
  const ordered = hard ? [...c.filter(near), ...c.filter((x) => !near(x))] : c
  return shuffle([answer, ...ordered.slice(0, n - 1)])
}

export function generate(deck: Deck, t: Pick<Test, "level" | "count" | "categories" | "kinds">): Q[] {
  const cats = uniq(deck.items.map((i) => i.category))
  const only = t.categories?.length ? new Set(t.categories) : null
  const items = only ? deck.items.filter((i) => only.has(i.category)) : deck.items
  const kinds = new Set<Kind>(t.kinds?.length ? t.kinds : (Object.keys(KINDS) as Kind[]))
  const P = promptsFor(deck)
  const k = LEVELS[t.level].options; const hard = t.level === "hard" || t.level === "extra"
  const catOf = new Map(deck.items.map((i) => [i.term, i.category]))
  const terms = uniq(deck.items.map((o) => o.term))
  const out: Q[] = []
  for (const it of items) {
    if (cats.length >= 2 && kinds.has("toCategory"))
      out.push({ kind: "toCategory", prompt: fill(P.toCategory, { term: cap(it.term) }), answer: it.category, note: it.fact, options: pick(it.category, cats, k, hard) })
    const others = deck.items.filter((o) => o.category !== it.category).map((o) => o.term)
    if (others.length >= 2 && kinds.has("toTerm")) out.push({
      kind: "toTerm", prompt: fill(P.toTerm, { category: it.category }), answer: it.term, note: it.fact,
      options: pick(it.term, others, k, hard, (x) => first(catOf.get(x) ?? "") === first(it.category)),
    })
    if (!it.image) continue
    if (terms.length >= 3 && kinds.has("pictureTerm")) out.push({
      kind: "pictureTerm", prompt: P.pictureTerm, answer: it.term, note: it.fact, image: it.image,
      options: pick(it.term, terms, k, hard, (x) => catOf.get(x) === it.category),
    })
    if (cats.length >= 2 && kinds.has("pictureCategory"))
      out.push({ kind: "pictureCategory", prompt: P.pictureCategory, answer: it.category, note: cap(it.term), image: it.image, options: pick(it.category, cats, k, hard) })
  }
  if (kinds.has("extra") && !only) for (const e of deck.questions || [])
    out.push({ kind: "extra", prompt: e.q, answer: e.answer, options: shuffle([e.answer, ...e.wrong.slice(0, k - 1)]) })
  return shuffle(out).slice(0, t.count)
}

function lev(a: string, b: string) {
  const d = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    let prev = d[0]; d[0] = i
    for (let j = 1; j <= b.length; j++) { const tmp = d[j]; d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = tmp }
  }
  return d[b.length]
}

// Judges a typed or spoken answer. Returns the answer when accepted, otherwise
// what she gave. Typing is exact up to case/spaces (accents count from "hard"
// up); speech can't carry accents, so it's matched loosely and may name the
// answer inside a sentence ("myslím, že šelmy").
export function judge(given: string, q: Q, input: Input, level: Level): { value: string; ok: boolean; almost: boolean } {
  const g = given.trim(); const a = q.answer
  const strict = input === "text" && (level === "hard" || level === "extra")
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim()
  let ok = strict ? norm(g) === norm(a) : fold(g) === fold(a)
  if (!ok && input !== "text") {
    const fa = fold(a), fg = fold(g)
    ok = (` ${fg} `).includes(` ${fa} `) || lev(fg, fa) <= Math.max(1, Math.floor(fa.length / 5))
    // the distinctive word is enough, even inside a sentence ("myslím že kočkovité"
    // for "Šelmy – kočkovité"), as long as it doesn't also name another option
    if (!ok) {
      const said = fg.split(" ")
      const words = (s: string) => fold(s).split(" ").filter((w) => w.length >= 3)
      const others = q.options.filter((o) => o !== a)
      const otherWords = new Set(others.flatMap(words))
      const hears = (w: string) => said.some((x) => x === w || (w.length >= 5 && lev(x, w) <= 1))
      const mine = words(a).filter((w) => !otherWords.has(w))
      const theirs = others.flatMap((o) => words(o).filter((w) => !words(a).includes(w)))
      ok = mine.some(hears) && !theirs.some(hears)
    }
  }
  return { value: ok ? a : g, ok, almost: !ok && fold(g) === fold(a) }
}

// Offline reading of a test description ("jen šelmy, hlasem, 20 otázek, na čas").
export function describeTest(text: string, cats: string[]): Omit<Test, "id"> {
  const f = fold(text)
  const num = f.match(/\b(\d{1,3})\b/)
  const input: Input = /hlas|mluv|rikat|nahlas|voice|speak|say/.test(f) ? "voice" : /psan|psat|napis|pis|typ|text/.test(f) ? "text" : "buttons"
  const level: Level = /extra|nejtez|hodne tez|super|hard as/.test(f) ? "extra" : /tez|hard/.test(f) ? "hard" : /lehk|snad|easy/.test(f) ? "easy" : "normal"
  const categories = cats.filter((c) => f.includes(fold(c)) || f.includes(fold(c).split(" ")[0].slice(0, -1)))
  const kinds: Kind[] = []
  if (/obraz|fotk|picture|photo/.test(f)) kinds.push("pictureTerm", "pictureCategory")
  return {
    name: text.trim().slice(0, 60) || "Test", input, level, count: num ? Math.min(+num[1], 200) : 15,
    timed: /cas|time|rychl|stopk/.test(f), categories: categories.length && categories.length < cats.length ? categories : undefined,
    kinds: kinds.length ? kinds : undefined,
  }
}

export const testLabel = (t: Omit<Test, "id" | "name">) =>
  [INPUTS[t.input], LEVELS[t.level].label, `${t.count >= 999 ? "vše" : t.count} ot.`, t.timed && "⏱", t.categories?.length && t.categories.join(", ")].filter(Boolean).join(" · ")
