---
inclusion: always
---

# Cross-platform Compatibility Matrix

| Surface | Minimum version | Notes |
|---|---|---|
| Web (Chrome / Edge) | 110+ | Primary dev target — Chromium engine |
| Web (Firefox) | 110+ | `SpeechRecognition` gated to Phase 3 polyfill |
| Web (Safari) | 16.4+ | Uses `webkitSpeechRecognition` |
| PWA (iOS) | 16.4+ | Safari standalone mode |
| PWA (Android) | Chrome 110+ | |
| Tauri (macOS) | 11 (Big Sur)+ | Universal binary (arm64 + x86_64) |
| Tauri (Windows) | 10 1809+ | WebView2 runtime required |
| Tauri (Linux) | `webkit2gtk` 4.1+ | AppImage + .deb + .rpm |
| Capacitor (iOS) | 14+ | |
| Capacitor (Android) | 8.0+ (API 26+) | |
| Chrome extension | MV3 (Chrome 110+, Edge 110+) | |
| VS Code extension | 1.85+ | |

## Build prerequisites

- **Node 22+** (managed via `nvm`)
- **Rust stable** (rustup)
- Platform-specific Tauri prerequisites — see <https://tauri.app/start/prerequisites/>
- **Xcode** 15+ for iOS Capacitor builds
- **Android Studio** Hedgehog+ for Android Capacitor builds
- **Python 3.11+** + Pillow for icon regeneration (`npm run icons`)

## CI requirements (when added)

- `tsc --noEmit`
- `next build`
- `cargo check --manifest-path src-tauri/Cargo.toml`
- `npm audit --audit-level=high`
