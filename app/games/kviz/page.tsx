"use client"

import { useEffect, useMemo, useState } from "react"
import { SEED } from "./seed"
import { type Item, type Deck, promptsFor, fill, parseNotes, deckToNotes } from "./deck"
import { findPic, type Pic } from "./images"
import { QuestionView, type QSpec } from "./render"

// Kvíz — paste anything (text, photos, links), get a JSON deck back from
// /api/quiz, and play procedurally generated questions. Decks and scores
// persist in localStorage; the library lists past decks.

type Q = { prompt: string; answer: string; options: string[]; note?: string; image?: string }

const KEY = "kviz-library-v2"
const shuffle = <T,>(a: T[]) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }
const uniq = (a: string[]) => Array.from(new Set(a))
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function load(): Deck[] {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || "null")
    if (Array.isArray(d)) return d
    const old = JSON.parse(localStorage.getItem("kviz-library-v1") || "[]") as Deck[] // keep decks from v1
    return [SEED, ...old.filter((x) => x.id !== SEED.id)]
  } catch { return [SEED] }
}
function save(d: Deck[]) { try { localStorage.setItem(KEY, JSON.stringify(d)) } catch {} }

// Procedural generator: term→category in both directions, plus extra questions.
function generate(deck: Deck, n: number): Q[] {
  const cats = uniq(deck.items.map((i) => i.category))
  const P = promptsFor(deck)
  const out: Q[] = []
  for (const it of deck.items) {
    if (cats.length >= 2) {
      out.push({
        prompt: fill(P.toCategory, { term: cap(it.term) }), answer: it.category, note: it.fact,
        options: shuffle([it.category, ...shuffle(cats.filter((c) => c !== it.category)).slice(0, 3)]),
      })
      const others = deck.items.filter((o) => o.category !== it.category).map((o) => o.term)
      if (others.length >= 3) out.push({
        prompt: fill(P.toTerm, { category: it.category }), answer: it.term, note: it.fact,
        options: shuffle([it.term, ...shuffle(uniq(others)).slice(0, 3)]),
      })
    }
  }
  // picture questions: identify the thing, and its group, from a photo
  const terms = uniq(deck.items.map((o) => o.term))
  for (const it of deck.items) {
    if (!it.image) continue
    if (terms.length >= 4) out.push({
      prompt: P.pictureTerm, answer: it.term, note: it.fact, image: it.image,
      options: shuffle([it.term, ...shuffle(terms.filter((t) => t !== it.term)).slice(0, 3)]),
    })
    if (cats.length >= 2) out.push({
      prompt: P.pictureCategory, answer: it.category, note: `${cap(it.term)}`, image: it.image,
      options: shuffle([it.category, ...shuffle(cats.filter((c) => c !== it.category)).slice(0, 3)]),
    })
  }
  for (const e of deck.questions || []) out.push({ prompt: e.q, answer: e.answer, options: shuffle([e.answer, ...e.wrong.slice(0, 3)]) })
  return shuffle(out).slice(0, n)
}

function toSpec(q: Q, pic: Pic | null, picked: string | null): QSpec {
  const el: QSpec["elements"] = {}
  const kids: string[] = []
  if (pic) { el.pic = { type: "Picture", props: { src: pic.url, href: pic.page, credit: `Wikimedia Commons · ${pic.license}${pic.author ? " · " + pic.author : ""}` } }; kids.push("pic") }
  el.prompt = { type: "Prompt", props: { text: q.prompt } }; kids.push("prompt")
  const opts = q.options.map((o, k) => {
    const state = !picked ? "idle" : o === q.answer ? "right" : o === picked ? "wrong" : "dim"
    el[`o${k}`] = { type: "Option", props: { label: cap(o), state }, on: { press: { action: "choose", params: { value: o } } } }
    return `o${k}`
  })
  el.opts = { type: "Options", props: {}, children: opts }; kids.push("opts")
  el.root = { type: "Stack", props: {}, children: kids }
  return { root: "root", elements: el }
}

const fileToDataUrl = (f: File) => new Promise<string>((res, rej) => {
  const img = new Image(); const url = URL.createObjectURL(f)
  img.onload = () => { // downscale so uploads stay small
    const s = Math.min(1, 1280 / Math.max(img.width, img.height)); const c = document.createElement("canvas")
    c.width = img.width * s; c.height = img.height * s; c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height)
    URL.revokeObjectURL(url); res(c.toDataURL("image/jpeg", 0.7))
  }
  img.onerror = rej; img.src = url
})

export default function Kviz() {
  const [lib, setLib] = useState<Deck[]>([])
  const [view, setView] = useState<"home" | "play" | "done">("home")
  const [deck, setDeck] = useState<Deck | null>(null)
  const [qs, setQs] = useState<Q[]>([])
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [wrongs, setWrongs] = useState<Q[]>([])
  const [count, setCount] = useState(15)
  const [text, setText] = useState("")
  const [links, setLinks] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")
  const [pic, setPic] = useState<Pic | null>(null)
  const [picLoading, setPicLoading] = useState(false)

  useEffect(() => setLib(load()), [])
  const update = (d: Deck[]) => { setLib(d); save(d) }

  const start = (d: Deck, list?: Q[]) => {
    setDeck(d); setQs(list ?? generate(d, count)); setI(0); setScore(0); setPicked(null); setWrongs([]); setView("play")
  }

  const choose = (o: string) => {
    if (picked) return
    setPicked(o)
    const q = qs[i]
    if (o === q.answer) setScore((s) => s + 1); else setWrongs((w) => [...w, q])
  }
  const next = () => {
    if (i + 1 < qs.length) { setI(i + 1); setPicked(null); return }
    const pct = Math.round((score / qs.length) * 100)
    if (deck) update(lib.map((d) => (d.id === deck.id ? { ...d, best: Math.max(d.best ?? 0, pct) } : d)))
    setView("done")
  }

  const save1 = (d: Omit<Deck, "id" | "created">) => {
    const deck: Deck = { ...d, id: crypto.randomUUID(), created: new Date().toISOString() }
    if (!deck.items.length && !deck.questions.length) throw new Error("Z materiálu se nepodařilo nic vytáhnout.")
    update([deck, ...lib]); setText(""); setLinks(""); setFiles([]); start(deck)
  }
  const offline = () => {
    setErr("")
    try { save1({ language: "cs", ...parseNotes(text) }) } catch (e) { setErr((e as Error).message) }
  }

  const create = async () => {
    setBusy(true); setErr("")
    try {
      const images = await Promise.all(files.slice(0, 8).map(fileToDataUrl))
      const r = await fetch("/api/quiz", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, images, links: links.split(/\s+/).filter((l) => /^https?:\/\//.test(l)) }),
      }).catch(() => null)
      if (!r || !r.ok) {
        // AI unavailable: text-only material can still be parsed locally
        if (text.trim() && !files.length) return offline()
        if (r?.status === 429 || r?.status === 413) throw new Error((await r.json().catch(() => ({}))).error ?? "Limit")
        throw new Error(r?.status === 503 ? "AI teď není k dispozici – napiš poznámky jako text a použij „Bez AI“." : `Chyba ${r?.status ?? "sítě"}`)
      }
      const d = await r.json()
      save1({
        title: d.title || "Kvíz", language: d.language, prompts: d.prompts, questions: d.questions || [],
        items: (d.items || []).map((x: Item) => ({ ...x, image: x.image || undefined })),
      })
    } catch (e) { setErr(String((e as Error).message).slice(0, 300)) } finally { setBusy(false) }
  }

  const exportDeck = (d: Deck) => {
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(d, null, 2)], { type: "application/json" }))
    a.download = `${d.title}.json`; a.click()
  }
  const importDeck = async (f: File) => {
    try { const d = JSON.parse(await f.text()); update([{ ...d, id: crypto.randomUUID() }, ...lib]) } catch { setErr("Neplatný JSON") }
  }

  const q = qs[i]
  useEffect(() => {
    setPic(null)
    if (!q?.image) return
    let live = true; setPicLoading(true)
    findPic(q.image, deck?.language?.slice(0, 2)).then((p) => {
      if (!live) return
      // no free photo found: drop this question rather than show a broken one
      if (!p) { const rest = qs.filter((_, k) => k !== i); if (rest.length > i) setQs(rest); else { setQs(rest); setView("done") } }
      setPic(p); setPicLoading(false)
    })
    // prefetch next picture
    const n = qs[i + 1]; if (n?.image) findPic(n.image, deck?.language?.slice(0, 2))
    return () => { live = false }
  }, [q, qs, i, deck])
  const shown = q
  const total = useMemo(() => deck ? generate(deck, 9999).length : 0, [deck])

  const btn = "rounded-xl px-4 py-3 font-semibold transition active:scale-95"
  return (
    <main className="min-h-screen bg-amber-50 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-1 text-3xl font-black">🐾 Kvíz</h1>
        <p className="mb-6 text-slate-600">Vlož cokoli – text, fotky sešitu, odkazy – a vznikne kvíz.</p>

        {view === "home" && (
          <>
            <section className="mb-8 rounded-2xl bg-white p-4 shadow">
              <h2 className="mb-3 text-lg font-bold">Nový kvíz</h2>
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder="Text k učení…"
                className="mb-2 w-full rounded-lg border p-2" />
              <input value={links} onChange={(e) => setLinks(e.target.value)} placeholder="Odkazy (oddělené mezerou)"
                className="mb-2 w-full rounded-lg border p-2" />
              <label className="mb-3 block text-sm">
                Fotky: <input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
                {files.length > 0 && <span className="ml-2 text-slate-500">{files.length} vybráno</span>}
              </label>
              <button disabled={busy || (!text && !links && !files.length)} onClick={create}
                className={`${btn} w-full bg-emerald-500 text-white disabled:opacity-40`}>
                {busy ? "Vytvářím…" : "Vytvořit kvíz ✨"}
              </button>
              <button disabled={busy || !text.trim()} onClick={offline} className="mt-2 w-full text-sm text-slate-500 underline disabled:opacity-40">
                Bez AI – z poznámek
              </button>
              <details className="mt-2 text-xs text-slate-500">
                <summary>Jak psát poznámky bez AI</summary>
                <pre className="mt-1 whitespace-pre-wrap">{`Hlodavci: myš, bobr, veverka
Šelmy:
- rys
- lev
dog - pes
Q: Kolik hrbů má velbloud? | 1 | 2 | 3`}</pre>
              </details>
              {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold">Knihovna</h2>
                <label className="text-sm">Otázek:{" "}
                  <select value={count} onChange={(e) => setCount(+e.target.value)} className="rounded border">
                    {[10, 15, 25, 50, 999].map((n) => <option key={n} value={n}>{n === 999 ? "vše" : n}</option>)}
                  </select>
                </label>
              </div>
              <ul className="space-y-2">
                {lib.map((d) => (
                  <li key={d.id} className="flex items-center gap-2 rounded-xl bg-white p-3 shadow">
                    <button onClick={() => start(d)} className="flex-1 text-left">
                      <div className="font-semibold">{d.title}</div>
                      <div className="text-xs text-slate-500">
                        {d.items.length} pojmů · {new Date(d.created).toLocaleDateString("cs")}
                        {d.best != null && ` · nejlépe ${d.best} %`}
                      </div>
                    </button>
                    <button title="Upravit jako poznámky" onClick={() => { setText(deckToNotes(d)); window.scrollTo({ top: 0, behavior: "smooth" }) }} className="px-2">✏️</button>
                    <button title="Stáhnout JSON" onClick={() => exportDeck(d)} className="px-2">⬇️</button>
                    <button title="Smazat" onClick={() => confirm(`Smazat „${d.title}“?`) && update(lib.filter((x) => x.id !== d.id))} className="px-2">🗑️</button>
                  </li>
                ))}
              </ul>
              <label className="mt-3 block text-sm text-slate-500">Nahrát JSON kvíz:{" "}
                <input type="file" accept="application/json" onChange={(e) => e.target.files?.[0] && importDeck(e.target.files[0])} />
              </label>
            </section>
          </>
        )}

        {view === "play" && q && (
          <section className="rounded-2xl bg-white p-5 shadow">
            <div className="mb-2 flex justify-between text-sm text-slate-500">
              <span>{i + 1} / {qs.length}</span><span>✅ {score}</span>
            </div>
            <div className="mb-4 h-2 rounded bg-slate-100"><div className="h-2 rounded bg-emerald-400" style={{ width: `${(i / qs.length) * 100}%` }} /></div>
            {q.image && picLoading
              ? <div className="h-72 animate-pulse rounded-xl bg-slate-100" />
              : shown && <QuestionView spec={toSpec(shown, q.image ? pic : null, picked)} onChoose={choose} />}
            {picked && (
              <div className="mt-4">
                <p className="mb-3">{picked === q.answer ? "🎉 Správně!" : `Správně je: ${cap(q.answer)}`}{q.note && <span className="block text-sm text-slate-500">{q.note}</span>}</p>
                <button onClick={next} className={`${btn} w-full bg-slate-900 text-white`}>{i + 1 < qs.length ? "Další →" : "Výsledek"}</button>
              </div>
            )}
            <button onClick={() => setView("home")} className="mt-4 text-sm text-slate-500">← zpět</button>
          </section>
        )}

        {view === "done" && deck && (
          <section className="rounded-2xl bg-white p-5 text-center shadow">
            <div className="text-6xl">{score / qs.length >= 0.9 ? "🏆" : score / qs.length >= 0.6 ? "👍" : "💪"}</div>
            <h2 className="my-2 text-3xl font-black">{score} / {qs.length}</h2>
            <p className="mb-4 text-slate-500">Celkem lze vygenerovat {total} otázek – každé kolo je jiné.</p>
            {wrongs.length > 0 && (
              <ul className="mb-4 text-left text-sm">
                {wrongs.map((w, k) => <li key={k}>❌ {w.prompt} → <b>{cap(w.answer)}</b></li>)}
              </ul>
            )}
            <div className="grid gap-2">
              {wrongs.length > 0 && <button onClick={() => start(deck, shuffle(wrongs).map((w) => ({ ...w, options: shuffle(w.options) })))} className={`${btn} bg-amber-400`}>Procvičit chyby</button>}
              <button onClick={() => start(deck)} className={`${btn} bg-emerald-500 text-white`}>Nové kolo</button>
              <button onClick={() => setView("home")} className={`${btn} bg-slate-100`}>Knihovna</button>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
