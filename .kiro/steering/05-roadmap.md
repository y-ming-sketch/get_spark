---
inclusion: always
---

# Roadmap — Phase Specs

Each phase ships as a focused PR. Acceptance criteria are non-negotiable.

---

## Phase 1 — BYOK + Standalone Desktop  (v0.2)

**Goal:** Tauri builds become 100% self-contained — the user pastes
their DeepSeek key once, it's encrypted on their machine, and the
desktop app calls DeepSeek directly via a Rust command.

**Deliverables**

- `lib/keystore.ts` — abstract Keystore + WebCrypto AES-GCM implementation
- `components/settings/SettingsModal.tsx`, `ApiKeyPanel.tsx`, `AboutPanel.tsx`
- `/api/chat` accepts `Authorization` header (BYOK on web)
- `src-tauri/src/lib.rs` — `chat_stream` command (reqwest streaming + event channel)
- `lib/chatClient.ts` — wire Tauri branch via `invoke` + `listen`

**Acceptance**

- First Tauri launch shows a Welcome screen prompting for the API key.
- Settings → API Key → "Test connection" hits `/models` and shows OK.
- `npm run tauri:build` produces an installer that works on a machine
  with no Node.js and only outbound HTTPS to `api.deepseek.com`.
- Web build still works with both `DEEPSEEK_API_KEY` env var and BYOK.
- Existing history survives the upgrade.

---

## Phase 2 — i18n + Settings Panel  (v0.3)

**Launch locales:** `en, es, fr, de, ja, zh, ko, pt, ru, ar, hi, id`.

**Deliverables**

- `next-intl` integration with locale routing (cookie → Accept-Language → en)
- ICU message files for all 12 locales
- RTL layout support for `ar`
- AI replies in user's UI language by default
- Settings: Language, Model defaults, Custom system prompt

**Acceptance**

- Switching UI language flips all chrome instantly (no reload).
- Sending Japanese after switching locale to `ja` → assistant replies in Japanese.
- Arabic locale mirrors layout correctly (RTL).
- All 12 message files have key parity.

---

## Phase 3 — Voice + File Drop  (v0.4)

**Deliverables**

- `VoiceButton` — Web Speech API push-to-talk, locale-aware
- `SpeakButton` — SpeechSynthesis per-message + global toggle
- File / folder drag-and-drop (1 MB per file, 10 MB per folder cap)
- Settings panel: voice prefs, push-to-talk key

**Acceptance**

- Hold space (configurable) → mic listens → release → message sent.
- Drop a folder of TS files → AI can answer "summarize this codebase".
- All voice strings respect the active locale.

---

## Phase 4 — Chrome MV3 Extension  (v0.5)

**Deliverables**

- `/extension-chrome/` with side panel, popup, "Ask Spark" context menu
- Content script captures selected text → opens side panel with quote
- Vite build pipeline outputting to `/extension-chrome/dist`
- Shares `/components` and `/lib` with the web app — zero duplication

**Acceptance**

- Load unpacked extension → side panel opens with Spark.
- Right-click selected text → "Ask Spark" → side panel with quote.
- Pasted API key carries over between web / desktop / extension under
  the same browser profile.

---

## Phase 5 — Capacitor iOS + Android  (v0.6)

**Deliverables**

- `android/` and `ios/` via `npx cap add`
- `capacitor.config.ts` — bundle id `app.getspark.mobile`
- `lib/keystore.capacitor.ts` — `@capacitor/preferences` + biometric unlock
- Virtual-keyboard-aware `MessageInput`
- Swipe-from-edge sidebar gesture
- Native share sheet for "Share answer"

**Acceptance**

- `npx cap run ios` launches Spark on simulator with working chat.
- `npx cap run android` likewise.
- History entered in mobile persists across launches.

---

## Phase 6 — GitHub Repo Connect  (v0.7)

**Deliverables**

- `lib/github.ts` — PAT-based client (token in keystore)
- `RepoConnectModal` + `RepoContextChip`
- DeepSeek function-calling tool: `getFile(path)` for lazy reads
- Settings → Connections panel

**Acceptance**

- Connect a public repo → ask "what does `main.rs` do?" → AI fetches and explains.
- Token never leaves the device except on `api.github.com` calls.

---

## Phase 7 — VS Code Extension  (v0.8)

**Deliverables**

- `/extension-vscode/` with `WebviewViewProvider` hosting the React bundle
- `workspaceBridge` exposing `getActiveFile`, `getSelection`,
  `listOpenFiles`, `readWorkspaceFile`
- Theme adapts to VS Code's light/dark setting

**Acceptance**

- Install the vsix → Spark appears in the Activity Bar.
- "Explain this function" on a selection works without leaving VS Code.

---

## v1.0 — Polish + Launch

- Bug fixes, performance pass, copy review across all 12 locales
- Code signing + notarization wired up
- Apple Developer / Google Play / Microsoft Store / Chrome Web Store /
  VS Code Marketplace submissions
- Privacy policy page that proves §5 Security claims
- Product Hunt launch with a 60-second demo video
