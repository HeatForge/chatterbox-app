"use client";

import { Icon } from "@iconify/react";
import {
  type FormEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { ToastPlacement } from "@/hooks/use-toaster/types";
import { useToaster } from "@/hooks/use-toaster/use-toaster";
import { IconNames } from "@/lib/IconNames";
import { Intent } from "@/lib/Intent";
import type { ImageGenerationModelId } from "@/lib/image-generation-models";

import styles from "./chat-input.module.css";
import { ChatInputState } from "./enums";

export { ChatInputState } from "./enums";

export type ChatInputProps = {
  state?: ChatInputState;
  placeholder?: string;
  onSubmit: (message: string) => void;
  onGenerateImage?: (prompt: string) => void;
  imageModels?: readonly {
    id: ImageGenerationModelId;
    label: string;
    description: string;
  }[];
  selectedImageModelId?: ImageGenerationModelId;
  onImageModelChange?: (modelId: ImageGenerationModelId) => void;
  className?: string;
};

type ToolbarAction = {
  id: "attachments" | "tools" | "settings";
  label: string;
  icon: (typeof IconNames)[keyof typeof IconNames];
};

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  {
    id: "attachments",
    label: "Attachments",
    icon: IconNames["attachment-line"],
  },
  {
    id: "tools",
    label: "Tools",
    icon: IconNames["tool-line"],
  },
  {
    id: "settings",
    label: "Chat settings",
    icon: IconNames["settings-3-line"],
  },
];

function LoadingDots() {
  return (
    <span className={styles.loadingDots} aria-hidden>
      <span className={styles.loadingDot} />
      <span className={styles.loadingDot} />
      <span className={styles.loadingDot} />
    </span>
  );
}

export function ChatInput({
  state = ChatInputState.READY,
  placeholder = "Message…",
  onSubmit,
  onGenerateImage,
  imageModels = [],
  selectedImageModelId,
  onImageModelChange,
  className,
}: ChatInputProps) {
  const showToast = useToaster();
  const [value, setValue] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [shake, setShake] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previousStateRef = useRef(state);

  const isInputDisabled = state === ChatInputState.WAITING;
  const isSubmitDisabled =
    state === ChatInputState.WAITING ||
    state === ChatInputState.STREAMING ||
    state === ChatInputState.ERROR ||
    value.trim().length === 0;
  const showLoadingDots = state === ChatInputState.WAITING;
  const isSubmitMuted = state === ChatInputState.STREAMING;
  const selectedImageModel =
    imageModels.find((model) => model.id === selectedImageModelId) ??
    imageModels[0];
  const isImageGenerateDisabled =
    !onGenerateImage ||
    state !== ChatInputState.READY ||
    value.trim().length === 0;

  useEffect(() => {
    if (
      previousStateRef.current !== ChatInputState.ERROR &&
      state === ChatInputState.ERROR
    ) {
      setShake(true);
    }

    previousStateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!shake) {
      return;
    }

    const timer = window.setTimeout(() => setShake(false), 450);
    return () => window.clearTimeout(timer);
  }, [shake]);

  const adjustTextareaHeight = useCallback(
    (textarea?: HTMLTextAreaElement | null) => {
      const element = textarea ?? textareaRef.current;
      if (!element) {
        return;
      }

      element.style.height = "auto";
      element.style.height = `${Math.min(element.scrollHeight, 160)}px`;
    },
    [],
  );

  function submitMessage(): void {
    const trimmed = value.trim();
    if (!trimmed || isSubmitDisabled) {
      return;
    }

    onSubmit(trimmed);
    setValue("");
    requestAnimationFrame(() => adjustTextareaHeight());
  }

  function submitImagePrompt(): void {
    const trimmed = value.trim();
    if (!trimmed || isImageGenerateDisabled || !onGenerateImage) {
      return;
    }

    onGenerateImage(trimmed);
    setValue("");
    requestAnimationFrame(() => adjustTextareaHeight());
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    submitMessage();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key !== "Enter" || event.shiftKey || isInputDisabled) {
      return;
    }

    event.preventDefault();
    submitMessage();
  }

  function handleToolbarClick(action: ToolbarAction): void {
    if (action.id === "settings") {
      setShowSettings((current) => !current);
      return;
    }

    showToast({
      title: "Not implemented",
      description: `${action.label} will be available in a future update.`,
      intent: Intent.INFO,
      placement: ToastPlacement.BOTTOM_RIGHT,
      duration: 3500,
    });
  }

  function handleImageModelChange(modelId: string): void {
    onImageModelChange?.(modelId as ImageGenerationModelId);
  }

  return (
    <form
      className={[styles.root, className].filter(Boolean).join(" ")}
      onSubmit={handleSubmit}
    >
      <div
        className={styles.inputBox}
        data-state={state}
        data-shake={shake || undefined}
      >
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            adjustTextareaHeight(event.target);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isInputDisabled}
          rows={1}
          aria-label="Chat message"
        />

        <button
          type="button"
          className={styles.generateImageButton}
          disabled={isImageGenerateDisabled}
          onClick={submitImagePrompt}
          aria-label={
            selectedImageModel
              ? `Generate image with ${selectedImageModel.label}`
              : "Generate image"
          }
          title={
            selectedImageModel
              ? `Generate image with ${selectedImageModel.label}`
              : "Generate image"
          }
        >
          <Icon
            className={styles.submitIcon}
            icon={IconNames["pic-ai-line"]}
            width={20}
            height={20}
            aria-hidden
          />
        </button>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitDisabled}
          data-muted={isSubmitMuted || undefined}
          aria-label={showLoadingDots ? "Waiting for response" : "Send message"}
        >
          {showLoadingDots ? (
            <LoadingDots />
          ) : (
            <Icon
              className={styles.submitIcon}
              icon={IconNames["arrow-right-line"]}
              width={20}
              height={20}
              aria-hidden
            />
          )}
        </button>
      </div>

      {showSettings && imageModels.length > 0 ? (
        <div className={styles.settingsPanel}>
          <label className={styles.settingsField}>
            <span className={styles.settingsLabel}>Image model</span>
            <select
              className={styles.settingsSelect}
              value={selectedImageModel?.id}
              onChange={(event) => handleImageModelChange(event.target.value)}
            >
              {imageModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.label}
                </option>
              ))}
            </select>
          </label>
          {selectedImageModel ? (
            <p className={styles.settingsDescription}>
              {selectedImageModel.description}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className={styles.toolbar}>
        {TOOLBAR_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            className={styles.toolbarButton}
            onClick={() => handleToolbarClick(action)}
            aria-label={action.label}
          >
            <Icon
              className={styles.toolbarIcon}
              icon={action.icon}
              width={18}
              height={18}
              aria-hidden
            />
          </button>
        ))}
      </div>
    </form>
  );
}
