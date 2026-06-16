/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf2f3',
          100: '#f9e0e3',
          200: '#f4bcc3',
          300: '#ed8d99',
          400: '#e55d6d',
          500: '#d93b4f',
          600: '#800020',
          700: '#66001a',
          800: '#4d0014',
          900: '#33000d',
        },
        gold: {
          50: '#faf7ed',
          100: '#f3ecd1',
          200: '#e8d9a3',
          300: '#ddc675',
          400: '#d1b347',
          500: '#c9a84c',
          600: '#a88a2e',
          700: '#876d22',
          800: '#665017',
          900: '#44340e',
        },
        cream: '#f0ebe3',
        void: '#0f0d0b',
        ebony: '#1a1510',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
