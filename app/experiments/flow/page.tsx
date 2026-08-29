"use client"

// Flow — Three.js TSL particle field on the WebGPU renderer.
//
// The same TSL compute pipeline now runs on two backends:
//   · WebGPU        → real compute shaders, 200k particles
//   · WebGL 2       → three's fallback backend (transform feedback),
//                     smaller budget, identical visuals
// so the page works for every visitor instead of dead-ending on a
// "webgpu unavailable" card. Speed-based colour is computed in the
// vertex stage and passed as a varying — storage reads aren't legal
// in fragment shaders on the WebGL fallback.
//
// Built directly on three/webgpu + three/tsl — no react-three-fiber
// for the renderer, just a useEffect that mounts the renderer on a
// canvas and tears it down on unmount.

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { PageLoader } from "@/components/page-loader"
import { getDeviceTier } from "@/lib/device-tier"
import { perfHudEnabled } from "@/lib/perf"

type Stage = "probing" | "running" | "error"
type Backend = "webgpu" | "webgl2"

// Particle budgets. WebGPU chews through these; the transform-feedback
// fallback is still GPU-resident but pays more per particle.
const BUDGET: Record<Backend, Record<string, number>> = {
  webgpu: { low: 40_000, mid: 120_000, high: 200_000 },
  webgl2: { low: 12_000, mid: 30_000, high: 60_000 },
}

export default function FlowPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const mouse = useRef({ x: 0, y: 0, active: 0 })
  const [stage, setStage] = useState<Stage>("probing")
  const [backend, setBackend] = useState<Backend | null>(null)
  const [count, setCount] = useState(0)
  const [fps, setFps] = useState(0)
  const [reason, setReason] = useState<string>("")
  const hud = useRef(false)

  useEffect(() => {
    hud.current = perfHudEnabled()
    let cancelled = false
    let cleanup: (() => void) | null = null
    ;(async () => {
      const nav = navigator as Navigator & {
        gpu?: { requestAdapter?: () => Promise<unknown> }
      }
      // Prefer WebGPU, fall back to the WebGL2 backend of the same
      // renderer — same scene graph, same TSL, no separate code path.
      let useWebGPU = false
      if (nav.gpu?.requestAdapter) {
        try {
          useWebGPU = (await nav.gpu.requestAdapter()) != null
        } catch {
          useWebGPU = false
        }
      }
      if (cancelled) return

      try {
        const THREE = await import("three/webgpu")
        const TSL = await import("three/tsl")
        if (cancelled) return

        const {
          Fn,
          vec3,
          vec4,
          float,
          uniform,
          instanceIndex,
          mix,
          length,
          smoothstep,
          time,
          positionLocal,
          cameraProjectionMatrix,
          cameraViewMatrix,
          modelWorldMatrix,
          color,
          storage,
          varying,
          sin,
          cos,
        } = TSL

        const canvas = canvasRef.current
        const wrap = wrapRef.current
        if (!canvas || !wrap) return

        const renderer = new THREE.WebGPURenderer({
          canvas,
          antialias: true,
          alpha: true,
          forceWebGL: !useWebGPU,
        })
        await renderer.init()
        if (cancelled) {
          renderer.dispose()
          return
        }
        const activeBackend: Backend = useWebGPU ? "webgpu" : "webgl2"
        setBackend(activeBackend)

        const tier = getDeviceTier()
        const COUNT = BUDGET[activeBackend][tier]
        setCount(COUNT)

        const dpr = Math.min(
          window.devicePixelRatio || 1,
          activeBackend === "webgpu" ? 2 : 1.5,
        )

        const scene = new THREE.Scene()
        scene.background = null

        const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100)
        camera.position.set(0, 0, 6)
        camera.lookAt(0, 0, 0)

        const resize = () => {
          const r = wrap.getBoundingClientRect()
          renderer.setSize(r.width, r.height, false)
          renderer.setPixelRatio(dpr)
          camera.aspect = r.width / r.height
          camera.updateProjectionMatrix()
        }

        // ===== particles ================================================
        // initial positions in a thin disk
        const initPos = new Float32Array(COUNT * 4)
        const initVel = new Float32Array(COUNT * 4)
        for (let i = 0; i < COUNT; i++) {
          const a = Math.random() * Math.PI * 2
          const r = Math.sqrt(Math.random()) * 3
          initPos[i * 4 + 0] = Math.cos(a) * r
          initPos[i * 4 + 1] = Math.sin(a) * r
          initPos[i * 4 + 2] = (Math.random() - 0.5) * 0.4
          initPos[i * 4 + 3] = Math.random()
        }

        const positions = new THREE.StorageInstancedBufferAttribute(initPos, 4)
        const velocities = new THREE.StorageInstancedBufferAttribute(initVel, 4)
        const posBuf = storage(positions, "vec4", COUNT)
        const velBuf = storage(velocities, "vec4", COUNT)

        const uMouse = uniform(new THREE.Vector2(0, 0))
        const uMouseActive = uniform(0.0)
        const uDt = uniform(0.016)

        // tiny pseudo curl-noise: two sin/cos bands; cheap, looks fluid.
        // eslint-disable-next-line
        const curl = Fn(([p]: [any]) => {
          const x = p.x.mul(1.4).add(time.mul(0.6))
          const y = p.y.mul(1.4).add(time.mul(0.5))
          const z = p.z.mul(1.4).add(time.mul(0.4))
          return vec3(
            sin(y).mul(0.9).add(cos(z).mul(0.6)),
            sin(z).mul(0.9).add(cos(x).mul(0.6)),
            sin(x).mul(0.4).add(cos(y).mul(0.4)),
          )
        })

        const computeNode = Fn(() => {
          const pos = posBuf.element(instanceIndex)
          const vel = velBuf.element(instanceIndex)

          // curl-noise force
          const force = curl(pos.xyz).mul(0.7)
          // attraction toward (uMouse, 0) when active
          const toward = vec3(uMouse.x, uMouse.y, 0).sub(pos.xyz)
          const distSq = length(toward).max(0.001)
          const attract = toward.div(distSq).mul(uMouseActive).mul(2.2)

          // velocity integration + damping
          vel.xyz.assign(vel.xyz.add(force.add(attract).mul(uDt)).mul(0.94))
          // position integration
          pos.xyz.assign(pos.xyz.add(vel.xyz.mul(uDt)))
        })().compute(COUNT)

        // === geometry + material =======================================
        // Each particle is a tiny billboard quad; instanced so the whole
        // field is one draw call.
        const geo = new THREE.PlaneGeometry(0.018, 0.018)
        // eslint-disable-next-line
        const mesh = new THREE.InstancedMesh(geo, undefined as any, COUNT)
        mesh.frustumCulled = false

        const mat = new THREE.NodeMaterial()
        mat.transparent = true
        mat.depthWrite = false
        mat.blending = THREE.AdditiveBlending

        // Everything that touches the storage buffers happens in the
        // vertex stage; the fragment stage only sees varyings. This is
        // what makes the WebGL fallback possible.
        const worldPos = posBuf.element(instanceIndex).xyz
        const speed = length(velBuf.element(instanceIndex).xyz).mul(0.6)
        const vSpeed = varying(speed)

        mat.vertexNode = Fn(() => {
          const mvPos = cameraViewMatrix
            .mul(modelWorldMatrix)
            .mul(vec4(worldPos, 1.0))
          // eslint-disable-next-line
          const billboard = (mvPos as any).xyz.add(
            vec3(positionLocal.x, positionLocal.y, 0),
          )
          return cameraProjectionMatrix.mul(vec4(billboard, 1.0))
        })()

        mat.fragmentNode = Fn(() => {
          const tCool = color(new THREE.Color("#3a8da8"))
          const tWarm = color(new THREE.Color("#ffb066"))
          const c = mix(tCool, tWarm, smoothstep(0.0, 1.6, vSpeed))
          const alpha = float(0.22).add(vSpeed.mul(0.15))
          return vec4(c, alpha)
        })()

        mesh.material = mat
        scene.add(mesh)

        // pointer + touch — touchmove stays passive so the page can
        // still scroll; the field just reacts while a finger drags.
        const setPointer = (clientX: number, clientY: number) => {
          const r = wrap.getBoundingClientRect()
          const ndcX = ((clientX - r.left) / r.width) * 2 - 1
          const ndcY = -(((clientY - r.top) / r.height) * 2 - 1)
          const sceneY = Math.tan((55 * Math.PI) / 360) * 6
          const sceneX = sceneY * (r.width / r.height)
          mouse.current.x = ndcX * sceneX
          mouse.current.y = ndcY * sceneY
          mouse.current.active = 1
        }
        const onMove = (e: PointerEvent) => setPointer(e.clientX, e.clientY)
        const onTouch = (e: TouchEvent) => {
          if (e.touches[0]) setPointer(e.touches[0].clientX, e.touches[0].clientY)
        }
        const onLeave = () => {
          mouse.current.active = 0
        }
        wrap.addEventListener("pointermove", onMove)
        wrap.addEventListener("touchmove", onTouch, { passive: true })
        wrap.addEventListener("pointerleave", onLeave)
        wrap.addEventListener("touchend", onLeave)
        window.addEventListener("resize", resize)
        resize()

        setStage("running")

        let last = performance.now()
        let raf = 0
        let frames = 0
        let fpsWindowStart = last
        const tick = (now: number) => {
          const dt = Math.min(0.05, (now - last) / 1000)
          last = now
          uMouse.value.set(mouse.current.x, mouse.current.y)
          uMouseActive.value = mouse.current.active
          uDt.value = dt
          renderer.computeAsync(computeNode)
          renderer.render(scene, camera)
          if (hud.current) {
            frames++
            if (now - fpsWindowStart >= 500) {
              setFps(Math.round((frames * 1000) / (now - fpsWindowStart)))
              frames = 0
              fpsWindowStart = now
            }
          }
          raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)

        cleanup = () => {
          cancelAnimationFrame(raf)
          wrap.removeEventListener("pointermove", onMove)
          wrap.removeEventListener("touchmove", onTouch)
          wrap.removeEventListener("pointerleave", onLeave)
          wrap.removeEventListener("touchend", onLeave)
          window.removeEventListener("resize", resize)
          mesh.geometry.dispose()
          mat.dispose()
          renderer.dispose()
        }
      } catch (e) {
        if (cancelled) return
        setReason(e instanceof Error ? e.message : String(e))
        setStage("error")
      }
    })()
    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [])

  return (
    <PageLoader>
      <main
        className="relative min-h-screen"
        style={{ background: "var(--surface-dark)" }}
      >
        <Navigation />
        <section
          className="section-container relative pb-12 pt-28 sm:pt-32"
          style={{ zIndex: 35 }}
        >
          <Link
            href="/more"
            className="mb-6 inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em]"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-display)",
            }}
          >
            <ArrowLeft size={14} className="ink-icon" />
            <span className="ink-underline-hover">more</span>
          </Link>
          <h1
            className="text-[clamp(2.4rem,6vw,5rem)] leading-[0.9]"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          >
            flow * webgpu
          </h1>
          <p
            className="mt-3 max-w-2xl text-sm sm:text-base"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-display)",
            }}
          >
            {count > 0 ? count.toLocaleString("en-US") : "200,000"} particles,
            GPU-resident, advected by curl noise and your cursor. Three.js TSL
            compute — WebGPU where the browser has it, transform-feedback
            WebGL 2 everywhere else. Move over the canvas to perturb the
            field.
          </p>
        </section>

        <div
          ref={wrapRef}
          className="relative mx-auto w-full overflow-hidden"
          style={{
            height: "min(72vh, 720px)",
            border: "1.5px solid var(--ink)",
            filter: "url(#ink-wobble)",
            maxWidth: "min(1400px, 96vw)",
            background:
              "color-mix(in srgb, var(--surface-dark) 92%, var(--ink) 8%)",
            zIndex: 35,
          }}
        >
          <canvas
            ref={canvasRef}
            className="block h-full w-full"
            style={{ cursor: "crosshair" }}
          />
          {backend && stage === "running" && (
            <div
              className="pointer-events-none absolute left-3 top-3 flex items-center gap-3 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em]"
              style={{
                color: "var(--text-muted)",
                background:
                  "color-mix(in srgb, var(--surface-dark) 82%, transparent)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <span>{backend === "webgpu" ? "webgpu" : "webgl2 fallback"}</span>
              {fps > 0 && <span>{fps} fps</span>}
            </div>
          )}
          {stage !== "running" && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center"
              style={{
                background:
                  "color-mix(in srgb, var(--surface-dark) 92%, transparent)",
              }}
            >
              {stage === "probing" && (
                <span
                  className="text-sm uppercase tracking-[0.3em]"
                  style={{ color: "var(--text-muted)" }}
                >
                  waking the gpu…
                </span>
              )}
              {stage === "error" && (
                <>
                  <span
                    className="text-sm uppercase tracking-[0.3em]"
                    style={{ color: "var(--vermilion, #ee4a44)" }}
                  >
                    gpu pipeline crashed
                  </span>
                  <p
                    style={{
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-display)",
                    }}
                    className="max-w-md text-xs"
                  >
                    {reason}
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </PageLoader>
  )
}
