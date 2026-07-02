// Best-effort language detection. Order of preference:
//   1. previously chosen language in localStorage
//   2. browser navigator.languages
//   3. country guess from a free IP lookup
//
// Only languages we ship a native dictionary for (en/cs/fr) win the auto-pick.
// Everything else stays English by default — the user can still flip it from
// the dropdown, which will trigger machine translation.

import { supportedLanguages } from "./dictionaries"

// Auto-pick only languages with a FULL hand translation. The dictionaries
// map now also carries partial (hero-only) native overlays for every
// dropdown language — those must not win the auto-pick, or a German
// browser would silently land on a mostly machine-translated page.
const FULL_NATIVE = new Set(
  supportedLanguages.filter((l) => l.native).map((l) => l.code),
)

const LS_KEY = "zb_language_v1"

export function readStoredLang(): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(LS_KEY)
  } catch {
    return null
  }
}

export function writeStoredLang(lang: string) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(LS_KEY, lang)
  } catch {
    // ignore quota / private-mode failures
  }
}

function pickFromList(candidates: string[]): string | null {
  for (const c of candidates) {
    const lc = c.toLowerCase()
    if (FULL_NATIVE.has(lc)) return lc
    const base = lc.split("-")[0]
    if (FULL_NATIVE.has(base)) return base
  }
  return null
}

export function browserPick(): string | null {
  if (typeof navigator === "undefined") return null
  const langs = (navigator.languages && navigator.languages.length > 0
    ? navigator.languages
    : [navigator.language]) as string[]
  return pickFromList(langs.filter(Boolean))
}

const COUNTRY_TO_LANG: Record<string, string> = {
  cz: "cs",
  sk: "cs",
  fr: "fr",
  be: "fr",
  ch: "fr",
  lu: "fr",
  mc: "fr",
}

// ipapi.co is free for low-volume client-side calls and returns JSON without
// a key. We swallow any failure silently — geo is the lowest-priority signal.
export async function geoPick(): Promise<string | null> {
  if (typeof window === "undefined") return null
  try {
    const res = await fetch("https://ipapi.co/json/", { cache: "force-cache" })
    if (!res.ok) return null
    const data = (await res.json()) as { country_code?: string; languages?: string }
    const cc = data?.country_code?.toLowerCase()
    if (cc && COUNTRY_TO_LANG[cc]) return COUNTRY_TO_LANG[cc]
    if (data?.languages) {
      const list = data.languages.split(",")
      const match = pickFromList(list)
      if (match) return match
    }
    return null
  } catch {
    return null
  }
}

export function systemThemePref(): "light" | "dark" | null {
  if (typeof window === "undefined" || !window.matchMedia) return null
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}
