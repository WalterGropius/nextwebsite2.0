#!/usr/bin/env python3
"""Wrap blogs.json text props (title, excerpt, tags, body) into {en,cs,fr}.

English is read byte-exact from the file; CS/FR are hand authored below,
keyed by post id. Code fences inside bodies are kept verbatim (code is
universal). Idempotent. Run: python3 scripts/localize-blogs.py
"""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(ROOT, "public", "blogs.json")

TAGS = {
    "sombra": ("sombra", "sombra"),
    "methodology": ("metodika", "méthodologie"),
    "ai": ("ai", "ia"),
    "craft": ("řemeslo", "artisanat"),
    "hardware": ("hardware", "matériel"),
    "xr": ("xr", "xr"),
    "future": ("budoucnost", "futur"),
}

TITLE = {
    "faces-to-cameras": (
        "every face becomes a camera",
        "z každé stěny se stane kamera",
        "chaque face devient une caméra",
    ),
    "polymath-time-debt": (
        "the polymath's time debt is the only debt that compounds for free",
        "časový dluh polyhistora je jediný dluh, který se úročí zadarmo",
        "la dette de temps du polymathe est la seule dette qui compose gratuitement",
    ),
    "agents-that-ship": (
        "agents that ship",
        "agenti, kteří dotahují",
        "des agents qui livrent",
    ),
    "blackbox-protocol": (
        "blackbox protocol",
        "protokol černé skříňky",
        "le protocole boîte noire",
    ),
    "taste-is-a-feature": (
        "your taste is a feature, not a bug",
        "tvůj vkus je feature, ne bug",
        "ton goût est une fonctionnalité, pas un bug",
    ),
    "hardware-as-grammar": (
        "hardware is a grammar",
        "hardware je gramatika",
        "le matériel est une grammaire",
    ),
    "spatial-is-the-default": (
        "spatial computing is going to be the default, not the niche",
        "prostorové počítání bude standard, ne nika",
        "l'informatique spatiale va devenir la norme, pas la niche",
    ),
}

EXCERPT = {
    "faces-to-cameras": (
        "A tiny Blender script that turns any mesh into a camera rig for gaussian splat capture.",
        "Maličký Blender skript, který z libovolného meshe udělá kamerový rig pro snímání gaussian splatů.",
        "Un petit script Blender qui transforme n'importe quel mesh en rig de caméras pour la capture de gaussian splats.",
    ),
    "polymath-time-debt": (
        "Most ideas you have you won't ship. Sombra OS is the cache.",
        "Většinu nápadů, které máš, nedotáhneš. Sombra OS je cache.",
        "La plupart des idées que tu as, tu ne les livreras pas. Sombra OS est le cache.",
    ),
    "agents-that-ship": (
        "An agent worth running isn't smart — it's stubborn.",
        "Agent, který stojí za spuštění, není chytrý — je tvrdohlavý.",
        "Un agent qui vaut la peine d'être lancé n'est pas intelligent — il est têtu.",
    ),
    "blackbox-protocol": (
        "I draw every new domain as if for a patent. The boxes I can't fill are the work.",
        "Každou novou oblast kreslím jako na patent. Práce jsou ty rámečky, které neumím vyplnit.",
        "Je dessine chaque nouveau domaine comme pour un brevet. Le travail, ce sont les cases que je n'arrive pas à remplir.",
    ),
    "taste-is-a-feature": (
        "When you build with AI long enough, the bottleneck is taste, not throughput.",
        "Když dost dlouho stavíš s AI, úzkým hrdlem je vkus, ne propustnost.",
        "Quand on construit assez longtemps avec l'IA, le goulot d'étranglement, c'est le goût, pas le débit.",
    ),
    "hardware-as-grammar": (
        "Soldering an ESP32 to anything teaches you what software cannot.",
        "Připájet ESP32 k čemukoli tě naučí to, co software nedokáže.",
        "Souder un ESP32 à quoi que ce soit t'apprend ce que le logiciel ne peut pas.",
    ),
    "spatial-is-the-default": (
        "Mobile felt like a sideshow until it ate everything. Spatial is at the same point now.",
        "Mobil působil jako vedlejší atrakce, než spolkl všechno. Prostorové počítání je teď ve stejném bodě.",
        "Le mobile semblait anecdotique jusqu'à ce qu'il dévore tout. Le spatial en est au même point aujourd'hui.",
    ),
}

BODY = {}

BODY["faces-to-cameras"] = {
"cs": """Pořád jsem narážel na stejnou zeď při snímání objektů pro **gaussian splatting**: potřeboval jsem desítky úhlů kamery, rovnoměrně rozprostřené kolem objektu, všechny mířící na něj, a žádné dva pohledy náhodně nahloučené k sobě. Dělat to ručně v Blenderu je utrpení.

Tak jsem napsal skript, který dělá tu nasnadě ležící věc: vezme mesh a promění **každou stěnu v kameru**.

## ten trik

Přidej kolem objektu icosféru a geometrie udělá tu těžkou práci za tebe. Stěny icosféry jsou téměř rovnoměrně rozmístěné po kouli — což je přesně to rozložení pohledů, které splat pipeline chce. Jedno dělení dá ~80 kamer, dvě ~320. Každá stěna se stane kamerou sedící ve středu stěny, mířící dovnitř na střed objektu.

Pak přiřadí jednu kameru na snímek časové osy, takže celé snímání je jediné **Render Animation**:

```
Render > Render Animation   (Ctrl+F12)
```

Vypadne `frame_0001.png`, `frame_0002.png`, … — jeden obrázek na kameru, v číslované sekvenci, kterou COLMAP a každý splat trenér očekává.

## proč stěny, ne otočný stůl

Otočný stůl ti dá jeden prstenec pohledů v jedné výšce. Splaty to nenávidí — rekonstrukce dostane tlustý rovník a u pólů hladoví. Stěny meshe ti dají plné kulové pokrytí zadarmo a hustotu řídíš dělením, místo abys ladil klíčové snímky.

Je to asi třicet řádků `bmesh` plus `to_track_quat` na zamíření každé kamery. Celé je to na githubu: [blender-export-gs.py](https://github.com/WalterGropius/zenbauhaus_scripts/blob/main/blender-export-gs.py).

## háček

Dokonalá icosféra dá každou kameru na stejný poloměr, dokonale vystředěnou. COLMAP to obvykle zvládne, ale pokud ti rekonstrukce vyjde řídká, trochu rozkmitej poloměr nebo sniž ohnisko pro větší překryv mezi sousedy. Překryv je to, čím se živí krok structure-from-motion.

Hoď mesh kolem věci, spusť skript, renderuj. Nudné nástroje jsou ty, které dotahují.""",
"fr": """Je butais sans cesse sur le même mur en capturant des objets pour le **gaussian splatting** : il me fallait des dizaines d'angles de caméra, répartis uniformément autour du sujet, tous pointés vers lui, sans que deux vues se retrouvent accidentellement entassées. Le faire à la main dans Blender est un supplice.

Alors j'ai écrit un script qui fait la chose évidente : prendre un mesh et transformer **chaque face en caméra**.

## l'astuce

Ajoute une icosphère autour de ton sujet et la géométrie fait le gros du travail à ta place. Les faces d'une icosphère sont réparties de façon quasi uniforme sur une sphère — c'est exactement la distribution de points de vue que veut un pipeline de splat. Une subdivision donne ~80 caméras, deux ~320. Chaque face devient une caméra posée au centre de la face, pointée vers l'intérieur, vers le centre de l'objet.

Ensuite il lie une caméra par image de la timeline, si bien que toute la capture tient en un seul **Render Animation** :

```
Render > Render Animation   (Ctrl+F12)
```

Il en sort `frame_0001.png`, `frame_0002.png`, … — une image par caméra, dans une séquence numérotée que COLMAP et tout entraîneur de splat attendent.

## pourquoi les faces, pas un tourne-disque

Un tourne-disque te donne un seul anneau de vues à une seule hauteur. Les splats détestent ça — la reconstruction se retrouve avec un équateur bien gras et meurt de faim aux pôles. Les faces du mesh te donnent une couverture sphérique complète gratuitement, et tu contrôles la densité en subdivisant plutôt qu'en bricolant des keyframes.

Ça fait une trentaine de lignes de `bmesh` plus `to_track_quat` pour orienter chaque caméra. Le tout est sur github : [blender-export-gs.py](https://github.com/WalterGropius/zenbauhaus_scripts/blob/main/blender-export-gs.py).

## le piège

Une icosphère parfaite met chaque caméra au même rayon, parfaitement centrée. COLMAP s'en sort généralement, mais si ta reconstruction ressort clairsemée, fais varier un peu le rayon ou baisse la focale pour plus de recouvrement entre voisines. Le recouvrement, c'est ce que mange l'étape de structure-from-motion.

Pose un mesh autour d'une chose, lance le script, rends. Les outils ennuyeux sont ceux qui livrent.""",
}

BODY["polymath-time-debt"] = {
"cs": """Důvod, proč jsem postavil **Sombra OS**, je brutálně prostý: došlo mi místo na disku pro nápady.

Výhoda polyhistora je, že tě může zajímat všechno. Daní polyhistora je, že poločas rozpadu nápadu v hlavě je někde mezi čtyřiceti minutami a třemi dny. Než umyješ nádobí, už jsi zapomněl, co jsi chtěl v úterý postavit.

## analogie s cache

Každý programátor se naučí, že **L1 cache je malá a L3 cache pomalá**. Trik rychlého systému je držet ty správné věci horké.

Trik produktivního *života* je stejný. Tvá pozornost v popředí je L1 — malinká, rychlá, ztrátová. Psané poznámky jsou L2 — větší, pomalejší, ztrátové jinak. Dlouhé eseje, prototypy a nasazený kód jsou L3 — pomalu se plní, pomalu čtou, ale jsou trvalé.

Sombra OS žije mezi L1 a L2. Je to **záchytná plocha „vlož kamkoli“**, která chytí sedmivteřinovou myšlenku dřív, než ti vypadne z hlavy, a pak chytá další sedmivteřinovou myšlenku, dokud jsi nechtěně nenasbíral třicet minut jednoho souvislého argumentu.

## dividenda

To chytré není v zachytávání; je to ve **vyhledávání**.

Každý fragment, který vložíš, se stává dohledatelným přes každý fragment, který jsi kdy vložil — protože agent, který tvé poznámky prohledává, je při indexaci i čte a indexuje je podle toho, o *čem* jsou, ne co *říkají*. Za půl roku, až budeš prototypovat další věc, agent tiše vytáhne ty čtyři poznámky z loňského června, na které si nepamatuješ, ale které přesně popisují tvůj problém.

To je dividenda časového dluhu. Minulé já přestává být cizincem. Budoucí já přestává předělávat práci minulého já. Úrok se skládá a ty sis na něj nic nepůjčil.

> bonus: systém chytá i vlastní bugy, protože ho začneš používat i na meta-poznámky.

První měsíc to působí jako režie navíc. Druhý měsíc jako návyk. Třetí měsíc zjistíš, že už bez toho neumíš myslet.""",
"fr": """La raison pour laquelle j'ai construit **Sombra OS** est d'une simplicité brutale : j'étais à court de disque pour mes idées.

Le marché du polymathe, c'est de pouvoir s'intéresser à tout. L'impôt du polymathe, c'est que la demi-vie d'une idée dans ta tête se situe entre quarante minutes et trois jours. Le temps de faire la vaisselle et tu as déjà oublié ce que tu voulais construire mardi.

## l'analogie du cache

Tout programmeur apprend que **le cache L1 est petit et le cache L3 est lent**. Le truc d'un système rapide est de garder les bonnes choses au chaud.

Le truc d'une *vie* productive est le même. Ton attention au premier plan, c'est le L1 — minuscule, rapide, à perte. Tes notes écrites, c'est le L2 — plus grand, plus lent, à perte autrement. Les essais longs, les prototypes et le code livré, c'est le L3 — long à remplir, long à lire, mais durable.

Sombra OS vit entre le L1 et le L2. C'est la **surface de capture « colle partout »** qui attrape la pensée de sept secondes avant qu'elle ne tombe de ta tête, puis attrape la suivante, jusqu'à ce que tu aies accumulé sans le vouloir trente minutes d'un seul argument cohérent.

## le dividende

Le génie n'est pas dans la capture ; il est dans la **récupération**.

Chaque fragment que tu colles devient trouvable par chaque fragment que tu as déjà collé, parce que l'agent qui fouille tes notes les lit aussi au moment de l'indexation et les indexe selon ce dont elles *parlent*, pas ce qu'elles *disent*. Dans six mois, quand tu prototyperas la prochaine chose, l'agent récupère discrètement les quatre notes de juin dernier dont tu ne te souvenais pas mais qui décrivent exactement le problème.

C'est le dividende de la dette de temps. Le toi du passé cesse d'être un étranger. Le toi du futur cesse de refaire le travail du toi du passé. Les intérêts composent, et tu n'as rien emprunté pour les gagner.

> bonus : le système attrape aussi ses propres bugs, parce que tu commences à l'utiliser pour les méta-notes.

Le premier mois ressemble à une surcharge. Le deuxième mois à une habitude. Le troisième mois, tu remarques que tu ne peux plus penser sans lui.""",
}

BODY["agents-that-ship"] = {
"cs": """Většina ukázek LLM agentů ukazuje model, jak píše báseň o svém plánu a pak udělá špatnou věc. Chyba není v tom, že je model hloupý. Chyba je, že **harness kolem modelu** nemá páteř.

Užitečná smyčka agenta vypadá takhle:

```
goal:   describe what done looks like, in one sentence.
plan:   propose 3-7 steps.
loop:
  pick the next step.
  run a tool.
  inspect the result.
  if the result advances the goal: continue.
  if not: replan from the new state.
  if the same failure repeats twice: abort that branch.
```

Všimni si, co chybí: model nikdy nesmí jednostranně vyhlásit vítězství. Taky nikdy nesmí žvanit. Každá iterace smyčky stojí volání nástroje, což stojí měřitelnou věc — peníze, čas, latenci — a vyrábí měřitelnou věc: změnu stavu.

## tři režimy selhání

Většina agentích harnessů selhává jedním z těchto tří způsobů:

1. **Sebejistota ≠ pokrok.** Model trvá na tom, že úkol je hotový; log nástrojů říká, že se nic nezměnilo. Harness musí věřit logu, ne modelu.
2. **Smyčka bez kontroly.** Model desetkrát po sobě opakuje totéž rozbité volání. Harness musí opakované selhání detekovat a vyskočit z něj.
3. **Tunelové vidění jednoho nástroje.** Model zná jen jeden nástroj, tak se jím snaží vyřešit všechno. Dej mu tři čtyři dobře pojmenované nástroje a chybovost klesne na polovinu.

Model je kreativní spisovatel. Harness je editor. Když vydáš první draft kreativního spisovatele, vydáš nesmysl; když vydáš to, co editor schválí, vydáš dílo.

## co opsat

Vezmi smyčku výše a ty tři režimy selhání. Nic nepřidávej. Nejnudnější agent, který *dotahuje*, předčí nejzajímavějšího agenta, který *nedotahuje*. S lidmi jsme se to naučili dávno předtím, než jsme to zkusili s modely.""",
"fr": """La plupart des démos d'agents LLM montrent le modèle écrivant un poème sur son plan, puis faisant la mauvaise chose. L'erreur n'est pas que le modèle est bête. L'erreur, c'est que le **harnais autour du modèle** n'a pas de colonne vertébrale.

Une boucle d'agent utile ressemble à ceci :

```
goal:   describe what done looks like, in one sentence.
plan:   propose 3-7 steps.
loop:
  pick the next step.
  run a tool.
  inspect the result.
  if the result advances the goal: continue.
  if not: replan from the new state.
  if the same failure repeats twice: abort that branch.
```

Remarque ce qui manque : le modèle n'a jamais le droit de déclarer la victoire unilatéralement. Il n'a pas non plus le droit de divaguer. Chaque itération de la boucle coûte un appel d'outil, qui coûte une chose mesurable — argent, temps, latence — et produit une chose mesurable : un changement d'état.

## trois modes d'échec

La plupart des harnais d'agents échouent de l'une de ces trois façons :

1. **Confiance ≠ progrès.** Le modèle insiste que la tâche est faite ; le journal des outils dit que rien n'a changé. Le harnais doit faire confiance au journal, pas au modèle.
2. **Boucle sans vérification.** Le modèle relance dix fois de suite le même appel cassé. Le harnais doit détecter l'échec répété et en sortir.
3. **Vision en tunnel d'un seul outil.** Le modèle ne connaît qu'un outil, alors il essaie de tout résoudre avec. Donne-lui trois ou quatre outils bien nommés et le taux d'échec est divisé par deux.

Le modèle est un écrivain créatif. Le harnais est l'éditeur. Si tu publies le premier jet de l'écrivain, tu publies du n'importe quoi ; si tu publies ce que l'éditeur valide, tu publies un livrable.

## quoi copier

Prends la boucle ci-dessus et les trois modes d'échec. N'ajoute rien. L'agent le plus ennuyeux qui *livre* battra l'agent le plus intéressant qui *ne livre pas*. On l'a appris avec les humains bien avant de l'essayer avec les modèles.""",
}

BODY["blackbox-protocol"] = {
"cs": """Mám zápisníkový zvyk, kterému říkám **protokol černé skříňky**. Kdykoli se dotknu oblasti, které nerozumím — dokumentace vnitřku syntezátoru, nová robotická platforma, cizí codebase — nakreslím ji, jako bych ji přihlašoval k patentu. Rámečky, šipky, popisky. Rámečky jsou subsystémy; šipky jsou data, energie nebo řízení, které se mezi nimi pohybují.

Smysl cvičení **není** vyrobit správný diagram. Smysl je, že **systém, kterému nerozumíš, nenakreslíš**. Jakmile začneš kreslit, narazíš na rámečky, které neumíš vyplnit, šipky, které neumíš popsat, a zpětné vazby, o kterých jsi nevěděl. To jsou neznámé neznámé, které se mění ve známé neznámé. Odtud už jsou řešitelné.

## pravidlo

Pravidlo zní, že každá šipka musí mít na sobě podstatné jméno: co se po ní vlastně pohybuje? Volty, pakety, záměr, tokeny, sendvič? Když neumíš pojmenovat, co je na šipce, nerozumíš tomu spojení — a neměl by ses tvářit, že ano.

## dividenda

Diagram, který nakreslíš první den, je třetí den většinou špatně. To nevadí. Ta chybnost tě ten systém učí. Sedmý den ho překreslíš zpaměti a všimneš si, že rámečky mají jiné tvary; jednadvacátý den se diagram zhroutil do jednoho odstavce prostého textu, který přečte i člověk zvenčí — a v tu chvíli té věci rozumíš dost na to, abys **postavil další**.

Většina oborů je takhle. Většina lidí, co o sobě říkají „nejsem technický typ“, technická je; jen nikdy nezdědili návyk diagramu.""",
"fr": """J'ai une habitude de carnet que j'appelle le **protocole boîte noire**. Chaque fois que je touche à un domaine que je ne comprends pas — la doc des entrailles d'un synthétiseur, une nouvelle plateforme robotique, le code de quelqu'un d'autre — je le dessine comme pour un dépôt de brevet. Des cases, des flèches, des étiquettes. Les cases sont des sous-systèmes ; les flèches sont les données, l'énergie ou le contrôle qui circulent entre elles.

Le but de l'exercice n'est **pas** de produire un diagramme correct. Le but, c'est qu'**on ne peut pas dessiner un système qu'on ne comprend pas**. Dès que tu commences à dessiner, tu butes sur des cases que tu ne peux pas remplir, des flèches que tu ne peux pas étiqueter et des boucles de rétroaction dont tu ignorais l'existence. Ce sont les inconnues inconnues qui deviennent des inconnues connues. À partir de là, elles sont traitables.

## la règle

La règle, c'est que chaque flèche doit porter un nom : qu'est-ce qui circule réellement ? Des volts, des paquets, une intention, des tokens, un sandwich ? Si tu ne peux pas nommer ce qui est sur la flèche, tu ne comprends pas la connexion — et tu ne devrais pas faire semblant.

## le dividende

Le diagramme que tu dessines le premier jour est généralement faux le troisième. Ce n'est pas grave. C'est cette fausseté qui t'apprend le système. Le septième jour, tu le redessines de mémoire et tu remarques que les cases ont d'autres formes ; le vingt et unième jour, le diagramme s'est effondré en un paragraphe de texte clair qu'un étranger peut vraiment lire, et à ce moment-là tu comprends la chose assez pour **construire la suivante**.

La plupart des domaines sont ainsi. La plupart des gens « pas techniques » le sont ; ils n'ont juste jamais hérité de l'habitude du diagramme.""",
}

BODY["taste-is-a-feature"] = {
"cs": """Generativní modely otočily relativní cenu dvou věcí, které jako tvůrce děláš: **vyrábět varianty** a **vybrat tu správnou**. Výroba bývala ta drahá část. Teď je skoro zadarmo.

Co zbývá, je vkus.

## vkus je to vybírání

Vkus je funkce, která říká *ano, tahle, ne těch ostatních sedm*. Je hodnotící, ne tvůrčí — a přesně v tom jsou modely špatné. Těch sedm rády vygenerují; vybrat musíš ty.

Když umíš pojmenovat, co dělá dobrou věc dobrou — v oboru, na kterém ti záleží, konkrétně — máš něco, co model nemá, a *celá práce* je přišroubovat tu artikulaci na model.

## jak ho brousit

Vkus brousíš stejně jako olympijští skokani do vody brousí trojné salto vpřed: **záměrným tréninkem**. Vyber nejlepší ze sedmi, desetkrát po sobě, a pak napiš *proč*. Pak vyber nejlepší z padesáti. Pak vyber nejlepší minutu nejlepšího draftu nejlepší kapitoly cizí knihy a napiš, čím ta minuta funguje.

Zkratka neexistuje. Model umí varianty chrlit celý den. Vybrat umíš jen ty.

## co to znamená pro práci

Tvá nejcennější dovednost v příštích pěti letech bude **kalibrovaný vkus v nice, kterou sis schválně vybral**. Nika musí být dost malá, abys v ní mohl být nefér dobrý, a dost velká, aby byl někdo ochotný za to vybírání platit. Najdi ten průnik a tvá vzácnost je trvalá.""",
"fr": """Les modèles génératifs ont inversé le coût relatif de deux choses que tu fais en tant que créateur : **produire des variantes** et **choisir la bonne**. La production était la partie chère. Maintenant elle est presque gratuite.

Ce qui reste, c'est le goût.

## le goût, c'est le choix

Le goût est la fonction qui dit *oui celle-ci, non les sept autres*. Il est évaluatif, pas créatif — et c'est exactement ce que les modèles font mal. Ils généreront volontiers les sept ; c'est à toi de choisir.

Si tu peux articuler ce qui rend une bonne chose bonne — dans un domaine qui te tient à cœur, avec précision — tu as quelque chose que le modèle n'a pas, et *tout le boulot* consiste à greffer cette articulation sur le modèle.

## comment l'affûter

On affûte le goût comme les plongeurs olympiques affûtent le triple retourné : **par la pratique délibérée**. Choisis le meilleur sur sept, dix fois de suite, puis écris *pourquoi*. Puis choisis le meilleur sur cinquante. Puis choisis la meilleure minute du meilleur jet du meilleur chapitre du livre de quelqu'un d'autre, et écris ce qui fait fonctionner cette minute.

Il n'y a pas de raccourci. Le modèle peut produire les variantes toute la journée. Toi seul peux choisir.

## ce que ça implique pour le travail

Ta compétence la plus précieuse des cinq prochaines années sera un **goût calibré dans une niche que tu as choisie exprès**. La niche doit être assez petite pour que tu puisses y devenir injustement bon, et assez grande pour que quelqu'un soit prêt à payer pour le choix. Trouve cette intersection et ta rareté devient permanente.""",
}

BODY["hardware-as-grammar"] = {
"cs": """Pořád se vracím k pracovnímu stolu, protože hardware spravuje můj softwarový mozek.

Software odpouští. Můžeš držet špatný mentální model *roky* a kompilátor bude tiše předstírat, že je všechno v pořádku, dokud ti procházejí testy. Hardware je nemilosrdný v doslovném smyslu: napětí nelže, proud nelže, magický kouř nelže.

Když poprvé zapojíš ESP32 obráceně a koukáš, jak se z čipu za 4 dolary stávají 4 dolary dekorativního uhlíku, dostaneš lekci z gramatiky, jakou tě žádný TypeScript nenaučí: **zákony se nedají vyjednat**.

## co se přenáší

- **Rozpočty tolerancí.** Software je ignoruje. Hardware nemůže.
- **Kalibrace.** Software má jednotky; hardware je vynucuje.
- **Pořadí oživení.** Napájení před signálem, zem před vším, hodiny před daty. Software má stejné závislosti — tvé IDE je jen schovává.
- **Čichová zkouška.** Hořící epoxid. Horké regulátory. Cívka kvílící na slyšitelné frekvenci. Hardware ti to řekne třemi smysly tam, kde ti software dá vědět jen přes logfile.

## praktický recept

Kup jednu levnou vývojovou desku. Kup multimetr, kterému opravdu rozumíš. Kup pájku s regulací teploty. Zapoj LED na tlačítko na mikrokontrolér; nahraj firmware; pak ho přiměj udělat jednu zbytečnou fyzickou věc. Akt vyrobení jednoho *vedlejšího efektu v reálném světě* znovu uzemní celý abstrakční stack. Všechno, co zítra uděláš u klávesnice, je díky tomu ostřejší.""",
"fr": """Je retourne sans cesse à l'établi, parce que le matériel répare mon cerveau de logiciel.

Le logiciel pardonne. Tu peux tenir un modèle mental faux pendant des *années* et le compilateur fera tranquillement comme si de rien n'était, tant que tes tests passent. Le matériel est impitoyable au sens littéral : la tension ne ment pas, le courant ne ment pas, la fumée magique ne ment pas.

La première fois que tu câbles un ESP32 à l'envers et que tu regardes une puce à 4 dollars devenir 4 dollars de carbone décoratif, tu reçois une leçon de grammaire qu'aucun TypeScript ne peut t'enseigner : **les lois ne sont pas négociables**.

## ce qui se transfère

- **Budgets de tolérance.** Le logiciel les ignore. Le matériel ne peut pas.
- **Calibration.** Le logiciel a des unités ; le matériel les impose.
- **Séquence de mise en route.** L'alimentation avant le signal, la masse avant tout, l'horloge avant les données. Le logiciel a les mêmes dépendances — ton IDE les cache, c'est tout.
- **Le test de l'odeur.** Époxy qui brûle. Régulateurs chauds. Une bobine qui siffle dans l'audible. Le matériel te le dit par trois sens là où le logiciel ne te le dit que par un fichier de log.

## recette pratique

Achète une carte de dev bon marché. Achète un multimètre que tu comprends vraiment. Achète un fer à souder avec réglage de température. Câble une LED à un bouton à un microcontrôleur ; flashe un firmware ; puis fais-lui faire une seule chose physique inutile. Le fait de produire un seul *effet de bord dans le monde réel* re-ancre toute la pile d'abstractions. Tout ce que tu feras au clavier demain en sera plus net.""",
}

BODY["spatial-is-the-default"] = {
"cs": """Obvyklý názor zní, že VR / AR / XR je nika, která nikou zůstane, dokud nebudou headsety pohodlné jako brýle. Myslím, že ten obvyklý názor má kauzalitu obráceně.

Prostorové počítání nečeká, až bude hardware dost dobrý pro *spotřebitele*. Čeká, až budou **nástroje na obsah** dost dobré, aby designéři a vývojáři nemuseli každý projekt vynalézat kolo znovu. Jakmile budou nástroje komoditou, headsety se svezou s nimi.

## co se změnilo v letech 2024–25

- **WebXR** je teď opravdová platforma, ne jen flag.
- **Gaussian splatting** proměnil telefon ve 3D skener.
- **Unreal 5 + Niagara** zvládnou snímkové rozpočty headsetů, aniž bys přepisoval herní kód.
- **Apple Vision Pro** dodal vážně dobrý model interakce pohledem a štípnutím a většina branže ho během měsíců okopírovala.

Každé z toho je vylepšení toolchainu, které se skládá. Ani jedno není funkce pro koncového uživatele.

## co bude dál

Až budou nástroje komoditou, nová generace designérů stráví prvních deset let přemýšlením v prostoru — stejně jako mobilní generace strávila prvních deset let přemýšlením „touch first“. Oba ty posuny byly zpětně zřejmé; oba všechny zaskočily; oba do pěti let spolkly každou sousední plochu.

Práce, na kterou teď sázím, jsou nástroje, ne headsety. Když dnes vyrábíš krumpáče a lopaty pro prostorové počítání, prodáváš zlaté horečce v roce 2028.""",
"fr": """L'avis courant veut que la VR / AR / XR soit une niche qui restera une niche jusqu'à ce que les casques soient aussi confortables que des lunettes. Je pense que cet avis courant a la causalité à l'envers.

L'informatique spatiale n'attend pas que le matériel devienne assez bon pour les *consommateurs*. Elle attend que les **outils de contenu** deviennent assez bons pour que designers et développeurs cessent de réinventer la roue à chaque projet. Dès que les outils sont une commodité, les casques suivent.

## ce qui a changé en 2024-25

- **WebXR** est désormais une vraie plateforme, plus un simple flag.
- **Le gaussian splatting** a transformé un téléphone en scanner 3D.
- **Unreal 5 + Niagara** tiennent les budgets d'images des casques sans réécrire ton code de gameplay.
- **Apple Vision Pro** a livré un modèle d'interaction regard + pincement vraiment bon, et la majorité de l'industrie l'a copié en quelques mois.

Chacun de ces points est une amélioration de chaîne d'outils qui compose. Aucun n'est une fonctionnalité pour l'utilisateur final.

## ce qui vient ensuite

Quand l'outillage sera une commodité, la nouvelle génération de designers passera ses dix premières années à penser dans l'espace, comme la génération mobile a passé ses dix premières années à penser « touch first ». Les deux mouvements étaient évidents après coup ; les deux ont surpris tout le monde ; les deux ont dévoré chaque surface adjacente en cinq ans.

Le travail sur lequel je parie aujourd'hui, ce sont les outils, pas les casques. Si tu fabriques les pioches et les pelles du spatial aujourd'hui, tu vends à la ruée vers l'or de 2028.""",
}


def localize_tags(s):
    parts = [p.strip() for p in s.split(",") if p.strip()]
    cs, fr = [], []
    for p in parts:
        c, f = TAGS.get(p, (p, p))
        cs.append(c); fr.append(f)
    return {"en": ", ".join(parts), "cs": ", ".join(cs), "fr": ", ".join(fr)}


data = json.load(open(PATH, encoding="utf-8"))
for p in data:
    pid = p["id"]
    if isinstance(p.get("title"), str):
        en, cs, fr = TITLE[pid]
        assert en == p["title"], f"title drift {pid}: {p['title']!r}"
        p["title"] = {"en": en, "cs": cs, "fr": fr}
    if isinstance(p.get("excerpt"), str):
        en, cs, fr = EXCERPT[pid]
        p["excerpt"] = {"en": en, "cs": cs, "fr": fr}
    if isinstance(p.get("tags"), str):
        p["tags"] = localize_tags(p["tags"])
    if isinstance(p.get("body"), str):
        b = BODY[pid]
        p["body"] = {"en": p["body"], "cs": b["cs"], "fr": b["fr"]}

json.dump(data, open(PATH, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print(f"localized {len(data)} posts")
