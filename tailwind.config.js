/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#A000BA",
          light: "#FF9CFF",
          dark: "#5E007C",
        },
        secondary: {
          DEFAULT: "#F75E00",
          light: "#FF8735",
          dark: "#D03C00",
        },
      },
    },
  },
  plugins: [],
};

export default config;
