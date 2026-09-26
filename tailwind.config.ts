import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#FDF8F0",
          50: "#FFFFFF",
          100: "#FAF4EB",
          200: "#FDF8F0",
          300: "#F5E9D6",
          400: "#EBD4B4",
          500: "#DFC193",
        },
        terracotta: {
          DEFAULT: "#8B4520",
          light: "#A4562B",
          dark: "#3d2418",
          50: "#F8ECE7",
          100: "#EED2C5",
          200: "#DEA68D",
          300: "#CE7B55",
          400: "#A4562B",
          500: "#8B4520",
          600: "#703517",
          700: "#55260F",
          800: "#3D2418",
          900: "#22110B",
        },
        blush: {
          DEFAULT: "#F4C2C2",
          light: "#FDF0F0",
          medium: "#E8A598",
          dark: "#D98888",
        },
        gold: {
          DEFAULT: "#E5B25D",
          light: "#F5D491",
          medium: "#D4AF37",
          dark: "#B88628",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(61, 36, 24, 0.08)",
        "glass-hover": "0 14px 44px 0 rgba(61, 36, 24, 0.14)",
        "glass-active": "0 4px 16px 0 rgba(61, 36, 24, 0.12)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
export default config;
