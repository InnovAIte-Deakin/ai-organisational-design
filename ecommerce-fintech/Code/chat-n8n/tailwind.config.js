/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#001F3F",
        cyan: "#00FFFF",
        bgDeep: "#001A36",
        card: "#021F3D",
        border: "#0A335C",
      },
    },
  },
  plugins: [],
};
