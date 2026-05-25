import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        app: "#f7f8fb",
        surface: "#ffffff",
        subtle: "#f9fafc",
        primary: "#0b1020",
        secondary: "#34415f",
        muted: "#667085",
        line: "#e5e8f0",
        orange: "#ff5a1f",
      },
      boxShadow: {
        card: "0 8px 24px rgba(15, 23, 42, 0.035)",
        shell: "0 18px 50px rgba(15, 23, 42, 0.06)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
