/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "../../packages/ui/src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // ── Train Track brand palette (from product spec) ──────────────
        // Dark surfaces
        navy: {
          DEFAULT: "#1A2332", // Primary dark — trust, professionalism
          deep: "#0F1117",   // Surface dark / near-black — dark mode base
          card: "#1A1D2E",   // Card surface (from prototype)
          sidebar: "#141620", // Sidebar surface (from prototype)
          border: "#2D3148", // Border color (from prototype)
          input: "#242838",  // Input bg / sidebar active (from prototype)
        },
        // Accent colors
        teal: {
          DEFAULT: "#00E5CC", // Electric teal — energy + wellness (spec)
          proto: "#2DD4A8",   // Prototype teal variant
          light: "#2DD4A8",
          muted: "#2DD4A822",
        },
        // Secondary accent
        ember: {
          DEFAULT: "#FF6B35", // Vibrant orange — CTAs, energy states
        },
        // Semantic
        gold: {
          DEFAULT: "#FFD700", // PR / Achievement celebrations
        },
        success: {
          DEFAULT: "#4CAF50",
        },
        // Override defaults with spec values
        red: {
          DEFAULT: "#EF5350", // Error / alerts / missed workouts
          badge: "#EF535022",
        },
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
