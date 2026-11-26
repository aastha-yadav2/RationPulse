/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#F2F7F4',
          100: '#D8F3DC',
          200: '#B7E4C7',
          300: '#95D5B2',
          400: '#74C69D',
          500: '#52B788',
          600: '#40916C',
          700: '#2D6A4F',
          800: '#1B4332',
          900: '#0F291E',
        },
        sage: {
          50: '#F6F8F6',
          100: '#E9EFEA',
          200: '#D3DFD5',
          300: '#B3C7B7',
          400: '#84A98C',
          500: '#52796F',
          600: '#354F52',
          700: '#2F3E46',
        },
        canvas: {
          DEFAULT: '#F8F7F4',
          card: '#FFFFFF',
          subtle: '#F1EFEA',
          border: '#E5E2DC',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(27, 67, 50, 0.04), 0 1px 2px -1px rgba(27, 67, 50, 0.03)',
        'card-hover': '0 4px 12px -2px rgba(27, 67, 50, 0.08), 0 2px 4px -2px rgba(27, 67, 50, 0.04)',
      }
    },
  },
  plugins: [],
}
