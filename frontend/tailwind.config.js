/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#edfdfa",
          100: "#ccfbf1",
          500: "#0f766e",
          700: "#115e59",
          900: "#042f2e"
        }
      }
    }
  },
  plugins: []
};
