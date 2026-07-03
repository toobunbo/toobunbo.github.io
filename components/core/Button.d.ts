import React from "react";

export interface ButtonProps {
  children: React.ReactNode;
  /** primary = vermilion fill · secondary = ink outline · ghost = bare */
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  /** render as a different element, e.g. "a" */
  as?: keyof JSX.IntrinsicElements;
  disabled?: boolean;
  block?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * Stamped, hard-edged action button in the CYBERKNIGHT ink-on-paper style.
 * @dsCard group="Components"
 */
export function Button(props: ButtonProps): JSX.Element;
