import PreloaderProvider from '@/components/PreloaderProvider'
import DesktopStage from '@/components/sections/DesktopStage'
import MobileStage from '@/components/sections/MobileStage'

// Two trees, one engine. Both stages run the same SectionStage — same input,
// same transition, same navigation contract — and differ only in their panel
// list, because Work is one two-column section at lg+ and one full-screen cover
// per category below it.
//
// The tier switch stays CSS-only rather than a runtime `useMediaQuery`: this is
// a static export, and useMediaQuery returns false until mount, so a runtime
// switch would ship the desktop tree in the HTML and swap it on hydration — a
// flash plus a Hero remount behind the preloader. Each stage's matchMedia gate
// means only the visible one is ever engaged.
export default function Home() {
  return (
    <PreloaderProvider>
      <main>
        <div className="hidden lg:block">
          <DesktopStage />
        </div>
        <div className="lg:hidden">
          <MobileStage />
        </div>
      </main>
    </PreloaderProvider>
  )
}
