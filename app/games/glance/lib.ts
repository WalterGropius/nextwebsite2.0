// Pure helpers for /games/glance — no React, no DOM. Scoring, the
// flash-duration ladder, text chunking, and the localStorage log.

// ---------------------------------------------------------------- text

// Lower-case, strip diacritics and punctuation, collapse whitespace.
// Reading is what's being trained, not typing, so "být" == "byt" and
// "Don't" == "dont".
export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, "")
    .replace(/\s+/g, " ")
    .trim()
}

export function tokens(s: string): string[] {
  const n = normalize(s)
  return n ? n.split(" ") : []
}

// Words as the reader sees them (punctuation kept), for counting and
// for the vanishing page.
export function rawWords(s: string): string[] {
  return s.split(/\s+/).filter(Boolean)
}

export function wordCount(s: string): number {
  return rawWords(s).length
}

// Word-level longest common subsequence. Returns, for every target
// word, whether the answer contained it in order.
export function alignWords(target: string, answer: string): boolean[] {
  const a = tokens(target)
  const b = tokens(answer)
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0))
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }
  const hit = new Array(a.length).fill(false)
  let i = 0
  let j = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      hit[i] = true
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++
    else j++
  }
  return hit
}

// A word is read when it matches exactly (after normalize). A line is
// read when at least 80% of its words came back in order — one slip in
// a five-word line passes, any slip in a short one doesn't.
export function scoreAnswer(target: string, answer: string, kind: "word" | "line") {
  if (kind === "word") {
    const ok = normalize(target) === normalize(answer) && normalize(answer) !== ""
    return { ok, hits: [ok] }
  }
  const hits = alignWords(target, answer)
  const got = hits.filter(Boolean).length
  return { ok: hits.length > 0 && got / hits.length >= 0.8, hits }
}

// ---------------------------------------------------------------- ladder

// The flash duration. Halve on every hit until the first miss, then
// binary-search between the shortest duration read (hi) and the
// longest one missed (lo). Plain halving reaches a single 60 Hz frame
// in six steps from one second, so the search is what actually finds
// the threshold.
export type Ladder = { d: number; hi: number | null; lo: number | null }

export const MAX_FLASH_MS = 8000

export function startLadder(d: number): Ladder {
  return { d, hi: null, lo: null }
}

export function stepLadder(l: Ladder, ok: boolean, floor: number): Ladder & { converged: boolean; atFloor: boolean } {
  let hi = l.hi
  let lo = l.lo
  if (ok) hi = hi == null ? l.d : Math.min(hi, l.d)
  else lo = lo == null ? l.d : Math.max(lo, l.d)

  let d: number
  if (hi == null) d = Math.min((lo ?? l.d) * 2, MAX_FLASH_MS) // never read one yet — slow down
  else if (lo == null) d = hi / 2 // still halving
  else d = Math.sqrt(lo * hi) // zeroing in

  const atFloor = ok && hi != null && hi <= floor * 1.01
  let converged = false
  if (hi != null && lo != null) {
    // The screen only shows whole frames, so search in frames.
    const nLo = Math.round(lo / floor)
    const nHi = Math.round(hi / floor)
    converged = nHi - nLo <= 1 || hi / lo < 1.15
    if (converged) {
      // Edge found. Keep drilling right at it: a small step down after a
      // hit, up after a miss — never less than one frame.
      const step = Math.max(floor, l.d * 0.06)
      d = ok ? l.d - step : l.d + step
    } else {
      d = Math.min(Math.max(Math.round(d / floor), nLo + 1), nHi - 1) * floor
    }
  }
  d = Math.max(d, floor)
  return { d, hi, lo, converged, atFloor }
}

// ---------------------------------------------------------------- chunking

// Split pasted text into short phrases for flash-line mode. Breaks on
// punctuation first so a phrase never straddles a full stop, then cuts
// long clauses into pieces of `min..max` words.
export function phrasesOf(text: string, min: number, max: number): string[] {
  const out: string[] = []
  const clauses = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.,;:!?…—–])\s+|\s+[—–]\s+/)
    .map((c) => c.replace(/^[\s"'„“”«»()[\]—–-]+|[\s"'„“”«»()[\]—–\-.,;:!?…]+$/g, "").trim())
    .filter(Boolean)
  for (const c of clauses) {
    const w = rawWords(c)
    if (w.length < min) continue
    let i = 0
    while (w.length - i >= min) {
      const left = w.length - i
      let n: number
      if (left <= max) n = left // the rest fits
      else if (left - max >= min) n = max // take a full piece
      else if (left - min >= min) n = left - min // leave exactly `min` for the last piece
      else n = left // can't split into two legal pieces — run a little long
      out.push(w.slice(i, i + n).join(" "))
      i += n
    }
  }
  return Array.from(new Set(out))
}

// Unique words from pasted text, split by length.
export function wordsOf(text: string): { short: string[]; long: string[] } {
  const seen = new Set<string>()
  const short: string[] = []
  const long: string[] = []
  for (const raw of rawWords(text)) {
    const w = raw.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, "")
    if (!/^\p{L}+$/u.test(w)) continue
    const key = w.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    if (w.length >= 3 && w.length <= 5) short.push(key)
    else if (w.length >= 6) long.push(key)
  }
  return { short, long }
}

// Cut pasted text into pages of roughly `target` words, ending each on
// a sentence boundary where one is near.
export function pagesOf(text: string, target = 220): string[] {
  const sentences = text
    .replace(/\r/g, "")
    .split(/(?<=[.!?…])\s+(?=\S)|\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean)
  const pages: string[] = []
  let cur: string[] = []
  let n = 0
  for (const s of sentences) {
    const w = wordCount(s)
    if (n > 0 && n + w > target * 1.25) {
      pages.push(cur.join(" "))
      cur = []
      n = 0
    }
    cur.push(s)
    n += w
    if (n >= target) {
      pages.push(cur.join(" "))
      cur = []
      n = 0
    }
  }
  if (cur.length) {
    // fold a short tail into the previous page
    if (n < target * 0.35 && pages.length) pages[pages.length - 1] += " " + cur.join(" ")
    else pages.push(cur.join(" "))
  }
  return pages
}

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// A pattern mask the same shape as the stimulus. Without it the word
// lingers in iconic memory for a few hundred ms after it's gone, and a
// "16 ms" flash is really a 250 ms one.
const MASK = "#%&@$#&%@"
export function maskOf(s: string): string {
  let k = Math.floor(Math.random() * MASK.length)
  return s.replace(/\S/g, () => MASK[k++ % MASK.length])
}

// ---------------------------------------------------------------- storage

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw == null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

export function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* private mode / quota — the game still works, it just forgets */
  }
}

export type TimedEntry = {
  d: string // ISO date
  key: string // passage key
  words: number
  wpm: number
  comp: number | null // 0..1
}

export type FlashEntry = { d: string; kind: "word" | "line"; size: "short" | "long"; ms: number | null }

export const KEYS = {
  mine: "glance.mine",
  timed: "glance.timed",
  flash: "glance.flash",
  vanishWpm: "glance.vanish.wpm",
} as const

export function median(xs: number[]): number | null {
  if (!xs.length) return null
  const s = xs.slice().sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

export const round5 = (n: number) => Math.max(40, Math.round(n / 5) * 5)
