import type { Localized } from "@/lib/i18n/localize"

// Everything /games/shade says, hand-written in en / cs / fr.
// Other site languages fall back to English (pick()).

export const C = {
  title: { en: "shade", cs: "odstín", fr: "nuance" },
  blurb: {
    en: "Match the swatch. One of five is identical, the rest drift in tone, hue or saturation, and the gap shrinks every time you get it right.",
    cs: "Najdi stejný vzorek. Jeden z pěti je identický, ostatní se liší tónem, odstínem nebo sytostí a rozdíl se s každou správnou odpovědí zmenšuje.",
    fr: "Retrouve le même échantillon. Un sur cinq est identique, les autres dérivent en luminosité, teinte ou saturation, et l'écart rétrécit à chaque bonne réponse.",
  },
  intro: {
    en: "a colour shows up. find the identical one among five, before the bar runs out. every hit makes the others look more like it.",
    cs: "ukáže se barva. najdi mezi pěti tu stejnou, než dojde lišta. každý zásah udělá ostatní víc podobné.",
    fr: "une couleur apparaît. trouve la même parmi cinq, avant la fin de la barre. chaque réussite rend les autres plus proches.",
  },
  keys: {
    en: "keys 1 to 5 pick, enter starts",
    cs: "klávesy 1 až 5 vybírají, enter spouští",
    fr: "touches 1 à 5 pour choisir, entrée pour lancer",
  },
  modeTone: { en: "tone", cs: "tón", fr: "luminosité" },
  modeHue: { en: "hue", cs: "odstín", fr: "teinte" },
  modeSat: { en: "saturation", cs: "sytost", fr: "saturation" },
  best: { en: "best", cs: "rekord", fr: "record" },
  level: { en: "level", cs: "úroveň", fr: "niveau" },
  target: { en: "match this", cs: "najdi tuhle", fr: "retrouve celle-ci" },
  hit: { en: "match", cs: "sedí", fr: "juste" },
  miss: { en: "off", cs: "vedle", fr: "raté" },
  late: { en: "too slow", cs: "pozdě", fr: "trop lent" },
  newBest: { en: "new best", cs: "nový rekord", fr: "nouveau record" },
  hits: { en: "{n} of {t} matched", cs: "{n} z {t} trefeno", fr: "{n} sur {t} trouvées" },
  topLevel: { en: "top level {n}", cs: "nejvyšší úroveň {n}", fr: "niveau max {n}" },
} satisfies Record<string, Localized>

export type ContentLang = "en" | "cs" | "fr"
export const contentLang = (lang: string): ContentLang => (lang === "cs" || lang === "fr" ? lang : "en")
export const fill = (s: string, v: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ""))
