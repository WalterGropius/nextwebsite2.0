"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { SEED } from "./seed"
import { findPic, type Pic } from "./images"
import { QuestionView, type QSpec } from "./render"
import { useSpeech } from "./voice"
import { type Q, generate, judge, describeTest, testLabel, shuffle, uniq, cap, fmt } from "./quiz"
import {
  type Item, type Deck, type Level, type Run, type Test, type Input, type Kind,
  LEVELS, INPUTS, KINDS, QUICK_ID, parseNotes, deckToNotes,
} from "./deck"

// Kvíz — two layers:
//  • a deck is the material (text, photos, links → JSON items via /api/quiz),
//  • a test is a saved preset on a deck: how she answers (buttons, typing,
//    voice), difficulty, length, timer, which groups and question types.
// She can describe a test in a sentence, typed or spoken, and it becomes a preset.
// Everything persists in localStorage.

const KEY = "kviz-library-v2"
const btn = "rounded-xl px-4 py-3 font-semibold transition active:scale-95"

function load(): Deck[] {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || "null")
    if (Array.isArray(d)) return d.map((x: Deck) => (x.id === SEED.id && !x.tests ? { ...x, tests: SEED.tests } : x))
    const old = JSON.parse(localStorage.getItem("kviz-library-v1") || "[]") as Deck[]
    return [SEED, ...old.filter((x) => x.id !== SEED.id)]
  } catch { return [SEED] }
}
function save(d: Deck[]) { try { localStorage.setItem(KEY, JSON.stringify(d)) } catch {} }

function toSpec(q: Q, pic: Pic | null, picked: string | null, showOptions: boolean): QSpec {
  const el: QSpec["elements"] = {}
  const kids: string[] = []
  if (pic) { el.pic = { type: "Picture", props: { src: pic.url, href: pic.page, credit: `Wikimedia Commons · ${pic.license}${pic.author ? " · " + pic.author : ""}` } }; kids.push("pic") }
  el.prompt = { type: "Prompt", props: { text: q.prompt } }; kids.push("prompt")
  if (showOptions) {
    const opts = q.options.map((o, k) => {
      const state = !picked ? "idle" : o === q.answer ? "right" : o === picked ? "wrong" : "dim"
      el[`o${k}`] = { type: "Option", props: { label: cap(o), state }, on: { press: { action: "choose", params: { value: o } } } }
      return `o${k}`
    })
    el.opts = { type: "Options", props: {}, children: opts }; kids.push("opts")
  }
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

const pref = <T,>(k: string, v?: T): T | undefined => {
  try { if (v === undefined) { const r = localStorage.getItem(k); return r ? JSON.parse(r) : undefined } localStorage.setItem(k, JSON.stringify(v)) } catch {}
  return v
}

// ---- small pieces ---------------------------------------------------------

function Mic({ speech, onText, label = "🎤" }: { speech: ReturnType<typeof useSpeech>; onText: (t: string, alts: string[]) => void; label?: string }) {
  if (!speech.supported) return null
  return (
    <button type="button" onClick={() => (speech.listening ? speech.stop() : speech.listen(onText))}
      className={`${btn} ${speech.listening ? "animate-pulse bg-red-500 text-white" : "bg-rose-100"}`} title="Mluvit">
      {speech.listening ? "● poslouchám…" : label}
    </button>
  )
}

function TestEditor({ deck, initial, onSave, onCancel, speech }: {
  deck: Deck; initial?: Test; onSave: (t: Test) => void; onCancel: () => void; speech: ReturnType<typeof useSpeech>
}) {
  const cats = useMemo(() => uniq(deck.items.map((i) => i.category)), [deck])
  const [t, setT] = useState<Test>(initial ?? { id: crypto.randomUUID(), name: "", input: "buttons", level: "normal", count: 15, timed: false })
  const [say, setSay] = useState("")
  const [busy, setBusy] = useState(false)
  const set = (p: Partial<Test>) => setT((x) => ({ ...x, ...p }))
  const toggle = <K,>(arr: K[] | undefined, v: K) => { const a = arr ?? []; const n = a.includes(v) ? a.filter((x) => x !== v) : [...a, v]; return n.length ? n : undefined }

  // sentence → preset: AI when available (understands "bez koček", "jen ty co žijou ve vodě"), local rules otherwise
  const fromSentence = async (sentence: string) => {
    if (!sentence.trim()) return
    setBusy(true)
    const local = describeTest(sentence, cats)
    try {
      const r = await fetch("/api/quiz", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode: "test", request: sentence, categories: cats, kinds: Object.keys(KINDS) }),
      })
      if (!r.ok) throw new Error()
      const d = await r.json()
      const okCats = (d.categories ?? []).filter((c: string) => cats.includes(c))
      const okKinds = (d.kinds ?? []).filter((k: string) => k in KINDS)
      set({
        name: d.name || local.name, input: (d.input in INPUTS ? d.input : local.input) as Input,
        level: (d.level in LEVELS ? d.level : local.level) as Level, count: Math.min(Math.max(+d.count || local.count, 1), 999), timed: !!d.timed,
        categories: okCats.length && okCats.length < cats.length ? okCats : undefined, kinds: okKinds.length ? okKinds : undefined,
      })
    } catch { set(local) } finally { setBusy(false) }
  }

  const available = generate(deck, { ...t, count: 9999 }).length
  return (
    <div className="mt-2 space-y-2 rounded-xl border-2 border-dashed border-emerald-200 p-3 text-sm">
      <div className="flex gap-2">
        <input value={say} onChange={(e) => setSay(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fromSentence(say)}
          placeholder="Popiš test: „jen šelmy, hlasem, 20 otázek, na čas“" className="min-w-0 flex-1 rounded-lg border p-2" />
        <Mic speech={speech} onText={(x) => { setSay(x); fromSentence(x) }} />
        <button onClick={() => fromSentence(say)} disabled={busy || !say.trim()} className={`${btn} bg-emerald-100 disabled:opacity-40`}>{busy ? "…" : "✨"}</button>
      </div>
      <input value={t.name} onChange={(e) => set({ name: e.target.value })} placeholder="Název testu" className="w-full rounded-lg border p-2 font-semibold" />
      <div className="flex flex-wrap gap-2">
        <select value={t.input} onChange={(e) => set({ input: e.target.value as Input })} className="rounded border p-1">
          {(Object.keys(INPUTS) as Input[]).map((k) => <option key={k} value={k}>{INPUTS[k]}</option>)}
        </select>
        <select value={t.level} onChange={(e) => set({ level: e.target.value as Level })} className="rounded border p-1">
          {(Object.keys(LEVELS) as Level[]).map((k) => <option key={k} value={k}>{LEVELS[k].label}</option>)}
        </select>
        <select value={t.count} onChange={(e) => set({ count: +e.target.value })} className="rounded border p-1">
          {Array.from(new Set([5, 10, 15, 20, 30, 50, 999, t.count])).sort((a, b) => a - b).map((n) => <option key={n} value={n}>{n >= 999 ? "vše" : `${n} otázek`}</option>)}
        </select>
        <label className="flex items-center gap-1"><input type="checkbox" checked={t.timed} onChange={(e) => set({ timed: e.target.checked })} />⏱ na čas</label>
      </div>
      <div>
        <div className="text-xs text-slate-500">Skupiny (nic = všechny)</div>
        <div className="flex flex-wrap gap-1">
          {cats.map((c) => <button key={c} onClick={() => set({ categories: toggle(t.categories, c) })}
            className={`rounded-full px-2 py-0.5 text-xs ${t.categories?.includes(c) ? "bg-emerald-500 text-white" : "bg-slate-100"}`}>{c}</button>)}
        </div>
      </div>
      <div>
        <div className="text-xs text-slate-500">Typy otázek (nic = všechny)</div>
        <div className="flex flex-wrap gap-1">
          {(Object.keys(KINDS) as Kind[]).map((k) => <button key={k} onClick={() => set({ kinds: toggle(t.kinds, k) })}
            className={`rounded-full px-2 py-0.5 text-xs ${t.kinds?.includes(k) ? "bg-sky-500 text-white" : "bg-slate-100"}`}>{KINDS[k]}</button>)}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="flex-1 text-xs text-slate-500">{available} možných otázek</span>
        <button onClick={onCancel} className="px-3 py-2 text-slate-500">Zrušit</button>
        <button disabled={!available} onClick={() => onSave({ ...t, name: t.name.trim() || testLabel(t) })} className={`${btn} bg-emerald-500 text-white disabled:opacity-40`}>Uložit test</button>
      </div>
    </div>
  )
}

// ---- page -------------------------------------------------------------------

export default function Kviz() {
  const [lib, setLib] = useState<Deck[]>([])
  const [view, setView] = useState<"home" | "play" | "done">("home")
  const [deck, setDeck] = useState<Deck | null>(null)
  const [test, setTest] = useState<Test | null>(null)
  const [qs, setQs] = useState<Q[]>([])
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [almost, setAlmost] = useState(false)
  const [score, setScore] = useState(0)
  const [wrongs, setWrongs] = useState<Q[]>([])
  const [quick, setQuickS] = useState<Test>({ id: QUICK_ID, name: "Rychlý test", input: "buttons", level: "normal", count: 15, timed: false })
  const [text, setText] = useState("")
  const [links, setLinks] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [focus, setFocus] = useState("")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")
  const [pic, setPic] = useState<Pic | null>(null)
  const [picLoading, setPicLoading] = useState(false)
  const [typedVal, setTypedVal] = useState("")
  const [t0, setT0] = useState(0)
  const [now, setNow] = useState(0)
  const [lastRun, setLastRun] = useState<Run | null>(null)
  const [editing, setEditing] = useState<{ deckId: string; test?: Test } | null>(null)
  const speech = useSpeech(deck?.language?.startsWith("en") ? "en-US" : "cs-CZ")
  const answerRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setLib(load()); const q = pref<Test>("kviz-quick"); if (q) setQuickS({ ...q, id: QUICK_ID, name: "Rychlý test" }) }, [])
  const setQuick = (p: Partial<Test>) => setQuickS((x) => pref("kviz-quick", { ...x, ...p })!)
  const update = (d: Deck[]) => { setLib(d); save(d) }
  const patchDeck = (id: string, f: (d: Deck) => Deck) => update(lib.map((d) => (d.id === id ? f(d) : d)))

  useEffect(() => { if (view !== "play" || !test?.timed) return; const id = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(id) }, [view, test])

  const start = (d: Deck, t: Test, list?: Q[]) => {
    setDeck(d); setTest(t); setQs(list ?? generate(d, t)); setI(0); setScore(0); setPicked(null); setAlmost(false); setWrongs([]); setTypedVal("")
    setT0(Date.now()); setNow(Date.now()); setView("play")
  }

  const choose = (o: string) => {
    if (picked) return
    setPicked(o)
    const q = qs[i]
    if (o === q.answer) setScore((s) => s + 1); else setWrongs((w) => [...w, q])
  }
  // typed or spoken answer; speech gives several guesses, any match counts
  const answer = (given: string, alts: string[] = []) => {
    if (picked || !test || !given.trim()) return
    const tries = [given, ...alts].map((g) => judge(g, qs[i], test.input, test.level))
    const hit = tries.find((r) => r.ok) ?? tries[0]
    setAlmost(hit.almost); choose(hit.value)
  }
  const next = () => {
    if (i + 1 < qs.length) { setI(i + 1); setPicked(null); setAlmost(false); setTypedVal(""); return }
    if (!deck || !test) return
    const pct = Math.round((score / qs.length) * 100)
    const run: Run = {
      at: new Date().toISOString(), score, total: qs.length, ms: test.timed ? Date.now() - t0 : null, level: test.level, input: test.input,
      testId: test.id === QUICK_ID ? `${QUICK_ID}:${test.input}:${test.level}` : test.id,
    }
    setLastRun(run)
    patchDeck(deck.id, (d) => ({ ...d, best: Math.max(d.best ?? 0, pct), history: [...(d.history ?? []), run].slice(-200) }))
    setView("done")
  }

  const q = qs[i]
  const ready = view === "play" && !!q && !picked && !(q.image && picLoading)
  useEffect(() => { if (ready && test?.input !== "buttons") answerRef.current?.focus() }, [ready, test, i])

  const save1 = (d: Omit<Deck, "id" | "created">) => {
    const nd: Deck = { ...d, id: crypto.randomUUID(), created: new Date().toISOString() }
    if (!nd.items.length && !nd.questions.length) throw new Error("Z materiálu se nepodařilo nic vytáhnout.")
    update([nd, ...lib]); setText(""); setLinks(""); setFiles([]); setFocus(""); start(nd, quick)
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
        body: JSON.stringify({ text, images, focus, difficulty: quick.level, links: links.split(/\s+/).filter((l) => /^https?:\/\//.test(l)) }),
      }).catch(() => null)
      if (!r || !r.ok) {
        if (text.trim() && !files.length) return offline() // AI unavailable: parse notes locally
        if (r?.status === 429 || r?.status === 413) throw new Error((await r.json().catch(() => ({}))).error ?? "Limit")
        throw new Error(r?.status === 503 ? "AI teď není k dispozici – napiš poznámky jako text a použij „Bez AI“." : `Chyba ${r?.status ?? "sítě"}`)
      }
      const d = await r.json()
      save1({
        title: d.title || "Kvíz", language: d.language, focus: focus || undefined, prompts: d.prompts, questions: d.questions || [],
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

  // picture lookup per question; no free photo → swap in an unused text question
  useEffect(() => {
    setPic(null)
    if (!q?.image || !deck || !test) return
    let live = true; setPicLoading(true)
    const lang = deck.language?.slice(0, 2)
    findPic(q.image, lang).then((p) => {
      if (!live) return
      if (!p) {
        const used = new Set(qs.map((x) => x.prompt + "|" + x.answer))
        const sub = generate(deck, { ...test, count: 9999 }).find((x) => !x.image && !used.has(x.prompt + "|" + x.answer))
        if (sub) setQs(qs.map((x, k) => (k === i ? sub : x)))
        else { const rest = qs.filter((_, k) => k !== i); setQs(rest); if (rest.length <= i) setView("done") }
      }
      setPic(p); setPicLoading(false)
    })
    const n = qs[i + 1]; if (n?.image) findPic(n.image, lang)
    return () => { live = false }
  }, [q, qs, i, deck, test])

  const recordOf = (d: Deck, id: string) => {
    const t = (d.history ?? []).filter((r) => r.testId === id && r.ms && r.score === r.total)
    return t.length ? fmt(Math.min(...t.map((r) => r.ms!))) : null
  }

  return (
    <main className="min-h-screen bg-amber-50 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-1 text-3xl font-black">🐾 Kvíz</h1>
        <p className="mb-6 text-slate-600">Vlož cokoli – text, fotky sešitu, odkazy – a vznikne kvíz. Nad ním si ulož testy.</p>

        {view === "home" && (
          <>
            <section className="mb-8 rounded-2xl bg-white p-4 shadow">
              <h2 className="mb-3 text-lg font-bold">Nová látka</h2>
              <div className="mb-2 flex gap-2">
                <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder="Text k učení… (nebo nadiktuj 🎤)"
                  className="min-w-0 flex-1 rounded-lg border p-2" />
                <div className="self-start"><Mic speech={speech} onText={(x) => setText((v) => (v ? v + "\n" : "") + x)} /></div>
              </div>
              <input value={links} onChange={(e) => setLinks(e.target.value)} placeholder="Odkazy (oddělené mezerou)" className="mb-2 w-full rounded-lg border p-2" />
              <input value={focus} onChange={(e) => setFocus(e.target.value)} maxLength={300}
                placeholder="Na co se zaměřit? (nepovinné – např. „jen šelmy, test je v pátek“)" className="mb-2 w-full rounded-lg border p-2" />
              <label className="mb-3 block text-sm">
                Fotky: <input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
                {files.length > 0 && <span className="ml-2 text-slate-500">{files.length} vybráno</span>}
              </label>
              <button disabled={busy || (!text && !links && !files.length)} onClick={create} className={`${btn} w-full bg-emerald-500 text-white disabled:opacity-40`}>
                {busy ? "Vytvářím…" : "Vytvořit kvíz ✨"}
              </button>
              <button disabled={busy || !text.trim()} onClick={offline} className="mt-2 w-full text-sm text-slate-500 underline disabled:opacity-40">Bez AI – z poznámek</button>
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
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-bold">Knihovna</h2>
                <div className="flex flex-wrap items-center gap-1 text-sm" title="Nastavení pro ▶ rychlý test">
                  <span className="text-slate-500">▶ rychlý:</span>
                  <select value={quick.input} onChange={(e) => setQuick({ input: e.target.value as Input })} className="rounded border">
                    {(Object.keys(INPUTS) as Input[]).map((k) => <option key={k} value={k}>{INPUTS[k]}</option>)}
                  </select>
                  <select value={quick.level} onChange={(e) => setQuick({ level: e.target.value as Level })} className="rounded border">
                    {(Object.keys(LEVELS) as Level[]).map((l) => <option key={l} value={l}>{LEVELS[l].label}</option>)}
                  </select>
                  <select value={quick.count} onChange={(e) => setQuick({ count: +e.target.value })} className="rounded border">
                    {[10, 15, 25, 50, 999].map((n) => <option key={n} value={n}>{n === 999 ? "vše" : n}</option>)}
                  </select>
                  <label><input type="checkbox" checked={quick.timed} onChange={(e) => setQuick({ timed: e.target.checked })} />⏱</label>
                </div>
              </div>
              <ul className="space-y-3">
                {lib.map((d) => (
                  <li key={d.id} className="rounded-xl bg-white p-3 shadow">
                    <div className="flex items-center gap-2">
                      <button onClick={() => start(d, quick)} className="flex-1 text-left">
                        <div className="font-semibold">▶ {d.title}</div>
                        <div className="text-xs text-slate-500">
                          {d.items.length} pojmů · {new Date(d.created).toLocaleDateString("cs")}{d.best != null && ` · nejlépe ${d.best} %`}
                        </div>
                      </button>
                      <button title="Upravit jako poznámky" onClick={() => { setText(deckToNotes(d)); window.scrollTo({ top: 0, behavior: "smooth" }) }} className="px-1">✏️</button>
                      <button title="Stáhnout JSON" onClick={() => exportDeck(d)} className="px-1">⬇️</button>
                      <button title="Smazat" onClick={() => confirm(`Smazat „${d.title}“?`) && update(lib.filter((x) => x.id !== d.id))} className="px-1">🗑️</button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(d.tests ?? []).map((t) => (
                        <span key={t.id} className="inline-flex items-center rounded-full bg-emerald-50 text-sm">
                          <button onClick={() => start(d, t)} className="py-1 pl-3 pr-1 text-left" title={testLabel(t)}>
                            ▶ {t.name}{recordOf(d, t.id) && <span className="ml-1 text-xs text-emerald-700">⚡{recordOf(d, t.id)}</span>}
                          </button>
                          <button onClick={() => setEditing({ deckId: d.id, test: t })} className="px-1 text-xs" title="Upravit test">⚙️</button>
                          <button onClick={() => patchDeck(d.id, (x) => ({ ...x, tests: x.tests?.filter((y) => y.id !== t.id) }))} className="pr-2 text-xs text-slate-400" title="Smazat test">✕</button>
                        </span>
                      ))}
                      <button onClick={() => setEditing({ deckId: d.id })} className="rounded-full border border-dashed border-emerald-300 px-3 py-1 text-sm text-emerald-700">＋ test</button>
                    </div>
                    {editing?.deckId === d.id && (
                      <TestEditor key={editing.test?.id ?? "new"} deck={d} initial={editing.test} speech={speech} onCancel={() => setEditing(null)}
                        onSave={(t) => { patchDeck(d.id, (x) => ({ ...x, tests: [...(x.tests ?? []).filter((y) => y.id !== t.id), t] })); setEditing(null) }} />
                    )}
                  </li>
                ))}
              </ul>
              <label className="mt-3 block text-sm text-slate-500">Nahrát JSON kvíz:{" "}
                <input type="file" accept="application/json" onChange={(e) => e.target.files?.[0] && importDeck(e.target.files[0])} />
              </label>
            </section>
          </>
        )}

        {view === "play" && q && test && (
          <section className="rounded-2xl bg-white p-5 shadow">
            <div className="mb-2 flex justify-between text-sm text-slate-500">
              <span>{i + 1} / {qs.length}</span>
              <span className="truncate px-2">{test.name}</span>
              {test.timed && <span>⏱ {fmt(Math.max(0, now - t0))}</span>}
              <span>✅ {score}</span>
            </div>
            <div className="mb-4 h-2 rounded bg-slate-100"><div className="h-2 rounded bg-emerald-400" style={{ width: `${(i / qs.length) * 100}%` }} /></div>
            {q.image && picLoading
              ? <div className="h-72 animate-pulse rounded-xl bg-slate-100" />
              : <QuestionView spec={toSpec(q, q.image ? pic : null, picked, test.input === "buttons")} onChoose={choose} />}

            {ready && test.input !== "buttons" && (
              <form onSubmit={(e) => { e.preventDefault(); answer(typedVal) }} className="mt-4 flex gap-2">
                <input ref={answerRef} value={typedVal} onChange={(e) => setTypedVal(e.target.value)}
                  placeholder={test.input === "voice" ? (speech.supported ? "Řekni odpověď 🎤 nebo napiš…" : "Hlas tu nejde – napiš odpověď…") : "Napiš odpověď…"}
                  className="min-w-0 flex-1 rounded-xl border-2 border-sky-200 p-3 text-lg" autoCapitalize="none" autoComplete="off" />
                {test.input === "voice" && <Mic speech={speech} label="🎤 Mluv" onText={(x, alts) => { setTypedVal(x); answer(x, alts) }} />}
                <button className={`${btn} bg-sky-500 text-white`}>OK</button>
              </form>
            )}
            {test.input === "voice" && speech.listening && <p className="mt-1 text-sm text-slate-500">Slyším: {speech.heard || "…"}</p>}

            {picked && (
              <div className="mt-4">
                <p className="mb-3">
                  {picked === q.answer ? "🎉 Správně!" : <>
                    {test.input !== "buttons" && <span className="block text-red-600">Odpověď: {picked}{almost && " – skoro! Pozor na háčky a čárky."}</span>}
                    Správně je: <b>{cap(q.answer)}</b></>}
                  {q.note && <span className="block text-sm text-slate-500">{q.note}</span>}
                </p>
                <button autoFocus onClick={next} className={`${btn} w-full bg-slate-900 text-white`}>{i + 1 < qs.length ? "Další →" : "Výsledek"}</button>
              </div>
            )}
            <button onClick={() => setView("home")} className="mt-4 text-sm text-slate-500">← zpět</button>
          </section>
        )}

        {view === "done" && deck && test && (
          <section className="rounded-2xl bg-white p-5 text-center shadow">
            <div className="text-6xl">{score / qs.length >= 0.9 ? "🏆" : score / qs.length >= 0.6 ? "👍" : "💪"}</div>
            <h2 className="my-2 text-3xl font-black">{score} / {qs.length}</h2>
            <p className="mb-1 text-sm text-slate-500">{test.name} · {testLabel(test)}{lastRun?.ms != null && ` · ⏱ ${fmt(lastRun.ms)}`}</p>
            {(() => {
              if (!lastRun) return null
              const prev = (lib.find((d) => d.id === deck.id)?.history ?? []).filter((r) => r.testId === lastRun.testId && r.at !== lastRun.at)
              if (!prev.length) return <p className="mb-3 text-sm">První pokus v tomto testu – příště uvidíš zlepšení.</p>
              const pct = (r: Run) => r.score / r.total
              const timedPrev = prev.filter((r) => r.ms && pct(r) <= pct(lastRun)) // only runs she scored at least as well as
              const bestMs = timedPrev.length ? Math.min(...timedPrev.map((r) => r.ms!)) : null
              const msgs: string[] = []
              if (pct(lastRun) > Math.max(...prev.map(pct))) msgs.push("🌟 Nejlepší skóre!")
              if (lastRun.ms && bestMs && lastRun.ms < bestMs) msgs.push(`⚡ Rekord – o ${Math.round((bestMs - lastRun.ms) / 1000)} s rychleji!`)
              else if (lastRun.ms && bestMs) msgs.push(`Rekord je ${fmt(bestMs)}.`)
              const recent = [...prev.slice(-6), lastRun]
              return <div className="mb-3">
                {msgs.map((m) => <p key={m} className="font-semibold">{m}</p>)}
                <div className="mx-auto mt-2 flex h-12 max-w-xs items-end justify-center gap-1" title="Posledních 7 pokusů">
                  {recent.map((r, k) => <div key={k} className={`w-5 rounded-t ${k === recent.length - 1 ? "bg-emerald-500" : "bg-emerald-200"}`} style={{ height: `${Math.max(8, pct(r) * 100)}%` }} />)}
                </div>
              </div>
            })()}
            {wrongs.length > 0 && (
              <ul className="mb-4 text-left text-sm">
                {wrongs.map((w, k) => <li key={k}>❌ {w.prompt} → <b>{cap(w.answer)}</b></li>)}
              </ul>
            )}
            <div className="grid gap-2">
              {wrongs.length > 0 && <button onClick={() => start(deck, { ...test, timed: false, id: test.id + ":chyby", name: "Chyby" }, shuffle(wrongs).map((w) => ({ ...w, options: shuffle(w.options) })))} className={`${btn} bg-amber-400`}>Procvičit chyby</button>}
              <button onClick={() => start(deck, test)} className={`${btn} bg-emerald-500 text-white`}>Znovu stejný test</button>
              {test.id === QUICK_ID && <button onClick={() => { setView("home"); setEditing({ deckId: deck.id, test: { ...quick, id: crypto.randomUUID(), name: "" } }) }} className={`${btn} bg-emerald-50`}>Uložit jako test</button>}
              <button onClick={() => setView("home")} className={`${btn} bg-slate-100`}>Knihovna</button>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
