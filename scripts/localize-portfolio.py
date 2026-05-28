#!/usr/bin/env python3
"""Wrap portfolio.json text props into {en, cs, fr}.

English stays byte-exact (read from the current file); CS/FR are hand
authored below, keyed by the English source string. Any string without a
mapping falls back to English in all languages so nothing renders blank.
Idempotent: fields already shaped as dicts are left alone.
Run: python3 scripts/localize-portfolio.py
"""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(ROOT, "public", "portfolio.json")

# --- tag vocabulary (split on comma, translated per token) -----------
TAGS = {
    "3D": ("3D", "3D"), "VR": ("VR", "VR"), "AR": ("AR", "AR"),
    "VFX": ("VFX", "VFX"), "VP": ("VP", "VP"), "NFT": ("NFT", "NFT"),
    "r&d": ("r&d", "r&d"),
    "Graphic Design": ("grafický design", "design graphique"),
    "Game Design": ("herní design", "game design"),
    "Web Design": ("webdesign", "design web"),
    "3D modeling": ("3D modelování", "modélisation 3D"),
    "Rendering": ("rendering", "rendu"),
    "grading": ("barevné korekce", "étalonnage"),
    "Video": ("video", "vidéo"),
}

# --- short strings: title / description / caption / alt / link label --
T = {
    # titles (proper nouns kept; common nouns translated)
    "Cpt. Demo EP": ("Cpt. Demo EP", "Cpt. Demo EP"),
    "Jan Kaláb sculpture": ("Socha Jana Kalába", "Sculpture de Jan Kaláb"),
    "Epos 257 - Vanitas": ("Epos 257 – Vanitas", "Epos 257 – Vanitas"),
    "Mancuska VR exhibit": ("VR výstava Mančuška", "Exposition VR Mančuška"),
    "Adrex advertisement": ("Reklama Adrex", "Publicité Adrex"),
    "Vlak LED screen UE4 support": ("Vlak – LED stěna, podpora UE4", "Vlak – mur LED, support UE4"),
    "Hotdog Shooter": ("Hotdog Shooter", "Hotdog Shooter"),
    "Kevin Gates mv VFX": ("Kevin Gates – VFX klipu", "Kevin Gates – VFX du clip"),
    "ALIENDIESEL EP": ("ALIENDIESEL EP", "ALIENDIESEL EP"),
    "2MEDIA website": ("Web 2MEDIA", "Site web 2MEDIA"),
    "Cpt. Demo LP": ("Cpt. Demo LP", "Cpt. Demo LP"),
    "Burian LP GFX": ("Burian LP – grafika", "Burian LP – graphisme"),
    "Johnny Majestic mv": ("Johnny Majestic – klip", "Johnny Majestic – clip"),
    "Cpt. Demo mv VFX": ("Cpt. Demo – VFX klipu", "Cpt. Demo – VFX du clip"),
    "CPT. Demo CNN reportage": ("Cpt. Demo – reportáž CNN", "Cpt. Demo – reportage CNN"),
    "HPNOVERSE VFX": ("HPNOVERSE VFX", "HPNOVERSE VFX"),
    "CIEXPO": ("CIEXPO", "CIEXPO"),
    "ARROW": ("ARROW", "ARROW"),
    "Bee Game": ("Včelí hra", "Le jeu de l'abeille"),
    "VR and AR for Svoboda Williams": ("VR a AR pro Svoboda Williams", "VR et AR pour Svoboda Williams"),
    "ŽIDLICKÝ VR gallery": ("VR galerie ŽIDLICKÝ", "Galerie VR ŽIDLICKÝ"),
    "Excalibur military": ("Excalibur – armáda", "Excalibur – militaire"),
    "old fancy AR tests": ("staré parádní AR testy", "anciens tests AR stylés"),
    "BANK renders and VR": ("BANK – rendery a VR", "BANK – rendus et VR"),
    "WIP trust perfumes website": ("Web trust perfumes (WIP)", "Site trust perfumes (WIP)"),
    "numinos VR timetravel": ("numinos – cestování časem ve VR", "numinos – voyage temporel en VR"),

    # descriptions
    "I made this EP cover with GIMP it was the beginning of a long and beautiful collaboration with Cpt. Demo":
        ("Obal tohoto EP jsem udělal v GIMPu — byl to začátek dlouhé a krásné spolupráce s Cpt. Demo.",
         "J'ai réalisé cette pochette d'EP avec GIMP — ce fut le début d'une longue et belle collaboration avec Cpt. Demo."),
    "I made a 3d model in blender based on mockups and technical drawings to preview a sculpture and prepare it for cnc milling":
        ("V Blenderu jsem podle modelů a technických výkresů udělal 3D model, abych nasimuloval sochu a připravil ji pro CNC frézování.",
         "Sous Blender, j'ai créé un modèle 3D à partir de maquettes et de plans techniques pour prévisualiser une sculpture et la préparer au fraisage CNC."),
    "I made an NFT replica of a sculpture for Epos 257":
        ("Vytvořil jsem NFT repliku sochy pro Epos 257.",
         "J'ai réalisé une réplique NFT d'une sculpture pour Epos 257."),
    "VR gallery exposition of A gap by J. Mančuška for Viktor Takač with viewer analytics":
        ("VR galerijní expozice díla „Mezera“ J. Mančušky pro Viktora Takače, včetně analytiky diváků.",
         "Exposition de galerie en VR de « A gap » de J. Mančuška pour Viktor Takač, avec analyse des spectateurs."),
    "VFX/VP commerical i made with oldrich.rocks":
        ("VFX/VP reklama, kterou jsem dělal s oldrich.rocks.",
         "Publicité VFX/VP réalisée avec oldrich.rocks."),
    "Virtual production using gargantuous LED panels on czech feature film with VFXR":
        ("Virtuální produkce na obřích LED panelech pro český celovečerní film, s VFXR.",
         "Production virtuelle sur d'immenses panneaux LED pour un long-métrage tchèque, avec VFXR."),
    "playful collaboration with my student of Game Design, crowd system ai made from scratch":
        ("Hravá spolupráce s mým studentem herního designu; systém davu (AI) napsaný od nuly.",
         "Collaboration ludique avec mon étudiant en game design ; système de foule (IA) écrit de zéro."),
    "realistic jaguar comped in realtime in Unreal using reprojected and relit geometry + Mocha pro facetrack":
        ("Realistický jaguár kompozitovaný v reálném čase v Unrealu pomocí reprojektované a nově nasvícené geometrie + facetrack v Mocha Pro.",
         "Jaguar réaliste composité en temps réel dans Unreal via une géométrie reprojetée et ré-éclairée + facetrack Mocha Pro."),
    "spotify artwork made with blender,ue and substance":
        ("Spotify artwork vytvořený v Blenderu, UE a Substance.",
         "Artwork Spotify réalisé avec Blender, UE et Substance."),
    "made another EP cover for čardáš in GIMP":
        ("Další obal EP pro čardáš, opět v GIMPu.",
         "Une autre pochette d'EP pour čardáš, encore sous GIMP."),
    "2media 3d website using playcanvas, polygon.js and finally settling on react-three-fiber":
        ("3D web pro 2media — přes PlayCanvas a polygon.js jsme nakonec zakotvili u react-three-fiber.",
         "Site web 3D pour 2media — après PlayCanvas et polygon.js, on s'est finalement fixé sur react-three-fiber."),
    "Nobel Prize replica LP cover":
        ("Obal LP — replika Nobelovy ceny.",
         "Pochette de LP — réplique du prix Nobel."),
    "cover artwork design for upcoming Burian LP":
        ("Návrh obalu pro chystané LP Buriana.",
         "Conception de la pochette pour le futur LP de Burian."),
    "Color grading and digital talking horse VFX":
        ("Barevné korekce a VFX digitálního mluvícího koně.",
         "Étalonnage et VFX d'un cheval parlant numérique."),
    "I made a bunch of unreal scenes, a bttf-style car entry, a lightsabre streetfight a flying car and hand animated bullets (including their reflection on dat windshield":
        ("Udělal jsem řadu scén v Unrealu — příjezd auta ve stylu Návratu do budoucnosti, souboj se světelnými meči, létající auto a ručně animované kulky (včetně jejich odrazu na čelním skle).",
         "J'ai créé une série de scènes Unreal — une arrivée de voiture façon Retour vers le futur, un combat au sabre laser, une voiture volante et des balles animées à la main (reflet sur le pare-brise compris)."),
    "Unreal VP for CNN Prima SHOWTIME reportage about Cpt. Demo":
        ("Unreal VP pro reportáž CNN Prima SHOWTIME o Cpt. Demo.",
         "VP Unreal pour le reportage CNN Prima SHOWTIME sur Cpt. Demo."),
    "I made a satirical booze commercial come to life with unreal and DaVinci":
        ("Satirickou reklamu na chlast jsem oživil pomocí Unrealu a DaVinci.",
         "J'ai donné vie à une publicité satirique sur l'alcool avec Unreal et DaVinci."),
    "http://ciexpo.cz": ("http://ciexpo.cz", "http://ciexpo.cz"),
    "Custom branded teambuidling VR archery game featuring boids programmed from scratch":
        ("Brandovaná teambuildingová VR lukostřelba s hejny (boids) naprogramovanými od nuly.",
         "Jeu de tir à l'arc VR de team-building en marque blanche, avec des boids programmés de zéro."),
    "Educational VR game for kids about the life of a bee":
        ("Vzdělávací VR hra pro děti o životě včely.",
         "Jeu VR éducatif pour enfants sur la vie d'une abeille."),
    "case study for VR and AR in real estate":
        ("Případová studie VR a AR v realitách.",
         "Étude de cas sur la VR et l'AR dans l'immobilier."),
    "first virtual gallery in central Europe :D ":
        ("první virtuální galerie ve střední Evropě :D",
         "première galerie virtuelle d'Europe centrale :D"),
    "VR+AR Military factory presentation for Indonesian Gvt.":
        ("VR+AR prezentace vojenské továrny pro indonéskou vládu.",
         "Présentation VR+AR d'une usine militaire pour le gouvernement indonésien."),
    "early Unity tests with Lucas Saidl":
        ("rané testy v Unity s Lucasem Saidlem.",
         "premiers tests Unity avec Lucas Saidl."),
    "Unreal, BLender, Substance": ("Unreal, Blender, Substance", "Unreal, Blender, Substance"),
    "r3f perfume mixer for artisanal scent creator":
        ("r3f mixér parfémů pro řemeslného tvůrce vůní.",
         "Mélangeur de parfums r3f pour un créateur de senteurs artisanal."),
    "varied work for Numinos VR timetravel as Tech artist, RnD dev, Render in Unreal Engine":
        ("Různorodá práce na Numinos VR timetravel — tech artist, RnD vývoj, render v Unreal Enginu.",
         "Travaux variés pour Numinos VR timetravel — tech artist, dev R&D, rendu sous Unreal Engine."),

    # media captions / alts
    "The final cover, exported at 3000×3000 for streaming + print.":
        ("Finální obal, vyexportovaný v 3000×3000 pro streaming i tisk.",
         "La pochette finale, exportée en 3000×3000 pour le streaming et l'impression."),
    "EP cover": ("Obal EP", "Pochette d'EP"),
    "Stream the full EP.": ("Pusť si celé EP.", "Écoute l'EP en entier."),
    "Process clip — sketches I cut into the master reel.":
        ("Klip z procesu — skici, které jsem sestříhal do master reelu.",
         "Clip de process — des esquisses montées dans le reel principal."),
    "3D preview matched to the original technical drawings.":
        ("3D náhled odpovídající původním technickým výkresům.",
         "Aperçu 3D fidèle aux plans techniques d'origine."),
    "3D preview of the sculpture": ("3D náhled sochy", "Aperçu 3D de la sculpture"),
    "Interactive turntable — drag to orbit, scroll to zoom.":
        ("Interaktivní otočna — tažením otáčej, kolečkem přibliž.",
         "Plateau tournant interactif — glissez pour orbiter, molette pour zoomer."),
    "Final reel cut.": ("Finální střih reelu.", "Montage final du reel."),

    # link labels
    "spotify": ("spotify", "spotify"),
    "cpt. demo": ("cpt. demo", "cpt. demo"),
    "sketchfab": ("sketchfab", "sketchfab"),
    "jan kaláb": ("jan kaláb", "jan kaláb"),
}

# --- long markdown bodies (verbatim english key -> cs / fr) -----------
BODIES = {}

BODIES["First commission for **Cpt. Demo**"] = None  # marker; matched by prefix below

BODY_16_CS = """První zakázka pro **Cpt. Demo** — kamaráda, jehož vkus mě naučil polovinu toho, co o beatech vím. EP potřebovalo obal, který bude stejně dobře fungovat jako náhled 64×64 ve Spotify i jako vinylový obal 30×30 cm, a chtěli jsme, aby tentýž obraz zvládl obojí bez kompromisu.

## brief

> „ať to působí jako sklep v roce 2003, ale ať to vydrží navěky“

To znamenalo **záměrně omezenou paletu**, skoro žádné přechody a vysoce kontrastní typografii, která přežije i nejhorší chroma subsampling, jaký album artu provede Apple Music.

## proces

Začal jsem v **GIMPu**, protože jsem ho měl zrovna otevřený. Typografii jsem postavil ručně z rapperova tagu — každý glyf obkreslený z jeho vlastních tahů fixou, aby jméno vlastnilo i ty artefakty.

- Jeden průchod na typografii
- Jeden na zrno
- Jeden na offset tištěné hrany

Lisovna vinylu chtěla CMYK se spadávkou; streamovací služby sRGB v 3000². Stejný zdrojový soubor, jiné exportní profily. Nic těžšího než to, ale lekce byla v disciplíně — brát digitální i fyzický výstup se stejnou vahou.

## co zůstalo

Obal zachytilo pár blogů o beat-tapech. Důležitější ale bylo, že to byl začátek pětileté spolupráce s Cpt. Demo — každé další vydání nese stejný slovník, jen ve větším měřítku."""

BODY_16_FR = """Première commande pour **Cpt. Demo** — un ami dont le goût m'a appris la moitié de ce que je sais sur les beats. L'EP avait besoin d'une pochette qui fonctionne aussi bien en vignette 64×64 sur Spotify qu'en pochette vinyle de 30×30 cm, et nous voulions que la même image fasse les deux sans compromis.

## le brief

> « qu'on dirait une cave en 2003, mais que ça dure pour toujours »

Cela impliquait une **palette délibérément limitée**, presque aucun dégradé et une typographie très contrastée qui survit au pire sous-échantillonnage chroma qu'Apple Music inflige aux pochettes.

## le process

J'ai commencé sous **GIMP**, parce que c'était ce que j'avais d'ouvert. J'ai construit la typo à la main à partir du tag du rappeur — chaque glyphe décalqué de ses propres traits de marqueur, pour que le nom possède jusqu'à ses artefacts.

- Une passe pour la typo
- Une passe pour le grain
- Une passe pour le décalage du bord imprimé

Le pressage vinyle voulait du CMJN avec fond perdu ; le streaming voulait du sRGB en 3000². Même fichier source, profils d'export différents. Rien de plus difficile que ça, mais la leçon était la discipline : traiter la livraison numérique et physique avec le même soin.

## ce qui est resté

La pochette a été reprise par quelques blogs de beat-tapes. Plus important encore, ce fut le début d'une collaboration de cinq ans avec Cpt. Demo — chaque sortie depuis porte le même vocabulaire, à plus grande échelle."""

BODY_11_CS = """Jan Kaláb je český malíř, který začal posouvat svá plátna do třetího rozměru. Sochu měl jako papírovou maketu a štos rozměrů tužkou na pauzovacím papíře; potřeboval digitální dvojče, které pošle do CNC dílny, a render, který pošle galeriím dřív, než přijde účet za frézování.

## zadání

Vzít maketu a výkresy, postavit **čistý parametrický model** a dodat:

1. Render, který galerie dá do newsletteru.
2. Soubor, který CNC dílna vyfrézuje z bloku pěny bez překvapení.

## modelování

Postaveno v Blenderu. Tvar byl stoh rotačních ploch s pár booleovskými řezy; nic složitého, ale tolerance musela být tak těsná, aby operátor CNC nemusel u žádné hrany váhat.

- Modelováno v měřítku (pracovní jednotky = mm)
- Topologie vyčištěná pro subdivision (na viditelných plochách žádné trojúhelníky)
- Kontrola manifoldnosti před exportem
- Export jako **STEP** pro frézu, **GLB** pro web

## co bylo těžké

Nejtěžší nebyla geometrie — bylo to *sjednocení měr*. Tužkové výkresy si na pár místech navzájem odporovaly o pár milimetrů. Vrátil jsem se za Janem se seznamem rozporů a u každého jsme vybrali kanonické číslo dřív, než se model vůbec zvedl ze země. Ten rozhovor ušetřil týden re-frézování."""

BODY_11_FR = """Jan Kaláb est un peintre tchèque qui avait commencé à faire passer ses toiles dans la troisième dimension. Il avait la sculpture sous forme de maquette en papier et une pile de cotes au crayon sur papier-calque ; il lui fallait un jumeau numérique à envoyer à un atelier CNC et un rendu à envoyer aux galeries avant que la facture du fraisage ne tombe.

## la demande

Prendre la maquette et les plans, construire un **modèle paramétrique propre** et produire :

1. Un rendu que la galerie peut mettre dans sa newsletter.
2. Un fichier que l'atelier CNC peut fraiser dans un bloc de mousse sans surprise.

## modélisation

Réalisé sous Blender. La forme était un empilement de surfaces de révolution balayées avec quelques découpes booléennes ; rien de sorcier, mais la tolérance devait être assez serrée pour que l'opérateur CNC n'ait à hésiter sur aucune arête.

- Modélisé à l'échelle (unités de travail = mm)
- Topologie nettoyée pour la subdivision (aucun triangle sur les faces visibles)
- Vérification de la variété (manifold) avant export
- Exporté en **STEP** pour la fraise, en **GLB** pour le web

## ce qui l'a rendu difficile

Le plus dur n'était pas la géométrie — c'était la *réconciliation des mesures*. Les plans au crayon se contredisaient de quelques millimètres par endroits. Je suis retourné voir Jan avec une liste de conflits et nous avons choisi le chiffre canonique pour chacun avant que le moindre modèle ne décolle. Cette conversation a évité une semaine de re-fraisage CNC."""


def localize_tags(s):
    parts = [p.strip() for p in s.split(",") if p.strip()]
    cs, fr = [], []
    for p in parts:
        c, f = TAGS.get(p, (p, p))
        cs.append(c); fr.append(f)
    return {"en": ", ".join(parts), "cs": ", ".join(cs), "fr": ", ".join(fr)}


def wrap(s):
    if not isinstance(s, str):
        return s  # already localized
    cs, fr = T.get(s, (s, s))
    return {"en": s, "cs": cs, "fr": fr}


def wrap_body(s):
    if not isinstance(s, str):
        return s
    if s.startswith("First commission for **Cpt. Demo**"):
        return {"en": s, "cs": BODY_16_CS, "fr": BODY_16_FR}
    if s.startswith("Jan Kaláb is a Czech painter"):
        return {"en": s, "cs": BODY_11_CS, "fr": BODY_11_FR}
    return {"en": s, "cs": s, "fr": s}


data = json.load(open(PATH, encoding="utf-8"))
for p in data:
    if "title" in p: p["title"] = wrap(p["title"])
    if "description" in p: p["description"] = wrap(p["description"])
    if "tags" in p and isinstance(p["tags"], str): p["tags"] = localize_tags(p["tags"])
    if "body" in p: p["body"] = wrap_body(p["body"])
    for m in p.get("media", []):
        if "caption" in m: m["caption"] = wrap(m["caption"])
        if "alt" in m: m["alt"] = wrap(m["alt"])
    for l in p.get("links", []):
        if "label" in l: l["label"] = wrap(l["label"])

json.dump(data, open(PATH, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

# Report any untranslated (cs==en) non-trivial fields for a sanity check.
missing = []
for p in data:
    for key in ("title", "description"):
        v = p.get(key)
        if isinstance(v, dict) and v["cs"] == v["en"] and len(v["en"]) > 12 and not v["en"].startswith("http"):
            missing.append((p["id"], key, v["en"][:40]))
print(f"localized {len(data)} projects")
if missing:
    print("CHECK (cs==en):", missing)
