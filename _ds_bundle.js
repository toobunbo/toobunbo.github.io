/* @ds-bundle: {"format":4,"namespace":"CyberKnightDesignSystem_d28fd5","components":[{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Callout","sourcePath":"components/core/Callout.jsx"},{"name":"ChapterCard","sourcePath":"components/core/ChapterCard.jsx"},{"name":"CodeBlock","sourcePath":"components/core/CodeBlock.jsx"},{"name":"Seal","sourcePath":"components/core/Seal.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"}],"sourceHashes":{"components/core/Button.jsx":"4ef73b9d23aa","components/core/Callout.jsx":"d96d2e2abab0","components/core/ChapterCard.jsx":"44495a51df5a","components/core/CodeBlock.jsx":"67a44de340d8","components/core/Seal.jsx":"35905875ec47","components/core/Tag.jsx":"a4d84637a962"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.CyberKnightDesignSystem_d28fd5 = window.CyberKnightDesignSystem_d28fd5 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * CYBERKNIGHT Button — a stamped, hard-edged action.
 * Vermilion fill (primary), ink outline (secondary), or bare ink (ghost).
 */
function Button({
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
    boxSizing: "border-box"
  };
  const variants = {
    primary: {
      background: "var(--accent)",
      color: "var(--accent-ink)",
      borderColor: "var(--ink)",
      boxShadow: "var(--shadow-seal)"
    },
    secondary: {
      background: "transparent",
      color: "var(--ink)",
      borderColor: "var(--ink)"
    },
    ghost: {
      background: "transparent",
      color: "var(--ink)",
      borderColor: "transparent",
      textTransform: "none",
      letterSpacing: 0
    }
  };
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: `ckn-btn ckn-btn--${variant}`,
    disabled: as === "button" ? disabled : undefined,
    style: {
      ...base,
      ...variants[variant],
      ...style
    },
    onMouseDown: e => {
      if (!disabled) e.currentTarget.style.transform = "translate(1px,1px)";
    },
    onMouseUp: e => {
      e.currentTarget.style.transform = "translate(0,0)";
    },
    onMouseLeave: e => {
      e.currentTarget.style.transform = "translate(0,0)";
    }
  }, rest), iconLeft, /*#__PURE__*/React.createElement("span", null, children), iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/CodeBlock.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * CYBERKNIGHT CodeBlock — a dark terminal window on the page.
 * The one place terminal-green is allowed. Optional title bar + command prompt.
 * `lines` is an array of { text, kind } where kind ∈ com|acc|green|prompt|"".
 */
function CodeBlock({
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
    "": "var(--code-fg)"
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    className: "ckn-code",
    style: {
      background: "var(--code-bg)",
      border: "var(--bw-rule) solid var(--ink)",
      borderRadius: "var(--r-2)",
      boxShadow: "var(--shadow-block)",
      overflow: "hidden",
      fontFamily: "var(--font-mono)",
      boxSizing: "border-box",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "8px 12px",
      borderBottom: "1px solid rgba(255,255,255,0.08)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "6px",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 9,
      height: 9,
      borderRadius: "50%",
      background: "var(--accent)",
      display: "inline-block"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 9,
      height: 9,
      borderRadius: "50%",
      background: "#5f5747",
      display: "inline-block"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 9,
      height: 9,
      borderRadius: "50%",
      background: "#5f5747",
      display: "inline-block"
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "10.5px",
      letterSpacing: "1px",
      textTransform: "uppercase",
      color: "var(--code-com)"
    }
  }, title || lang)), /*#__PURE__*/React.createElement("pre", {
    style: {
      margin: 0,
      padding: "14px 16px",
      fontSize: "var(--fs-code)",
      lineHeight: "var(--lh-code)",
      color: "var(--code-fg)",
      overflowX: "auto",
      whiteSpace: "pre-wrap",
      wordBreak: "break-word"
    }
  }, children ? children : lines.map((ln, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      color: tokenColor[ln.kind || ""]
    }
  }, ln.prompt && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--code-green)"
    }
  }, ln.prompt, " "), ln.text))));
}
Object.assign(__ds_scope, { CodeBlock });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/CodeBlock.jsx", error: String((e && e.message) || e) }); }

// components/core/Seal.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * CYBERKNIGHT Seal — the signature stamped label.
 * Status seals (連載 / 番外編 / 調査中) and difficulty seals (易 / 中 / 難).
 * Rotated slightly like a hand-pressed hanko.
 */
function Seal({
  jp,
  en = null,
  variant = "outline",
  tone = "accent",
  size = "md",
  rotate = -3,
  style = {},
  ...rest
}) {
  const toneColor = tone === "easy" ? "var(--seal-easy)" : tone === "mid" ? "var(--seal-mid)" : tone === "hard" ? "var(--seal-hard)" : tone === "ink" ? "var(--ink)" : tone === "sub" ? "var(--sub)" : "var(--accent)";
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
    verticalAlign: "middle"
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    className: `ckn-seal ckn-seal--${tone}`,
    style: {
      ...box,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      paddingTop: "1px"
    }
  }, jp), en && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontWeight: 400,
      fontSize: size === "lg" ? "9px" : "8px",
      letterSpacing: "1px",
      marginTop: "3px",
      opacity: 0.8,
      textTransform: "uppercase"
    }
  }, en));
}
Object.assign(__ds_scope, { Seal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Seal.jsx", error: String((e && e.message) || e) }); }

// components/core/Callout.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * CYBERKNIGHT Callout — a margin note / aside, framed like an editor's remark
 * pressed into the page. tone sets the accent edge.
 */
function Callout({
  label = null,
  // string OR { jp, en }
  tone = "accent",
  // accent | sub | ink | green
  title = null,
  children,
  style = {},
  ...rest
}) {
  const edge = tone === "sub" ? "var(--sub)" : tone === "ink" ? "var(--ink)" : tone === "green" ? "var(--term)" : "var(--accent)";
  const tint = tone === "sub" ? "var(--sub-soft)" : tone === "ink" ? "transparent" : "var(--accent-soft)";
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `ckn-callout ckn-callout--${tone}`,
    style: {
      display: "flex",
      gap: "12px",
      background: tint,
      border: "1px solid var(--rule)",
      borderLeft: `var(--bw-heavy) solid ${edge}`,
      borderRadius: "var(--r-1)",
      padding: "14px 16px",
      boxSizing: "border-box",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, label && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: "6px"
    }
  }, typeof label === "string" ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "10.5px",
      fontWeight: 600,
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      color: edge
    }
  }, label) : /*#__PURE__*/React.createElement(__ds_scope.Seal, {
    jp: label.jp,
    en: label.en,
    tone: tone === "green" ? "easy" : tone,
    size: "sm",
    rotate: -2
  })), title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontWeight: 700,
      fontSize: "15px",
      marginBottom: "4px",
      color: "var(--ink)"
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "14.5px",
      lineHeight: 1.66,
      color: "var(--ink-2)"
    }
  }, children)));
}
Object.assign(__ds_scope, { Callout });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Callout.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * CYBERKNIGHT Tag — a mono metadata chip for categories/techniques.
 * e.g. #pwn  #web  #deserialization  #bug-bounty
 */
function Tag({
  children,
  hash = true,
  active = false,
  as = "span",
  style = {},
  ...rest
}) {
  const Tag = as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: "ckn-tag",
    style: {
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
      ...style
    }
  }, rest), hash && /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: 0.55
    }
  }, "#"), children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/core/ChapterCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * CYBERKNIGHT ChapterCard — a writeup entry styled as a manga chapter panel.
 * Heavy ink border, block-print shadow, chapter number in display face,
 * difficulty seal in the corner.
 */
function ChapterCard({
  chapter = "CH.01",
  kind = "CTF WRITEUP",
  title,
  excerpt,
  tags = [],
  author = "",
  date = "",
  difficulty = null,
  // { jp, en, tone }
  status = null,
  // { jp, en, tone, variant }
  href = "#",
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("a", _extends({
    className: "ckn-chapter-card",
    href: href,
    style: {
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
      ...style
    },
    onMouseEnter: e => {
      e.currentTarget.style.transform = "translate(-2px,-2px)";
      e.currentTarget.style.boxShadow = "var(--shadow-block-lg)";
    },
    onMouseLeave: e => {
      e.currentTarget.style.transform = "translate(0,0)";
      e.currentTarget.style.boxShadow = "var(--shadow-block)";
    }
  }, rest), difficulty && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: "14px",
      right: "16px"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Seal, {
    jp: difficulty.jp,
    en: difficulty.en,
    tone: difficulty.tone || "hard",
    size: "md"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      marginBottom: "10px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "18px",
      color: "var(--accent)",
      letterSpacing: "1px",
      lineHeight: 1
    }
  }, chapter), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "11px",
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      color: "var(--ink-3)"
    }
  }, kind), status && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "2px"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Seal, {
    jp: status.jp,
    en: status.en,
    tone: status.tone || "accent",
    variant: status.variant || "outline",
    size: "sm",
    rotate: -2
  }))), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-body)",
      fontWeight: 700,
      fontSize: "20px",
      lineHeight: 1.25,
      margin: "0 44px 8px 0",
      letterSpacing: "-.2px"
    }
  }, title), excerpt && /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "14.5px",
      lineHeight: 1.62,
      color: "var(--ink-2)",
      margin: "0 0 14px"
    }
  }, excerpt), tags.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: "6px",
      marginBottom: "12px"
    }
  }, tags.map(t => /*#__PURE__*/React.createElement(__ds_scope.Tag, {
    key: t
  }, t))), (author || date) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      paddingTop: "12px",
      borderTop: "1px solid var(--hair)",
      fontFamily: "var(--font-mono)",
      fontSize: "11px",
      letterSpacing: ".3px",
      color: "var(--ink-3)"
    }
  }, author && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--ink-2)"
    }
  }, author), author && date && /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: .5
    }
  }, "\xB7"), date && /*#__PURE__*/React.createElement("span", null, date)));
}
Object.assign(__ds_scope, { ChapterCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ChapterCard.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Callout = __ds_scope.Callout;

__ds_ns.ChapterCard = __ds_scope.ChapterCard;

__ds_ns.CodeBlock = __ds_scope.CodeBlock;

__ds_ns.Seal = __ds_scope.Seal;

__ds_ns.Tag = __ds_scope.Tag;

})();
