import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "node:path";

/**
 * Vite build for the Spark Chrome extension.
 *
 * Produces a static bundle under /dist with three entry points:
 *   sidepanel.html  → the full chat in the browser side panel
 *   background.js   → MV3 service worker (context menu + side-panel open)
 *   content.js      → content script that captures selected text
 *
 * Source modules import from the parent project via the `@` alias so the
 * Chrome surface shares /components and /lib with the Next.js web app —
 * no duplicated business logic.
 */
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: "manifest.json", dest: "." },
        { src: "icons/*", dest: "icons" },
        { src: "_locales/*", dest: "_locales" },
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, ".."),
    },
  },
  publicDir: false,
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    target: "chrome110",
    rollupOptions: {
      input: {
        sidepanel: path.resolve(__dirname, "src/sidepanel.html"),
        background: path.resolve(__dirname, "src/background.ts"),
        content: path.resolve(__dirname, "src/content.ts"),
      },
      output: {
        entryFileNames: (chunk) => {
          // background and content must be at the root with predictable names
          // so the manifest can reference them.
          if (chunk.name === "background") return "background.js";
          if (chunk.name === "content") return "content.js";
          return "assets/[name]-[hash].js";
        },
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
});
