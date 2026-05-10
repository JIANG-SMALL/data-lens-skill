/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        },
        accent: '#38bdf8',
        node: {
          dimension: '#60a5fa',
          metric: '#34d399',
          event: '#fb923c',
          relation: '#c084fc',
        },
        status: {
          good: '#22c55e',
          warn: '#f97316',
          danger: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans SC', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
