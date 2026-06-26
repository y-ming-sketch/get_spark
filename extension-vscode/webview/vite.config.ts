import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

/**
 * The webview build emits two predictable filenames so SparkProvider.ts
 * can reference them directly:
 *   dist/assets/main.js
 *   dist/assets/main.css
 *
 * Source modules import from the repo root via the @/* alias so the
 * VS Code surface reuses /components and /lib verbatim with all the
 * other surfaces.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "..", ".."),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    target: "chrome110",
    rollupOptions: {
      input: path.resolve(__dirname, "src/main.tsx"),
      output: {
        entryFileNames: "assets/main.js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            return "assets/main.css";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
});
