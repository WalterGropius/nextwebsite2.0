import type { Test } from "./deck"

// Seed deck transcribed from the "Živorodí" worksheets.
export const LATIN: Record<string, string> = {"koala medvídkovitý": "Phascolarctos cinereus", "klokan rudý": "Osphranter rufus", "vačice opossum": "Didelphis virginiana", "rejsek obecný": "Sorex araneus", "krtek obecný": "Talpa europaea", "ježek západní": "Erinaceus europaeus", "lenochod tříprstý": "Bradypus", "mravenečník velký": "Myrmecophaga tridactyla", "pásovec velký": "Dasypus novemcinctus", "myš domácí": "Mus musculus", "křeček polní": "Cricetus cricetus", "krysa obecná": "Rattus rattus", "sysel polní": "Spermophilus citellus", "veverka obecná": "Sciurus vulgaris", "bobr evropský": "Castor fiber", "zajíc polní": "Lepus europaeus", "králík divoký": "Oryctolagus cuniculus", "lemur kata": "Lemur catta", "komba ušatá": "Otolemur", "gueréza angolská": "Colobus angolensis", "kočkodan obecný": "Chlorocebus", "pavián": "Papio hamadryas", "gorila horská": "Gorilla beringei beringei", "šimpanz učenlivý": "Pan troglodytes", "orangutan sumaterský": "Pongo abelii", "rys ostrovid": "Lynx lynx", "lev pustinný": "Panthera leo", "kočka divoká": "Felis silvestris", "tygr indický": "Panthera tigris tigris", "puma americká": "Puma concolor", "gepard královský": "Acinonyx jubatus", "hyena skvrnitá": "Crocuta crocuta", "mýval severní": "Procyon lotor", "lasice kolčava": "Mustela nivalis", "tchoř tmavý": "Mustela putorius", "vydra říční": "Lutra lutra", "jezevec lesní": "Meles meles", "kuna skalní": "Martes foina", "lachtan jižní": "Otaria flavescens", "tuleň obecný": "Phoca vitulina", "mrož lední": "Odobenus rosmarus", "velryba grónská": "Balaena mysticetus", "delfín obecný": "Tursiops truncatus", "kosatka dravá": "Orcinus orca", "slon africký": "Loxodonta africana", "slon indický": "Elephas maximus", "kůň domácí": "Equus ferus caballus", "zebra stepní": "Equus quagga", "tapír čabrakový": "Tapirus indicus", "osel domácí": "Equus asinus", "nosorožec tuponosý": "Ceratotherium simum", "prase divoké": "Sus scrofa", "hroch obojživelný": "Hippopotamus amphibius", "tur domácí": "cow Bos taurus", "ovce domácí": "Ovis aries sheep", "koza domácí": "Capra hircus goat", "srnec obecný": "Capreolus capreolus", "jelen evropský": "Cervus elaphus", "los evropský": "Alces alces", "velbloud jednohrbý": "Camelus dromedarius", "lama alpaka": "Vicugna pacos alpaca"}

const g: Record<string, string[]> = {
  "Vačnatci": ["koala medvídkovitý", "klokan rudý", "vačice opossum"],
  "Hmyzožravci": ["rejsek obecný", "krtek obecný", "ježek západní"],
  "Chudozubí": ["lenochod tříprstý", "mravenečník velký", "pásovec velký"],
  "Hlodavci": ["myš domácí", "křeček polní", "krysa obecná", "sysel polní", "veverka obecná", "bobr evropský"],
  "Zajícovci": ["zajíc polní", "králík divoký"],
  "Primáti – poloopice": ["lemur kata", "komba ušatá"],
  "Opice úzkonosé": ["gueréza angolská", "kočkodan obecný", "pavián"],
  "Lidoopi": ["gorila horská", "šimpanz učenlivý", "orangutan sumaterský"],
  "Šelmy – kočkovité": ["rys ostrovid", "lev pustinný", "kočka divoká", "tygr indický", "puma americká", "gepard královský"],
  "Šelmy – hyenovité": ["hyena skvrnitá"],
  "Šelmy – medvídkovité": ["mýval severní"],
  "Šelmy – lasicovité": ["lasice kolčava", "tchoř tmavý", "vydra říční", "jezevec lesní", "kuna skalní"],
  "Šelmy – ploutvonožci": ["lachtan jižní", "tuleň obecný", "mrož lední"],
  "Kytovci": ["velryba grónská", "delfín obecný", "kosatka dravá"],
  "Chobotnatci": ["slon africký", "slon indický"],
  "Lichokopytníci": ["kůň domácí", "zebra stepní", "tapír čabrakový", "osel domácí", "nosorožec tuponosý"],
  "Sudokopytníci – nepřežvýkavci": ["prase divoké", "hroch obojživelný"],
  "Sudokopytníci – přežvýkavci": ["tur domácí", "ovce domácí", "koza domácí", "srnec obecný", "jelen evropský", "los evropský"],
  "Sudokopytníci – mozolnatci": ["velbloud jednohrbý", "lama alpaka"],
}

export const SEED = {
  id: "seed-zivorodi",
  title: "Živorodí – savci",
  language: "cs",
  created: "2026-11-18T00:00:00.000Z",
  items: Object.entries(g).flatMap(([category, terms]) =>
    terms.map((term) => ({
      term,
      image: LATIN[term],
      category,
      fact: category === "Vačnatci" ? "Vačnatci nosí mláďata ve vaku." : "Placentálové – mládě se vyvíjí v těle matky (placenta).",
    })),
  ),
  tests: [
    { id: "seed-rychle", name: "Rychlé opakování", input: "buttons", level: "normal", count: 15, timed: false },
    { id: "seed-obrazky", name: "Poznej z fotky", input: "buttons", level: "hard", count: 15, timed: false, kinds: ["pictureTerm", "pictureCategory"] },
    { id: "seed-selmy-hlas", name: "Šelmy hlasem", input: "voice", level: "normal", count: 15, timed: false,
      categories: ["Šelmy – kočkovité", "Šelmy – hyenovité", "Šelmy – medvídkovité", "Šelmy – lasicovité", "Šelmy – ploutvonožci"] },
    { id: "seed-extra", name: "Extra těžký psaný na čas", input: "text", level: "extra", count: 20, timed: true },
  ] as Test[],
  questions: [
    { q: "Jak se jmenují savci, kteří nosí mláďata ve vaku?", answer: "Vačnatci", wrong: ["Placentálové", "Hlodavci", "Kytovci"] },
    { q: "Kam patří velryby, delfíni a kosatky?", answer: "Kytovci", wrong: ["Ryby", "Ploutvonožci", "Chobotnatci"] },
    { q: "Kolik hrbů má velbloud jednohrbý?", answer: "1", wrong: ["2", "3", "0"] },
    { q: "Kolik prstů má lenochod tříprstý na předních končetinách?", answer: "3", wrong: ["2", "4", "5"] },
  ],
}
