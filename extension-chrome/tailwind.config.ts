import baseConfig from "../tailwind.config";
import type { Config } from "tailwindcss";

/**
 * The extension extends the root Tailwind config so all brand tokens
 * (spark-*, cream-*, ink-*) and component classes stay in lockstep with
 * the web app. We only override `content` to point at the right files.
 */
const config: Config = {
  ...baseConfig,
  content: [
    "../app/**/*.{ts,tsx}",
    "../components/**/*.{ts,tsx}",
    "../lib/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx,html}",
  ],
};

export default config;
