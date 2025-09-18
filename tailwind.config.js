// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'linear-bg': '#fcfcfc',
        'linear-border': '#e5e5e5',
        'linear-text': '#1a1a1a',
        'linear-text-secondary': '#666666',
        'linear-primary': '#5e6ad2',
        'linear-primary-hover': '#4f5bb5',
        'linear-ring': '#5e6ad240',
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Poppins", "sans-serif"], // opcional
      },
    },
  },
  plugins: [],
}
