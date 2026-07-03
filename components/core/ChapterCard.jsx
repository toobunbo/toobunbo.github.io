import React from "react";
import { Seal } from "./Seal.jsx";
import { Tag } from "./Tag.jsx";

/**
 * CYBERKNIGHT ChapterCard — a writeup entry styled as a manga chapter panel.
 * Heavy ink border, block-print shadow, chapter number in display face,
 * difficulty seal in the corner.
 */
export function ChapterCard({
  chapter = "CH.01",
  kind = "CTF WRITEUP",
  title,
  excerpt,
  tags = [],
  author = "",
  date = "",
  difficulty = null,        // { jp, en, tone }
  status = null,            // { jp, en, tone, variant }
  href = "#",
  style = {},
  ...rest
}) {
  return (
    <a
      className="ckn-chapter-card"
      href={href}
      style={{
        display: "block",
        position: "relative",
        background: "var(--card)",
        border: "var(--bw-rule) solid var(--ink)",
        boxShadow: "var(--shadow-block)",
        padding: "20px 22px 18px",
        textDecoration: "none",
        color: "var(--ink)",
        transition: "transform .1s ease, box-shadow .1s ease",
        boxSizing: "border-box",
        ...style,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translate(-2px,-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-block-lg)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translate(0,0)"; e.currentTarget.style.boxShadow = "var(--shadow-block)"; }}
      {...rest}
    >
      {difficulty && (
        <div style={{ position: "absolute", top: "14px", right: "16px" }}>
          <Seal jp={difficulty.jp} en={difficulty.en} tone={difficulty.tone || "hard"} size="md" />
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
        <span style={{
          fontFamily: "var(--font-display)",
          fontSize: "18px",
          color: "var(--accent)",
          letterSpacing: "1px",
          lineHeight: 1,
        }}>{chapter}</span>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          color: "var(--ink-3)",
        }}>{kind}</span>
        {status && (
          <span style={{ marginLeft: "2px" }}>
            <Seal jp={status.jp} en={status.en} tone={status.tone || "accent"} variant={status.variant || "outline"} size="sm" rotate={-2} />
          </span>
        )}
      </div>

      <h3 style={{
        fontFamily: "var(--font-body)",
        fontWeight: 700,
        fontSize: "20px",
        lineHeight: 1.25,
        margin: "0 44px 8px 0",
        letterSpacing: "-.2px",
      }}>{title}</h3>

      {excerpt && (
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "14.5px",
          lineHeight: 1.62,
          color: "var(--ink-2)",
          margin: "0 0 14px",
        }}>{excerpt}</p>
      )}

      {tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
          {tags.map((t) => <Tag key={t}>{t}</Tag>)}
        </div>
      )}

      {(author || date) && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          paddingTop: "12px",
          borderTop: "1px solid var(--hair)",
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          letterSpacing: ".3px",
          color: "var(--ink-3)",
        }}>
          {author && <span style={{ color: "var(--ink-2)" }}>{author}</span>}
          {author && date && <span style={{ opacity: .5 }}>·</span>}
          {date && <span>{date}</span>}
        </div>
      )}
    </a>
  );
}
