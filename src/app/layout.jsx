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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Adobe Fonts (Typekit) — provides "futura-pt" for the Descriptor/Label tier */}
        <link rel="stylesheet" href="https://use.typekit.net/kbo0jje.css" />
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
