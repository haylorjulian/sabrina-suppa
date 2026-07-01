import Nav from '@/components/ui/Nav'
import ScrollStage from '@/components/ui/ScrollStage'
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
          {/* Sections cross-dissolve into one another on scroll */}
          <ScrollStage themes={['dark', 'dark', 'dark']} ids={['home', 'work', 'about']}>
            <Hero />
            <Work />
            <About />
          </ScrollStage>
        </main>
      </div>
    </>
  )
}
