"use client";

import styles from "./modal.module.css";
import type { ModalItem } from "./types";

type ModalOverlayProps = {
  modal: ModalItem;
  layer: number;
  onDismiss: () => void;
};

export function ModalOverlay({ modal, layer, onDismiss }: ModalOverlayProps) {
  const dim = Math.min(10, Math.max(0, modal.dim ?? 0));
  const opacity = dim / 10;
  const zIndex = 9500 + layer;

  return (
    <div className={styles.overlay} style={{ zIndex }}>
      {modal.dismissOnOutsidePress ? (
        <button
          type="button"
          className={styles.backdrop}
          style={{ opacity }}
          onClick={onDismiss}
          aria-label="Close modal"
        />
      ) : (
        <div className={styles.backdrop} style={{ opacity }} aria-hidden />
      )}
      <div className={styles.panel} role="dialog" aria-modal="true">
        {modal.contents}
      </div>
    </div>
  );
}
