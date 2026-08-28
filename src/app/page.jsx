import ScrollStage from '@/components/ui/ScrollStage'
import PreloaderProvider from '@/components/PreloaderProvider'
import Hero from '@/components/sections/Hero'
import Work from '@/components/sections/Work'
import WorkMobile from '@/components/sections/WorkMobile'
import About from '@/components/sections/About'
import Connect from '@/components/sections/Connect'
import MobileSectionTarget from '@/components/ui/MobileSectionTarget'
import ConnectApproachTail from '@/components/ui/ConnectApproachTail'

export default function Home() {
  return (
    <PreloaderProvider>
      <main>
        {/* Desktop (≥1024px) — triggered slideshow that crossfades one section at
            a time on wheel/keys. ScrollStage owns scroll only at this tier. */}
        <div className="hidden lg:block">
          <ScrollStage
            themes={['dark', 'light', 'dark', 'dark']}
            ids={['home', 'work', 'about', 'connect']}
          >
            <Hero />
            <Work />
            <About />
            <Connect />
          </ScrollStage>
        </div>

        {/* Mobile / tablet (<1024px) — natural vertical scroll through full-height
            sections. Work becomes one full-screen cover per category. */}
        <div className="lg:hidden">
          {/* Lands the page on the section a cross-page link asked for — the
              mobile counterpart to ScrollStage's index seed. Renders nothing. */}
          <MobileSectionTarget />
          <Hero sectionId="home" />
          <WorkMobile />
          <About sectionId="about" />
          <Connect sectionId="connect" />
          {/* Trailing scroll room, so Connect's snap point is never the
              document's maximum scroll offset. See .connect-tail in
              globals.css — zero height everywhere but iOS Safari. */}
          <div aria-hidden="true" className="connect-tail" />
          {/* Keeps that tail present only while Connect is being approached.
              Renders nothing; no-ops off iOS Safari. */}
          <ConnectApproachTail />
        </div>
      </main>
    </PreloaderProvider>
  )
}
