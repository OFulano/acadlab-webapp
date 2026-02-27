/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9e9ff",
          500: "#2265d8",
          700: "#194daa",
          900: "#112e63"
        }
      }
    }
  },
  plugins: []
};
