export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        nexus: {
          orange: "#ff5a0a",
          orange2: "#ff7a1a",
          ink: "#111827",
          muted: "#667085",
          line: "#e8eaef",
          page: "#f7f8fb"
        }
      },
      boxShadow: {
        panel: "0 18px 60px rgba(15, 23, 42, 0.08)",
        card: "0 8px 30px rgba(15, 23, 42, 0.06)"
      }
    },
  },
  plugins: [],
};
