'use client'

import { useLanguage } from '@/hooks/useLanguage'

// EN/IT toggle. Label shows the language you'd switch TO (copy.nav.lang).
export default function LangToggle({ theme = 'dark', className = '' }) {
  const { toggle, t } = useLanguage()
  const palette =
    theme === 'dark'
      ? 'text-synthetic-flesh/70 border-synthetic-flesh/25 hover:text-synthetic-flesh'
      : 'text-synthetic-flesh border-synthetic-flesh/35 hover:text-surgical-taupe'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle language"
      className={`border-l pl-[18px] text-[10px] uppercase tracking-[0.22em] transition-colors duration-300 ${palette} ${className}`}
    >
      {t.nav.lang}
    </button>
  )
}
