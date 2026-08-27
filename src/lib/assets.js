// Media catalog — now assembled from the CMS-editable source files under
// src/content/ by scripts/build-content.mjs (run via `prebuild`/`predev`).
// This module is a thin re-export of the generated manifest so existing
// consumers keep importing the same names.
//
// To change media, edit the project/category files in src/content/ (or use the
// CMS at /admin) and re-run the assembler — do not edit media.generated.json.

import media from '@/lib/media.generated.json'

export const ASSET_BASE = media.ASSET_BASE

// Section backgrounds — { hero: { background, backgroundMobile }, about: { background, backgroundMobile } }.
// `backgroundMobile` falls back to `background` at build time when the editor
// leaves the mobile image blank (same pattern as categoryImages below).
export const assets = media.assets

// Category background images by slug — { desktop, mobile }. `mobile` falls back
// to `desktop` at build time when the editor leaves the mobile image blank.
export const categoryImages = media.categoryImages

// Work catalog keyed by category slug, ordered to match copy.work.categories[].projects.
// Each project is { media: [ { type, src, width, height, alt? } ] }.
export const workMedia = media.workMedia
