import { AppIcon, Icon } from "~/components/primitives/Icon";

import { type ToastItem } from "./types";
import styles from "./Toast.module.css";

interface ToastListProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastList({ toasts, onDismiss }: ToastListProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className={styles.list}
      aria-live="polite"
      aria-relevant="additions removals"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={[styles.toast, styles[toast.variant]].filter(Boolean).join(" ")}
          role="status"
        >
          <span>{toast.message}</span>
          <button
            type="button"
            className={styles.dismiss}
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
          >
            <Icon name={AppIcon.Close} size="sm" />
          </button>
        </div>
      ))}
    </div>
  );
}
