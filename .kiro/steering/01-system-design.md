---
inclusion: always
---

# System Design

## High-level architecture

```
        ┌──────────────────────────────────────────────────┐
        │              SHARED REACT CORE                   │
        │  /lib (store, chatClient, keystore, types)       │
        │  /components/chat (ChatWindow, MessageBubble…)   │
        └──────────────────────┬───────────────────────────┘
                               │
     ┌─────────┬───────────────┼────────────────┬──────────────┐
     ▼         ▼               ▼                ▼              ▼
 ┌───────┐ ┌───────┐     ┌───────────┐    ┌──────────┐   ┌──────────┐
 │  Web  │ │  PWA  │     │  Tauri    │    │Capacitor │   │ Chrome / │
 │ Next  │ │  SW   │     │ Rust shell│    │ iOS/And  │   │ VS Code  │
 └───┬───┘ └───┬───┘     └─────┬─────┘    └────┬─────┘   └────┬─────┘
     │         │                │                │              │
     └─────────┴────────┬───────┴────────┬───────┴──────────────┘
                        ▼                ▼
                 ┌────────────┐   ┌─────────────────┐
                 │  Keystore  │   │  DeepSeek API   │
                 │  (per-OS   │   │  (over HTTPS,   │
                 │   secure)  │   │  user's key)    │
                 └────────────┘   └─────────────────┘
```

## Module map

```
lib/
  store.ts          Zustand store w/ persist; conversations, model, theme
  types.ts          Message, Conversation, ModelId, SYSTEM_PROMPT, MODELS
  chatClient.ts     streamChat() — runtime-aware (web vs Tauri vs ext)
  stream.ts         SSE async-generator parser
  keystore.ts       abstract Keystore interface + WebCrypto AES-GCM impl
  keystore.tauri.ts (future) OS-keychain via Rust command
  keystore.cap.ts   (future) Capacitor Preferences + biometric unlock
  fileContext.ts    read files/folders with size limit + binary detection
  github.ts         PAT-based GitHub client (lazy file fetch)
  i18n/             next-intl locale routing + 12 message files

components/
  chat/             ChatWindow, MessageBubble, MessageInput, …
  settings/         SettingsModal, ApiKeyPanel, ModelPanel, …
  workspace/        RepoConnectModal, RepoContextChip, FileDropzone
  voice/            VoiceButton, SpeakButton

surfaces/
  app/              Next.js (web + PWA)
  src-tauri/        Tauri 2 (Rust)
  android/ ios/     Capacitor
  extension-chrome/ MV3 (side panel + popup + context menu)
  extension-vscode/ VS Code webview
```

## Data flow for a chat turn

```
user types in MessageInput
  └→ ChatWindow.sendMessage()
      └→ store.addMessage(user)
      └→ store.addMessage(assistant placeholder, streaming:true)
      └→ chatClient.streamChat({ model, messages, signal })
           ├─ web / PWA: fetch /api/chat → SSE → readChatStream()
           ├─ Tauri:     invoke('chat_stream', …) → event channel
           └─ Chrome:    same as web, key from chrome.storage.local
      └→ for each chunk: store.appendToMessage(chunk)
      └→ on done: store.updateMessage(streaming:false)
```

## Streaming protocol (internal SSE contract)

The server (or Tauri Rust command) emits:

```
data: {"type":"chunk", "content":"hello"}

data: {"type":"done"}

data: {"type":"error", "message":"…"}
```

Clients tolerate malformed lines and support `AbortSignal` cancellation.

## State management rules

- Zustand store is the single source of truth for chat UI state.
- Persistence layer is swappable per surface (`localStorage` / fs / Pref).
- Never call `setState` in render; always dispatch actions on the store.
- Selectors are atomic — components subscribe to only what they read.

## Performance budgets

| Metric | Budget |
|---|---|
| Cold start (web) | < 2.0 s on slow 3G |
| First chunk-to-render | < 100 ms after API responds |
| JS bundle (route `/`) | < 250 kB First Load JS |
| Tauri installer size | < 8 MB on macOS, < 6 MB on Windows |
| Service worker precache | < 200 kB |
| Scroll performance | 60 fps with 1,000 messages (virtualize after 200) |

## Error handling

- All async paths surface user-readable errors via `store.updateMessage`.
- Network errors retry once with exponential backoff (1 s → 2 s).
- `AbortError` is silent (user clicked Stop).
- All other errors logged to console + shown inline in the bubble.

## Offline behavior

- PWA: app shell loads offline; chat input shows "You're offline".
- History remains readable while offline.
- Outbound chat queues are **not** attempted — the user stays in control.

## Update strategy

- Web/PWA: service worker checks `/sw.js` on every load; updates apply
  on next refresh; user sees a toast "New version available — reload".
- Tauri: built-in updater pointed at GitHub Releases (signed).
- Chrome / VS Code / mobile: store-managed updates.
