import type { Localized } from "@/lib/i18n/localize"

// Everything /games/hueshift says, hand-written in en / cs / fr.
// Other site languages fall back to English (pick()).

export const C = {
  title: { en: "hue shift hunt", cs: "posun odstínu", fr: "chasse au décalage" },
  blurb: {
    en: "Two swatches, one slightly shifted around the colour wheel. Say which way it went. The shift shrinks with every hit.",
    cs: "Dva vzorky, jeden lehce posunutý po barevném kruhu. Řekni, kterým směrem. Posun se s každým zásahem zmenšuje.",
    fr: "Deux échantillons, l'un légèrement décalé sur le cercle chromatique. Dis dans quel sens. Le décalage diminue à chaque réussite.",
  },
  intro: {
    en: "the right swatch is the left one nudged around the colour wheel. which way? pick the chip it moved towards. twelve rounds, about five seconds each. left and right arrow keys work too.",
    cs: "pravý vzorek je levý posunutý po barevném kruhu. kterým směrem? vyber barvu, ke které se posunul. dvanáct kol, v každém asi pět vteřin. fungují i šipky vlevo a vpravo.",
    fr: "l'échantillon de droite est celui de gauche décalé sur le cercle chromatique. dans quel sens ? choisis la teinte vers laquelle il a bougé. douze tours, environ cinq secondes chacun. les flèches gauche et droite marchent aussi.",
  },
  level: { en: "level", cs: "úroveň", fr: "niveau" },
  shift: { en: "shift", cs: "posun", fr: "décalage" },
  left: { en: "this way", cs: "tímto směrem", fr: "dans ce sens" },
  answerLeft: { en: "shifted towards the left chip", cs: "posun k levé barvě", fr: "décalé vers la teinte de gauche" },
  answerRight: { en: "shifted towards the right chip", cs: "posun k pravé barvě", fr: "décalé vers la teinte de droite" },
  base: { en: "original", cs: "originál", fr: "original" },
  moved: { en: "shifted", cs: "posunutá", fr: "décalée" },
  right: { en: "right", cs: "správně", fr: "juste" },
  wrong: { en: "wrong way", cs: "opačně", fr: "mauvais sens" },
  late: { en: "too slow", cs: "pozdě", fr: "trop lent" },
  best: { en: "best", cs: "rekord", fr: "record" },
  newBest: { en: "new best", cs: "nový rekord", fr: "nouveau record" },
  hits: { en: "{n} of {m} right", cs: "{n} z {m} správně", fr: "{n} sur {m} justes" },
  smallest: { en: "smallest shift you got right: {n}°", cs: "nejmenší správně poznaný posun: {n}°", fr: "plus petit décalage trouvé : {n}°" },
  none: { en: "no hits this time", cs: "tentokrát žádný zásah", fr: "aucune réussite cette fois" },
  chipLeft: { en: "shift counter-clockwise, left arrow key", cs: "posun proti směru hodin, šipka vlevo", fr: "décalage anti-horaire, flèche gauche" },
  chipRight: { en: "shift clockwise, right arrow key", cs: "posun po směru hodin, šipka vpravo", fr: "décalage horaire, flèche droite" },
} satisfies Record<string, Localized>

export const fill = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""))
