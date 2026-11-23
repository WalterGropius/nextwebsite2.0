// Everything /games/mix says, hand-written in en / cs / fr.
// Other site languages fall back to English (pick()).

export const C = {
  title: { en: "mix", cs: "míchání", fr: "mélange" },
  blurb: {
    en: "Match the target colour with three sliders in fifteen seconds. Mix light or mix paint, and get scored on how close your eye really is.",
    cs: "Za patnáct vteřin trefíš barvu třemi posuvníky. Mícháš světlo, nebo barvu, a skóre ukáže, jak přesné je tvoje oko.",
    fr: "Retrouve la couleur cible avec trois curseurs en quinze secondes. Mélange de la lumière ou de la peinture, et vois à quel point ton œil est précis.",
  },
  intro: {
    en: "a target colour, three sliders, fifteen seconds. pick how you want to mix.",
    cs: "cílová barva, tři posuvníky, patnáct vteřin. vyber, jak budeš míchat.",
    fr: "une couleur cible, trois curseurs, quinze secondes. choisis comment mélanger.",
  },
  modeLight: { en: "light", cs: "světlo", fr: "lumière" },
  modeLightHint: {
    en: "red + green + blue, starts dark grey",
    cs: "červená + zelená + modrá, začínáš v šedé",
    fr: "rouge + vert + bleu, départ gris foncé",
  },
  modePaint: { en: "paint", cs: "barva", fr: "peinture" },
  modePaintHint: {
    en: "cyan, magenta, yellow, starts white",
    cs: "azurová, purpurová, žlutá, začínáš v bílé",
    fr: "cyan, magenta, jaune, départ blanc",
  },
  best: { en: "best", cs: "rekord", fr: "record" },
  r: { en: "red", cs: "červená", fr: "rouge" },
  g: { en: "green", cs: "zelená", fr: "vert" },
  b: { en: "blue", cs: "modrá", fr: "bleu" },
  c: { en: "cyan", cs: "azurová", fr: "cyan" },
  m: { en: "magenta", cs: "purpurová", fr: "magenta" },
  y: { en: "yellow", cs: "žlutá", fr: "jaune" },
  target: { en: "target", cs: "cíl", fr: "cible" },
  yours: { en: "yours", cs: "tvoje", fr: "à toi" },
  lock: { en: "lock in", cs: "potvrdit", fr: "valider" },
  timeUp: { en: "time's up", cs: "čas vypršel", fr: "temps écoulé" },
  deltaE: { en: "difference", cs: "rozdíl", fr: "écart" },
  tickHint: {
    en: "ticks show where each slider should have been",
    cs: "značky ukazují, kde měl každý posuvník být",
    fr: "les repères montrent où chaque curseur aurait dû être",
  },
  verdict0: { en: "spot on", cs: "přesně", fr: "pile dessus" },
  verdict1: { en: "very close", cs: "skoro přesně", fr: "très proche" },
  verdict2: { en: "close", cs: "blízko", fr: "proche" },
  verdict3: { en: "off", cs: "vedle", fr: "à côté" },
  verdict4: { en: "far off", cs: "hodně vedle", fr: "très loin" },
  speed: { en: "speed", cs: "rychlost", fr: "vitesse" },
  outOf: { en: "out of {n} possible", cs: "z {n} možných", fr: "sur {n} possibles" },
  newBest: { en: "new best", cs: "nový rekord", fr: "nouveau record" },
  avgDiff: { en: "average difference", cs: "průměrný rozdíl", fr: "écart moyen" },
} as const
