/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fef2f2",
          100: "#fee2e2",
          500: "#e94560",
          600: "#dc2626",
          700: "#b91c1c",
        },
        dark: {
          900: "#0f0f1a",
          800: "#1a1a2e",
          700: "#16213e",
          600: "#0f3460",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      }
    },
  },
  plugins: [],
}