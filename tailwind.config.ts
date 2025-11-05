import type { Config } from "tailwindcss"

export default {
  content: ["./src/**/*.{ts,tsx,js,jsx,html}"],
  theme: {
    extend: {
      colors: {
        primary: "#0F766E",
        secondary: "#F4D03F",
        accent: "#14B8A6",
        dark: "#115E59"
      },
      backgroundImage: {
        "muezzin-gradient": "linear-gradient(135deg, #0F766E, #14B8A6, #F4D03F)"
      }
    }
  },
  plugins: []
} satisfies Config
