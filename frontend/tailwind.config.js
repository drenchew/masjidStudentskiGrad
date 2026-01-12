/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        islamic: {
          green: '#006B3F',
          gold: '#D4AF37',
          darkGreen: '#004D2C',
          lightGreen: '#E8F5E9',
          cream: '#FFF8E7'
        }
        ,
        // Backwards-compatible alias names used across the codebase
        // e.g. bg-masjid-green, hover:bg-masjid-dark, text-masjid-green
        'masjid-green': '#006B3F',
        'masjid-dark': '#004D2C',
        'masjid-gold': '#D4AF37',
        'masjid-light': '#E8F5E9'
      },
      fontFamily: {
        'arabic': ['Amiri', 'serif'],
        'sans': ['Cairo', 'sans-serif']
      }
    },
  },
  plugins: [],
}
