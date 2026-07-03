import React from "react";

export interface SealProps {
  /** Japanese glyph(s): 連載, 番外編, 調査中, 易, 中, 難 … */
  jp: string;
  /** optional romaji/English sub-label, e.g. "SERIAL", "HARD" */
  en?: string | null;
  variant?: "outline" | "solid";
  /** color role — difficulty (easy/mid/hard) or brand (accent/ink/sub) */
  tone?: "accent" | "easy" | "mid" | "hard" | "ink" | "sub";
  size?: "sm" | "md" | "lg";
  /** stamp rotation in degrees (default -3, like a pressed hanko) */
  rotate?: number;
  style?: React.CSSProperties;
}

/**
 * The signature CYBERKNIGHT stamp — status & difficulty seals in the
 * hand-pressed hanko style. Vermilion by default; green/gold/red for difficulty.
 * @dsCard group="Components"
 * @startingPoint section="Brand" subtitle="Status & difficulty seals" viewport="700x150"
 */
export function Seal(props: SealProps): JSX.Element;
