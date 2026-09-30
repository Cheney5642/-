import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1f2933",
        canvas: "#f5f6f3",
        brand: "#315c4b",
        mint: "#e8f1ec",
        amberSoft: "#fff5df",
        redSoft: "#fff0ee"
      },
      boxShadow: {
        card: "0 8px 30px rgba(31, 41, 51, 0.06)"
      }
    }
  },
  plugins: []
} satisfies Config;
