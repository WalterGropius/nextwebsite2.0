"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { dictionaries, en as enDict, supportedLanguages } from "./dictionaries"
import { getCached, translate, primeCache } from "./translate"
import { browserPick, geoPick, readStoredLang, writeStoredLang } from "./detect"

type Ctx = {
  lang: string
  setLang: (l: string) => void
  t: (key: string) => string
  ready: boolean
  supported: typeof supportedLanguages
}

const I18nContext = createContext<Ctx | null>(null)

const FALLBACK = "en"

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangInternal] = useState<string>(FALLBACK)
  const [, force] = useState(0)
  const pendingRef = useRef<Set<string>>(new Set())
  const [ready, setReady] = useState(false)

  // Detect on mount: stored → browser → geo. Each step short-circuits.
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const stored = readStoredLang()
      if (stored) {
        if (!cancelled) {
          setLangInternal(stored)
          setReady(true)
        }
        return
      }
      const browser = browserPick()
      if (browser) {
        if (!cancelled) {
          setLangInternal(browser)
          setReady(true)
        }
        return
      }
      const geo = await geoPick()
      if (!cancelled) {
        if (geo) setLangInternal(geo)
        setReady(true)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  // Prime cache with native dictionaries so the API never gets called for cs/fr
  useEffect(() => {
    primeCache("cs", enDict, dictionaries.cs)
    primeCache("fr", enDict, dictionaries.fr)
  }, [])

  const setLang = useCallback((l: string) => {
    setLangInternal(l)
    writeStoredLang(l)
  }, [])

  const t = useCallback(
    (key: string): string => {
      const english = enDict[key] ?? key
      if (lang === "en") return english

      // Native (hand-translated) dictionary hit
      const native = dictionaries[lang]?.[key]
      if (native) return native

      // Cached machine translation
      const cached = getCached(lang, english)
      if (cached !== undefined) return cached

      // Fire-and-forget translate; re-render when it lands
      if (!pendingRef.current.has(`${lang}|${english}`)) {
        pendingRef.current.add(`${lang}|${english}`)
        translate(lang, english).then(() => {
          pendingRef.current.delete(`${lang}|${english}`)
          force((n) => n + 1)
        })
      }
      return english
    },
    [lang],
  )

  const value = useMemo<Ctx>(
    () => ({ lang, setLang, t, ready, supported: supportedLanguages }),
    [lang, setLang, t, ready],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    // Degrade gracefully if a consumer renders outside the provider
    // (e.g. during a partial SSR pass)
    return {
      lang: FALLBACK,
      setLang: () => {},
      t: (k) => enDict[k] ?? k,
      ready: false,
      supported: supportedLanguages,
    }
  }
  return ctx
}

export function useT(): (key: string) => string {
  return useI18n().t
}
