// Build-time media dimension probe.
//
// Walks public/assets/sabrina-suppa, reads each image's pixel size with `sips`
// and each video's with `mdls` (both ship with macOS — no npm deps), and writes
// src/lib/media-dimensions.json mapping the web src path -> { w, h }.
//
// Assets are static, so this is run once and the JSON is committed. Re-run it
// (`node scripts/gen-media-manifest.mjs`) whenever assets change.
//
// Videos that expose no metadata fall back to DEFAULT_VIDEO so the gallery can
// still reserve layout space; correct those entries by hand if needed.

import { execFileSync } from 'node:child_process'
import { readdirSync, writeFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = join(__dirname, '..')
const ASSET_DIR = join(ROOT, 'public/assets/sabrina-suppa')
const WEB_BASE = '/assets/sabrina-suppa'
const OUT = join(ROOT, 'src/lib/media-dimensions.json')

const IMAGE_EXT = new Set(['jpg', 'jpeg', 'png', 'webp', 'avif'])
const VIDEO_EXT = new Set(['mp4', 'mov', 'webm', 'm4v'])
const DEFAULT_VIDEO = { w: 4, h: 5 } // portrait-ish fallback; refine per file if needed

const ext = (f) => f.split('.').pop().toLowerCase()

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.')) continue // skip .DS_Store etc.
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else out.push(full)
  }
  return out
}

function imageDims(file) {
  // sips -g pixelWidth -g pixelHeight  ->  "  pixelWidth: 1601"
  const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file], {
    encoding: 'utf8',
  })
  const w = +(out.match(/pixelWidth:\s*(\d+)/)?.[1] || 0)
  const h = +(out.match(/pixelHeight:\s*(\d+)/)?.[1] || 0)
  return w && h ? { w, h } : null
}

function videoDims(file) {
  // mdls reads dimensions from Spotlight metadata: "kMDItemPixelWidth = 1920"
  try {
    const out = execFileSync(
      'mdls',
      ['-name', 'kMDItemPixelWidth', '-name', 'kMDItemPixelHeight', file],
      { encoding: 'utf8' }
    )
    const w = +(out.match(/kMDItemPixelWidth\s*=\s*(\d+)/)?.[1] || 0)
    const h = +(out.match(/kMDItemPixelHeight\s*=\s*(\d+)/)?.[1] || 0)
    return w && h ? { w, h } : null
  } catch {
    return null
  }
}

const manifest = {}
let images = 0
let videos = 0
const fallbacks = []

for (const file of walk(ASSET_DIR).sort()) {
  const e = ext(file)
  const src = `${WEB_BASE}/${relative(ASSET_DIR, file)}`
  if (IMAGE_EXT.has(e)) {
    const d = imageDims(file)
    if (d) {
      manifest[src] = d
      images++
    }
  } else if (VIDEO_EXT.has(e)) {
    const d = videoDims(file)
    manifest[src] = d || DEFAULT_VIDEO
    if (!d) fallbacks.push(src)
    videos++
  }
}

writeFileSync(OUT, JSON.stringify(manifest, null, 2) + '\n')
console.log(`Wrote ${OUT}`)
console.log(`  images: ${images}, videos: ${videos}, total: ${Object.keys(manifest).length}`)
if (fallbacks.length) {
  console.log(`  video fallbacks (no metadata, using ${JSON.stringify(DEFAULT_VIDEO)}):`)
  fallbacks.forEach((s) => console.log(`    ${s}`))
}
