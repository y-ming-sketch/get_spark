---
inclusion: always
---

# Security Model

## Threat model

| ID | Threat | Mitigation |
|---|---|---|
| T1 | Stolen device — attacker reads disk | API keys encrypted at rest with WebCrypto AES-GCM (key derived from a device-bound salt + biometric unlock where supported). |
| T2 | Malicious `npm` / `cargo` dependency | Pinned lockfiles committed; `npm audit` + `cargo audit` run in CI; minimal dependency surface; no runtime fetching of code (no `eval`, no remote imports). |
| T3 | XSS in markdown rendering | `react-markdown` with no `dangerouslySetInnerHTML`; raw HTML disabled; URLs sanitized; `rel="noopener noreferrer"` on every external link. |
| T4 | Server-side key exfiltration (web path) | `/api/chat` only proxies; never logs keys; never persists requests. BYOK keys pass through the `Authorization` header per-request and are discarded immediately. |
| T5 | Untrusted file content | File context is shown to AI but never executed; binary files are rejected; size cap 1 MB per file, 10 MB per folder import. |
| T6 | Tauri WebView abuse | Capability-scoped permissions only (no broad fs or shell); CSP enforced; remote origins blocked. |
| T7 | Chrome extension over-permission | MV3 with minimal permissions (`storage`, `sidePanel`, `activeTab`, `contextMenus`); no `host_permissions: ["<all_urls>"]`. |

## Key storage matrix

| Surface | Storage primitive | Encryption |
|---|---|---|
| Web / PWA | `localStorage` | WebCrypto AES-GCM |
| Tauri (desktop) | OS keychain via Stronghold / `keyring` crate | Native (Keychain / DPAPI) |
| Capacitor | `@capacitor/preferences` | AES + biometric gate |
| Chrome extension | `chrome.storage.local` | WebCrypto AES-GCM |
| VS Code extension | `SecretStorage` API | VS Code-managed (OS) |

## Transport

- HTTPS only, TLS 1.2+, HSTS preload-ready.
- No third-party domains contacted at runtime — no `fonts.googleapis`,
  no analytics, no telemetry.
- DeepSeek is the only external host; users can override `base_url`.

## Content Security Policy

```
default-src 'self';
connect-src 'self' https://api.deepseek.com https://api.github.com;
img-src    'self' data:;
style-src  'self' 'unsafe-inline';   /* tailwind requires inline */
script-src 'self';
object-src 'none';
frame-ancestors 'none';
base-uri   'self';
```

## Privacy guarantees (publish on the site)

- We do not collect, store, or transmit your prompts.
- We do not see your API key. Ever.
- We do not embed analytics, trackers, or third-party scripts.
- Chat history lives only on your device. Clear it anytime.
- Source is open. Verify the claims above in our repo.

## Code signing & distribution

- macOS Tauri builds — signed + notarized with an Apple Developer ID.
- Windows Tauri builds — signed with an EV cert (Sectigo / DigiCert).
- Linux — `AppImage` + sha256 + GPG-signed release notes.
- Mobile — standard store signing flows.
- Chrome extension — signed by the Chrome Web Store.
- All releases on GitHub Releases with provenance via SLSA.
