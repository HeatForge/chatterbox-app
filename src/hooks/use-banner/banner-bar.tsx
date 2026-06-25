"use client";

import { Icon } from "@iconify/react";
import { useEffect } from "react";

import { intentDefaultIcon } from "@/hooks/event-provider/intent-icons";
import { IconNames } from "@/lib/IconNames";

import styles from "./banner.module.css";
import type { BannerItem } from "./types";

type BannerBarProps = {
  banner: BannerItem;
  onDismiss: () => void;
};

export function BannerBar({ banner, onDismiss }: BannerBarProps) {
  const dismissable = banner.dismissable ?? true;
  const icon = banner.icon ?? intentDefaultIcon(banner.intent);

  useEffect(() => {
    if (banner.duration === undefined || banner.duration < 0) {
      return;
    }

    const timer = window.setTimeout(onDismiss, banner.duration);
    return () => window.clearTimeout(timer);
  }, [banner.duration, onDismiss]);

  return (
    <div
      className={styles.banner}
      data-placement={banner.placement}
      data-intent={banner.intent}
      aria-live="polite"
    >
      <div className={styles.inner}>
        <Icon className={styles.icon} icon={icon} aria-hidden />
        <div className={styles.content}>
          <p className={styles.title}>{banner.title}</p>
          {banner.description ? (
            <p className={styles.description}>{banner.description}</p>
          ) : null}
        </div>
        {dismissable ? (
          <button
            type="button"
            className={styles.dismiss}
            onClick={onDismiss}
            aria-label="Dismiss banner"
          >
            <Icon
              className={styles.dismissIcon}
              icon={IconNames["close-line"]}
              aria-hidden
            />
          </button>
        ) : null}
      </div>
    </div>
  );
}
