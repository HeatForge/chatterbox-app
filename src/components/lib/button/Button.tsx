"use client";

import { Icon } from "@iconify/react";
import type { IconifyIcon } from "@iconify/types";
import type { ComponentPropsWithoutRef, CSSProperties } from "react";

import { Intent } from "@/lib/Intent";

import styles from "./button.module.css";

export type ButtonIcon = string | IconifyIcon;

const DEFAULT_ICON_SIZE = 22;
const DEFAULT_FONT_SIZE_REM = 0.9375;

export type ButtonProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "children"
> & {
  text?: string;
  leftIcon?: ButtonIcon;
  rightIcon?: ButtonIcon;
  intent?: Intent;
  iconSize?: number;
  minimal?: boolean;
  scaleOnlyIcon?: boolean;
};

type ButtonIconProps = {
  icon: ButtonIcon;
  size: number;
};

function getFillIconVariant(icon: ButtonIcon): ButtonIcon | null {
  if (typeof icon !== "string" || !icon.endsWith("-line")) {
    return null;
  }

  return icon.replace(/-line$/, "-fill");
}

function getScaledFontSize(iconSize: number): string {
  return `${DEFAULT_FONT_SIZE_REM * (iconSize / DEFAULT_ICON_SIZE)}rem`;
}

function ButtonIcon({ icon, size }: ButtonIconProps) {
  const fillIcon = getFillIconVariant(icon);

  if (!fillIcon) {
    return (
      <Icon
        className={styles.icon}
        icon={icon}
        width={size}
        height={size}
        aria-hidden
      />
    );
  }

  return (
    <span className={styles.iconWrapper} style={{ width: size, height: size }}>
      <Icon
        className={`${styles.icon} ${styles.iconLine}`}
        icon={icon}
        width={size}
        height={size}
        aria-hidden
      />
      <Icon
        className={`${styles.icon} ${styles.iconFill}`}
        icon={fillIcon}
        width={size}
        height={size}
        aria-hidden
      />
    </span>
  );
}

export function Button({
  text,
  leftIcon,
  rightIcon,
  intent = Intent.PRIMARY,
  iconSize = DEFAULT_ICON_SIZE,
  minimal = false,
  scaleOnlyIcon = false,
  className,
  style,
  type = "button",
  ...rest
}: ButtonProps) {
  const iconOnly = Boolean(!text && (leftIcon ?? rightIcon));

  const buttonStyle: CSSProperties = {
    ...style,
    ...(scaleOnlyIcon
      ? {}
      : { "--button-font-size": getScaledFontSize(iconSize) }),
  };

  return (
    <button
      type={type}
      className={[styles.button, className].filter(Boolean).join(" ")}
      data-intent={intent}
      data-icon-only={iconOnly || undefined}
      data-minimal={minimal || undefined}
      style={buttonStyle}
      {...rest}
    >
      {leftIcon ? <ButtonIcon icon={leftIcon} size={iconSize} /> : null}
      {text ? <span className={styles.text}>{text}</span> : null}
      {rightIcon ? <ButtonIcon icon={rightIcon} size={iconSize} /> : null}
    </button>
  );
}
