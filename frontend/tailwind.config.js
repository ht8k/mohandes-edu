/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'Tajawal', 'system-ui', 'sans-serif'],
        display: ['Cairo', 'Tajawal', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#e6f0f7',
          100: '#cfe1ee',
          200: '#a3c2d8',
          300: '#6e9bbb',
          400: '#3f78a0',
          500: '#1f5d88',
          600: '#174c72',
          700: '#0f3c5c',
          800: '#0a2d48',
          900: '#062236',
          950: '#031827',
        },
        accent: {
          DEFAULT: '#14b8a6',
          50: '#ecfdf5',
          100: '#cffaf0',
          200: '#9bf0dd',
          300: '#5fdec3',
          400: '#2cc6a8',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        soft: '0 8px 24px -8px rgba(10, 45, 72, 0.18)',
        card: '0 4px 14px -4px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}

