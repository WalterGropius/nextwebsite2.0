// Seed deck transcribed from the "Živorodí" worksheets.
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
      category,
      fact: category === "Vačnatci" ? "Vačnatci nosí mláďata ve vaku." : "Placentálové – mládě se vyvíjí v těle matky (placenta).",
    })),
  ),
  questions: [
    { q: "Jak se jmenují savci, kteří nosí mláďata ve vaku?", answer: "Vačnatci", wrong: ["Placentálové", "Hlodavci", "Kytovci"] },
    { q: "Kam patří velryby, delfíni a kosatky?", answer: "Kytovci", wrong: ["Ryby", "Ploutvonožci", "Chobotnatci"] },
    { q: "Kolik hrbů má velbloud jednohrbý?", answer: "1", wrong: ["2", "3", "0"] },
    { q: "Kolik prstů má lenochod tříprstý na předních končetinách?", answer: "3", wrong: ["2", "4", "5"] },
  ],
}
