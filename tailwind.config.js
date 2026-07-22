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
        // Adobe Fonts / Typekit
        'neue-haas-display': ['"neue-haas-grotesk-display"', 'sans-serif'],
        'ivyora-display': ['"ivyora-display"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
