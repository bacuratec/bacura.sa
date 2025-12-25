/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        bgSlide: "linear-gradient(309deg, #F4BE2C -26.98%, #F8EDDF 268.72%)",
        bgside: "linear-gradient(180deg, #A399E6, #DF7F6E)",
      },
      boxShadow: {
        custom: "0px 20px 25px 0px rgba(210, 210, 210, 0.16)",
        btn: "0px 15px 12.5px 0px rgba(64, 64, 64, 0.11)",
        btnsb: "15px 15px 25px 0px rgba(112, 66, 220, 0.17)",
        shadowBtn: "-10px 25px 12.5px 0px rgba(64, 64, 64, 0.11)",
        shadowOrder: "0px 15px 12.5px 0px rgba(107, 107, 107, 0.11)",
        shadowBtnTrans: "0px 15px 12.5px 0px rgba(107, 107, 107, 0.11)",
      },
      backdropBlur: {
        custom: "5px",
      },
      colors: {
        mainColor: "#F5D446",
        text_color: "#000",
        primary: "#1967AE",
        secondary: "#F3BF45",
      },
      direction: {
        rtl: "rtl",
        ltr: "ltr",
      },
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "2rem",
        xl: "5rem",
        "2xl": "5rem",
      },
    },
  },
  plugins: [require("tailwindcss-dir")()],
};
