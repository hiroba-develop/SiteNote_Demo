/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans JP"', "sans-serif"],
      },
      colors: {
        primary: "#2E5BBA", // SiteNote メインカラー
        accent: "#FF6B35", // アクセントカラー
        sub1: "#6B7280", // サブカラー①
        sub2: "#F3F4F6", // サブカラー②
        // 既存クラスで使用している blue-* を置き換えるため、同系統の色で上書き
        blue: {
          100: "#eef3ff",
          500: "#3d6fd1",
          600: "#2E5BBA",
          700: "#24418F",
        },
        background: "#FFFFFF",
        text: "#333333",
        border: "#E0E0E0",
        success: "#4CAF50",
        warning: "#FFA726",
        info: "#2196F3",
        error: "#D32F2F",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
