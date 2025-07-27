/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gain: '#10B981',
        loss: '#EF4444',
        tier: {
          s: '#FFD700',
          a: '#C0C0C0',
          b: '#CD7F32',
          c: '#4F46E5'
        }
      },
      fontFamily: {
        mono: ['Monaco', 'Menlo', 'Ubuntu Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}