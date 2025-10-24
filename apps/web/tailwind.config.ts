import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#0EA5E9', dark: '#0284C7' },
        surface: { DEFAULT: '#111827', light: '#F9FAFB' },
      },
      borderRadius: {
        xl: '0.75rem',
      }
    }
  },
  plugins: []
}
export default config
