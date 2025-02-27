/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        text: "#e0e0e0",
        background: "#1c1e21",
        primary: "#00a1ff",
        secondary: "#00c298",
        accent: "#2e3033",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        mydark: {
          primary: "#00a1ff",
          secondary: "#00c298",
          accent: "#2e3033",
          neutral: "#1c1e21",
          "base-100": "#1c1e21",
          info: "#3abff8",
          success: "#36d399",
          warning: "#fbbd23",
          error: "#f87272",
        },
      },
    ],
  },
};
