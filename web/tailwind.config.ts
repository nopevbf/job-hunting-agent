import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          base: "#FAF7F1",
          tint: "#F1ECE1",
        },
        sage: {
          deep: "#3F5A46",
          primary: "#6F8F76",
          container: "#c8ebce",
          light: "#E8EFEA",
        },
        terracotta: {
          accent: "#C1683F",
          soft: "#EFC9AE",
          deep: "#893d17",
        },
        ink: {
          base: "#2A2823",
          muted: "#6B675F",
        },
        line: {
          subtle: "rgba(42, 40, 35, 0.10)",
        },
      },
      fontFamily: {
        display: ["var(--font-plus-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        body: ["var(--font-manrope)", "Manrope", "sans-serif"],
      },
      borderRadius: {
        "bento-lg": "28px",
        "bento-md": "22px",
        "bento-sm": "18px",
      },
      boxShadow: {
        "liquid-glass": "0 1px 1px rgba(42, 40, 35, 0.04), 0 12px 32px rgba(63, 90, 70, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
