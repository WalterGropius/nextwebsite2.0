import type { Localized } from "@/lib/i18n/localize"

// /more content. Everything the page says lives here, hand-translated
// into en / cs / fr. Voice: flat, specific, dry — say the thing once.

export type Item = {
  name: string
  // `name` doubles as React key + Thumb seed. `label` carries a translated
  // display name for concept items (Chess, Paint…); proper nouns leave it
  // unset and display `name`.
  label?: Localized
  href?: string
  note: Localized
  // featured items carry an image (or a self-hosted video) and get their
  // own row inside the chapter.
  img?: string
  video?: string
  ratio?: string
  cta?: Localized
}

export const CTA = {
  read: { en: "read it", cs: "přečti si", fr: "à lire" },
  hear: { en: "hear it", cs: "poslechni", fr: "à écouter" },
  see: { en: "see code", cs: "kód", fr: "le code" },
  follow: { en: "follow", cs: "sleduj", fr: "suivre" },
  play: { en: "play", cs: "zahraj si", fr: "jouer" },
  open: { en: "open", cs: "otevři", fr: "ouvrir" },
  listen: { en: "listen", cs: "poslechni", fr: "écouter" },
  explore: { en: "explore", cs: "prozkoumej", fr: "explorer" },
  connect: { en: "connect", cs: "spoj se", fr: "se connecter" },
} satisfies Record<string, Localized>

export const AESTHETIC: Item[] = [
  {
    name: "Caspar David Friedrich",
    href: "https://en.wikipedia.org/wiki/Wanderer_above_the_Sea_of_Fog",
    note: {
      en: "Wanderer above the Sea of Fog, Kunsthalle Hamburg. I've stood in front of it twice. The second time counted.",
      cs: "Poutník nad mořem mlhy, Kunsthalle Hamburg. Stál jsem před ním dvakrát. Počítá se to druhé.",
      fr: "Le Voyageur contemplant une mer de nuages, Kunsthalle de Hambourg. Je l'ai vu deux fois. La deuxième compte.",
    },
    img: "/more/wanderer.jpg",
    ratio: "4 / 5",
    cta: CTA.read,
  },
  {
    name: "František Kupka",
    href: "https://en.wikipedia.org/wiki/Franti%C5%A1ek_Kupka",
    note: {
      en: "The first abstract painter, if you ask a Czech. Amorpha shows how to leave realism without losing structure.",
      cs: "První abstraktní malíř, když se zeptáš Čecha. Amorfa ukazuje, jak opustit realismus a neztratit strukturu.",
      fr: "Le premier peintre abstrait, si l'on demande à un Tchèque. Amorpha montre comment quitter le réalisme sans perdre la structure.",
    },
    img: "/more/kupka-amorpha.jpg",
    ratio: "1 / 1",
    cta: { en: "the painter", cs: "ten malíř", fr: "le peintre" },
  },
  {
    name: "Bauhaus",
    href: "https://en.wikipedia.org/wiki/Bauhaus",
    note: {
      en: "Gropius, 1919: craft and engineering are one discipline. Still the cleanest version of the argument. My git handle isn't a coincidence.",
      cs: "Gropius, 1919: řemeslo a inženýrství jsou jedna disciplína. Pořád nejčistší verze toho argumentu. Můj git handle není náhoda.",
      fr: "Gropius, 1919 : l'artisanat et l'ingénierie sont une seule discipline. Toujours la version la plus nette. Mon pseudo git n'est pas un hasard.",
    },
  },
  {
    name: "Wabi-sabi",
    href: "https://en.wikipedia.org/wiki/Wabi-sabi",
    note: {
      en: "Koren's thin book is the only design treatise on my shelf. The dent in the bowl is the bowl.",
      cs: "Korenova tenká knížka je jediný designový traktát na mé polici. Promáčklina v misce je ta miska.",
      fr: "Le petit livre de Koren est le seul traité de design sur mon étagère. La bosse du bol, c'est le bol.",
    },
  },
  {
    name: "Dieter Rams",
    href: "https://www.vitsoe.com/eu/about/good-design",
    note: {
      en: "Ten principles. Before the second feature: would Rams keep it? If not, stop.",
      cs: "Deset principů. Před druhou funkcí: nechal by ji Rams? Když ne, přestaň.",
      fr: "Dix principes. Avant la deuxième fonction : Rams la garderait-il ? Sinon, on s'arrête.",
    },
  },
  {
    name: "Tony Garnier",
    href: "https://en.wikipedia.org/wiki/Tony_Garnier_(architect)",
    note: {
      en: "Cité Industrielle, 1904: a workers' city with a bath and a pool in every home. He couldn't build it. He drew it anyway.",
      cs: "Cité Industrielle, 1904: dělnické město s koupelnou a bazénem v každém domě. Postavit ho nemohl. Nakreslil ho stejně.",
      fr: "Cité Industrielle, 1904 : une cité ouvrière avec bain et piscine dans chaque logement. Il ne pouvait pas la bâtir. Il l'a dessinée quand même.",
    },
  },
  {
    name: "Zen",
    href: "https://en.wikipedia.org/wiki/Zen",
    note: {
      en: "A method more than a religion. Sit, watch the thinking, notice it isn't you. Twelve minutes a day.",
      cs: "Spíš metoda než náboženství. Sedni si, sleduj myšlení, všimni si, že to nejsi ty. Dvanáct minut denně.",
      fr: "Une méthode plus qu'une religion. S'asseoir, regarder la pensée, voir que ce n'est pas soi. Douze minutes par jour.",
    },
  },
]

export const MUSIC: Item[] = [
  {
    name: "Tom Waits",
    href: "https://www.youtube.com/watch?v=PCmZBeNVy7g",
    note: {
      en: "Bone Machine sits next to the claw hammer. Same job. Start with Hold On.",
      cs: "Bone Machine leží vedle kladiva. Stejná práce. Začni u Hold On.",
      fr: "Bone Machine est rangé à côté du marteau. Même boulot. Commence par Hold On.",
    },
  },
  {
    name: "Iron Maiden",
    href: "https://www.youtube.com/watch?v=NCceAA0fIm0",
    note: {
      en: "O2 Arena, 2018. Worth the queue and a week of half-deaf left ear. Hallowed Be Thy Name is a short story.",
      cs: "O2 arena, 2018. Stálo to za frontu i za týden napůl hluchého levého ucha. Hallowed Be Thy Name je povídka.",
      fr: "O2 Arena, 2018. Ça valait la file et une semaine d'oreille gauche à moitié sourde. Hallowed Be Thy Name est une nouvelle.",
    },
  },
  {
    name: "Black Sabbath",
    href: "https://www.youtube.com/watch?v=0lkir-mvjqI",
    note: {
      en: "Iommi lost two fingertips in a factory press at seventeen and built a genre with what was left.",
      cs: "Iommi přišel v sedmnácti v lisu o dvě bříška prstů a z toho, co zbylo, postavil žánr.",
      fr: "Iommi a perdu deux bouts de doigts dans une presse à dix-sept ans et a bâti un genre avec le reste.",
    },
    img: "/art/decay/021.webp",
    ratio: "4 / 5",
    cta: { en: "play it", cs: "pusť si", fr: "à écouter" },
  },
  {
    name: "Frank Zappa",
    href: "https://www.youtube.com/watch?v=u05PVbbI_zo",
    note: {
      en: "Watermelon in Easter Hay. He knew it was his last solo, and you can hear it.",
      cs: "Watermelon in Easter Hay. Věděl, že je to jeho poslední sólo, a je to slyšet.",
      fr: "Watermelon in Easter Hay. Il savait que c'était son dernier solo, et ça s'entend.",
    },
  },
  {
    name: "Mick Jenkins",
    href: "https://open.spotify.com/album/2GuJOMaxJpvgDM5MgKZUF8",
    note: {
      en: "The Water[s] saved me about a year of therapy in 2014. Still about hydration.",
      cs: "The Water[s] mi v roce 2014 ušetřilo asi rok terapie. Pořád je to o pití vody.",
      fr: "The Water[s] m'a épargné un an de thérapie en 2014. Ça parle toujours d'hydratation.",
    },
  },
]

export const FILM: Item[] = [
  {
    name: "David Lynch",
    href: "https://en.wikipedia.org/wiki/David_Lynch",
    note: {
      en: "RIP. Mulholland Drive, top three. His daily weather report was fifteen years of conceptual art, filed under hobby.",
      cs: "RIP. Mulholland Drive, top tři. Jeho denní předpověď počasí bylo patnáct let konceptuálního umění, které všichni brali jako koníček.",
      fr: "RIP. Mulholland Drive, dans mon top trois. Sa météo quotidienne : quinze ans d'art conceptuel rangés au rayon hobby.",
    },
    img: "/art/reflections/012.webp",
    ratio: "21 / 9",
    cta: { en: "the man", cs: "ten člověk", fr: "l'homme" },
  },
]

export const SKATE: Item[] = [
  {
    name: "Skateboarding",
    label: { en: "Skateboarding", cs: "Skejt", fr: "Le skate" },
    note: {
      en: "Twenty-three years on a board. Two broken bones, neither on a trick. I can't pass a curb without reading the line.",
      cs: "Třiadvacet let na prkně. Dvě zlomeniny, ani jedna na triku. Neprojdu kolem obrubníku, abych nečetl lajnu.",
      fr: "Vingt-trois ans sur une planche. Deux fractures, aucune sur un trick. Je ne passe pas un trottoir sans en lire la ligne.",
    },
    img: "/art/landscape/044.webp",
    ratio: "3 / 2",
  },
  {
    name: "Andy Anderson",
    href: "https://www.instagram.com/andyandersonsk8",
    note: {
      en: "Helmet on, switch everything. Proof you age into this, not out of it.",
      cs: "Helma, všechno switch. Důkaz, že z tohohle se nevyrůstá, do tohohle se dorůstá.",
      fr: "Casque, tout en switch. La preuve qu'on vieillit dedans, pas qu'on en sort.",
    },
    cta: CTA.follow,
  },
]

export const CODE: Item[] = [
  {
    name: "John Carmack",
    href: "https://github.com/ESWAT/john-carmack-plan-archive",
    note: {
      en: ".plan files from 1996: still the cleanest writing on programming I know. He works the way I want to work.",
      cs: ".plan soubory z roku 1996: pořád nejčistší psaní o programování, co znám. Pracuje tak, jak chci pracovat já.",
      fr: "Ses fichiers .plan de 1996 : toujours ce qui s'écrit de plus net sur la programmation. Il travaille comme je veux travailler.",
    },
  },
  {
    name: "Linus Torvalds",
    href: "https://www.kernel.org/",
    note: {
      en: "Linux and git, both written out of disgust with the alternatives.",
      cs: "Linux i git, obojí napsané z odporu k alternativám.",
      fr: "Linux et git, tous deux écrits par dégoût des alternatives.",
    },
  },
  {
    name: "Procedural generation",
    label: { en: "Procedural generation", cs: "Procedurální generování", fr: "Génération procédurale" },
    href: "https://en.wikipedia.org/wiki/Procedural_generation",
    note: {
      en: "Rules, randomness, iteration. The generator is always cheaper to keep than the asset.",
      cs: "Pravidla, náhoda, iterace. Generátor se vždycky udržuje levněji než asset.",
      fr: "Règles, hasard, itération. Le générateur coûte toujours moins cher à garder que l'asset.",
    },
    img: "/art/weird/088.webp",
    ratio: "1 / 1",
    cta: CTA.read,
  },
  {
    name: "Garry's Mod",
    href: "https://gmod.facepunch.com/",
    note: {
      en: "A physics sandbox where bad ideas were free. The first place I felt powerful as a kid.",
      cs: "Fyzikální pískoviště, kde špatné nápady nic nestály. První místo, kde jsem se jako kluk cítil mocný.",
      fr: "Un bac à sable physique où les mauvaises idées étaient gratuites. Le premier endroit où je me suis senti puissant, gamin.",
    },
  },
  {
    name: "Hacking",
    label: { en: "Hacking", cs: "Hackování", fr: "Le hacking" },
    href: "https://en.wikipedia.org/wiki/Hacker_culture",
    note: {
      en: "Finding the edge nobody built the thing for. Most programmers I trust are locksmiths at heart.",
      cs: "Najít skulinu, se kterou nikdo nepočítal. Většina programátorů, kterým věřím, jsou v duši zámečníci.",
      fr: "Trouver la faille que personne n'avait prévue. Les programmeurs en qui j'ai confiance sont serruriers dans l'âme.",
    },
  },
]

export const MIND: Item[] = [
  {
    name: "Computational neuroscience",
    label: { en: "Computational neuroscience", cs: "Výpočetní neurověda", fr: "Neurosciences computationnelles" },
    href: "https://en.wikipedia.org/wiki/Computational_neuroscience",
    note: {
      en: "Currently mapping the brain's cache architecture. The next twenty years will teach us more about ourselves than the last two hundred thousand.",
      cs: "Zrovna mapuju cache architekturu mozku. Příštích dvacet let nás o nás naučí víc než posledních dvě stě tisíc.",
      fr: "Je cartographie l'architecture cache du cerveau. Les vingt prochaines années nous en apprendront plus que les deux cent mille dernières.",
    },
    img: "/art/surfaces/120.webp",
    ratio: "4 / 3",
    cta: CTA.read,
  },
  {
    name: "Science × art",
    label: { en: "Science × art", cs: "Věda × umění", fr: "Science × art" },
    note: {
      en: "The work lives between rigour and intuition. Painters I trust read papers; researchers I trust draw.",
      cs: "Práce žije mezi přesností a intuicí. Malíři, kterým věřím, čtou studie; vědci, kterým věřím, kreslí.",
      fr: "Le travail vit entre rigueur et intuition. Les peintres que j'estime lisent des articles ; les chercheurs que j'estime dessinent.",
    },
  },
  {
    name: "Education",
    label: { en: "Education", cs: "Vzdělávání", fr: "L'éducation" },
    note: {
      en: "The highest-leverage public investment we have, done badly on purpose. A fight I'll pick.",
      cs: "Veřejná investice s největší pákou, schválně odbytá. Do té bitvy jdu.",
      fr: "L'investissement public au plus fort levier, bâclé exprès. Un combat que je choisis.",
    },
  },
  {
    name: "Research",
    label: { en: "Research", cs: "Výzkum", fr: "La recherche" },
    note: {
      en: "Slow accumulation of usable truth, the opposite of news. My best ideas came from someone else's footnote.",
      cs: "Pomalé hromadění použitelné pravdy, opak zpráv. Moje nejlepší nápady přišly z cizí poznámky pod čarou.",
      fr: "Lente accumulation de vérité utile, le contraire de l'actualité. Mes meilleures idées viennent de la note de bas de page d'un autre.",
    },
  },
  {
    name: "Learning",
    label: { en: "Learning", cs: "Učení", fr: "Apprendre" },
    note: {
      en: "The only durable skill. Everything else gets automated or deprecated.",
      cs: "Jediná trvanlivá dovednost. Všechno ostatní se zautomatizuje nebo zastará.",
      fr: "La seule compétence durable. Le reste finit automatisé ou obsolète.",
    },
  },
]

export const PRACTICE: Item[] = [
  {
    name: "Shaolin method",
    label: { en: "Shaolin method", cs: "Shaolinská metoda", fr: "La méthode Shaolin" },
    href: "https://en.wikipedia.org/wiki/Shaolin_kung_fu",
    note: {
      en: "Twenty thousand hours, one form. Under 1% reach the level you'd recognise on film. Worth knowing before starting anything serious.",
      cs: "Dvacet tisíc hodin, jedna forma. Pod 1 % dojde na úroveň, kterou znáš z filmu. Dobré vědět, než začneš cokoli vážného.",
      fr: "Vingt mille heures, une seule forme. Moins de 1 % atteignent le niveau du cinéma. À savoir avant de commencer quoi que ce soit de sérieux.",
    },
    img: "/art/decay/033.webp",
    ratio: "3 / 4",
    cta: CTA.read,
  },
  {
    name: "Ryōkan",
    href: "https://en.wikipedia.org/wiki/Ry%C5%8Dkan",
    note: {
      en: "Eighteenth-century wandering monk. Wrote on rice paper, played ball with the village kids, refused to teach formally. Patron saint of skill without credentials.",
      cs: "Potulný mnich z 18. století. Psal na rýžový papír, hrál s dětmi na míč, odmítal formálně učit. Patron umu bez papírů.",
      fr: "Moine errant du XVIIIe siècle. Écrivait sur papier de riz, jouait au ballon avec les enfants, refusait d'enseigner. Saint patron du savoir-faire sans diplôme.",
    },
  },
  {
    name: "Chess",
    label: { en: "Chess", cs: "Šachy", fr: "Les échecs" },
    href: "https://lichess.org/",
    note: {
      en: "Perfect information, no luck, only position. About 1850 on lichess: I lose 60% of the games I care about. That's the point.",
      cs: "Úplná informace, žádné štěstí, jen pozice. Na lichess kolem 1850: prohraju 60 % partií, na kterých mi záleží. O to jde.",
      fr: "Information parfaite, aucune chance, juste la position. Environ 1850 sur lichess : je perds 60 % des parties qui comptent. C'est le but.",
    },
  },
  {
    name: "80,000 Hours",
    href: "https://80000hours.org/",
    note: {
      en: "Your career is your biggest lever, with the maths to prove it. Reread yearly.",
      cs: "Kariéra je tvoje největší páka a je na to matika. Číst jednou za rok.",
      fr: "Ta carrière est ton plus grand levier, calculs à l'appui. À relire chaque année.",
    },
  },
]

export const PEOPLE: Item[] = [
  {
    name: "Sammy Obeid",
    href: "https://sammyobeid.com/",
    note: {
      en: "Stand-up with a maths degree, 1,001 nights in a row. A craftsman dressed as a clown.",
      cs: "Stand-up s titulem z matiky, 1001 večerů v řadě. Řemeslník převlečený za klauna.",
      fr: "Du stand-up avec un diplôme de maths, 1001 soirs d'affilée. Un artisan déguisé en clown.",
    },
    cta: { en: "the act", cs: "to číslo", fr: "le numéro" },
  },
  {
    name: "Ian Carroll",
    href: "https://www.youtube.com/@IanCarrollshow",
    note: {
      en: "Independent journalist pulling the threads others are paid to leave alone.",
      cs: "Nezávislý novinář, co tahá za nitky, které jsou jiní placení nechat být.",
      fr: "Journaliste indépendant qui tire les fils que d'autres sont payés pour ignorer.",
    },
    cta: { en: "the show", cs: "ten pořad", fr: "l'émission" },
  },
  {
    name: "Zdislava Pokorná",
    note: {
      en: "Quietly corrects my taste when I drift. Anything good here is partly hers.",
      cs: "Tiše mi srovná vkus, když ujíždím. Cokoli dobrého tu je, je zčásti její.",
      fr: "Corrige mon goût en silence quand je dérive. Ce qui est bon ici lui doit en partie.",
    },
  },
  {
    name: "Jan Špaček",
    note: {
      en: "Brings the right question, not the obvious one. The call when the prototype's on fire.",
      cs: "Přijde se správnou otázkou, ne s tou očividnou. Volám mu, když prototyp hoří.",
      fr: "Arrive avec la bonne question, pas l'évidente. Celui qu'on appelle quand le prototype brûle.",
    },
  },
]

export const MISC: Item[] = [
  {
    name: "Paint",
    label: { en: "Paint", cs: "Barva", fr: "La peinture" },
    note: {
      en: "The medium that won't lie about effort. You can see where the brush hesitated.",
      cs: "Médium, co nelže o námaze. Je vidět, kde štětec zaváhal.",
      fr: "Le médium qui ne ment pas sur l'effort. On voit où le pinceau a hésité.",
    },
    img: "/art/acrylic/006.webp",
    ratio: "4 / 3",
  },
  {
    name: "Coconuts",
    label: { en: "Coconuts", cs: "Kokosy", fr: "Les noix de coco" },
    note: {
      en: "Water, fat, fibre, shell, fuel. A self-contained system. Argue with that.",
      cs: "Voda, tuk, vláknina, skořápka, palivo. Soběstačný systém. Zkus to vyvrátit.",
      fr: "Eau, gras, fibre, coque, combustible. Un système autonome. Essaie de contredire ça.",
    },
    img: "/more/coconut.jpg",
    ratio: "2 / 3",
  },
]

export interface NowEntry {
  k: string
  kl: Localized
  v: Localized
}

export const NOW: NowEntry[] = [
  {
    k: "reading",
    kl: { en: "reading", cs: "čtu", fr: "je lis" },
    v: {
      en: "Weldon, The Caped Crusade. Batman as a mirror held up to nerd culture.",
      cs: "Weldon, The Caped Crusade. Batman jako zrcadlo nerdovské kultury.",
      fr: "Weldon, The Caped Crusade. Batman en miroir de la culture nerd.",
    },
  },
  {
    k: "building",
    kl: { en: "building", cs: "stavím", fr: "je construis" },
    v: {
      en: "Laifea. The exocortex is live; now it learns to brief me before I ask.",
      cs: "Laifeu. Exokortex běží; teď se učí hlásit mi věci dřív, než se zeptám.",
      fr: "Laifea. L'exocortex tourne ; il apprend à me briefer avant que je demande.",
    },
  },
  {
    k: "listening",
    kl: { en: "listening", cs: "poslouchám", fr: "j'écoute" },
    v: {
      en: "Waits, Bone Machine · Jenkins, The Patience · Maiden, Senjutsu.",
      cs: "Waits, Bone Machine · Jenkins, The Patience · Maiden, Senjutsu.",
      fr: "Waits, Bone Machine · Jenkins, The Patience · Maiden, Senjutsu.",
    },
  },
  {
    k: "learning",
    kl: { en: "learning", cs: "učím se", fr: "j'apprends" },
    v: {
      en: "to weld. Badly, on purpose.",
      cs: "svařovat. Špatně, schválně.",
      fr: "à souder. Mal, exprès.",
    },
  },
  {
    k: "keeping",
    kl: { en: "keeping", cs: "držím", fr: "je tiens" },
    v: {
      en: "a strength routine. Week six. Knees grateful.",
      cs: "silový trénink. Šestý týden. Kolena děkují.",
      fr: "une routine de force. Sixième semaine. Les genoux disent merci.",
    },
  },
  {
    k: "annoyed by",
    kl: { en: "annoyed by", cs: "štve mě", fr: "ça m'agace" },
    v: {
      en: "“vision” with no number attached.",
      cs: "„vize“ bez jediného čísla.",
      fr: "la « vision » sans aucun chiffre.",
    },
  },
]

export const NOT_GREAT: Localized[] = [
  { en: "sleeping before midnight", cs: "spát před půlnocí", fr: "dormir avant minuit" },
  {
    en: "finishing personal projects (this site excepted)",
    cs: "dotahovat vlastní projekty (tenhle web výjimkou)",
    fr: "finir mes projets perso (ce site excepté)",
  },
  { en: "saying no when I'm interested", cs: "říct ne, když mě to zajímá", fr: "dire non quand ça m'intéresse" },
  {
    en: "small talk past ninety seconds",
    cs: "small talk po devadesáti vteřinách",
    fr: "le small talk au-delà de quatre-vingt-dix secondes",
  },
  { en: "knees, after thirty", cs: "kolena po třicítce", fr: "les genoux, passé trente ans" },
  { en: "coriander", cs: "koriandr", fr: "la coriandre" },
]

export const FIGHTING: Localized[] = [
  {
    en: "The LARP economy: engineers who tweet more than they ship.",
    cs: "LARP ekonomika: inženýři, co víc tweetují, než dodávají.",
    fr: "L'économie du LARP : des ingénieurs qui tweetent plus qu'ils ne livrent.",
  },
  {
    en: "The firehose of falsehood: volume as the message.",
    cs: "Hadice lží: objem jako sdělení.",
    fr: "Le canon à mensonges : le volume comme message.",
  },
  {
    en: "Gerontocracy: the same hands on the same levers.",
    cs: "Gerontokracie: tytéž ruce na týchž pákách.",
    fr: "La gérontocratie : les mêmes mains sur les mêmes leviers.",
  },
  {
    en: "Bullshit jobs. Read Graeber, then audit your calendar.",
    cs: "Bullshit joby. Přečti si Graebera, pak si projdi kalendář.",
    fr: "Les jobs à la con. Lis Graeber, puis audite ton agenda.",
  },
  {
    en: "The LinkedIn AI parade: pretending the machine didn't write it.",
    cs: "LinkedInová AI přehlídka: dělat, že to nenapsal stroj.",
    fr: "La parade IA de LinkedIn : faire comme si la machine n'avait rien écrit.",
  },
  {
    en: "Surveillance capitalism: kompromat on everyone, by default.",
    cs: "Dohledový kapitalismus: kompromat na každého, automaticky.",
    fr: "Le capitalisme de surveillance : du kompromat sur tous, par défaut.",
  },
  {
    en: "Nostalgia industries: the Kafka tote bag, no page read.",
    cs: "Průmysl nostalgie: taška s Kafkou, ani stránka přečtená.",
    fr: "Les industries de la nostalgie : le tote bag Kafka, aucune page lue.",
  },
  {
    en: "The podcast gold rush: panning for status.",
    cs: "Podcastová zlatá horečka: rýžování statusu.",
    fr: "La ruée vers l'or du podcast : on orpaille du statut.",
  },
  {
    en: "Institutional capture: red tape and routing numbers.",
    cs: "Ovládnuté instituce: byrokracie a čísla účtů.",
    fr: "La capture des institutions : paperasse et numéros de compte.",
  },
  {
    en: "Flat-pack relationships: step three always rebuilds the wrong thing.",
    cs: "Vztahy ze stavebnice: třetí krok vždycky staví znovu špatnou věc.",
    fr: "Les relations en kit : l'étape trois reconstruit toujours la mauvaise chose.",
  },
  {
    en: "The slow erosion of attention. Mine first.",
    cs: "Pomalá eroze pozornosti. Nejdřív té mojí.",
    fr: "L'érosion lente de l'attention. La mienne d'abord.",
  },
]

export const BUMS: Localized[] = [
  {
    en: "my grandmother forgetting my face, one Sunday at a time.",
    cs: "babička, co zapomíná moji tvář, neděli po neděli.",
    fr: "ma grand-mère qui oublie mon visage, un dimanche après l'autre.",
  },
  {
    en: "the time debt: every unshipped fragment, compounding.",
    cs: "časový dluh: každý nedodaný kousek se úročí.",
    fr: "la dette de temps : chaque fragment non livré, avec intérêts.",
  },
  {
    en: "the silence after a release that didn't land. Worse: when nobody noticed.",
    cs: "ticho po vydání, které nezabralo. Horší: když si nikdo nevšiml.",
    fr: "le silence après une sortie ratée. Pire : quand personne n'a remarqué.",
  },
  { en: "my Czech rusting.", cs: "moje čeština, co rezaví.", fr: "mon tchèque qui rouille." },
  {
    en: "more meetings, less work done.",
    cs: "víc schůzí, míň hotové práce.",
    fr: "plus de réunions, moins de travail fait.",
  },
  {
    en: "the next prodigy is six and about to lap me.",
    cs: "dalšímu zázračnému dítěti je šest a brzy mě předjede.",
    fr: "le prochain prodige a six ans et va me doubler.",
  },
  { en: "December.", cs: "Prosinec.", fr: "Décembre." },
]

export const KEEPS: Localized[] = [
  {
    en: "the studio before 7am, door locked.",
    cs: "ateliér před sedmou, zamčeno.",
    fr: "l'atelier avant 7 h, porte fermée.",
  },
  { en: "the build going green.", cs: "build, co zezelená.", fr: "le build qui passe au vert." },
  {
    en: "my wife's text: “u eat lunch?”",
    cs: "esemeska od ženy: „dal sis oběd?“",
    fr: "le texto de ma femme : « t'as mangé ? »",
  },
  { en: "the dog at the door.", cs: "pes u dveří.", fr: "le chien à la porte." },
  { en: "coffee made the slow way.", cs: "káva dělaná pomalu.", fr: "le café fait lentement." },
  {
    en: "the next skater landing the line I bailed.",
    cs: "další skejťák, co dá lajnu, kterou jsem položil.",
    fr: "le skateur qui passe la ligne que j'ai ratée.",
  },
  {
    en: "Sombra surfacing a 2021 note I forgot writing.",
    cs: "Sombra vytáhne poznámku z roku 2021, na kterou jsem zapomněl.",
    fr: "Sombra qui ressort une note de 2021 que j'avais oubliée.",
  },
  { en: "finishing one thing, even a small one.", cs: "dotáhnout jednu věc, i malou.", fr: "finir une chose, même petite." },
  { en: "riffs that don't wear out.", cs: "riffy, co se neohrají.", fr: "des riffs qui ne s'usent pas." },
  {
    en: "a chord change I didn't see coming.",
    cs: "změna akordu, kterou jsem nečekal.",
    fr: "un changement d'accord que je n'ai pas vu venir.",
  },
  {
    en: "my mother's quiet “že jo”, the Czech tag that ends an argument.",
    cs: "mámino tiché „že jo“, které ukončí každou hádku.",
    fr: "le « že jo » tranquille de ma mère, qui clôt toute dispute.",
  },
]

export const ANCHORS: Array<{ k: string; kl: Localized; v: Localized }> = [
  {
    k: "my dog",
    kl: { en: "my dog", cs: "můj pes", fr: "mon chien" },
    v: {
      en: "a small menace who tested every prototype with her teeth.",
      cs: "malá potvora, co každý prototyp otestovala zubama.",
      fr: "une petite peste qui a testé chaque prototype avec ses dents.",
    },
  },
  {
    k: "my wife",
    kl: { en: "my wife", cs: "moje žena", fr: "ma femme" },
    v: {
      en: "the keel. Quiet, patient, corrects my course.",
      cs: "kýl. Tichá, trpělivá, srovná mi kurz.",
      fr: "la quille. Calme, patiente, corrige mon cap.",
    },
  },
  {
    k: "my mother",
    kl: { en: "my mother", cs: "moje máma", fr: "ma mère" },
    v: {
      en: "taught me to read drawings before words.",
      cs: "naučila mě číst výkresy dřív než slova.",
      fr: "m'a appris à lire les plans avant les mots.",
    },
  },
  {
    k: "my skateboard",
    kl: { en: "my skateboard", cs: "můj skejt", fr: "ma planche" },
    v: {
      en: "an old deck on Indys. Taught me commitment before any boss did.",
      cs: "stará deska na Indy truckách. Naučila mě nasazení dřív než jakýkoli šéf.",
      fr: "une vieille planche sur des Indy. M'a appris l'engagement avant tout patron.",
    },
  },
  {
    k: "my values",
    kl: { en: "my values", cs: "moje hodnoty", fr: "mes valeurs" },
    v: {
      en: "honesty over politeness. shipping over polish. craft over speed. people over performance.",
      cs: "poctivost nad zdvořilost. dodat nad vyleštit. řemeslo nad rychlost. lidi nad výkon.",
      fr: "l'honnêteté avant la politesse. livrer avant peaufiner. le métier avant la vitesse. les gens avant la performance.",
    },
  },
]

// Live experiments. Running code, not products.
export const LAB_LINKS: Array<{ href: string; title: string; sub: Localized; cta: Localized }> = [
  {
    href: "/experiments/ink",
    title: "ink * vgpu",
    sub: {
      en: "Fluid ink you stir with a finger. Typed WGSL on Vercel's vgpu.",
      cs: "Tekutá tuš, kterou mícháš prstem. Typovaný WGSL na vgpu od Vercelu.",
      fr: "De l'encre fluide à remuer du doigt. WGSL typé sur le vgpu de Vercel.",
    },
    cta: { en: "stir it", cs: "zamíchej", fr: "remuer" },
  },
  {
    href: "/experiments/flow",
    title: "flow * webgpu",
    sub: {
      en: "200,000 particles in WebGPU compute, WebGL 2 fallback.",
      cs: "200 000 částic ve WebGPU compute, záloha ve WebGL 2.",
      fr: "200 000 particules en compute WebGPU, repli WebGL 2.",
    },
    cta: { en: "run it", cs: "spusť", fr: "lancer" },
  },
  {
    href: "/boids",
    title: "boids",
    sub: {
      en: "Three rules, one flock. GPGPU, every knob exposed.",
      cs: "Tři pravidla, jedno hejno. GPGPU, všechny knoflíky venku.",
      fr: "Trois règles, une nuée. GPGPU, tous les réglages exposés.",
    },
    cta: CTA.play,
  },
  {
    href: "/games/angles",
    title: "trace it",
    sub: {
      en: "A polygon flashes. Redraw it from memory.",
      cs: "Mnohoúhelník blikne. Obkresli ho zpaměti.",
      fr: "Un polygone clignote. Retrace-le de mémoire.",
    },
    cta: CTA.play,
  },
  {
    href: "/games/proportion",
    title: "proportion",
    sub: {
      en: "Guess aspect ratios. Harder than it sounds.",
      cs: "Tipuj poměry stran. Těžší, než to zní.",
      fr: "Devine des proportions. Plus dur qu'il n'y paraît.",
    },
    cta: CTA.play,
  },
]

export const OUT_LINKS: Array<{ href: string; title: string; sub?: Localized; cta: Localized }> = [
  {
    href: "https://laifea.app",
    title: "laifea.app",
    sub: { en: "where the real ones ship", cs: "kde dodávám ty opravdové", fr: "là où sortent les vrais" },
    cta: CTA.open,
  },
  { href: "https://github.com/WalterGropius", title: "github", cta: CTA.see },
  { href: "https://linkedin.com/in/zenbauhaus", title: "linkedin", cta: CTA.connect },
  { href: "https://instagram.com/y4ngyin", title: "instagram", cta: CTA.follow },
  {
    href: "https://soundcloud.com/mczenbauhaus",
    title: "soundcloud",
    sub: { en: "as mc zenbauhaus", cs: "jako mc zenbauhaus", fr: "en mc zenbauhaus" },
    cta: CTA.listen,
  },
  { href: "https://sketchfab.com/zenbauhaus", title: "sketchfab", cta: CTA.explore },
  {
    href: "https://open.spotify.com/album/1V3m6SMvu8Bodq4scdqD3o",
    title: "cpt. demo ep",
    sub: { en: "cover art by me", cs: "obal ode mě", fr: "pochette de moi" },
    cta: CTA.listen,
  },
]

// Page chrome.
export const UI = {
  title: { en: "more", cs: "víc", fr: "plus" },
  intro: {
    en: "The off-the-record half. Open anything.",
    cs: "Neoficiální půlka. Otevři cokoli.",
    fr: "La moitié officieuse. Ouvre ce que tu veux.",
  },
  now: { en: "now", cs: "teď", fr: "en ce moment" },
  surprise: { en: "surprise me", cs: "překvap mě", fr: "surprends-moi" },
  close: { en: "close", cs: "zavřít", fr: "fermer" },
  prev: { en: "previous", cs: "předchozí", fr: "précédent" },
  next: { en: "next", cs: "další", fr: "suivant" },
  open: { en: "open", cs: "otevřít", fr: "ouvrir" },
  shelfLove: { en: "stuff I love", cs: "co mám rád", fr: "ce que j'aime" },
  shelfLoveSub: {
    en: "Only what changed the work.",
    cs: "Jen to, co pohnulo prací.",
    fr: "Seulement ce qui a changé le travail.",
  },
  shelfRecord: { en: "off the record", cs: "mimo záznam", fr: "en off" },
  shelfMade: { en: "made & elsewhere", cs: "tvorba a jinde", fr: "créé & ailleurs" },
  sketchbook: { en: "from the sketchbook", cs: "ze skicáku", fr: "du carnet" },
  seeWork: { en: "see the work", cs: "mrkni na práci", fr: "voir le travail" },
  wholeWall: { en: "the whole wall", cs: "celá zeď", fr: "tout le mur" },
  requiemCap: {
    en: "Pietà, a moving piece of mine. Sound optional.",
    cs: "Pieta, moje pohyblivé dílo. Zvuk volitelný.",
    fr: "Pietà, une de mes pièces animées. Son facultatif.",
  },
  bumsHeading: { en: "what drags", cs: "co táhne dolů", fr: "ce qui pèse" },
  keepsHeading: { en: "what lifts", cs: "co zvedá", fr: "ce qui porte" },
  labNote: {
    en: "Experiments, not products. Bring a GPU.",
    cs: "Experimenty, ne produkty. Vezmi si GPU.",
    fr: "Des expériences, pas des produits. Prévois un GPU.",
  },
  blogRead: { en: "read it", cs: "přečti si", fr: "à lire" },
  allPosts: { en: "all posts", cs: "všechny zápisky", fr: "tous les billets" },
  loading: { en: "loading…", cs: "načítám…", fr: "chargement…" },
  openSource: { en: "this site is open source", cs: "tenhle web je open source", fr: "ce site est open source" },
  waitsCap: { en: "Tom Waits, Hold On.", cs: "Tom Waits, Hold On.", fr: "Tom Waits, Hold On." },
  jenkinsCap: { en: "Mick Jenkins, The Water[s].", cs: "Mick Jenkins, The Water[s].", fr: "Mick Jenkins, The Water[s]." },
  zenbauhausCap: {
    en: "mc zenbauhaus: the other side of the desk.",
    cs: "mc zenbauhaus: druhá strana stolu.",
    fr: "mc zenbauhaus : l'autre côté du bureau.",
  },
} satisfies Record<string, Localized>

// ---------------------------------------------------------------------------
// Chapters — the cabinet. Order sets numbering and prev / next.
// ---------------------------------------------------------------------------

export type ChapterId =
  | "now"
  | "aesthetic"
  | "music"
  | "film"
  | "skating"
  | "code"
  | "mind"
  | "practice"
  | "people"
  | "misc"
  | "fighting"
  | "not-great"
  | "weight"
  | "anchors"
  | "requiem"
  | "wall"
  | "lab"
  | "blog"
  | "elsewhere"

export type Shelf = "now" | "love" | "record" | "made"

export type Mark =
  | "rams"
  | "fork"
  | "eye"
  | "hill"
  | "node"
  | "brain"
  | "enso"
  | "pin"
  | "coconut"
  | "fist"
  | "cross"
  | "scale"
  | "anchor"
  | "play"
  | "frame"
  | "flask"
  | "pen"
  | "arrow"
  | "bauhaus"

export interface Chapter {
  id: ChapterId
  shelf: Shelf
  title: Localized
  hook: Localized
  img: string
  // tile frame proportion and lean on the contact sheet
  ratio: string
  tilt: number
  mark: Mark
}

export const CHAPTERS: Chapter[] = [
  {
    id: "now",
    shelf: "now",
    title: { en: "now", cs: "teď", fr: "en ce moment" },
    hook: { en: "On the desk this month.", cs: "Co je teď na stole.", fr: "Sur la table ce mois-ci." },
    img: "/art/surfaces/106.webp",
    ratio: "4 / 3",
    tilt: -1.2,
    mark: "arrow",
  },
  {
    id: "aesthetic",
    shelf: "love",
    title: { en: "aesthetic & design", cs: "estetika a design", fr: "esthétique & design" },
    hook: { en: "Friedrich, Kupka, Bauhaus, Rams.", cs: "Friedrich, Kupka, Bauhaus, Rams.", fr: "Friedrich, Kupka, Bauhaus, Rams." },
    img: "/more/wanderer.jpg",
    ratio: "5 / 4",
    tilt: -2.2,
    mark: "rams",
  },
  {
    id: "music",
    shelf: "love",
    title: { en: "music", cs: "hudba", fr: "musique" },
    hook: { en: "Waits, Maiden, Sabbath, Zappa, Jenkins.", cs: "Waits, Maiden, Sabbath, Zappa, Jenkins.", fr: "Waits, Maiden, Sabbath, Zappa, Jenkins." },
    img: "/art/surfaces/073.webp",
    ratio: "4 / 3",
    tilt: 1.6,
    mark: "fork",
  },
  {
    id: "film",
    shelf: "love",
    title: { en: "film", cs: "film", fr: "cinéma" },
    hook: { en: "Lynch, mostly.", cs: "Hlavně Lynch.", fr: "Lynch, surtout." },
    img: "/art/surfaces/079.webp",
    ratio: "1 / 1",
    tilt: -0.8,
    mark: "eye",
  },
  {
    id: "skating",
    shelf: "love",
    title: { en: "skating", cs: "skejt", fr: "skate" },
    hook: { en: "Twenty-three years, two fractures.", cs: "Třiadvacet let, dvě zlomeniny.", fr: "Vingt-trois ans, deux fractures." },
    img: "/art/surfaces/270.webp",
    ratio: "3 / 2",
    tilt: 2.1,
    mark: "hill",
  },
  {
    id: "code",
    shelf: "love",
    title: { en: "code & tools", cs: "kód a nástroje", fr: "code & outils" },
    hook: { en: "Carmack, Torvalds, Garry's Mod.", cs: "Carmack, Torvalds, Garry's Mod.", fr: "Carmack, Torvalds, Garry's Mod." },
    img: "/art/surfaces/057.webp",
    ratio: "5 / 4",
    tilt: -1.6,
    mark: "node",
  },
  {
    id: "mind",
    shelf: "love",
    title: { en: "mind & science", cs: "mysl a věda", fr: "esprit & science" },
    hook: { en: "Brains, research, learning.", cs: "Mozky, výzkum, učení.", fr: "Cerveaux, recherche, apprendre." },
    img: "/art/surfaces/133.webp",
    ratio: "4 / 3",
    tilt: 1.2,
    mark: "brain",
  },
  {
    id: "practice",
    shelf: "love",
    title: { en: "discipline", cs: "disciplína", fr: "discipline" },
    hook: { en: "Shaolin, Ryōkan, chess.", cs: "Shaolin, Ryōkan, šachy.", fr: "Shaolin, Ryōkan, les échecs." },
    img: "/art/surfaces/166.webp",
    ratio: "1 / 1",
    tilt: -2.4,
    mark: "enso",
  },
  {
    id: "people",
    shelf: "love",
    title: { en: "people", cs: "lidi", fr: "les gens" },
    hook: { en: "The ones I keep listening to.", cs: "Lidi, které pořád poslouchám.", fr: "Ceux que j'écoute encore." },
    img: "/art/surfaces/139.webp",
    ratio: "3 / 2",
    tilt: 1.8,
    mark: "pin",
  },
  {
    id: "misc",
    shelf: "love",
    title: { en: "misc", cs: "různé", fr: "divers" },
    hook: { en: "Paint and coconuts.", cs: "Barva a kokosy.", fr: "La peinture et les noix de coco." },
    img: "/more/coconut.jpg",
    ratio: "5 / 4",
    tilt: -1.1,
    mark: "coconut",
  },
  {
    id: "fighting",
    shelf: "record",
    title: { en: "what I'm fighting", cs: "proti čemu jdu", fr: "mes combats" },
    hook: { en: "What I push against.", cs: "Do čeho se opírám.", fr: "Ce contre quoi je pousse." },
    img: "/art/surfaces/276.webp",
    ratio: "1 / 1",
    tilt: 1.4,
    mark: "fist",
  },
  {
    id: "not-great",
    shelf: "record",
    title: { en: "not great at", cs: "co mi nejde", fr: "pas doué pour" },
    hook: { en: "The honest list.", cs: "Upřímný seznam.", fr: "La liste honnête." },
    img: "/art/surfaces/252.webp",
    ratio: "3 / 2",
    tilt: -1.9,
    mark: "cross",
  },
  {
    id: "weight",
    shelf: "record",
    title: { en: "weight & antidote", cs: "zátěž a protijed", fr: "le poids & l'antidote" },
    hook: { en: "What drags, what lifts.", cs: "Co táhne dolů, co zvedá.", fr: "Ce qui pèse, ce qui porte." },
    img: "/art/surfaces/112.webp",
    ratio: "5 / 4",
    tilt: 0.9,
    mark: "scale",
  },
  {
    id: "anchors",
    shelf: "record",
    title: { en: "anchors", cs: "kotvy", fr: "ancres" },
    hook: { en: "Dog, wife, mother, board, values.", cs: "Pes, žena, máma, prkno, hodnoty.", fr: "Chien, femme, mère, planche, valeurs." },
    img: "/art/surfaces/124.webp",
    ratio: "4 / 3",
    tilt: -1.4,
    mark: "anchor",
  },
  {
    id: "requiem",
    shelf: "made",
    title: { en: "requiem", cs: "rekviem", fr: "requiem" },
    hook: { en: "Pietà, a moving piece.", cs: "Pieta, pohyblivé dílo.", fr: "Pietà, une pièce animée." },
    img: "/art/surfaces/127.webp",
    ratio: "1 / 1",
    tilt: 1.1,
    mark: "play",
  },
  {
    id: "wall",
    shelf: "made",
    title: { en: "off the wall", cs: "ze zdi", fr: "hors cadre" },
    hook: { en: "Paintings, unframed.", cs: "Obrazy bez rámu.", fr: "Des toiles, sans cadre." },
    img: "/art/surfaces/225.webp",
    ratio: "3 / 2",
    tilt: -2,
    mark: "frame",
  },
  {
    id: "lab",
    shelf: "made",
    title: { en: "the lab", cs: "laborka", fr: "le labo" },
    hook: { en: "Five experiments that actually run.", cs: "Pět experimentů, které fakt běží.", fr: "Cinq expériences qui tournent vraiment." },
    img: "/art/surfaces/219.webp",
    ratio: "5 / 4",
    tilt: 1.7,
    mark: "flask",
  },
  {
    id: "blog",
    shelf: "made",
    title: { en: "blog", cs: "blog", fr: "blog" },
    hook: { en: "Loose notes, latest three.", cs: "Volné zápisky, poslední tři.", fr: "Notes libres, les trois dernières." },
    img: "/art/surfaces/231.webp",
    ratio: "3 / 2",
    tilt: -1.3,
    mark: "pen",
  },
  {
    id: "elsewhere",
    shelf: "made",
    title: { en: "elsewhere", cs: "jinde", fr: "ailleurs" },
    hook: { en: "GitHub, SoundCloud, Sketchfab and co.", cs: "GitHub, SoundCloud, Sketchfab a spol.", fr: "GitHub, SoundCloud, Sketchfab et cie." },
    img: "/art/landscape/096.webp",
    ratio: "1 / 1",
    tilt: 2.2,
    mark: "bauhaus",
  },
]

export const CHAPTER_IDS = CHAPTERS.map((c) => c.id)

export function isChapterId(s: string): s is ChapterId {
  return (CHAPTER_IDS as string[]).includes(s)
}

// Media used by the expanded chapters.

export const SKETCHBOOK: Array<{ src: string; ratio: string; tilt: string }> = [
  { src: "/art/img-001.webp", ratio: "3 / 4", tilt: "-2.2deg" },
  { src: "/art/img-009.webp", ratio: "1 / 1", tilt: "1.6deg" },
  { src: "/art/img-019.webp", ratio: "4 / 5", tilt: "-1.1deg" },
  { src: "/art/img-031.webp", ratio: "3 / 4", tilt: "2.4deg" },
  { src: "/art/img-041.webp", ratio: "2 / 3", tilt: "-1.8deg" },
  { src: "/art/img-052.webp", ratio: "1 / 1", tilt: "1.2deg" },
]

export const SCATTER: Array<{ src: string; span: string; ratio: string; tilt: string; extra: string }> = [
  { src: "/art/surfaces/045.webp", span: "col-span-2 sm:col-span-7", ratio: "3 / 2", tilt: "-1.6deg", extra: "" },
  { src: "/art/weird/120.webp", span: "sm:col-span-5", ratio: "4 / 5", tilt: "2deg", extra: "sm:mt-10" },
  { src: "/art/landscape/077.webp", span: "sm:col-span-4", ratio: "1 / 1", tilt: "-2.2deg", extra: "sm:mt-3" },
  { src: "/art/reflections/030.webp", span: "sm:col-span-5", ratio: "3 / 2", tilt: "1.4deg", extra: "" },
  { src: "/art/stalking/060.webp", span: "col-span-2 sm:col-span-3", ratio: "2 / 3", tilt: "-1deg", extra: "sm:mt-8" },
]

export const WATCH: Array<{ id: string; title: string }> = [
  { id: "PCmZBeNVy7g", title: "Tom Waits — Hold On" },
  { id: "NCceAA0fIm0", title: "Iron Maiden — Hallowed Be Thy Name" },
  { id: "0lkir-mvjqI", title: "Black Sabbath — Black Sabbath" },
  { id: "u05PVbbI_zo", title: "Zappa — Watermelon in Easter Hay" },
]

export const LOVE_ITEMS: Partial<Record<ChapterId, Item[]>> = {
  aesthetic: AESTHETIC,
  music: MUSIC,
  film: FILM,
  skating: SKATE,
  code: CODE,
  mind: MIND,
  practice: PRACTICE,
  people: PEOPLE,
  misc: MISC,
}
