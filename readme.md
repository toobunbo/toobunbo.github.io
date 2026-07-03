# CYBERKNIGHT — Design System

> 電脳騎士部 — a Cybersecurity club that publishes its CTF writeups, bug-bounty reports, and security research as a **hand-drawn manga it draws itself**. This design system dresses a real technical blog as a printed manga volume.

**Selected direction:** Option **A (活版 / Kappan · Letterpress)** paired with paper ground **P2 (#F5EEDF)** — chosen from `explorations/theme-options.html`.

---

## Core criteria (non-negotiable)
1. **It is a real printed manga page, not a tech dashboard.** Default is light: cream paper, warm black ink. Dark mode is only a *negative print* (paper⇄ink inverted), never the default.
2. **It is still a real technical blog.** Long-form writeups must read effortlessly. The manga personality "performs" loudly on landing/cover; reading pages prioritise absolute legibility.
3. **The club draws its own story.** No glossy Hollywood neon/cyberpunk. Material = real ink + paper (texture, weight), not flat glow.

## Sources
This system was authored from a written brief only (no Figma, codebase, or screenshots attached). All values below are original to this brief. The theme was chosen by the user from a 3-option exploration; see `explorations/theme-options.html` for the rejected directions (B 劇画 Gekiga, C 電脳 Dennō) and the paper-ground comparison (P1/P3).

---

## CONTENT FUNDAMENTALS
- **Voice:** first-person plural, understated, story-driven. A writeup reads like a manga chapter — setup, twist, payoff. E.g. *"Every good writeup starts with a boring endpoint."*
- **Casing:** display/wordmark and section kickers are UPPERCASE mono (`CH.07 · CTF WRITEUP`); prose is sentence case; headings are sentence case in the body serif.
- **Person:** "we" for the club's own work; "you" only in direct advice. Never marketing "we help you…".
- **Japanese labels are decorative-functional**, never body copy: 連載 (serial), 番外編 (side-story/gaiden), 調査中 (investigating/WIP), and difficulty 易 / 中 / 難 (easy/med/hard). Always paired with a small romaji sub-label the first time.
- **Numbers are chapters & issues**, not vanity metrics: `CH.07`, `ISSUE #42`, `VOL.07`, read-time. Avoid stat-slop.
- **Emoji: never.** Personality comes from seals (hanko stamps) and the display face, not emoji.
- **Tone example (disclosure):** *"Disclosed to the vendor and fixed in v2.4.1 before publication."* — responsible, factual, no bravado.

## VISUAL FOUNDATIONS
- **Color:** cream paper `--paper #F5EEDF` + card `#FDF9F0`; warm charcoal ink `--ink #1E1B16` (never #000). One brand accent — **朱 vermilion `#B93E2A`** (seal ink) — used everywhere: headings kickers, seals, primary buttons. **藍 indigo `#274B6B`** is the quiet secondary (links/info). **墨緑 green `#2C6B4A`** is *caged*: it only appears inside `CodeBlock`/terminal surfaces, so the hacker flavour never leaks into neon.
- **Dark mode:** `html[data-theme="dark"]` — a calculated negative: paper⇄ink swap, vermilion lifts one step (`#E85E44`) to stay lively; green is released a little further (phosphor `#5FD08A`) since dark mode reads as "a terminal".
- **Type:** display **Reggae One** (wordmark, chapter titles, issue numbers — it shouts); body **Shippori Mincho** serif (long-form reading + all Japanese labels, one family so weights/x-height align); mono **IBM Plex Mono** (code, commands, tags, kickers). Reading size 16–17px, line-height 1.72–1.78, measure ~68ch.
- **Backgrounds:** flat paper + a very faint 4px radial grain (`--paper-grain`). No photographic imagery, no gradients, no glow. The issue cover uses a diagonal hatch + large vertical kanji as a drawn "cover plate".
- **Borders & surfaces:** heavy 2px ink panel borders (`--bw-rule`), 3px masthead underline (`--bw-heavy`). **Corners are hard (radius 0)**; only inline code/tags/inputs get 1–2px.
- **Shadow:** **block-print offset shadow** — solid, no blur (`6px 6px 0` / `10px 10px 0`). Seals get a tiny `2px 2px 0` vermilion offset. Never soft/blurred drop-shadows.
- **Seals (hanko):** the signature motif. Rotated a few degrees like a hand-pressed stamp. Status + difficulty.
- **Animation:** minimal, mechanical. Cards *lift* on hover (`translate(-2px,-2px)` + larger block shadow); buttons *press down* `translate(1px,1px)` like a stamp. `~.08–.12s ease`. No bounces, no parallax, no infinite loops.
- **Hover / press:** hover = lift + accent-strong fill; press = physical downward nudge. Links underline with 2px offset.
- **Layout:** centered container `--container 1180px`; reading column capped at `--measure 68ch`. Sticky masthead with a thin vermilion progress rule on reading pages.
- **Transparency/blur:** essentially none — this is opaque ink on opaque paper. Tints (`--accent-soft`) are flat low-alpha fills, not blurs.

## ICONOGRAPHY
- **Primary "icon" system is typographic, not pictographic:** Japanese seal glyphs (連載 / 番外編 / 調査中 / 易 / 中 / 難) set in Shippori Mincho 800 do the work most UIs give to icons. This is intentional and on-brand — it reads as a printed stamp.
- **No icon font, sprite, or SVG set** is bundled (none was provided in the brief). Where a small utility glyph is unavoidable, use plain Unicode (`←`, `→`, `·`, `完`) in the mono or body face — never emoji, never hand-drawn SVG.
- **If a future need arises for line icons**, substitute a CDN set with a matching hairline weight (e.g. Lucide at 1.5px) and record the substitution here. Not currently used.
- **Logo/brand mark:** no logo file was provided. The wordmark is rendered in plain type — **Reggae One** "CYBER" (ink) + "KNIGHT" (vermilion), optionally with 部. Treat this type treatment as the mark until a real logo is supplied.

---

## INDEX / manifest

**Root**
- `styles.css` — global entry (import this one file). `@import`s the four token files below.
- `readme.md` — this guide.
- `SKILL.md` — Agent-Skill wrapper.
- `explorations/theme-options.html` — the original 3-option theme exploration.

**Tokens** (`tokens/`)
- `fonts.css` — `@import`s the four Google Fonts families.
- `colors.css` — paper/ink/accent tokens + full dark-mode negative under `:root[data-theme="dark"]`.
- `typography.css` — families, size scales, weights, line-heights, letter-spacing.
- `spacing.css` — 4px spacing scale, radii, borders, block-print shadows, layout.

**Components** (`components/core/`) — the reusable primitives:
- **Button** — stamped hard-edged action (primary vermilion / secondary outline / ghost).
- **Seal** — the signature hanko stamp; status (連載/番外編/調査中) & difficulty (易/中/難).
- **Tag** — mono metadata chip for techniques/categories (#pwn, #web).
- **ChapterCard** — a writeup entry as a manga chapter panel (composes Seal + Tag).
- **CodeBlock** — dark terminal window; the only place terminal-green appears.
- **Callout** — editor's aside with an accent edge (disclosure notes, warnings, tips).

**UI kits** (`ui_kits/website/`)
- `index.html` — landing / manga issue cover (Masthead + CoverHero + ArchiveGrid). Starting point.
- `reading.html` — full CTF-writeup reading page, readability-first. Starting point.

**Foundation cards** (`guidelines/`) — specimen cards feeding the Design System tab: colors (paper / accent / dark), type (display / body / mono), brand (seals / surfaces), spacing.

## Caveats / substitutions
- **Fonts are loaded from Google Fonts CDN**, not self-hosted binaries. All four (Reggae One, Shippori Mincho, IBM Plex Mono) cover the needed Latin + kana/kanji. If you need offline/self-hosted webfonts, supply the files and I'll swap in `@font-face` rules.
- **No logo** provided — wordmark is a type treatment (see Iconography).
- **Intentional additions:** none beyond the brief's implied inventory. Components were derived from the content model (writeups, seals, code, tags), not a pre-existing component library.
