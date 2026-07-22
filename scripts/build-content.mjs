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
  } else {
    try {
      let buf
      if (isAbsolute(src)) {
        // Fetched lazily and synchronously is not possible; skip remote probe here.
        // New R2 images without a cached entry fall back to null and are measured
        // on load by the gallery. Pre-warm the cache with `node scripts/probe-remote.mjs` if needed.
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
  }
}

// ---- Read source files -----------------------------------------------------

const site = readJson(join(CONTENT, 'site.json'))
const nav = readJson(join(CONTENT, 'nav.json'))
const hero = readJson(join(CONTENT, 'hero.json'))
const preloader = readJson(join(CONTENT, 'preloader.json'))
const about = readJson(join(CONTENT, 'about.json'))
const workUi = readJson(join(CONTENT, 'work-ui.json'))

const loadDir = (name) =>
  readdirSync(join(CONTENT, name))
    .filter((f) => f.endsWith('.json'))
    .map((f) => readJson(join(CONTENT, name, f)))

const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0) || a.slug.localeCompare(b.slug)

const categories = loadDir('categories').sort(byOrder)
const projects = loadDir('projects').sort(byOrder)

// ---- Assemble copy.generated.json (shape identical to the old copy.json) ----

const copyCategories = categories.map((cat) => ({
  slug: cat.slug,
  label: cat.label,
  description: cat.description,
  // Optional per-record mobile copy; falls back to the desktop text when blank.
  descriptionMobile: cat.descriptionMobile || cat.description,
  // Light/dark colour for the text overlaid on the mobile category image.
  overlayTextColor: cat.overlayTextColor || 'light',
  // Light/dark colour for the category name overlaid on the desktop image.
  desktopOverlayTextColor: cat.desktopOverlayTextColor || 'light',
  projects: projects
    .filter((p) => p.category === cat.slug)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      description: p.description,
      descriptionMobile: p.descriptionMobile || p.description,
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
      paragraphs: about.paragraphs,
      bgAlt: about.bgAlt,
      social: about.social,
    },
  },
}

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
  workMedia[cat.slug] = projects
    .filter((p) => p.category === cat.slug)
    .map((p) => ({ media: (p.media || []).map(mediaItem) }))
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
