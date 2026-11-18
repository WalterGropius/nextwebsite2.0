// Deck model shared by the page, the parser and the API.
// A deck is subject-agnostic: items relate a term to a category (animal → group,
// word → translation, year → event). Prompt templates carry the wording, so the
// same generator works in any language and for any subject.

export type Item = { term: string; category: string; fact?: string; image?: string }
export type Extra = { q: string; answer: string; wrong: string[] }
export type Prompts = { toCategory: string; toTerm: string; pictureTerm: string; pictureCategory: string }
export type Deck = {
  id: string; title: string; language?: string; created: string
  items: Item[]; questions: Extra[]; prompts?: Prompts; best?: number
}

export const DEFAULT_PROMPTS: Record<string, Prompts> = {
  cs: { toCategory: "Kam patří: {term}?", toTerm: "Co patří mezi {category}?", pictureTerm: "Co je na obrázku?", pictureCategory: "Kam patří, co je na obrázku?" },
  en: { toCategory: "Where does {term} belong?", toTerm: "Which one is {category}?", pictureTerm: "What is in the picture?", pictureCategory: "Where does the pictured thing belong?" },
}
export const promptsFor = (d: Deck): Prompts => ({ ...(DEFAULT_PROMPTS[d.language?.slice(0, 2) ?? "cs"] ?? DEFAULT_PROMPTS.cs), ...(d.prompts ?? {}) })
export const fill = (t: string, v: Record<string, string>) => t.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? "")

// Offline parser — builds a deck without AI from simple notes:
//   Hlodavci: myš, bobr, veverka        (group with a comma list)
//   Šelmy:                              (heading, then one term per line)
//   - rys
//   dog - pes / dog = pes / dog → pes   (term → answer pairs)
//   Q: Kolik hrbů má velbloud? | 1 | 2 | 3 | 0   (own question, first answer is right)
export function parseNotes(text: string): Pick<Deck, "items" | "questions" | "title"> {
  const items: Item[] = []; const questions: Extra[] = []
  let heading = ""; let title = ""
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, "").trim()
    if (!line) continue
    if (/^(q|otázka)\s*:/i.test(line)) {
      const [q, answer, ...wrong] = line.replace(/^[^:]*:/, "").split("|").map((s) => s.trim())
      if (q && answer && wrong.length) questions.push({ q, answer, wrong })
      continue
    }
    const pair = line.match(/^(.+?)\s+(?:[-–—=→]|->)\s+(.+)$/)
    if (pair) { items.push({ term: pair[1], category: pair[2], image: pair[1] }); continue }
    const group = line.match(/^([^:]+):\s*(.*)$/)
    if (group) {
      heading = group[1].trim()
      group[2].split(/[,;]/).map((s) => s.trim()).filter(Boolean).forEach((term) => items.push({ term, category: heading, image: term }))
      continue
    }
    if (heading) items.push({ term: line, category: heading, image: line })
    else if (!title) title = line
  }
  return { title: title || heading || "Kvíz", items, questions }
}

// Inverse of parseNotes, so any deck (also AI-made) can be edited as text.
export function deckToNotes(d: Deck): string {
  const groups = new Map<string, string[]>()
  d.items.forEach((i) => groups.set(i.category, [...(groups.get(i.category) ?? []), i.term]))
  const out = [d.title]
  groups.forEach((terms, cat) => out.push(terms.length > 1 ? `${cat}:\n${terms.map((t) => `- ${t}`).join("\n")}` : `${terms[0]} - ${cat}`))
  d.questions.forEach((q) => out.push(`Q: ${q.q} | ${q.answer} | ${q.wrong.join(" | ")}`))
  return out.join("\n")
}
