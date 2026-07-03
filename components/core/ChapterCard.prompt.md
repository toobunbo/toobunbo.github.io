**ChapterCard** — a writeup entry styled as a manga chapter panel. Use in index/archive grids. Composes `Seal` (corner difficulty + inline status) and `Tag`.

```jsx
<ChapterCard
  chapter="CH.07"
  kind="CTF WRITEUP"
  title="Catching root from a harmless-looking deserialize"
  excerpt="A base64 blob hits unserialize() — a gadget chain, then RCE."
  tags={["pwn", "deserialization"]}
  author="nyx@ckn"
  date="2026.06.28"
  difficulty={{ jp: "難", en: "HARD", tone: "hard" }}
  status={{ jp: "連載", en: "SERIAL", variant: "solid" }}
/>
```

Whole card is a link (`href`). Lifts on hover with a larger block-print shadow.
