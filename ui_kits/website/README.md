# CYBERKNIGHT — Website UI kit

A high-fidelity recreation of the club's manga-magazine website.

## Screens
- **index.html** — Landing / issue cover. Masthead (sticky, with 反転 dark-mode toggle) → CoverHero (manga issue cover for the featured writeup) → ArchiveGrid (writeup chapters as panels) → footer.
- **reading.html** — A full CTF writeup reading page (see `../reading/`).

## Composition
Screens compose the core primitives from `components/core/` — `Seal`, `Tag`, `Button`, `ChapterCard`, `CodeBlock`, `Callout`. Kit-local layout pieces (Masthead, CoverHero, ArchiveGrid) are defined inline inside `index.html`'s Babel block (they're page-specific, not part of the reusable API).

## Dark mode
Toggle sets `document.documentElement[data-theme="dark"]` — a calculated negative print, not a separate theme.
