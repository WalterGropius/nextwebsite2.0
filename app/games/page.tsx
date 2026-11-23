"use client"

// /games — the eye trainer's front door: every lab on one page, each
// with the best score this browser has saved for it.

import { useEffect, useState } from "react"
import Link from "next/link"
import { GameShell } from "@/components/game-shell"
import { useI18n } from "@/lib/i18n/provider"
import { pick, type Localized } from "@/lib/i18n/localize"
import { LAB_LINKS } from "../more/data"

const C = {
  title: { en: "eye trainer", cs: "trénink oka", fr: "entraîne ton œil" },
  blurb: {
    en: "Small drills for the eye: proportion, colour, memory, scale. Each isolates one judgement, scores it at once, and gets harder as you get better. Started in Unreal, rewritten in pygame, now living here.",
    cs: "Malé drily pro oko: proporce, barva, paměť, měřítko. Každý izoluje jeden úsudek, hned ho oboduje a přitvrzuje, jak se zlepšuješ. Začalo to v Unrealu, pak v pygame, teď to žije tady.",
    fr: "De petits exercices pour l'œil : proportion, couleur, mémoire, échelle. Chacun isole un jugement, le note aussitôt et se durcit à mesure que tu progresses. Né dans Unreal, réécrit en pygame, il vit maintenant ici.",
  },
  best: { en: "best", cs: "rekord", fr: "record" },
  unplayed: { en: "not played yet", cs: "zatím nehráno", fr: "pas encore joué" },
  play: { en: "play", cs: "hrát", fr: "jouer" },
} satisfies Record<string, Localized>

// Where each lab keeps its best score, and what to call each one.
const BEST: Record<string, Array<{ key: string; label?: Localized }>> = {
  "/games/proportion": [
    { key: "proportion.best.calm", label: { en: "calm", cs: "v klidu", fr: "tranquille" } },
    { key: "proportion.best.speed", label: { en: "speed", cs: "na čas", fr: "chrono" } },
  ],
  "/games/shade": [
    { key: "shade.best.tone", label: { en: "tone", cs: "tón", fr: "ton" } },
    { key: "shade.best.hue", label: { en: "hue", cs: "odstín", fr: "teinte" } },
    { key: "shade.best.saturation", label: { en: "saturation", cs: "sytost", fr: "saturation" } },
  ],
  "/games/complement": [{ key: "complement.best" }],
  "/games/hueshift": [{ key: "hueshift.best" }],
  "/games/mix": [
    { key: "mix.best.light", label: { en: "light", cs: "světlo", fr: "lumière" } },
    { key: "mix.best.paint", label: { en: "paint", cs: "barva", fr: "peinture" } },
  ],
  "/games/angles": [{ key: "angles.best" }],
}

const LABS = LAB_LINKS.filter((l) => l.href.startsWith("/games/"))

export default function GamesPage() {
  const { lang } = useI18n()
  const [scores, setScores] = useState<Record<string, number>>({})

  useEffect(() => {
    const found: Record<string, number> = {}
    try {
      for (const list of Object.values(BEST)) {
        for (const { key } of list) {
          const v = Number(window.localStorage.getItem(key))
          if (Number.isFinite(v) && v > 0) found[key] = v
        }
      }
    } catch {
      /* storage blocked: every lab just reads as unplayed */
    }
    setScores(found)
  }, [])

  return (
    <GameShell title={pick(C.title, lang)} blurb={pick(C.blurb, lang)}>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LABS.map((lab) => {
          const bests = (BEST[lab.href] ?? []).filter((b) => scores[b.key] !== undefined)
          const tracked = lab.href in BEST
          return (
            <li key={lab.href}>
              <Link
                href={lab.href}
                className="group flex h-full flex-col gap-3 p-5 transition-colors hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]"
                style={{ border: "1.5px solid var(--ink)", fontFamily: "var(--font-display)" }}
              >
                <h2 className="text-2xl leading-none" style={{ color: "var(--ink)" }}>
                  {lab.title}
                </h2>
                <p className="flex-1 text-sm" style={{ color: "var(--text-muted)", lineHeight: 1.5 }}>
                  {pick(lab.sub, lang)}
                </p>
                <div
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-1 uppercase"
                  style={{ fontSize: 14, letterSpacing: "0.14em", color: "var(--text-muted)" }}
                >
                  {bests.length > 0 ? (
                    <>
                      <span>{pick(C.best, lang)}</span>
                      {bests.map((b) => (
                        <span key={b.key}>
                          {b.label && `${pick(b.label, lang)} `}
                          <strong style={{ color: "var(--ink)" }}>{Math.round(scores[b.key] * 10) / 10}</strong>
                        </span>
                      ))}
                    </>
                  ) : (
                    tracked && <span>{pick(C.unplayed, lang)}</span>
                  )}
                  <span className="ml-auto" style={{ color: "var(--ink)" }}>
                    {pick(C.play, lang)} <span aria-hidden className="inline-block transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </GameShell>
  )
}
