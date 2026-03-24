import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef9ee',
          100: '#fdf0d0',
          200: '#fae09d',
          300: '#f7c962',
          400: '#f4af32',
          500: '#f19418',
          600: '#e5740e',
          700: '#be560e',
          800: '#974312',
          900: '#7a3812',
        },
        sage: {
          50: '#f4f7f2',
          100: '#e6ede2',
          200: '#cddcc6',
          300: '#a8c39f',
          400: '#7ea473',
          500: '#5c8752',
          600: '#486c40',
          700: '#3a5634',
          800: '#30452b',
          900: '#283a25',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
