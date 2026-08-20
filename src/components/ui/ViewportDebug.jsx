'use client'

// TEMPORARY DIAGNOSTIC — safe to delete.
//
// Reads what the device's browser actually reports for each viewport unit, live,
// while its chrome expands and collapses. It exists because none of this is
// reproducible off-device: in headless/desktop Chrome svh, lvh, dvh and vh are
// all the same number, so the only way to see which unit is misbehaving on an
// iPhone is to print them on the iPhone.
//
// Opt-in via a query string, so it can never appear for a visitor:
//   https://…/?vp=1
//
// To remove: delete this file and its one <ViewportDebug /> line in app/layout.jsx.
//
// The resize listener here is diagnostic only — it is deliberately NOT part of
// the layout solution, which stays pure CSS (see .section-fullscreen and
// .dvh-bottom-shift in globals.css).

import { useEffect, useState } from 'react'

const probe = (unit) => {
  const d = document.createElement('div')
  d.style.cssText = `position:absolute;top:-9999px;left:0;width:1px;height:100${unit}`
  document.body.appendChild(d)
  const h = d.getBoundingClientRect().height
  d.remove()
  return Math.round(h)
}

// Reads an env() safe-area inset by letting the browser resolve it into a length
// we can measure. env() cannot be read from JS directly.
const inset = (side) => {
  const d = document.createElement('div')
  d.style.cssText = `position:absolute;top:-9999px;left:0;width:1px;height:env(safe-area-inset-${side},0px)`
  document.body.appendChild(d)
  const h = d.getBoundingClientRect().height
  d.remove()
  return Math.round(h)
}

export default function ViewportDebug() {
  const [on, setOn] = useState(false)
  const [m, setM] = useState(null)

  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    if (!q.has('vp')) return
    setOn(true)

    // ?cover=0 rewrites the viewport meta to drop viewport-fit=cover, so the two
    // states can be compared on the device without a redeploy. Diagnostic only.
    if (q.get('cover') === '0') {
      const meta = document.querySelector('meta[name="viewport"]')
      if (meta) meta.setAttribute('content', 'width=device-width, initial-scale=1')
    }

    const read = () => {
      // The full-screen section covering the middle of the screen. Chosen by
      // geometry rather than elementFromPoint: hit-testing returns whichever
      // descendant happens to be painted at that pixel and can miss entirely
      // through a pointer-events:none or absolutely-positioned overlay.
      const mid = window.innerHeight / 2
      const sec =
        [...document.querySelectorAll('.section-fullscreen')]
          .filter((el) => el.getBoundingClientRect().height > 0)
          .find((el) => {
            const r = el.getBoundingClientRect()
            return r.top <= mid && r.bottom >= mid
          }) ?? null
      const shift = sec?.querySelector('.dvh-bottom-shift, .dvh-center-shift') ?? null
      setM({
        svh: probe('svh'),
        lvh: probe('lvh'),
        dvh: probe('dvh'),
        vh: probe('vh'),
        inner: window.innerHeight,
        visual: Math.round(window.visualViewport?.height ?? 0),
        secH: sec ? Math.round(sec.getBoundingClientRect().height) : null,
        secTop: sec ? Math.round(sec.getBoundingClientRect().top) : null,
        shiftY: shift ? getComputedStyle(shift).transform : 'n/a',
        scrollY: Math.round(window.scrollY),
        docH: document.documentElement.scrollHeight,
        // The painted-vs-reported gap. screen.height is the whole display; the
        // difference between it and innerHeight is the chrome Safari is drawing
        // over, some of which it still paints page content into.
        screenH: window.screen?.height ?? 0,
        insetTop: inset('top'),
        insetBottom: inset('bottom'),
        cover: (document.querySelector('meta[name="viewport"]')?.content ?? '').includes('cover'),
      })
    }

    read()
    window.addEventListener('resize', read)
    window.addEventListener('scroll', read, { passive: true })
    window.visualViewport?.addEventListener('resize', read)
    window.visualViewport?.addEventListener('scroll', read)
    return () => {
      window.removeEventListener('resize', read)
      window.removeEventListener('scroll', read)
      window.visualViewport?.removeEventListener('resize', read)
      window.visualViewport?.removeEventListener('scroll', read)
    }
  }, [])

  if (!on || !m) return null

  // The two numbers that matter most, called out rather than left to be spotted:
  // lvh vs dvh is how much chrome is currently showing, and secH vs lvh says
  // whether anything is clipping the section.
  const chrome = m.lvh - m.dvh
  const clipped = m.secH != null && m.secH < m.lvh

  const row = (k, v, note = '') => (
    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ opacity: 0.65 }}>{k}</span>
      <span>
        {v}
        {note ? <span style={{ opacity: 0.65 }}> {note}</span> : null}
      </span>
    </div>
  )

  return (
    <div
      style={{
        position: 'fixed',
        top: 'max(8px, env(safe-area-inset-top))',
        left: 8,
        zIndex: 2147483647,
        // oxidized-graphite / bone-porcelain, so even this throwaway readout
        // stays on the palette rather than introducing a stray black.
        background: 'rgba(26,26,28,0.92)',
        color: '#F3EEE8',
        font: '11px/1.45 ui-monospace, Menlo, monospace',
        padding: '8px 10px',
        border: '1px solid rgba(243,238,232,0.3)',
        minWidth: 190,
        pointerEvents: 'none',
        whiteSpace: 'pre',
      }}
    >
      {row('100svh', m.svh)}
      {row('100lvh', m.lvh)}
      {row('100dvh', m.dvh)}
      {row('100vh', m.vh)}
      {row('innerHeight', m.inner)}
      {row('visualViewport', m.visual)}
      <div style={{ borderTop: '1px solid rgba(243,238,232,0.25)', margin: '5px 0' }} />
      {row('chrome (lvh-dvh)', chrome, chrome === 0 ? '(collapsed)' : '(showing)')}
      {row('section height', m.secH ?? '—', clipped ? '⚠ < lvh' : '= lvh ✓')}
      {row('section top', m.secTop ?? '—')}
      <div style={{ borderTop: '1px solid rgba(243,238,232,0.25)', margin: '5px 0' }} />
      {row('viewport-fit', m.cover ? 'cover' : 'auto')}
      {row('inset top/bottom', `${m.insetTop} / ${m.insetBottom}`)}
      {row('screen.height', m.screenH)}
      {row('screen - inner', m.screenH - m.inner, '← Safari chrome')}
      <div style={{ borderTop: '1px solid rgba(243,238,232,0.25)', margin: '5px 0' }} />
      {row('bottom shift', m.shiftY === 'none' ? '0' : m.shiftY.replace(/matrix\([^,]+(?:,[^,]+){4},\s*/, '').replace(')', ''))}
      {row('scrollY', m.scrollY)}
      {row('doc height', m.docH)}
    </div>
  )
}
