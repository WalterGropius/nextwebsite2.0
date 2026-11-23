// Everything the boids panel can change, plus the presets it offers.

export type Palette = "ink" | "heading" | "speed" | "dusk"
export type PointerMode = "flee" | "attract" | "off"
export type Shape = "sphere" | "box"

export interface Params {
  cohesion: number
  alignment: number
  separation: number
  vision: number
  speed: number
  turbulence: number
  size: number
  pointer: PointerMode
  pointerStrength: number
  pointerRadius: number
  palette: Palette
  shape: Shape
  showBounds: boolean
  autoRotate: boolean
  bloom: number
}

export interface Stats {
  fps: number
  stride: number // every n-th bird is sampled as a neighbour
  budget: number // neighbour samples per bird, halved when frames drop
}

export const DEFAULTS: Params = {
  cohesion: 1,
  alignment: 1,
  separation: 1,
  vision: 60,
  speed: 1,
  turbulence: 0.3,
  size: 4,
  pointer: "flee",
  pointerStrength: 1,
  pointerRadius: 120,
  palette: "ink",
  shape: "sphere",
  showBounds: false,
  autoRotate: true,
  bloom: 0,
}

export const COUNTS = [256, 1024, 4096, 9216, 16384]

export type PresetName = "murmuration" | "school" | "swarm" | "drift"

// A preset only touches how the flock moves, never how it looks.
export const PRESETS: Record<PresetName, Partial<Params>> = {
  murmuration: { cohesion: 1, alignment: 1, separation: 1, vision: 60, speed: 1, turbulence: 0.3 },
  school: { cohesion: 1.6, alignment: 1.8, separation: 0.8, vision: 85, speed: 0.8, turbulence: 0.1 },
  swarm: { cohesion: 1.4, alignment: 0.15, separation: 1.3, vision: 70, speed: 1.3, turbulence: 0.9 },
  drift: { cohesion: 0.4, alignment: 0.6, separation: 1.2, vision: 45, speed: 0.5, turbulence: 0.5 },
}
