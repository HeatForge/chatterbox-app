"use client";

import { useState } from "react";

import { Button } from "@/components/lib/button/Button";
import { Intent } from "@/lib/Intent";

import styles from "./thread-action-modals.module.css";

type RenameModalContentProps = {
  initialTitle: string;
  entityLabel: string;
  onConfirm: (title: string) => void;
  onCancel: () => void;
};

export function RenameModalContent({
  initialTitle,
  entityLabel,
  onConfirm,
  onCancel,
}: RenameModalContentProps) {
  const [title, setTitle] = useState(initialTitle);

  function handleSubmit(event: React.FormEvent): void {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }
    onConfirm(trimmed);
  }

  return (
    <form className={styles.panel} onSubmit={handleSubmit}>
      <h2 className={styles.title}>Rename {entityLabel}</h2>
      <label className={styles.label}>
        Title
        <input
          className={styles.input}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>
      <div className={styles.actions}>
        <Button text="Cancel" intent={Intent.TERTIARY} onClick={onCancel} />
        <Button text="Save" intent={Intent.PRIMARY} type="submit" />
      </div>
    </form>
  );
}

type ConfirmDeleteModalContentProps = {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDeleteModalContent({
  message,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalContentProps) {
  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>Confirm delete</h2>
      <p className={styles.message}>{message}</p>
      <div className={styles.actions}>
        <Button text="Cancel" intent={Intent.TERTIARY} onClick={onCancel} />
        <Button text="Delete" intent={Intent.DANGER} onClick={onConfirm} />
      </div>
    </div>
  );
}
