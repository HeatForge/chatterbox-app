"use client";

import { Icon } from "@iconify/react";
import type { IconifyIcon } from "@iconify/types";
import type { ComponentPropsWithoutRef } from "react";

import { Intent } from "@/lib/Intent";

import styles from "./button.module.css";

export type ButtonIcon = string | IconifyIcon;

export type ButtonProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "children"
> & {
  text?: string;
  leftIcon?: ButtonIcon;
  rightIcon?: ButtonIcon;
  intent?: Intent;
  iconSize?: number;
};

type ButtonIconProps = {
  icon: ButtonIcon;
  size: number;
};

function ButtonIcon({ icon, size }: ButtonIconProps) {
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

export function Button({
  text,
  leftIcon,
  rightIcon,
  intent = Intent.PRIMARY,
  iconSize = 22,
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  const iconOnly = Boolean(!text && (leftIcon ?? rightIcon));

  return (
    <button
      type={type}
      className={[styles.button, className].filter(Boolean).join(" ")}
      data-intent={intent}
      data-icon-only={iconOnly || undefined}
      {...rest}
    >
      {leftIcon ? <ButtonIcon icon={leftIcon} size={iconSize} /> : null}
      {text ? <span className={styles.text}>{text}</span> : null}
      {rightIcon ? <ButtonIcon icon={rightIcon} size={iconSize} /> : null}
    </button>
  );
}
