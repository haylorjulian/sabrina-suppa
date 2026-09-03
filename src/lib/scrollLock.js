// Ref-counted lock over `document.body.style.overflow`.
//
// Four things want the page held still and they overlap freely: the preloader
// while it runs, the mobile menu while it's open, and the section stage for as
// long as it's engaged (which is now every tier). Each used to write
// `body.style.overflow` directly from its own effect, so the last writer won —
// closing the menu released the stage's lock, and crossing the lg breakpoint
// with the menu open released the menu's.
//
// A count fixes that without any of them knowing about the others: the style is
// set on the first acquire and cleared on the last release. `release` is
// idempotent per token, so a double-invoked effect (React StrictMode) can't
// decrement twice for one acquire.
let count = 0
let previous = ''

export function acquireScrollLock() {
  if (count === 0) {
    previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  count += 1

  let released = false
  return function release() {
    if (released) return
    released = true
    count -= 1
    if (count === 0) document.body.style.overflow = previous
  }
}
