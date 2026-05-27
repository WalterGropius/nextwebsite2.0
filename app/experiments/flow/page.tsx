"use client"

// Flow — WebGPU + TSL particle field. 200k points pushed around by
// curl-noise plus cursor attraction, ran on the GPU through Three's
// new TSL compute pipeline. If WebGPU isn't available we render an
// idle CSS card explaining why; we don't fall back to WebGL because
// the whole point of the page is the WebGPU path.
//
// Built directly on three.webgpu + three.tsl — no react-three-fiber
// for the renderer, just a useEffect that mounts a WebGPURenderer
// on a canvas and tears it down on unmount.

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { PageLoader } from "@/components/page-loader"

type Stage = "probing" | "unsupported" | "running" | "error"

export default function FlowPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const mouse = useRef({ x: 0, y: 0, active: 0 })
  const [stage, setStage] = useState<Stage>("probing")
  const [reason, setReason] = useState<string>("")

  useEffect(() => {
    let cancelled = false
    let cleanup: (() => void) | null = null
    ;(async () => {
      // Probe WebGPU
      const nav = navigator as Navigator & { gpu?: { requestAdapter?: () => Promise<unknown> } }
      if (!nav.gpu) {
        setStage("unsupported")
        return
      }

      try {
        const THREE = await import("three/webgpu")
        const TSL = await import("three/tsl")
        if (cancelled) return

        const {
          WebGPURenderer,
          Scene,
          PerspectiveCamera,
          Color,
          AdditiveBlending,
          BufferGeometry,
          Mesh,
          PlaneGeometry,
          StorageInstancedBufferAttribute,
          InstancedMesh,
          NodeMaterial,
          Vector2,
        } = THREE as unknown as typeof import("three/webgpu") & {
          Vector2: typeof import("three").Vector2
          BufferGeometry: typeof import("three").BufferGeometry
          PlaneGeometry: typeof import("three").PlaneGeometry
          Mesh: typeof import("three").Mesh
          InstancedMesh: typeof import("three").InstancedMesh
          PerspectiveCamera: typeof import("three").PerspectiveCamera
          Scene: typeof import("three").Scene
          Color: typeof import("three").Color
          AdditiveBlending: number
        }

        const {
          Fn,
          vec3,
          vec4,
          float,
          uint,
          uniform,
          instanceIndex,
          mix,
          length,
          smoothstep,
          time,
          positionLocal,
          attribute,
          cameraPosition,
          modelWorldMatrix,
          cameraProjectionMatrix,
          cameraViewMatrix,
          color,
        } = TSL

        const canvas = canvasRef.current
        const wrap = wrapRef.current
        if (!canvas || !wrap) return

        const renderer = new WebGPURenderer({ canvas, antialias: true, alpha: true })
        // initialise — required for WebGPU async setup
        await renderer.init()
        if (cancelled) {
          renderer.dispose()
          return
        }

        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const resize = () => {
          const r = wrap.getBoundingClientRect()
          renderer.setSize(r.width, r.height, false)
          renderer.setPixelRatio(dpr)
          camera.aspect = r.width / r.height
          camera.updateProjectionMatrix()
        }

        const scene = new Scene()
        scene.background = null

        const camera = new PerspectiveCamera(55, 1, 0.1, 100)
        camera.position.set(0, 0, 6)
        camera.lookAt(0, 0, 0)

        // ===== particles =================================================
        const COUNT = 200_000

        // initial positions in a thin disk
        const initPos = new Float32Array(COUNT * 4)
        const initVel = new Float32Array(COUNT * 4)
        for (let i = 0; i < COUNT; i++) {
          const a = Math.random() * Math.PI * 2
          const r = Math.sqrt(Math.random()) * 3
          initPos[i * 4 + 0] = Math.cos(a) * r
          initPos[i * 4 + 1] = Math.sin(a) * r
          initPos[i * 4 + 2] = (Math.random() - 0.5) * 0.4
          initPos[i * 4 + 3] = Math.random() // unused / lifetime
          initVel[i * 4 + 0] = 0
          initVel[i * 4 + 1] = 0
          initVel[i * 4 + 2] = 0
          initVel[i * 4 + 3] = 0
        }

        const positions = new StorageInstancedBufferAttribute(initPos, 4)
        const velocities = new StorageInstancedBufferAttribute(initVel, 4)
        // TSL storage handles for compute
        // signature: storage(buffer, type, count)
        // type: 'vec4'
        // eslint-disable-next-line
        const storage = (TSL as any).storage
        const posBuf = storage(positions, "vec4", COUNT)
        const velBuf = storage(velocities, "vec4", COUNT)

        // uniforms
        const uMouse = uniform(new Vector2(0, 0))
        const uMouseActive = uniform(0.0)
        const uDt = uniform(0.016)

        // tiny pseudo curl-noise: two sin/cos bands; cheap, looks fluid.
        // eslint-disable-next-line
        const curl = Fn(([p]: [any]) => {
          // p is vec3
          // eslint-disable-next-line
          const s = (TSL as any).sin
          // eslint-disable-next-line
          const c = (TSL as any).cos
          const x = p.x.mul(1.4).add(time.mul(0.6))
          const y = p.y.mul(1.4).add(time.mul(0.5))
          const z = p.z.mul(1.4).add(time.mul(0.4))
          return vec3(
            s(y).mul(0.9).add(c(z).mul(0.6)),
            s(z).mul(0.9).add(c(x).mul(0.6)),
            s(x).mul(0.4).add(c(y).mul(0.4)),
          )
        })

        const computeNode = Fn(() => {
          // eslint-disable-next-line
          const i = uint(instanceIndex) as any
          const pos = posBuf.element(i)
          const vel = velBuf.element(i)

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

        // === geometry + material for the particles =====================
        // Each particle is a tiny billboard quad. We bypass three's
        // normal Points pipeline so we have full control over the
        // shader.
        const geo = new PlaneGeometry(0.018, 0.018)
        // eslint-disable-next-line
        const mesh = new InstancedMesh(geo, undefined as any, COUNT)
        mesh.frustumCulled = false

        const mat = new NodeMaterial()
        mat.transparent = true
        mat.depthWrite = false
        // eslint-disable-next-line
        ;(mat as any).blending = AdditiveBlending

        // vertex shader: place each instance at the storage position
        // eslint-disable-next-line
        mat.vertexNode = Fn(() => {
          // eslint-disable-next-line
          const i = uint(instanceIndex) as any
          const worldPos = posBuf.element(i).xyz
          // billboard: convert position to view space, add localPos
          const mvPos = cameraViewMatrix.mul(modelWorldMatrix).mul(vec4(worldPos, 1.0))
          // eslint-disable-next-line
          const billboard = (mvPos as any).xyz.add(vec3(positionLocal.x, positionLocal.y, 0))
          return cameraProjectionMatrix.mul(vec4(billboard, 1.0))
        })()

        // fragment shader: gradient by speed
        // eslint-disable-next-line
        mat.fragmentNode = Fn(() => {
          // eslint-disable-next-line
          const i = uint(instanceIndex) as any
          const speed = length(velBuf.element(i).xyz).mul(0.6)
          const tCool = color(new Color("#3a8da8"))
          const tWarm = color(new Color("#ffb066"))
          const c = mix(tCool, tWarm, smoothstep(0.0, 1.6, speed))
          const alpha = float(0.22).add(speed.mul(0.15))
          return vec4(c, alpha)
        })()

        mesh.material = mat
        scene.add(mesh)

        // pointer
        const onMove = (e: PointerEvent) => {
          const r = wrap.getBoundingClientRect()
          // convert to normalized clip space then to scene plane (z=0)
          const ndcX = ((e.clientX - r.left) / r.width) * 2 - 1
          const ndcY = -(((e.clientY - r.top) / r.height) * 2 - 1)
          // approximate: scale to scene units (camera fov 55 @ z=6)
          const sceneY = Math.tan((55 * Math.PI) / 360) * 6
          const sceneX = sceneY * (r.width / r.height)
          mouse.current.x = ndcX * sceneX
          mouse.current.y = ndcY * sceneY
          mouse.current.active = 1
        }
        const onLeave = () => { mouse.current.active = 0 }
        wrap.addEventListener("pointermove", onMove)
        wrap.addEventListener("pointerleave", onLeave)
        window.addEventListener("resize", resize)
        resize()

        setStage("running")

        let last = performance.now()
        let raf = 0
        const tick = (now: number) => {
          const dt = Math.min(0.05, (now - last) / 1000)
          last = now
          uMouse.value.set(mouse.current.x, mouse.current.y)
          uMouseActive.value = mouse.current.active
          uDt.value = dt
          // eslint-disable-next-line
          ;(renderer as any).computeAsync(computeNode)
          renderer.render(scene, camera)
          raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)

        cleanup = () => {
          cancelAnimationFrame(raf)
          wrap.removeEventListener("pointermove", onMove)
          wrap.removeEventListener("pointerleave", onLeave)
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
            flow · webgpu
          </h1>
          <p
            className="mt-3 max-w-2xl text-sm sm:text-base"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-display)",
            }}
          >
            200,000 particles, GPU-resident, advected by curl noise and your
            cursor. Built on Three.js TSL → WebGPU compute shaders. Move the
            mouse over the canvas to perturb the field.
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
          {stage !== "running" && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center"
              style={{ background: "color-mix(in srgb, var(--surface-dark) 92%, transparent)" }}
            >
              {stage === "probing" && (
                <span className="text-sm uppercase tracking-[0.3em]" style={{ color: "var(--text-muted)" }}>
                  probing webgpu…
                </span>
              )}
              {stage === "unsupported" && (
                <>
                  <span className="text-sm uppercase tracking-[0.3em]" style={{ color: "var(--text-muted)" }}>
                    webgpu unavailable
                  </span>
                  <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }} className="max-w-md">
                    This page only runs in browsers with WebGPU enabled
                    (Chrome 113+, Edge 113+, recent Safari TP). Firefox needs
                    the `dom.webgpu.enabled` flag.
                  </p>
                </>
              )}
              {stage === "error" && (
                <>
                  <span className="text-sm uppercase tracking-[0.3em]" style={{ color: "var(--vermilion, #ee4a44)" }}>
                    webgpu pipeline crashed
                  </span>
                  <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }} className="max-w-md text-xs">
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
