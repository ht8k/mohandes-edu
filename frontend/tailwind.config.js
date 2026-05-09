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
          50: '#eef4ff',
          100: '#dae6ff',
          200: '#bfd2ff',
          300: '#94b3ff',
          400: '#6388ff',
          500: '#3e62f8',
          600: '#2843e0',
          700: '#1f33b6',
          800: '#1c2d8e',
          900: '#1a2870',
          950: '#101a4d',
        },
        accent: {
          DEFAULT: '#0d9488',
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        soft: '0 8px 24px -8px rgba(28, 45, 142, 0.18)',
        card: '0 4px 14px -4px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}

