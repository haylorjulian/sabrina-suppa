import './globals.css'
import Providers from '@/components/Providers'
import PageTransitionWrapper from '@/components/PageTransitionWrapper'
import Nav from '@/components/ui/Nav'
import copy from '@/content/copy.generated.json'

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

// Next emits the viewport meta from here. `viewport-fit=cover` is what lets a
// full-screen section paint edge to edge on a notched iPhone instead of being
// letterboxed by the safe areas — and it is what makes env(safe-area-inset-*)
// resolve to anything other than 0, which the fixed nav and every bottom-anchored
// group below rely on to stay clear of the notch and the home indicator.
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Adobe Fonts (Typekit) — provides "futura-pt" for the Descriptor/Label tier */}
        <link rel="stylesheet" href="https://use.typekit.net/kbo0jje.css" />
        {/* A `data-browser="safari"` UA sniff used to be set here, before first
            paint, so two CSS rules could be held back from Safari — the
            bottom-edge lift and the trailing scroll room under the last section.
            Both existed because the document scrolled and Safari resized its
            layout viewport as the URL bar moved. The stage does not scroll, so
            the bar never moves, and the sniff had no readers left. */}
      </head>
      <body className="font-neue-haas-display bg-oxidized-graphite text-bone-porcelain antialiased">
        <Providers>
          {/* Single global navbar, shared across every route. Kept as a sibling
              of the transition wrapper so it persists (no re-fade, menu state
              survives) across client navigations. */}
          <Nav />
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
