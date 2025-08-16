// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/app/**/*.{ts,tsx,js,jsx}",
    "./src/components/**/*.{ts,tsx,js,jsx}",
    "./src/pages/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Body (you can keep this as system or point to Orbitron/Gugi if you want)
        sans: [
          "system-ui",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        // For headings
        display: ["var(--font-orbitron)", "system-ui", "sans-serif"],
        // For your logo or special bits
        logo: ["var(--font-gugi)", "cursive"],
        // For code
        mono: [
          "var(--font-roboto-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
