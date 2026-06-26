# Spark ✨

[![CI](https://github.com/y-ming-sketch/get_spark/actions/workflows/ci.yml/badge.svg)](https://github.com/y-ming-sketch/get_spark/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-spark.svg?color=8C1515)](./LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-FAF9F5.svg?color=8C1515)](./CHANGELOG.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-8C1515.svg)](./CONTRIBUTING.md)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fy-ming-sketch%2Fget_spark)

> **Local-first AI that lives where you work.**
> Your key. Your files. Your repos. Your language. Every device.

Spark is a **local-first** AI chat app powered by the **DeepSeek API**.
Bring your own key, run it on any platform, and your data never leaves
your device.

- 💻 **Coding** — write, review, debug, and explain code
- 📈 **SEO & content trends** — what's ranking and rising
- 👗 **Lifestyle & fashion** — trends by region and city

---

## 🌐 Five surfaces. One brain.

| Surface | Status | How to run |
|---|---|---|
| **Web / PWA** (Next.js 14, Edge runtime) | ✅ | `npm run dev` |
| **Native desktop** (Tauri 2, macOS / Windows / Linux) | ✅ | `npm run tauri:dev` |
| **Chrome extension** (MV3 side panel + popup + context menu) | ✅ | `npm run ext:build` then load `extension-chrome/dist` |
| **iOS + Android** (Capacitor 6) | ✅ | `npm run mobile:build` then `npx cap run ios/android` |
| **VS Code extension** (Activity Bar + workspace bridge) | ✅ | `npm run vscode:build` then `code --install-extension …vsix` |

All five share `/lib` and `/components` verbatim — no business-logic
duplication. Each surface is **~100 lines** of host-specific glue around
the shared React core.

---

## 🔑 Privacy promise

- We do not collect, store, or transmit your prompts.
- We do not see your API key. Ever.
- We do not embed analytics, trackers, or third-party scripts.
- Chat history lives only on your device. Clear it anytime.
- Source is open. Verify the claims above in our repo.

The DeepSeek key you paste in **Settings → API key** is encrypted with
WebCrypto AES-GCM and stored locally on every surface. The same encrypted
store also holds your GitHub PAT when you connect a repo.

Full threat model: [`.kiro/steering/02-security.md`](./.kiro/steering/02-security.md).
Public privacy page: [`/privacy`](./app/privacy/page.tsx).

---

## ✨ Features

- **BYOK** — bring your own DeepSeek key; encrypted on this device
- **Streaming** — real-time SSE responses with cancel + regenerate
- **Markdown + syntax highlighting** for code blocks with copy buttons
- **Multi-conversation** sidebar with rename, delete, auto-titles
- **Persistent history** via Zustand + `localStorage`
- **Model picker** — `deepseek-chat` (fast) or `deepseek-reasoner` (R1)
- **Temperature slider** + **custom system prompt** in Settings
- **i18n in 12 languages** — `en, es, fr, de, ja, zh, ko, pt, ru, ar, hi, id`
  with full RTL support
- **Voice input** — push-to-talk via Web Speech API, locale-aware
- **Voice output** — per-message read-aloud + global Auto-speak toggle
- **File + folder drop** — drag files in; the assistant sees them as context
- **GitHub workspace** — connect a repo, the AI sees the file tree
- **Light / Dark / System** themes with no flash on load
- **PWA install** — Add to Home Screen from any browser
- **Standalone Tauri desktop** — Rust shell, no server, ~5 MB installer
- **VS Code editor bridge** — Ask about selection, attach active file
- Fully **type-safe** TypeScript, no `any`, no telemetry, no analytics

---

## 🚀 Quick start (web)

```bash
git clone https://github.com/y-ming-sketch/get_spark.git
cd get_spark
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On first launch
you'll see a Welcome screen — click **Add your API key**, paste your
DeepSeek key, and you're chatting.

Get a free key: [platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys).

> No `.env` required. Spark is BYOK by default. For shared deployments
> you can set `DEEPSEEK_API_KEY` in `.env.local` as a server fallback.

---

## 💻 Native desktop (Tauri)

About **5 MB installed** vs Electron's ~150 MB. As of v0.2, the production
Tauri build is **standalone** — calls DeepSeek directly from Rust, no
Node.js or server required.

### One-time setup

1. Install **Rust** via [rustup.rs](https://rustup.rs)
2. Follow the [Tauri prerequisites guide](https://tauri.app/start/prerequisites/) for your OS

### Dev + build

```bash
npm run tauri:dev          # native window pointed at the dev server
npm run tauri:build        # produces signed installers
```

Native artifacts land in `src-tauri/target/release/bundle/`: `.dmg`,
`.msi`, `.AppImage`, `.deb`, `.rpm`.

---

## 🌐 Chrome / Edge extension (MV3)

```bash
npm install
npm run ext:install
npm run ext:build
```

Open `chrome://extensions` → enable **Developer mode** → **Load unpacked**
→ pick `extension-chrome/dist`. Right-click any selection on any page →
*Ask Spark about "…"*.

---

## 📱 iOS + Android (Capacitor)

Requires Xcode 15+ for iOS and/or Android Studio Hedgehog+ for Android.

```bash
npm run mobile:install
npm run mobile:build
cd mobile-shell
npx cap add android
npx cap add ios
npx cap sync
npx cap run ios          # or android
```

---

## 🖥️ VS Code extension

```bash
npm run vscode:install
npm run vscode:build
cd extension-vscode
npx vsce package         # produces spark-vscode-1.0.0.vsix
code --install-extension spark-vscode-1.0.0.vsix
```

Spark appears in the Activity Bar. Right-click any code selection →
*Spark: Ask about selection*. Command palette → *Spark: Attach active
file*.

---

## 🎨 Regenerate icons + OG

```bash
pip install Pillow
npm run icons              # PWA + Tauri + Chrome ext icons
npm run og                 # 1200x630 OpenGraph preview
```

---

## 🧱 Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, Edge runtime) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + custom CSS variables |
| State | Zustand (with `persist` middleware) |
| Markdown | react-markdown + remark-gfm + highlight.js |
| Icons | lucide-react |
| Desktop | Tauri 2 (Rust + reqwest streaming) |
| Mobile | Capacitor 6 (iOS + Android) |
| Browser ext | Vite + MV3 |
| VS Code ext | esbuild + Vite webview |
| PWA | Web manifest + service worker |
| Crypto | WebCrypto AES-GCM + PBKDF2 |
| i18n | next-intl with 12 locales |
| AI Provider | DeepSeek (`deepseek-chat`, `deepseek-reasoner`) |

---

## 📁 Project structure

```
get_spark/
├── .kiro/steering/             # Vision, system design, security, roadmap
├── app/                        # Next.js App Router (web + PWA)
│   ├── api/chat/route.ts       # BYOK-aware streaming proxy
│   ├── privacy/page.tsx        # Public privacy page (localized)
│   ├── error.tsx               # Route error boundary
│   ├── global-error.tsx        # Last-resort error boundary
│   └── layout.tsx              # OG/Twitter/JSON-LD, NextIntlClientProvider
├── components/                 # Shared React core — used by every surface
│   ├── chat/                   # ChatSidebar, ChatWindow, MessageBubble, …
│   ├── settings/               # SettingsModal + 7 tab panels
│   ├── workspace/              # RepoContextChip
│   ├── ui/Modal.tsx
│   ├── KeystoreBootstrap.tsx
│   ├── PWAInstaller.tsx
│   ├── SparkLogo.tsx
│   ├── ThemeProvider.tsx
│   ├── ThemeToggle.tsx
│   └── Welcome.tsx
├── lib/                        # Shared business logic
│   ├── chatClient.ts           # Runtime-aware streamChat()
│   ├── github.ts               # PAT-based GitHub client
│   ├── keystore.ts             # WebCrypto AES-GCM encrypted store
│   ├── store.ts                # Zustand store
│   ├── stream.ts               # SSE async-generator parser
│   ├── fileContext.ts          # File / folder drop reader
│   ├── voice.ts                # Web Speech API wrappers
│   ├── types.ts                # Shared types + SYSTEM_PROMPT
│   ├── utils.ts
│   ├── version.ts
│   └── i18n/locales.ts         # 12 locales + RTL info
├── messages/                   # 12 JSON message bundles
├── i18n/request.ts             # Per-request locale resolver
├── public/                     # PWA manifest + service worker + icons + og-image
├── scripts/                    # Icon + OG generators
├── src-tauri/                  # Tauri 2 desktop shell (Rust)
├── extension-chrome/           # Chrome MV3 extension (Vite + React)
├── mobile-shell/               # Capacitor mobile shell (Vite + React)
├── extension-vscode/           # VS Code extension (Node + Vite webview)
├── .github/workflows/          # CI + Release workflows
├── CHANGELOG.md
├── SECURITY.md
├── CONTRIBUTING.md
└── LAUNCH.md                   # Product Hunt + Show HN playbook
```

---

## 🛣️ Roadmap

See [`.kiro/steering/05-roadmap.md`](./.kiro/steering/05-roadmap.md).

- [x] **v0.1** — Web chat, streaming, markdown, history
- [x] **v0.15** — PWA install + Tauri dev shell
- [x] **v0.2** — BYOK + Standalone Desktop
- [x] **v0.2.1** — Production launch package (CI, release, /privacy, OG)
- [x] **v0.3** — i18n (12 languages) + Settings polish
- [x] **v0.4** — Voice input/output + File drop
- [x] **v0.5** — Chrome MV3 extension
- [x] **v0.6** — Capacitor iOS + Android
- [x] **v0.7** — GitHub repo connect
- [x] **v0.8** — VS Code extension
- [x] **v1.0** — All surfaces shipped 🎉

Post-1.0 ideas: DeepSeek function calling for on-demand file reads,
VS Code SecretStorage migration, more locales, hover-driven code reviews.

---

## 🛠️ Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` | Web/PWA production build |
| `npm run lint` / `type-check` | Lint + `tsc --noEmit` |
| `npm run icons` / `og` | Regenerate icons / OG image |
| `npm run tauri:dev` / `tauri:build` | Native desktop |
| `npm run ext:install` / `ext:build` | Chrome MV3 extension |
| `npm run mobile:install` / `mobile:build` / `mobile:ios` / `mobile:android` | Capacitor mobile |
| `npm run vscode:install` / `vscode:build` / `vscode:package` | VS Code extension |

---

## 📜 License

MIT — see [LICENSE](./LICENSE).

Built with care. ✨
