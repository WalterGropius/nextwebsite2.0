#!/usr/bin/env python3
"""Generate public/art.json from the extracted artBauer.pdf content.

The book is natively Czech; English + French are hand-authored. Images
were extracted to /public/art/img-NNN.webp (see pdfimages + cwebp step).
Each themed section becomes one art "series" with its own subpage at
/art/[id]. Text props are {cs, en, fr} so the language switcher reaches
the content. Run: python3 scripts/build-art-json.py
"""
import json, os

def img_range(a, b):
    return [f"/art/img-{i:03d}.webp" for i in range(a, b + 1)]

SERIES = [
    {
        "id": "surfaces",
        "title": {"cs": "Povrchy", "en": "Surfaces", "fr": "Surfaces"},
        "medium": {"cs": "fotografie", "en": "photography", "fr": "photographie"},
        "home": {"cs": "soubor fotek na cloudu", "en": "photo set in the cloud", "fr": "ensemble de photos dans le cloud"},
        "statement": {
            "cs": "Tento fotografický soubor měl původně ryze praktický charakter — sbírka referenčních předobrazů k tvorbě virtuálních materiálů pro 3D modely a virtuální prostory. Tento sběr se plíživě proměnil v posedlost povrchy. Sbírka tuto proměnu mapuje. Zachytit charakter textury skrze text je takřka nemožné; virtualizované textury získávají abstraktní charakter.",
            "en": "This photographic set began as something purely practical — a collection of reference images for building virtual materials for 3D models and virtual spaces. The gathering quietly turned into an obsession with surfaces. The collection maps that transformation. Capturing the character of a texture through text is almost impossible; virtualised textures take on a character of their own.",
            "fr": "Cet ensemble photographique était au départ purement pratique — une collection d'images de référence pour fabriquer des matériaux virtuels destinés aux modèles 3D et aux espaces virtuels. Cette collecte s'est insidieusement muée en obsession des surfaces. La collection cartographie cette transformation. Saisir le caractère d'une texture par le texte est presque impossible ; les textures virtualisées prennent un caractère qui leur est propre.",
        },
        "images": img_range(0, 5),
    },
    {
        "id": "landscape",
        "title": {"cs": "Krajina", "en": "Landscape", "fr": "Paysage"},
        "medium": {"cs": "fotografie", "en": "photography", "fr": "photographie"},
        "home": {"cs": "soubor fotek na cloudu", "en": "photo set in the cloud", "fr": "ensemble de photos dans le cloud"},
        "statement": {
            "cs": "Cizí krajina. Zcizená krajina. Krajina z auta a z tramvaje. Krajina hnusná. Krajina kýčem. Krajina z města a z lesa.",
            "en": "A foreign landscape. An alienated landscape. Landscape seen from a car and a tram. An ugly landscape. Landscape as kitsch. Landscape of the city and of the forest.",
            "fr": "Un paysage étranger. Un paysage aliéné. Le paysage vu d'une voiture et d'un tramway. Un paysage laid. Le paysage comme kitsch. Le paysage de la ville et de la forêt.",
        },
        "images": img_range(6, 12),
    },
    {
        "id": "weird",
        "title": {"cs": "Divno", "en": "The Weird", "fr": "L'Étrange"},
        "medium": {"cs": "fotografie", "en": "photography", "fr": "photographie"},
        "home": {"cs": "soubor fotek na cloudu", "en": "photo set in the cloud", "fr": "ensemble de photos dans le cloud"},
        "statement": {
            "cs": "Divno je univerzální a všeobjímající — je i ve vzduchu. Žijeme v simulaci, kterou mimo zákony fyziky ovlivňuje mimo jiné divno, náhoda a bizár. Často se ocitáme na pomezí různých světů, přístupů a představ, ať se nám to líbí, nebo ne. Žijeme ve filmu, který režíruje David Lynch. Do jaké míry je divno běžné a běžnost divná? Lze to zachytit?",
            "en": "The weird is universal and all-embracing — it's even in the air. We live in a simulation shaped, beyond the laws of physics, by weirdness, chance and the bizarre. We keep finding ourselves on the border between different worlds, approaches and ideas, whether we like it or not. We live in a film directed by David Lynch. To what extent is the weird ordinary, and the ordinary weird? Can it be captured?",
            "fr": "L'étrange est universel et englobant — il est jusque dans l'air. Nous vivons dans une simulation modelée, au-delà des lois de la physique, par l'étrangeté, le hasard et le bizarre. Nous nous retrouvons sans cesse à la frontière de mondes, d'approches et d'idées différents, que cela nous plaise ou non. Nous vivons dans un film réalisé par David Lynch. Dans quelle mesure l'étrange est-il ordinaire, et l'ordinaire étrange ? Peut-on le saisir ?",
        },
        "images": img_range(13, 20),
    },
    {
        "id": "stalking",
        "title": {"cs": "Stalkerství", "en": "Research Stalking", "fr": "Filature"},
        "medium": {"cs": "fotografie", "en": "photography", "fr": "photographie"},
        "home": {"cs": "soubor fotek na cloudu", "en": "photo set in the cloud", "fr": "ensemble de photos dans le cloud"},
        "statement": {
            "cs": "Výzkumné stalkerství. Snaha zachytit člověka v jeho syrové podstatě, v nečekaný moment — aniž by to chtěl nebo věděl.",
            "en": "Research stalking. An attempt to capture a person in their raw essence, in an unguarded moment — without their wanting it, or even knowing.",
            "fr": "Filature de recherche. Tenter de saisir une personne dans son essence brute, à un instant inattendu — sans qu'elle le veuille, ni même le sache.",
        },
        "images": img_range(21, 26),
    },
    {
        "id": "reflections",
        "title": {"cs": "Reflexe", "en": "Reflections", "fr": "Reflets"},
        "medium": {"cs": "fotografie", "en": "photography", "fr": "photographie"},
        "home": {"cs": "soubor fotek na cloudu", "en": "photo set in the cloud", "fr": "ensemble de photos dans le cloud"},
        "statement": {
            "cs": "Dlouhodobá retrospektiva: reflexe nad reflexí. Zdeformovaná zrcadla tekoucí po povrchu. Světlo stažené zpoza rohu.",
            "en": "A long retrospective: reflection upon reflection. Warped mirrors running across the surface. Light pulled out from around the corner.",
            "fr": "Une longue rétrospective : la réflexion sur la réflexion. Des miroirs déformés coulant sur la surface. La lumière tirée de derrière l'angle.",
        },
        "images": img_range(27, 33),
    },
    {
        "id": "decay",
        "title": {"cs": "Rozpad", "en": "Decay", "fr": "Décomposition"},
        "medium": {"cs": "fotografie", "en": "photography", "fr": "photographie"},
        "home": {"cs": "soubor fotek na cloudu", "en": "photo set in the cloud", "fr": "ensemble de photos dans le cloud"},
        "statement": {
            "cs": "Rozklad, rozpad, odpad a opadané omítky. Četné heterogenní vrstvy pokrývající naše fasády jsou porézní a prodyšné.",
            "en": "Decay, disintegration, waste and fallen plaster. The many heterogeneous layers covering our façades are porous and breathing.",
            "fr": "Décomposition, désagrégation, déchet et enduits tombés. Les nombreuses couches hétérogènes qui recouvrent nos façades sont poreuses et respirantes.",
        },
        "images": img_range(34, 35),
    },
    {
        "id": "grain",
        "title": {"cs": "Kazy v zrnu", "en": "Flaws in the Grain", "fr": "Défauts du grain"},
        "medium": {"cs": "fotografie", "en": "photography", "fr": "photographie"},
        "home": {"cs": "soubor fotek na cloudu", "en": "photo set in the cloud", "fr": "ensemble de photos dans le cloud"},
        "statement": {
            "cs": "Za čas se odhalí skryté kazy v zrnu. Stará kůže opadá, aby mohla narůst nová.",
            "en": "In time, the hidden flaws in the grain reveal themselves. Old skin falls away so new skin can grow.",
            "fr": "Avec le temps, les défauts cachés dans le grain se révèlent. La vieille peau tombe pour que la neuve puisse pousser.",
        },
        "images": img_range(36, 38),
    },
    {
        "id": "light-object",
        "title": {"cs": "Světelný objekt", "en": "Light Object", "fr": "Objet lumineux"},
        "medium": {"cs": "objekt · 3D pero, celulóza, žárovka, kladka", "en": "object · 3D pen, cellulose, bulb, pulley", "fr": "objet · stylo 3D, cellulose, ampoule, poulie"},
        "home": {"cs": "funkční experiment", "en": "a functional experiment", "fr": "une expérience fonctionnelle"},
        "statement": {
            "cs": "Funkční experiment ve světelném objektu: 3D pero, celulóza, objímka, žárovka, kladka.",
            "en": "A functional experiment in a light object: 3D pen, cellulose, socket, bulb, pulley.",
            "fr": "Une expérience fonctionnelle en objet lumineux : stylo 3D, cellulose, douille, ampoule, poulie.",
        },
        "images": img_range(39, 40),
    },
    {
        "id": "acrylic",
        "title": {"cs": "Akryl přes akryl", "en": "Acrylic over Acrylic", "fr": "Acrylique sur acrylique"},
        "medium": {"cs": "akryl na plátně", "en": "acrylic on canvas", "fr": "acrylique sur toile"},
        "home": {"cs": "fotky skic na dece na cloudu", "en": "photos of sketches on a blanket, in the cloud", "fr": "photos de croquis sur une couverture, dans le cloud"},
        "statement": {
            "cs": "Série malby akrylem přes akryl na vyhozeném obraze.",
            "en": "A series of acrylic painted over acrylic, on a discarded canvas.",
            "fr": "Une série d'acrylique peinte par-dessus l'acrylique, sur un tableau mis au rebut.",
        },
        "images": img_range(41, 49),
    },
    {
        "id": "requiem",
        "title": {"cs": "Pieta", "en": "Pietà", "fr": "Pietà"},
        "medium": {"cs": "video · 3D sken", "en": "video · 3D scan", "fr": "vidéo · scan 3D"},
        "home": {"cs": "3D kolekce na Sketchfabu · video na YouTube", "en": "3D collection on Sketchfab · video on YouTube", "fr": "collection 3D sur Sketchfab · vidéo sur YouTube"},
        "statement": {
            "cs": "Toto je vážné video s vážnou hudbou. Stylisticky atypické a vymezené skejtové video natočené na památníku, který byl zničen, nahrazen a zapomenut. Pieta za mramorové obklady, které skončily v drtiči sutin — a za spot, který skončil na smetišti dějin.",
            "en": "This is a serious video, with serious music. A stylistically atypical, deliberately bounded skate video shot on a memorial that was destroyed, replaced and forgotten. A requiem for the marble cladding that ended up in a rubble crusher — and for a spot that ended up on the scrapheap of history.",
            "fr": "Ceci est une vidéo sérieuse, avec une musique sérieuse. Une vidéo de skate stylistiquement atypique et volontairement circonscrite, tournée sur un monument détruit, remplacé et oublié. Un requiem pour les plaques de marbre finies au concasseur de gravats — et pour un spot fini sur le tas de rebut de l'Histoire.",
        },
        "images": img_range(50, 59),
        "links": [
            {"label": {"cs": "3D kolekce", "en": "3D collection", "fr": "collection 3D"}, "href": "https://sketchfab.com/zenbauhaus"},
        ],
    },
    {
        "id": "injury",
        "title": {"cs": "Zranění", "en": "The Injury", "fr": "La Blessure"},
        "medium": {"cs": "video", "en": "video", "fr": "vidéo"},
        "home": {"cs": "video na YouTube", "en": "video on YouTube", "fr": "vidéo sur YouTube"},
        "statement": {
            "cs": "Vážné video, ve kterém dojde k vážnému zranění, jakému se chce každý vyhnout. Na pomezí dokumentu a básně: sdílení s přáteli, vytrvalost, radost.",
            "en": "A serious video in which a serious injury happens — the kind everyone wants to avoid. Somewhere between documentary and poem: sharing with friends, persistence, joy.",
            "fr": "Une vidéo sérieuse où survient une blessure sérieuse — de celles que tout le monde veut éviter. Entre documentaire et poème : le partage entre amis, la persévérance, la joie.",
        },
        "images": img_range(60, 61),
    },
    {
        "id": "coffee",
        "title": {"cs": "Kafe", "en": "Coffee", "fr": "Café"},
        "medium": {"cs": "video", "en": "video", "fr": "vidéo"},
        "home": {"cs": "video na cloudu", "en": "video in the cloud", "fr": "vidéo dans le cloud"},
        "statement": {
            "cs": "Dramatické video o ničem — nebo o kafi. Kolikáté ale je? Tikání. Den co den jsme z různých stran stahováni k dramatu, ke hře strachu. Čas. Odoláme mu? Necháme se pohltit? Budoucnost je hlučná!",
            "en": "A dramatic video about nothing — or about coffee. But which cup is this now? Ticking. Day after day we're pulled from all sides toward drama, toward the game of fear. Time. Will we resist it? Will we let it swallow us? The future is loud!",
            "fr": "Une vidéo dramatique sur rien — ou sur le café. Mais c'est la combientième tasse ? Le tic-tac. Jour après jour, on nous tire de toutes parts vers le drame, vers le jeu de la peur. Le temps. Y résisterons-nous ? Nous laisserons-nous engloutir ? L'avenir est bruyant !",
        },
        "images": img_range(62, 63),
    },
    {
        "id": "plastic",
        "title": {"cs": "PLAST", "en": "PLASTIC", "fr": "PLASTIQUE"},
        "medium": {"cs": "objekt · recyklovaný plast", "en": "object · recycled plastic", "fr": "objet · plastique recyclé"},
        "home": {"cs": "recyklační anti-značka", "en": "a recycling anti-brand", "fr": "une anti-marque du recyclage"},
        "statement": {
            "cs": "Post-apo recyklace. Lokálně. Syntetická organika, drzá umolousanost, klenot z popelnice. Co bude, až tady nebudeme? Věčný a úžasný materiál: PLAST! Recyklační anti-značka.",
            "en": "Post-apocalyptic recycling. Local. Synthetic organics, a brazen grubbiness, a jewel from the bin. What will be here once we're gone? The eternal, marvellous material: PLASTIC! A recycling anti-brand.",
            "fr": "Recyclage post-apo. Local. Organique synthétique, une crasse effrontée, un joyau sorti de la poubelle. Que restera-t-il quand nous ne serons plus là ? Le matériau éternel et merveilleux : le PLASTIQUE ! Une anti-marque du recyclage.",
        },
        "images": img_range(64, 65),
    },
    {
        "id": "diary",
        "title": {"cs": "Deník", "en": "The Diary", "fr": "Le Journal"},
        "medium": {"cs": "video deník", "en": "video diary", "fr": "journal vidéo"},
        "home": {"cs": "instagramový skejtový deník", "en": "an Instagram skate diary", "fr": "un journal de skate sur Instagram"},
        "statement": {
            "cs": "Transparentní osobní deník mapující pomalý a bolestivý progres — s nadsázkou a velkým důrazem na neúspěchy. Meditace, posouvání hranic, trénink vytrvalosti v honu za rozšiřováním kapacit. Progresivní metamorfóza, propojení ducha, duše a těla.",
            "en": "A transparent personal diary tracing slow, painful progress — with exaggeration and a heavy emphasis on the failures. Meditation, pushing limits, endurance training in the chase to expand capacity. A progressive metamorphosis; the joining of spirit, soul and body.",
            "fr": "Un journal personnel transparent retraçant un progrès lent et douloureux — avec exagération et une insistance marquée sur les échecs. Méditation, repousser les limites, entraînement à l'endurance dans la course à l'expansion des capacités. Une métamorphose progressive ; l'union de l'esprit, de l'âme et du corps.",
        },
        "images": img_range(66, 67),
        "links": [
            {"label": {"cs": "instagram", "en": "instagram", "fr": "instagram"}, "href": "https://instagram.com/y4ngyin"},
        ],
    },
]

# Validate referenced images exist; attach cover = first image.
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
missing = []
for s in SERIES:
    s["cover"] = s["images"][0]
    for img in s["images"]:
        if not os.path.exists(os.path.join(root, "public", img.lstrip("/"))):
            missing.append(img)

if missing:
    raise SystemExit(f"Missing images: {missing}")

out = os.path.join(root, "public", "art.json")
with open(out, "w", encoding="utf-8") as f:
    json.dump(SERIES, f, ensure_ascii=False, indent=2)
print(f"wrote {out}: {len(SERIES)} series, {sum(len(s['images']) for s in SERIES)} images")
