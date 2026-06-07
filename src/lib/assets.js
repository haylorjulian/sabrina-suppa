// All image/video paths in one place. Copy source files into
// public/assets/sabrina-suppa/ (see README) so these paths resolve.
//
// NOTE: three source files contain spaces and are URL-encoded below.
// Rename them on disk for cleanliness (see SUMMARY.md) — until then the
// encoded paths work as-is.

export const ASSET_BASE = '/assets/sabrina-suppa'

const img = (p) => ({ type: 'image', src: `${ASSET_BASE}/${p}` })
const video = (p) => ({ type: 'video', src: `${ASSET_BASE}/${p}` })

// Section backgrounds
export const assets = {
  hero: {
    background: `${ASSET_BASE}/homePage.jpg`,
  },
  about: {
    background: `${ASSET_BASE}/b_3/aboutPage.jpg`,
  },
}

// Work catalog — keyed by category slug, ordered list of projects.
// Each project is an ordered list of media items the gallery cycles through.
export const workMedia = {
  'adaptive-flesh': [
    // Project 1 — b_1
    {
      media: [
        img('b_1/bb2.jpg'),
        img('b_1/white_01.jpg'),
        img('b_1/white_02.jpg'),
        img('b_1/closeUp_01.jpg'),
        img('b_1/closeW01.jpg'),
        img('b_1/closeW02.jpg'),
        img('b_1/full_bg_white_front_01_D.jpg'),
        img('b_1/side_02.jpg'),
        img('b_1/side_02_B.jpg'),
        img('b_1/side_03.jpg'),
        img('b_1/side_03_B.jpg'),
        img('b_1/side_04.jpg'),
        img('b_1/side_05.jpg'),
        img('b_1/side_white_01_B.jpg'),
        img('b_1/bottom_1.jpg'),
        img('b_1/s1.jpg'),
        img('b_1/s2.jpg'),
        img('b_1/trans_01.jpg'),
      ],
    },
    // Project 2 — b_2 (leads with the motion study)
    {
      media: [
        video('b_2/bodysuit_pressure_02_anim.mp4'),
        img('b_2/2.jpg'),
        img('b_2/side_01.jpg'),
        img('b_2/side_02.jpg'),
        img('b_2/side_02_B.jpg'),
        img('b_2/side_03.jpg'),
        img('b_2/side_05_A.jpg'),
        img('b_2/back_01.jpg'),
        img('b_2/back_closeUP_01.jpg'),
        img('b_2/2side_back_01.jpg'),
        img('b_2/side_back_02.jpg'),
        img('b_2/side_front_01_B.jpg'),
        img('b_2/side_front_01_C.jpg'),
        img('b_2/closeUP_03_I.jpg'),
        img('b_2/top_01_A.jpg'),
        img('b_2/top_01_B.jpg'),
        img('b_2/top_01_B%20copy.jpg'),
      ],
    },
    // Project 3 — b_3 (aboutPage.jpg lives here but is reserved for the About section)
    {
      media: [
        img('b_3/Full_Body_02_v01.jpg'),
        img('b_3/Full_Body_02_v02.jpg'),
        img('b_3/Full_Body_02_v03.jpg'),
        img('b_3/Full_Body_02_v04.jpg'),
        img('b_3/full%20body_02.jpg'),
        img('b_3/full%20body_04.jpg'),
        img('b_3/closeUP_01.jpg'),
        img('b_3/closeUP_03.jpg'),
        img('b_3/closeUP_04.jpg'),
        img('b_3/cocoon_01.jpg'),
        img('b_3/cocoon_03.jpg'),
        img('b_3/cocoon_04.jpg'),
        img('b_3/cocoon_06.jpg'),
        img('b_3/cocoon_08.jpg'),
        img('b_3/side_03_v04.jpg'),
        img('b_3/side_03_v23_NEW.jpg'),
        img('b_3/side_03_v24_NEW.jpg'),
        img('b_3/side_03_v25_NEW.jpg'),
        img('b_3/side_07_v04.jpg'),
        img('b_3/zoomed.jpg'),
      ],
    },
  ],
  physical: [
    // Project 1 — single image, to be supplied by client.
    {
      media: [{ type: 'placeholder', src: null }],
    },
  ],
}
