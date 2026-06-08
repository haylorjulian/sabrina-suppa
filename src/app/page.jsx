import Nav from '@/components/ui/Nav'
import SectionFade from '@/components/ui/SectionFade'
import MobileNotice from '@/components/ui/MobileNotice'
import Hero from '@/components/sections/Hero'
import Work from '@/components/sections/Work'
import About from '@/components/sections/About'

export default function Home() {
  return (
    <>
      {/* Phones + tablets: hero image with an "in progress" notice */}
      <MobileNotice />

      {/* Full site — desktop only (≥1024px) for now */}
      <div className="hidden lg:block">
        <Nav />
        <main>
          <SectionFade>
            <Hero />
          </SectionFade>
          <SectionFade>
            <Work />
          </SectionFade>
          <SectionFade>
            <About />
          </SectionFade>
        </main>
      </div>
    </>
  )
}
