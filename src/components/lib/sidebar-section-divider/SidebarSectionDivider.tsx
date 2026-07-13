"use client";

import { Icon } from "@iconify/react";

import type { ButtonIcon } from "@/components/lib/button/Button";

import styles from "./sidebar-section-divider.module.css";

export type SidebarSectionDividerProps = {
  icon: ButtonIcon;
  label: string;
};

const DIVIDER_ICON_SIZE = 25;

export function SidebarSectionDivider({
  icon,
  label,
}: SidebarSectionDividerProps) {
  return (
    <div className={styles.root} role="presentation">
      <Icon
        className={styles.icon}
        icon={icon}
        width={DIVIDER_ICON_SIZE}
        height={DIVIDER_ICON_SIZE}
        aria-hidden
      />
      <span className={styles.label}>{label}</span>
      <span className={styles.line} />
    </div>
  );
}
