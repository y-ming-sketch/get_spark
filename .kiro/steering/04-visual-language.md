---
inclusion: always
---

# Visual Language (Claude-inspired, Spark-owned)

## Palette

| Token | Value | Usage |
|---|---|---|
| `cream-50` | `#FAF9F5` | Page background (light) |
| `cream-100` | `#F5F1E8` | Surface, assistant bubbles (light) |
| `ink-800` | `#13120F` | Page background (dark) |
| `ink-700` | `#1B1A16` | Surface (dark) |
| `spark-500` | `#8C1515` | **Accent — Stanford Cardinal Red.** Used sparingly: buttons, user bubbles, brand mark, focus rings. **Never** as a full background. |
| `ink-700` / `ink-50` | — | Text color (light / dark) |
| `ink-400` / `ink-300` | — | Muted text |

The full Tailwind palette is in `tailwind.config.ts`.

## Type

- Body: system-sans, `text-sm`, `leading-7`.
- Prose: `leading-7`, generous spacing, hanging indents on lists.
- Mono: JetBrains Mono with fallback to system mono.
- Headings: `-tracking-tight`, `font-semibold`, no serifs in chrome.

## Radius and shadow

- Bubbles → `rounded-2xl`
- Cards → `rounded-xl`
- Round buttons → `rounded-full`; text buttons → `rounded-lg`
- Shadow: `shadow-sm` on the input bar, `shadow-md` on modals.
  No hard drop shadows.

## Motion

- Fade-in 300 ms
- Slide-up 250 ms
- Typing-dot loop 1.4 s
- Always respect `prefers-reduced-motion`

## Iconography

- `lucide-react` only.
- Brand mark is the 4-point spark (see `components/SparkLogo.tsx`).

## Tone of AI replies

- Concise, structured, actionable.
- Reply in the user's UI language unless the user switches mid-thread.
- Use code blocks with language tags. Break long answers with headings.
- When discussing trends, cite the time frame (e.g., "as of <month> <year>").
- Never invent links, sources, or library names.
