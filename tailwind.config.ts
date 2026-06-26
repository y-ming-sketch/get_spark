import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Spark brand palette
        // Primary: Stanford Cardinal Red
        spark: {
          50: "#FCEBEB",
          100: "#F8D2D2",
          200: "#EFA0A0",
          300: "#E36E6E",
          400: "#C93838",
          500: "#8C1515", // Stanford Red — primary
          600: "#7A1212",
          700: "#5E0E0E",
          800: "#420A0A",
          900: "#2A0606",
        },
        // Claude-inspired warm cream backgrounds
        cream: {
          50: "#FAF9F5",   // page bg
          100: "#F5F1E8",  // panel bg
          200: "#EDE7D6",  // hover
          300: "#DDD4BD",  // borders
          400: "#B8AC8E",
          500: "#8A7F65",
        },
        ink: {
          50: "#F5F5F4",
          100: "#E7E5E1",
          200: "#C9C5BD",
          300: "#A39E92",
          400: "#6B6557",
          500: "#3D3A33",
          600: "#28251F",
          700: "#1B1A16",
          800: "#13120F",
          900: "#0A0A08",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Inter",
          "sans-serif",
        ],
        serif: ["Tiempos", "Georgia", "serif"],
        mono: ["JetBrains Mono", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.25s ease-out",
        "pulse-dot": "pulseDot 1.4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseDot: {
          "0%, 80%, 100%": { opacity: "0.3", transform: "scale(0.8)" },
          "40%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
