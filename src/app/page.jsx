import Nav from '@/components/ui/Nav'
import SectionFade from '@/components/ui/SectionFade'
import Hero from '@/components/sections/Hero'
import Work from '@/components/sections/Work'
import About from '@/components/sections/About'

export default function Home() {
  return (
    <>
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
    </>
  )
}
