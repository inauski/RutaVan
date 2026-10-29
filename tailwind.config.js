/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.06), 0 4px 16px rgba(16, 24, 40, 0.06)",
        glow: "0 8px 24px rgba(4, 120, 87, 0.28)",
      },
    },
  },
  plugins: [],
};
