"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight, ExternalLink, Github } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { PageLoader } from "@/components/page-loader"
import { MotionText } from "@/components/motion-text"
import { InkLine } from "@/components/ink-line"
import { useI18n } from "@/lib/i18n/provider"
import { pick, type Localized } from "@/lib/i18n/localize"
import artData from "../../public/art.json"

// Capitalize just the first letter — the page uses sentence-case
// labels, never ALL CAPS.
const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

// /more is the off-the-record half of the site. Not a site map — the
// nav has those. A catalogue of inputs that shaped the work, written
// in the same flat, specific voice as the art book: say the thing,
// don't sell it. Layout breathes — featured items get an image and a
// side of the page; the rest stay as compact notes so the rhythm
// never settles into a wall.

type Item = {
  name: string
  // stable English `name` doubles as React key + Thumb seed. `label`
  // carries a translated display name for the concept items (Chess,
  // Paint…); proper nouns leave it unset and display `name`.
  label?: Localized
  href?: string
  note: Localized
  // featured items carry an image (or a self-hosted video) and break
  // to their own row, alternating which side they hug. Ratios vary on
  // purpose so the column never settles into a tidy strip.
  img?: string
  video?: string
  ratio?: string
  // every outbound/featured link gets a plain-spoken CTA, three words
  // max — a real button, not a hairline arrow you have to hunt for.
  cta?: Localized
}

// Shared three-word CTAs and section labels, hand-translated. The soft-n
// glyph is avoided everywhere — the display font carries no glyph for it.
const CTA = {
  read: { en: "read it", cs: "přečti si", fr: "à lire" },
  hear: { en: "hear it", cs: "poslechni", fr: "à écouter" },
  see: { en: "see code", cs: "kód", fr: "le code" },
  follow: { en: "follow", cs: "sleduj", fr: "suivre" },
  play: { en: "play me", cs: "zahraj si", fr: "jouer" },
  open: { en: "open it", cs: "otevři", fr: "ouvrir" },
  listen: { en: "listen", cs: "poslechni", fr: "écouter" },
  explore: { en: "explore", cs: "prozkoumej", fr: "explorer" },
  connect: { en: "connect", cs: "spoj se", fr: "connecter" },
} satisfies Record<string, Localized>

const AESTHETIC: Item[] = [
  {
    name: "Caspar David Friedrich",
    href: "https://en.wikipedia.org/wiki/Wanderer_above_the_Sea_of_Fog",
    note: {
      en: "Wanderer above the Sea of Fog, in the Kunsthalle Hamburg. I've stood in front of it twice. The second time was the real one.",
      cs: "Poutník nad mořem mlhy, v hamburské Kunsthalle. Stál jsem před ním dvakrát. Podruhé to bylo doopravdy.",
      fr: "Le Voyageur au-dessus de la mer de nuages, à la Kunsthalle de Hambourg. Je suis resté devant deux fois. La deuxième était la vraie.",
    },
    img: "/more/wanderer.jpg",
    ratio: "4 / 5",
    cta: { en: "read it", cs: "přečti si", fr: "à lire" },
  },
  {
    name: "František Kupka",
    href: "https://en.wikipedia.org/wiki/Franti%C5%A1ek_Kupka",
    note: {
      en: "First abstract painter, if you ask a Czech. Amorpha, Fugue in Two Colors is a manual for leaving realism without losing structure.",
      cs: "První abstraktní malíř, když se zeptáš Čecha. Amorfa, fuga dvou barev je návod, jak opustit realismus, a neztratit přitom strukturu.",
      fr: "Le premier peintre abstrait, si tu demandes à un Tchèque. Amorpha, fugue à deux couleurs est un manuel pour quitter le réalisme sans perdre la structure.",
    },
    img: "/more/kupka-amorpha.jpg",
    ratio: "1 / 1",
    cta: { en: "the painter", cs: "ten malíř", fr: "le peintre" },
  },
  {
    name: "Bauhaus",
    href: "https://en.wikipedia.org/wiki/Bauhaus",
    note: {
      en: "Gropius opened the school in 1919 to argue that craft and engineering are one discipline. Still the cleanest version of that argument. My git handle isn't a coincidence.",
      cs: "Gropius otevřel školu v roce 1919, aby ukázal, že řemeslo a inženýrství jsou jedna disciplína. Pořád nejčistší verze toho argumentu. Můj git handle není náhoda.",
      fr: "Gropius a ouvert l'école en 1919 pour défendre l'idée que l'artisanat et l'ingénierie sont une seule discipline. Toujours la version la plus nette de cet argument. Mon pseudo git n'est pas un hasard.",
    },
  },
  {
    name: "Wabi-sabi",
    href: "https://en.wikipedia.org/wiki/Wabi-sabi",
    note: {
      en: "Koren's small book is the only design treatise I keep on the shelf. The dent in the bowl is the bowl.",
      cs: "Korenova tenká knížka je jediný designový traktát, co mám na polici. Promáčklina v misce je ta miska.",
      fr: "Le petit livre de Koren est le seul traité de design que je garde sur l'étagère. La bosse dans le bol, c'est le bol.",
    },
  },
  {
    name: "Dieter Rams",
    href: "https://www.vitsoe.com/eu/about/good-design",
    note: {
      en: "Ten principles. The discipline is asking would Rams keep it before adding the second feature — and stopping when the answer is no.",
      cs: "Deset principů. Disciplína je ptát se nechal by to Rams? dřív, než přidáš druhou funkci — a přestat, když je odpověď ne.",
      fr: "Dix principes. La discipline, c'est de se demander Rams le garderait-il ? avant d'ajouter la deuxième fonction — et de s'arrêter quand la réponse est non.",
    },
  },
  {
    name: "Tony Garnier",
    href: "https://en.wikipedia.org/wiki/Tony_Garnier_(architect)",
    note: {
      en: "Cité Industrielle, 1904 — a workers' city where every home gets a bathroom and a pool. He had no idea how to build it. He drew it anyway.",
      cs: "Cité Industrielle, 1904 — dělnické město, kde každý dům má koupelnu a bazén. Neměl tušení, jak to postavit. Nakreslil to stejně.",
      fr: "Cité Industrielle, 1904 — une cité ouvrière où chaque logement a une salle de bain et une piscine. Il n'avait aucune idée de comment la bâtir. Il l'a dessinée quand même.",
    },
  },
  {
    name: "Zen",
    href: "https://en.wikipedia.org/wiki/Zen",
    note: {
      en: "Less a religion than a method. Sit, watch the thinking, notice it isn't you. Twelve minutes a day, nothing measurable, everything changed.",
      cs: "Spíš metoda než náboženství. Sedni si, sleduj myšlení, všimni si, že to nejsi ty. Dvanáct minut denně, nic měřitelného, a všechno jinak.",
      fr: "Moins une religion qu'une méthode. Assieds-toi, observe la pensée, remarque que ce n'est pas toi. Douze minutes par jour, rien de mesurable, et tout a changé.",
    },
  },
]

const MUSIC: Item[] = [
  {
    name: "Tom Waits",
    href: "https://www.youtube.com/watch?v=PCmZBeNVy7g",
    note: {
      en: "Bone Machine lives next to the claw hammer. Same job. Start with Hold On.",
      cs: "Bone Machine leží vedle palice. Stejná práce. Začni u Hold On.",
      fr: "Bone Machine est posé à côté du marteau. Même boulot. Commence par Hold On.",
    },
  },
  {
    name: "Iron Maiden",
    href: "https://www.youtube.com/watch?v=NCceAA0fIm0",
    note: {
      en: "O2, 2018 — worth the queue and a week of half-deaf left ear. Hallowed Be Thy Name is a short story.",
      cs: "O2, 2018 — stálo to za frontu i za týden poloohluchého levého ucha. Hallowed Be Thy Name je povídka.",
      fr: "O2, 2018 — valait la file et une semaine d'oreille gauche à moitié sourde. Hallowed Be Thy Name est une nouvelle.",
    },
  },
  {
    name: "Black Sabbath",
    href: "https://www.youtube.com/watch?v=0lkir-mvjqI",
    note: {
      en: "Iommi lost two fingertips in a factory press at seventeen and built a genre with what was left. Disability into discipline into industry.",
      cs: "Iommi přišel v sedmnácti v továrním lisu o dvě bříška prstů a z toho, co zbylo, postavil žánr. Z postižení disciplína, z disciplíny průmysl.",
      fr: "Iommi a perdu deux bouts de doigts dans une presse d'usine à dix-sept ans et a bâti un genre avec ce qui restait. Du handicap à la discipline, de la discipline à une industrie.",
    },
    img: "/art/decay/021.webp",
    ratio: "4 / 5",
    cta: { en: "play it", cs: "pusť si", fr: "à écouter" },
  },
  {
    name: "Frank Zappa",
    href: "https://www.youtube.com/watch?v=u05PVbbI_zo",
    note: {
      en: "Watermelon in Easter Hay — he knew it was his last solo, and you can hear it. The cleanest goodbye anyone played on a guitar.",
      cs: "Watermelon in Easter Hay — věděl, že je to jeho poslední sólo, a je to slyšet. Nejčistší rozloučení, co kdo zahrál na kytaru.",
      fr: "Watermelon in Easter Hay — il savait que c'était son dernier solo, et ça s'entend. Le plus bel adieu jamais joué à la guitare.",
    },
  },
  {
    name: "Mick Jenkins",
    href: "https://open.spotify.com/album/2GuJOMaxJpvgDM5MgKZUF8",
    note: {
      en: "The Water[s] saved me about a year of therapy in 2014. Still on the list, still about hydration.",
      cs: "The Water[s] mi v roce 2014 ušetřilo asi rok terapie. Pořád na seznamu, pořád o pití vody.",
      fr: "The Water[s] m'a épargné environ un an de thérapie en 2014. Toujours sur la liste, toujours une histoire d'hydratation.",
    },
  },
]

const FILM: Item[] = [
  {
    name: "David Lynch",
    href: "https://en.wikipedia.org/wiki/David_Lynch",
    note: {
      en: "RIP. Mulholland Drive, top three. The daily weather report was a fifteen-year piece of conceptual art most people filed under hobby.",
      cs: "RIP. Mulholland Drive, do první trojky. Jeho denní předpověď počasí bylo patnáctileté konceptuální dílo, co si většina lidí zaškatulkovala jako koníček.",
      fr: "RIP. Mulholland Drive, dans mon top trois. Son bulletin météo quotidien était une œuvre conceptuelle de quinze ans que la plupart classaient comme un hobby.",
    },
    img: "/art/reflections/012.webp",
    ratio: "21 / 9",
    cta: { en: "the man", cs: "ten člověk", fr: "l'homme" },
  },
]

const SKATE: Item[] = [
  {
    name: "Skateboarding",
    label: { en: "Skateboarding", cs: "skejtování", fr: "le skate" },
    note: {
      en: "Twenty-three years on a board. Two broken bones, neither on a trick. I can't walk past a curb without reading the line.",
      cs: "Třiadvacet let na prkně. Dvě zlomeniny, ani jedna na triku. Neumím projít kolem obrubníku, abych nečetl lajnu.",
      fr: "Vingt-trois ans sur une planche. Deux fractures, aucune sur un trick. Je ne passe pas devant un trottoir sans en lire la ligne.",
    },
    img: "/art/landscape/044.webp",
    ratio: "3 / 2",
  },
  {
    name: "Andy Anderson",
    href: "https://www.instagram.com/andyandersonsk8",
    note: {
      en: "Helmet on, switch everything, Old Friends Skateboards. Proof the lifestyle is a discipline you age into, not out of.",
      cs: "Helma na hlavě, všechno switch, Old Friends Skateboards. Důkaz, že ten životní styl je disciplína, do které dorosteš, ne ze které vyrosteš.",
      fr: "Casque vissé, tout en switch, Old Friends Skateboards. La preuve que ce mode de vie est une discipline dans laquelle on vieillit, pas dont on sort.",
    },
    cta: { en: "follow", cs: "sleduj", fr: "suivre" },
  },
]

const CODE: Item[] = [
  {
    name: "John Carmack",
    href: "https://github.com/ESWAT/john-carmack-plan-archive",
    note: {
      en: ".plan files from 1996, still the cleanest writing about programming I've read. He works the way I'd like to work for the rest of my life.",
      cs: ".plan soubory z roku 1996, pořád nejčistší psaní o programování, co jsem četl. Pracuje tak, jak bych chtěl pracovat do konce života.",
      fr: "Les fichiers .plan de 1996, toujours le texte le plus net sur la programmation que j'aie lu. Il travaille comme j'aimerais travailler le reste de ma vie.",
    },
  },
  {
    name: "Linus Torvalds",
    href: "https://www.kernel.org/",
    note: {
      en: "Linux and git, both written out of disgust at the alternatives. Best ratio of mailing-list words to shipped software anyone's managed.",
      cs: "Linux a git, obojí napsané z odporu k alternativám. Nejlepší poměr slov v mailing listu k dodanému softwaru, jaký kdo dokázal.",
      fr: "Linux et git, tous deux écrits par dégoût des alternatives. Le meilleur ratio mots-de-mailing-list / logiciel livré que quiconque ait atteint.",
    },
  },
  {
    name: "Procedural generation",
    label: { en: "Procedural generation", cs: "procedurální generování", fr: "génération procédurale" },
    href: "https://en.wikipedia.org/wiki/Procedural_generation",
    note: {
      en: "Rules plus randomness plus iteration — maps, music, mesh, narrative. The generator is always cheaper to keep than the asset.",
      cs: "Pravidla plus náhoda plus iterace — mapy, hudba, mesh, příběh. Generátor se vždycky vyplatí držet víc než hotový asset.",
      fr: "Des règles plus du hasard plus de l'itération — cartes, musique, mesh, récit. Le générateur coûte toujours moins cher à garder que l'asset.",
    },
    img: "/art/weird/088.webp",
    ratio: "1 / 1",
    cta: { en: "read it", cs: "přečti si", fr: "à lire" },
  },
  {
    name: "Garry's Mod",
    href: "https://gmod.facepunch.com/",
    note: {
      en: "First place I felt powerful as a kid. A physics sandbox where bad ideas were free. Half my cohort traces back to wiring a thruster to a chair.",
      cs: "První místo, kde jsem se jako dítě cítil mocný. Fyzikální pískoviště, kde špatné nápady nic nestály. Půlka mojí generace se dá vystopovat k přidrátování trysky k židli.",
      fr: "Le premier endroit où je me suis senti puissant, gamin. Un bac à sable physique où les mauvaises idées étaient gratuites. La moitié de ma génération remonte au branchement d'un propulseur sur une chaise.",
    },
  },
  {
    name: "Hacking",
    label: { en: "Hacking", cs: "hackování", fr: "le hacking" },
    href: "https://en.wikipedia.org/wiki/Hacker_culture",
    note: {
      en: "Finding the edge in a thing nobody built for that edge. Most programmers I trust are locksmiths in spirit, if not in fact.",
      cs: "Najít skulinu ve věci, kterou na tu skulinu nikdo nestavěl. Většina programátorů, kterým věřím, jsou duší zámečníci, když ne ve skutečnosti.",
      fr: "Trouver la faille dans un truc que personne n'a conçu pour cette faille. La plupart des programmeurs en qui j'ai confiance sont serruriers dans l'âme, sinon en fait.",
    },
  },
]

const MIND: Item[] = [
  {
    name: "Computational neuroscience",
    label: { en: "Computational neuroscience", cs: "výpočetní neurověda", fr: "neurosciences computationnelles" },
    href: "https://en.wikipedia.org/wiki/Computational_neuroscience",
    note: {
      en: "Currently mapping the cache architecture of the brain. We'll know more about ourselves in twenty years than in the last two hundred thousand.",
      cs: "Zrovna mapuju cache architekturu mozku. Za dvacet let o sobě budeme vědět víc než za posledních dvě stě tisíc let.",
      fr: "En ce moment je cartographie l'architecture cache du cerveau. Dans vingt ans on en saura plus sur nous-mêmes que durant les deux cent mille dernières années.",
    },
    img: "/art/surfaces/120.webp",
    ratio: "4 / 3",
    cta: { en: "read it", cs: "přečti si", fr: "à lire" },
  },
  {
    name: "Science × art",
    label: { en: "Science × art", cs: "věda × umění", fr: "science × art" },
    note: {
      en: "The friction between rigour and intuition is where the work lives. Every painter I trust reads papers; every researcher I trust draws.",
      cs: "Tření mezi přesností a intuicí, tam práce žije. Každý malíř, kterému věřím, čte studie; každý vědec, kterému věřím, kreslí.",
      fr: "La friction entre rigueur et intuition, c'est là que vit le travail. Chaque peintre en qui j'ai confiance lit des articles ; chaque chercheur en qui j'ai confiance dessine.",
    },
  },
  {
    name: "Education",
    label: { en: "Education", cs: "vzdělávání", fr: "l'éducation" },
    note: {
      en: "The highest-leverage civic investment we have, performed badly on purpose. Yes, that's a fight I'll pick.",
      cs: "Občanská investice s největší pákou, jakou máme, schválně odbytá. Ano, do téhle bitvy se pustím.",
      fr: "L'investissement civique au plus fort levier que l'on ait, bâclé exprès. Oui, c'est un combat que je choisis.",
    },
  },
  {
    name: "Research",
    label: { en: "Research", cs: "výzkum", fr: "la recherche" },
    note: {
      en: "Slow accumulation of usable truth — the opposite of news. Most decent ideas I've had came from someone else's footnote.",
      cs: "Pomalé hromadění použitelné pravdy — opak zpráv. Většina slušných nápadů, co jsem měl, přišla z cizí poznámky pod čarou.",
      fr: "Lente accumulation de vérité utilisable — le contraire de l'actualité. La plupart de mes idées correctes viennent de la note de bas de page d'un autre.",
    },
  },
  {
    name: "Learning",
    label: { en: "Learning", cs: "učení", fr: "l'apprentissage" },
    note: {
      en: "The only durable skill. Everything else gets automated, deprecated, or out-aged.",
      cs: "Jediná trvanlivá dovednost. Všechno ostatní se zautomatizuje, zastará, nebo to věkem předběhnou.",
      fr: "La seule compétence durable. Tout le reste finit automatisé, déprécié ou dépassé par l'âge.",
    },
  },
]

const PRACTICE: Item[] = [
  {
    name: "Shaolin method",
    label: { en: "Shaolin method", cs: "shaolinská metoda", fr: "la méthode Shaolin" },
    href: "https://en.wikipedia.org/wiki/Shaolin_kung_fu",
    note: {
      en: "Twenty thousand hours, one form. Under 1% reach the level you'd recognise on film. Worth knowing before you start anything serious.",
      cs: "Dvacet tisíc hodin, jedna forma. Pod 1 % se dostane tak daleko, že bys to poznal z filmu. Dobré vědět, než se pustíš do čehokoli vážného.",
      fr: "Vingt mille heures, une seule forme. Moins de 1 % atteignent le niveau qu'on reconnaîtrait au cinéma. Bon à savoir avant de se lancer dans quoi que ce soit de sérieux.",
    },
    img: "/art/decay/033.webp",
    ratio: "3 / 4",
    cta: { en: "read it", cs: "přečti si", fr: "à lire" },
  },
  {
    name: "Ryōkan",
    href: "https://en.wikipedia.org/wiki/Ry%C5%8Dkan",
    note: {
      en: "Wandering monk, eighteenth century. Wrote on rice paper, played ball with the village kids, refused to teach formally. Patron saint of doing it well and ignoring the credential.",
      cs: "Potulný mnich, osmnácté století. Psal na rýžový papír, hrál s vesnickými dětmi na míč, odmítal formálně učit. Patron toho dělat věci dobře a kašlat na papíry.",
      fr: "Moine errant, dix-huitième siècle. Écrivait sur du papier de riz, jouait au ballon avec les enfants du village, refusait d'enseigner formellement. Saint patron du bien-faire en ignorant le diplôme.",
    },
  },
  {
    name: "Chess",
    label: { en: "Chess", cs: "šachy", fr: "les échecs" },
    href: "https://lichess.org/",
    note: {
      en: "The cleanest closed system we ever built — perfect information, no luck, just position. About 1850 on lichess, which means I lose 60% of the games I want. That's the point.",
      cs: "Nejčistší uzavřený systém, jaký jsme kdy postavili — úplná informace, žádné štěstí, jen pozice. Na lichess kolem 1850, což znamená, že prohraju 60 % partií, které chci. O to právě jde.",
      fr: "Le système clos le plus net qu'on ait jamais bâti — information parfaite, aucune chance, juste la position. Environ 1850 sur lichess, ce qui veut dire que je perds 60 % des parties qui m'importent. C'est tout l'intérêt.",
    },
  },
  {
    name: "80,000 Hours",
    href: "https://80000hours.org/",
    note: {
      en: "Career is the biggest lever you have, with the math to prove it. Read once a year, adjust.",
      cs: "Kariéra je největší páka, jakou máš, a je na to matika. Přečti jednou za rok, uprav kurz.",
      fr: "La carrière est le plus grand levier que tu aies, avec les maths pour le prouver. À lire une fois par an, puis ajuster.",
    },
  },
]

const PEOPLE: Item[] = [
  {
    name: "Sammy Obeid",
    href: "https://sammyobeid.com/",
    note: {
      en: "Stand-up plus a maths degree, 1,001 consecutive nights. A serious craftsman dressed as a clown.",
      cs: "Stand-up plus titul z matematiky, 1001 večerů v řadě. Vážný řemeslník převlečený za klauna.",
      fr: "Du stand-up plus un diplôme de maths, 1001 soirs d'affilée. Un artisan sérieux déguisé en clown.",
    },
    cta: { en: "the act", cs: "to číslo", fr: "le numéro" },
  },
  {
    name: "Ian Carroll",
    href: "https://www.youtube.com/@IanCarrollshow",
    note: {
      en: "Independent journalist who keeps pulling the threads everyone else is paid to leave alone.",
      cs: "Nezávislý novinář, co pořád tahá za nitky, které jsou ostatní placení nechat být.",
      fr: "Journaliste indépendant qui n'arrête pas de tirer les fils que tous les autres sont payés pour laisser tranquilles.",
    },
    cta: { en: "the show", cs: "ten pořad", fr: "l'émission" },
  },
  {
    name: "Zdislava Pokorná",
    note: {
      en: "Personal. Quietly corrects my taste when I drift. Anything good here is partly her doing.",
      cs: "Osobní. Tiše mi koriguje vkus, když ujíždím. Cokoli je tu dobré, je zčásti její zásluha.",
      fr: "Personnel. Corrige discrètement mon goût quand je dérive. Tout ce qui est bon ici, c'est en partie grâce à elle.",
    },
  },
  {
    name: "Jan Špaček",
    note: {
      en: "Personal. Shows up with the right question, not the obvious one. The one you phone when the prototype's on fire.",
      cs: "Osobní. Přijde se správnou otázkou, ne tou očividnou. Ten, komu voláš, když prototyp hoří.",
      fr: "Personnel. Arrive avec la bonne question, pas l'évidente. Celui qu'on appelle quand le prototype est en feu.",
    },
  },
]

const MISC: Item[] = [
  {
    name: "Paint",
    label: { en: "Paint", cs: "barva", fr: "la peinture" },
    note: {
      en: "The medium that won't lie about effort. You can see where the brush hesitated.",
      cs: "Médium, co o vynaloženém úsilí nelže. Je vidět, kde štětec zaváhal.",
      fr: "Le médium qui ne ment pas sur l'effort. On voit où le pinceau a hésité.",
    },
    img: "/art/acrylic/006.webp",
    ratio: "4 / 3",
  },
  {
    name: "Coconuts",
    label: { en: "Coconuts", cs: "kokosy", fr: "les noix de coco" },
    note: {
      en: "A self-contained system — water, fat, fibre, shell, fuel. Try and argue against it.",
      cs: "Soběstačný systém — voda, tuk, vláknina, skořápka, palivo. Zkus proti tomu něco namítnout.",
      fr: "Un système autosuffisant — eau, gras, fibre, coque, carburant. Essaie un peu d'argumenter contre.",
    },
    img: "/more/coconut.jpg",
    ratio: "2 / 3",
  },
]

// ============= "what i'm into right now" — hand-edited, current =====

interface NowEntry {
  k: string
  kl: Localized
  v: Localized
}

const NOW: NowEntry[] = [
  {
    k: "reading",
    kl: { en: "reading", cs: "čtu", fr: "je lis" },
    v: {
      en: "Weldon — The Caped Crusade. Batman as a mirror held up to nerd culture.",
      cs: "Weldon — The Caped Crusade. Batman jako zrcadlo nastavené nerd kultuře.",
      fr: "Weldon — The Caped Crusade. Batman comme miroir tendu à la culture nerd.",
    },
  },
  {
    k: "building",
    kl: { en: "building", cs: "stavím", fr: "je construis" },
    v: {
      en: "the Sombra OS memory layer. Local works. Cloud doesn't — yet.",
      cs: "paměťovou vrstvu Sombra OS. Lokálně to jede. V cloudu zatím ne.",
      fr: "la couche mémoire de Sombra OS. En local ça marche. Dans le cloud, pas encore.",
    },
  },
  {
    k: "listening",
    kl: { en: "listening", cs: "poslouchám", fr: "j'écoute" },
    v: {
      en: "Tom Waits, Bone Machine · Mick Jenkins, The Patience · Iron Maiden, Senjutsu.",
      cs: "Tom Waits, Bone Machine · Mick Jenkins, The Patience · Iron Maiden, Senjutsu.",
      fr: "Tom Waits, Bone Machine · Mick Jenkins, The Patience · Iron Maiden, Senjutsu.",
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
      en: "a strength routine, six weeks in. Knees grateful.",
      cs: "silový trénink, šestý týden. Kolena děkují.",
      fr: "une routine de force, six semaines au compteur. Les genoux disent merci.",
    },
  },
  {
    k: "annoyed by",
    kl: { en: "annoyed by", cs: "štve mě", fr: "ça m'agace" },
    v: {
      en: "the word “vision” with no number attached to it.",
      cs: "slovo „vize“ bez jediného čísla u sebe.",
      fr: "le mot « vision » sans le moindre chiffre derrière.",
    },
  },
]

// ============= "not great at" — anti-list, also true ================

const NOT_GREAT: Localized[] = [
  { en: "sleeping before midnight", cs: "usnout před půlnocí", fr: "dormir avant minuit" },
  {
    en: "finishing personal projects (present company excepted)",
    cs: "dotahovat vlastní projekty (tenhle web čestná výjimka)",
    fr: "finir mes projets perso (la présente exception mise à part)",
  },
  { en: "saying no when I'm interested", cs: "říct ne, když mě to zajímá", fr: "dire non quand ça m'intéresse" },
  {
    en: "small talk past ninety seconds",
    cs: "tlachání po devadesáti vteřinách",
    fr: "le small talk au-delà de quatre-vingt-dix secondes",
  },
  { en: "knees, after thirty", cs: "kolena po třicítce", fr: "les genoux, après trente ans" },
  { en: "coriander", cs: "koriandr", fr: "la coriandre" },
]

// ============= "what i'm fighting" — cultural irritations ============

const FIGHTING: Localized[] = [
  {
    en: "the LARP economy — engineers who tweet more than they ship. The thing the work was meant to be a defence against.",
    cs: "LARP ekonomika — inženýři, co víc tweetují, než dodávají. Přesně to, proti čemu měla být práce obranou.",
    fr: "l'économie du LARP — des ingénieurs qui tweetent plus qu'ils ne livrent. Exactement ce contre quoi le travail devait être un rempart.",
  },
  {
    en: "the firehose of falsehood — volume as the message, truth priced like a luxury.",
    cs: "hadice lží — objem jako sdělení, pravda za cenu luxusu.",
    fr: "le canon à mensonges — le volume comme message, la vérité au prix du luxe.",
  },
  {
    en: "the gerontocracy: the same hands on the same levers.",
    cs: "gerontokracie: pořád tytéž ruce na týchž pákách.",
    fr: "la gérontocratie : les mêmes mains sur les mêmes leviers.",
  },
  {
    en: "bullshit jobs. Read Graeber, then audit the calendar.",
    cs: "bullshit joby. Přečti si Graebera, pak si proklepni kalendář.",
    fr: "les jobs à la con. Lis Graeber, puis audite ton agenda.",
  },
  {
    en: "“vision” decks with no number in them.",
    cs: "„vizionářské“ prezentace bez jediného čísla.",
    fr: "les decks « vision » sans un seul chiffre.",
  },
  {
    en: "the LinkedIn AI parade — people pretending the box didn't write the post.",
    cs: "linkedinová ai přehlídka — lidi, co dělají, že ten příspěvek nenapsala mašina.",
    fr: "la parade IA de LinkedIn — des gens qui font comme si la machine n'avait pas écrit le post.",
  },
  {
    en: "surveillance capitalism: kompromat on everyone, by default.",
    cs: "kapitalismus dohledu: kompromitující materiál na každého, automaticky.",
    fr: "le capitalisme de surveillance : du kompromat sur tout le monde, par défaut.",
  },
  {
    en: "nostalgia industries — the Kafka tote bag, never a page read.",
    cs: "průmysl nostalgie — plátěná taška s Kafkou, ani stránka přečtená.",
    fr: "les industries de la nostalgie — le tote bag Kafka, jamais une page lue.",
  },
  {
    en: "the podcast gold rush — microphones in the river, panning for status.",
    cs: "podcastová zlatá horečka — mikrofony v řece, rýžování statusu.",
    fr: "la ruée vers l'or du podcast — des micros dans la rivière, à orpailler du statut.",
  },
  {
    en: "institutional capture: the quiet web of red tape and routing numbers.",
    cs: "ovládnutí institucí: tichá síť byrokracie a čísel účtů.",
    fr: "la capture institutionnelle : la toile discrète de paperasse et de numéros de compte.",
  },
  {
    en: "flat-pack relationships, where step three is always rebuilding the wrong thing.",
    cs: "vztahy ze stavebnice, kde třetí krok je vždycky stavět špatnou věc znovu.",
    fr: "les relations en kit, où l'étape trois consiste toujours à reconstruire la mauvaise chose.",
  },
  {
    en: "the slow erosion of attention. Mine first.",
    cs: "pomalá eroze pozornosti. Té mojí jako první.",
    fr: "l'érosion lente de l'attention. La mienne d'abord.",
  },
]

// ============= bums / keeps — the quieter weight and its antidote ====

const BUMS: Localized[] = [
  {
    en: "my grandmother forgetting my face, one Sunday at a time.",
    cs: "babička, co zapomíná moji tvář, neděli po neděli.",
    fr: "ma grand-mère qui oublie mon visage, un dimanche après l'autre.",
  },
  {
    en: "the time debt — every fragment I didn't ship, compounding.",
    cs: "časový dluh — každý kousek, co jsem nedodal, se nabaluje.",
    fr: "la dette de temps — chaque fragment non livré, qui compose.",
  },
  {
    en: "the silence after a release that didn't land. Worse: the silence when no one noticed.",
    cs: "ticho po vydání, co nedopadlo. Horší: ticho, když si nikdo nevšiml.",
    fr: "le silence après une sortie qui n'a pas pris. Pire : le silence quand personne n'a remarqué.",
  },
  {
    en: "my Czech rusting with no time to sharpen it.",
    cs: "moje čeština, co rezaví bez času ji brousit.",
    fr: "mon tchèque qui rouille, sans le temps de l'affûter.",
  },
  {
    en: "the inverse curve between meetings and work done.",
    cs: "nepřímá úměra mezi schůzemi a hotovou prací.",
    fr: "la courbe inverse entre les réunions et le travail fait.",
  },
  {
    en: "knowing the next prodigy is six and about to lap me.",
    cs: "vědomí, že dalšímu zázračnému dítěti je šest a co chvíli mě předjede.",
    fr: "savoir que le prochain prodige a six ans et s'apprête à me doubler.",
  },
  { en: "December.", cs: "Prosinec.", fr: "Décembre." },
]

const KEEPS: Localized[] = [
  {
    en: "the studio before 7am, door locked.",
    cs: "ateliér před sedmou ráno, zamčené dveře.",
    fr: "l'atelier avant 7h, porte fermée à clé.",
  },
  {
    en: "the build going green, the test suite finally quiet.",
    cs: "build naskočí zeleně, testy konečně ticho.",
    fr: "le build qui passe au vert, la suite de tests enfin silencieuse.",
  },
  {
    en: "my wife's text: “u eat lunch?”",
    cs: "esemeska od ženy: „dal sis oběd?“",
    fr: "le sms de ma femme : « t'as mangé ? »",
  },
  {
    en: "the dog at the door when I get home.",
    cs: "pes u dveří, když dorazím domů.",
    fr: "le chien à la porte quand je rentre.",
  },
  { en: "coffee made the slow way.", cs: "káva dělaná pomalu.", fr: "le café fait lentement." },
  {
    en: "the next skater landing the line I bailed — proof it was possible.",
    cs: "další skejťák dá lajnu, co jsem položil — důkaz, že to šlo.",
    fr: "le skateur d'après qui passe la ligne que j'ai ratée — la preuve que c'était possible.",
  },
  {
    en: "Sombra pulling a note from 2021 I'd forgotten writing.",
    cs: "Sombra vytáhne poznámku z 2021, o které jsem nevěděl, že jsem ji psal.",
    fr: "Sombra qui ressort une note de 2021 que j'avais oublié avoir écrite.",
  },
  {
    en: "finishing one thing, even a small one.",
    cs: "dotáhnout jednu věc, i malou.",
    fr: "finir une chose, même petite.",
  },
  { en: "riffs that don't tire.", cs: "riffy, co neomrzí.", fr: "des riffs qui ne lassent pas." },
  {
    en: "the kid I was, asking nicely.",
    cs: "kluk, kterým jsem byl, hezky prosí.",
    fr: "le gamin que j'étais, qui demande gentiment.",
  },
  {
    en: "a chord change I didn't see coming.",
    cs: "změna akordu, co jsem nečekal.",
    fr: "un changement d'accord que je n'ai pas vu venir.",
  },
  {
    en: "my mother's quiet “že jo” — the Czech tag that ends an argument.",
    cs: "tiché „že jo“ od mámy — to české koncové slovíčko, co ukončí hádku.",
    fr: "le « že jo » tranquille de ma mère — la petite formule tchèque qui clôt une dispute.",
  },
]

const ANCHORS: Array<{ k: string; kl: Localized; v: Localized }> = [
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
      en: "the keel — quiet, patient, corrects my pitch when I drift.",
      cs: "kýl — tichá, trpělivá, srovná mě, když ztrácím směr.",
      fr: "la quille — calme, patiente, corrige mon cap quand je dérive.",
    },
  },
  {
    k: "my mother",
    kl: { en: "my mother", cs: "moje máma", fr: "ma mère" },
    v: {
      en: "taught me to read drawings before I could read words.",
      cs: "naučila mě číst výkresy dřív, než jsem uměl slova.",
      fr: "m'a appris à lire les plans avant les mots.",
    },
  },
  {
    k: "my skateboard",
    kl: { en: "my skateboard", cs: "můj skejt", fr: "ma planche" },
    v: {
      en: "an old indy-trucked deck. Taught me commitment before any boss did.",
      cs: "stará deska s indy truckama. Naučila mě nasazení dřív než kterýkoli šéf.",
      fr: "une vieille planche montée en Indy. M'a appris l'engagement avant n'importe quel patron.",
    },
  },
  {
    k: "my values",
    kl: { en: "my values", cs: "moje hodnoty", fr: "mes valeurs" },
    v: {
      en: "honesty over politeness. shipping over polish. craft over speed. people over performance.",
      cs: "poctivost nad zdvořilost. dodat nad vyleštit. řemeslo nad rychlost. lidi nad výkon.",
      fr: "l'honnêteté avant la politesse. livrer avant peaufiner. l'artisanat avant la vitesse. les gens avant la performance.",
    },
  },
]

const OUT_LINKS: Array<{ href: string; title: string; sub?: Localized; cta: Localized }> = [
  { href: "https://laifea.app", title: "laifea.app", sub: { en: "where i ship the real ones", cs: "kde dodávám ty opravdové", fr: "là où je livre les vrais" }, cta: { en: "open it", cs: "otevři", fr: "ouvrir" } },
  { href: "https://github.com/WalterGropius", title: "github", cta: { en: "see code", cs: "kód", fr: "le code" } },
  { href: "https://linkedin.com/in/zenbauhaus", title: "linkedin", cta: { en: "connect", cs: "spoj se", fr: "connecter" } },
  { href: "https://instagram.com/y4ngyin", title: "instagram", cta: { en: "follow", cs: "sleduj", fr: "suivre" } },
  { href: "https://soundcloud.com/mczenbauhaus", title: "soundcloud", sub: { en: "mc zenbauhaus", cs: "mc zenbauhaus", fr: "mc zenbauhaus" }, cta: { en: "listen", cs: "poslechni", fr: "écouter" } },
  { href: "https://sketchfab.com/zenbauhaus", title: "sketchfab", cta: { en: "explore", cs: "prozkoumej", fr: "explorer" } },
  { href: "https://open.spotify.com/album/1V3m6SMvu8Bodq4scdqD3o", title: "cpt. demo ep", sub: { en: "cover by me", cs: "obal ode mě", fr: "pochette de moi" }, cta: { en: "listen", cs: "poslechni", fr: "écouter" } },
]

// Page chrome — headings, intro and captions, hand-translated.
const UI = {
  title: { en: "more", cs: "víc", fr: "plus" },
  intro: {
    en: "Not a site map — the nav has those. This is the off-the-record half: what i'm into now, the inputs that shaped the work, the things i'm pushing against, the ones i'm bad at, the quiet weights and the antidotes. Read it like a friend's notebook, not a CV.",
    cs: "Tohle není mapa webu — tu má v sobě menu. Tohle je ta neoficiální půlka: co mě zrovna baví, vstupy, co utvářely moji práci, věci, proti kterým jdu, ty, co mi nejdou, tiché zátěže a jejich protijedy. Čti to jako kamarádův zápisník, ne jako životopis.",
    fr: "Ce n'est pas un plan du site — le menu s'en charge. C'est la moitié officieuse : ce qui me passionne en ce moment, les influences qui ont façonné le travail, ce contre quoi je lutte, ce que je fais mal, les poids silencieux et leurs antidotes. À lire comme le carnet d'un ami, pas comme un CV.",
  },
  updated: { en: "updated", cs: "aktualizováno", fr: "mis à jour" },
  now: { en: "now", cs: "teď", fr: "maintenant" },
  nowNote: {
    en: "* hand-edited, not a feed. if it's stale by more than a season i've probably ghosted the site.",
    cs: "* psané ručně, není to feed.",
    fr: "* édité à la main, pas un flux. si c'est périmé de plus d'une saison, j'ai sans doute déserté le site.",
  },
  loveTitle: { en: "stuff i love", cs: "co mám rád", fr: "ce que j'aime" },
  loveIntro: {
    en: "The shortlist of people, movements, objects and disciplines I keep reaching for — in conversation and in code. Not a taste-dump; only the ones that actually shifted the work.",
    cs: "Užší výběr lidí, směrů, věcí a disciplín, ke kterým se pořád vracím — v řeči i v kódu. Není to výlev vkusu; jen to, co s prací opravdu pohnulo.",
    fr: "La liste courte des gens, mouvements, objets et disciplines vers lesquels je reviens sans cesse — en parole comme en code. Pas un étalage de goût ; seulement ce qui a vraiment fait bouger le travail.",
  },
  subAesthetic: { en: "aesthetic & design", cs: "estetika a design", fr: "esthétique & design" },
  subMusic: { en: "music", cs: "hudba", fr: "musique" },
  subFilm: { en: "film", cs: "film", fr: "cinéma" },
  subSkating: { en: "skating", cs: "skate", fr: "skate" },
  subCode: { en: "code & tools", cs: "kód a nástroje", fr: "code & outils" },
  subMind: { en: "mind & science", cs: "mysl a věda", fr: "esprit & science" },
  subPractice: { en: "discipline & practice", cs: "disciplína a praxe", fr: "discipline & pratique" },
  subPeople: { en: "people", cs: "lidi", fr: "gens" },
  subMisc: { en: "misc", cs: "různé", fr: "divers" },
  fighting: { en: "what i'm fighting", cs: "proti čemu jdu", fr: "ce contre quoi je me bats" },
  fightingCap: {
    en: "* the things I want to leave a dent in. nothing personal — except all of it.",
    cs: "* věci, do kterých chci nechat ďolík. nic osobního — kromě úplně všeho.",
    fr: "* les choses où je veux laisser une marque. rien de personnel — sauf tout.",
  },
  notGreat: { en: "not great at", cs: "v čem nejsem dobrý", fr: "pas doué pour" },
  notGreatNote: {
    en: "* the more useful list. anybody without one is lying about something else.",
    cs: "* užitečnější seznam. kdo žádný nemá, lže o něčem jiném.",
    fr: "* la liste la plus utile. quiconque n'en a pas ment sur autre chose.",
  },
  weightTitle: { en: "weight & antidote", cs: "zátěž a protijed", fr: "le poids & l'antidote" },
  bumsHeading: { en: "what bums me out", cs: "co mě sráží", fr: "ce qui me plombe" },
  keepsHeading: { en: "what keeps me going", cs: "co mě drží", fr: "ce qui me porte" },
  weightNote: {
    en: "* not asks for sympathy — the friction the work pushes against, and the receipts that get re-read when the left column gets long.",
    cs: "* žádné prosby o soucit — tření, proti kterému práce tlačí, a doklady, co si přečtu znova, když levý sloupec narůstá.",
    fr: "* pas un appel à la pitié — la friction contre laquelle le travail pousse, et les preuves qu'on relit quand la colonne de gauche s'allonge.",
  },
  elsewhere: { en: "elsewhere", cs: "jinde", fr: "ailleurs" },
  blog: { en: "blog · loose notes", cs: "blog · volné zápisky", fr: "blog · notes libres" },
  blogRead: { en: "read it", cs: "přečti si", fr: "à lire" },
  allPosts: { en: "all posts", cs: "všechny zápisky", fr: "tous les billets" },
  anchors: { en: "anchors", cs: "kotvy", fr: "ancres" },
  openSource: { en: "open-source me", cs: "jsem open source", fr: "open-source moi" },
  sketchbook: { en: "from the sketchbook", cs: "ze skicáku", fr: "du carnet" },
  seeWork: { en: "see the work", cs: "mrkni na práci", fr: "voir le travail" },
  requiem: { en: "requiem", cs: "rekviem", fr: "requiem" },
  moreWork: { en: "more work", cs: "víc práce", fr: "plus de travail" },
  requiemCap: {
    en: "* Pietà — a moving piece of mine. Sound optional; the loop does the talking.",
    cs: "* Pieta — moje pohyblivé dílo. Zvuk dobrovolný; mluví ta smyčka.",
    fr: "* Pietà — une pièce animée de moi. Le son est optionnel ; c'est la boucle qui parle.",
  },
  offWall: { en: "off the wall", cs: "ze zdi", fr: "hors cadre" },
  wholeWall: { en: "the whole wall", cs: "celá zeď", fr: "tout le mur" },
  waitsCap: {
    en: "* Tom Waits — Hold On. The reason to keep the radio on.",
    cs: "* Tom Waits — Hold On. Důvod, proč nechat rádio hrát.",
    fr: "* Tom Waits — Hold On. La raison de laisser la radio allumée.",
  },
  jenkinsCap: {
    en: "* Mick Jenkins — The Water[s]. Still on the shortlist.",
    cs: "* Mick Jenkins — The Water[s]. Pořád v užším výběru.",
    fr: "* Mick Jenkins — The Water[s]. Toujours dans la liste courte.",
  },
  zenbauhausCap: {
    en: "* mc zenbauhaus — the other side of the desk.",
    cs: "* mc zenbauhaus — druhá strana stolu.",
    fr: "* mc zenbauhaus — l'autre côté du bureau.",
  },
} satisfies Record<string, Localized>

interface BlogPost {
  id: string
  title: Localized
  date: string
  excerpt: Localized
  tags?: Localized
}

export default function MorePage() {
  const { lang, t } = useI18n()
  const tr = (v: Localized) => pick(v, lang)
  const [posts, setPosts] = useState<BlogPost[]>([])
  // The "updated YYYY · MM" label is computed in an effect so SSR
  // renders an empty string and the client fills it in after mount —
  // otherwise `new Date()` would diverge between build time and the
  // visitor's clock and trip React's hydration check.
  const [updatedLabel, setUpdatedLabel] = useState("")
  useEffect(() => {
    fetch("/blogs.json")
      .then((r) => r.json())
      .then((data: BlogPost[]) => {
        if (!Array.isArray(data)) return
        setPosts(data.slice().sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 3))
      })
      .catch(() => {})
    const d = new Date()
    setUpdatedLabel(
      `${d.getFullYear()} · ${String(d.getMonth() + 1).padStart(2, "0")}`,
    )
  }, [])

  const fmtDate = (s: string) => {
    const d = new Date(s)
    if (Number.isNaN(d.getTime())) return s.toLowerCase()
    return `${d.getFullYear()} · ${String(d.getMonth() + 1).padStart(2, "0")}`
  }

  return (
    <PageLoader>
      <main className="min-h-screen" style={{ background: "var(--surface-dark)" }}>
        <Navigation />

        <article
          className="section-container pb-24 pt-28 sm:pt-32"
          style={{ position: "relative", zIndex: 35 }}
        >
          <header className="mb-16 grid items-end gap-8 md:grid-cols-[1.4fr_1fr]">
            <div>
              <h1
                className="text-[clamp(3rem,8vw,6rem)] leading-[0.9]"
                style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
              >
                <MotionText text={tr(UI.title)} split="char" stagger={0.05} />
              </h1>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="mt-4 max-w-2xl text-lg sm:text-xl"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--text-muted)",
                  lineHeight: 1.55,
                }}
              >
                {tr(UI.intro)}
              </motion.p>
            </div>
            {/* two overlapping frames, tipped opposite ways — a small
                collage so the masthead opens on work, not whitespace. */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative mx-auto hidden h-56 w-full max-w-sm md:block"
              style={{ position: "relative", zIndex: 36 }}
            >
              <span
                className="absolute left-2 top-0 block w-2/5 overflow-hidden"
                style={{
                  aspectRatio: "3 / 4",
                  border: "1.5px solid var(--ink)",
                  filter: "url(#ink-wobble)",
                  transform: "rotate(-3deg)",
                }}
              >
                <img
                  src="/art/surfaces/030.webp"
                  alt=""
                  aria-hidden
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 size-full object-cover"
                />
              </span>
              <span
                className="absolute right-0 top-8 block w-1/2 overflow-hidden"
                style={{
                  aspectRatio: "4 / 3",
                  border: "1.5px solid var(--ink)",
                  filter: "url(#ink-wobble)",
                  transform: "rotate(2.4deg)",
                }}
              >
                <img
                  src="/art/weird/060.webp"
                  alt=""
                  aria-hidden
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 size-full object-cover"
                />
              </span>
            </motion.div>
          </header>

          <div className="my-10 opacity-50" style={{ color: "var(--ink)" }}>
            <InkLine fade={false} thickness={1.4} />
          </div>

          {/* ===== Sketchbook strip — real work, links to /art ===== */}
          <Sketchbook />

          {/* ===== NOW — hand-edited; pull request when stale ===== */}
          <section className="mb-20">
            <div className="mb-5 flex items-baseline gap-3">
              <h2
                className="text-2xl tracking-[0.3em] sm:text-3xl"
                style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
              >
                — {cap(tr(UI.now))}
              </h2>
              <span
                className="text-xs tracking-[0.3em]"
                style={{ color: "var(--text-muted)" }}
              >
                {updatedLabel && `${cap(tr(UI.updated))} · ${updatedLabel}`}
              </span>
            </div>
            <dl
              className="grid gap-3 sm:gap-4 md:grid-cols-2"
              style={{ color: "var(--ink)" }}
            >
              {NOW.map((n, i) => (
                <div
                  key={n.k}
                  className="flex items-start gap-4 border-l-2 py-1.5 pl-4"
                  style={{ borderColor: "var(--border-strong)" }}
                >
                  <Thumb seed={n.k} offset={i} className="w-16 sm:w-20" />
                  <div>
                    <dt
                      className="mb-0.5 text-[0.65rem] tracking-[0.3em]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {cap(tr(n.kl))}
                    </dt>
                    <dd
                      className="text-base sm:text-lg"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: "var(--ink)",
                        lineHeight: 1.45,
                      }}
                    >
                      {tr(n.v)}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
            <p
              className="mt-4 text-xs tracking-[0.3em]"
              style={{ color: "var(--text-muted)" }}
            >
              {tr(UI.nowNote)}
            </p>
          </section>

          <div className="my-10 opacity-30" style={{ color: "var(--ink)" }}>
            <InkLine fade thickness={1} />
          </div>

          {/* ===== STUFF I LOVE ===== */}
          <section className="mb-24">
            <div className="mb-8 flex items-baseline gap-4">
              <h2
                className="text-4xl sm:text-5xl"
                style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
              >
                <span className="ink-underline">{cap(tr(UI.loveTitle))}</span>
              </h2>
              <BauhausMark />
            </div>
            <p
              className="mb-12 max-w-2xl"
              style={{
                color: "var(--text-muted)",
                fontFamily: "var(--font-display)",
                lineHeight: 1.55,
              }}
            >
              {tr(UI.loveIntro)}
            </p>

            <Sub title={tr(UI.subAesthetic)} items={AESTHETIC} mark={<RamsGrid />} startSide="left" />
            <Sub
              title={tr(UI.subMusic)}
              items={MUSIC}
              mark={<TuningFork />}
              afterBlock={<MusicMedia />}
            />
            <Sub title={tr(UI.subFilm)} items={FILM} mark={<EyeMark />} />
            <Sub title={tr(UI.subSkating)} items={SKATE} mark={<HillBombMark />} />
            <Sub title={tr(UI.subCode)} items={CODE} mark={<NodeMark />} />
            <Sub title={tr(UI.subMind)} items={MIND} mark={<BrainMark />} />
            <Sub title={tr(UI.subPractice)} items={PRACTICE} mark={<EnsoMark />} />
            <Sub title={tr(UI.subPeople)} items={PEOPLE} mark={<PinMark />} />
            <Sub title={tr(UI.subMisc)} items={MISC} mark={<CoconutMark />} startSide="right" />
          </section>

          <div className="my-10 opacity-30" style={{ color: "var(--ink)" }}>
            <InkLine fade thickness={1} />
          </div>

          {/* ===== REQUIEM — the one big self-hosted video ===== */}
          <RequiemVideo />

          <div className="my-10 opacity-30" style={{ color: "var(--ink)" }}>
            <InkLine fade thickness={1} />
          </div>

          {/* ===== WHAT I'M FIGHTING — image to one side, numbered rail ===== */}
          <Fighting />

          <div className="my-10 opacity-30" style={{ color: "var(--ink)" }}>
            <InkLine fade thickness={1} />
          </div>

          {/* ===== NOT GREAT AT — short, punchy, inline tags ===== */}
          <TagList
            title={tr(UI.notGreat)}
            items={NOT_GREAT}
            note={tr(UI.notGreatNote)}
          />

          <div className="my-10 opacity-30" style={{ color: "var(--ink)" }}>
            <InkLine fade thickness={1} />
          </div>

          {/* ===== OFF THE WALL — organic painting scatter, breaks the grid ===== */}
          <ArtScatter />

          <div className="my-10 opacity-30" style={{ color: "var(--ink)" }}>
            <InkLine fade thickness={1} />
          </div>

          {/* ===== BUMS vs KEEPS — the weight and its antidote, side by side ===== */}
          <WeightAndAntidote />

          <div className="my-10 opacity-30" style={{ color: "var(--ink)" }}>
            <InkLine fade thickness={1} />
          </div>

          {/* ===== ELSEWHERE ===== */}
          <section className="mb-20">
            <SectionTitle>{cap(tr(UI.elsewhere))}</SectionTitle>
            <ul className="flex flex-col">
              {OUT_LINKS.map((l) => (
                <li
                  key={l.href}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b py-4"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span
                      className="text-lg sm:text-xl"
                      style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
                    >
                      {l.title}
                    </span>
                    {l.sub && (
                      <span
                        className="text-xs sm:text-sm"
                        style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}
                      >
                        {tr(l.sub)}
                      </span>
                    )}
                  </span>
                  <CtaButton href={l.href} label={tr(l.cta)} />
                </li>
              ))}
            </ul>
          </section>

          <div className="my-10 opacity-30" style={{ color: "var(--ink)" }}>
            <InkLine fade thickness={1} />
          </div>

          {/* ===== BLOG ===== */}
          <section className="mb-20">
            <SectionTitle>{cap(tr(UI.blog))}</SectionTitle>
            <div className="flex flex-col gap-8">
              {posts.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
                  {t("common.loading")}
                </p>
              ) : (
                posts.map((p, i) => (
                  <article key={p.id} className="flex items-start gap-5">
                    <Thumb
                      seed={p.id}
                      href={`/blog/${p.id}`}
                      internal
                      src={blogThumbSrc(i)}
                      className="w-24 sm:w-32"
                    />
                    <div>
                      <div
                        className="mb-2 text-xs tracking-[0.3em]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {fmtDate(p.date)}
                        {p.tags && <>&nbsp;*&nbsp;{pick(p.tags, lang)}</>}
                      </div>
                      <Link href={`/blog/${p.id}`} className="group block">
                        <h3
                          className="text-2xl sm:text-3xl"
                          style={{
                            fontFamily: "var(--font-display)",
                            color: "var(--ink)",
                            lineHeight: 1.1,
                          }}
                        >
                          <span className="ink-underline-hover">{pick(p.title, lang)}</span>
                        </h3>
                      </Link>
                      <p
                        className="mt-3 max-w-3xl"
                        style={{
                          fontFamily: "var(--font-display)",
                          color: "var(--text-muted)",
                          lineHeight: 1.55,
                        }}
                      >
                        {pick(p.excerpt, lang)}
                      </p>
                      <div className="mt-3">
                        <CtaButton href={`/blog/${p.id}`} label={tr(UI.blogRead)} internal />
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
            <div className="mt-7">
              <CtaButton href="/blog" label={tr(UI.allPosts)} internal />
            </div>
          </section>

          <div className="my-10 opacity-30" style={{ color: "var(--ink)" }}>
            <InkLine fade thickness={1} />
          </div>

          {/* ===== ANCHORS ===== */}
          <section className="mb-20">
            <SectionTitle>{cap(tr(UI.anchors))}</SectionTitle>
            <dl
              className="grid gap-4 sm:gap-6 md:grid-cols-2"
              style={{ color: "var(--ink)" }}
            >
              {ANCHORS.map((a, i) => (
                <div
                  key={a.k}
                  className="flex items-start gap-4 border-l-2 py-2 pl-4"
                  style={{ borderColor: "var(--border-strong)" }}
                >
                  <Thumb seed={a.k} offset={i * 3} className="w-20 sm:w-24" />
                  <div>
                    <dt
                      className="mb-1 text-xs tracking-[0.3em]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {cap(tr(a.kl))}
                    </dt>
                    <dd
                      className="text-base sm:text-lg"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: "var(--ink)",
                        lineHeight: 1.55,
                      }}
                    >
                      {tr(a.v)}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </section>

          {/* ===== Footer ===== */}
          <footer
            className="mt-20 flex flex-col items-baseline justify-between gap-2 text-xs sm:flex-row"
            style={{ color: "var(--text-muted)" }}
          >
            <a
              href="https://github.com/WalterGropius"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <Github size={12} className="ink-icon" />
              <span>{tr(UI.openSource)}</span>
            </a>
            <span>© {new Date().getFullYear()} · eliáš bauer</span>
          </footer>
        </article>
      </main>
    </PageLoader>
  )
}

// =====================================================================
//  CtaButton — the page's one link primitive. A wobbled ink box with a
//  plain, three-word-max label and an arrow that nudges on hover, so a
//  destination always reads as "go here", never a faint glyph. `internal`
//  routes through next/link and swaps the out-arrow for a forward one.
// =====================================================================

function CtaButton({
  href,
  label,
  internal = false,
  className = "",
}: {
  href: string
  label: string
  internal?: boolean
  className?: string
}) {
  const inner = (
    <span
      className="relative inline-flex items-center gap-2 px-4 py-2 text-xs tracking-[0.25em] transition-colors duration-300 sm:text-sm"
      style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-[background] duration-300 group-hover/cta:bg-[rgba(15,17,23,0.05)]"
        style={{ border: "1.5px solid var(--ink)", filter: "url(#ink-wobble)" }}
      />
      <span className="relative">{label}</span>
      {internal ? (
        <ArrowRight
          size={15}
          className="ink-icon relative transition-transform duration-300 group-hover/cta:translate-x-1"
        />
      ) : (
        <ExternalLink
          size={14}
          className="ink-icon relative transition-transform duration-300 group-hover/cta:-translate-y-0.5"
        />
      )}
    </span>
  )

  const cls = `group/cta inline-flex w-fit ${className}`
  return internal ? (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  ) : (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  )
}

// =====================================================================
//  Thumb — a deterministic scrap of real work for any list item that
//  would otherwise be text-only. The label is hashed to a stable frame,
//  ratio and tilt from the archive, so every line carries an image
//  without a hydration-tripping random or a hand-assigned path per item.
// =====================================================================

const THUMB_RATIOS = ["1 / 1", "3 / 4", "4 / 3", "4 / 5", "5 / 4", "2 / 3"]
const THUMB_TILTS = ["-2.4deg", "1.8deg", "-1.2deg", "2.2deg", "-1.8deg", "1.4deg"]

function hashSeed(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

// Every text-only list item gets a unique scrap of real work — no image
// appears twice on the page. We build one big pool from the art archive,
// minus the frames already spoken for by featured rows, the sketchbook,
// the scatter and the standalone figures, then hand each thumb seed a
// distinct slot. The mapping is a pure function of seed (stable order
// from the data) so SSR and the client agree — no hydration flicker.
const FIXED_IMAGES = (): Set<string> => {
  const used = new Set<string>([
    "/art/decay/004.webp", "/art/decay/041.webp", "/art/decay/012.webp",
    "/art/acrylic/014.webp", "/art/decay/050.webp",
    "/art/surfaces/030.webp", "/art/weird/060.webp",
  ])
  ;[AESTHETIC, MUSIC, FILM, SKATE, CODE, MIND, PRACTICE, PEOPLE, MISC]
    .flat()
    .forEach((i) => { if (i.img) used.add(i.img) })
  SKETCHBOOK.forEach((s) => used.add(s.src))
  SCATTER.forEach((s) => used.add(s.src))
  return used
}

let THUMB_POOL: string[] | null = null
function thumbPool(): string[] {
  if (THUMB_POOL) return THUMB_POOL
  const used = FIXED_IMAGES()
  const pool: string[] = []
  for (const series of artData as Array<{ images?: string[] }>) {
    for (const img of series.images ?? []) {
      if (img.startsWith("/art/img-")) continue // shared hero frames
      if (!used.has(img) && !pool.includes(img)) pool.push(img)
    }
  }
  THUMB_POOL = pool
  return pool
}

// Static seeds in page order — each gets a distinct pool slot by index.
// Dynamic seeds (blog ids) are handed explicit srcs from the tail.
const STATIC_SEEDS: string[] = [
  ...NOW.map((n) => n.k),
  ...[AESTHETIC, MUSIC, FILM, SKATE, CODE, MIND, PRACTICE, PEOPLE, MISC]
    .flat()
    .filter((i) => !i.img)
    .map((i) => i.name),
  ...ANCHORS.map((a) => a.k),
]

function thumbSrc(seed: string): string {
  const pool = thumbPool()
  const i = STATIC_SEEDS.indexOf(seed)
  const idx = i >= 0 ? i : STATIC_SEEDS.length + (hashSeed(seed) % 16)
  return pool[idx % pool.length]
}

// Blog thumbs sit just past the static block so they never collide
// with the influence/anchor thumbs above.
function blogThumbSrc(i: number): string {
  const pool = thumbPool()
  return pool[(STATIC_SEEDS.length + 32 + i) % pool.length]
}

// A sensible three-word-max CTA from the link's flavour, so a list of
// destinations doesn't read "open it" twenty times. Explicit item.cta
// always wins.
function defaultCta(href: string): Localized {
  if (/youtube|youtu\.be|spotify|soundcloud/.test(href)) return CTA.hear
  if (/wikipedia/.test(href)) return CTA.read
  if (/github/.test(href)) return CTA.see
  if (/instagram/.test(href)) return CTA.follow
  if (/lichess/.test(href)) return CTA.play
  return CTA.open
}

function Thumb({
  seed,
  href,
  internal = false,
  offset = 0,
  className = "w-20 sm:w-24",
}: {
  seed: string
  href?: string
  internal?: boolean
  // nudge into a different slice of the pool so neighbouring lines don't
  // land on the same frame.
  offset?: number
  className?: string
}) {
  const h = hashSeed(seed) + offset
  const src = THUMB_POOL[h % THUMB_POOL.length]
  const ratio = THUMB_RATIOS[h % THUMB_RATIOS.length]
  const tilt = THUMB_TILTS[h % THUMB_TILTS.length]
  const frame = (
    <span
      className={`relative block shrink-0 overflow-hidden transition-transform duration-500 ease-out group-hover/thumb:!rotate-0 ${className}`}
      style={{ aspectRatio: ratio, transform: `rotate(${tilt})` }}
    >
      <img
        src={src}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover/thumb:scale-[1.06]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ border: "1.5px solid var(--ink)", filter: "url(#ink-wobble)" }}
      />
    </span>
  )
  if (!href) return <span className="group/thumb block shrink-0">{frame}</span>
  return internal ? (
    <Link href={href} className="group/thumb block shrink-0">
      {frame}
    </Link>
  ) : (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group/thumb block shrink-0"
    >
      {frame}
    </a>
  )
}

// =====================================================================
//  Sub-section: featured items (with an image) break to their own
//  alternating row; the rest collapse into a compact two-column grid.
// =====================================================================

function Sub({
  title,
  items,
  mark,
  afterBlock,
  startSide = "left",
}: {
  title: string
  items: Item[]
  mark?: React.ReactNode
  afterBlock?: React.ReactNode
  startSide?: "left" | "right"
}) {
  const featured = items.filter((i) => i.img)
  const rest = items.filter((i) => !i.img)
  return (
    <section className="mb-14">
      <div className="mb-5 flex items-baseline gap-3">
        <h3
          className="text-xl tracking-[0.3em] sm:text-2xl"
          style={{ color: "var(--ink)", fontFamily: "var(--font-display)" }}
        >
          — {cap(title)}
        </h3>
        {mark && (
          <span className="ml-1" style={{ color: "var(--ink)", opacity: 0.7 }}>
            {mark}
          </span>
        )}
      </div>

      {featured.map((it, i) => (
        <ZigFeature
          key={it.name}
          item={it}
          side={
            (startSide === "left" ? i : i + 1) % 2 === 0 ? "left" : "right"
          }
        />
      ))}

      {rest.length > 0 && (
        <ul className="grid gap-x-10 gap-y-5 md:grid-cols-2">
          {rest.map((it) => (
            <li key={it.name}>
              <Entry item={it} />
            </li>
          ))}
        </ul>
      )}
      {afterBlock}
    </section>
  )
}

// A featured row: a framed image (or self-hosted video) on one side,
// title + note + CTA on the other. `side` decides which edge the media
// hugs on desktop; on mobile it always sits on top. The columns are
// deliberately uneven and the frame is tipped a degree or two — the row
// should look set down by hand, not snapped to a grid.
function ZigFeature({ item, side }: { item: Item; side: "left" | "right" }) {
  const { lang } = useI18n()
  const mediaRight = side === "right"
  // alternate the lean and the column split so no two featured rows
  // share the same geometry — this is what keeps the page from reading
  // as a tidy zig-zag template.
  const tilt = mediaRight ? "rotate(1.3deg)" : "rotate(-1.4deg)"
  const cols = mediaRight
    ? "md:grid-cols-[0.92fr_1.08fr]"
    : "md:grid-cols-[1.08fr_0.92fr]"
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ type: "spring", stiffness: 140, damping: 24 }}
      className={`mb-12 grid items-center gap-5 sm:gap-9 ${cols}`}
    >
      <figure
        className={mediaRight ? "md:order-2" : ""}
        style={{ position: "relative", zIndex: 36 }}
      >
        <div
          className="relative overflow-hidden transition-transform duration-500 ease-out hover:!rotate-0"
          style={{
            aspectRatio: item.ratio ?? "4 / 3",
            border: "1.5px solid var(--ink)",
            filter: "url(#ink-wobble)",
            transform: tilt,
          }}
        >
          {item.video ? (
            <video
              src={item.video}
              poster={item.img}
              controls
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <img
              src={item.img}
              alt={item.name}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out hover:scale-[1.04]"
            />
          )}
        </div>
      </figure>

      <div className={mediaRight ? "md:order-1" : ""}>
        <div className="mb-2 text-2xl sm:text-3xl" style={{ lineHeight: 1.05 }}>
          <span style={{ color: "var(--ink)", fontFamily: "var(--font-display)" }}>
            {pick(item.label ?? item.name, lang)}
          </span>
        </div>
        <p
          className="max-w-md text-base sm:text-lg"
          style={{
            color: "var(--text-muted)",
            fontFamily: "var(--font-display)",
            lineHeight: 1.55,
          }}
        >
          {pick(item.note, lang)}
        </p>
        {item.href && (
          <div className="mt-4">
            <CtaButton href={item.href} label={pick(item.cta ?? defaultCta(item.href), lang)} />
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Compact entry: a small framed scrap of work on the left, then title,
// note and — for anything that links out — a clear CTA button. So even
// the densest list reads as image + words + a way in, never bare text.
function Entry({ item }: { item: Item }) {
  const { lang } = useI18n()
  const displayName = pick(item.label ?? item.name, lang)
  const TitleEl = item.href ? (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: "var(--ink)", fontFamily: "var(--font-display)" }}
    >
      <span className="ink-underline-hover">{displayName}</span>
    </a>
  ) : (
    <span style={{ color: "var(--ink)", fontFamily: "var(--font-display)" }}>
      {displayName}
    </span>
  )

  return (
    <div className="flex items-start gap-4">
      <Thumb seed={item.name} href={item.href} />
      <div className="flex flex-col gap-1.5">
        <div className="text-lg sm:text-xl" style={{ lineHeight: 1.1 }}>
          {TitleEl}
        </div>
        <p
          className="text-sm sm:text-base"
          style={{
            color: "var(--text-muted)",
            fontFamily: "var(--font-display)",
            lineHeight: 1.5,
          }}
        >
          {pick(item.note, lang)}
        </p>
        {item.href && (
          <div className="mt-1">
            <CtaButton href={item.href} label={pick(item.cta ?? defaultCta(item.href), lang)} />
          </div>
        )}
      </div>
    </div>
  )
}

// =====================================================================
//  Fighting — a framed texture to one side, the rail numbered so it
//  reads as a list of positions, not a rant.
// =====================================================================

function Fighting() {
  const { lang } = useI18n()
  return (
    <section className="mb-20">
      <div className="mb-6 flex items-baseline gap-3">
        <h2
          className="text-2xl tracking-[0.3em] sm:text-3xl"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          — {cap(pick(UI.fighting, lang))}
        </h2>
      </div>
      <div className="grid gap-6 sm:gap-10 md:grid-cols-[1fr_2fr]">
        <figure
          className="md:sticky md:top-28 md:self-start"
          style={{ position: "relative", zIndex: 36 }}
        >
          <div
            className="relative overflow-hidden"
            style={{
              aspectRatio: "4 / 5",
              border: "1.5px solid var(--ink)",
              filter: "url(#ink-wobble)",
            }}
          >
            <img
              src="/art/decay/004.webp"
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover"
            />
          </div>
          <figcaption
            className="mt-2 text-xs italic"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}
          >
            {pick(UI.fightingCap, lang)}
          </figcaption>
        </figure>

        <ol
          className="flex flex-col"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          {FIGHTING.map((line, i) => (
            <li
              key={i}
              className="flex items-baseline gap-4 border-b py-3 text-base sm:text-lg"
              style={{ borderColor: "var(--border-subtle)", lineHeight: 1.5 }}
            >
              <span
                aria-hidden
                className="shrink-0 text-xs tabular-nums tracking-[0.2em]"
                style={{ color: "var(--text-muted)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{pick(line, lang)}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

// =====================================================================
//  Not-great — short enough to wrap as inline tags rather than a list.
// =====================================================================

function TagList({
  title,
  items,
  note,
}: {
  title: string
  items: Localized[]
  note?: string
}) {
  const { lang } = useI18n()
  return (
    <section className="mb-20">
      <div className="mb-5 flex items-baseline gap-3">
        <h2
          className="text-2xl tracking-[0.3em] sm:text-3xl"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          — {cap(title)}
        </h2>
      </div>
      <div className="grid items-start gap-6 sm:gap-8 md:grid-cols-[1fr_2fr]">
        <figure
          className="md:sticky md:top-28"
          style={{ position: "relative", zIndex: 36 }}
        >
          <div
            className="relative overflow-hidden transition-transform duration-500 ease-out hover:!rotate-0"
            style={{
              aspectRatio: "4 / 5",
              border: "1.5px solid var(--ink)",
              filter: "url(#ink-wobble)",
              transform: "rotate(-1.6deg)",
            }}
          >
            <img
              src="/art/decay/041.webp"
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover"
            />
          </div>
        </figure>
        <ul className="flex flex-wrap content-start gap-3" aria-label={title}>
          {items.map((line, i) => (
            <li
              key={i}
              className="px-4 py-2 text-sm sm:text-base"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--ink)",
                border: "1.5px solid var(--ink)",
                filter: "url(#ink-wobble)",
              }}
            >
              ✕&nbsp;&nbsp;{pick(line, lang)}
            </li>
          ))}
        </ul>
      </div>
      {note && (
        <p
          className="mt-5 max-w-2xl text-xs tracking-[0.3em]"
          style={{ color: "var(--text-muted)" }}
        >
          {note}
        </p>
      )}
    </section>
  )
}

// =====================================================================
//  Bums vs keeps — the weight and the antidote, two columns that
//  answer each other. Each column is headed by a framed image: a decay
//  texture for the weight, a brighter painting for the antidote.
// =====================================================================

function WeightAndAntidote() {
  const { lang } = useI18n()
  return (
    <section className="mb-20">
      <div className="mb-6 flex items-baseline gap-3">
        <h2
          className="text-2xl tracking-[0.3em] sm:text-3xl"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          — {cap(pick(UI.weightTitle, lang))}
        </h2>
      </div>
      <div className="grid gap-8 sm:gap-12 md:grid-cols-2">
        <WeightColumn
          heading={pick(UI.bumsHeading, lang)}
          glyph="↓"
          img="/art/decay/012.webp"
          items={BUMS}
        />
        <WeightColumn
          heading={pick(UI.keepsHeading, lang)}
          glyph="↑"
          img="/art/acrylic/014.webp"
          items={KEEPS}
        />
      </div>
      <p
        className="mt-6 max-w-2xl text-xs tracking-[0.3em]"
        style={{ color: "var(--text-muted)" }}
      >
        {pick(UI.weightNote, lang)}
      </p>
    </section>
  )
}

function WeightColumn({
  heading,
  glyph,
  img,
  items,
}: {
  heading: string
  glyph: string
  img: string
  items: Localized[]
}) {
  const { lang } = useI18n()
  return (
    <div className="flex flex-col" style={{ position: "relative", zIndex: 36 }}>
      <div
        className="relative mb-5 overflow-hidden"
        style={{
          aspectRatio: "16 / 9",
          border: "1.5px solid var(--ink)",
          filter: "url(#ink-wobble)",
        }}
      >
        <img
          src={img}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover"
        />
      </div>
      <h3
        className="mb-3 text-lg tracking-[0.3em]"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        — {cap(heading)}
      </h3>
      <ul
        aria-label={heading}
        className="flex flex-col gap-1.5"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)", lineHeight: 1.5 }}
      >
        {items.map((line, i) => (
          <li
            key={i}
            className="flex items-baseline gap-3 text-base sm:text-lg"
          >
            <span
              aria-hidden
              className="shrink-0 text-xs tracking-[0.3em]"
              style={{ color: "var(--text-muted)" }}
            >
              {glyph}
            </span>
            <span>{pick(line, lang)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2
        className="text-3xl sm:text-4xl"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        <span className="ink-underline">{children}</span>
      </h2>
    </div>
  )
}

// =====================================================================
//  Embeds
// =====================================================================

function TomWaitsEmbed() {
  const { lang } = useI18n()
  return (
    <figure
      className="mt-8 max-w-2xl"
      style={{ position: "relative", zIndex: 36 }}
    >
      <div
        className="relative"
        style={{
          border: "1.5px solid var(--ink)",
          filter: "url(#ink-wobble)",
          aspectRatio: "16 / 9",
        }}
      >
        <iframe
          src="https://www.youtube.com/embed/PCmZBeNVy7g?rel=0"
          title="Tom Waits — Hold On"
          // The embed is below the fold for most viewers. Lazy-load so
          // the youtube player iframe doesn't block initial paint, and
          // trim the `allow` list to only what the embed needs.
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="block h-full w-full"
        />
      </div>
      <figcaption
        className="mt-2 text-xs italic sm:text-sm"
        style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}
      >
        {pick(UI.waitsCap, lang)}
      </figcaption>
    </figure>
  )
}

// =====================================================================
//  Sketchbook strip — a row of real images from the art book, linking
//  to /art. Pre-optimized WebP, lazy below the first card, so it adds
//  texture without weight.
// =====================================================================

// Each tile carries its own aspect, lean and vertical nudge so the row
// reads as paintings laid out on a table, not thumbnails in a grid.
const SKETCHBOOK: Array<{ src: string; ratio: string; tilt: string; shift: string }> = [
  { src: "/art/img-001.webp", ratio: "3 / 4", tilt: "-2.2deg", shift: "sm:mt-0" },
  { src: "/art/img-009.webp", ratio: "1 / 1", tilt: "1.6deg",  shift: "sm:mt-8" },
  { src: "/art/img-019.webp", ratio: "4 / 5", tilt: "-1.1deg", shift: "sm:mt-2" },
  { src: "/art/img-031.webp", ratio: "3 / 4", tilt: "2.4deg",  shift: "sm:mt-10" },
  { src: "/art/img-041.webp", ratio: "2 / 3", tilt: "-1.8deg", shift: "sm:mt-1" },
  { src: "/art/img-052.webp", ratio: "1 / 1", tilt: "1.2deg",  shift: "sm:mt-7" },
]

function Sketchbook() {
  const { lang } = useI18n()
  return (
    <section className="mb-16" style={{ position: "relative", zIndex: 36 }}>
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-3">
        <h2
          className="text-xl tracking-[0.3em] sm:text-2xl"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          — {cap(pick(UI.sketchbook, lang))}
        </h2>
        <CtaButton href="/art" label={pick(UI.seeWork, lang)} internal />
      </div>
      {/* horizontal scroll on phones; an off-baseline scatter on desktop */}
      <div className="-mx-1 flex snap-x items-start gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-6 sm:gap-4 sm:overflow-visible">
        {SKETCHBOOK.map((tile) => (
          <Link
            key={tile.src}
            href="/art"
            className={`group relative w-40 shrink-0 snap-start overflow-hidden transition-transform duration-500 ease-out hover:!rotate-0 sm:w-auto ${tile.shift}`}
            style={{ aspectRatio: tile.ratio, transform: `rotate(${tile.tilt})` }}
          >
            <img
              src={tile.src}
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ border: "1.5px solid var(--ink)", filter: "url(#ink-wobble)" }}
            />
          </Link>
        ))}
      </div>
    </section>
  )
}

// =====================================================================
//  Requiem — a self-hosted moving piece (Pietà). The page's one big
//  video: it bleeds a little past the column on desktop and sits at a
//  slight angle so it lands as a centerpiece, not an embed in a box.
// =====================================================================

function RequiemVideo() {
  const { lang } = useI18n()
  return (
    <section
      className="mb-20"
      style={{ position: "relative", zIndex: 36 }}
    >
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-3">
        <h2
          className="text-2xl tracking-[0.3em] sm:text-3xl"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          — {cap(pick(UI.requiem, lang))}
        </h2>
        <CtaButton href="/art" label={pick(UI.moreWork, lang)} internal />
      </div>
      <figure className="sm:-mx-6 lg:-mx-16">
        <motion.div
          initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ type: "spring", stiffness: 130, damping: 24 }}
          className="relative overflow-hidden transition-transform duration-500 ease-out hover:!rotate-0"
          style={{
            aspectRatio: "16 / 9",
            border: "1.5px solid var(--ink)",
            filter: "url(#ink-wobble)",
            transform: "rotate(-0.8deg)",
          }}
        >
          <video
            src="/art/requiem/pieta.mp4"
            poster="/art/decay/050.webp"
            controls
            muted
            loop
            playsInline
            preload="none"
            className="absolute inset-0 size-full object-cover"
          />
        </motion.div>
        <figcaption
          className="mt-3 text-xs italic sm:text-sm"
          style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}
        >
          {pick(UI.requiemCap, lang)}
        </figcaption>
      </figure>
    </section>
  )
}

// =====================================================================
//  Art scatter — a deliberately un-gridded cluster of paintings at
//  mixed sizes, angles and baselines, two of them bleeding past the
//  column edge. Breaks up the text-heavy lower half and points at /art.
// =====================================================================

const SCATTER: Array<{ src: string; span: string; ratio: string; tilt: string; extra: string }> = [
  { src: "/art/surfaces/045.webp",   span: "sm:col-span-7", ratio: "3 / 2", tilt: "-1.6deg", extra: "sm:-ml-6 lg:-ml-14 sm:mt-0" },
  { src: "/art/weird/120.webp",      span: "sm:col-span-5", ratio: "4 / 5", tilt: "2deg",    extra: "sm:mt-12" },
  { src: "/art/landscape/077.webp",  span: "sm:col-span-4", ratio: "1 / 1", tilt: "-2.2deg", extra: "sm:mt-3" },
  { src: "/art/reflections/030.webp",span: "sm:col-span-5", ratio: "3 / 2", tilt: "1.4deg",  extra: "sm:mt-0" },
  { src: "/art/stalking/060.webp",   span: "sm:col-span-3", ratio: "2 / 3", tilt: "-1deg",   extra: "sm:-mr-6 lg:-mr-14 sm:mt-9" },
]

function ArtScatter() {
  const { lang } = useI18n()
  return (
    <section className="mb-20" style={{ position: "relative", zIndex: 36 }}>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-3">
        <h2
          className="text-xl tracking-[0.3em] sm:text-2xl"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          — {cap(pick(UI.offWall, lang))}
        </h2>
        <CtaButton href="/art" label={pick(UI.wholeWall, lang)} internal />
      </div>
      <div className="grid grid-cols-2 items-start gap-3 sm:grid-cols-12 sm:gap-5">
        {SCATTER.map((tile) => (
          <Link
            key={tile.src}
            href="/art"
            className={`group relative block overflow-hidden transition-transform duration-500 ease-out hover:!rotate-0 ${tile.span} ${tile.extra}`}
            style={{ aspectRatio: tile.ratio, transform: `rotate(${tile.tilt})` }}
          >
            <img
              src={tile.src}
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ border: "1.5px solid var(--ink)", filter: "url(#ink-wobble)" }}
            />
          </Link>
        ))}
      </div>
    </section>
  )
}

// =====================================================================
//  Music media — a wall of video cards (thumbnail + link, cheap) plus a
//  couple of real embedded players. Everything below the fold is
//  lazy-loaded so the iframes never block paint.
// =====================================================================

const WATCH: Array<{ id: string; title: string }> = [
  { id: "PCmZBeNVy7g", title: "Tom Waits — Hold On" },
  { id: "NCceAA0fIm0", title: "Iron Maiden — Hallowed Be Thy Name" },
  { id: "0lkir-mvjqI", title: "Black Sabbath — Black Sabbath" },
  { id: "u05PVbbI_zo", title: "Zappa — Watermelon in Easter Hay" },
]

function MusicMedia() {
  const { lang } = useI18n()
  return (
    <div className="mt-8 flex flex-col gap-10">
      {/* thumbnail wall — images + links, no third-party JS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {WATCH.map((v) => (
          <a
            key={v.id}
            href={`https://www.youtube.com/watch?v=${v.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block aspect-video overflow-hidden"
            title={v.title}
          >
            <img
              src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
              alt={v.title}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ border: "1.5px solid var(--ink)", filter: "url(#ink-wobble)" }}
            />
            <span
              className="absolute bottom-0 left-0 right-0 px-2 py-1 text-[0.6rem] tracking-[0.2em] opacity-0 transition-opacity group-hover:opacity-100"
              style={{ background: "var(--surface-dark)", color: "var(--ink)", fontFamily: "var(--font-display)" }}
            >
              {v.title}
            </span>
          </a>
        ))}
      </div>

      {/* the one full player worth autoloading the chrome for */}
      <TomWaitsEmbed />

      {/* streaming embeds — one i listen to, one i made */}
      <div className="grid gap-6 md:grid-cols-2">
        <figure>
          <iframe
            title="Mick Jenkins — The Water[s]"
            src="https://open.spotify.com/embed/album/2GuJOMaxJpvgDM5MgKZUF8?utm_source=generator"
            loading="lazy"
            width="100%"
            height="352"
            frameBorder="0"
            allow="encrypted-media"
            className="block"
            style={{ border: "1.5px solid var(--ink)", filter: "url(#ink-wobble)" }}
          />
          <figcaption className="mt-2 text-xs italic" style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
            {pick(UI.jenkinsCap, lang)}
          </figcaption>
        </figure>
        <figure>
          <iframe
            title="mc zenbauhaus on SoundCloud"
            src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/mczenbauhaus&color=%23ee4a44&hide_related=true&show_comments=false&show_reposts=false&show_teaser=false"
            loading="lazy"
            width="100%"
            height="352"
            frameBorder="0"
            allow="autoplay"
            scrolling="no"
            className="block"
            style={{ border: "1.5px solid var(--ink)", filter: "url(#ink-wobble)" }}
          />
          <figcaption className="mt-2 text-xs italic" style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
            {pick(UI.zenbauhausCap, lang)}
          </figcaption>
        </figure>
      </div>
    </div>
  )
}

// =====================================================================
//  Inline blueprint marks — small ink sketches that prefix each
//  subsection heading. Drawn with currentColor + the ink-wobble
//  filter so they sit in the site's hand-drawn aesthetic.
// =====================================================================

function Mark({ children, w = 36, h = 36 }: { children: React.ReactNode; w?: number; h?: number }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ filter: "url(#ink-wobble)" }}
    >
      {children}
    </svg>
  )
}

function BauhausMark() {
  // Tiny abstract: a square + circle + triangle stacked (the
  // bauhaus' 3-primaries-3-primitives idea).
  return (
    <Mark w={48} h={48}>
      <rect x="4" y="14" width="14" height="14" />
      <circle cx="32" cy="22" r="7" />
      <path d="M14 44 L26 28 L38 44 Z" />
    </Mark>
  )
}

function RamsGrid() {
  // The Braun-radio dial mark.
  return (
    <Mark>
      <rect x="3" y="3" width="30" height="30" />
      <circle cx="18" cy="18" r="9" />
      <circle cx="18" cy="18" r="2" fill="currentColor" />
      <path d="M18 9 L18 6" />
      <path d="M18 27 L18 30" />
      <path d="M9 18 L6 18" />
      <path d="M27 18 L30 18" />
    </Mark>
  )
}

function TuningFork() {
  return (
    <Mark>
      <path d="M14 4 L14 18" />
      <path d="M22 4 L22 18" />
      <rect x="11" y="18" width="14" height="4" />
      <path d="M18 22 L18 32" />
      <path d="M3 28 Q 10 22 18 28 T 33 28" />
    </Mark>
  )
}

function EyeMark() {
  return (
    <Mark>
      <path d="M3 18 Q 18 4 33 18 Q 18 32 3 18 Z" />
      <circle cx="18" cy="18" r="5" />
      <circle cx="18" cy="18" r="1.6" fill="currentColor" />
    </Mark>
  )
}

function HillBombMark() {
  // Steep slope into vanishing point.
  return (
    <Mark>
      <path d="M3 6 L33 30" />
      <path d="M33 6 L3 30" />
      <path d="M3 30 L33 30" />
      <circle cx="18" cy="22" r="2" fill="currentColor" />
    </Mark>
  )
}

function NodeMark() {
  // Two small nodes with a bezier — the Unreal blueprint vibe.
  return (
    <Mark>
      <rect x="3" y="10" width="10" height="8" />
      <rect x="23" y="20" width="10" height="8" />
      <path d="M13 14 C 19 14, 18 24, 23 24" />
      <circle cx="13" cy="14" r="1.5" fill="currentColor" />
      <circle cx="23" cy="24" r="1.5" fill="currentColor" />
    </Mark>
  )
}

function BrainMark() {
  return (
    <Mark>
      <path d="M6 22 Q 6 10 18 8 Q 30 10 30 22 Q 30 30 24 30 L 12 30 Q 6 30 6 22 Z" />
      <path d="M12 16 Q 18 20 24 16" />
      <path d="M12 22 Q 18 26 24 22" />
    </Mark>
  )
}

function EnsoMark() {
  // Open zen circle.
  return (
    <Mark>
      <path d="M30 18 a 12 12 0 1 0 -12 12" />
    </Mark>
  )
}

function PinMark() {
  return (
    <Mark>
      <circle cx="18" cy="13" r="4" />
      <path d="M18 17 L18 30" />
      <path d="M18 30 L14 33" />
      <path d="M18 30 L22 33" />
    </Mark>
  )
}

function CoconutMark() {
  return (
    <Mark>
      <circle cx="18" cy="18" r="12" />
      <circle cx="14" cy="14" r="1.4" fill="currentColor" />
      <circle cx="18" cy="13" r="1.4" fill="currentColor" />
      <circle cx="22" cy="14" r="1.4" fill="currentColor" />
      <path d="M8 18 Q 18 26 28 18" />
    </Mark>
  )
}
