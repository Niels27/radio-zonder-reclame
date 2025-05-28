/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'radio-dark': '#1a1a1a',
        'radio-darker': '#0f0f0f',
        'radio-accent': '#3b82f6',
        'radio-accent-hover': '#2563eb',
        'radio-secondary': '#6b7280',
        'ad-break': '#ef4444',
      },
    },
  },
  plugins: [],
}
