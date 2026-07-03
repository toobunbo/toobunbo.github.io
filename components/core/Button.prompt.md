**Button** — a stamped, hard-edged call to action. Use for primary page actions (read chapter, submit) and secondary controls.

```jsx
<Button variant="primary">Read chapter</Button>
<Button variant="secondary" size="sm">Share</Button>
<Button variant="ghost">Cancel</Button>
```

Variants: `primary` (vermilion fill + seal shadow), `secondary` (ink outline), `ghost` (bare text). Sizes `sm | md | lg`. Uppercase mono label; presses down 1px like a stamp. Pass `as="a"` + `href` for links, `block` to fill width, `iconLeft`/`iconRight` for glyphs.
