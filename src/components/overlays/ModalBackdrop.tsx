import styles from "./ModalBackdrop.module.css";

interface ModalBackdropProps {
  zIndex: number | string;
  onClick?: () => void;
}

export function ModalBackdrop({ zIndex, onClick }: ModalBackdropProps) {
  return (
    <div
      className={styles.backdrop}
      style={{ zIndex }}
      onClick={onClick}
      aria-hidden
    />
  );
}
