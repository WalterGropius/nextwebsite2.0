"use client"

import { useEffect, useMemo, useState } from "react"
import { SEED } from "./seed"

// Kvíz — paste anything (text, photos, links), get a JSON deck back from
// /api/quiz, and play procedurally generated questions. Decks and scores
// persist in localStorage; the library lists past decks.

type Item = { term: string; category: string; fact?: string }
type Extra = { q: string; answer: string; wrong: string[] }
type Deck = { id: string; title: string; language?: string; created: string; items: Item[]; questions: Extra[]; best?: number }
type Q = { prompt: string; answer: string; options: string[]; note?: string }

const KEY = "kviz-library-v1"
const shuffle = <T,>(a: T[]) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }
const uniq = (a: string[]) => Array.from(new Set(a))
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function load(): Deck[] {
  try { const d = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(d) && d.length ? d : [SEED] } catch { return [SEED] }
}
function save(d: Deck[]) { try { localStorage.setItem(KEY, JSON.stringify(d)) } catch {} }

// Procedural generator: term→category in both directions, plus extra questions.
function generate(deck: Deck, n: number): Q[] {
  const cats = uniq(deck.items.map((i) => i.category))
  const out: Q[] = []
  for (const it of deck.items) {
    if (cats.length >= 2) {
      out.push({
        prompt: `Kam patří: ${cap(it.term)}?`, answer: it.category, note: it.fact,
        options: shuffle([it.category, ...shuffle(cats.filter((c) => c !== it.category)).slice(0, 3)]),
      })
      const others = deck.items.filter((o) => o.category !== it.category).map((o) => o.term)
      if (others.length >= 3) out.push({
        prompt: `Co patří mezi ${it.category}?`, answer: it.term, note: it.fact,
        options: shuffle([it.term, ...shuffle(uniq(others)).slice(0, 3)]),
      })
    }
  }
  for (const e of deck.questions || []) out.push({ prompt: e.q, answer: e.answer, options: shuffle([e.answer, ...e.wrong.slice(0, 3)]) })
  return shuffle(out).slice(0, n)
}

const fileToDataUrl = (f: File) => new Promise<string>((res, rej) => {
  const img = new Image(); const url = URL.createObjectURL(f)
  img.onload = () => { // downscale so uploads stay small
    const s = Math.min(1, 1600 / Math.max(img.width, img.height)); const c = document.createElement("canvas")
    c.width = img.width * s; c.height = img.height * s; c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height)
    URL.revokeObjectURL(url); res(c.toDataURL("image/jpeg", 0.8))
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

  const create = async () => {
    setBusy(true); setErr("")
    try {
      const images = await Promise.all(files.map(fileToDataUrl))
      const r = await fetch("/api/quiz", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, images, links: links.split(/\s+/).filter((l) => /^https?:\/\//.test(l)) }),
      })
      if (!r.ok) throw new Error(await r.text())
      const d = await r.json()
      const deck: Deck = { id: crypto.randomUUID(), created: new Date().toISOString(), title: d.title || "Kvíz", language: d.language, items: d.items || [], questions: d.questions || [] }
      if (!deck.items.length && !deck.questions.length) throw new Error("Z materiálu se nepodařilo nic vytáhnout.")
      update([deck, ...lib]); setText(""); setLinks(""); setFiles([]); start(deck)
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
            <h2 className="mb-4 text-2xl font-bold">{q.prompt}</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {q.options.map((o) => {
                const state = !picked ? "bg-sky-100 hover:bg-sky-200" : o === q.answer ? "bg-emerald-400 text-white" : o === picked ? "bg-red-400 text-white" : "bg-slate-100 opacity-60"
                return <button key={o} onClick={() => choose(o)} className={`${btn} ${state}`}>{cap(o)}</button>
              })}
            </div>
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
