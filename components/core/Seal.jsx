import React from "react";

/**
 * CYBERKNIGHT Seal — the signature stamped label.
 * Status seals (連載 / 番外編 / 調査中) and difficulty seals (易 / 中 / 難).
 * Rotated slightly like a hand-pressed hanko.
 */
export function Seal({
  jp,
  en = null,
  variant = "outline",
  tone = "accent",
  size = "md",
  rotate = -3,
  style = {},
  ...rest
}) {
  const toneColor =
    tone === "easy" ? "var(--seal-easy)" :
    tone === "mid" ? "var(--seal-mid)" :
    tone === "hard" ? "var(--seal-hard)" :
    tone === "ink" ? "var(--ink)" :
    tone === "sub" ? "var(--sub)" :
    "var(--accent)";

  const fs = size === "sm" ? "12px" : size === "lg" ? "22px" : "16px";
  const pad = size === "sm" ? "4px 7px 3px" : size === "lg" ? "9px 14px 7px" : "6px 10px 5px";

  const solid = variant === "solid";
  const box = {
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-jp)",
    fontWeight: 800,
    fontSize: fs,
    letterSpacing: "2px",
    lineHeight: 1,
    padding: pad,
    border: `var(--bw-rule) solid ${toneColor}`,
    borderRadius: "var(--r-1)",
    color: solid ? "var(--accent-ink)" : toneColor,
    background: solid ? toneColor : "transparent",
    transform: `rotate(${rotate}deg)`,
    boxShadow: solid ? "none" : "var(--shadow-seal)",
    boxSizing: "border-box",
    verticalAlign: "middle",
  };

  return (
    <span className={`ckn-seal ckn-seal--${tone}`} style={{ ...box, ...style }} {...rest}>
      <span style={{ paddingTop: "1px" }}>{jp}</span>
      {en && (
        <span style={{
          fontFamily: "var(--font-mono)",
          fontWeight: 400,
          fontSize: size === "lg" ? "9px" : "8px",
          letterSpacing: "1px",
          marginTop: "3px",
          opacity: 0.8,
          textTransform: "uppercase",
        }}>{en}</span>
      )}
    </span>
  );
}
