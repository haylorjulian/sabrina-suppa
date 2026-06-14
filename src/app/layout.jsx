import { Cormorant } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'
import Providers from '@/components/Providers'
import PageTransitionWrapper from '@/components/PageTransitionWrapper'
import copy from '@/content/copy.json'

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

export const metadata = {
  title: copy.en.meta.title,
  description: copy.en.meta.description,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${copperplate.variable}`}>
      <head>
        {/* Adobe Fonts (Typekit) — provides "futura-pt" for the hero descriptor */}
        <link rel="stylesheet" href="https://use.typekit.net/kbo0jje.css" />
      </head>
      <body className="font-cormorant bg-oxidized-graphite text-bone-porcelain antialiased">
        <Providers>
          <PageTransitionWrapper>{children}</PageTransitionWrapper>
        </Providers>
      </body>
    </html>
  )
}
