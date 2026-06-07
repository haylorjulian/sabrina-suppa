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
      },
    },
  },
  plugins: [],
}
