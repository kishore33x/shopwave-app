import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./charts/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#0b1324",
        surf: "#ecf5ff",
        mint: "#6ee7b7",
        wave: "#0284c7",
        glow: "#f59e0b"
      },
      fontFamily: {
        sans: ["Manrope", "Segoe UI", "sans-serif"],
        display: ["Sora", "Trebuchet MS", "sans-serif"]
      },
      boxShadow: {
        panel: "0 12px 30px rgba(2, 8, 23, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
