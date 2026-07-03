**Callout** — an editor's aside pressed into the page with an accent left edge. Use for warnings, responsible-disclosure notes, and tips inside a writeup.

```jsx
<Callout label="DISCLOSURE" tone="accent" title="Reported & patched">
  This vulnerability was disclosed to the vendor and fixed in v2.4.1 before publication.
</Callout>

<Callout label={{ jp: "調査中", en: "WIP" }} tone="sub">
  Root cause still under analysis — updates to follow.
</Callout>
```

`tone`: `accent` (vermilion) · `sub` (indigo) · `ink` · `green`. `label` accepts a plain string (mono kicker) or `{jp,en}` (renders a Seal).
