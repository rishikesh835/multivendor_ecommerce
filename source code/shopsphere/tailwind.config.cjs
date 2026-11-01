/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "primary-color": "#00927c",
        "secondary-color": "#2ecc71",
      },
    },
  },
  plugins: [],
};
