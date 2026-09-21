/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warehouse: {
          dark: '#0F172A',
          card: '#1E293B',
          border: '#334155',
          primary: '#2563EB',
          primaryHover: '#1D4ED8',
          accent: '#0D9488',
          b1: '#3B82F6',
          b2: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          success: '#22C55E'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace']
      }
    },
  },
  plugins: [],
}
