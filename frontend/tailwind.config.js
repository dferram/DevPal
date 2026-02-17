/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary palette
        "primary-blue": "#2563EB",
        "primary-blue-dark": "#1D4ED8",

        // Backgrounds
        "dark-bg": "#0F172A",
        "dark-bg-light": "#172554",

        // Accents
        "accent-cyan": "#22D3EE",
        "accent-cyan-light": "#67E8F9",

        // Neutrals
        "card-white": "#FFFFFF",
        "input-gray": "#F1F5F9",
        "text-muted": "#64748B",
        "text-light": "#94A3B8",

        // Decorative bubbles
        "bubble-1": "rgba(37, 99, 235, 0.3)",
        "bubble-2": "rgba(34, 211, 238, 0.2)",
        "bubble-3": "rgba(96, 165, 250, 0.25)",
      },
      fontFamily: {
        sans: ["System", "Inter", "sans-serif"],
      },
      borderRadius: {
        pill: "9999px",
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        medium:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        strong:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};
