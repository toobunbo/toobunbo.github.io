import React from "react";

interface SealSpec {
  jp: string;
  en?: string;
  tone?: "accent" | "easy" | "mid" | "hard" | "ink" | "sub";
  variant?: "outline" | "solid";
}

export interface ChapterCardProps {
  /** display chapter number, e.g. "CH.01" or "第01話" */
  chapter?: string;
  /** kicker kind, e.g. "CTF WRITEUP", "BUG BOUNTY", "RESEARCH" */
  kind?: string;
  title: string;
  excerpt?: string;
  tags?: string[];
  author?: string;
  date?: string;
  /** corner difficulty seal */
  difficulty?: SealSpec | null;
  /** inline status seal (連載 / 番外編 / 調査中) */
  status?: SealSpec | null;
  href?: string;
  style?: React.CSSProperties;
}

/**
 * A writeup entry as a manga chapter panel — heavy ink border, block-print
 * shadow, difficulty seal in the corner. Composes Seal + Tag.
 * @dsCard group="Components"
 * @startingPoint section="Content" subtitle="Writeup chapter panel" viewport="700x260"
 */
export function ChapterCard(props: ChapterCardProps): JSX.Element;
