import React from "react";

export interface CalloutProps {
  /** editorial label: a string (rendered as mono kicker) OR {jp,en} (rendered as a Seal) */
  label?: string | { jp: string; en?: string } | null;
  tone?: "accent" | "sub" | "ink" | "green";
  title?: string | null;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * A margin note / editor's aside pressed into the page, with an accent edge.
 * Use for warnings, disclosure notes, tips inside a writeup.
 * @dsCard group="Components"
 */
export function Callout(props: CalloutProps): JSX.Element;
