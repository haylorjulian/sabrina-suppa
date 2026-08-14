// Content assembler — the single build step that turns the CMS-editable source
// files under src/content/ into the two artifacts the app imports:
//
//   src/content/copy.generated.json   (same shape the old copy.json had: { en: {...} })
//   src/lib/media.generated.json       (assets / categoryImages / categoryLanding / workMedia)
//
// It also maintains a dimensions cache (src/lib/media-dimensions.json) so galleries
// can reserve layout space. Runs cross-platform (no macOS sips/mdls) via `image-size`.
//
// Run automatically by the `prebuild`/`predev` npm scripts. Manual: `node scripts/build-content.mjs`.
//
// Media `src` values in the source files are EITHER a path relative to ASSET_BASE
// (e.g. "adaptiveFlesh/Transfiguration/1.jpg", for assets bundled in public/ or R2)
// OR an absolute URL (e.g. a Cloudflare R2 URL written by the CMS on upload).

import sizeOf from 'image-size'
import nextEnv from '@next/env'
const { loadEnvConfig } = nextEnv
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = join(__dirname, '..')
const CONTENT = join(ROOT, 'src/content')
const PUBLIC = join(ROOT, 'public')

// This script runs as a plain Node process (via the prebuild/predev npm hooks),
// so — unlike `next dev`/`next build` — it does not auto-load .env*  files.
// Load them the same way Next.js does so NEXT_PUBLIC_ASSET_BASE etc. are honored.
loadEnvConfig(ROOT)

// Base for relative media paths. Point this at the R2 public URL (e.g.
// https://media.sabrinasuppa.com) once assets are migrated; defaults to the
// in-repo public/ path so the site keeps working before migration.
const ASSET_BASE = (process.env.NEXT_PUBLIC_ASSET_BASE || '/assets/sabrina-suppa').replace(/\/$/, '')

const VIDEO_EXT = new Set(['mp4', 'mov', 'webm', 'm4v'])
const DEFAULT_VIDEO = { w: 4, h: 5 } // portrait-ish fallback for videos with no probe

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'))
const ext = (s) => s.split('.').pop().toLowerCase()
const isAbsolute = (s) => /^https?:\/\//i.test(s)

// Resolve a source value to the final web/CDN URL.
const resolveSrc = (src) => (isAbsolute(src) ? src : `${ASSET_BASE}/${src.replace(/^\//, '')}`)

// Dimensions cache, keyed by resolved src. Preserves the dims the site shipped with
// and avoids re-probing unchanged assets on every build.
const CACHE_PATH = join(ROOT, 'src/lib/media-dimensions.json')
const cache = existsSync(CACHE_PATH) ? readJson(CACHE_PATH) : {}
let cacheDirty = false

function dimsFor(src, item) {
  if (cache[src]) return cache[src]

  const e = ext(src)
  let d = null

  if (VIDEO_EXT.has(e)) {
    // Remote video probing is heavy in CI; honor an explicit override, else default.
    d = item.width && item.height ? { w: item.width, h: item.height } : DEFAULT_VIDEO
  } else if (item.width && item.height) {
    // Explicit override for images too (same as videos) — lets an editor declare a
    // remote image's size without a probe, e.g. to flag a 16:9 as a full-row image.
    // Cache-first (above) still wins, so if you change declared dims later, clear the
    // stale media-dimensions.json entry for this src.
    d = { w: item.width, h: item.height }
  } else {
    try {
      let buf
      if (isAbsolute(src)) {
        // Remote images are measured by warmDimsCache() before assembly (fetch is
        // async, dimsFor is sync), so by here their dims are already in the cache and
        // returned above. Reaching this branch means the warm pass couldn't measure
        // this src — leave it null so it falls back to the 0.8 portrait ratio.
        buf = null
      } else {
        const local = join(PUBLIC, src.replace(/^\//, ''))
        if (existsSync(local)) buf = readFileSync(local)
      }
      if (buf) {
        const { width, height } = sizeOf(buf)
        if (width && height) d = { w: width, h: height }
      }
    } catch {
      d = null
    }
  }

  if (d) {
    cache[src] = d
    cacheDirty = true
  }
  return d
}

// Build a media item matching the old assets.js `m()` output.
function mediaItem(item) {
  const src = resolveSrc(item.src)
  const d = dimsFor(src, item)
  return {
    type: VIDEO_EXT.has(ext(src)) ? 'video' : 'image',
    src,
    width: d?.w ?? null,
    height: d?.h ?? null,
    ...(item.alt ? { alt: item.alt } : {}),
    // Editor flag: drop this item from the gallery below the lg breakpoint (some
    // assets only read well on a wide screen). Only emitted when set.
    ...(item.hideOnMobile ? { hideOnMobile: true } : {}),
  }
}

// ---- Rich text -------------------------------------------------------------
//
// The CMS markdown fields are limited to three constructs (bold, italic, link),
// so the site ships its own tiny renderer rather than a markdown dependency:
// escaping first and only ever emitting <strong>/<em>/<a> means authored markup
// can never reach the DOM through the dangerouslySetInnerHTML the components use.
// Anything richer that an editor pastes in (headings, lists, images, raw HTML)
// renders as literal text — deliberately, and visibly, so it gets noticed.

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }
const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) => HTML_ESCAPES[c])

// Backslash-escaped markdown (`\-`, `\*`, …) is parked on a sentinel through the
// inline passes and restored at the end, so an escaped character can never be
// re-read as syntax. U+0000 cannot occur in the source (JSON forbids it raw).
const ESCAPABLE = '\\`*_[]()#+-.!'
// `]`, `-`, `\` and `^` carry meaning inside a character class, so escape them
// before the list is interpolated into one.
const ESCAPED_RE = new RegExp(`\\\\([${ESCAPABLE.replace(/[\\\]\-^]/g, '\\$&')}])`, 'g')
const SENTINEL = '\u0000'
const PARKED_RE = /\u0000(\d+)\u0000/g

// `[text](url)`. The url part tolerates one level of nested parentheses so that
// a rejected `javascript:alert(1)` is consumed whole rather than leaving a stray
// bracket in the copy.
const LINK_RE = /\[([^\]\n]+)\]\(([^()\s]*(?:\([^()\s]*\)[^()\s]*)*)\)/g

// Emphasis, markdown's own rule: the delimiters must hug their content, so
// "a * b * c" stays literal asterisks and only "*b*" becomes emphasis. `_` is
// additionally barred from mid-word, so snake_case survives.
const BOLD_STAR_RE = /\*\*(?!\s)([^\n]+?)(?<!\s)\*\*/g
const BOLD_UNDER_RE = /(^|[^\w_])__(?!\s)([^\n]+?)(?<!\s)__(?![\w_])/g
const ITALIC_STAR_RE = /(^|[^*])\*(?!\s)([^*\n]+?)(?<!\s)\*(?!\*)/g
const ITALIC_UNDER_RE = /(^|[^\w_])_(?!\s)([^_\n]+?)(?<!\s)_(?![\w_])/g

// Only these schemes may become an href. Everything else (javascript:, data:, …)
// falls back to rendering the link's text, so a bad paste degrades to plain copy
// instead of shipping a live hazard.
function safeHref(raw) {
  const href = raw.trim()
  if (/^(https?:|mailto:)/i.test(href)) return href
  if (href.startsWith('/') || href.startsWith('#')) return href
  return null
}

// One line of source → HTML. Newlines become <br>, matching the whitespace-pre-line
// rendering these fields had before they were markdown.
function renderInline(src) {
  let out = escapeHtml(src)

  out = out.replace(ESCAPED_RE, (_, ch) => `${SENTINEL}${ch.charCodeAt(0)}${SENTINEL}`)

  out = out.replace(LINK_RE, (_, text, url) => {
    const href = safeHref(url)
    if (!href) return text
    const external = /^(https?:)/i.test(href)
    const rel = external ? ' target="_blank" rel="noreferrer"' : ''
    return `<a href="${href}"${rel}>${text}</a>`
  })

  out = out
    .replace(BOLD_STAR_RE, '<strong>$1</strong>')
    .replace(BOLD_UNDER_RE, '$1<strong>$2</strong>')
    .replace(ITALIC_STAR_RE, '$1<em>$2</em>')
    .replace(ITALIC_UNDER_RE, '$1<em>$2</em>')

  out = out.replace(PARKED_RE, (_, code) => String.fromCharCode(+code))

  return out.replace(/\n/g, '<br>')
}

// Source → array of paragraph HTML strings, split on blank lines. Components map
// this into one <p> each (or join it with <br><br> where the design wants a single
// block), so the paragraph rhythm is decided at build time, not per component.
function richParagraphs(src) {
  return String(src || '')
    .split(/\n[ \t]*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(renderInline)
}

// Markdown markers stripped, for places that need plain text (meta descriptions).
// Escapes are parked first, exactly as in renderInline, so `\*literal\*` comes
// back as `*literal*` rather than losing its asterisks and keeping the slashes.
function plainText(src) {
  return String(src || '')
    .replace(ESCAPED_RE, (_, ch) => `${SENTINEL}${ch.charCodeAt(0)}${SENTINEL}`)
    .replace(LINK_RE, '$1')
    .replace(BOLD_STAR_RE, '$1')
    .replace(BOLD_UNDER_RE, '$1$2')
    .replace(ITALIC_STAR_RE, '$1$2')
    .replace(ITALIC_UNDER_RE, '$1$2')
    .replace(PARKED_RE, (_, code) => String.fromCharCode(+code))
}

// ---- Read source files -----------------------------------------------------

const site = readJson(join(CONTENT, 'site.json'))
const nav = readJson(join(CONTENT, 'nav.json'))
const hero = readJson(join(CONTENT, 'hero.json'))
const preloader = readJson(join(CONTENT, 'preloader.json'))
const about = readJson(join(CONTENT, 'about.json'))
const connect = readJson(join(CONTENT, 'connect.json'))
const workUi = readJson(join(CONTENT, 'work-ui.json'))

const loadDir = (name) =>
  readdirSync(join(CONTENT, name))
    .filter((f) => f.endsWith('.json'))
    .map((f) => readJson(join(CONTENT, name, f)))

const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0) || a.slug.localeCompare(b.slug)

const categories = loadDir('categories').sort(byOrder)
const projects = loadDir('projects').sort(byOrder)

// Projects belonging to a category, in the sequence the editor dragged them into
// on the category record (`projectOrder`). A project that isn't listed there —
// typically one just created in the CMS — is appended rather than dropped, so it
// always appears somewhere and can be positioned later.
//
// This is the ONLY place category membership and order are decided: both the copy
// and the media assembly below call it, because workMedia[slug][i] is index-aligned
// with copy.work.categories[].projects[i] (see app/work/[category]/[project]/page.jsx).
function projectsFor(cat) {
  const mine = projects.filter((p) => p.category === cat.slug)
  const listed = []
  for (const slug of cat.projectOrder || []) {
    const p = mine.find((m) => m.slug === slug)
    if (!p) {
      console.warn(`  ! ${cat.slug}: project order lists "${slug}", which is not in this category — ignored.`)
      continue
    }
    if (!listed.includes(p)) listed.push(p)
  }
  const rest = mine.filter((p) => !listed.includes(p))
  for (const p of rest) {
    console.warn(`  ! ${cat.slug}: "${p.slug}" is not in the project order — appended at the end.`)
  }
  return [...listed, ...rest]
}

// Resolved once so the two assembly passes below cannot disagree (and so the
// warnings above print once per category, not twice).
const categoryProjects = new Map(categories.map((cat) => [cat.slug, projectsFor(cat)]))

// ---- Assemble copy.generated.json (shape identical to the old copy.json) ----

// Editor prose fields ship twice: `*Html` (paragraph-split, bold/italic/link
// rendered — what the components display) and the plain string (markdown markers
// stripped — what meta descriptions and any text-only context use).
const copyCategories = categories.map((cat) => ({
  slug: cat.slug,
  label: cat.label,
  description: plainText(cat.description),
  descriptionHtml: richParagraphs(cat.description),
  // Optional per-record mobile copy; falls back to the desktop text when blank.
  descriptionMobile: plainText(cat.descriptionMobile || cat.description),
  descriptionMobileHtml: richParagraphs(cat.descriptionMobile || cat.description),
  // Light/dark colour for the text overlaid on the mobile category image.
  overlayTextColor: cat.overlayTextColor || 'light',
  // Light/dark colour for the category name overlaid on the desktop image.
  desktopOverlayTextColor: cat.desktopOverlayTextColor || 'light',
  projects: categoryProjects.get(cat.slug).map((p) => ({
    slug: p.slug,
    title: p.title,
    description: plainText(p.description),
    descriptionHtml: richParagraphs(p.description),
    descriptionMobile: plainText(p.descriptionMobile || p.description),
    descriptionMobileHtml: richParagraphs(p.descriptionMobile || p.description),
    ...(p.comingSoon ? { comingSoon: p.comingSoon } : {}),
  })),
}))

const copy = {
  en: {
    meta: site.meta,
    notFound: site.notFound,
    nav,
    preloader,
    // `background` is deliberately absent — it routes to media.generated.json below.
    hero: {
      name: hero.name,
      scroll: hero.scroll,
      bgAlt: hero.bgAlt,
      connect: hero.connect,
      footer: hero.footer,
    },
    work: { ...workUi, categories: copyCategories },
    about: {
      sectionLabel: about.sectionLabel,
      paragraphs: about.paragraphs.map(plainText),
      // One entry in, one <p> out — a blank line inside an entry stays a blank
      // line (joined with <br><br>) rather than splitting into a new paragraph,
      // which is how these read before markdown.
      paragraphsHtml: about.paragraphs.map((p) => richParagraphs(p).join('<br><br>')),
      // Optional per-record mobile copy; falls back to the desktop paragraphs
      // when the editor leaves it blank (same pattern as category/project copy).
      paragraphsMobile: (about.paragraphsMobile?.length ? about.paragraphsMobile : about.paragraphs).map(plainText),
      paragraphsMobileHtml: (about.paragraphsMobile?.length ? about.paragraphsMobile : about.paragraphs).map(
        (p) => richParagraphs(p).join('<br><br>')
      ),
      bgAlt: about.bgAlt,
      social: about.social,
    },
    // Connect is prose + one address: the address ships plain (it's also the
    // mailto target), the copy ships as HTML like every other editor field.
    connect: {
      sectionLabel: connect.sectionLabel,
      email: connect.email,
      intro: plainText(connect.intro),
      introHtml: richParagraphs(connect.intro).join('<br><br>'),
      notes: connect.notes.map(plainText),
      notesHtml: connect.notes.map((p) => richParagraphs(p).join('<br><br>')),
    },
  },
}

// ---- Warm the dimensions cache for remote images ---------------------------
//
// `dimsFor` can't fetch synchronously, so remote gallery images are measured here,
// once, before assembly. Only uncached, non-video, non-declared absolute srcs are
// fetched — a committed cache means steady-state builds fetch nothing, and a newly
// uploaded CMS image incurs one ranged request. This is what makes any aspect ratio
// (portrait, 16:9, wider) render correctly without the CMS carrying dimensions,
// which its schema strips. Failures are non-fatal: an unmeasured src stays uncached
// and falls back to the 0.8 portrait ratio in `dimsFor`, exactly as before.

const PROBE_TIMEOUT_MS = 15000
const PROBE_CONCURRENCY = 8

// Fetch just enough of an image to read its header. Ranged first (a few KB); if that
// can't be parsed, retry the whole file; give up (→ null) on any error or timeout.
async function measureRemote(src) {
  for (const headers of [{ Range: 'bytes=0-65535' }, {}]) {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), PROBE_TIMEOUT_MS)
    try {
      const res = await fetch(src, { headers, signal: ctrl.signal })
      if (res.ok) {
        const { width, height } = sizeOf(Buffer.from(await res.arrayBuffer()))
        if (width && height) return { w: width, h: height }
      }
    } catch {
      // fall through to the next strategy, then give up
    } finally {
      clearTimeout(timer)
    }
  }
  return null
}

async function warmDimsCache() {
  const pending = new Set()
  for (const list of categoryProjects.values())
    for (const p of list)
      for (const item of p.media || []) {
        const src = resolveSrc(item.src)
        if (!isAbsolute(src)) continue // local files: dimsFor probes them from disk
        if (VIDEO_EXT.has(ext(src))) continue // videos keep their default ratio
        if (cache[src]) continue // already known (committed cache)
        if (item.width && item.height) continue // explicit override wins
        pending.add(src)
      }
  const srcs = [...pending]
  if (!srcs.length) return
  console.log(`  Probing ${srcs.length} uncached image(s) for dimensions…`)
  let measured = 0
  for (let i = 0; i < srcs.length; i += PROBE_CONCURRENCY) {
    const batch = srcs.slice(i, i + PROBE_CONCURRENCY)
    const dims = await Promise.all(batch.map(measureRemote))
    batch.forEach((src, j) => {
      if (dims[j]) {
        cache[src] = dims[j]
        cacheDirty = true
        measured++
      } else {
        console.warn(`  ! could not measure ${src} — falls back to portrait ratio`)
      }
    })
  }
  console.log(`  Measured ${measured}/${srcs.length} image(s).`)
}

await warmDimsCache()

// ---- Assemble media.generated.json -----------------------------------------

// Per-category background images: a desktop image and an optional mobile image
// that falls back to the desktop one when the editor leaves it blank.
const categoryImages = {}
for (const cat of categories) {
  const desktop = cat.desktopImage ? resolveSrc(cat.desktopImage) : null
  const mobile = cat.mobileImage ? resolveSrc(cat.mobileImage) : desktop
  if (desktop || mobile) categoryImages[cat.slug] = { desktop, mobile }
}

// workMedia keyed by category slug, ordered to match copy.work.categories[].projects.
const workMedia = {}
for (const cat of categories) {
  workMedia[cat.slug] = categoryProjects.get(cat.slug).map((p) => ({ media: (p.media || []).map(mediaItem) }))
}

const media = {
  ASSET_BASE,
  assets: {
    hero: { background: resolveSrc(hero.background) },
    about: { background: resolveSrc(about.background) },
  },
  categoryImages,
  workMedia,
}

// ---- Write outputs ---------------------------------------------------------

writeFileSync(join(CONTENT, 'copy.generated.json'), JSON.stringify(copy, null, 2) + '\n')
writeFileSync(join(ROOT, 'src/lib/media.generated.json'), JSON.stringify(media, null, 2) + '\n')
if (cacheDirty) writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + '\n')

const projectCount = projects.length
const mediaCount = Object.values(workMedia).flat().reduce((n, p) => n + p.media.length, 0)
console.log(
  `Assembled content: ${categories.length} categories, ${projectCount} projects, ${mediaCount} media items.`
)
console.log(`  ASSET_BASE = ${ASSET_BASE}`)
console.log(`  -> src/content/copy.generated.json`)
console.log(`  -> src/lib/media.generated.json`)
if (cacheDirty) console.log(`  -> src/lib/media-dimensions.json (cache updated)`)
