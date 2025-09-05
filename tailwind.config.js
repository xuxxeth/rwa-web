// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",  // 一定要包含源码路径
  ],
  theme: {
    extend: {
      screens: {
        sm: '375px',   // 小屏
        md: '768px',   // 中屏
        xl: '1440px',  // 超大屏
      },
    },
  },
  plugins: [],
};
