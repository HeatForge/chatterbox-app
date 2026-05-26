import { type HTMLAttributes } from "react";

import { AppIcon } from "./icons";
import styles from "./Icon.module.css";
import { iconSvgBodies } from "./svgPaths";

export type IconSize = "sm" | "md" | "lg";

const sizeClass: Record<IconSize, string> = {
  sm: styles.sm ?? "",
  md: styles.md ?? "",
  lg: styles.lg ?? "",
};

export interface IconProps extends Omit<HTMLAttributes<SVGSVGElement>, "children"> {
  name: AppIcon;
  size?: IconSize;
  /** When set, exposes the icon to assistive tech via title + role="img". */
  title?: string;
}

export function Icon({
  name,
  size = "md",
  className,
  title,
  ...rest
}: IconProps) {
  const body = iconSvgBodies[name];
  const classes = [styles.icon, sizeClass[size], className].filter(Boolean).join(" ");

  if (title) {
    return (
      <svg
        className={classes}
        viewBox="0 0 24 24"
        role="img"
        aria-label={title}
        {...rest}
        dangerouslySetInnerHTML={{ __html: body }}
      >
        <title>{title}</title>
      </svg>
    );
  }

  return (
    <svg
      className={classes}
      viewBox="0 0 24 24"
      aria-hidden
      {...rest}
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}
