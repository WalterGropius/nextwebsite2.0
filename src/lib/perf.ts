// Small shared helpers for runtime performance tooling.

// The r3f-perf HUD (and the flow page's stats readout) are opt-in via a
// `?perf` query param so they never ship work to ordinary visitors.
export function perfHudEnabled(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return new URLSearchParams(window.location.search).has('perf')
  } catch {
    return false
  }
}
