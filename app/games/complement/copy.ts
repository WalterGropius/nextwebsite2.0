import type { Localized } from "@/lib/i18n/localize"

// Everything /games/complement says, hand-written in en / cs / fr.
// Other site languages fall back to English (pick()).

export const C = {
  title: { en: "complement", cs: "protějšek", fr: "complémentaire" },
  blurb: {
    en: "One colour on top, five below. Find the one exactly opposite on the colour wheel. The wrong ones creep closer with every hit.",
    cs: "Nahoře jedna barva, dole pět. Najdi tu, která je přesně naproti na barevném kruhu. Špatné se s každým zásahem přibližují.",
    fr: "Une couleur en haut, cinq en dessous. Trouve celle qui lui est exactement opposée sur le cercle chromatique. Les mauvaises se rapprochent à chaque réussite.",
  },
  intro: {
    en: "A colour appears. Pick its complement, the hue 180° around the wheel. Ten rounds, about seven seconds each. Keys 1 to 5 work too.",
    cs: "Objeví se barva. Vyber její protějšek, odstín o 180° dál na kruhu. Deset kol, v každém asi sedm vteřin. Fungují i klávesy 1 až 5.",
    fr: "Une couleur apparaît. Choisis son complémentaire, la teinte à 180° sur le cercle. Dix tours, environ sept secondes chacun. Les touches 1 à 5 marchent aussi.",
  },
  level: { en: "level", cs: "úroveň", fr: "niveau" },
  base: { en: "this colour", cs: "tahle barva", fr: "cette couleur" },
  right: { en: "right", cs: "správně", fr: "juste" },
  wrong: { en: "wrong", cs: "vedle", fr: "raté" },
  late: { en: "too slow", cs: "pozdě", fr: "trop lent" },
  legendBase: { en: "shown", cs: "zadaná", fr: "donnée" },
  legendComp: { en: "answer", cs: "správná", fr: "réponse" },
  legendPick: { en: "yours", cs: "tvoje", fr: "la tienne" },
  gap: { en: "gap {n}°", cs: "rozdíl {n}°", fr: "écart {n}°" },
  best: { en: "best", cs: "rekord", fr: "record" },
  newBest: { en: "new best", cs: "nový rekord", fr: "nouveau record" },
  hits: { en: "{n} of {m} right", cs: "{n} z {m} správně", fr: "{n} sur {m} justes" },
  reached: { en: "reached level {n}", cs: "dosažená úroveň {n}", fr: "niveau {n} atteint" },
  pickLabel: { en: "colour {n}", cs: "barva {n}", fr: "couleur {n}" },
} satisfies Record<string, Localized>

export const fill = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""))
