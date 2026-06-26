# Security Policy

Spark is local-first by design. The product's biggest commitment is that
your prompts, history, and API key never leave your device. If you find
something that violates that promise — or any other security issue —
please report it privately so we can fix it before disclosure.

## Supported versions

We patch the latest `0.x` release and the previous minor. Older versions
get fixes only when the issue is critical.

| Version | Supported |
|---|---|
| 0.2.x | ✅ |
| 0.1.x | ⚠️ critical fixes only |
| < 0.1 | ❌ |

## Reporting a vulnerability

1. **Do not** open a public issue.
2. Use GitHub's
   [private vulnerability reporting](https://github.com/y-ming-sketch/get_spark/security/advisories/new)
   for this repo, or email `security@spark.local` (placeholder — update
   once a real address is in place).
3. Include:
   - A description of the issue
   - Steps to reproduce
   - The version / commit you tested against
   - Any proof-of-concept (small repro is best)

We aim to acknowledge within **72 hours** and ship a fix within
**14 days** for high-severity issues. Once a patch is released we will
credit you in the [CHANGELOG](./CHANGELOG.md) unless you ask otherwise.

## Threat model

The detailed threat model lives in
[`.kiro/steering/02-security.md`](./.kiro/steering/02-security.md).
Highlights:

| ID | Threat | Mitigation |
|---|---|---|
| T1 | Stolen device, attacker reads disk | API key encrypted at rest (WebCrypto AES-GCM, PBKDF2-derived key, device-bound salt) |
| T2 | Malicious `npm` / `cargo` dependency | Pinned lockfiles, minimal dependency surface, no runtime code fetching, `eval`-free |
| T3 | XSS via markdown rendering | `react-markdown` with no raw HTML, sanitized URLs, `rel="noopener noreferrer"` everywhere |
| T4 | Server-side key exfiltration (web path) | `/api/chat` is a stateless proxy: never logs, never persists, key passed per-request |
| T6 | Tauri WebView abuse | Capability-scoped permissions, CSP enforced, remote origins blocked |

## Out of scope

These are valid concerns but not currently in scope for a vulnerability
report:

- **Same-origin malicious scripts on web.** The WebCrypto storage layer
  defends against trivial disk inspection, not against arbitrary JS
  running in the same origin. Real protection comes from the platform
  (Tauri keychain, Capacitor biometric, VS Code SecretStorage). The
  honest disclosure is in `lib/keystore.ts`.
- **DeepSeek's infrastructure.** We forward requests; their security is
  upstream. Report issues with their API to the DeepSeek team.

Thanks for keeping Spark honest. 🙏
