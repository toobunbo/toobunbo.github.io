import React from "react";

/**
 * CYBERKNIGHT CodeBlock — a dark terminal window on the page.
 * The one place terminal-green is allowed. Optional title bar + command prompt.
 * `lines` is an array of { text, kind } where kind ∈ com|acc|green|prompt|"".
 */
export function CodeBlock({
  title = null,
  lang = "bash",
  lines = [],
  children = null,
  style = {},
  ...rest
}) {
  const tokenColor = {
    com: "var(--code-com)",
    acc: "var(--code-acc)",
    green: "var(--code-green)",
    prompt: "var(--code-green)",
    "": "var(--code-fg)",
  };

  return (
    <div
      className="ckn-code"
      style={{
        background: "var(--code-bg)",
        border: "var(--bw-rule) solid var(--ink)",
        borderRadius: "var(--r-2)",
        boxShadow: "var(--shadow-block)",
        overflow: "hidden",
        fontFamily: "var(--font-mono)",
        boxSizing: "border-box",
        ...style,
      }}
      {...rest}
    >
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#5f5747", display: "inline-block" }} />
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#5f5747", display: "inline-block" }} />
        </div>
        <span style={{ fontSize: "10.5px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--code-com)" }}>
          {title || lang}
        </span>
      </div>
      <pre style={{
        margin: 0,
        padding: "14px 16px",
        fontSize: "var(--fs-code)",
        lineHeight: "var(--lh-code)",
        color: "var(--code-fg)",
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}>
        {children ? children : lines.map((ln, i) => (
          <div key={i} style={{ color: tokenColor[ln.kind || ""] }}>
            {ln.prompt && <span style={{ color: "var(--code-green)" }}>{ln.prompt} </span>}
            {ln.text}
          </div>
        ))}
      </pre>
    </div>
  );
}
