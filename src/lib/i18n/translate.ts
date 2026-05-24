// Free on-demand translation via the MyMemory API. No key, ~5k chars/day
// per anonymous IP. We translate one English string at a time and cache the
// result in localStorage so a returning visitor never re-hits the API.

const CACHE_KEY = "zb_translate_cache_v1"
const ENDPOINT = "https://api.mymemory.translated.net/get"

type CacheShape = Record<string, Record<string, string>>

let memory: CacheShape | null = null

function readCache(): CacheShape {
  if (memory) return memory
  if (typeof window === "undefined") {
    memory = {}
    return memory
  }
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    memory = raw ? (JSON.parse(raw) as CacheShape) : {}
  } catch {
    memory = {}
  }
  return memory
}

function writeCache() {
  if (typeof window === "undefined" || !memory) return
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(memory))
  } catch {
    // quota or private-mode failures are non-fatal
  }
}

export function getCached(lang: string, en: string): string | undefined {
  const cache = readCache()
  return cache[lang]?.[en]
}

function putCached(lang: string, en: string, value: string) {
  const cache = readCache()
  if (!cache[lang]) cache[lang] = {}
  cache[lang][en] = value
  writeCache()
}

// In-flight requests so concurrent <T> renders share a single fetch
const inflight = new Map<string, Promise<string>>()

export async function translate(lang: string, en: string): Promise<string> {
  if (!en || lang === "en") return en
  const hit = getCached(lang, en)
  if (hit !== undefined) return hit

  const key = `${lang}|${en}`
  const existing = inflight.get(key)
  if (existing) return existing

  // MyMemory caps queries around ~500 chars. For longer strings we split
  // by sentence boundaries, translate each piece, then re-join.
  const promise = (async () => {
    try {
      const pieces = splitForApi(en)
      const translated: string[] = []
      for (const piece of pieces) {
        const url = `${ENDPOINT}?q=${encodeURIComponent(piece)}&langpair=en|${encodeURIComponent(lang)}&de=zenbauhaus@gmail.com`
        const res = await fetch(url)
        if (!res.ok) throw new Error("translate failed")
        const data = (await res.json()) as {
          responseData?: { translatedText?: string }
          responseStatus?: number
        }
        const out = data?.responseData?.translatedText
        if (!out || data?.responseStatus !== 200) throw new Error("no result")
        translated.push(out)
      }
      const joined = translated.join(" ")
      putCached(lang, en, joined)
      return joined
    } catch {
      // On failure, fall back to English so the UI still reads
      return en
    } finally {
      inflight.delete(key)
    }
  })()

  inflight.set(key, promise)
  return promise
}

function splitForApi(s: string): string[] {
  const LIMIT = 450
  if (s.length <= LIMIT) return [s]
  const sentences = s.split(/(?<=[.!?])\s+/)
  const chunks: string[] = []
  let current = ""
  for (const sentence of sentences) {
    if ((current + " " + sentence).trim().length > LIMIT) {
      if (current) chunks.push(current.trim())
      current = sentence
    } else {
      current = (current ? current + " " : "") + sentence
    }
  }
  if (current) chunks.push(current.trim())
  return chunks
}

// Prime the cache from a dictionary so static translations don't re-fetch
export function primeCache(lang: string, source: Record<string, string>, target: Record<string, string>) {
  const cache = readCache()
  if (!cache[lang]) cache[lang] = {}
  for (const key of Object.keys(source)) {
    const en = source[key]
    if (en && target[key]) cache[lang][en] = target[key]
  }
  writeCache()
}
