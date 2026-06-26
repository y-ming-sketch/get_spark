# Spark — Launch Playbook

This is the checklist for shipping **v0.2 Spark** to the world. It assumes
PRs #1 → #5 have merged into `main` and CI is green.

The thesis: **launch narrow but excellent**. Spark v0.2 is "local-first
BYOK AI chat across web, PWA, and standalone desktop." That's the wedge.
We're not waiting on i18n, voice, mobile, or extensions to put it in
front of users — those are post-launch growth.

---

## 0. Pre-flight (T-7 days)

### Verify the product

- [ ] `npm run dev` — Welcome screen → paste key → first reply streams ≤ 1 s
- [ ] PWA install on iOS Safari + Android Chrome
- [ ] `npm run tauri:dev` on macOS and Windows; both stream end-to-end
- [ ] `npm run tauri:build` produces installers; macOS installer runs on
      a clean machine with no Node, no dev tools
- [ ] All 5 privacy promises hold under devtools Network inspection
- [ ] `/privacy` page renders and is reachable from Settings → About

### Verify the docs

- [ ] README quick-start works copy-paste on a fresh clone
- [ ] CHANGELOG entry for v0.2 / v0.2.1 is accurate
- [ ] SECURITY.md report email is real (not the `security@spark.local`
      placeholder)
- [ ] Steering docs in `.kiro/steering/` are current

### Verify distribution

- [ ] Domain `get-spark.app` (or chosen) registered + pointed at Vercel
- [ ] `NEXT_PUBLIC_SITE_URL` env var set on Vercel
- [ ] Vercel deploy is live; OG image renders on
      [opengraph.xyz](https://opengraph.xyz) and the
      [Twitter Card validator](https://cards-dev.twitter.com/validator)
- [ ] GitHub repo set public, description filled, topics added:
      `ai`, `chatbot`, `deepseek`, `nextjs`, `tauri`, `local-first`,
      `byok`, `open-source`

### Optional but recommended

- [ ] Apple Developer ID code-signing cert added as GitHub secret
      (`APPLE_*`) so the macOS `.dmg` is notarized
- [ ] Windows EV cert added (`WINDOWS_CERTIFICATE_*`)
- [ ] Tag `v0.2.1` cut → release workflow attaches signed installers to
      the GitHub Release

---

## 1. Launch-day assets

### Copy

**Taglines (pick one per channel)**

- *"Local-first AI for code, trends, and everything in between."*
- *"Your key. Your files. Every device. Free forever."*
- *"The first AI chat that doesn't make you a product."*

**One-liner pitch (60 chars)**

> Local-first AI chat — your key, your data, every device.

**Product Hunt body (≤ 260 chars)**

> Spark is a local-first AI chat for coding, SEO trends, and lifestyle
> insights. Bring your own DeepSeek key — it's encrypted on your device
> and never touches our servers. Web, PWA, and standalone desktop. Free
> and open source. ✨

### Visual assets

| Asset | Spec | Source |
|---|---|---|
| App icon (Product Hunt) | 240×240 PNG | `public/icons/icon-512.png` resized |
| Gallery image 1 (hero) | 1270×760 | screenshot of empty-state with cream BG |
| Gallery image 2 | 1270×760 | live conversation, code block visible |
| Gallery image 3 | 1270×760 | Settings → API key panel |
| Gallery image 4 | 1270×760 | Tauri native window (macOS chrome) |
| OpenGraph | 1200×630 | `public/og-image.png` |
| Twitter banner | 1500×500 | derived from OG layout |
| Demo video | 60–90 s MP4 | screen recording: Welcome → paste key → ask "review this code" → answer streams → switch to dark mode |

Save final exports to `marketing/` (not committed — local-only).

### Names + URLs to grab

- [ ] `getspark` on Product Hunt
- [ ] `@get_spark` on Twitter / X
- [ ] `@get_spark` on Bluesky
- [ ] `get_spark` on Reddit
- [ ] `r/getspark` subreddit (optional)

---

## 2. Launch day timeline

Product Hunt resets at **00:01 PT**. Coordinate everything to that.

| Time (PT) | Action |
|---|---|
| T-24h | Hunter scheduled, makers invited, gallery uploaded, comments draft ready |
| 00:01 | Product Hunt goes live; share to private group of 5–10 early supporters |
| 00:30 | Reply to every PH comment within 5 minutes — be honest, link to source |
| 06:00 | Show HN post (`Show HN: Spark — local-first AI chat with BYOK`) |
| 07:00 | Twitter thread: 5 tweets, screenshots, demo gif |
| 08:00 | Reddit: r/SideProject, r/opensource, r/selfhosted |
| 10:00 | Lobste.rs + Hacker News comments engagement |
| 12:00 | Indie Hackers post |
| 14:00 | LinkedIn (only if you have an existing audience) |
| 18:00 | Mid-day metrics check; address any reported bugs in a `fix/launch-day` branch |
| 22:00 | Day-end thanks-you tweet linking to GitHub stars + first issues |

---

## 3. Channels

| Channel | Audience | Notes |
|---|---|---|
| **Product Hunt** | Indie founders + designers | Primary. Live at 00:01 PT. |
| **Show HN** | Engineers | Title: "Show HN: Spark — local-first AI chat (BYOK, MIT)" |
| **r/SideProject** | Builders | Honest framing, no growth-hack vibes |
| **r/opensource** | OSS maintainers | Lead with the privacy promises |
| **r/selfhosted** | Self-hosters | Highlight the standalone Tauri build |
| **r/LocalLLaMA** | Power users | Cross-post if BYOK supports their preferred provider |
| **Twitter / X thread** | Mixed | 5 tweets, GIF in tweet 1, screenshots in 2–4, GitHub link in 5 |
| **Hacker Newsletter** | Curated readers | Submit a week after launch when momentum is visible |
| **Console.dev** | Dev-tool newsletter readers | Submit via their tip form |
| **Indie Hackers** | Solo founders | Long-form "why I built it" post |

Skip TikTok / Instagram for v0.2 — not the right audience yet.

---

## 4. Talking points (memorize these)

Every channel will ask variations of the same 5 questions. Have crisp
answers ready.

**Why not just use ChatGPT / Claude desktop?**
Spark is BYOK. You pay only for what you use, and you can switch to any
OpenAI-compatible endpoint. No subscription, no rate limits beyond what
your provider sets, no vendor lock-in.

**Why DeepSeek as the default?**
~90% cheaper than GPT-4 for similar quality. R1 (deepseek-reasoner) is
state-of-the-art for coding tasks. And the API is OpenAI-compatible, so
swapping providers is trivial.

**Is my key actually safe?**
On web: encrypted with WebCrypto AES-GCM, derived via PBKDF2 with a
device-bound salt. On desktop: same, but the file lives in an
OS-restricted app data dir. We publish the threat model in
`.kiro/steering/02-security.md` — including what our encryption *can't*
defend against. Honest > marketing.

**Why "local-first" and not just "private"?**
"Private" is a marketing word. "Local-first" is a verifiable property:
your prompts, history, and key never reach any server we control. You
can confirm this by reading `app/api/chat/route.ts` and the Network tab.

**What's next?**
i18n in 12 languages, voice input, Chrome extension, mobile, GitHub
workspace, VS Code extension. Roadmap is public in
`.kiro/steering/05-roadmap.md`.

---

## 5. Post-launch (week 1)

- [ ] Triage every GitHub issue within 24 hours
- [ ] Ship a `fix/*` PR for any critical bug within 48 hours
- [ ] Publish a "week-1 retro" post: stars, installs, biggest feedback
- [ ] Update the roadmap in steering if reality changed the priorities
- [ ] Tag v0.2.2 with bug fixes; the release workflow auto-attaches new
      installers

---

## 6. Definition of "successful launch"

Don't anchor to vanity numbers. Spark is open source and free; viral
metrics will lie. Instead, after week 1:

- 🎯 **≥ 100 GitHub stars** (signal that engineers found it interesting)
- 🎯 **≥ 5 PRs from external contributors** (signal that the steering
       docs work and contribution is frictionless)
- 🎯 **≥ 3 real production users** posting that they switched from
       ChatGPT / Claude (signal that the wedge is real)
- 🎯 **Zero broken privacy promises** observed in the wild

If you hit those, v0.3 (i18n + Settings polish) is the right next move.
If you don't, the wedge needs sharpening before more features land.

✨
