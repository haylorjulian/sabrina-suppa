import ScrollStage from '@/components/ui/ScrollStage'
import PreloaderProvider from '@/components/PreloaderProvider'
import Hero from '@/components/sections/Hero'
import Work from '@/components/sections/Work'
import WorkMobile from '@/components/sections/WorkMobile'
import About from '@/components/sections/About'
import Connect from '@/components/sections/Connect'
import MobileSectionTarget from '@/components/ui/MobileSectionTarget'

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
        </div>
      </main>
    </PreloaderProvider>
  )
}
