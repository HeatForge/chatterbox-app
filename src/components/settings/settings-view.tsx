"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/lib/button/Button";
import { IconNames } from "@/lib/IconNames";
import { Intent } from "@/lib/Intent";

import styles from "./settings.module.css";
import { Select } from "../lib/select/Select";

type SettingsCategory = "providers" | "user";

const CHAT_MODELS = [
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
  { value: "llama-3.1-70b", label: "Llama 3.1 70B" },
  { value: "mistral-large", label: "Mistral Large" },
  { value: "deepseek-chat", label: "DeepSeek Chat" },
] as const;

const DEFAULT_SYSTEM_PROMPT = `You are a helpful AI assistant. Be concise, accurate, and friendly in your responses.

When answering questions:
- Prefer clear explanations over jargon
- Ask clarifying questions when the request is ambiguous
- Admit uncertainty rather than guessing`;

const CATEGORIES: { id: SettingsCategory; label: string }[] = [
  { id: "providers", label: "Providers" },
  { id: "user", label: "User" },
];

export default function SettingsView() {
  const router = useRouter();
  const [category, setCategory] = useState<SettingsCategory>("providers");
  const [chatModel, setChatModel] = useState<string>(CHAT_MODELS[0].value);
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);

  return (
    <div className={styles.shell}>
      <nav className={styles.categorySidebar} aria-label="Settings categories">
        <h2 className={styles.categoryTitle}>Settings</h2>
        {CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={[
              styles.categoryButton,
              category === item.id ? styles.categoryButtonActive : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-current={category === item.id ? "page" : undefined}
            onClick={() => setCategory(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className={styles.main}>
        <header className={styles.header}>
          <Button
            text="Back to chat"
            leftIcon={IconNames["arrow-left-line"]}
            intent={Intent.TERTIARY}
            onClick={() => router.push("/chat")}
          />
        </header>

        <div className={styles.content}>
          {category === "providers" ? (
            <>
              <h1 className={styles.sectionTitle}>Providers</h1>

              <div className={styles.settingGroup}>
                <span className={styles.settingLabel}>Provider list</span>
                <p className={styles.settingHint}>
                  Configure API providers for chat and other features.
                </p>
                <div className={styles.providerList}>
                  <Button
                    text="Add provider"
                    leftIcon={IconNames["add-line"]}
                    intent={Intent.SECONDARY}
                  />
                </div>
              </div>

              <div className={styles.settingGroup}>
                <label className={styles.settingLabel} htmlFor="chat-model">
                  Chat model
                </label>
                <p className={styles.settingHint}>
                  Select the default model used for new conversations.
                </p>
                <Select options={CHAT_MODELS.map(model => ({value: model.value, label: model.label}))} value={chatModel} onChange={setChatModel} />
              </div>
            </>
          ) : (
            <>
              <h1 className={styles.sectionTitle}>User</h1>

              <div className={styles.settingGroup}>
                <label className={styles.settingLabel} htmlFor="system-prompt">
                  Default system prompt
                </label>
                <p className={styles.settingHint}>
                  Applied to new chats unless overridden per conversation.
                </p>
                <textarea
                  id="system-prompt"
                  className={styles.textarea}
                  value={systemPrompt}
                  onChange={(event) => setSystemPrompt(event.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
