import React from "react";

interface CodeLine {
  text: string;
  /** token color: com=comment acc=warm-highlight green=terminal-green ""=default */
  kind?: "com" | "acc" | "green" | "";
  /** optional shell prompt printed before the line, e.g. "nyx@ckn:~$" */
  prompt?: string;
}

export interface CodeBlockProps {
  title?: string | null;
  lang?: string;
  /** structured lines; omit and pass children for freeform content */
  lines?: CodeLine[];
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * A dark terminal window embedded in the page — the ONLY place terminal-green
 * appears, keeping the "hacker" flavor caged so the page stays printed-paper.
 * @dsCard group="Components"
 */
export function CodeBlock(props: CodeBlockProps): JSX.Element;
