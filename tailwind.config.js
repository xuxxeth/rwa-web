// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // 一定要包含源码路径
  ],
  theme: {
    extend: {
      screens: {
        sm: "375px", // 小屏
        md: "768px", // 中屏
        xl: "1440px", // 超大屏
      },
      dropShadow: {
        "glow-green": "0 0 35px rgba(157, 255, 58, 0.5)",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"], // 全局默认字体
      },
      colors: {
        stockrise: 'rgba(80,227,194,1)',
        stockfall: 'rgba(227,80,122,1)',
        stockeven: 'rgba(161,161,161,1)'
      }
    },
  },
  plugins: [require("tw-animate-css")],
  safelist: [
    'text-stockrise',
    'text-stockfall',
    'text-stockeven'
  ]
};
