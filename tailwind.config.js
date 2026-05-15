/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        orange: {
          50: "#fff7ed",
          100: "#ffedd5",
          500: "#ff5a1f",
          600: "#f04b0b",
          700: "#c93a05"
        },
        navy: "#111827",
        panel: "#f8fafc"
      },
      boxShadow: {
        card: "0 10px 30px rgba(15, 23, 42, 0.06)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
