/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        kawaii: ['"Nunito"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
