// Coarse client-side device classification so the 3D scenes can scale
// themselves instead of assuming a desktop GPU. Heuristics only — there is
// no reliable GPU benchmark in the browser — but memory + cores + mobile UA
// separates a flagship workstation from a five-year-old phone well enough
// to pick particle budgets.

export type DeviceTier = 'low' | 'mid' | 'high'

type NavigatorWithMemory = Navigator & { deviceMemory?: number }

type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean; effectiveType?: string }
}

export function getDeviceTier(): DeviceTier {
  if (typeof window === 'undefined') return 'high'

  const nav = navigator as NavigatorWithMemory & NavigatorWithConnection
  const memory = nav.deviceMemory ?? 8 // undefined on Safari/Firefox — assume plenty
  const cores = nav.hardwareConcurrency ?? 8
  const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(nav.userAgent)
  // Data-saver / very slow networks: the visitor asked for less — treat
  // the device as low-tier regardless of its silicon.
  const conn = nav.connection
  const frugal =
    conn?.saveData === true ||
    conn?.effectiveType === '2g' ||
    conn?.effectiveType === 'slow-2g'

  if (frugal || memory <= 2 || cores <= 2) return 'low'
  if (mobile || memory <= 4 || cores <= 4) return 'mid'
  return 'high'
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
