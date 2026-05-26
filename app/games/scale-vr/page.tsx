"use client"

// Scale VR — estimate the size of a 3D object at distance, in real
// units. Works in a regular browser canvas and, if the device
// supports WebXR, opens in immersive VR via @react-three/xr.
//
// Game loop:
//   1. A reference box (1.0m tall) sits in the scene at a known
//      spot. A target box appears further away at a random distance
//      and a random height (0.4–3m).
//   2. The player guesses the target's height in metres via a
//      slider. Reveal: actual vs guess. Closer = more points.
//   3. Five rounds, then a final score.
//
// WebXR mode lets you walk up to the box (if you have an HMD with
// roomscale tracking) before locking in your guess — a much better
// scale calibration drill than staring at a desktop screen.

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { XR, createXRStore } from "@react-three/xr"
import * as THREE from "three"
import { GameShell } from "@/components/game-shell"

type Round = {
  distance: number   // metres from camera origin
  height: number     // actual box height in metres
}

const TOTAL_ROUNDS = 5

function genRound(): Round {
  return {
    distance: 3 + Math.random() * 8,    // 3–11m away
    height: 0.4 + Math.random() * 2.6,  // 0.4–3.0m tall
  }
}

// Convert |guess − actual| into 0..20 points per round, max 100.
function scoreFor(guess: number, actual: number) {
  const pct = Math.abs(guess - actual) / actual
  if (pct <= 0.05) return 20
  if (pct <= 0.1) return 15
  if (pct <= 0.2) return 10
  if (pct <= 0.35) return 5
  return 0
}

const xrStore = createXRStore()

export default function ScaleVRPage() {
  const [stage, setStage] = useState<"intro" | "playing" | "results">("intro")
  const [round, setRound] = useState<Round | null>(null)
  const [roundIndex, setRoundIndex] = useState(0)
  const [guess, setGuess] = useState(1)
  const [reveal, setReveal] = useState<{ delta: number; points: number; actual: number } | null>(null)
  const [score, setScore] = useState(0)
  const [hasXR, setHasXR] = useState(false)

  // Probe WebXR support
  useEffect(() => {
    const nav = typeof navigator !== "undefined" ? (navigator as Navigator & { xr?: { isSessionSupported?: (m: string) => Promise<boolean> } }) : null
    nav?.xr?.isSessionSupported?.("immersive-vr").then((ok) => setHasXR(!!ok)).catch(() => setHasXR(false))
  }, [])

  const start = useCallback(() => {
    setScore(0)
    setRoundIndex(1)
    setReveal(null)
    setGuess(1)
    setRound(genRound())
    setStage("playing")
  }, [])

  const submit = useCallback(() => {
    if (!round || reveal) return
    const points = scoreFor(guess, round.height)
    setReveal({ delta: guess - round.height, points, actual: round.height })
    setScore((s) => s + points)
  }, [round, guess, reveal])

  const next = useCallback(() => {
    if (roundIndex >= TOTAL_ROUNDS) {
      setStage("results")
    } else {
      setRoundIndex((i) => i + 1)
      setRound(genRound())
      setGuess(1)
      setReveal(null)
    }
  }, [roundIndex])

  return (
    <GameShell
      title="scale · vr"
      blurb="A box appears at distance. Guess its real-world height in metres. In VR (if your device supports it) you can step toward it before locking your guess — the difference vs estimating from a desk is the whole lesson."
    >
      <div
        className="relative w-full overflow-hidden"
        style={{
          height: "min(64vh, 600px)",
          background:
            "color-mix(in srgb, var(--surface-dark) 92%, var(--ink) 8%)",
          border: "1.5px solid var(--ink)",
          filter: "url(#ink-wobble)",
        }}
      >
        {/* The 3D scene */}
        <Canvas
          camera={{ position: [0, 1.6, 0], fov: 65 }}
          shadows
          gl={{ antialias: true }}
        >
          <Suspense fallback={null}>
            <XR store={xrStore}>
              <SceneContents round={round} reveal={!!reveal} guess={guess} />
              <OrbitControls
                target={[0, 1.5, -5]}
                enablePan={false}
                maxPolarAngle={Math.PI / 2 + 0.1}
              />
            </XR>
          </Suspense>
        </Canvas>

        {/* Overlays — intro / HUD / results */}
        {stage === "intro" && (
          <Overlay>
            <p
              className="max-w-md text-base sm:text-lg"
              style={{
                color: "var(--text-muted)",
                fontFamily: "var(--font-display)",
              }}
            >
              The grey reference box on the left is exactly <strong>1m</strong> tall.
              Estimate the height of the green target on the right, then lock in.
              Five rounds.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button onClick={start} className="btn-primary">
                <span>start</span>
                <span aria-hidden style={{ filter: "url(#ink-wobble)" }}>→</span>
              </button>
              {hasXR && (
                <button
                  onClick={() => {
                    xrStore.enterVR()
                    if (stage === "intro") start()
                  }}
                  className="btn-secondary"
                  style={{ background: "var(--surface-elevated)" }}
                >
                  enter vr
                </button>
              )}
            </div>
            {!hasXR && (
              <div
                className="mt-2 text-xs uppercase tracking-[0.3em]"
                style={{ color: "var(--text-muted)" }}
              >
                webxr unavailable — desktop mode only
              </div>
            )}
          </Overlay>
        )}

        {stage === "playing" && (
          <>
            <div
              className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-baseline justify-between p-4 text-xs uppercase tracking-[0.3em]"
              style={{ color: "var(--text-muted)" }}
            >
              <span>round {roundIndex} / {TOTAL_ROUNDS}</span>
              <span>score <strong style={{ color: "var(--ink)" }}>{score}</strong></span>
            </div>

            <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-3 p-5">
              <div
                className="text-sm uppercase tracking-[0.3em]"
                style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}
              >
                target height: <strong style={{ color: "var(--ink)" }}>{guess.toFixed(2)} m</strong>
              </div>
              <input
                type="range"
                min={0.2}
                max={4}
                step={0.05}
                value={guess}
                onChange={(e) => setGuess(parseFloat(e.target.value))}
                disabled={!!reveal}
                className="w-full max-w-md cursor-pointer"
                style={{ accentColor: "var(--ink)" }}
              />
              {reveal ? (
                <button onClick={next} className="btn-primary">
                  <span>{roundIndex >= TOTAL_ROUNDS ? "results" : "next"}</span>
                  <span aria-hidden style={{ filter: "url(#ink-wobble)" }}>→</span>
                </button>
              ) : (
                <button onClick={submit} className="btn-primary">
                  <span>lock in</span>
                  <span aria-hidden style={{ filter: "url(#ink-wobble)" }}>→</span>
                </button>
              )}
            </div>

            {reveal && (
              <div
                className="pointer-events-none absolute inset-x-0 top-14 z-20 flex flex-col items-center"
              >
                <div
                  className="text-2xl sm:text-3xl"
                  style={{
                    fontFamily: "var(--font-display)",
                    color:
                      reveal.points >= 15 ? "#3a9d4e" :
                      reveal.points >= 5 ? "#c08a2c" :
                      "var(--vermilion, #ee4a44)",
                  }}
                >
                  {reveal.points > 0 ? `+${reveal.points}` : "0"}
                </div>
                <div
                  className="mt-1 text-xs uppercase tracking-[0.3em]"
                  style={{ color: "var(--text-muted)" }}
                >
                  actual {reveal.actual.toFixed(2)} m · off by {Math.abs(reveal.delta).toFixed(2)} m
                </div>
              </div>
            )}
          </>
        )}

        {stage === "results" && (
          <Overlay>
            <div className="text-xs uppercase tracking-[0.3em]" style={{ color: "var(--text-muted)" }}>
              final
            </div>
            <div
              className="text-[clamp(3rem,10vw,6rem)] leading-[0.9]"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
            >
              {score}
            </div>
            <div style={{ color: "var(--text-muted)" }}>
              out of {TOTAL_ROUNDS * 20} possible.
            </div>
            <button onClick={start} className="btn-primary">
              <span>again</span>
              <span aria-hidden style={{ filter: "url(#ink-wobble)" }}>↻</span>
            </button>
          </Overlay>
        )}
      </div>
    </GameShell>
  )
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-6 p-8 text-center"
      style={{ background: "color-mix(in srgb, var(--surface-dark) 92%, transparent)" }}
    >
      {children}
    </div>
  )
}

function SceneContents({
  round,
  reveal,
  guess,
}: {
  round: Round | null
  reveal: boolean
  guess: number
}) {
  // Background colour matches the surface so the canvas blends with
  // the page until you start interacting.
  const { scene } = useThree()
  useEffect(() => {
    scene.background = new THREE.Color("#f2f1ed")
  }, [scene])

  // Floor plane to give the eye a ground reference.
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 10, 3]} intensity={0.9} castShadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#e5e4df" />
      </mesh>
      {/* Reference 1 m box — left of centre at a fixed distance */}
      <ReferenceBox />
      {/* Target box */}
      {round && (
        <TargetBox
          distance={round.distance}
          actualHeight={round.height}
          guessHeight={guess}
          reveal={reveal}
        />
      )}
      {/* Light grid lines on the floor */}
      <gridHelper args={[40, 40, "#cccac4", "#dddbd4"]} position={[0, 0.001, 0]} />
    </>
  )
}

function ReferenceBox() {
  const w = 0.6, h = 1, d = 0.6
  // Placed at z=-4, slightly to the left, sitting on the floor.
  return (
    <group position={[-1.4, h / 2, -4]}>
      <mesh castShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#6b6b6b" />
      </mesh>
      <Text
        position={[0, h + 0.18, 0]}
        fontSize={0.16}
        color="#1a1d28"
        anchorX="center"
        anchorY="bottom"
      >
        1.00 m
      </Text>
    </group>
  )
}

function TargetBox({
  distance,
  actualHeight,
  guessHeight,
  reveal,
}: {
  distance: number
  actualHeight: number
  guessHeight: number
  reveal: boolean
}) {
  const w = useMemo(() => 0.4 + Math.random() * 0.6, [actualHeight])
  const d = useMemo(() => 0.4 + Math.random() * 0.6, [actualHeight])
  const ref = useRef<THREE.Mesh>(null!)
  return (
    <group position={[1.2, 0, -distance]}>
      {/* The real target */}
      <mesh
        ref={ref}
        position={[0, actualHeight / 2, 0]}
        castShadow
      >
        <boxGeometry args={[w, actualHeight, d]} />
        <meshStandardMaterial
          color={reveal ? "#3a9d4e" : "#3a8da8"}
          opacity={reveal ? 1 : 0.95}
          transparent
        />
      </mesh>
      {/* The player's guess — wireframe overlay so they can compare */}
      {reveal && (
        <mesh position={[0, guessHeight / 2, 0]}>
          <boxGeometry args={[w * 1.02, guessHeight, d * 1.02]} />
          <meshBasicMaterial color="#ee4a44" wireframe />
        </mesh>
      )}
      {reveal && (
        <Text
          position={[0, Math.max(actualHeight, guessHeight) + 0.2, 0]}
          fontSize={0.14}
          color="#1a1d28"
          anchorX="center"
          anchorY="bottom"
        >
          {actualHeight.toFixed(2)} m
        </Text>
      )}
    </group>
  )
}
