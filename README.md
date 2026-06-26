# Spark ✨

> Your AI for code, trends, and everything in between.

Spark is a production-ready AI chat application powered by the **DeepSeek API**.
It's designed to be a serious assistant for three core domains:

- 💻 **Coding** — write, review, debug, and explain code
- 📈 **SEO & content trends** — what's ranking and rising
- 👗 **Lifestyle & fashion** — trends by region and city

The UI is inspired by Claude (warm cream backgrounds, generous typography) and
branded with **Stanford Cardinal Red** (`#8C1515`).

---

## ✨ Features

- Real-time **streaming responses** (Server-Sent Events) from DeepSeek
- **Multi-conversation** sidebar with rename, delete, and auto-titles
- **Persistent history** in `localStorage` via Zustand
- **Markdown rendering** with syntax-highlighted code blocks (highlight.js)
- **Copy** message and **Copy** code buttons
- **Regenerate** last response
- **Stop** generation mid-stream
- **Model picker** — `deepseek-chat` (fast) or `deepseek-reasoner` (R1 reasoning)
- **Light / Dark / System** theme with no flash on load
- **Mobile-friendly** with collapsible sidebar
- Fully **type-safe** TypeScript, no `any`

---

## 🚀 Quick Start

### 1. Install

```bash
npm install
```

### 2. Set your DeepSeek API key

Create `.env.local` in the project root:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```env
DEEPSEEK_API_KEY=sk-your-actual-key-here
DEEPSEEK_API_URL=https://api.deepseek.com/v1
```

Get an API key at [platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys).

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — that's it.

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
| AI Provider | DeepSeek (`deepseek-chat`, `deepseek-reasoner`) |

---

## 📁 Project Structure

```
spark/
├── app/
│   ├── api/chat/route.ts     # Edge-runtime streaming proxy to DeepSeek
│   ├── globals.css           # Tailwind + CSS variables for theming
│   ├── layout.tsx            # Root layout, metadata, anti-flash script
│   └── page.tsx              # Sidebar + chat window
├── components/
│   ├── chat/
│   │   ├── ChatSidebar.tsx
│   │   ├── ChatWindow.tsx
│   │   ├── CodeBlock.tsx
│   │   ├── MarkdownRenderer.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── MessageInput.tsx
│   │   ├── ModelSelector.tsx
│   │   └── TypingIndicator.tsx
│   ├── SparkLogo.tsx         # Brand mark (4-point star)
│   ├── ThemeProvider.tsx
│   └── ThemeToggle.tsx
├── lib/
│   ├── store.ts              # Zustand store + persistence
│   ├── stream.ts             # SSE parser (async generator)
│   ├── types.ts              # Shared types + SYSTEM_PROMPT + MODELS
│   └── utils.ts              # cn(), formatRelativeTime, deriveTitle
├── public/
│   └── favicon.svg
├── .env.example
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🎨 Brand

| Token            | Value      | Usage                                 |
|------------------|------------|---------------------------------------|
| `spark-500`      | `#8C1515`  | Primary (buttons, user bubbles, accent) |
| `spark-600`      | `#7A1212`  | Primary hover                         |
| `cream-50`       | `#FAF9F5`  | Page background (light)               |
| `cream-100`      | `#F5F1E8`  | Panel background, assistant bubbles   |
| `ink-700` / `800`| dark grays | Dark-mode backgrounds                 |

The logo is a 4-point star symbolizing **"a spark of insight."**

---

## 🔒 Security

- The DeepSeek API key is **never** exposed to the browser. All requests are
  proxied through `/api/chat`, which runs on the server (Edge runtime).
- No analytics, no tracking, no third-party scripts.
- Chat history lives in your browser's `localStorage`.

---

## 🚢 Deploy

The easiest path is **Vercel**:

1. Push this repo to GitHub.
2. Import it on [vercel.com/new](https://vercel.com/new).
3. Add the `DEEPSEEK_API_KEY` environment variable.
4. Deploy.

Also runs on any platform that supports Next.js Edge runtime
(Cloudflare Pages, Netlify, AWS Amplify, etc.).

---

## 🛠️ Scripts

| Command            | Purpose                          |
|--------------------|----------------------------------|
| `npm run dev`      | Start dev server on `:3000`      |
| `npm run build`    | Production build                 |
| `npm run start`    | Serve production build           |
| `npm run lint`     | Run ESLint                       |
| `npm run type-check` | Run `tsc --noEmit`             |

---

## 📜 License

MIT — see [LICENSE](./LICENSE) (add one if you plan to publish).

Built with care. ✨
