"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"

// PaperBackdrop — global texture layer mounted once at the root.
//
//   1. A WebGL fragment-shader canvas painting procedural paper grain:
//      half uniform white-noise speckle, half fractal (fibres + stains).
//      Drawn once — paper does not shimmer, and a permanent full-viewport
//      repaint loop is the single most expensive thing a backdrop can do.
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
      preserveDrawingBuffer: true,
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
      uniform vec2 u_res;
      uniform float u_dpr;
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
      // Five octaves: summing independent octaves pushes the distribution
      // toward a normal one (central limit), which is what gives the smooth
      // half of the mix its organic, non-uniform feel.
      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        float norm = 0.0;
        for (int i = 0; i < 5; i++) {
          v += a * noise(p);
          norm += a;
          p *= 2.07;
          a *= 0.5;
        }
        return v / norm;
      }
      void main() {
        // Work in CSS pixels so the grain is the same physical size
        // whatever the device pixel ratio.
        vec2 px = gl_FragCoord.xy / u_dpr;

        // --- half 1: uniform white noise, quantised into cells so the
        // speckle reads as paper tooth rather than single-pixel fizz ---
        float white = hash(floor(px / 2.4));

        // --- half 2: fractal / near-gaussian. Three scales: fine tooth,
        // anisotropic wove fibres, and broad watermark stains ---
        float tooth = fbm(px / 9.0);
        float fibres = fbm(vec2(px.x * 0.6, px.y * 2.2) / 70.0);
        float stains = fbm(px / 340.0);
        float fractal = tooth * 0.45 + fibres * 0.34 + stains * 0.21;

        // Exactly half and half — uniform speckle over organic structure.
        float val = clamp(0.5 * white + 0.5 * fractal, 0.0, 1.0);

        if (u_dark > 0.5) {
          // light dust on dark paper — screen-style additive haze
          gl_FragColor = vec4(vec3(val * 0.85), val * 0.34);
        } else {
          // dark grain on cream paper — multiply-style subtractive
          gl_FragColor = vec4(vec3(0.04, 0.05, 0.07), (1.0 - val) * 0.32 + 0.07);
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

    const uRes = gl.getUniformLocation(prog, "u_res")
    const uDpr = gl.getUniformLocation(prog, "u_dpr")
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
    function draw() {
      resize()
      gl!.uniform1f(uDpr, dpr)
      gl!.uniform1f(uDark, darkRef.current ? 1.0 : 0.0)
      gl!.drawArrays(gl!.TRIANGLES, 0, 3)
    }

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    // Paper grain does not move. It used to be repainted on a permanent
    // requestAnimationFrame loop (throttled to 18fps, but the loop itself
    // still ran every frame on every route), which kept a full-viewport
    // blended layer re-rasterising for the whole session. Now it is drawn
    // once and only redrawn when the viewport or the theme changes.
    draw()

    let resizeRaf = 0
    function onResize() {
      if (resizeRaf) return
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0
        draw()
      })
    }
    window.addEventListener("resize", onResize, { passive: true })

    return () => {
      if (resizeRaf) cancelAnimationFrame(resizeRaf)
      window.removeEventListener("resize", onResize)
      gl.deleteBuffer(buf)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteProgram(prog)
    }
  }, [dark])

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
  // Lines: deeply saturated spruce on cream, near-white on the dark
  // blueprint paper.
  const lineColor = dark ? "#ffffff" : "#0e3a1d"
  return (
    <div
      aria-hidden
      data-paper-grid
      style={{
        // Absolute, not fixed — the grid takes up the full scrollable
        // height of the document so the lines scroll past with the
        // content like a real sheet of paper, rather than slipping
        // under it. Body is set to `position: relative` so this
        // resolves to body bounds.
        position: "absolute",
        top: "-12vmax",
        left: "-12vmax",
        right: "-12vmax",
        bottom: "-12vmax",
        pointerEvents: "none",
        // Above the page-level content backgrounds (z-20) so the grid
        // reads on top of every section, but below the navigation
        // (z-50) and below the hero/canvas section (which sets z-[40]
        // on the landing page to mask the grid out from the 3D view).
        zIndex: 30,
        transform: "rotate(-6deg)",
        transformOrigin: "50% 50%",
        opacity: dark ? 0.45 : 0.72,
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
