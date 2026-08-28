// Deterministic in-page section scroll for the mobile tier.
//
// The nav's #section links relied on the browser's own fragment scroll, and it
// landed on the wrong section intermittently. Two things fight it, and both are
// load-bearing elsewhere, so neither can simply be dropped:
//
//   1. globals.css sets `scroll-snap-type: y mandatory` on the page, and every
//      section carries `scroll-snap-stop: always`. That rule asks the UA not to
//      pass over a snap position during an animated scroll — which is the whole
//      point of it for a finger-flick, and exactly wrong for a fragment jump:
//      Home → Connect has to cross five snap points, and the scroll can be
//      arrested on any of them. Whether it is depends on timing, which is why
//      the same link worked sometimes and not others.
//
//   2. The jump starts while the mobile menu is still closing, so it runs
//      against a page the menu has locked (`body { overflow: hidden }`), which
//      Nav only releases from a passive effect — a frame after the click.
//
// So the click is intercepted and the scroll driven here instead: lift the
// lock, suspend snapping for the length of the animation, scroll to the
// target's own offset, then restore snapping once the page settles. The target
// is itself a snap point, so restoring never moves the page.
//
// All of it synchronous, deliberately. An earlier version deferred the work by
// two animation frames to let the menu's close commit first; the frames turned
// out not to be dependable (a tap could land its scroll one tap late, or not at
// all) and nothing here actually needs them — the overlay is `fixed`, so it
// contributes nothing to layout and the section offsets are already final at
// click time.
const SETTLE_TIMEOUT = 1400 // ms — hard stop for UAs without `scrollend`

// Set while a scroll of ours is in flight; calling it puts snapping back.
let restoreSnap = null

export function scrollToSection(id) {
  if (typeof window === 'undefined') return

  const el = document.getElementById(id)
  if (!el) return

  // Release the menu's scroll lock now rather than waiting for Nav's effect to
  // do it after the next paint. The menu is already closing, so this only
  // brings forward what that effect is about to set anyway.
  document.body.style.overflow = ''

  // A second link tapped mid-flight retargets rather than stacking a second
  // pending restore (which would put back an already-suspended value).
  restoreSnap?.()

  const html = document.documentElement
  const previousSnap = html.style.scrollSnapType
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  html.style.scrollSnapType = 'none'

  let timer = null
  const settle = () => {
    if (!restoreSnap) return
    restoreSnap = null
    window.clearTimeout(timer)
    window.removeEventListener('scrollend', settle)
    html.style.scrollSnapType = previousSnap
  }
  restoreSnap = settle

  // `scrollend` where it exists; the timeout covers the UAs without it and the
  // case where the target is already in place and nothing scrolls at all.
  window.addEventListener('scrollend', settle)
  timer = window.setTimeout(settle, SETTLE_TIMEOUT)

  window.scrollTo({
    top: Math.round(el.getBoundingClientRect().top + window.scrollY),
    // 'instant', not 'auto': `auto` defers to the page's CSS
    // `scroll-behavior: smooth`, which is the thing being opted out of here.
    behavior: reduced ? 'instant' : 'smooth',
  })

  history.replaceState(null, '', `#${id}`)
}
