import baseConfig from "../../tailwind.config";
import type { Config } from "tailwindcss";

const config: Config = {
  ...baseConfig,
  content: [
    "../../app/**/*.{ts,tsx}",
    "../../components/**/*.{ts,tsx}",
    "../../lib/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx,html}",
  ],
};

export default config;
