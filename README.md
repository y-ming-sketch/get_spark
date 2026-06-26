# Spark 

> Your AI for code, trends, and everything in between.

Spark is a production-ready AI chat application powered by the **DeepSeek API**.
It's designed to be a serious assistant for three core domains:

- **Coding** — write, review, debug, and explain code
- **SEO & content trends** — what's ranking and rising
-  **Lifestyle & fashion** — trends by region and city

The UI is inspired by Claude (warm cream backgrounds, generous typography) and
branded with **Stanford Cardinal Red** (`#8C1515`).

**One codebase. Five platforms.** Spark runs as a web app, installs as a PWA on
phones and laptops, and ships as a native desktop app via Tauri.

---

## Features

- Real-time **streaming responses** (Server-Sent Events) from DeepSeek
- **Multi-conversation** sidebar with rename, delete, and auto-titles
- **Persistent history** in `localStorage` via Zustand
- **Markdown rendering** with syntax-highlighted code blocks (highlight.js)
- **Copy** message and **Copy** code buttons
- **Regenerate** last response, **Stop** generation mid-stream
- **Model picker** — `deepseek-chat` (fast) or `deepseek-reasoner` (R1)
- **Light / Dark / System** theme with no flash on load
- **Mobile-friendly** with collapsible sidebar and safe-area handling
- **PWA install** — add to home screen on any device
- **Native desktop** — Tauri shell for Windows, macOS, Linux (~5 MB installer)
- Fully **type-safe** TypeScript, no `any`

---

## 🚀 Quick Start (Web)

### 1. Install

```bash
npm install
```

### 2. Set your DeepSeek API key

```bash
cp .env.example .env.local
# then edit .env.local and paste your key
```

Get a key at [platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys).

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📱 Install as a PWA

Once Spark is running on a public URL (or `localhost` during dev):

- **Chrome / Edge (desktop):** click the install icon in the address bar
- **Safari (iOS):** Share → "Add to Home Screen"
- **Chrome (Android):** menu → "Install app"

The service worker pre-caches the app shell so cold-starts are instant and the
UI works offline (the chat itself still needs network — DeepSeek lives on the
internet).

Implementation lives in:
- [`public/manifest.json`](./public/manifest.json) — install metadata
- [`public/sw.js`](./public/sw.js) — service worker (stale-while-revalidate)
- [`components/PWAInstaller.tsx`](./components/PWAInstaller.tsx) — registers SW in production

---

## 💻 Run as a Native Desktop App (Tauri)

Tauri wraps Spark in a tiny Rust-based native shell — about **5 MB installed**
vs Electron's ~150 MB.

### Prerequisites (one time)

1. **Rust** — install via [rustup.rs](https://rustup.rs)
2. **Platform tools** — follow the
   [Tauri prerequisites guide](https://tauri.app/start/prerequisites/) for your OS
   (WebView2 on Windows, Xcode CLT on macOS, `webkit2gtk` on Linux)

### Dev

```bash
npm run tauri:dev
```

This boots the Next.js dev server, launches a native Spark window, and points
it at the dev server. Hot reload works exactly as in the browser.

### Production build

```bash
npm run tauri:build
```

> ⚠️ **Heads-up:** the current build wraps the Next.js app, which uses an Edge
> API route for the DeepSeek proxy. The standalone production installer (no
> server required) lands in the **BYOK PR** — see the roadmap below. Today's
> `tauri:build` works if you deploy the Next.js backend somewhere (e.g. Vercel)
> and point the Tauri window at that URL.

Native artifacts land in `src-tauri/target/release/bundle/`:

- macOS → `.dmg` and `.app`
- Windows → `.msi` and `.exe`
- Linux → `.AppImage`, `.deb`, `.rpm`

---

## 🎨 Regenerate Icons

All PWA + Tauri icons are produced from a single source by
[`scripts/generate-icons.py`](./scripts/generate-icons.py):

```bash
pip install Pillow
npm run icons
```

This writes the full set into `public/icons/` and `src-tauri/icons/`.

---

## 🧱 Tech Stack

| Layer       | Choice                                  |
|-------------|-----------------------------------------|
| Framework   | Next.js 14 (App Router, Edge runtime)   |
| Language    | TypeScript (strict)                     |
| Styling     | Tailwind CSS + custom CSS variables     |
| State       | Zustand (with `persist` middleware)     |
| Markdown    | react-markdown + remark-gfm + highlight.js |
| Icons       | lucide-react                            |
| Desktop     | Tauri 2 (Rust)                          |
| PWA         | Web manifest + service worker (no extra deps) |
| AI Provider | DeepSeek (`deepseek-chat`, `deepseek-reasoner`) |

---

## 📁 Project Structure

```
get_spark/
├── app/
│   ├── api/chat/route.ts     # Edge-runtime DeepSeek streaming proxy
│   ├── globals.css           # Tailwind + CSS variables + safe-area
│   ├── layout.tsx            # Root layout, metadata, anti-flash script, PWA wiring
│   └── page.tsx              # Sidebar + chat window
├── components/
│   ├── chat/                 # ChatSidebar, ChatWindow, MessageBubble,
│   │                         # MessageInput, MarkdownRenderer, CodeBlock,
│   │                         # ModelSelector, TypingIndicator
│   ├── PWAInstaller.tsx      # Service-worker registration
│   ├── SparkLogo.tsx         # Brand mark (4-point star)
│   ├── ThemeProvider.tsx
│   └── ThemeToggle.tsx
├── lib/
│   ├── chatClient.ts         # Runtime-aware streaming adapter (web today, Tauri next)
│   ├── store.ts              # Zustand store + persistence
│   ├── stream.ts             # SSE async-generator parser
│   ├── types.ts              # Shared types + SYSTEM_PROMPT + MODELS
│   └── utils.ts              # cn(), formatRelativeTime, deriveTitle
├── public/
│   ├── manifest.json         # PWA manifest
│   ├── sw.js                 # Service worker
│   ├── favicon.svg
│   └── icons/                # PWA icon set (192/384/512/maskable/apple-touch/favicons)
├── scripts/
│   └── generate-icons.py     # One source -> all icons (PWA + Tauri)
├── src-tauri/
│   ├── Cargo.toml            # Rust deps + release profile tuned for size
│   ├── build.rs              # Tauri build glue
│   ├── tauri.conf.json       # Window, bundle, identifier
│   ├── capabilities/
│   │   └── default.json      # Tauri 2 ACL for the main window
│   ├── icons/                # Native icon set (PNG + ICO + ICNS)
│   └── src/
│       ├── main.rs           # Binary entry — calls into the lib
│       └── lib.rs            # Tauri::Builder; BYOK chat_stream command lands here
├── .env.example
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🎨 Brand Tokens

| Token            | Value      | Usage                                 |
|------------------|------------|---------------------------------------|
| `spark-500`      | `#8C1515`  | Primary (buttons, user bubbles, accent) |
| `spark-600`      | `#7A1212`  | Primary hover                         |
| `cream-50`       | `#FAF9F5`  | Page background (light)               |
| `cream-100`      | `#F5F1E8`  | Panel background, assistant bubbles   |
| `ink-700` / `800`| dark grays | Dark-mode backgrounds                 |

The logo is a 4-point star symbolising **"a spark of insight."**

---

## 🔒 Security

- The DeepSeek API key is **never** exposed to the browser. All requests are
  proxied through `/api/chat`, which runs on the server (Edge runtime).
- No analytics, no tracking, no third-party scripts.
- Chat history lives in your browser's `localStorage`.
- The service worker never caches `/api/*` responses.

---

## 🚢 Deploy (Web / PWA)

Easiest path is **Vercel**:

1. Push to GitHub.
2. Import on [vercel.com/new](https://vercel.com/new).
3. Add the `DEEPSEEK_API_KEY` environment variable.
4. Deploy.

Once live, the PWA installs from any device that visits the URL.

---

## 🛣️ Roadmap

- [x] **Web** — full chat UX, streaming, markdown, history
- [x] **PWA** — manifest, service worker, install prompts, safe-area
- [x] **Desktop (Tauri) — dev mode** — `npm run tauri:dev` opens a native window
- [ ] **BYOK + Standalone Desktop** — store the user's DeepSeek key locally,
      move the API call into a Rust `chat_stream` command so production Tauri
      installers ship as fully self-contained 5 MB apps with no server required
- [ ] **Capacitor (iOS / Android)** — wrap the same web bundle for the app
      stores; reuse the BYOK key store from desktop
- [ ] **In-app settings panel** — key management, model defaults, temperature

---

## 🛠️ Scripts

| Command            | Purpose                          |
|--------------------|----------------------------------|
| `npm run dev`      | Start Next.js dev server         |
| `npm run build`    | Production build                 |
| `npm run start`    | Serve production build           |
| `npm run lint`     | Run ESLint                       |
| `npm run type-check` | Run `tsc --noEmit`             |
| `npm run icons`    | Regenerate PWA + Tauri icons     |
| `npm run tauri:dev`   | Run Spark as a native desktop window |
| `npm run tauri:build` | Bundle native installers          |

---

## 📜 License

MIT — see [LICENSE](./LICENSE).

Built with care. ✨
