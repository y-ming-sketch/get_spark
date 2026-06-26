# Changelog

All notable changes to Spark are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and Spark follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

—

---

## [1.0.0] — 2026-06-26

**Spark v1.0 ships across five surfaces with a single shared React core.**

### Added

- **Phase 2 — i18n + Settings polish** *(PR #6)*. 12 launch locales
  (`en, es, fr, de, ja, zh, ko, pt, ru, ar, hi, id`), full RTL for
  Arabic, locale-aware system prompt. Three new settings tabs:
  Language, Model (with temperature slider), and System prompt.
- **Phase 3 — Voice + File drop** *(PR #7)*. `VoiceButton` push-to-talk
  via Web Speech API, locale-aware. `SpeakButton` per-message TTS and a
  global Auto-speak toggle. Drag-and-drop for files and folders with a
  1 MB-per-file cap, binary detection, and the `attachmentsToContext`
  serializer that prepends file content to the next user message.
- **Phase 4 — Chrome MV3 extension** *(PR #8)*. Side panel hosting the
  same chat. `Ask Spark about "%s"` context menu, `chrome.storage.local`
  for the key, `streamChatDirect` for direct DeepSeek SSE (no Next.js
  server needed). Host permissions narrowed to `api.deepseek.com`.
- **Phase 5 — Capacitor iOS + Android** *(PR #9)*. `mobile-shell/`
  Vite build that Capacitor wraps. Safe-area handling, splash screen,
  keyboard resize mode, native share sheet wrapper.
- **Phase 6 — GitHub repo connect** *(PR #10)*. PAT-based GitHub client,
  Settings → Connections panel, `RepoContextChip` in the chat header,
  and a `summarizeTree()` workspace summary injected into the system
  prompt so the assistant knows the file layout.
- **Phase 7 — VS Code extension** *(PR #11)*. `WebviewViewProvider`
  hosting the same React chat. `workspaceBridge` exposes
  `getActiveFile`, `getSelection`, `listOpenFiles`,
  `readWorkspaceFile`. Editor context-menu command "Spark: Ask about
  selection" and command-palette entry "Spark: Attach active file".
  Strict CSP allows only `api.deepseek.com` + `api.github.com`.

### Architecture

- Five surfaces (Next.js web/PWA, Tauri desktop, Chrome MV3 extension,
  Capacitor iOS/Android, VS Code webview) share a single React core
  under `/components` and `/lib`. Each surface adds only its host-
  specific shell (~100 lines).
- `streamChat()` runtime dispatch:
  - **Tauri** → Rust `chat_stream` command
  - **Extension / Capacitor / VS Code** → direct DeepSeek fetch
  - **Web** → `/api/chat` proxy with optional server fallback key
- `lib/keystore.ts` is the single encrypted store for the DeepSeek key
  and the GitHub PAT. Same WebCrypto AES-GCM everywhere.
- Locale resolution is server-side for the web (cookie +
  Accept-Language) and client-side for the static surfaces, all using
  the same deep-merge fallback strategy so missing translations
  silently degrade to English.

### Documentation

- `.kiro/steering/05-roadmap.md` updated to mark all phases complete.
- README rewritten with the full surface matrix and per-surface
  install steps.

---

## [0.2.1] — 2026-06-26

### Added

- **Production launch package** — CI, release workflow, privacy page,
  error boundary, OpenGraph + Twitter cards, Vercel deploy config,
  launch checklist.
- `.github/workflows/ci.yml` — runs `tsc`, `lint`, `next build`, and
  `cargo check` on every push and pull request.
- `.github/workflows/release.yml` — on git tag `v*.*.*`, builds signed
  Tauri installers for macOS, Windows, and Linux via `tauri-action`,
  and attaches them to a GitHub Release.
- `/privacy` page that publishes the five privacy promises and lets any
  user audit the claims against the source.
- Top-level `ErrorBoundary` + `app/global-error.tsx` so a render error
  shows a recoverable UI instead of a blank screen.
- `vercel.json` for one-click deploy and `Deploy to Vercel` button
  in the README.
- `LAUNCH.md` — Product Hunt + Show HN launch checklist with asset list.
- `SECURITY.md`, `CONTRIBUTING.md`, and a CHANGELOG (this file).
- 1200×630 OpenGraph preview image + Twitter Summary Card.

### Changed

- Version bumped to `0.2.1` across `package.json`, `lib/version.ts`,
  `src-tauri/Cargo.toml`, and `src-tauri/tauri.conf.json`.
- README gains CI + license + Vercel badges.

---

## [0.2.0] — 2026-06-26  (PR #4)

### Added

- **BYOK** — bring-your-own-key, encrypted locally with WebCrypto
  AES-GCM (PBKDF2, 100k iterations, device-bound salt).
- Settings modal with tabs (API key, About) — desktop sidebar nav and
  mobile tab bar.
- Welcome screen on first launch with three highlight cards and a
  single "Add your API key" CTA.
- `KeystoreBootstrap` reconciles the persisted `hasApiKey` flag with
  the real keystore contents on hydration.
- Sidebar gear icon (both collapsed and expanded layouts).
- `/api/chat` accepts an `Authorization: Bearer` header so the web /
  PWA path is BYOK too. Falls back to `DEEPSEEK_API_KEY` env var for
  shared deployments.
- **Standalone Tauri builds** — Rust `chat_stream` command streams
  DeepSeek directly via `reqwest`, with byte-safe SSE parsing and an
  `AtomicBool` abort flag tracked in a `Mutex<HashMap>` in-flight map.
  Supports both `delta.content` and `delta.reasoning_content`
  (deepseek-reasoner).
- `chatClient.ts` detects the runtime (`isTauri()`) and bridges Tauri
  events into an `AsyncGenerator<string>` via an async queue + waiter
  promise. Honors `AbortSignal` by invoking `chat_stream_abort`.

### Security

- The API key is never logged, never persisted server-side, and only
  passed per-request to DeepSeek.
- Honest disclosure in `lib/keystore.ts` about what the WebCrypto layer
  protects against (trivial disk inspection) and what it doesn't
  (malicious same-origin scripts).

---

## [0.1.5] — 2026-06-26  (PR #2)

### Added

- **PWA** install — `public/manifest.json`, service worker
  (stale-while-revalidate for static, never caches `/api/*`),
  apple-touch-icon, full favicon set, `appleWebApp` metadata.
- **Tauri 2 desktop shell** — `src-tauri/` scaffolded with the
  lib + thin-bin pattern (ready for mobile target later).
  Release profile tuned for tiny installers (`panic=abort`, `lto`,
  `codegen-units=1`, `opt-level=s`, `strip`).
- Runtime-aware chat client adapter (`lib/chatClient.ts`).
- Safe-area inset utilities so installed PWAs respect notches.
- `scripts/generate-icons.py` — single source generates the full
  PWA + Tauri icon set (PNG sizes + Windows Store tiles + ICO + ICNS).

### Steering docs (PR #3, separate)

- `.kiro/steering/{00-vision, 01-system-design, 02-security, 03-platforms, 04-visual-language, 05-roadmap}.md`
  — every future AI session that opens the repo automatically picks
  up the vision, operating rules, and phase plan as context.

---

## [0.1.0] — 2026-06-26  (PR #1)

### Added

- Initial Spark chatbox: Next.js 14 + DeepSeek streaming chat,
  Claude-inspired UI with Stanford Cardinal Red (`#8C1515`) accent,
  multi-conversation sidebar, persistent history via Zustand,
  markdown + syntax-highlighted code blocks, light/dark/system theme.
