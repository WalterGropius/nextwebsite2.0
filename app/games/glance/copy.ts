import type { Localized } from "@/lib/i18n/localize"

// Everything /games/glance says or shows, hand-written in en / cs / fr.
// Other site languages fall back to English (pick()).

export type ContentLang = "en" | "cs" | "fr"
export const contentLang = (lang: string): ContentLang => (lang === "cs" || lang === "fr" ? lang : "en")

export const C = {
  title: { en: "glance", cs: "mrk", fr: "coup d'œil" },
  blurb: {
    en: "A word flashes — half as long each time you read it right. Then whole lines, a page that erases itself as you read, and a timed read an AI checks.",
    cs: "Blikne slovo — pokaždé, když ho přečteš správně, na poloviční dobu. Pak celé řádky, stránka, která se maže pod rukama, a čtení na čas, které zkontroluje AI.",
    fr: "Un mot apparaît — deux fois moins longtemps chaque fois que tu le lis juste. Puis des lignes entières, une page qui s'efface pendant ta lecture, et une lecture chronométrée vérifiée par une IA.",
  },
  modeFlash: { en: "flash", cs: "blik", fr: "flash" },
  modeVanish: { en: "vanishing page", cs: "mizející stránka", fr: "page qui s'efface" },
  modeTimed: { en: "timed read", cs: "čtení na čas", fr: "lecture chronométrée" },
  why: { en: "why these three →", cs: "proč zrovna tyhle tři →", fr: "pourquoi ces trois →" },
  start: { en: "start", cs: "začít", fr: "commencer" },

  // your text
  mineTitle: { en: "your text", cs: "tvůj text", fr: "ton texte" },
  mineHint: {
    en: "Paste a page or two of the book you're actually reading. Flash drills its words and phrases; the other two read it a page at a time.",
    cs: "Vlož stránku nebo dvě z knížky, kterou zrovna čteš. Blik z ní cvičí slova a fráze, další dva režimy ji čtou po stránkách.",
    fr: "Colle une ou deux pages du livre que tu lis vraiment. Le flash en entraîne les mots et les phrases ; les deux autres la lisent page par page.",
  },
  minePlaceholder: { en: "paste text here…", cs: "sem vlož text…", fr: "colle le texte ici…" },
  mineUse: { en: "use my text", cs: "použít můj text", fr: "utiliser mon texte" },
  builtin: { en: "built-in", cs: "vestavěné", fr: "intégré" },
  mineClear: { en: "clear", cs: "smazat", fr: "effacer" },
  mineStats: { en: "{w} words · {p} pages", cs: "{w} slov · {p} str.", fr: "{w} mots · {p} pages" },
  mineEdit: { en: "edit", cs: "upravit", fr: "modifier" },
  mineTooShort: {
    en: "Not enough of your text for this — using built-in.",
    cs: "Na tohle je tvého textu málo — beru vestavěný.",
    fr: "Pas assez de ton texte pour ça — j'utilise l'intégré.",
  },

  // flash
  word: { en: "word", cs: "slovo", fr: "mot" },
  line: { en: "line", cs: "řádek", fr: "ligne" },
  short: { en: "short", cs: "krátké", fr: "court" },
  long: { en: "long", cs: "dlouhé", fr: "long" },
  flashIntro: {
    en: "Eyes on the cross. Something flashes, then gets scribbled over. Type what you saw. Every hit halves the time; three misses and you're done.",
    cs: "Dívej se na křížek. Něco blikne a hned se to přečmárá. Napiš, co jsi viděl/a. Každý zásah zkrátí čas na půl; tři chyby a konec.",
    fr: "Regarde la croix. Quelque chose apparaît, puis se fait gribouiller. Tape ce que tu as vu. Chaque réussite divise le temps par deux ; trois ratés et c'est fini.",
  },
  flashType: { en: "what did you see?", cs: "co jsi viděl/a?", fr: "qu'as-tu vu ?" },
  flashWait: { en: "watch the cross…", cs: "sleduj křížek…", fr: "regarde la croix…" },
  flashCheck: { en: "check", cs: "zkontrolovat", fr: "vérifier" },
  flashNoIdea: { en: "didn't catch it", cs: "nestihl/a jsem", fr: "pas eu le temps" },
  flashHit: { en: "got it", cs: "máš to", fr: "trouvé" },
  flashMiss: { en: "missed", cs: "vedle", fr: "raté" },
  flashWas: { en: "it said", cs: "stálo tam", fr: "c'était" },
  flashShown: { en: "shown {ms} ms", cs: "ukázáno {ms} ms", fr: "affiché {ms} ms" },
  flashMisses: { en: "misses", cs: "chyby", fr: "ratés" },
  flashResult: { en: "fastest read", cs: "nejrychlejší přečtení", fr: "lecture la plus rapide" },
  flashNone: {
    en: "Nothing read yet — that's fine. Keep your eyes on the cross and go again.",
    cs: "Zatím nic přečteno — nevadí. Dívej se na křížek a zkus to znovu.",
    fr: "Rien lu pour l'instant — pas grave. Garde les yeux sur la croix et recommence.",
  },
  flashFrames: { en: "≈ {n} screen frames", cs: "≈ {n} snímků obrazovky", fr: "≈ {n} images d'écran" },
  flashFloor: {
    en: "One frame — your screen can't flash it any faster.",
    cs: "Jeden snímek — rychleji to tvoje obrazovka neukáže.",
    fr: "Une seule image — ton écran ne peut pas aller plus vite.",
  },
  flashBest: { en: "best so far: {ms} ms", cs: "zatím nejlepší: {ms} ms", fr: "record : {ms} ms" },
  flashNewBest: { en: "new best", cs: "nový rekord", fr: "nouveau record" },
  flashLadder: { en: "the ladder", cs: "žebřík", fr: "l'échelle" },

  // vanish
  vanishIntro: {
    en: "The page erases itself from the top, a little faster than you read. Stay ahead of the eraser. It's meant to feel slightly too fast.",
    cs: "Stránka se maže odshora, o kousek rychleji, než čteš. Drž se před gumou. Má to být trochu moc rychlé.",
    fr: "La page s'efface depuis le haut, un peu plus vite que tu ne lis. Garde une longueur d'avance sur la gomme. Ça doit sembler un peu trop rapide.",
  },
  passage: { en: "text", cs: "text", fr: "texte" },
  speed: { en: "speed", cs: "rychlost", fr: "vitesse" },
  go: { en: "go", cs: "jedem", fr: "c'est parti" },
  getReady: { en: "get ready…", cs: "připrav se…", fr: "prépare-toi…" },
  vanishHow: { en: "how was that?", cs: "jak to šlo?", fr: "alors ?" },
  vanishEasy: { en: "easy", cs: "v pohodě", fr: "facile" },
  vanishOk: { en: "just right", cs: "akorát", fr: "juste bien" },
  vanishLost: { en: "lost it", cs: "ztratil/a jsem se", fr: "perdu" },
  quizTitle: { en: "three quick questions", cs: "tři rychlé otázky", fr: "trois questions rapides" },
  quizScore: { en: "{n} of {m} right", cs: "{n} z {m} správně", fr: "{n} sur {m} justes" },
  vanishNext: { en: "next round: {wpm} wpm", cs: "další kolo: {wpm} slov/min", fr: "prochain tour : {wpm} mots/min" },
  vanishUp: { en: "Kept up — a notch faster.", cs: "Udržel/a ses — o kousek rychleji.", fr: "Tu as suivi — un cran plus vite." },
  vanishDown: { en: "Too fast — easing off.", cs: "Moc rychlé — zpomalíme.", fr: "Trop rapide — on ralentit." },
  again: { en: "again", cs: "znovu", fr: "encore" },
  wpm: { en: "wpm", cs: "slov/min", fr: "mots/min" },

  // timed
  timedIntro: {
    en: "Read at your normal pace — for meaning, not for speed. Press done when you finish. Then tell it back.",
    cs: "Čti svým normálním tempem — kvůli smyslu, ne kvůli rychlosti. Až dočteš, zmáčkni hotovo. Pak to převyprávěj.",
    fr: "Lis à ton rythme habituel — pour le sens, pas pour la vitesse. Appuie sur fini quand tu as terminé. Puis raconte-le.",
  },
  startReading: { en: "start reading", cs: "začít číst", fr: "commencer" },
  done: { en: "done", cs: "hotovo", fr: "fini" },
  retell: { en: "tell it back", cs: "převyprávěj to", fr: "raconte-le" },
  retellHint: {
    en: "What happened, what was it about? Your own words, as much as you remember. Spelling doesn't count.",
    cs: "Co se stalo, o čem to bylo? Vlastními slovy, co si pamatuješ. Pravopis se nepočítá.",
    fr: "Que s'est-il passé, de quoi ça parlait ? Avec tes mots, tout ce dont tu te souviens. L'orthographe ne compte pas.",
  },
  speak: { en: "speak", cs: "nadiktovat", fr: "dicter" },
  stop: { en: "stop", cs: "stop", fr: "stop" },
  listening: { en: "listening…", cs: "poslouchám…", fr: "j'écoute…" },
  speakNote: {
    en: "Dictation uses your browser's speech recognition.",
    cs: "Diktování používá rozpoznávání řeči tvého prohlížeče.",
    fr: "La dictée utilise la reconnaissance vocale de ton navigateur.",
  },
  skip: { en: "skip", cs: "přeskočit", fr: "passer" },
  next: { en: "next", cs: "dál", fr: "suivant" },
  checkIt: { en: "check it", cs: "zkontrolovat", fr: "vérifier" },
  checking: { en: "reading what you wrote…", cs: "čtu, co jsi napsal/a…", fr: "je lis ce que tu as écrit…" },
  resSpeed: { en: "speed", cs: "rychlost", fr: "vitesse" },
  resComp: { en: "understood", cs: "porozumění", fr: "compris" },
  resEffective: { en: "effective speed", cs: "efektivní rychlost", fr: "vitesse effective" },
  resEffectiveNote: {
    en: "speed × understood. Adults average about 240 wpm reading silently (Brysbaert, 2019).",
    cs: "rychlost × porozumění. Dospělí čtou potichu v průměru asi 240 slov za minutu (Brysbaert, 2019, angličtina).",
    fr: "vitesse × compris. Un adulte lit en silence environ 240 mots par minute en moyenne (Brysbaert, 2019, en anglais).",
  },
  resQuiz: { en: "questions", cs: "otázky", fr: "questions" },
  resRetell: { en: "retell", cs: "převyprávění", fr: "récit" },
  resGot: { en: "you got", cs: "zachytil/a jsi", fr: "tu as retenu" },
  resMissed: { en: "you missed", cs: "uteklo ti", fr: "tu as manqué" },
  resMixups: { en: "mixed up", cs: "popletené", fr: "confondu" },
  resTip: { en: "next time", cs: "příště", fr: "la prochaine fois" },
  readAgain: { en: "read it again", cs: "přečíst znovu", fr: "relire" },
  another: { en: "another text", cs: "jiný text", fr: "un autre texte" },
  readCount: { en: "read #{n} of this text", cs: "{n}. čtení tohohle textu", fr: "lecture n° {n} de ce texte" },
  history: { en: "your timed reads", cs: "tvoje čtení na čas", fr: "tes lectures chronométrées" },
  historyLegend: {
    en: "faint: raw speed · ink: effective speed",
    cs: "světle: hrubá rychlost · inkoust: efektivní",
    fr: "pâle : vitesse brute · encre : vitesse effective",
  },
  notChecked: { en: "not checked", cs: "nekontrolováno", fr: "non vérifié" },
  aiOff: {
    en: "The AI check isn't switched on here yet, so this is speed plus the quiz.",
    cs: "Kontrola přes AI tu zatím není zapnutá, takže je to rychlost a kvíz.",
    fr: "La vérification par IA n'est pas encore activée ici : c'est donc la vitesse et le quiz.",
  },
  aiFail: {
    en: "The AI check didn't answer — showing what we have.",
    cs: "Kontrola přes AI neodpověděla — ukazuju, co mám.",
    fr: "La vérification par IA n'a pas répondu — voici ce qu'on a.",
  },
  aiBusy: {
    en: "Too many checks in a row — give it a minute.",
    cs: "Moc kontrol za sebou — chvilku počkej.",
    fr: "Trop de vérifications d'affilée — attends une minute.",
  },
  young: { en: "young readers", cs: "pro malé čtenáře", fr: "jeunes lecteurs" },
  grown: { en: "grown-ups", cs: "pro dospělé", fr: "adultes" },
  yourPage: { en: "your text · page {n}", cs: "tvůj text · str. {n}", fr: "ton texte · page {n}" },
} satisfies Record<string, Localized>

export const fill = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""))

// ---------------------------------------------------------------- flash pools

export const WORDS: Record<ContentLang, { short: string[]; long: string[] }> = {
  en: {
    short: [
      "cat", "dog", "sun", "moon", "tree", "house", "bird", "fish", "milk", "rain", "snow", "ship", "door", "lamp",
      "bread", "apple", "chair", "table", "green", "river", "stone", "cloud", "horse", "sheep", "light", "night",
      "smile", "train", "plant", "water", "paper", "clock", "glass", "sweet", "brave", "quiet", "happy", "dream",
      "storm", "beach", "field", "honey", "tiger", "lemon", "music", "ocean", "piano", "queen", "robot", "spoon",
      "star", "wolf", "frog", "kite", "nest", "hill", "road", "gate", "bell", "coin",
    ],
    long: [
      "garden", "window", "rabbit", "yellow", "castle", "bridge", "pencil", "candle", "forest", "island", "kitchen",
      "monster", "winter", "summer", "dragon", "planet", "rocket", "basket", "butter", "pocket", "silver", "golden",
      "people", "morning", "evening", "teacher", "picture", "library", "chicken", "blanket", "giraffe", "mountain",
      "elephant", "umbrella", "princess", "dinosaur", "treasure", "sandwich", "birthday", "adventure", "butterfly",
      "chocolate", "snowflake", "telescope", "together", "remember", "whisper", "thunder", "journey", "captain",
      "mystery", "lantern", "compass", "harbour", "feather", "shadow", "secret",
    ],
  },
  cs: {
    short: [
      "pes", "les", "dům", "kočka", "strom", "ryba", "mléko", "déšť", "sníh", "loď", "lampa", "chléb", "okno", "židle",
      "stůl", "voda", "řeka", "kámen", "mrak", "kůň", "ovce", "noc", "úsměv", "vlak", "papír", "sklo", "med", "tygr",
      "vlk", "žába", "drak", "hrad", "most", "list", "pták", "myš", "sýr", "čaj", "hora", "cesta", "brána", "zvon",
      "mince", "auto", "míč", "kniha", "lžíce", "pero", "dort", "mýdlo", "kolo", "vítr", "moře",
    ],
    long: [
      "zahrada", "králík", "ostrov", "kuchyně", "příšera", "letadlo", "raketa", "planeta", "kapesník", "stříbro",
      "učitelka", "obrázek", "knihovna", "slepice", "deštník", "princezna", "poklad", "narozeniny", "čokoláda",
      "jahoda", "vločka", "dalekohled", "společně", "pamatovat", "šeptat", "kapitán", "tajemství", "lucerna", "kompas",
      "přístav", "peříčko", "medvěd", "sluníčko", "hvězda", "slunce", "jablko", "hruška", "okurka", "zelenina",
      "zmrzlina", "babička", "dědeček", "pohádka", "kamarád", "veverka", "houpačka", "maminka", "dopoledne",
    ],
  },
  fr: {
    short: [
      "chat", "chien", "lune", "arbre", "ciel", "lait", "pluie", "neige", "porte", "lampe", "pain", "pomme", "table",
      "vert", "nuage", "mer", "île", "lit", "roi", "loup", "ours", "rose", "fleur", "vélo", "train", "livre", "verre",
      "miel", "tigre", "robot", "piano", "reine", "clé", "cœur", "main", "nez", "pied", "jour", "nuit", "feu", "jeu",
      "lac", "port", "phare", "plume", "ombre", "forêt", "fusée", "hiver", "matin",
    ],
    long: [
      "jardin", "fenêtre", "château", "crayon", "bougie", "cuisine", "monstre", "dragon", "planète", "panier",
      "beurre", "argent", "poulet", "couverture", "girafe", "montagne", "éléphant", "parapluie", "princesse",
      "dinosaure", "trésor", "aventure", "papillon", "chocolat", "fraise", "flocon", "télescope", "ensemble",
      "souvenir", "murmure", "tonnerre", "voyage", "capitaine", "mystère", "lanterne", "boussole", "secret", "oiseau",
      "soleil", "maison", "étoile", "pierre", "rivière", "orange", "lapin",
    ].filter((w) => w.length >= 6),
  },
}

export const LINES: Record<ContentLang, { short: string[]; long: string[] }> = {
  en: {
    short: [
      "the red door", "a cat on a wall", "rain on the roof", "under the old bridge", "the moon is up",
      "two small birds", "open the window", "a cup of tea", "the dog is asleep", "snow on the hill", "my brave sister",
      "a ship at sea", "lights in the town", "the cold river", "a box of matches", "run to the gate",
      "the clock struck nine", "a hole in my sock", "stars over the lake", "the bus is late", "green apples fall",
      "the lamp went out", "wind in the trees", "a quiet street", "bread and honey",
    ],
    long: [
      "the fox jumped over the garden wall", "she found a key under the stone", "we ate our lunch beside the river",
      "the train was late again this morning", "a small boat drifted towards the harbour",
      "my grandfather can read very fast", "the lighthouse keeper climbed the stairs",
      "nobody knew where the old map was", "the snow kept falling all night long", "he wrote a letter to the moon",
      "the library opens at nine o'clock", "a strange noise came from the attic",
      "they followed the path into the forest", "the kitten slept inside a warm boot",
      "every evening the bells rang twice", "the storm blew the roof off the barn",
      "we counted forty stars before bed", "the baker gave us a warm loaf", "her bicycle had a squeaky wheel",
      "the captain looked through his telescope", "the river was too wide to cross",
      "a parrot repeated everything I said", "the cake disappeared before the party",
      "two owls watched us from the oak", "the shop sold buttons and old maps",
    ],
  },
  cs: {
    short: [
      "červené dveře", "kočka na zdi", "déšť na střeše", "pod starým mostem", "měsíc vyšel", "dva malí ptáci",
      "otevři okno", "hrnek čaje", "pes spí", "sníh na kopci", "moje statečná sestra", "loď na moři",
      "světla ve městě", "studená řeka", "krabička zápalek", "běž k bráně", "hodiny odbily devět",
      "díra v ponožce", "hvězdy nad jezerem", "autobus nejede", "padají zelená jablka", "lampa zhasla",
      "vítr ve stromech", "tichá ulice", "chleba s medem",
    ],
    long: [
      "liška přeskočila zeď na zahradě", "pod kamenem našla malý klíč", "obědvali jsme na břehu řeky",
      "vlak měl dnes ráno zase zpoždění", "malá loďka plula k přístavu", "můj dědeček umí číst hrozně rychle",
      "strážce majáku vystoupal po schodech", "nikdo nevěděl, kde je stará mapa", "sníh padal celou dlouhou noc",
      "napsal dlouhý dopis měsíci", "knihovna otevírá v devět hodin", "z půdy se ozval divný zvuk",
      "šli po cestě do hlubokého lesa", "kotě spalo v teplé botě", "každý večer zvony zazvonily dvakrát",
      "bouře strhla střechu ze stodoly", "před spaním jsme napočítali čtyřicet hvězd",
      "pekař nám dal teplý bochník", "její kolo mělo vrzající řetěz", "kapitán se díval dalekohledem",
      "řeka byla na přebrodění moc široká", "papoušek opakoval všechno, co jsem řekl",
      "dort zmizel ještě před oslavou", "dvě sovy nás pozorovaly z dubu", "obchod prodával knoflíky a staré mapy",
    ],
  },
  fr: {
    short: [
      "la porte rouge", "un chat sur un mur", "la pluie sur le toit", "sous le vieux pont", "la lune est levée",
      "deux petits oiseaux", "ouvre la fenêtre", "une tasse de thé", "le chien dort", "la neige tombe",
      "ma sœur courageuse", "un bateau en mer", "les lumières de la ville", "la rivière froide",
      "une boîte d'allumettes", "cours au portail", "il est neuf heures", "un trou dans ma chaussette",
      "des étoiles sur le lac", "le bus est en retard", "les pommes tombent", "la lampe s'éteint",
      "du vent dans les arbres", "une rue tranquille", "du pain et du miel",
    ],
    long: [
      "le renard sauta par-dessus le mur du jardin", "elle trouva une clé sous la pierre",
      "nous avons déjeuné au bord de la rivière", "le train était encore en retard ce matin",
      "un petit bateau dérivait vers le port", "mon grand-père sait lire très vite",
      "le gardien du phare monta l'escalier", "personne ne savait où était la vieille carte",
      "la neige tomba toute la nuit", "il écrivit une lettre à la lune", "la bibliothèque ouvre à neuf heures",
      "un bruit étrange venait du grenier", "ils suivirent le chemin dans la forêt",
      "le chaton dormait dans une botte chaude", "chaque soir les cloches sonnaient deux fois",
      "la tempête arracha le toit de la grange", "nous avons compté quarante étoiles",
      "le boulanger nous donna un pain chaud", "son vélo avait une roue qui grince",
      "le capitaine regardait dans sa longue-vue", "la rivière était trop large pour la traverser",
      "un perroquet répétait tout ce que je disais", "le gâteau disparut avant la fête",
      "deux hiboux nous observaient depuis le chêne", "la boutique vendait des boutons et de vieilles cartes",
    ],
  },
}

// ---------------------------------------------------------------- passages

// [question, correct answer, wrong, wrong] — options are shuffled on
// display.
export type Question = [string, string, string, string]

export interface Passage {
  id: string
  level: "young" | "grown"
  title: Localized
  text: Record<ContentLang, string>
  questions: Record<ContentLang, Question[]>
}

export const PASSAGES: Passage[] = [
  {
    id: "lighthouse",
    level: "young",
    title: { en: "Mila and the lighthouse", cs: "Mila a maják", fr: "Mila et le phare" },
    text: {
      en: "Mila lived at the top of a lighthouse with her grandfather and a grey cat called Pepper. Every evening Grandpa climbed the spiral stairs to light the big lamp, and Pepper always went first. One stormy night the lamp would not light. The wind howled, and far out on the sea a small fishing boat was looking for the way home. Grandpa searched his pockets for matches, but they were wet. Mila remembered the tin box in the kitchen drawer. She ran down all ninety-nine steps, found the dry matches and ran back up, out of breath. The lamp flared, and its beam swept across the waves. Ten minutes later the boat sounded its horn twice from the harbour: thank you. Pepper, who had slept through everything, yawned.",
      cs: "Mila bydlela na vrcholu majáku s dědečkem a šedým kocourem jménem Pepř. Každý večer stoupal děda po točitých schodech rozsvítit velkou lampu a Pepř šel vždycky první. Jedné bouřlivé noci se lampa nechtěla rozsvítit. Vítr hučel a daleko na moři hledala malá rybářská loď cestu domů. Děda hledal v kapsách zápalky, ale byly mokré. Mila si vzpomněla na plechovou krabičku v kuchyňském šuplíku. Seběhla všech devadesát devět schodů, našla suché zápalky a bez dechu vyběhla zpátky nahoru. Lampa vzplála a její paprsek přejel přes vlny. O deset minut později loď z přístavu dvakrát zatroubila: děkujeme. Pepř, který celou dobu prospal, zívl.",
      fr: "Mila vivait en haut d'un phare avec son grand-père et une chatte grise appelée Poivre. Chaque soir, Grand-père montait l'escalier en colimaçon pour allumer la grande lampe, et Poivre passait toujours devant. Une nuit de tempête, la lampe refusa de s'allumer. Le vent hurlait et, loin sur la mer, un petit bateau de pêche cherchait le chemin du retour. Grand-père fouilla ses poches pour trouver des allumettes, mais elles étaient mouillées. Mila se souvint de la boîte en fer dans le tiroir de la cuisine. Elle descendit les quatre-vingt-dix-neuf marches en courant, trouva les allumettes sèches et remonta, à bout de souffle. La lampe s'embrasa et son faisceau balaya les vagues. Dix minutes plus tard, le bateau siffla deux fois depuis le port : merci. Poivre, qui avait dormi pendant tout ce temps, bâilla.",
    },
    questions: {
      en: [
        ["What was the cat called?", "Pepper", "Pebble", "Smoke"],
        ["Why wouldn't the lamp light?", "The matches were wet", "The bulb was broken", "The wind blew it out"],
        ["How did the boat say thank you?", "It sounded its horn twice", "It flashed a light", "The fisherman waved"],
      ],
      cs: [
        ["Jak se jmenoval kocour?", "Pepř", "Kamínek", "Kouř"],
        ["Proč se lampa nechtěla rozsvítit?", "Zápalky byly mokré", "Žárovka byla rozbitá", "Vítr ji sfoukl"],
        ["Jak loď poděkovala?", "Dvakrát zatroubila", "Zablikala světlem", "Rybář zamával"],
      ],
      fr: [
        ["Comment s'appelait la chatte ?", "Poivre", "Caillou", "Fumée"],
        ["Pourquoi la lampe refusait-elle de s'allumer ?", "Les allumettes étaient mouillées", "L'ampoule était cassée", "Le vent l'avait soufflée"],
        ["Comment le bateau a-t-il dit merci ?", "Il a sifflé deux fois", "Il a fait clignoter une lumière", "Le pêcheur a fait signe"],
      ],
    },
  },
  {
    id: "leaves",
    level: "young",
    title: { en: "Why leaves change colour", cs: "Proč listí mění barvu", fr: "Pourquoi les feuilles changent de couleur" },
    text: {
      en: "In summer a leaf is green because it is full of chlorophyll. Chlorophyll is the stuff a tree uses to turn sunlight, air and water into food. But a leaf also hides other colours, yellow and orange, that are there all year. In autumn the days get shorter and colder, and the tree stops making new chlorophyll. The green slowly fades, and the yellow and orange finally show. Some trees, like maples, even make a brand-new red colour before their leaves fall. Then the tree builds a thin wall where each leaf meets its twig. Water stops flowing into the leaf, it dries out, and one windy day it falls. The tree rests through the winter and grows new leaves in spring.",
      cs: "V létě je list zelený, protože je plný chlorofylu. Chlorofyl je látka, kterou strom používá, aby ze slunečního světla, vzduchu a vody vyrobil potravu. List ale skrývá i jiné barvy, žlutou a oranžovou, které v něm jsou celý rok. Na podzim se dny zkracují a ochlazují a strom přestane vyrábět nový chlorofyl. Zelená pomalu bledne a žlutá s oranžovou konečně vyniknou. Některé stromy, třeba javory, si před opadem listí vyrobí dokonce úplně novou červenou barvu. Potom strom postaví tenkou stěnu v místě, kde se list potkává s větvičkou. Voda přestane do listu proudit, list uschne a jednoho větrného dne spadne. Strom přes zimu odpočívá a na jaře mu narostou nové listy.",
      fr: "En été, une feuille est verte parce qu'elle est pleine de chlorophylle. La chlorophylle, c'est ce que l'arbre utilise pour transformer la lumière du soleil, l'air et l'eau en nourriture. Mais une feuille cache aussi d'autres couleurs, le jaune et l'orange, qui sont là toute l'année. En automne, les jours raccourcissent et refroidissent, et l'arbre cesse de fabriquer de la chlorophylle. Le vert s'efface lentement, et le jaune et l'orange apparaissent enfin. Certains arbres, comme les érables, fabriquent même une toute nouvelle couleur rouge avant que leurs feuilles ne tombent. Puis l'arbre construit une fine paroi là où chaque feuille rejoint sa brindille. L'eau n'entre plus dans la feuille, elle sèche et, un jour de vent, elle tombe. L'arbre se repose tout l'hiver et fait de nouvelles feuilles au printemps.",
    },
    questions: {
      en: [
        ["What makes a summer leaf green?", "Chlorophyll", "Rain", "The bark"],
        ["Where were the yellow and orange before autumn?", "Hidden in the leaf all year", "In the soil", "In the roots"],
        ["Which tree makes a new red colour?", "The maple", "The pine", "The birch"],
      ],
      cs: [
        ["Proč je letní list zelený?", "Kvůli chlorofylu", "Kvůli dešti", "Kvůli kůře"],
        ["Kde byla žlutá a oranžová před podzimem?", "Schovaná v listu celý rok", "V půdě", "V kořenech"],
        ["Který strom si vyrobí novou červenou barvu?", "Javor", "Borovice", "Bříza"],
      ],
      fr: [
        ["Qu'est-ce qui rend une feuille verte en été ?", "La chlorophylle", "La pluie", "L'écorce"],
        ["Où étaient le jaune et l'orange avant l'automne ?", "Cachés dans la feuille toute l'année", "Dans la terre", "Dans les racines"],
        ["Quel arbre fabrique une nouvelle couleur rouge ?", "L'érable", "Le pin", "Le bouleau"],
      ],
    },
  },
  {
    id: "flash-school",
    level: "grown",
    title: { en: "The flash school", cs: "Škola bleskového vidění", fr: "L'école de l'éclair" },
    text: {
      en: "In June 1942 the US Navy opened an unusual school at Ohio State University. Its teacher, the psychologist Samuel Renshaw, believed that people could learn to see far faster than they thought. Before the war he had flashed numbers onto a screen to study reading. Now he flashed silhouettes of aircraft and ships. A tachistoscope, a projector with a very fast shutter, showed each picture for a fraction of a second, and the trainees had to name it before it was gone. The idea was simple: a lookout who needs to count the engines on a plane is already too late. He has to know the whole shape at once. After the war the same kind of machine turned up in school classrooms, flashing words and phrases to make children read faster. The evidence for that part has always been thin. What nobody doubted was the first lesson of the flash school: recognition that has become automatic is fast, and it frees the mind for everything else.",
      cs: "V červnu 1942 otevřelo americké námořnictvo na Ohijské státní univerzitě neobvyklou školu. Její učitel, psycholog Samuel Renshaw, věřil, že se lidé dokážou naučit vidět mnohem rychleji, než si myslí. Před válkou promítal na plátno čísla, aby zkoumal čtení. Teď promítal siluety letadel a lodí. Tachistoskop, projektor s velmi rychlou závěrkou, ukázal každý obrázek na zlomek vteřiny a cvičenci ho museli pojmenovat dřív, než zmizel. Myšlenka byla prostá: hlídka, která musí na letadle počítat motory, už jde pozdě. Musí poznat celý tvar naráz. Po válce se stejný druh přístroje objevil ve školních třídách a promítal slova a fráze, aby děti četly rychleji. Důkazy pro tuhle část byly vždycky slabé. O čem nikdo nepochyboval, byla první lekce školy bleskového vidění: rozpoznávání, které se stalo automatickým, je rychlé a uvolní hlavu pro všechno ostatní.",
      fr: "En juin 1942, la marine américaine ouvrit une école singulière à l'université d'État de l'Ohio. Son professeur, le psychologue Samuel Renshaw, pensait qu'on pouvait apprendre à voir bien plus vite qu'on ne le croit. Avant la guerre, il projetait des chiffres sur un écran pour étudier la lecture. Désormais, il projetait des silhouettes d'avions et de navires. Un tachistoscope, un projecteur muni d'un obturateur très rapide, montrait chaque image une fraction de seconde, et les élèves devaient la nommer avant qu'elle ne disparaisse. L'idée était simple : une vigie qui doit compter les moteurs d'un avion est déjà en retard. Elle doit reconnaître la forme entière d'un coup. Après la guerre, le même genre d'appareil apparut dans les salles de classe, projetant des mots et des phrases pour faire lire les enfants plus vite. Les preuves de ce côté-là ont toujours été minces. Ce dont personne ne doutait, c'était la première leçon de l'école de l'éclair : une reconnaissance devenue automatique est rapide, et elle libère l'esprit pour tout le reste.",
    },
    questions: {
      en: [
        ["Where did the Navy open the school?", "Ohio State University", "Harvard", "On a ship in the Pacific"],
        ["What did the trainees learn to recognise?", "Aircraft and ship silhouettes", "Enemy codes", "Morse signals"],
        ["Where did the same kind of machine turn up after the war?", "In school classrooms", "In cinemas", "In hospitals"],
      ],
      cs: [
        ["Kde námořnictvo školu otevřelo?", "Na Ohijské státní univerzitě", "Na Harvardu", "Na lodi v Tichomoří"],
        ["Co se cvičenci učili poznávat?", "Siluety letadel a lodí", "Nepřátelské šifry", "Morseovku"],
        ["Kde se stejný druh přístroje objevil po válce?", "Ve školních třídách", "V kinech", "V nemocnicích"],
      ],
      fr: [
        ["Où la marine a-t-elle ouvert l'école ?", "À l'université d'État de l'Ohio", "À Harvard", "Sur un navire dans le Pacifique"],
        ["Qu'apprenaient à reconnaître les élèves ?", "Des silhouettes d'avions et de navires", "Des codes ennemis", "Le morse"],
        ["Où le même genre d'appareil est-il apparu après la guerre ?", "Dans les salles de classe", "Dans les cinémas", "Dans les hôpitaux"],
      ],
    },
  },
  {
    id: "eye",
    level: "grown",
    title: { en: "How the eye actually reads", cs: "Jak oko doopravdy čte", fr: "Comment l'œil lit vraiment" },
    text: {
      en: "Your eyes do not glide along a line of text. They jump. Each jump, called a saccade, lasts only a few hundredths of a second, and during it you see almost nothing. Between jumps the eye stops for about a quarter of a second. These stops, or fixations, are when reading actually happens. In one fixation a skilled reader takes in roughly fifteen letters to the right of the point they are looking at, but only three or four to the left. Short, common words are often skipped completely, because the brain has already recognised them from the corner of the eye. About one jump in ten goes backwards, to check a word or fix a misunderstanding, and those backward jumps help comprehension rather than hurt it. A beginning reader stops on almost every word, stays longer, and sees fewer letters at a time. Practice changes all three. The words do not get shorter; the reader gets faster at knowing them.",
      cs: "Oči po řádku textu neplují. Skáčou. Každý skok, sakáda, trvá jen pár setin vteřiny a během něj nevidíš skoro nic. Mezi skoky se oko zastaví zhruba na čtvrt vteřiny. Tyhle zastávky, fixace, jsou chvíle, kdy se doopravdy čte. Během jedné fixace zkušený čtenář pobere zhruba patnáct písmen napravo od místa, kam se dívá, ale jen tři nebo čtyři nalevo. Krátká, častá slova se často úplně přeskočí, protože je mozek už poznal koutkem oka. Zhruba každý desátý skok jde zpátky, aby ověřil slovo nebo opravil nedorozumění, a tyhle skoky zpět porozumění pomáhají, ne škodí. Začínající čtenář se zastaví skoro na každém slově, zůstane déle a vidí naráz méně písmen. Cvik změní všechny tři věci. Slova se nezkracují; čtenář je jen rychleji poznává.",
      fr: "Tes yeux ne glissent pas le long d'une ligne de texte. Ils sautent. Chaque saut, appelé saccade, ne dure que quelques centièmes de seconde, et pendant ce temps on ne voit presque rien. Entre deux sauts, l'œil s'arrête environ un quart de seconde. Ces arrêts, ou fixations, sont les moments où la lecture a vraiment lieu. En une fixation, un lecteur entraîné saisit environ quinze lettres à droite du point qu'il regarde, mais seulement trois ou quatre à gauche. Les mots courts et fréquents sont souvent sautés, parce que le cerveau les a déjà reconnus du coin de l'œil. Environ un saut sur dix revient en arrière, pour vérifier un mot ou corriger un malentendu, et ces retours aident la compréhension au lieu de la gêner. Un lecteur débutant s'arrête sur presque chaque mot, reste plus longtemps et voit moins de lettres à la fois. L'entraînement change ces trois choses. Les mots ne raccourcissent pas ; le lecteur les reconnaît plus vite.",
    },
    questions: {
      en: [
        ["What do you see during a saccade?", "Almost nothing", "The most letters", "Only the next word"],
        ["How many letters to the right does a skilled reader take in per stop?", "About fifteen", "About three", "About forty"],
        ["What do backward jumps do?", "Help comprehension", "Only waste time", "Happen only to beginners"],
      ],
      cs: [
        ["Co vidíš během sakády?", "Skoro nic", "Nejvíc písmen", "Jen další slovo"],
        ["Kolik písmen napravo pobere zkušený čtenář při jedné zastávce?", "Zhruba patnáct", "Zhruba tři", "Zhruba čtyřicet"],
        ["Co dělají skoky zpátky?", "Pomáhají porozumění", "Jen plýtvají časem", "Dělají je jen začátečníci"],
      ],
      fr: [
        ["Que vois-tu pendant une saccade ?", "Presque rien", "Le plus de lettres", "Seulement le mot suivant"],
        ["Combien de lettres à droite un lecteur entraîné saisit-il par arrêt ?", "Environ quinze", "Environ trois", "Environ quarante"],
        ["À quoi servent les retours en arrière ?", "Ils aident la compréhension", "Ils font juste perdre du temps", "Seuls les débutants en font"],
      ],
    },
  },
]
