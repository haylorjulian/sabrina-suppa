// Minimal inline SVG icons (currentColor). Sized via className (default 1em).

export function EmailIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function InstagramIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

// X / Twitter logo
export function TwitterIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  )
}

// Linktree logo
export function LinktreeIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.736 5.853l4.005-4.117 2.325 2.38-4.2 4.005h5.908v3.305h-5.937l4.229 4.108-2.325 2.334L12 12.099l-5.741 5.769-2.325-2.334 4.229-4.108H2.226V8.121h5.908l-4.2-4.005 2.325-2.38 4.005 4.117V0h3.472v5.853zM10.264 16.063h3.472V24h-3.472v-7.937z" />
    </svg>
  )
}

const ICONS = {
  Email: EmailIcon,
  Instagram: InstagramIcon,
  Twitter: TwitterIcon,
  Linktree: LinktreeIcon,
}

// Resolve an icon by its social label (from copy.json about.social).
export function SocialIcon({ label, className }) {
  const Cmp = ICONS[label]
  return Cmp ? <Cmp className={className} /> : null
}
