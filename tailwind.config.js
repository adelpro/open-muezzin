/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,js,jsx,html}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary-500)",
        "primary-400": "var(--primary-400)",
        "primary-600": "var(--primary-600)",

        secondary: "var(--secondary-500)",
        "secondary-400": "var(--secondary-400)",
        "secondary-600": "var(--secondary-600)",

        accent: "var(--accent-500)",
        "accent-400": "var(--accent-400)",
        "accent-600": "var(--accent-600)",

        card: "var(--card-500)",
        "card-400": "var(--card-400)",
        "card-600": "var(--card-600)",
      },

    },
  },
  plugins: [
    function ({ addBase, theme }) {
      addBase({
        "*": {
          borderColor: theme("colors.primary"),
        },
        "input, select, textarea": {
          borderColor: theme("colors.primary"),
        },
        "input[type='checkbox'], input[type='radio']": {
          accentColor: theme("colors.primary"),
        },
        "*": {
          ringColor: theme("colors.primary"),
        },
      });
    },
  ],
}
