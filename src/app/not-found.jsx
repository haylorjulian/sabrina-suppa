import Link from 'next/link'
import copy from '@/content/copy.generated.json'

export const metadata = {
  title: 'Page not found — Sabrina Suppa',
}

// Branded 404. Server component — copy is read straight from the content file
// (no language provider needed outside the interactive sections).
export default function NotFound() {
  const c = copy.en.notFound

  return (
    <main className="flex min-h-[100dvh] w-full flex-col items-center justify-center bg-oxidized-graphite px-6 text-center text-bone-porcelain">
      <p className="font-neue-haas-display text-[0.75rem] uppercase tracking-[0.34em] text-synthetic-flesh/70 [text-shadow:0_1px_8px_rgba(26,26,28,0.7)]">
        {c.code}
      </p>

      <h1 className="mt-6 font-neue-haas-display text-[clamp(1.75rem,5vw,3.25rem)] font-light italic tracking-[0.02em]">
        {c.title}
      </h1>

      <p className="body-copy-lg mt-4 max-w-[44ch] font-light text-bone-porcelain/70">
        {c.body}
      </p>

      <Link
        href="/"
        className="mt-10 border border-bone-porcelain/40 px-9 py-3 text-[0.6875rem] uppercase tracking-[0.3em] text-bone-porcelain transition-colors duration-300 hover:bg-bone-porcelain hover:text-oxidized-graphite"
      >
        {c.home}
      </Link>
    </main>
  )
}
