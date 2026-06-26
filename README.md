# Spark ✨

[![CI](https://github.com/y-ming-sketch/get_spark/actions/workflows/ci.yml/badge.svg)](https://github.com/y-ming-sketch/get_spark/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-spark.svg?color=8C1515)](./LICENSE)
[![Version](https://img.shields.io/badge/version-0.2.1-FAF9F5.svg?color=8C1515)](./CHANGELOG.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-8C1515.svg)](./CONTRIBUTING.md)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fy-ming-sketch%2Fget_spark)

> Your AI for code, trends, and everything in between.

Spark is a **local-first** AI chat app powered by the **DeepSeek API**.
Bring your own key, run it on any platform, and your data never leaves
your device.

- 💻 **Coding** — write, review, debug, and explain code
- 📈 **SEO & content trends** — what's ranking and rising
- 👗 **Lifestyle & fashion** — trends by region and city

The UI is inspired by Claude (warm cream backgrounds, generous typography)
and branded with **Stanford Cardinal Red** (`#8C1515`).

**One codebase. Five platforms.** Spark runs as a web app, installs as a
PWA on phones and laptops, and ships as a native desktop app via Tauri.

---

## 🔑 Privacy promise

- We do not collect, store, or transmit your prompts.
- We do not see your API key. Ever.
- We do not embed analytics, trackers, or third-party scripts.
- Chat history lives only on your device. Clear it anytime.
- Source is open. Verify the claims above in our repo.

The DeepSeek key you paste in **Settings → API key** is encrypted with
WebCrypto AES-GCM and stored locally:

- **Web / PWA / Chrome ext** → encrypted `localStorage`
- **Tauri desktop** → app data directory (OS-restricted); future PRs swap
  this for the OS keychain
- **Capacitor mobile** → `Preferences` API with biometric unlock (Phase 5)
- **VS Code extension** → `SecretStorage` (Phase 7)

---

## ✨ Features

- **BYOK** — bring your own DeepSeek key; encrypted on this device
- Real-time **streaming responses** (Server-Sent Events)
- Multi-conversation sidebar with **rename, delete, auto-titles**
- **Persistent history** via Zustand + `localStorage`
- **Markdown rendering** with syntax-highlighted code blocks
- **Copy** message and **Copy** code buttons
- **Regenerate** last response, **Stop** generation mid-stream
- **Model picker** — `deepseek-chat` (fast) or `deepseek-reasoner` (R1)
- **Light / Dark / System** theme with no flash on load
- **Mobile-friendly** with collapsible sidebar and safe-area handling
- **PWA install** — add to home screen on any device
- **Native desktop** — Tauri 2 shell for Windows, macOS, Linux
- **Standalone desktop builds** — no server required, calls DeepSeek directly from Rust
- Fully **type-safe** TypeScript, no `any`

---

## 🚀 Quick start (web)

### 1. Install

```bash
npm install
```

### 2. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On first launch
you'll see a Welcome screen — click **Add your API key**, paste your
DeepSeek key, and you're chatting.

> No `.env` file required. Spark is BYOK by default.

### Optional: server-side key (legacy / shared deployment)

If you're hosting Spark for a team and don't want every user to paste a
key, you can still drop a `DEEPSEEK_API_KEY` in `.env.local`:

```bash
cp .env.example .env.local
# then edit .env.local
```

When the server has a key, `/api/chat` falls back to it for users who
haven't entered their own.

Get a key at [platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys).

---

## 📱 Install as a PWA

Once Spark is running on a public URL (or `localhost`):

- **Chrome / Edge (desktop)** → install icon in the address bar
- **Safari (iOS)** → Share → "Add to Home Screen"
- **Chrome (Android)** → menu → "Install app"

The service worker pre-caches the app shell for instant cold starts and
offline-readable history.

---

## 💻 Run as a native desktop app (Tauri)

Tauri wraps Spark in a tiny Rust-based native shell — about **5 MB
installed** vs Electron's ~150 MB. As of v0.2, the production Tauri
build is fully **standalone**: it calls DeepSeek directly from Rust,
so no Node.js or server is required at runtime.

### Prerequisites (one-time)

1. **Rust** — install via [rustup.rs](https://rustup.rs)
2. **Platform tools** — follow the
   [Tauri prerequisites guide](https://tauri.app/start/prerequisites/)
   (WebView2 on Windows, Xcode CLT on macOS, `webkit2gtk` on Linux)

### Dev mode

```bash
npm run tauri:dev
```

This boots the Next.js dev server, launches a native Spark window, and
points it at the dev server. Hot reload works as in the browser.

### Production build (standalone)

```bash
npm run tauri:build
```

Produces installers in `src-tauri/target/release/bundle/`:

- macOS → `.dmg` and `.app`
- Windows → `.msi` and `.exe`
- Linux → `.AppImage`, `.deb`, `.rpm`

The bundled app launches with no Node, no localhost, no `.env`. On first
run it shows the Welcome screen; the user pastes their DeepSeek key into
Settings → API key, and the app talks straight to `api.deepseek.com` via
a Rust `chat_stream` command.

---

## 🎨 Regenerate icons

All PWA + Tauri icons are produced from a single source by
[`scripts/generate-icons.py`](./scripts/generate-icons.py):

```bash
pip install Pillow
npm run icons
```

This writes the full set into `public/icons/` and `src-tauri/icons/`.

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
| PWA | Web manifest + service worker (no extra deps) |
| Crypto | WebCrypto AES-GCM + PBKDF2 |
| AI Provider | DeepSeek (`deepseek-chat`, `deepseek-reasoner`) |

---

## 📁 Project structure

```
get_spark/
├── .kiro/
│   └── steering/                # Vision, system design, security, roadmap
├── app/
│   ├── api/chat/route.ts        # BYOK-aware streaming proxy (Edge)
│   ├── globals.css              # Tailwind + CSS variables + safe-area
│   ├── layout.tsx               # Metadata, anti-flash script, PWA wiring
│   └── page.tsx                 # Hosts SettingsModal + KeystoreBootstrap
├── components/
│   ├── chat/                    # ChatSidebar, ChatWindow, MessageBubble, …
│   ├── settings/                # SettingsModal, ApiKeyPanel, AboutPanel
│   ├── ui/Modal.tsx             # Generic modal primitive
│   ├── KeystoreBootstrap.tsx    # Reconciles keystore with hasApiKey on hydration
│   ├── PWAInstaller.tsx
│   ├── SparkLogo.tsx
│   ├── ThemeProvider.tsx
│   ├── ThemeToggle.tsx
│   └── Welcome.tsx              # First-launch onboarding
├── lib/
│   ├── chatClient.ts            # Runtime-aware streamChat() — web vs Tauri
│   ├── keystore.ts              # WebCrypto AES-GCM encrypted local storage
│   ├── store.ts                 # Zustand store + persistence
│   ├── stream.ts                # SSE async-generator parser
│   ├── types.ts                 # Shared types + SYSTEM_PROMPT + MODELS
│   ├── utils.ts
│   └── version.ts               # APP_NAME + APP_VERSION
├── public/
│   ├── manifest.json            # PWA manifest
│   ├── sw.js                    # Service worker
│   ├── favicon.svg
│   └── icons/                   # PWA icon set
├── scripts/
│   └── generate-icons.py        # One source → all icons (PWA + Tauri)
├── src-tauri/
│   ├── Cargo.toml               # Tauri 2 + reqwest + tokio + futures-util
│   ├── build.rs
│   ├── tauri.conf.json
│   ├── capabilities/default.json
│   ├── icons/                   # Native icon set (PNG + ICO + ICNS)
│   └── src/
│       ├── main.rs              # Binary entry — calls into the lib
│       └── lib.rs               # chat_stream + chat_stream_abort commands
├── .env.example
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🎨 Brand tokens

| Token | Value | Usage |
|---|---|---|
| `spark-500` | `#8C1515` | Primary (buttons, user bubbles, accent) |
| `spark-600` | `#7A1212` | Primary hover |
| `cream-50` | `#FAF9F5` | Page background (light) |
| `cream-100` | `#F5F1E8` | Panel background, assistant bubbles |
| `ink-700` / `800` | dark grays | Dark-mode backgrounds |

The logo is a 4-point star symbolising **"a spark of insight."**

---

## 🚢 Deploy (web / PWA)

### One-click (recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fy-ming-sketch%2Fget_spark)

Vercel will pull the repo, run `next build`, and host it. No env vars are
required for the BYOK flow — users paste their key in Settings on first
launch. Optional: set `NEXT_PUBLIC_SITE_URL` to your custom domain so
OpenGraph and Twitter cards point at the right place.

### Self-host

Any platform that supports Next.js 14 Edge runtime works (Cloudflare
Pages, Netlify, AWS Amplify, Fly.io, your own VPS). Build with
`npm run build` and serve with `npm run start`.

### Native installers

Tag a release as `v0.2.1` (or higher) and the
[`release` workflow](./.github/workflows/release.yml) auto-builds signed
installers for macOS (universal), Windows (x86_64), and Linux (x86_64)
via `tauri-apps/tauri-action` and attaches them to a GitHub Release.
Signing secrets (`APPLE_*`, `WINDOWS_CERTIFICATE_*`) are optional but
recommended.

---

## 🛣️ Launch playbook

See [LAUNCH.md](./LAUNCH.md) for the full Product Hunt + Show HN launch
checklist, asset specs, and post-launch triage plan.

## 🛣️ Roadmap

See [`.kiro/steering/05-roadmap.md`](./.kiro/steering/05-roadmap.md) for
the full plan. Short version:

- [x] **v0.1** — Web chat, streaming, markdown, history
- [x] **v0.15** — PWA install + Tauri dev shell
- [x] **v0.2** — BYOK + Standalone Desktop *(this release)*
- [ ] **v0.3** — i18n (12 languages) + Settings panel polish
- [ ] **v0.4** — Voice input/output + File drop
- [ ] **v0.5** — Chrome MV3 extension
- [ ] **v0.6** — Capacitor (iOS + Android)
- [ ] **v0.7** — GitHub repo connect
- [ ] **v0.8** — VS Code extension
- [ ] **v1.0** — Polish, store submissions, Product Hunt

---

## 🛠️ Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run `tsc --noEmit` |
| `npm run icons` | Regenerate PWA + Tauri icons |
| `npm run tauri:dev` | Run Spark as a native desktop window |
| `npm run tauri:build` | Bundle standalone native installers |

---

## 📜 License

MIT — see [LICENSE](./LICENSE).

Built with care. ✨
