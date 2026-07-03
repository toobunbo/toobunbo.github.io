---
name: cyberknight-design
description: Use this skill to generate well-branded interfaces and assets for CYBERKNIGHT (電脳騎士部), a cybersecurity club that publishes CTF writeups, bug-bounty reports, and research as a hand-drawn manga. It renders a real technical blog as a printed manga volume — cream paper, warm black ink, vermilion seal accent, Japanese hanko labels. Contains design guidelines, color + type tokens, fonts, and UI kit components for prototyping.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc.), copy assets out and create static HTML files for the user to view. If working on production code, copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Non-negotiables (read before designing)
1. **Printed manga page, not a tech dashboard.** Default = light: cream paper `#F5EEDF`, warm ink `#1E1B16` (never #000). Dark mode is only a negative print via `html[data-theme="dark"]`.
2. **Real technical blog.** Reading pages prioritise legibility (Shippori Mincho serif, 16–17px, line-height ~1.75, ~68ch measure). Manga personality performs on landing/cover only.
3. **The club draws its own story.** No neon/cyberpunk glow. Ink + paper texture, block-print offset shadows (no blur), hard corners.
4. **Vermilion `#B93E2A` is the one brand accent** (seals, headings, primary buttons). **Green `#2C6B4A` is caged to code/terminal blocks only.**
5. **Emoji: never.** Icons are typographic — Japanese seal glyphs (連載/番外編/調査中/易/中/難).

## Quickstart
- Link `styles.css` for all tokens (fonts + colors + type + spacing).
- Components live in `components/core/` (Button, Seal, Tag, ChapterCard, CodeBlock, Callout).
- Full-screen recreations in `ui_kits/website/` (`index.html` cover, `reading.html` writeup).
