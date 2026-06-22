import { type FormEvent, useState } from "react";
import Icon from "../../primitive/Icon";

interface ChatComposerProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function ChatComposer({ onSend, disabled = false }: ChatComposerProps) {
  const [draft, setDraft] = useState("");

  function submitMessage() {
    const trimmed = draft.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setDraft("");
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submitMessage();
  }

  return (
    <form className="chat-composer" onSubmit={handleSubmit}>
      <div className="chat-composer__surface">
        <textarea
          className="chat-composer__input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Message Chatterbox…"
          rows={3}
          disabled={disabled}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submitMessage();
            }
          }}
        />
      </div>
      <div className="chat-composer__grip" aria-hidden>
        <button type="button" className="chat-composer__attach">
          <Icon name="attachment-line" aria-hidden />
          <span>Attach File</span>
        </button>
      </div>
    </form>
  );
}
