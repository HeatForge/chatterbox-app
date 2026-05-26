import { type FormEvent } from "react";

import { AppIcon, Icon } from "~/components/primitives/Icon";

import styles from "./ChatInput.module.css";

export interface ChatInputProps {
  onSend?: (text: string) => void;
  disabled?: boolean;
}

/** Minimal composer primitive; uses Icon for send/attach actions. */
export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const field = form.elements.namedItem("message") as HTMLTextAreaElement | null;
    const text = field?.value.trim() ?? "";
    if (!text || disabled) return;
    onSend?.(text);
    if (field) field.value = "";
  };

  return (
    <form className={styles.root} onSubmit={handleSubmit}>
      <button
        type="button"
        className={styles.iconButton}
        disabled={disabled}
        aria-label="Attach file"
      >
        <Icon name={AppIcon.Attach} size="md" />
      </button>
      <textarea
        name="message"
        className={styles.input}
        placeholder="Message…"
        rows={1}
        disabled={disabled}
        aria-label="Message"
      />
      <button
        type="submit"
        className={styles.iconButton}
        disabled={disabled}
        aria-label="Send message"
      >
        <Icon name={AppIcon.Send} size="md" />
      </button>
    </form>
  );
}
