/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-app)",
        "background-secondary": "var(--bg-secondary)",
        surface: "#111113",
        "surface-raised": "#17171A",
        "surface-card": "#111113",
        border: "rgba(233, 79, 159, 0.16)",
        "border-light": "rgba(233, 79, 159, 0.16)",
        primary: {
          50: "#fdf2f8",
          100: "#fce7f3",
          200: "#fbcfe8",
          300: "#f9a8d4",
          400: "#f47bb7",
          500: "#e94f9f",
          600: "#d83f8f",
          700: "#b83278",
          800: "#8c1d58",
          900: "#17171a",
          950: "#050505",
        },
        accent: {
          light: "#ff5cad",
          DEFAULT: "#e94f9f",
          dark: "#b83278",
          subtle: "#f47bb7",
        }
      },
      fontFamily: {
        arabic: ['var(--font-tajawal)', 'Tajawal', 'IBM Plex Sans Arabic', 'sans-serif'],
        sans: ['var(--font-tajawal)', 'Tajawal', 'IBM Plex Sans Arabic', 'sans-serif'],
        display: ['var(--font-tajawal)', 'Tajawal', 'IBM Plex Sans Arabic', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
