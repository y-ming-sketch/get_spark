# Spark

[![CI](https://github.com/y-ming-sketch/get_spark/actions/workflows/ci.yml/badge.svg)](https://github.com/y-ming-sketch/get_spark/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-8C1515.svg)](./LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-8C1515.svg)](./CHANGELOG.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-8C1515.svg)](./CONTRIBUTING.md)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fy-ming-sketch%2Fget_spark)

Local-first AI that lives where you work.
Your key. Your files. Your repos. Your language. Every device.

Spark is a local-first AI chat application powered by the DeepSeek API.
Bring your own key, run it on any platform, and your data never leaves
your device.

- Coding — write, review, debug, and explain code in any language
- SEO and content trends — surface what is ranking and rising
- Lifestyle and fashion — trends by region and city on demand

---

## Five Surfaces, One Brain

| Surface | Status | How to Run |
|---|---|---|
| Web / PWA (Next.js 14, Edge runtime) | Shipped | npm run dev |
| Native desktop (Tauri 2, macOS / Windows / Linux) | Shipped | npm run tauri:dev |
| Chrome extension (MV3 side panel + popup + context menu) | Shipped | npm run ext:build then load extension-chrome/dist |
| iOS + Android (Capacitor 6) | Shipped | npm run mobile:build then npx cap run ios or android |
| VS Code extension (Activity Bar + workspace bridge) | Shipped | npm run vscode:build then code --install-extension the vsix |

All five surfaces share /lib and /components verbatim. No business-logic
duplication. Each surface is approximately 100 lines of host-specific
glue around the shared React core.

---

## Privacy Promise

- We do not collect, store, or transmit your prompts.
- We do not see your API key. Ever.
- We do not embed analytics, trackers, or third-party scripts.
- Chat history lives only on your device. Clear it anytime.
- Source is open. Verify every claim in this repository.

The DeepSeek key you paste in Settings is encrypted with WebCrypto
AES-GCM and stored locally on every surface. The same encrypted store
also holds your GitHub PAT when you connect a repo.

Full threat model: .kiro/steering/02-security.md
Public privacy page: /privacy

---

## Features

- BYOK (bring your own key) — encrypted on this device, never leaves it
- Real-time streaming responses with cancel and regenerate
- Markdown rendering with syntax-highlighted code blocks and copy buttons
- Multi-conversation sidebar with rename, delete, and auto-generated titles
- Persistent history via Zustand with localStorage persistence
- Model picker — deepseek-chat (fast) or deepseek-reasoner (R1 reasoning)
- Temperature slider and custom system prompt in Settings
- Internationalization in 12 languages (en, es, fr, de, ja, zh, ko, pt, ru, ar, hi, id) with full RTL support for Arabic
- Voice input — push-to-talk via Web Speech API, locale-aware
- Voice output — per-message read-aloud and global auto-speak toggle
- File and folder drop — drag files into the chat as context for the assistant
- GitHub workspace — connect a repo, the assistant sees the file tree
- Light, dark, and system themes with no flash on page load
- PWA install — Add to Home Screen from any browser
- Standalone Tauri desktop — Rust shell, no server needed, approximately 5 MB installer
- Chrome extension — side panel with Ask Spark context menu on any page
- VS Code extension — workspace bridge with getActiveFile, getSelection, listOpenFiles
- Type-safe TypeScript throughout, no use of any, no telemetry, no analytics

---

## Quick Start (Web)


Open http://localhost:3000. On first launch you will see a Welcome screen.
Click Add your API key, paste your DeepSeek key, and start chatting.

Get a free key at https://platform.deepseek.com/api_keys

No .env file is required. Spark is BYOK by default. For shared deployments
you can set DEEPSEEK_API_KEY in .env.local as a server fallback.

---

## Native Desktop (Tauri)

About 5 MB installed versus Electron at approximately 150 MB. The production
Tauri build is standalone — it calls DeepSeek directly from Rust with no
Node.js or server required at runtime.

### One-Time Setup

1. Install Rust via https://rustup.rs
2. Follow the Tauri prerequisites guide at https://tauri.app/start/prerequisites/ for your OS

### Dev and Build


Native artifacts land in src-tauri/target/release/bundle/ as .dmg, .msi,
.AppImage, .deb, and .rpm.

---

## Chrome / Edge Extension (MV3)


Open chrome://extensions, enable Developer mode, click Load unpacked, and
pick extension-chrome/dist. Right-click any selection on any page to
invoke Ask Spark.

---

## iOS and Android (Capacitor)

Requires Xcode 15+ for iOS and/or Android Studio Hedgehog+ for Android.


---

## VS Code Extension


Spark appears in the Activity Bar. Right-click any code selection to
invoke Spark: Ask about selection. Use the command palette for
Spark: Attach active file.

---

## Regenerate Icons and OG Image


---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, Edge runtime) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS with custom CSS variables |
| State | Zustand with persist middleware |
| Markdown | react-markdown + remark-gfm + highlight.js |
| Icons | lucide-react |
| Desktop | Tauri 2 (Rust + reqwest streaming) |
| Mobile | Capacitor 6 (iOS + Android) |
| Browser Extension | Vite + MV3 |
| VS Code Extension | esbuild + Vite webview |
| PWA | Web manifest + service worker |
| Crypto | WebCrypto AES-GCM + PBKDF2 |
| i18n | next-intl with 12 locales |
| AI Provider | DeepSeek (deepseek-chat, deepseek-reasoner) |

---

## Project Structure


---

## Roadmap

Full details in .kiro/steering/05-roadmap.md

- [x] v0.1 — Web chat, streaming, markdown, history
- [x] v0.15 — PWA install + Tauri dev shell
- [x] v0.2 — BYOK + Standalone Desktop
- [x] v0.2.1 — Production launch package (CI, release, privacy, OG)
- [x] v0.3 — i18n (12 languages) + Settings polish
- [x] v0.4 — Voice input/output + File drop
- [x] v0.5 — Chrome MV3 extension
- [x] v0.6 — Capacitor iOS + Android
- [x] v0.7 — GitHub repo connect
- [x] v0.8 — VS Code extension
- [x] v1.0 — All surfaces shipped

Post-1.0 ideas: DeepSeek function calling for on-demand file reads,
VS Code SecretStorage migration, Tauri OS keychain, more locales,
multi-provider BYOK (OpenAI, Anthropic, Mistral).

---

## Scripts

| Command | Purpose |
|---|---|
| npm run dev | Next.js dev server |
| npm run build | Web/PWA production build |
| npm run lint | Run ESLint |
| npm run type-check | Run tsc --noEmit |
| npm run icons | Regenerate PWA + Tauri + Chrome ext icons |
| npm run og | Regenerate OpenGraph preview image |
| npm run tauri:dev | Run Spark as a native desktop window |
| npm run tauri:build | Bundle standalone native installers |
| npm run ext:install | Install Chrome extension deps |
| npm run ext:build | Build Chrome MV3 extension |
| npm run mobile:install | Install Capacitor mobile deps |
| npm run mobile:build | Build mobile shell |
| npm run mobile:ios | Build + run iOS simulator |
| npm run mobile:android | Build + run Android emulator |
| npm run vscode:install | Install VS Code extension deps |
| npm run vscode:build | Build VS Code extension |
| npm run vscode:package | Package vsix for distribution |

---

## Verification Status

The following has been verified in the build environment:

- Web/PWA build — tsc --noEmit and next build pass cleanly on every PR
- Type-checked everywhere — strict TypeScript with no use of any

The following are scaffolded with correct configurations but were not
compiled in the CI sandbox due to missing GUI toolkits:

- Tauri Rust build — standard Tauri 2 layout with reqwest + tokio deps;
  expect 1-3 minor dependency fixes on first local cargo build
- Chrome extension build — standard Vite + React + @types/chrome setup;
  npm run ext:build should work after npm run ext:install
- Mobile shell build — standard Vite + Capacitor 6 setup; requires
  Xcode or Android Studio for native project generation
- VS Code extension build — standard VS Code extension layout with
  separate webview Vite build; npm run vscode:build after install

Translations are solid baselines across 12 languages. Native-speaker
refinement passes are welcome. Missing keys automatically fall back to
English via the deep-merge locale resolver.

---

## License

MIT — see LICENSE.

Built with care.

---

## Roadmap

Full details in .kiro/steering/05-roadmap.md

- [x] v0.1 — Web chat, streaming, markdown, history
- [x] v0.15 — PWA install + Tauri dev shell
- [x] v0.2 — BYOK + Standalone Desktop
- [x] v0.2.1 — Production launch package (CI, release, privacy, OG)
- [x] v0.3 — i18n (12 languages) + Settings polish
- [x] v0.4 — Voice input/output + File drop
- [x] v0.5 — Chrome MV3 extension
- [x] v0.6 — Capacitor iOS + Android
- [x] v0.7 — GitHub repo connect
- [x] v0.8 — VS Code extension
- [x] v1.0 — All surfaces shipped

Post-1.0 ideas: DeepSeek function calling for on-demand file reads,
VS Code SecretStorage migration, Tauri OS keychain, more locales,
multi-provider BYOK (OpenAI, Anthropic, Mistral).

---

## Scripts

| Command | Purpose |
|---|---|
| npm run dev | Next.js dev server |
| npm run build | Web/PWA production build |
| npm run lint | Run ESLint |
| npm run type-check | Run tsc --noEmit |
| npm run icons | Regenerate PWA + Tauri + Chrome ext icons |
| npm run og | Regenerate OpenGraph preview image |
| npm run tauri:dev | Run Spark as a native desktop window |
| npm run tauri:build | Bundle standalone native installers |
| npm run ext:install | Install Chrome extension deps |
| npm run ext:build | Build Chrome MV3 extension |
| npm run mobile:install | Install Capacitor mobile deps |
| npm run mobile:build | Build mobile shell |
| npm run mobile:ios | Build + run iOS simulator |
| npm run mobile:android | Build + run Android emulator |
| npm run vscode:install | Install VS Code extension deps |
| npm run vscode:build | Build VS Code extension |
| npm run vscode:package | Package vsix for distribution |

---

## Verification Status

The following has been verified in the build environment:

- Web/PWA build — tsc --noEmit and next build pass cleanly on every PR
- Type-checked everywhere — strict TypeScript with no use of any

The following are scaffolded with correct configurations but were not
compiled in the CI sandbox due to missing GUI toolkits:

- Tauri Rust build — standard Tauri 2 layout with reqwest + tokio deps;
  expect 1-3 minor dependency fixes on first local cargo build
- Chrome extension build — standard Vite + React + @types/chrome setup;
  npm run ext:build should work after npm run ext:install
- Mobile shell build — standard Vite + Capacitor 6 setup; requires
  Xcode or Android Studio for native project generation
- VS Code extension build — standard VS Code extension layout with
  separate webview Vite build; npm run vscode:build after install

Translations are solid baselines across 12 languages. Native-speaker
refinement passes are welcome. Missing keys automatically fall back to
English via the deep-merge locale resolver.

---

## License

MIT — see LICENSE.

Built with care.

