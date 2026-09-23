/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        astrotalk: {
          yellow: '#FFD700',
          gold: '#F59E0B',
          goldHover: '#D97706',
          amberLight: '#FEF3C7',
          amberBg: '#FFFBEB',
          saffron: '#FF9933',
          navy: '#0F172A',
          charcoal: '#1E293B',
          muted: '#64748B',
          border: '#E2E8F0',
          bgLight: '#F8FAFC',
          card: '#FFFFFF',
          green: '#10B981',
          greenDark: '#059669',
          red: '#EF4444',
          orange: '#FF5722',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        serif: ['"Cormorant Garamond"', 'serif'],
      },
      boxShadow: {
        'at-card': '0 2px 12px -2px rgba(0, 0, 0, 0.06), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'at-hover': '0 10px 25px -3px rgba(245, 158, 11, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'at-glow': '0 0 20px rgba(245, 158, 11, 0.25)',
      }
    },
  },
  plugins: [],
}
