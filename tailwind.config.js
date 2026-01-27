// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // 一定要包含源码路径
  ],
  theme: {
    screens: {
      'sm': '375px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1440px',
      '2xl': '1920px',
    },
    extend: {
      screens: {
        'sm': '375px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1440px',
        '2xl': '1920px',
      },
      dropShadow: {
        "glow-green": "0 0 35px rgba(157, 255, 58, 0.5)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"], // 全局默认字体
      }
    },
  },
  plugins: [require("tw-animate-css")]
};
