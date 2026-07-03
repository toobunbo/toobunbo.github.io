**CodeBlock** — a dark terminal window on the page. This is the **only** surface where terminal-green is allowed, keeping the hacker flavor caged inside the box.

```jsx
<CodeBlock title="reproduce.sh" lines={[
  { text: "# chapter 01 — repro", kind: "com" },
  { text: "curl -s target/api/import --data @payload.b64", prompt: "$" },
  { text: "[+] uid=0(root) — flag{ink_on_paper}", kind: "green" },
]} />
```

`lines` take `kind`: `com` (comment) · `acc` (warm highlight) · `green` (terminal green) · default. `prompt` prints a shell prompt in green. Or pass freeform `children` instead of `lines`.
