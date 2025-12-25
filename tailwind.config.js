/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'fantasy-dark': '#0f0f1e',
        'fantasy-purple': '#6c5ce7',
        'fantasy-gold': '#fdcb6e',
        'fantasy-red': '#e17055',
        'fantasy-green': '#00b894',
      },
    },
  },
  plugins: [],
}

