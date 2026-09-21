/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        carbon: {
          DEFAULT: '#0c0d0e',
          sidebar: '#0e1013',
          card: '#14171b',
          border: '#20242a',
          muted: '#2a2f37'
        },
        lime: {
          DEFAULT: '#d4f938',
          light: '#e6ff66',
          dark: '#a3e635',
          muted: '#ecfccb',
          text: '#365314'
        },
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
      boxShadow: {
        'liquid': '0 10px 30px -5px rgba(0, 0, 0, 0.04), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)',
        'liquid-hover': '0 20px 40px -10px rgba(0, 0, 0, 0.08), inset 0 1px 1px 0 rgba(255, 255, 255, 1)',
        'glow-lime': '0 0 25px -5px rgba(212, 249, 56, 0.4)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace']
      }
    },
  },
  plugins: [],
}
