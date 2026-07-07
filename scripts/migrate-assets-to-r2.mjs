// One-off: upload the existing in-repo media (public/assets/sabrina-suppa/**)
// to the Cloudflare R2 bucket, preserving each file's path so it resolves under
// the R2 public URL when NEXT_PUBLIC_ASSET_BASE points there.
//
// Object key = path relative to public/assets/sabrina-suppa, e.g.
//   public/assets/sabrina-suppa/adaptiveFlesh/Transfiguration/1.jpg
//   -> key: adaptiveFlesh/Transfiguration/1.jpg
//   -> served at: <R2 public URL>/adaptiveFlesh/Transfiguration/1.jpg
//
// Uses the `wrangler` CLI (same auth as the deploy workflow) — no extra deps.
//
// Usage:
//   BUCKET=sabrina-suppa-media node scripts/migrate-assets-to-r2.mjs          # dry run
//   BUCKET=sabrina-suppa-media node scripts/migrate-assets-to-r2.mjs --go     # upload
//
// After it completes: set NEXT_PUBLIC_ASSET_BASE (repo variable + local .env)
// to the R2 public URL, redeploy, verify, then you may remove public/assets.

import { execFileSync } from 'node:child_process'
import { readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = join(__dirname, '..')
const ASSET_DIR = join(ROOT, 'public/assets/sabrina-suppa')

const BUCKET = process.env.BUCKET || 'sabrina-suppa-media'
const GO = process.argv.includes('--go')

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.')) continue
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else out.push(full)
  }
  return out
}

const files = walk(ASSET_DIR)
console.log(`${files.length} files to upload to r2://${BUCKET}${GO ? '' : '  (dry run — pass --go to upload)'}\n`)

let done = 0
for (const file of files) {
  const key = relative(ASSET_DIR, file).split('\\').join('/')
  if (!GO) {
    console.log(`  would upload  ${key}`)
    continue
  }
  execFileSync('npx', ['wrangler', 'r2', 'object', 'put', `${BUCKET}/${key}`, '--file', file, '--remote'], {
    stdio: ['ignore', 'ignore', 'inherit'],
  })
  done++
  console.log(`  uploaded  ${key}  (${done}/${files.length})`)
}

if (GO) console.log(`\nDone. Uploaded ${done} files to r2://${BUCKET}.`)
