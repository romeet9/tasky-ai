# Design System — TaskyAI

> Source of truth for TaskyAI's visual language. Read this before any UI change.
> Formalized from the shipping system by `/design-consultation` (2026-07-08),
> grounded in the tokens in `app/globals.css` and research of Linear, Raycast, and Things.

## Product Context
- **What this is:** An AI task planner that turns a plain-English brief into structured, prioritized tasks with subtasks, categories, team workspaces, and role-based assignment.
- **Who it's for:** Individuals and small teams — managers and makers who plan work and want the AI to do the structuring.
- **Space/industry:** AI productivity / task management. Peers: Linear, Raycast, Things, Motion, Todoist.
- **Project type:** Web app (two-panel chat + task board, manager Kanban) plus a marketing landing page.

## Identity — the one thing to remember
**AI-first and alive.** TaskyAI should feel like calm intelligence: dark, precise, and quiet by default — then it comes alive the moment the AI acts. The red accent is the pulse; motion is how the product signals it's thinking and doing. Every decision below serves that: restraint everywhere so the alive moments land.

## Aesthetic Direction
- **Direction:** Dark "command-center" (Raycast / Linear lineage) with an AI-first personality.
- **Decoration level:** Intentional — subtle glows, tactile key-shadows, and faint top-gradients on cards. Never decorative for its own sake.
- **Mood:** Near-black canvas, high-contrast type, one warm accent. Serious tooling for people who ship.
- **Reference sites:** linear.app, raycast.com, culturedcode.com/things
- **Mode:** Dark only. There is no light theme; do not add one without explicit approval.

## Typography
- **Display / Hero:** **Satoshi** (proposed refinement — see Risks). Geometric grotesque, modern and characterful without shouting. Use for the marketing hero and large product moments. *Currently Inter; adopting Satoshi is a small, optional code change.*
- **UI / Body / Labels:** **Inter** — the shipping workhorse. Excellent at small sizes, which is 90% of the app. Keep it.
- **Data / Tables / Numbers:** **Inter with `tabular-nums`** — required wherever counts, dates, or metrics align (task counters, KPI values).
- **Code / Keyboard hints:** **Geist Mono** (or the current `SF Mono` / `Fira Code` stack) for shortcuts and any code.
- **Loading:** Inter via `next/font` (already wired in `app/layout.tsx`) + Google Fonts `@import` in `globals.css`. Add Satoshi via Fontshare if adopted.
- **Signature detail:** Body copy carries `letter-spacing: 0.2px`; large display uses negative tracking (−0.3px to −1px). This spacing is part of the house voice — keep it.

### Type scale (px)
| Role | Size / line-height | Weight | Tracking |
|------|--------------------|--------|----------|
| Display (hero) | 40–66 / 1.05 | 600–700 | −0.6 to −1px |
| H1 | 24–28 / 1.1 | 600 | −0.3px |
| H2 / section | 20 / 1.2 | 600 | −0.2px |
| Body-lg / card title | 16 / 1.4 | 500 | 0.2px |
| **Body (workhorse)** | **14 / 1.5** | 400–500 | 0.2px |
| Label / small | 13 / 1.4 | 500 | 0.2px |
| Caption | 11–12 / 1.4 | 500 | 0.2px |
| Micro (uppercase eyebrow) | 10 / 1.3 | 500 | 0.05px, UPPERCASE |

## Color
- **Approach:** Restrained. Near-monochrome dark neutrals + one brand accent (red). Blue/green/yellow are semantic only — never decorative.

**Surfaces (dark, low to high):**
| Token | Hex | Use |
|-------|-----|-----|
| `--raycast-bg` | `#07080a` | Page background |
| `--raycast-surface` | `#101111` | Popovers, dropdowns, elevated panels |
| `--raycast-card` | `#1b1c1e` | Cards, chips |

**Text (high to low emphasis):**
`#f9f9f9` primary · `#cecece` secondary · `#9c9c9d` muted · `#6a6b6c` dim · `#434345` faint

> **Contrast (WCAG AA):** on the `#07080a` canvas, `#9c9c9d` (~7:1) and lighter pass for any text. `#6a6b6c` (~3.6:1) passes only for large/secondary text — avoid it for primary body copy. `#434345` (~2:1) is **decorative only** — never use it as readable text (borders, separators, disabled glyphs).

**Accent & semantic:**
| Token | Hex | Meaning |
|-------|-----|---------|
| `--raycast-red` | `#FF6363` | **Brand + primary accent + destructive.** The "alive" pulse — AI acting, active states, send. |
| `--raycast-blue` | `#55b3ff` | Info, Google/calendar, links |
| `--raycast-green` | `#5fc992` | Success, completed, connected |
| `--raycast-yellow` | `#ffbc33` | Warning, pending |

**Borders:** `rgba(255,255,255,0.06)` hairline · `rgba(255,255,255,0.08)` input · `#252829` solid · `#2f3031` strong.

**Glows (the "alive" layer):** `--raycast-blue-glow` `hsla(202,100%,67%,0.15)`, `--raycast-red-glow` `hsla(0,100%,69%,0.15)`, `--raycast-warm-glow` `rgba(215,201,175,0.05)`. Use sparingly on focus/active/AI-active states.

**Primary CTA:** white background (`#fff`) + near-black text (`#18191a`). This is the one bright surface — do NOT use a gradient or the red for the main CTA.

## Spacing
- **Base unit:** 4px.
- **Density:** Comfortable-compact — data-dense but breathable. The app packs a lot (Kanban columns, task cards); spacing keeps it calm.
- **Scale:** `2 · 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64`.

## Layout
- **Approach:** Hybrid — grid-disciplined for the app, creative for marketing.
- **App:** Desktop two-panel grid (`420px` chat / `1fr` board); manager view is a horizontally-scrolling Kanban, one column per member. Mobile collapses to tabbed panels + `BottomNav`.
- **Max content width:** ~1200–1280px (marketing); app is full-bleed panels.
- **Border radius:** `sm 6px · md 8px (rounded-lg) · lg 12–14px (rounded-xl) · pill 86px · full 9999px`. Cards use `rounded-xl`; toolbar chips use the `86px` pill.

## Motion — where "alive" lives
- **Approach:** Intentional, tipping into expressive at AI moments. Powered by `framer-motion`.
- **House easing curve:** `cubic-bezier(0.25, 0.1, 0.25, 1)` — use for entrances/moves. Springs for interactive feedback: `stiffness 400, damping 17`.
- **Durations:** micro 100ms · short 200ms · medium 250–400ms · long 400–700ms.
- **Interaction feedback:** `whileHover` opacity `0.6` (chrome) or scale `1.03` (buttons); `whileTap` scale `0.9–0.96`. Controls press with the tactile key-shadow.
- **AI-alive choreography:** accent-colored spinner while generating; staggered entrance for freshly created tasks; the red pulse when the AI acts (send, task creation, live counters). These are the signature moments — invest here.

## Signature patterns (keep these — they are the brand)
- **Tactile key-shadow controls** (Raycast-style). Recipe:
  `rgba(255,255,255,0.05) 0px 1px 0px 0px inset, rgba(255,255,255,0.1) 0px 0px 0px 1px, rgba(0,0,0,0.2) 0px -1px 0px 0px inset`
- **Faint top-gradient on cards:** `linear-gradient(to top, rgba(255,99,99,0.05), <card> 65%)` for elevated/feature cards.
- **Pill toolbar chips** at `86px` radius with muted text and the key-shadow.

## Do / Don't (anti-slop guardrails)
**Don't:** purple/violet gradients · 3-column icon-in-circle feature grids · centered-everything · uniform bubble radius on all elements · gradient primary CTA · a light theme · `system-ui` as a display face · red for the main CTA (red = accent/destructive, not primary action).
**Do:** let type and spacing carry the layout · reserve color for meaning · make the AI moments move · keep controls tactile · dark, quiet, precise.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-07-08 | Formalized shipping Raycast-dark system into DESIGN.md | Existing product had a coherent system but no source of truth; documented real `globals.css` tokens |
| 2026-07-08 | Identity = "AI-first and alive" | User pick; motion + red pulse are where TaskyAI differentiates from static peers |
| 2026-07-08 | Proposed Satoshi as display face | Give the all-Inter UI a distinctive headline voice; optional code change |
| 2026-07-08 | Dark-only, red = accent not CTA | Matches shipped app; white/black CTA stays the one bright surface |
