"use client"

import { useEffect, useState, type CSSProperties } from "react"
import { useI18n } from "@/lib/i18n/provider"
import { pick, type Localized } from "@/lib/i18n/localize"
import s from "./intro-teaser.module.css"

// IntroTeaser — the landing page's first-visit title sequence. It reads as
// a loading screen (a % counter, a filling bar) while it actually pitches
// the person in five beats, then writes the hero sentence exactly where
// the real hero sits and lifts off the page so the sentence carries on.
//
// The timeline is plain CSS (intro-teaser.module.css) and the controller
// is an inline script rendered ahead of the markup, so the sequence starts
// at first paint, skip works before React hydrates, and a repeat visit in
// the same session never paints a single frame of it.

const COPY = {
  city: { en: "zenbauhaus · prague", cs: "zenbauhaus · praha", fr: "zenbauhaus · prague" },
  self: { en: "self-taught", cs: "samouk", fr: "autodidacte" },
  role: { en: "creative technologist", cs: "kreativní technolog", fr: "technologue créatif" },
  vr: { en: "vr", cs: "vr", fr: "vr" },
  d3: { en: "3d", cs: "3d", fr: "3d" },
  ai: { en: "ai", cs: "ai", fr: "ia" },
  art: { en: "art", cs: "umění", fr: "art" },
  founder: { en: "founder", cs: "zakladatel", fr: "fondateur" },
  speaker: { en: "speaker", cs: "řečník", fr: "orateur" },
  loading: { en: "loading", cs: "načítám", fr: "chargement" },
  ready: { en: "ready", cs: "hotovo", fr: "prêt" },
  skip: { en: "skip", cs: "přeskočit", fr: "passer" },
} satisfies Record<string, Localized>

// Seconds from first paint; must match the delays baked into the CSS
// module (outro 7.55s, gone 8.5s) and the script below. Each beat is
// fully out (0.28s fade) before the next one is more than a shimmer in.
const T = {
  name: [0.15, 1.45],
  role: [1.7, 2.75],
  disc: [2.92, 3.47, 4.02, 4.57, 5.08],
  proof: [5.36, 6.42],
} as const

// Controller. Runs during HTML parsing, before the overlay markup exists.
//  - repeat visit in this tab, or reduced motion: hide before first paint
//  - otherwise: lock scroll (gutter kept, so nothing shifts on release),
//    drive the % counter, nudge the headline onto the real hero's box,
//    and let any pointer / key / wheel / touch skip straight to the lift.
// Its clock is the CSS timeline's own start (the overlay root's animation
// startTime), not the moment the script ran — those differ by however long
// the first style pass takes, which is most of a second on a slow phone.
const CONTROLLER = `(function(){
var d=document,h=d.documentElement,w=window,seen=null;
try{seen=sessionStorage.getItem('zb-intro-seen')}catch(e){}
var rm=w.matchMedia&&w.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(seen||rm){h.classList.add('zb-intro-done');return}
try{sessionStorage.setItem('zb-intro-seen','1')}catch(e){}
h.classList.add('zb-intro-lock');
var st=d.createElement('style');st.id='zb-intro-lock';
st.textContent='html.zb-intro-lock{overflow:hidden;scrollbar-gutter:stable}';
d.head.appendChild(st);
try{w.scrollTo(0,0)}catch(e){}
var born=performance.now(),t0=null,out=false,done=false,aligned=false;
var K=[[0,0],[.12,.08],[.26,.27],[.38,.33],[.55,.61],[.7,.68],[.86,.94],[1,1]];
function p(x){if(x<=0)return 0;if(x>=1)return 1;for(var i=1;i<K.length;i++){if(x<=K[i][0]){var a=K[i-1],b=K[i];return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0])}}return 1}
function base(){if(t0!==null)return t0;var r=d.querySelector('[data-intro-teaser]');if(r&&r.getAnimations){var a=r.getAnimations()[0];if(a&&a.startTime!=null)t0=a.startTime}return t0}
function align(){var a=d.querySelector('main section h2'),b=d.querySelector('[data-zb-headline]');if(!a||!b)return;var ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect(),dx=ra.left-rb.left,dy=ra.top-rb.top;if(Math.abs(dx)<160&&Math.abs(dy)<160){h.style.setProperty('--zb-dx',dx+'px');h.style.setProperty('--zb-dy',dy+'px')}}
var EV=['pointerdown','keydown','wheel','touchmove'];
function finish(){if(done)return;done=true;h.classList.add('zb-intro-done');h.classList.remove('zb-intro-lock');var l=d.getElementById('zb-intro-lock');if(l)l.remove();EV.forEach(function(n){w.removeEventListener(n,skip,true)});['--zbp','--zb-dx','--zb-dy'].forEach(function(v){h.style.removeProperty(v)});w.dispatchEvent(new Event('zb-intro-done'))}
function skip(){if(out||done)return;out=true;align();h.classList.add('zb-intro-out');setTimeout(finish,950)}
function loop(){if(done)return;var now=performance.now(),b=base();
if(b===null){if(now-born>4000){finish();return}}
else{var e=now-b;if(!out)h.style.setProperty('--zbp',String(Math.round(p((e-100)/7000)*100)));
if(!aligned&&e>6800){aligned=true;align()}
if(!out&&e>=7550){out=true;align();setTimeout(finish,Math.max(0,b+8540-now))}}
requestAnimationFrame(loop)}
EV.forEach(function(n){w.addEventListener(n,skip,{capture:true,passive:true})});
requestAnimationFrame(loop);
})()`

type Vars = CSSProperties & Record<`--${string}`, string | number>
const v = (o: Record<string, string | number>) => o as Vars
const sec = (n: number) => `${n}s`

export function IntroTeaser() {
  const { lang, t } = useI18n()
  const tr = (x: Localized) => pick(x, lang)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const html = document.documentElement
    if (html.classList.contains("zb-intro-done")) {
      setGone(true)
      return
    }
    const onDone = () => setGone(true)
    window.addEventListener("zb-intro-done", onDone)
    return () => window.removeEventListener("zb-intro-done", onDone)
  }, [])

  if (gone) return null

  const [d0, d1, d2, d3, d4] = T.disc
  const disciplines = [
    { key: "vr", label: tr(COPY.vr), at: d0, out: d1 - 0.1, art: <VrSketch at={d0} /> },
    { key: "3d", label: tr(COPY.d3), at: d1, out: d2 - 0.1, art: <CubeSketch at={d1} /> },
    { key: "ai", label: tr(COPY.ai), at: d2, out: d3 - 0.1, art: <NetSketch at={d2} /> },
    { key: "art", label: tr(COPY.art), at: d3, out: d4, art: <BrushSketch at={d3} /> },
  ]
  const name = "Eliáš Bauer"

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: CONTROLLER }} />
      <div className={s.root} aria-hidden="true" data-intro-teaser>
        <div className={s.curtain}>
          {/* wordmark where the nav's sits — lifts away to reveal the real one */}
          <div className={s.brand}>
            <div className={s.brandInner}>zenbauhaus</div>
          </div>
          <div className={s.stage}>
            {/* 1 — name */}
            <div className={s.beat}>
              <span className={`${s.kicker} ${s.rise}`} style={v({ "--in": sec(T.name[0] + 0.25), "--out": sec(T.name[1]) })}>
                {tr(COPY.city)}
              </span>
              <span className={s.name}>
                {Array.from(name).map((c, i) => (
                  <span
                    key={i}
                    className={s.char}
                    style={v({ "--i": i, "--in": sec(T.name[0]), "--out": sec(T.name[1]) })}
                  >
                    {c === " " ? " " : c}
                  </span>
                ))}
              </span>
              <svg className={`${s.underline} ${s.accent} ${s.fadeOut}`} viewBox="0 0 560 26" preserveAspectRatio="none" style={v({ "--out": sec(T.name[1]) })}>
                <path
                  className={s.draw}
                  pathLength={1}
                  d="M6 15 C 120 6, 250 22, 380 12 S 520 10, 554 16"
                  style={v({ "--in": sec(T.name[0] + 0.45), "--dur": "0.75s", strokeWidth: 4 })}
                />
              </svg>
            </div>

            {/* 2 — role */}
            <div className={s.beat}>
              <span className={`${s.kicker} ${s.rise}`} style={v({ "--in": sec(T.role[0]), "--out": sec(T.role[1]) })}>
                {tr(COPY.self)}
              </span>
              <span className={`${s.role} ${s.wipe}`} style={v({ "--in": sec(T.role[0] + 0.1), "--out": sec(T.role[1]) })}>
                {tr(COPY.role)}
              </span>
            </div>

            {/* 3 — disciplines, each sketched */}
            {disciplines.map((x) => (
              <div key={x.key} className={s.beat}>
                <svg className={s.sketch} viewBox="0 0 240 140" style={v({ "--out": sec(x.out) })}>
                  {x.art}
                </svg>
                <span className={`${s.word} ${s.rise}`} style={v({ "--in": sec(x.at + 0.12), "--out": sec(x.out) })}>
                  {x.label}
                </span>
              </div>
            ))}
            <div className={s.row} style={v({ "--in": sec(d0), "--out": sec(d4) })}>
              {disciplines.map((x, i) => (
                <span key={x.key} style={{ display: "contents" }}>
                  {i > 0 && <span className={s.dot}>·</span>}
                  <span className={s.rowItem} style={v({ "--at": sec(x.at + 0.1) })}>
                    {x.label}
                  </span>
                </span>
              ))}
            </div>

            {/* 4 — proof */}
            <div className={s.beat}>
              <div className={s.proof}>
                {[
                  { role: "cto", at: "0 → 1 · flipas" },
                  { role: tr(COPY.founder), at: "laifea" },
                  { role: tr(COPY.speaker), at: "nike berlin" },
                ].map((l, i) => (
                  <span
                    key={i}
                    className={`${s.proofLine} ${s.wipe}`}
                    style={v({ "--in": sec(T.proof[0] + i * 0.1), "--out": sec(T.proof[1]) })}
                  >
                    <span>{l.role}</span>
                    <span className={s.proofAt}>{l.at}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className={`${s.chrome} ${s.top}`}>
            <button type="button" className={s.skip} tabIndex={-1}>
              <span className="ink-underline">{tr(COPY.skip)}</span>
              <span aria-hidden>→</span>
            </button>
          </div>

          <div className={`${s.chrome} ${s.bottom}`}>
            <div className={s.status}>
              <span className={s.label}>
                <span className={s.loading}>{tr(COPY.loading)}</span>
                <span className={s.ready}>{tr(COPY.ready)}</span>
              </span>
              <span className={s.count} />
            </div>
            <div className={s.bar} />
          </div>

          {/* inked, ragged leading edge of the sheet as it lifts */}
          <svg className={s.edge} viewBox="0 0 1200 72" preserveAspectRatio="none" aria-hidden>
            <path
              fill="currentColor"
              d="M0 0 H1200 V22 C1150 30 1110 18 1060 26 C1000 36 960 20 900 30 C840 40 790 22 730 28 C660 35 620 24 560 32 C500 40 450 22 390 30 C330 38 290 24 230 30 C170 36 120 22 70 30 C40 34 20 28 0 30 Z"
            />
            <path
              className={s.edgeLine}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
              d="M0 30 C20 28 40 34 70 30 C120 22 170 36 230 30 C290 24 330 38 390 30 C450 22 500 40 560 32 C620 24 660 35 730 28 C790 22 840 40 900 30 C960 20 1000 36 1060 26 C1110 18 1150 30 1200 22"
            />
          </svg>
        </div>

        {/* Top layer: the hero sentence, laid out with the hero's own
            classes so it lands exactly on it, then fades as the sheet
            clears. */}
        <div className={s.textLayer}>
          <div className="relative flex min-h-screen w-full flex-col items-center overflow-hidden px-6 pt-24 sm:pt-28">
            <div className="relative z-10 flex w-full max-w-4xl flex-col items-center text-center">
              <div className={s.headlineWrap}>
                <div className="hero-ink-outline">
                  <h2
                    data-zb-headline
                    aria-hidden="true"
                    className={`${s.headline} mx-auto max-w-5xl text-[clamp(2.4rem,5vw,4.2rem)] leading-[0.92]`}
                    style={{ fontFamily: "var(--font-display)", fontWeight: 400, color: "var(--ink)" }}
                  >
                    {t("hero.headline.i")}
                    <strong>{t("hero.headline.build")}</strong>
                    {t("hero.headline.systems")}
                    <span className="humph">{t("hero.headline.untangle")}</span>
                    <em>{t("hero.headline.messy")}</em>
                    {t("hero.headline.problems")}
                    <strong>{t("hero.headline.writeCode")}</strong>
                    {t("hero.headline.dot")}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Pen sketches. Every stroke uses pathLength=1 so one dash rule draws any
// path on; `--in` staggers strokes inside a sketch.
// ---------------------------------------------------------------------------

function Stroke({ d, at, dur = 0.45, accent = false, width }: { d: string; at: number; dur?: number; accent?: boolean; width?: number }) {
  return (
    <path
      className={`${s.draw} ${accent ? s.accent : ""}`}
      pathLength={1}
      d={d}
      style={v({ "--in": sec(at), "--dur": `${dur}s`, ...(width ? { strokeWidth: width } : {}) })}
    />
  )
}

function VrSketch({ at }: { at: number }) {
  return (
    <g>
      <Stroke at={at} dur={0.42} d="M52 34 H188 Q202 34 202 48 V86 Q202 100 188 100 H148 Q139 100 134 91 L128 82 Q120 72 112 82 L106 91 Q101 100 92 100 H52 Q38 100 38 86 V48 Q38 34 52 34 Z" />
      <Stroke at={at + 0.18} dur={0.3} d="M38 58 Q18 60 10 76" />
      <Stroke at={at + 0.18} dur={0.3} d="M202 58 Q222 60 230 76" />
      <Stroke at={at + 0.28} dur={0.25} d="M58 46 H100" accent width={3.2} />
    </g>
  )
}

function CubeSketch({ at }: { at: number }) {
  return (
    <g>
      <Stroke at={at} dur={0.45} d="M120 18 L170 44 L170 100 L120 126 L70 100 L70 44 Z" />
      <Stroke at={at + 0.15} dur={0.3} d="M70 44 L120 70 L170 44 M120 70 L120 126" />
      <Stroke at={at + 0.25} dur={0.25} d="M120 18 L120 70" accent width={1.6} />
      <Stroke at={at + 0.3} dur={0.2} d="M116 70 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0" accent width={3} />
    </g>
  )
}

const NET = [
  [60, [40, 70, 100]],
  [120, [26, 54, 84, 112]],
  [180, [52, 88]],
] as const

function NetSketch({ at }: { at: number }) {
  const edges: string[] = []
  for (let l = 0; l < NET.length - 1; l++) {
    const [x0, ys0] = NET[l]
    const [x1, ys1] = NET[l + 1]
    for (const y0 of ys0) for (const y1 of ys1) edges.push(`M${x0 + 6} ${y0} L${x1 - 6} ${y1}`)
  }
  const node = (x: number, y: number) => `M${x - 6} ${y} a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0`
  return (
    <g>
      {NET.map(([x, ys], l) =>
        ys.map((y, i) => (
          <Stroke key={`${l}-${i}`} at={at + l * 0.08} dur={0.25} d={node(x, y)} accent={l === 1 && i === 2} width={l === 1 && i === 2 ? 3 : undefined} />
        )),
      )}
      <g style={{ opacity: 0.55 }}>
        <Stroke at={at + 0.18} dur={0.4} d={edges.join(" ")} width={1.4} />
      </g>
    </g>
  )
}

function BrushSketch({ at }: { at: number }) {
  return (
    <g>
      <g style={{ filter: "url(#ink-wobble-strong)" }}>
        <Stroke at={at} dur={0.5} d="M26 96 C 64 44, 104 118, 146 68 S 206 42, 216 58" accent width={15} />
      </g>
      <Stroke at={at + 0.3} dur={0.2} d="M196 92 l1 0 M206 100 l1 0 M186 104 l1 0" accent width={6} />
    </g>
  )
}
