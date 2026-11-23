"use client"

// Boids — a GPGPU flock. Positions and velocities live in two float
// textures that a pair of fragment shaders advance every frame; the
// birds are one instanced draw call that reads those textures.
//
// What keeps it fast:
//  - sliders write uniforms; only a change of flock size rebuilds
//  - the neighbour search is capped by a sample budget: past it each
//    bird looks at every n-th bird, with the offset rotating per frame
//  - the budget halves by itself when the frame rate stays low
//  - the loop stops when the canvas is off-screen or the tab is hidden

import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { OrbitControls } from "@react-three/drei"
// Direct module import — the Addons.js barrel re-exports LottieLoader,
// which in three r185 imports lottie-web from a CDN URL webpack can't
// bundle.
import { GPUComputationRenderer, type Variable } from "three/examples/jsm/misc/GPUComputationRenderer.js"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import { Panel } from "./panel"
import { DEFAULTS, type Params, type Stats } from "./params"

const WORLD = 400 // radius (or half-edge) of the space the flock lives in

const velocityShader = /* glsl */ `
  uniform float uDt;
  uniform float uTime;
  uniform int uStride;
  uniform int uOffset;
  uniform float uCohesion;
  uniform float uAlignment;
  uniform float uSeparation;
  uniform float uVision;
  uniform float uTurbulence;
  uniform float uWorld;
  uniform int uShape;       // 0 sphere, 1 box
  uniform vec3 uRayOrigin;  // pointer ray, world space
  uniform vec3 uRayDir;
  uniform float uPointer;   // >0 flee, <0 attract, 0 off
  uniform float uPointerRadius;

  const float MIN_SPEED = 45.0;
  const float MAX_SPEED = 130.0;

  void main() {
    ivec2 size = ivec2(resolution.xy);
    ivec2 me = ivec2(gl_FragCoord.xy);
    vec3 pos = texelFetch(texturePosition, me, 0).xyz;
    vec3 vel = texelFetch(textureVelocity, me, 0).xyz;
    vec3 dir = normalize(vel);

    int total = size.x * size.y;
    float sepRadius = uVision * 0.42;
    vec3 centre = vec3(0.0);
    vec3 heading = vec3(0.0);
    vec3 push = vec3(0.0);
    float seen = 0.0;

    for (int i = uOffset; i < total; i += uStride) {
      ivec2 other = ivec2(i % size.x, i / size.x);
      vec3 diff = texelFetch(texturePosition, other, 0).xyz - pos;
      float d2 = dot(diff, diff);
      if (d2 > uVision * uVision || d2 < 1e-6) continue;
      float d = sqrt(d2);
      vec3 toward = diff / d;
      // Birds don't see what is right behind them.
      if (dot(dir, toward) < -0.6) continue;
      centre += diff;
      heading += texelFetch(textureVelocity, other, 0).xyz;
      seen += 1.0;
      if (d < sepRadius) push -= toward * (1.0 - d / sepRadius);
    }

    vec3 acc = vec3(0.0);
    if (seen > 0.0) {
      acc += (centre / seen) * uCohesion * 1.2;
      acc += (heading / seen - vel) * uAlignment * 2.5;
      // A sum, not an average: scale it back up for the birds skipped.
      acc += push * uSeparation * 420.0 * min(float(uStride), 8.0);
    }

    // A slow flow field so the flock never settles into a static orbit.
    float f = 0.008;
    acc += uTurbulence * 45.0 * vec3(
      sin(pos.y * f + uTime * 0.31) + sin(pos.z * f * 1.7 - uTime * 0.17),
      sin(pos.z * f + uTime * 0.23) + sin(pos.x * f * 1.3 + uTime * 0.29),
      sin(pos.x * f - uTime * 0.19) + sin(pos.y * f * 1.9 + uTime * 0.13)
    );

    // Soft walls: the further out, the harder the turn back.
    if (uShape == 0) {
      float r = length(pos);
      if (r > uWorld) acc -= (pos / r) * (r - uWorld) * 3.0;
    } else {
      vec3 over = max(abs(pos) - uWorld * 0.8, 0.0);
      acc -= sign(pos) * over * 3.0;
    }

    // Pointer: distance to the ray under the cursor, so it works at
    // any depth and from any camera angle.
    if (uPointer != 0.0) {
      vec3 rel = pos - uRayOrigin;
      vec3 away = rel - uRayDir * dot(rel, uRayDir);
      float d = length(away);
      if (d < uPointerRadius && d > 1e-3) {
        acc += (away / d) * (1.0 - d / uPointerRadius) * uPointer * 900.0;
      }
    }

    vel += acc * uDt;
    float speed = length(vel);
    vel = (vel / max(speed, 1e-4)) * clamp(speed, MIN_SPEED, MAX_SPEED);
    gl_FragColor = vec4(vel, 1.0);
  }
`

const positionShader = /* glsl */ `
  uniform float uDt;
  void main() {
    ivec2 me = ivec2(gl_FragCoord.xy);
    vec3 pos = texelFetch(texturePosition, me, 0).xyz;
    vec3 vel = texelFetch(textureVelocity, me, 0).xyz;
    gl_FragColor = vec4(pos + vel * uDt, 1.0);
  }
`

const birdVertex = /* glsl */ `
  uniform sampler2D texturePosition;
  uniform sampler2D textureVelocity;
  uniform int uWidth;
  uniform float uSize;
  uniform float uTime;
  attribute float wing;
  varying vec3 vWorld;
  varying vec3 vDir;
  varying float vSpeed;
  varying float vSeed;
  varying float vDepth;

  void main() {
    ivec2 ref = ivec2(gl_InstanceID % uWidth, gl_InstanceID / uWidth);
    vec3 pos = texelFetch(texturePosition, ref, 0).xyz;
    vec3 vel = texelFetch(textureVelocity, ref, 0).xyz;
    float speed = length(vel);
    vec3 dir = vel / max(speed, 1e-4);
    float seed = fract(sin(float(gl_InstanceID) * 12.9898) * 43758.5453);

    vec3 up = abs(dir.y) > 0.98 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
    vec3 right = normalize(cross(up, dir));
    up = cross(dir, right);

    vec3 p = position;
    // Wing tips flap; faster birds beat faster.
    p.y += wing * sin(uTime * (9.0 + speed * 0.06) + seed * 6.283) * 0.75;
    vec3 world = pos + (right * p.x + up * p.y + dir * p.z) * uSize * (0.8 + seed * 0.4);

    vec4 view = viewMatrix * vec4(world, 1.0);
    gl_Position = projectionMatrix * view;
    vWorld = world;
    vDir = dir;
    vSpeed = speed;
    vSeed = seed;
    vDepth = -view.z;
  }
`

const birdFragment = /* glsl */ `
  uniform int uPalette;   // 0 ink, 1 heading, 2 speed, 3 dusk
  uniform vec3 uInk;
  uniform vec3 uPaper;
  uniform float uFogNear;
  uniform float uFogFar;
  varying vec3 vWorld;
  varying vec3 vDir;
  varying float vSpeed;
  varying float vSeed;
  varying float vDepth;

  vec3 hue(float h) {
    return clamp(abs(fract(h + vec3(0.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0) - 1.0, 0.0, 1.0);
  }

  void main() {
    // Flat shading from screen-space derivatives: no normals to carry.
    vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
    float light = 0.62 + 0.38 * abs(dot(n, normalize(vec3(0.4, 0.8, 0.45))));

    vec3 col;
    if (uPalette == 0) {
      col = uInk;
      light = mix(1.0, light, 0.35);
    } else if (uPalette == 1) {
      col = 0.5 + 0.5 * vDir;
    } else if (uPalette == 2) {
      float t = smoothstep(45.0, 130.0, vSpeed);
      col = mix(vec3(0.16, 0.45, 0.95), vec3(1.0, 0.36, 0.2), t);
    } else {
      col = mix(hue(0.02 + vSeed * 0.1), hue(0.72 + vDir.y * 0.08), 0.5 + 0.5 * vDir.x);
    }
    col *= light;

    // Fade into the paper with distance: depth without a skybox.
    float fog = smoothstep(uFogNear, uFogFar, vDepth);
    gl_FragColor = vec4(mix(col, uPaper, fog * 0.85), 1.0);
    #include <colorspace_fragment>
  }
`

// A dart with two wings, facing +z. The wing attribute marks the tips.
function birdGeometry(count: number) {
  const nose = [0, 0, 1.7], tail = [0, 0, -1.1], spine = [0, 0.28, -0.1]
  const left = [-1.5, 0, -0.7], rightTip = [1.5, 0, -0.7]
  const tris = [
    [nose, spine, left], [nose, rightTip, spine],
    [spine, tail, left], [spine, rightTip, tail],
  ]
  const position: number[] = []
  const wing: number[] = []
  for (const tri of tris) {
    for (const v of tri) {
      position.push(...v)
      wing.push(v === left || v === rightTip ? 1 : 0)
    }
  }
  const g = new THREE.InstancedBufferGeometry()
  g.setAttribute("position", new THREE.Float32BufferAttribute(position, 3))
  g.setAttribute("wing", new THREE.Float32BufferAttribute(wing, 1))
  g.instanceCount = count
  return g
}

function cssColor(name: string, fallback: string) {
  const c = new THREE.Color(fallback)
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
    if (/^#[0-9a-f]{3,8}$/i.test(v) || /^rgb/.test(v)) c.set(v)
  } catch {
    /* keep the fallback */
  }
  return c
}

interface Pointer {
  active: boolean
  x: number
  y: number
}

function Flock({
  count, seed, params, stats, pointer, paused, colors,
}: {
  count: number
  seed: number
  params: MutableRefObject<Params>
  stats: MutableRefObject<Stats>
  pointer: MutableRefObject<Pointer>
  paused: boolean
  colors: { ink: THREE.Color; paper: THREE.Color }
}) {
  const { gl, camera } = useThree()
  const width = Math.round(Math.sqrt(count))

  const sim = useMemo(() => {
    const compute = new GPUComputationRenderer(width, width, gl)
    // Phones without float render targets still get half floats.
    if (!gl.extensions.has("EXT_color_buffer_float")) compute.setDataType(THREE.HalfFloatType)

    const pos0 = compute.createTexture()
    const vel0 = compute.createTexture()
    const p = pos0.image.data as Float32Array
    const v = vel0.image.data as Float32Array
    for (let i = 0; i < p.length; i += 4) {
      // Uniform in a ball, so the flock starts as a cloud, not a cube.
      const r = WORLD * 0.9 * Math.cbrt(Math.random())
      const th = Math.random() * Math.PI * 2
      const cz = Math.random() * 2 - 1
      const s = Math.sqrt(1 - cz * cz)
      p[i] = r * s * Math.cos(th)
      p[i + 1] = r * s * Math.sin(th)
      p[i + 2] = r * cz
      p[i + 3] = 1
      v[i] = (Math.random() - 0.5) * 120
      v[i + 1] = (Math.random() - 0.5) * 120
      v[i + 2] = (Math.random() - 0.5) * 120
      v[i + 3] = 1
    }

    const velocity = compute.addVariable("textureVelocity", velocityShader, vel0)
    const position = compute.addVariable("texturePosition", positionShader, pos0)
    compute.setVariableDependencies(velocity, [velocity, position])
    compute.setVariableDependencies(position, [velocity, position])
    Object.assign(velocity.material.uniforms, {
      uDt: { value: 0 }, uTime: { value: 0 }, uStride: { value: 1 }, uOffset: { value: 0 },
      uCohesion: { value: 1 }, uAlignment: { value: 1 }, uSeparation: { value: 1 },
      uVision: { value: 60 }, uTurbulence: { value: 0.3 }, uWorld: { value: WORLD },
      uShape: { value: 0 }, uRayOrigin: { value: new THREE.Vector3() },
      uRayDir: { value: new THREE.Vector3(0, 0, -1) }, uPointer: { value: 0 },
      uPointerRadius: { value: 120 },
    })
    position.material.uniforms.uDt = { value: 0 }
    const error = compute.init()
    if (error) throw new Error(`boids: ${error}`)

    const geometry = birdGeometry(width * width)
    const material = new THREE.ShaderMaterial({
      uniforms: {
        texturePosition: { value: null }, textureVelocity: { value: null },
        uWidth: { value: width }, uSize: { value: 4 }, uTime: { value: 0 },
        uPalette: { value: 0 }, uInk: { value: new THREE.Color() }, uPaper: { value: new THREE.Color() },
        uFogNear: { value: 500 }, uFogFar: { value: 1900 },
      },
      vertexShader: birdVertex,
      fragmentShader: birdFragment,
      side: THREE.DoubleSide,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.frustumCulled = false
    return { compute, velocity, position, geometry, material, mesh }
    // `seed` is the reset button: a new value deals a fresh flock.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, width, seed])

  useEffect(
    () => () => {
      sim.compute.dispose()
      sim.geometry.dispose()
      sim.material.dispose()
    },
    [sim],
  )

  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const ndc = useMemo(() => new THREE.Vector2(), [])
  const clock = useRef({ time: 0, frame: 0, fpsTime: 0, fpsFrames: 0, slow: 0 })

  useFrame((_, delta) => {
    const P = params.current
    const c = clock.current
    const vu = (sim.velocity as Variable).material.uniforms
    const mu = sim.material.uniforms

    // Frame-rate independent, and a long stall never teleports birds.
    const dt = paused ? 0 : Math.min(delta, 1 / 30) * P.speed
    c.time += dt
    c.frame++

    const total = width * width
    const stride = Math.max(1, Math.ceil(total / stats.current.budget))
    vu.uDt.value = dt
    vu.uTime.value = c.time
    vu.uStride.value = stride
    vu.uOffset.value = c.frame % stride
    vu.uCohesion.value = P.cohesion
    vu.uAlignment.value = P.alignment
    vu.uSeparation.value = P.separation
    vu.uVision.value = P.vision
    vu.uTurbulence.value = P.turbulence
    vu.uShape.value = P.shape === "box" ? 1 : 0
    vu.uPointerRadius.value = P.pointerRadius
    if (pointer.current.active && P.pointer !== "off") {
      ndc.set(pointer.current.x, pointer.current.y)
      raycaster.setFromCamera(ndc, camera)
      vu.uRayOrigin.value.copy(raycaster.ray.origin)
      vu.uRayDir.value.copy(raycaster.ray.direction)
      vu.uPointer.value = P.pointer === "flee" ? P.pointerStrength : -P.pointerStrength * 0.6
    } else {
      vu.uPointer.value = 0
    }
    sim.position.material.uniforms.uDt.value = dt

    if (dt > 0) sim.compute.compute()

    mu.texturePosition.value = sim.compute.getCurrentRenderTarget(sim.position).texture
    mu.textureVelocity.value = sim.compute.getCurrentRenderTarget(sim.velocity).texture
    mu.uSize.value = P.size
    mu.uTime.value = c.time
    mu.uPalette.value = ["ink", "heading", "speed", "dusk"].indexOf(P.palette)
    mu.uInk.value.copy(colors.ink)
    mu.uPaper.value.copy(colors.paper)

    // FPS readout, and the automatic budget: two slow seconds in a row
    // halve how many neighbours each bird samples.
    c.fpsTime += delta
    c.fpsFrames++
    if (c.fpsTime >= 1) {
      const fps = c.fpsFrames / c.fpsTime
      stats.current.fps = Math.round(fps)
      stats.current.stride = stride
      c.fpsTime = 0
      c.fpsFrames = 0
      c.slow = fps < 32 && !paused ? c.slow + 1 : 0
      if (c.slow >= 2 && stats.current.budget > 256) {
        stats.current.budget /= 2
        c.slow = 0
      }
    }
  })

  return (
    <>
      <primitive object={sim.mesh} />
      {params.current.showBounds &&
        (params.current.shape === "box" ? (
          <mesh>
            <boxGeometry args={[WORLD * 1.6, WORLD * 1.6, WORLD * 1.6]} />
            <meshBasicMaterial color={colors.ink} wireframe transparent opacity={0.25} />
          </mesh>
        ) : (
          <mesh>
            <icosahedronGeometry args={[WORLD, 2]} />
            <meshBasicMaterial color={colors.ink} wireframe transparent opacity={0.12} />
          </mesh>
        ))}
    </>
  )
}

export default function BoidsScene() {
  const wrap = useRef<HTMLDivElement | null>(null)
  const [params, setParams] = useState<Params>(DEFAULTS)
  const paramsRef = useRef(params)
  paramsRef.current = params
  const [count, setCount] = useState(1024)
  const [seed, setSeed] = useState(0)
  const [paused, setPaused] = useState(false)
  const [visible, setVisible] = useState(true)
  const [colors, setColors] = useState(() => ({
    ink: new THREE.Color("#1a1d28"),
    paper: new THREE.Color("#f6f6f4"),
  }))
  const stats = useRef<Stats>({ fps: 0, stride: 1, budget: 2048 })
  const pointer = useRef<Pointer>({ active: false, x: 0, y: 0 })

  // Size the flock and the neighbour budget to the device once.
  useEffect(() => {
    const small = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768
    stats.current.budget = small ? 1024 : 4096
    setCount(small ? 1024 : 4096)
  }, [])

  // Follow the site's light / dark theme.
  useEffect(() => {
    const read = () =>
      setColors({ ink: cssColor("--ink", "#1a1d28"), paper: cssColor("--surface-dark", "#f6f6f4") })
    read()
    const mo = new MutationObserver(read)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] })
    return () => mo.disconnect()
  }, [])

  // Don't burn a GPU nobody is looking at.
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    let onScreen = true
    const update = () => setVisible(onScreen && !document.hidden)
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting
      update()
    })
    io.observe(el)
    document.addEventListener("visibilitychange", update)
    return () => {
      io.disconnect()
      document.removeEventListener("visibilitychange", update)
    }
  }, [])

  const onPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    pointer.current.x = ((e.clientX - r.left) / r.width) * 2 - 1
    pointer.current.y = -((e.clientY - r.top) / r.height) * 2 + 1
    pointer.current.active = true
  }
  const offPointer = () => {
    pointer.current.active = false
  }

  const changeCount = (n: number) => {
    // A bigger flock gets a fresh chance at the full budget.
    stats.current.budget = Math.max(stats.current.budget, 1024)
    setCount(n)
  }

  return (
    <div ref={wrap} className="relative h-full w-full overflow-hidden" style={{ background: "var(--surface-dark)" }}>
      <div
        className="absolute inset-0"
        onPointerMove={onPointer}
        onPointerDown={onPointer}
        onPointerLeave={offPointer}
        onPointerUp={(e) => e.pointerType !== "mouse" && offPointer()}
        onPointerCancel={offPointer}
      >
        <Canvas
          camera={{ position: [0, 120, 980], fov: 50, near: 5, far: 6000 }}
          dpr={[1, 2]}
          frameloop={visible ? "always" : "never"}
          gl={{ antialias: true, powerPreference: "high-performance" }}
        >
          <color attach="background" args={[colors.paper]} />
          <Flock
            count={count}
            seed={seed}
            params={paramsRef}
            stats={stats}
            pointer={pointer}
            paused={paused}
            colors={colors}
          />
          <OrbitControls
            enableDamping
            dampingFactor={0.08}
            enablePan={false}
            minDistance={150}
            maxDistance={2200}
            autoRotate={params.autoRotate && !paused}
            autoRotateSpeed={0.6}
          />
          {params.bloom > 0 && (
            <EffectComposer>
              <Bloom intensity={params.bloom} luminanceThreshold={0.25} luminanceSmoothing={0.6} mipmapBlur />
            </EffectComposer>
          )}
        </Canvas>
      </div>

      <Panel
        params={params}
        onParams={setParams}
        count={count}
        onCount={changeCount}
        paused={paused}
        onPause={() => setPaused((p) => !p)}
        onReset={() => setSeed((s) => s + 1)}
        stats={stats}
        fullscreenTarget={wrap}
      />
    </div>
  )
}
