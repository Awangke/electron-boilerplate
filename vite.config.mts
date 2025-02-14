import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import electron from "vite-plugin-electron";
import electronRenderer from "vite-plugin-electron-renderer";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    vue(),
    electron([
      {
        entry: "electron/main/index.ts", // 入口文件
        onstart(options) {
          options.startup();
        },
        vite: {
          build: {
            outDir: "dist-electron/main",
          },
        },
      },
      {
        entry: "electron/preload/index.ts",
        onstart(options) {
          options.reload();
        },
        vite: {
          build: {
            outDir: "dist-electron/preload",
          },
        },
      },
    ]),
    electronRenderer(),
  ],
});
