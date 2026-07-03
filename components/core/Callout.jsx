import React from "react";
import { Seal } from "./Seal.jsx";

/**
 * CYBERKNIGHT Callout — a margin note / aside, framed like an editor's remark
 * pressed into the page. tone sets the accent edge.
 */
export function Callout({
  label = null,       // string OR { jp, en }
  tone = "accent",    // accent | sub | ink | green
  title = null,
  children,
  style = {},
  ...rest
}) {
  const edge =
    tone === "sub" ? "var(--sub)" :
    tone === "ink" ? "var(--ink)" :
    tone === "green" ? "var(--term)" :
    "var(--accent)";
  const tint =
    tone === "sub" ? "var(--sub-soft)" :
    tone === "ink" ? "transparent" :
    "var(--accent-soft)";

  return (
    <div
      className={`ckn-callout ckn-callout--${tone}`}
      style={{
        display: "flex",
        gap: "12px",
        background: tint,
        border: "1px solid var(--rule)",
        borderLeft: `var(--bw-heavy) solid ${edge}`,
        borderRadius: "var(--r-1)",
        padding: "14px 16px",
        boxSizing: "border-box",
        ...style,
      }}
      {...rest}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        {label && (
          <div style={{ marginBottom: "6px" }}>
            {typeof label === "string" ? (
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10.5px",
                fontWeight: 600,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: edge,
              }}>{label}</span>
            ) : (
              <Seal jp={label.jp} en={label.en} tone={tone === "green" ? "easy" : tone} size="sm" rotate={-2} />
            )}
          </div>
        )}
        {title && (
          <div style={{
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: "15px",
            marginBottom: "4px",
            color: "var(--ink)",
          }}>{title}</div>
        )}
        <div style={{
          fontFamily: "var(--font-body)",
          fontSize: "14.5px",
          lineHeight: 1.66,
          color: "var(--ink-2)",
        }}>{children}</div>
      </div>
    </div>
  );
}
