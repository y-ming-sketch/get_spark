---
inclusion: always
---

# Roadmap — Phase Specs

Each phase ships as a focused PR. Acceptance criteria are non-negotiable.

> **Status: v1.0 complete (2026-06-26).** All seven phases below are
> merged into `main`. Post-1.0 ideas live at the bottom.

---

## Phase 1 — BYOK + Standalone Desktop  (v0.2) ✅

**Status:** shipped in PR #4.

Tauri builds are 100% self-contained — the user pastes their DeepSeek
key once, it's encrypted on their machine, and the desktop app calls
DeepSeek directly via a Rust streaming command (`chat_stream` +
`chat_stream_abort`).

---

## Phase 2 — i18n + Settings Panel  (v0.3) ✅

**Status:** shipped in PR #6.

- `next-intl` integration; cookie + Accept-Language locale resolution
- 12 launch locales (`en, es, fr, de, ja, zh, ko, pt, ru, ar, hi, id`)
- Deep-merge English fallback so missing keys never crash
- RTL layout for Arabic
- AI replies in the user's UI language by default
- Three new settings tabs: Language, Model (with temperature), Prompt

---

## Phase 3 — Voice + File Drop  (v0.4) ✅

**Status:** shipped in PR #7.

- `VoiceButton` push-to-talk via Web Speech API, locale-aware
- `SpeakButton` per-message TTS + global Auto-speak toggle
- File / folder drag-and-drop with 1 MB-per-file cap, binary detection,
  recursive walk via `webkitGetAsEntry`
- Settings → Voice tab

---

## Phase 4 — Chrome MV3 Extension  (v0.5) ✅

**Status:** shipped in PR #8.

- `extension-chrome/` Vite build → side panel + popup + context menu
- "Ask Spark about \"…\"" right-click action
- Reuses `/components` and `/lib` via `@/*` alias — zero duplication
- `streamChatDirect` runtime branch for serverless DeepSeek calls

---

## Phase 5 — Capacitor iOS + Android  (v0.6) ✅

**Status:** shipped in PR #9.

- `mobile-shell/` Vite build that Capacitor wraps for native projects
- `capacitor.config.ts` with splash screen, keyboard resize, status-bar sync
- Native share sheet wrapper (`@capacitor/share` + `navigator.share` fallback)
- Same direct-fetch DeepSeek path as the extension

---

## Phase 6 — GitHub Repo Connect  (v0.7) ✅

**Status:** shipped in PR #10.

- `lib/github.ts` — PAT-based REST client (no Octokit dep)
- Token stored in the encrypted keystore (`SECRET_KEYS.GITHUB_PAT`)
- `RepoConnectModal` + `RepoContextChip` + Settings → Connections tab
- `summarizeTree()` produces a compact workspace summary that's appended
  to the system prompt for every chat turn

---

## Phase 7 — VS Code Extension  (v0.8) ✅

**Status:** shipped in PR #11.

- `extension-vscode/` with a `WebviewViewProvider` hosting the React core
- Strict CSP allows only `api.deepseek.com` + `api.github.com`
- `workspaceBridge` exposes `getActiveFile`, `getSelection`,
  `listOpenFiles`, `readWorkspaceFile`
- Editor context-menu and command-palette commands
- Theme follows VS Code via MutationObserver on body class

---

## v1.0 — Polish + Launch  ✅

**Status:** shipped in PR #12.

- Version bumped to `1.0.0` across all manifests
- CHANGELOG entry summarizing every phase
- README rewritten with the full surface matrix and per-surface install steps
- Roadmap (this file) updated to reflect completion

---

## Post-1.0 ideas

These are not committed deliverables but capture the natural follow-ups
discovered while shipping v1.0.

- **Function calling** — DeepSeek tool calls so the assistant can request
  `getFile(path)` on demand from a connected repo instead of relying on
  the system-prompt tree summary alone.
- **VS Code SecretStorage** — migrate the API key off the webview's
  localStorage into the host's OS-protected store.
- **Tauri OS keychain** — same migration for the desktop app.
- **More locales** — community translations beyond the launch 12.
- **Code-block actions** — "apply this diff" / "open in editor" in the
  VS Code surface.
- **Multi-provider BYOK** — swap DeepSeek for OpenAI / Anthropic /
  Mistral using the same Settings flow.
- **Backups** — encrypted export of chat history to a user-chosen file.
