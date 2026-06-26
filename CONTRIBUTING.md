# Contributing to Spark

Thanks for your interest in Spark! This guide gets you productive in
about 10 minutes.

## TL;DR

```bash
git clone https://github.com/y-ming-sketch/get_spark.git
cd get_spark
npm install
npm run dev               # web/PWA
# OR
npm run tauri:dev         # native desktop
```

Then paste your DeepSeek key into Settings → API key.

## What lives where

This repo's source of truth for direction is `.kiro/steering/`:

- [`00-vision.md`](./.kiro/steering/00-vision.md) — the wedge, ICP, operating rules
- [`01-system-design.md`](./.kiro/steering/01-system-design.md) — architecture, perf budgets, error handling
- [`02-security.md`](./.kiro/steering/02-security.md) — threat model + key storage matrix
- [`03-platforms.md`](./.kiro/steering/03-platforms.md) — minimum versions across surfaces
- [`04-visual-language.md`](./.kiro/steering/04-visual-language.md) — palette, type, motion, tone
- [`05-roadmap.md`](./.kiro/steering/05-roadmap.md) — phase-by-phase deliverables

**Read those first.** Every PR is reviewed against them.

## Workflow

1. **Open an issue** describing what you want to change before writing
   code, unless it's tiny (typo, doc fix).
2. **One phase per PR.** The roadmap is sliced for a reason — keep diffs
   reviewable. If your change touches more than one phase, split it.
3. **Branch from the latest unmerged feature branch** until #1–#4 land
   on `main`; afterwards, target `main`.
4. **Definition of Done** for every PR:
   - [ ] `npx tsc --noEmit` passes
   - [ ] `npx next build` passes
   - [ ] `cargo check --manifest-path src-tauri/Cargo.toml` passes when Rust touched
   - [ ] At least one end-to-end manual test in the PR description
   - [ ] Brand tokens respected (no off-palette colors)
   - [ ] README + CHANGELOG updated for any new command or feature
   - [ ] Trade-offs and explicit "out of scope" listed in the PR body

## Code style

- **TypeScript strict mode.** No `any`. No `@ts-ignore` without a comment.
- **No mocking.** Every code path runs end-to-end against real services.
- **i18n from v0.3 onward.** Every user-facing string keyed via
  `next-intl`. No hardcoded English in components after Phase 2.
- **Accessibility.** Every interactive element has an `aria-label`.
  Keyboard navigation works. WCAG AA contrast.
- **Shared core.** Web / Desktop / Mobile / Extensions all import from
  `/lib` and `/components/chat/*`. Surface-specific code lives in
  `/src-tauri`, `/android`, `/ios`, `/extension-*`. Never duplicate
  business logic.

## Privacy is non-negotiable

Spark publishes five privacy promises (see `/privacy` and
`.kiro/steering/02-security.md`). **No telemetry, no analytics, no
third-party scripts, no accounts, no cloud sync.** PRs that add any of
those will be closed.

If you want to add observability for yourself, do it client-side and
opt-in via Settings.

## Reporting bugs

Open a GitHub issue with:

- Spark version (from Settings → About)
- Platform (web / Tauri / which OS)
- Steps to reproduce
- Expected vs actual behavior
- Browser console / Rust panic output if any

## Reporting security issues

**Don't open a public issue.** See [SECURITY.md](./SECURITY.md).

## License

By contributing you agree your code is licensed under the same
[MIT License](./LICENSE) that covers the rest of the repo.

Welcome aboard. ✨
