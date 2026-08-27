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
        {/* Marks Safari on <html> so CSS can hold one rule back from it — the
            bottom-edge lift in globals.css, which overshoots there because
            Safari paints page content below the viewport it reports.

            A user-agent test, reluctantly: on iOS every browser is WebKit, so
            no feature query can separate Safari from Chrome/Firefox/Edge on the
            same device. The UA string is the only thing that differs.

            Inline and render-blocking on purpose — it must run before first
            paint or Safari would paint one frame with the lift applied. It only
            sets an attribute on <html>, which React does not own, so there is
            no hydration mismatch. With JS off, no attribute is set and the lift
            applies, which is the pre-Safari-fix behaviour.

            The negative list is what does the work: Android Chrome carries both
            "Chrome" and "Android", and the iOS builds carry CriOS / FxiOS /
            EdgiOS. Minor iOS WebKit browsers (Opera, DuckDuckGo) fall through
            as Safari — the right side to err on, since they share its painting
            behaviour. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(/^((?!chrome|android|crios|fxios|edgios).)*safari/i.test(navigator.userAgent))" +
              "document.documentElement.setAttribute('data-browser','safari')}catch(e){}",
          }}
        />
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
