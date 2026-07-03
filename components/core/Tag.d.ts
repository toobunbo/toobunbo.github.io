import React from "react";

export interface TagProps {
  children: React.ReactNode;
  /** show the leading # (default true) */
  hash?: boolean;
  /** filled vermilion state, e.g. selected filter */
  active?: boolean;
  as?: keyof JSX.IntrinsicElements;
  style?: React.CSSProperties;
}

/**
 * Mono metadata chip for techniques/categories (#pwn, #web, #deserialization).
 * @dsCard group="Components"
 */
export function Tag(props: TagProps): JSX.Element;
