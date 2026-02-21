/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Iron Sharpens Iron brand colors
        iron: {
          50: '#f7f7f8',
          100: '#eeeef0',
          200: '#d9d9de',
          300: '#b8b8c1',
          400: '#91919f',
          500: '#747484',
          600: '#5d5d6b',
          700: '#4c4c57',
          800: '#41414a',
          900: '#393940',
          950: '#26262b',
        },
        // Primary Brand - Electric Indigo
        brand: {
          50: '#eef0ff',
          100: '#e0e3ff',
          200: '#c7cbff',
          300: '#a5a8ff',
          400: '#8182ff',
          500: '#5B5CFF', // Primary
          600: '#4f4af5',
          700: '#4239d8',
          800: '#3630ae',
          900: '#302e89',
          950: '#1d1b50',
        },
        // Secondary Accent - Vibrant Teal
        teal: {
          50: '#effefa',
          100: '#c8fff2',
          200: '#92fee6',
          300: '#53f5d6',
          400: '#20e2c2',
          500: '#00C2A8', // Secondary
          600: '#04a18c',
          700: '#098072',
          800: '#0d655c',
          900: '#10534c',
          950: '#033330',
        },
        // Energy Accent - Coral Punch
        coral: {
          50: '#fff1f3',
          100: '#ffe0e5',
          200: '#ffc6d0',
          300: '#ff9dae',
          400: '#ff6b85',
          500: '#FF5A7A', // Energy
          600: '#ed2454',
          700: '#c81844',
          800: '#a7173f',
          900: '#8e183c',
          950: '#50071b',
        },
        // Keep flame for backwards compatibility during transition
        flame: {
          50: '#fff1f3',
          100: '#ffe0e5',
          200: '#ffc6d0',
          300: '#ff9dae',
          400: '#ff6b85',
          500: '#FF5A7A',
          600: '#ed2454',
          700: '#c81844',
          800: '#a7173f',
          900: '#8e183c',
          950: '#50071b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
