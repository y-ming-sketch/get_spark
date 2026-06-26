---
inclusion: always
---

# Spark — Vision & Operating Rules

> **Vision:** Local-first AI that lives where you work.
> **Wedge:** Your key. Your files. Your repos. Your language. Every device.

Spark is a production-grade AI assistant that runs on every surface a user
touches — web, PWA, native desktop, mobile, Chrome extension, VS Code
extension — without an account, without telemetry, and without anyone but
the user ever seeing their API key.

---

## Current state

- **v0.1 (PR #1)** — Next.js 14 + DeepSeek streaming, Claude-inspired UI
  with Stanford Red (`#8C1515`) accent, multi-conversation sidebar,
  persistent history via Zustand, markdown + syntax-highlighted code,
  light/dark/system theme.
- **v0.15 (PR #2)** — PWA install (manifest + service worker + icon set),
  Tauri 2 desktop shell (dev mode), runtime-aware chat client adapter,
  iOS/Android safe-area handling.

## Upcoming phases

| Version | Phase | Status |
|---|---|---|
| v0.2 | BYOK + Standalone Desktop | **next** |
| v0.3 | i18n (12 languages) + Settings panel | planned |
| v0.4 | Voice input / output + File drop | planned |
| v0.5 | Chrome MV3 extension | planned |
| v0.6 | Capacitor (iOS + Android) | planned |
| v0.7 | GitHub repo connect (read-only) | planned |
| v0.8 | VS Code extension | planned |
| v1.0 | Polish + store submissions + Product Hunt | planned |

---

## Operating rules (apply to every PR)

**R1. One phase per PR.** Never bundle. Each PR targets the most recent
unmerged feature branch until #1 + #2 merge into `main`; afterwards,
target `main` directly.

**R2. Local-first.** The user's API key, history, and files never leave
their device. Zero telemetry. Zero accounts. Zero analytics.

**R3. No mocking.** Every code path runs end-to-end against real services.
If a service can't run in the sandbox, document the exact local command
the user runs and verify there.

**R4. Type-safe.** Strict TypeScript; no `any`. Before every commit:

```
npx tsc --noEmit      # passes
npx next build        # passes
cargo check           # passes when Rust touched (run from src-tauri/)
```

**R5. i18n from v0.3 onward.** Every user-facing string keyed via
next-intl. No hardcoded English in components after Phase 2.

**R6. Shared core.** Web / Desktop / Mobile / Extensions all import from
`/lib` (store, chatClient, types, keystore) and `/components/chat/*`.
Surface-specific code lives in `/src-tauri`, `/android`, `/ios`,
`/extension-chrome`, `/extension-vscode` and never duplicates business
logic.

**R7. Accessibility.** Every interactive element has an `aria-label`.
Keyboard navigation works across the entire app. Color contrast meets
WCAG AA against the cream + ink palette.

**R8. Definition of Done.** Every PR must satisfy, before merge:

- [ ] `tsc` + `next build` clean
- [ ] `cargo build` clean when Rust touched
- [ ] At least one end-to-end manual test described in the PR body
- [ ] Brand tokens respected (no off-palette colors)
- [ ] README updated for any new command or feature
- [ ] PR description lists trade-offs and any explicit "out of scope"

---

## Out of scope for v1.0 (deliberately)

- Accounts, auth, cloud sync — local-first by design
- Image generation, autonomous agents, browser-based RAG
- Paid plans — BYOK only until product-market fit
