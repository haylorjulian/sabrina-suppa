// Deterministic hand-off for landing on a specific home section after a client
// navigation (e.g. a project page's "Back to work" → the home Work slide).
//
// Why not the URL hash: Next's App Router commits the new URL in its own effect,
// which can run AFTER the home page's mount effects — and pushState fires no
// `hashchange` — so reading window.location.hash on mount is a race. The click
// handler writes the target here synchronously BEFORE navigation starts, so it
// is guaranteed readable by the time the home page mounts.
//
// The value is peeked (never consumed) and expires by TTL instead: React 18 dev
// StrictMode double-invokes mount effects, and a consuming read burns the value
// on the first invocation — any replay or remount then misses it and falls back
// to the stale hash. TTL keeps it from hijacking a later, unrelated visit.
const KEY = 'ss-section-target'
const TTL = 5000 // ms — covers navigation + settle; short enough not to affect later visits

export function setSectionTarget(id) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ id, ts: Date.now() }))
  } catch {}
}

export function peekSectionTarget() {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const { id, ts } = JSON.parse(raw)
    if (!id || Date.now() - ts > TTL) {
      sessionStorage.removeItem(KEY)
      return null
    }
    return id
  } catch {
    return null
  }
}
