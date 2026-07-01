import Nav from '@/components/ui/Nav'
import ScrollStage from '@/components/ui/ScrollStage'
import Hero from '@/components/sections/Hero'
import Work from '@/components/sections/Work'
import WorkMobile from '@/components/sections/WorkMobile'
import About from '@/components/sections/About'

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        {/* Desktop (≥1024px) — triggered slideshow that crossfades one section at
            a time on wheel/keys. ScrollStage owns scroll only at this tier. */}
        <div className="hidden lg:block">
          <ScrollStage themes={['dark', 'light', 'dark']} ids={['home', 'work', 'about']}>
            <Hero />
            <Work />
            <About />
          </ScrollStage>
        </div>

        {/* Mobile / tablet (<1024px) — natural vertical scroll through full-height
            sections. Work becomes one full-screen cover per category. */}
        <div className="lg:hidden">
          <Hero sectionId="home" />
          <WorkMobile />
          <About sectionId="about" />
        </div>
      </main>
    </>
  )
}
