/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Extracted from mockup CSS variables (:root)
        'bone-porcelain': '#F3EEE8',
        'synthetic-flesh': '#C9A48F',
        'surgical-taupe': '#8F786C',
        'oxidized-graphite': '#1A1A1C',
        'wet-petroleum': '#22262B',
      },
      fontFamily: {
        // Extracted from mockup font declarations
        cormorant: ['var(--font-cormorant)', 'Georgia', 'serif'],
        // Custom display font
        copperplate: ['var(--font-copperplate)', 'Copperplate', 'Georgia', 'serif'],
        ernest: ['var(--font-ernest)', 'Ernest'],
        // Adobe Fonts / Typekit — hero descriptor
        descriptor: ['"futura-pt"', 'sans-serif'],
        // Adobe Fonts / Typekit
        'forma-banner': ['"forma-djr-banner"', 'sans-serif'],
        'neue-haas-display': ['"neue-haas-grotesk-display"', 'sans-serif'],
        'neue-haas-text': ['"neue-haas-grotesk-text"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
