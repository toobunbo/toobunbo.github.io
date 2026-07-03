**Seal** — the signature stamped label. Two jobs: **status** (連載 serial, 番外編 gaiden/side-story, 調査中 investigating/WIP) and **difficulty** (易 easy, 中 medium, 難 hard). Rendered like a hand-pressed hanko, rotated a few degrees.

```jsx
<Seal jp="連載" en="SERIAL" variant="solid" />
<Seal jp="難" en="HARD" tone="hard" size="lg" />
<Seal jp="易" en="EASY" tone="easy" />
<Seal jp="調査中" en="WIP" tone="ink" />
```

`tone`: `accent` (default vermilion) · `easy` (green) · `mid` (gold) · `hard` (red) · `ink` · `sub` (indigo). `variant="solid"` fills the seal. Difficulty seals conventionally use `tone` matching the glyph.
