import React from "react";

/**
 * CYBERKNIGHT Button — a stamped, hard-edged action.
 * Vermilion fill (primary), ink outline (secondary), or bare ink (ghost).
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  as = "button",
  disabled = false,
  block = false,
  iconLeft = null,
  iconRight = null,
  style = {},
  ...rest
}) {
  const Tag = as;
  const pad = size === "sm" ? "7px 14px" : size === "lg" ? "13px 26px" : "10px 20px";
  const fs = size === "sm" ? "12px" : size === "lg" ? "15px" : "13.5px";

  const base = {
    display: block ? "flex" : "inline-flex",
    width: block ? "100%" : "auto",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontFamily: "var(--font-mono)",
    fontWeight: 600,
    fontSize: fs,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    lineHeight: 1,
    padding: pad,
    border: "var(--bw-rule) solid var(--ink)",
    borderRadius: "var(--r-2)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.45 : 1,
    textDecoration: "none",
    transition: "transform .08s ease, background .12s ease, color .12s ease, box-shadow .12s ease",
    userSelect: "none",
    boxSizing: "border-box",
  };

  const variants = {
    primary: {
      background: "var(--accent)",
      color: "var(--accent-ink)",
      borderColor: "var(--ink)",
      boxShadow: "var(--shadow-seal)",
    },
    secondary: {
      background: "transparent",
      color: "var(--ink)",
      borderColor: "var(--ink)",
    },
    ghost: {
      background: "transparent",
      color: "var(--ink)",
      borderColor: "transparent",
      textTransform: "none",
      letterSpacing: 0,
    },
  };

  return (
    <Tag
      className={`ckn-btn ckn-btn--${variant}`}
      disabled={as === "button" ? disabled : undefined}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = "translate(1px,1px)"; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = "translate(0,0)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translate(0,0)"; }}
      {...rest}
    >
      {iconLeft}
      <span>{children}</span>
      {iconRight}
    </Tag>
  );
}
