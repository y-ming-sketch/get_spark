import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

/**
 * Vite build for the Spark mobile shell.
 *
 * Produces a static SPA bundle under /dist that Capacitor wraps for iOS
 * and Android. Source modules import from the parent project via the
 * `@` alias so the mobile surface shares /components and /lib with the
 * Next.js web app and the Chrome extension — no duplicated business
 * logic.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, ".."),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    target: ["chrome110", "safari16"],
  },
  server: {
    port: 5174,
  },
});
