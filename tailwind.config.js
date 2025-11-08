/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,js,jsx,html}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--primary-400)",
          400: "var(--primary-400)",
          500: "var(--primary-500)",
          600: "var(--primary-600)",
        },
        secondary: {
          DEFAULT: "var(--secondary-400)",
          400: "var(--secondary-400)",
          500: "var(--secondary-500)",
          600: "var(--secondary-600)",
        },
        accent: {
          DEFAULT: "var(--accent-400)",
          400: "var(--accent-400)",
          500: "var(--accent-500)",
          600: "var(--accent-600)",
        },
        card: {
          DEFAULT: "var(--card-400)",
          400: "var(--card-400)",
          500: "var(--card-500)",
          600: "var(--card-600)",
        },
      },
    },
  },
  plugins: [
    function ({ addBase, theme }) {
      addBase({
        "*": {
          borderColor: theme("colors.primary.500"),
          ringColor: theme("colors.primary.500"),
        },
        "input, select, textarea": {
          borderColor: theme("colors.primary.500"),
        },
        "input[type='checkbox'], input[type='radio']": {
          accentColor: theme("colors.primary.500"),
        },
      });
    },
  ],
}
