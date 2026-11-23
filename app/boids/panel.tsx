"use client"

// The boids control panel: a side card on desktop, a bottom sheet on
// a phone. Sizes are in px on purpose — the site scales its rem with
// the viewport, and controls should not.

import { useEffect, useState, type MutableRefObject, type ReactNode, type RefObject } from "react"
import { useI18n } from "@/lib/i18n/provider"
import { pick, type Localized } from "@/lib/i18n/localize"
import {
  COUNTS, DEFAULTS, PRESETS,
  type Palette, type Params, type PointerMode, type PresetName, type Shape, type Stats,
} from "./params"

const C: Record<string, Localized> = {
  controls: { en: "controls", cs: "ovládání", fr: "réglages" },
  hide: { en: "hide", cs: "skrýt", fr: "masquer" },
  presets: { en: "behaviour", cs: "chování", fr: "comportement" },
  murmuration: { en: "murmuration", cs: "hejno špačků", fr: "murmuration" },
  school: { en: "school", cs: "hejno ryb", fr: "banc" },
  swarm: { en: "swarm", cs: "roj", fr: "essaim" },
  drift: { en: "drift", cs: "poklid", fr: "dérive" },
  rules: { en: "rules", cs: "pravidla", fr: "règles" },
  flock: { en: "birds", cs: "ptáků", fr: "oiseaux" },
  cohesion: { en: "cohesion", cs: "soudržnost", fr: "cohésion" },
  alignment: { en: "alignment", cs: "zarovnání", fr: "alignement" },
  separation: { en: "separation", cs: "odstup", fr: "séparation" },
  vision: { en: "vision", cs: "dohled", fr: "vision" },
  speed: { en: "speed", cs: "rychlost", fr: "vitesse" },
  turbulence: { en: "turbulence", cs: "turbulence", fr: "turbulence" },
  size: { en: "size", cs: "velikost", fr: "taille" },
  pointer: { en: "pointer", cs: "ukazatel", fr: "pointeur" },
  flee: { en: "scare", cs: "plaší", fr: "effraie" },
  attract: { en: "attract", cs: "láká", fr: "attire" },
  off: { en: "off", cs: "nic", fr: "rien" },
  strength: { en: "strength", cs: "síla", fr: "force" },
  radius: { en: "radius", cs: "dosah", fr: "rayon" },
  look: { en: "look", cs: "vzhled", fr: "aspect" },
  ink: { en: "ink", cs: "tuš", fr: "encre" },
  heading: { en: "heading", cs: "směr", fr: "cap" },
  dusk: { en: "dusk", cs: "soumrak", fr: "crépuscule" },
  glow: { en: "glow", cs: "záře", fr: "halo" },
  space: { en: "space", cs: "prostor", fr: "espace" },
  sphere: { en: "sphere", cs: "koule", fr: "sphère" },
  box: { en: "box", cs: "krabice", fr: "boîte" },
  showBounds: { en: "show edge", cs: "ukázat okraj", fr: "voir le bord" },
  autoRotate: { en: "auto-rotate", cs: "otáčet", fr: "rotation auto" },
  pause: { en: "pause", cs: "pauza", fr: "pause" },
  play: { en: "play", cs: "spustit", fr: "lecture" },
  scatter: { en: "scatter", cs: "rozprášit", fr: "disperser" },
  defaults: { en: "defaults", cs: "výchozí", fr: "défauts" },
  fullscreen: { en: "fullscreen", cs: "celá obrazovka", fr: "plein écran" },
  sampled: { en: "sampling 1 in {n}", cs: "vzorkuje se 1 z {n}", fr: "1 sur {n} échantillonné" },
  keys: {
    en: "space pause · r scatter · f fullscreen · h panel",
    cs: "mezerník pauza · r rozprášit · f celá obrazovka · h panel",
    fr: "espace pause · r disperser · f plein écran · h panneau",
  },
}

const ink = "var(--ink)"
const muted = "var(--text-muted)"
const label = { fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: muted }

function Chips<T extends string | number>({
  options, value, onPick, render,
}: {
  options: readonly T[]
  value: T | null
  onPick: (v: T) => void
  render: (v: T) => ReactNode
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = o === value
        return (
          <button
            key={String(o)}
            type="button"
            aria-pressed={on}
            onClick={() => onPick(o)}
            className="touch-manipulation select-none"
            style={{
              fontSize: 12,
              lineHeight: 1,
              padding: "7px 9px",
              border: `1.5px solid ${ink}`,
              background: on ? ink : "transparent",
              color: on ? "var(--surface-dark)" : ink,
            }}
          >
            {render(o)}
          </button>
        )
      })}
    </div>
  )
}

function Slider({
  name, value, min, max, step = 0.01, onChange,
}: {
  name: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
}) {
  return (
    <label className="flex items-center" style={{ gap: 8 }}>
      <span style={{ ...label, width: 88, flexShrink: 0 }}>{name}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label={name}
        className="min-w-0 flex-1 cursor-pointer touch-manipulation"
        style={{ accentColor: ink, height: 26 }}
      />
      <span style={{ fontSize: 11, width: 30, textAlign: "right", color: ink, fontVariantNumeric: "tabular-nums" }}>
        {value >= 10 ? Math.round(value) : value.toFixed(1)}
      </span>
    </label>
  )
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <h3 style={{ ...label, color: ink }}>{title}</h3>
      {children}
    </section>
  )
}

export function Panel({
  params, onParams, count, onCount, paused, onPause, onReset, stats, fullscreenTarget,
}: {
  params: Params
  onParams: (p: Params) => void
  count: number
  onCount: (n: number) => void
  paused: boolean
  onPause: () => void
  onReset: () => void
  stats: MutableRefObject<Stats>
  fullscreenTarget: RefObject<HTMLDivElement | null>
}) {
  const { lang } = useI18n()
  const t = (k: string) => pick(C[k], lang)
  const [open, setOpen] = useState(false)
  const [readout, setReadout] = useState({ fps: 0, stride: 1 })
  const [canFullscreen, setCanFullscreen] = useState(false)

  // Open by default where there is room for it.
  useEffect(() => {
    setOpen(window.innerWidth >= 900)
    setCanFullscreen(typeof document.documentElement.requestFullscreen === "function")
  }, [])

  useEffect(() => {
    const id = window.setInterval(
      () => setReadout({ fps: stats.current.fps, stride: stats.current.stride }),
      1000,
    )
    return () => window.clearInterval(id)
  }, [stats])

  const set = <K extends keyof Params>(k: K, v: Params[K]) => onParams({ ...params, [k]: v })

  const fullscreen = () => {
    const el = fullscreenTarget.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    else el.requestFullscreen?.().catch(() => {})
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const el = e.target as HTMLElement | null
      const tag = el?.tagName
      const typing = tag === "TEXTAREA" || (tag === "INPUT" && !["range", "checkbox"].includes((el as HTMLInputElement).type))
      if (typing) return
      // Space on a focused button or checkbox already means "press it".
      if (e.key === " " && (tag === "BUTTON" || tag === "INPUT")) return
      if (e.key === " ") {
        e.preventDefault()
        onPause()
      } else if (e.key === "r") onReset()
      else if (e.key === "f") fullscreen()
      else if (e.key === "h") setOpen((o) => !o)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onPause, onReset])

  const activePreset =
    (Object.keys(PRESETS) as PresetName[]).find((name) =>
      Object.entries(PRESETS[name]).every(([k, v]) => params[k as keyof Params] === v),
    ) ?? null

  const action = {
    fontSize: 12,
    lineHeight: 1,
    padding: "8px 10px",
    border: `1.5px solid ${ink}`,
    color: ink,
    background: "color-mix(in srgb, var(--surface-dark) 85%, transparent)",
  }

  return (
    <div style={{ fontFamily: "var(--font-display)" }}>
      {/* Readout */}
      <div
        className="pointer-events-none absolute bottom-2 left-3"
        style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: muted }}
      >
        {count.toLocaleString()} {t("flock")} · {readout.fps || "–"} fps
        {readout.stride > 1 && ` · ${t("sampled").replace("{n}", String(readout.stride))}`}
      </div>

      {/* Always-there buttons */}
      <div className="absolute left-3 top-3 flex gap-1.5">
        <button type="button" onClick={onPause} style={action} className="touch-manipulation">
          {paused ? t("play") : t("pause")}
        </button>
        <button type="button" onClick={onReset} style={action} className="touch-manipulation">
          {t("scatter")}
        </button>
        {canFullscreen && (
          <button type="button" onClick={fullscreen} style={action} className="touch-manipulation">
            {t("fullscreen")}
          </button>
        )}
      </div>

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={action}
          className="absolute right-3 top-3 touch-manipulation"
        >
          {t("controls")}
        </button>
      )}

      {open && (
        <aside
          className="absolute inset-x-0 bottom-0 flex max-h-[54%] flex-col gap-3 overflow-y-auto overscroll-contain p-3 min-[900px]:inset-x-auto min-[900px]:bottom-3 min-[900px]:right-3 min-[900px]:top-3 min-[900px]:max-h-none min-[900px]:w-[270px]"
          style={{
            background: "color-mix(in srgb, var(--surface-dark) 90%, transparent)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            border: `1.5px solid ${ink}`,
          }}
        >
          <div className="flex items-center justify-between">
            <h2 style={{ ...label, color: ink, fontSize: 12 }}>{t("controls")}</h2>
            <button type="button" onClick={() => setOpen(false)} style={{ ...label, textDecoration: "underline" }}>
              {t("hide")}
            </button>
          </div>

          <Group title={t("presets")}>
            <Chips
              options={Object.keys(PRESETS) as PresetName[]}
              value={activePreset}
              onPick={(name) => onParams({ ...params, ...PRESETS[name] })}
              render={(name) => t(name)}
            />
          </Group>

          <Group title={t("flock")}>
            <Chips options={COUNTS} value={count} onPick={onCount} render={(n) => n.toLocaleString()} />
          </Group>

          <Group title={t("rules")}>
            <Slider name={t("cohesion")} value={params.cohesion} min={0} max={3} onChange={(v) => set("cohesion", v)} />
            <Slider name={t("alignment")} value={params.alignment} min={0} max={3} onChange={(v) => set("alignment", v)} />
            <Slider name={t("separation")} value={params.separation} min={0} max={3} onChange={(v) => set("separation", v)} />
            <Slider name={t("vision")} value={params.vision} min={20} max={140} step={1} onChange={(v) => set("vision", v)} />
            <Slider name={t("speed")} value={params.speed} min={0.1} max={3} onChange={(v) => set("speed", v)} />
            <Slider name={t("turbulence")} value={params.turbulence} min={0} max={2} onChange={(v) => set("turbulence", v)} />
          </Group>

          <Group title={t("pointer")}>
            <Chips
              options={["flee", "attract", "off"] as const}
              value={params.pointer}
              onPick={(v: PointerMode) => set("pointer", v)}
              render={(v) => t(v)}
            />
            {params.pointer !== "off" && (
              <>
                <Slider name={t("strength")} value={params.pointerStrength} min={0.2} max={3} onChange={(v) => set("pointerStrength", v)} />
                <Slider name={t("radius")} value={params.pointerRadius} min={40} max={320} step={1} onChange={(v) => set("pointerRadius", v)} />
              </>
            )}
          </Group>

          <Group title={t("look")}>
            <Chips
              options={["ink", "heading", "speed", "dusk"] as const}
              value={params.palette}
              onPick={(v: Palette) => set("palette", v)}
              render={(v) => t(v)}
            />
            <Slider name={t("size")} value={params.size} min={1} max={12} step={0.1} onChange={(v) => set("size", v)} />
            <Slider name={t("glow")} value={params.bloom} min={0} max={2.5} onChange={(v) => set("bloom", v)} />
          </Group>

          <Group title={t("space")}>
            <Chips
              options={["sphere", "box"] as const}
              value={params.shape}
              onPick={(v: Shape) => set("shape", v)}
              render={(v) => t(v)}
            />
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {(["showBounds", "autoRotate"] as const).map((k) => (
                <label key={k} className="flex cursor-pointer items-center gap-2" style={label}>
                  <input
                    type="checkbox"
                    checked={params[k]}
                    onChange={(e) => set(k, e.target.checked)}
                    style={{ accentColor: ink, width: 15, height: 15 }}
                  />
                  {t(k)}
                </label>
              ))}
            </div>
          </Group>

          <button type="button" onClick={() => onParams(DEFAULTS)} style={{ ...action, alignSelf: "flex-start" }}>
            {t("defaults")}
          </button>

          <p className="hidden [@media(hover:hover)]:block" style={{ ...label, fontSize: 10, lineHeight: 1.6 }}>
            {t("keys")}
          </p>
        </aside>
      )}
    </div>
  )
}
