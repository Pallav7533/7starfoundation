import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        magenta: { DEFAULT: "#C2185B", dark: "#9C1049", light: "#E04A87" },
        navy: { DEFAULT: "#202044", light: "#34346B" },
        ivory: "#FFF8E9",
        cream: "#F8F0DE",
        gold: { DEFAULT: "#D7A54A", dark: "#B8862F", light: "#EBCB86" },
        body: "#34313A",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        photo: "0 24px 50px -18px rgba(32,32,68,.45)",
        soft: "0 10px 30px -12px rgba(32,32,68,.25)",
      },
    },
  },
  plugins: [],
};
export default config;
