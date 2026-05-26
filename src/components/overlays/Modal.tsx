import { useEffect, useId, useRef } from "react";

import { ModalBackdrop } from "./ModalBackdrop";
import { type ModalItem } from "./types";
import styles from "./Modal.module.css";

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

interface ModalProps {
  modal: ModalItem;
  stackIndex: number;
  isTop: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

export function Modal({ modal, stackIndex, isTop, onClose, onConfirm }: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const backdropZ = `calc(var(--z-modal-backdrop) + ${stackIndex * 2})`;
  const shellZ = `calc(var(--z-modal) + ${stackIndex * 2})`;
  const hasActions = Boolean(modal.confirmLabel ?? modal.cancelLabel);

  useEffect(() => {
    if (!isTop) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusables = dialog.querySelectorAll<HTMLElement>(FOCUSABLE);
    const first = focusables[0];
    first?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || focusables.length === 0) return;

      const last = focusables[focusables.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isTop, onClose]);

  const handleBackdrop = () => {
    if (!modal.disableBackdropClose) onClose();
  };

  return (
    <>
      {isTop ? <ModalBackdrop zIndex={backdropZ} onClick={handleBackdrop} /> : null}
      <div className={styles.shell} style={{ zIndex: shellZ }} role="presentation">
        <div
          ref={dialogRef}
          className={styles.dialog}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <h2 id={titleId} className={styles.title}>
            {modal.title}
          </h2>
          <div className={styles.body}>{modal.body}</div>
          <div className={styles.actions}>
            {modal.cancelLabel !== undefined && (
              <button
                type="button"
                className={styles.buttonSecondary}
                onClick={() => {
                  modal.onCancel?.();
                  onClose();
                }}
              >
                {modal.cancelLabel}
              </button>
            )}
            {modal.confirmLabel !== undefined && (
              <button
                type="button"
                className={
                  modal.confirmLabel.toLowerCase().includes("delete")
                    ? styles.buttonDanger
                    : styles.buttonPrimary
                }
                onClick={() => {
                  void onConfirm?.();
                }}
              >
                {modal.confirmLabel}
              </button>
            )}
            {!hasActions && (
              <button type="button" className={styles.buttonSecondary} onClick={onClose}>
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
