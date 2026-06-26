#!/usr/bin/env node
/**
 * After tsc compiles src/ → dist/, copy the prebuilt webview into
 * dist/webview/ so the packaged vsix contains everything.
 */
const fs = require("node:fs");
const path = require("node:path");

const SRC = path.resolve(__dirname, "..", "webview", "dist");
const DEST = path.resolve(__dirname, "..", "dist", "webview");

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`[copy-webview] source missing: ${src} — did you run 'npm run build:webview' first?`);
    return;
  }
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

copyRecursive(SRC, DEST);
console.log(`[copy-webview] copied ${SRC} -> ${DEST}`);
