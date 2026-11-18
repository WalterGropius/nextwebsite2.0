import { NextRequest, NextResponse } from "next/server"

// POST /api/quiz — turns any study material (text, images, links) into a
// JSON "deck" the client renders and generates questions from procedurally.
// Uses the Vercel AI Gateway (AI_GATEWAY or AI_GATEWAY_API_KEY) with Gemini Flash.

export const runtime = "nodejs"
export const maxDuration = 60

const MODEL = "google/gemini-2.5-flash"

const SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    language: { type: "string", description: "BCP-47 code of the material, e.g. cs" },
    items: {
      type: "array",
      description: "Every learnable fact as term → category (+ optional short fact).",
      items: {
        type: "object",
        properties: {
          term: { type: "string" },
          category: { type: "string" },
          fact: { type: "string" },
          image: { type: "string", description: "Wikimedia Commons search query that finds a photo of exactly this term (scientific/English name for living things, landmark or object name). Empty string if a photo would not help identify it." },
        },
        required: ["term", "category", "fact", "image"],
      },
    },
    prompts: {
      type: "object",
      description: "Question templates in the material's language. {term} and {category} are placeholders.",
      properties: {
        toCategory: { type: "string", description: "e.g. 'Kam patří: {term}?' or 'What does {term} mean?'" },
        toTerm: { type: "string", description: "e.g. 'Co patří mezi {category}?' or 'Which word means {category}?'" },
        pictureTerm: { type: "string", description: "e.g. 'Co je na obrázku?'" },
        pictureCategory: { type: "string", description: "e.g. 'Kam patří zvíře na obrázku?'" },
      },
      required: ["toCategory", "toTerm", "pictureTerm", "pictureCategory"],
    },
    questions: {
      type: "array",
      description: "Extra multiple-choice questions not expressible as term→category.",
      items: {
        type: "object",
        properties: {
          q: { type: "string" },
          answer: { type: "string" },
          wrong: { type: "array", items: { type: "string" } },
        },
        required: ["q", "answer", "wrong"],
      },
    },
  },
  required: ["title", "language", "prompts", "items", "questions"],
}

async function linkText(url: string): Promise<string> {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(8000) })
    const html = await r.text()
    return html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 8000)
  } catch {
    return ""
  }
}

export async function POST(req: NextRequest) {
  const key = process.env.AI_GATEWAY_API_KEY || process.env.AI_GATEWAY
  if (!key) return NextResponse.json({ error: "no key" }, { status: 503 })
  const { text = "", images = [], links = [] } = await req.json()
  if (images.length > 12 || String(text).length > 20000) {
    return NextResponse.json({ error: "too much input" }, { status: 413 })
  }
  const linked = (await Promise.all((links as string[]).slice(0, 5).map(linkText))).join("\n\n")
  const content: unknown[] = [
    {
      type: "text",
      text:
        "You build study quizzes for a child. Extract every learnable fact from the material below " +
        "(text, photos of worksheets, web pages) into the JSON schema. Prefer items: term → category " +
        "(e.g. animal → its group, word → translation, date → event). Use the exact spelling and the " +
        "(prompts: write them in the language the learner reads, i.e. of the instructions/notes; Czech if unsure) " +
        "language of the material. Keep facts short and child friendly. Add 'questions' only for facts " +
        "that do not fit term→category, each with 3 plausible wrong answers. For every item that can be recognised from a picture (animals, plants, places, objects, artworks, people, flags…) give an 'image' search query; photos are fetched from Wikimedia Commons, never cropped from the uploaded material.\n\n" +
        `TEXT:\n${text}\n\nLINKED PAGES:\n${linked}`,
    },
    ...(images as string[]).map((url) => ({ type: "image_url", image_url: { url } })),
  ]
  const r = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content }],
      response_format: { type: "json_schema", json_schema: { name: "deck", schema: SCHEMA } },
    }),
  })
  if (!r.ok) return NextResponse.json({ error: await r.text() }, { status: 502 })
  const data = await r.json()
  try {
    const deck = JSON.parse(data.choices[0].message.content)
    return NextResponse.json(deck)
  } catch {
    return NextResponse.json({ error: "bad model output" }, { status: 502 })
  }
}
