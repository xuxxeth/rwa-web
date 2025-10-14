import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
import viteCompression from "vite-plugin-compression";
import svgr from "vite-plugin-svgr";
import { viteMockServe } from "vite-plugin-mock";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  return {
    plugins: [
      react(),
      tailwindcss(),
      viteCompression(),
      svgr(),
      viteMockServe({
        mockPath: "src/mocks",
        enable: process.env.NODE_ENV === "development",
      }),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    build: {
      assetsDir: "static",
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom"],
            chart: ["@/lib/charting_library"], // TradingView 单独拆出来
          },
        },
      },
    },
    server: {
      proxy: {
        "/v1": {
          target: env.VITE_API_BASE,
          changeOrigin: true,
        },
      },
    },
  };
});
