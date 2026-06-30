// All image/video paths in one place. Copy source files into
// public/assets/sabrina-suppa/ (see README) so these paths resolve.
//
// Folder layout (mirrors the source assets/ folder):
//   homePage.jpg                              ← Hero background
//   aboutPage.jpg                             ← About background
//   adaptiveFlesh/Transfiguration/...         ← Adaptive Flesh project 1
//   adaptiveFlesh/Pressure_Calibration/...    ← Adaptive Flesh project 2
//   adaptiveFlesh/Force_Matrix/...            ← Adaptive Flesh project 3
//   physicalworks/Remains/...                 ← Physical Works project

import dimensions from '@/lib/media-dimensions.json'

export const ASSET_BASE = '/assets/sabrina-suppa'

const VIDEO_EXT = ['mp4', 'mov', 'webm', 'm4v']

// Build a media item, inferring image vs video from the file extension and
// attaching intrinsic width/height from the build-time dimension manifest
// (see scripts/gen-media-manifest.mjs) so galleries can reserve layout space.
const m = (p) => {
  const ext = p.split('.').pop().toLowerCase()
  const src = `${ASSET_BASE}/${p}`
  const dim = dimensions[src] || null
  return {
    type: VIDEO_EXT.includes(ext) ? 'video' : 'image',
    src,
    width: dim?.w ?? null,
    height: dim?.h ?? null,
  }
}

// Section backgrounds
export const assets = {
  hero: {
    background: `${ASSET_BASE}/homePage.jpg`,
  },
  about: {
    background: `${ASSET_BASE}/aboutPage.jpg`,
  },
}

// Category landing images, keyed by category slug.
// landscape = desktop, vertical = mobile.
export const categoryImages = {
  'adaptive-flesh': {
    landscape: `${ASSET_BASE}/categories/adaptive-flesh-landscape.jpg`,
    vertical: `${ASSET_BASE}/categories/adaptive-flesh-vertical.jpg`,
  },
  physical: {
    landscape: `${ASSET_BASE}/categories/physical-landscape.jpg`,
    vertical: `${ASSET_BASE}/categories/physical-vertical.jpg`,
  },
}

// Work catalog — keyed by category slug, ordered list of projects.
// Each project is an ordered list of media items the gallery cycles through.
export const workMedia = {
  'adaptive-flesh': [
    // Project 1 — Transfiguration
    {
      media: [
        m('adaptiveFlesh/Transfiguration/1.jpg'),
        m('adaptiveFlesh/Transfiguration/2.jpg'),
        m('adaptiveFlesh/Transfiguration/3.jpg'),
        m('adaptiveFlesh/Transfiguration/4.jpg'),
        m('adaptiveFlesh/Transfiguration/5.jpg'),
        m('adaptiveFlesh/Transfiguration/7.jpg'),
        m('adaptiveFlesh/Transfiguration/8.jpg'),
        m('adaptiveFlesh/Transfiguration/9.mp4'),
        m('adaptiveFlesh/Transfiguration/10.jpg'),
        m('adaptiveFlesh/Transfiguration/11.jpg'),
        m('adaptiveFlesh/Transfiguration/12.jpg'),
        m('adaptiveFlesh/Transfiguration/13.JPG'),
        m('adaptiveFlesh/Transfiguration/14.jpg'),
        m('adaptiveFlesh/Transfiguration/15.jpg'),
        m('adaptiveFlesh/Transfiguration/16.jpg'),
        m('adaptiveFlesh/Transfiguration/17.jpg'),
        m('adaptiveFlesh/Transfiguration/18.jpg'),
        m('adaptiveFlesh/Transfiguration/19.jpg'),
      ],
    },
    // Project 2 — Pressure Calibration
    {
      media: [
        m('adaptiveFlesh/Pressure_Calibration/1.mp4'),
        m('adaptiveFlesh/Pressure_Calibration/2.jpg'),
        m('adaptiveFlesh/Pressure_Calibration/3.jpg'),
        m('adaptiveFlesh/Pressure_Calibration/4.jpg'),
        m('adaptiveFlesh/Pressure_Calibration/5.jpg'),
        m('adaptiveFlesh/Pressure_Calibration/5a.mp4'),
        m('adaptiveFlesh/Pressure_Calibration/6.jpg'),
        m('adaptiveFlesh/Pressure_Calibration/7.jpg'),
        m('adaptiveFlesh/Pressure_Calibration/8.jpg'),
        m('adaptiveFlesh/Pressure_Calibration/9.jpg'),
        m('adaptiveFlesh/Pressure_Calibration/10.jpg'),
        m('adaptiveFlesh/Pressure_Calibration/11.jpg'),
        m('adaptiveFlesh/Pressure_Calibration/12.jpg'),
        m('adaptiveFlesh/Pressure_Calibration/13.jpg'),
        m('adaptiveFlesh/Pressure_Calibration/14.jpg'),
        m('adaptiveFlesh/Pressure_Calibration/15.jpg'),
        m('adaptiveFlesh/Pressure_Calibration/16.jpg'),
        m('adaptiveFlesh/Pressure_Calibration/17.mp4'),
      ],
    },
    // Project 3 — Force Matrix
    {
      media: [
        m('adaptiveFlesh/Force_Matrix/1.jpg'),
        m('adaptiveFlesh/Force_Matrix/2.jpg'),
        m('adaptiveFlesh/Force_Matrix/3.jpg'),
        m('adaptiveFlesh/Force_Matrix/4.jpg'),
        m('adaptiveFlesh/Force_Matrix/5.jpg'),
        m('adaptiveFlesh/Force_Matrix/5a.mp4'),
        m('adaptiveFlesh/Force_Matrix/6.jpg'),
        m('adaptiveFlesh/Force_Matrix/7.jpg'),
        m('adaptiveFlesh/Force_Matrix/8.jpg'),
        m('adaptiveFlesh/Force_Matrix/9.jpg'),
        m('adaptiveFlesh/Force_Matrix/10.jpg'),
        m('adaptiveFlesh/Force_Matrix/11.jpg'),
        m('adaptiveFlesh/Force_Matrix/12.jpg'),
        m('adaptiveFlesh/Force_Matrix/13.jpg'),
        m('adaptiveFlesh/Force_Matrix/14.jpg'),
        m('adaptiveFlesh/Force_Matrix/15.jpg'),
        m('adaptiveFlesh/Force_Matrix/16.mp4'),
      ],
    },
  ],
  physical: [
    // Project 1 — Remains
    {
      media: [
        m('physicalworks/Remains/1.JPG'),
        m('physicalworks/Remains/2.jpg'),
        m('physicalworks/Remains/3.JPG'),
        m('physicalworks/Remains/4.jpg'),
      ],
    },
  ],
}
