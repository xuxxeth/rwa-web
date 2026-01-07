import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import viteCompression from 'vite-plugin-compression'
import svgr from 'vite-plugin-svgr'
import { viteMockServe } from 'vite-plugin-mock'
// import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'


// https://vite.dev/config/
// @ts-ignore
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  // 图片压缩开关：设置为 false 可关闭压缩
  // const enableImageCompression = true

  return {
    plugins: [
      react(),
      tailwindcss(),
      viteCompression(),
      // enableImageCompression &&
      //   ViteImageOptimizer({
      //     // 1. 确保处理 public 目录下的文件
      //     includePublic: true,
      //     png: {
      //       // 质量 80：Sharp 的默认推荐值通常在 80 左右。
      //       // 对于 2x 图，80 的质量肉眼几乎看不出区别，但体积能减半。
      //       quality: 80,
      //       // 压缩等级 (0-9)：
      //       // 8 是一个折衷点，构建速度稍快，体积和 9 差别不大。
      //       compressionLevel: 8,
      //       // 启用调色板 (Palette Quantization)：
      //       // 这是减小 PNG 体积最有效的手段！
      //       // 它将真彩色（24位/32位）转换为索引颜色（8位）。
      //       // 类似于 TinyPNG 的核心原理。如果不开启这个，PNG 压缩效果会很差。
      //       palette: true,
      //     },
      //     jpeg: {
      //       quality: 80,
      //     },
      //     jpg: {
      //       quality: 80,
      //     },
      //     webp: {
      //       lossless: true,
      //     },
      //     svg: {
      //       multipass: true,
      //       plugins: [
      //         {
      //           name: 'preset-default',
      //           params: {
      //             overrides: {
      //               cleanupNumericValues: false,
      //               removeViewBox: false,
      //             },
      //             cleanupIDs: {
      //               minify: false,
      //               remove: false,
      //             },
      //             convertPathData: false,
      //           },
      //         },
      //         // 对属性排序，让 Gzip 压缩更高效（相同的属性排在一起）
      //         'sortAttrs',
      //         // 确保 SVG 有标准的 XML 命名空间，防止某些浏览器兼容性问题
      //         {
      //           name: 'addAttributesToSVGElement',
      //           params: {
      //             attributes: [{ xmlns: 'http://www.w3.org/2000/svg' }],
      //           },
      //         },
      //       ],
      //     },
      //   }),
      svgr(),
      viteMockServe({
        mockPath: 'src/mocks',
        enable: process.env.NODE_ENV === 'development',
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    
    build: {
      assetsDir: 'static',
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            'ca-common': ['ca-common-web'],
            'vendor-chart': ['@/lib/charting_library', 'recharts'], // TradingView 单独拆出来
            'vendor-utils': [ 'axios', 'reconnecting-websocket', 'zustand', 'date-fns', 'react-day-picker']
          },
        },
      },
      minify: 'terser', // 使用terser压缩
      terserOptions: {
        compress: {
          drop_console: mode === 'test' ? false : true, // 移除 console.log
          drop_debugger: mode === 'test' ? false : true, // 移除 debugger
        },
      },
    },
    server: {
      proxy: {
        '/v1': {
          target: env.VITE_API_BASE,
          changeOrigin: true,
        },
      },
    },
  }
})
