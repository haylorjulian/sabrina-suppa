import { Cormorant } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'
import Providers from '@/components/Providers'
import PageTransitionWrapper from '@/components/PageTransitionWrapper'
import copy from '@/content/copy.generated.json'

// Cormorant via next/font ships weights 300+. The mockups call for a 200
// hairline; 300 is the thinnest available, so font-extralight (200) utilities
// render at the nearest available weight (300).
const cormorant = Cormorant({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

// Custom display font — hero name, navigation, and headers (e.g. category names).
const copperplate = localFont({
  src: '../fonts/CopperplateGothicLight.ttf',
  variable: '--font-copperplate',
  display: 'swap',
})

// Custom display font
const ernest = localFont({
  src: '../fonts/ErnestTrial-Regular.otf',
  variable: '--font-ernest',
  display: 'swap',
})

// ── Audition fonts ───────────────────────────────────────────────────────────
// Declared only so they can be tried on live elements from devtools — paste the
// CSS var into a font-family. Nothing in the app references them yet.
//
// `preload: false` is load-bearing on all of these: next/font preloads by
// default, and preloading ~2.1MB of unused faces on every page would be a real
// regression. With it off the browser fetches a face only once something
// actually uses it, so an unused audition font costs nothing but a @font-face.
//
// Families and weights come from each file's own name table (filenames were
// cryptic — PER_____.TTF was Perpetua Regular — so they are renamed to match).
// Grouped by real family so weight/style select the cut the way they should.
const felixTitling = localFont({
  src: '../fonts/FelixTitling-Regular.ttf',
  variable: '--font-felix-titling',
  display: 'swap',
  preload: false,
})

const helvetica = localFont({
  src: [
    { path: '../fonts/Helvetica-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../fonts/Helvetica-Oblique.ttf', weight: '400', style: 'italic' },
    { path: '../fonts/Helvetica-Bold.ttf', weight: '700', style: 'normal' },
    { path: '../fonts/Helvetica-BoldOblique.ttf', weight: '700', style: 'italic' },
  ],
  variable: '--font-helvetica',
  display: 'swap',
  preload: false,
})

// Compressed is a distinct display cut, not a weight of the Helvetica above, so
// it gets its own variable rather than being folded in.
// (Helvetica Light is deliberately absent: its cmap table is malformed and every
// browser's font sanitiser rejects it — "Range glyph reference too high". It was
// removed rather than repaired.)
const helveticaCompressed = localFont({
  src: '../fonts/HelveticaCompressed-Regular.otf',
  variable: '--font-helvetica-compressed',
  display: 'swap',
  preload: false,
})

const perpetua = localFont({
  src: [
    { path: '../fonts/Perpetua-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../fonts/Perpetua-Italic.ttf', weight: '400', style: 'italic' },
    { path: '../fonts/Perpetua-Bold.ttf', weight: '700', style: 'normal' },
    { path: '../fonts/Perpetua-BoldItalic.ttf', weight: '700', style: 'italic' },
  ],
  variable: '--font-perpetua',
  display: 'swap',
  preload: false,
})

// Perpetua Titling MT — a separate titling face, caps-only, not Perpetua's cuts.
const perpetuaTitling = localFont({
  src: [
    { path: '../fonts/PerpetuaTitlingMT-Light.ttf', weight: '300', style: 'normal' },
    { path: '../fonts/PerpetuaTitlingMT-Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-perpetua-titling',
  display: 'swap',
  preload: false,
})

const romie = localFont({
  src: [
    { path: '../fonts/RomieTrial-Regular.otf', weight: '400', style: 'normal' },
    { path: '../fonts/RomieTrial-Italic.otf', weight: '400', style: 'italic' },
  ],
  variable: '--font-romie',
  display: 'swap',
  preload: false,
})

const auditionFonts = [
  felixTitling,
  helvetica,
  helveticaCompressed,
  perpetua,
  perpetuaTitling,
  romie,
]
  .map((f) => f.variable)
  .join(' ')

export const metadata = {
  // Resolves relative og/twitter image paths to absolute URLs. Update if the
  // production domain changes.
  metadataBase: new URL('https://sabrinasuppa.com'),
  title: copy.en.meta.title,
  description: copy.en.meta.description,
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Sabrina Suppa',
    title: copy.en.meta.title,
    description: copy.en.meta.description,
    images: [{ url: '/assets/sabrina-suppa/homePage.jpg', alt: copy.en.hero.bgAlt }],
  },
  twitter: {
    card: 'summary_large_image',
    title: copy.en.meta.title,
    description: copy.en.meta.description,
    images: ['/assets/sabrina-suppa/homePage.jpg'],
    creator: '@suppa_sabrina',
  },
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${copperplate.variable} ${ernest.variable} ${auditionFonts}`}
    >
      <head>
        {/* Adobe Fonts (Typekit) — provides "futura-pt" for the Descriptor/Label tier */}
        <link rel="stylesheet" href="https://use.typekit.net/kbo0jje.css" />
      </head>
      <body className="font-neue-haas-display bg-oxidized-graphite text-bone-porcelain antialiased">
        <Providers>
          <PageTransitionWrapper>{children}</PageTransitionWrapper>
        </Providers>
        {/* Bug reporting widget — opt-in, staging only. NEXT_PUBLIC_ENV is set to
            "staging" only in the staging build step (.github/workflows/deploy-staging.yml);
            it's unset everywhere else (production build, local dev on any branch),
            so the widget stays off by default. */}
        {process.env.NEXT_PUBLIC_ENV === 'staging' && (
          <script
            src="https://bugdrop.neonwatty.workers.dev/widget.js"
            data-repo="haylorjulian/sabrina-suppa"
          />
        )}
      </body>
    </html>
  )
}
