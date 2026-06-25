"use client";

import { Icon } from "@iconify/react";
import { useEffect } from "react";

import { intentDefaultIcon } from "@/hooks/event-provider/intent-icons";
import { IconNames } from "@/lib/IconNames";

import styles from "./toaster.module.css";
import { type ToastItem, ToastPlacement } from "./types";

const PLACEMENT_CLASS: Record<ToastPlacement, string> = {
  [ToastPlacement.TOP_LEFT]: styles.topLeft,
  [ToastPlacement.TOP_CENTER]: styles.topCenter,
  [ToastPlacement.TOP_RIGHT]: styles.topRight,
  [ToastPlacement.BOTTOM_LEFT]: styles.bottomLeft,
  [ToastPlacement.BOTTOM_CENTER]: styles.bottomCenter,
  [ToastPlacement.BOTTOM_RIGHT]: styles.bottomRight,
};

type ToastCardProps = {
  toast: ToastItem;
  depth: number;
  onDismiss: () => void;
};

function ToastCard({ toast, depth, onDismiss }: ToastCardProps) {
  const dismissable = toast.dismissable ?? true;
  const icon = toast.icon ?? intentDefaultIcon(toast.intent);

  useEffect(() => {
    if (toast.duration === undefined || toast.duration < 0) {
      return;
    }

    const timer = window.setTimeout(onDismiss, toast.duration);
    return () => window.clearTimeout(timer);
  }, [toast.duration, onDismiss]);

  return (
    <div className={styles.stackCard} data-depth={depth}>
      <div
        className={styles.toast}
        data-intent={toast.intent}
        aria-live="polite"
      >
        <Icon className={styles.icon} icon={icon} aria-hidden />
        <div className={styles.content}>
          <p className={styles.title}>{toast.title}</p>
          {toast.description ? (
            <p className={styles.description}>{toast.description}</p>
          ) : null}
        </div>
        {dismissable ? (
          <button
            type="button"
            className={styles.dismiss}
            onClick={onDismiss}
            aria-label="Dismiss notification"
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

type ToastStackProps = {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
};

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  const placements = Object.values(ToastPlacement);

  return (
    <>
      {placements.map((placement) => {
        const placementToasts = toasts.filter(
          (toast) => toast.placement === placement,
        );
        if (placementToasts.length === 0) {
          return null;
        }

        const visibleToasts = placementToasts.slice(-3);

        return (
          <div
            key={placement}
            className={`${styles.toastStack} ${PLACEMENT_CLASS[placement]}`}
          >
            <div className={styles.stackGroup}>
              {visibleToasts.map((toast, index) => {
                const depth = visibleToasts.length - 1 - index;
                return (
                  <ToastCard
                    key={toast.id}
                    toast={toast}
                    depth={depth}
                    onDismiss={() => onDismiss(toast.id)}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
