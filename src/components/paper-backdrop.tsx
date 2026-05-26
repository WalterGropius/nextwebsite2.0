"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"

// PaperBackdrop — global texture layer mounted once at the root.
//
//   1. A WebGL fragment-shader canvas painting procedural paper grain
//      (dust + soft fibre fbm). Animates at a low rate so the grain
//      crawls like real film.
//   2. An SVG millimeter-grid pattern rotated 6° and warped by the
//      ink-wobble filter so the lines feel like a hand-folded sheet.
//
// Both layers are fixed and pointer-events:none. They sit above the
// background but below all content (z-index: 1). Body::before grain
// is removed in favour of this richer overlay.

function PaperGrain({ dark }: { dark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const darkRef = useRef(dark)
  useEffect(() => {
    darkRef.current = dark
  }, [dark])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      preserveDrawingBuffer: false,
    })
    if (!gl) return

    const vsrc = `
      attribute vec2 a;
      varying vec2 v;
      void main() {
        v = a * 0.5 + 0.5;
        gl_Position = vec4(a, 0.0, 1.0);
      }`

    const fsrc = `
      precision highp float;
      varying vec2 v;
      uniform float u_time;
      uniform vec2 u_res;
      uniform float u_dark;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }
      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.55;
        for (int i = 0; i < 4; i++) {
          v += a * noise(p);
          p *= 2.07;
          a *= 0.5;
        }
        return v;
      }
      void main() {
        vec2 px = gl_FragCoord.xy;
        float t = u_time;

        // crawling dust grain — re-hashed each animation tick
        float dust = hash(px + vec2(t * 11.0, t * 7.0));

        // soft paper fibres — anisotropic fbm to fake a wove direction
        vec2 fib = vec2(px.x * 0.6, px.y * 2.2) / 90.0;
        float fibres = fbm(fib + vec2(t * 0.05, 0.0));

        // coarse stains — large blotches like watered paper
        float stains = fbm(px / 420.0);

        float val = dust * 0.55 + fibres * 0.35 + stains * 0.30;
        val = clamp(val, 0.0, 1.0);

        if (u_dark > 0.5) {
          // light dust on dark paper — screen-style additive haze
          float a = val * 0.22;
          gl_FragColor = vec4(vec3(val * 0.85), a);
        } else {
          // dark grain on cream paper — multiply-style subtractive
          float a = (1.0 - val) * 0.22 + 0.05;
          gl_FragColor = vec4(vec3(0.04, 0.05, 0.07), a);
        }
      }`

    function compile(type: number, source: string) {
      const sh = gl!.createShader(type)!
      gl!.shaderSource(sh, source)
      gl!.compileShader(sh)
      if (!gl!.getShaderParameter(sh, gl!.COMPILE_STATUS)) {
        console.error("PaperGrain shader compile:", gl!.getShaderInfoLog(sh))
      }
      return sh
    }

    const vs = compile(gl.VERTEX_SHADER, vsrc)
    const fs = compile(gl.FRAGMENT_SHADER, fsrc)
    const prog = gl.createProgram()!
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.bindAttribLocation(prog, 0, "a")
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    )
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(prog, "u_time")
    const uRes = gl.getUniformLocation(prog, "u_res")
    const uDark = gl.getUniformLocation(prog, "u_dark")

    let dpr = Math.min(window.devicePixelRatio || 1, 1.25)
    function resize() {
      const w = Math.floor(window.innerWidth * dpr)
      const h = Math.floor(window.innerHeight * dpr)
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w
        canvas!.height = h
        gl!.viewport(0, 0, w, h)
        gl!.uniform2f(uRes, w, h)
      }
    }
    resize()
    window.addEventListener("resize", resize, { passive: true })

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    let raf = 0
    let last = performance.now()
    // Cap to ~18fps — grain only needs to crawl, not race
    const interval = 1000 / 18
    let acc = 0
    let t0 = performance.now()

    const tick = (now: number) => {
      const dt = now - last
      last = now
      acc += dt
      if (acc >= interval) {
        acc = 0
        gl!.uniform1f(uTime, (now - t0) * 0.001)
        gl!.uniform1f(uDark, darkRef.current ? 1.0 : 0.0)
        gl!.drawArrays(gl!.TRIANGLES, 0, 3)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      gl.deleteBuffer(buf)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteProgram(prog)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      data-paper-grain
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        // Same stack as the millimeter grid so paper texture reads
        // over every section. Hero section lifts itself above this to
        // mask the texture out from the 3D canvas.
        zIndex: 30,
        mixBlendMode: dark ? "screen" : "multiply",
        opacity: dark ? 0.9 : 1,
      }}
    />
  )
}

function MillimeterGrid({ dark }: { dark: boolean }) {
  // Lines: saturated deep spruce on cream paper, near-white on dark.
  const lineColor = dark ? "#ffffff" : "#1f4a2b"
  return (
    <div
      aria-hidden
      data-paper-grid
      style={{
        position: "fixed",
        inset: "-12vmax",
        pointerEvents: "none",
        // Above the page-level content backgrounds (z-20) so the grid
        // reads on top of every section, but below the navigation
        // (z-50) and below the hero/canvas section (which sets z-[60]
        // on the landing page to mask the grid out from the 3D view).
        zIndex: 30,
        transform: "rotate(-6deg)",
        transformOrigin: "50% 50%",
        opacity: dark ? 0.42 : 0.42,
        color: lineColor,
        mixBlendMode: dark ? "screen" : "multiply",
      }}
    >
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: "100%",
          height: "100%",
          filter: "url(#ink-wobble)",
          display: "block",
        }}
      >
        <defs>
          <pattern
            id="paper-mm"
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 14 0 L 0 0 0 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.35"
              strokeOpacity="0.55"
            />
          </pattern>
          <pattern
            id="paper-cm"
            width="70"
            height="70"
            patternUnits="userSpaceOnUse"
          >
            <rect width="70" height="70" fill="url(#paper-mm)" />
            <path
              d="M 70 0 L 0 0 0 70"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.9"
              strokeOpacity="0.9"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#paper-cm)" />
      </svg>
    </div>
  )
}

export function PaperBackdrop() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const dark = mounted && resolvedTheme === "dark"
  if (!mounted) return null
  return (
    <>
      <MillimeterGrid dark={dark} />
      <PaperGrain dark={dark} />
    </>
  )
}
