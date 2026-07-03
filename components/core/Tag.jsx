import React from "react";

/**
 * CYBERKNIGHT Tag — a mono metadata chip for categories/techniques.
 * e.g. #pwn  #web  #deserialization  #bug-bounty
 */
export function Tag({ children, hash = true, active = false, as = "span", style = {}, ...rest }) {
  const Tag = as;
  return (
    <Tag
      className="ckn-tag"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "1px",
        fontFamily: "var(--font-mono)",
        fontSize: "var(--fs-tag)",
        fontWeight: 500,
        letterSpacing: "0.3px",
        lineHeight: 1,
        padding: "4px 8px",
        color: active ? "var(--accent-ink)" : "var(--ink-2)",
        background: active ? "var(--accent)" : "var(--accent-soft)",
        border: `1px solid ${active ? "var(--accent)" : "var(--accent-line)"}`,
        borderRadius: "var(--r-1)",
        textDecoration: "none",
        cursor: as === "a" || as === "button" ? "pointer" : "default",
        whiteSpace: "nowrap",
        boxSizing: "border-box",
        ...style,
      }}
      {...rest}
    >
      {hash && <span style={{ opacity: 0.55 }}>#</span>}
      {children}
    </Tag>
  );
}
