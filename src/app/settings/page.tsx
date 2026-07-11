"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/lib/button/Button";
import { Select } from "@/components/lib/select/Select";
import { ToastPlacement } from "@/hooks/use-toaster/types";
import { useToaster } from "@/hooks/use-toaster/use-toaster";
import { PROVIDER_CATALOG } from "@/lib/ai/provider-catalog";
import { IconNames } from "@/lib/IconNames";
import { Intent } from "@/lib/Intent";
import type { AiSettingsConfig } from "@/lib/services/ai-providers";

import styles from "./settings.module.css";

type SettingsCategory = "providers" | "user";

const CATEGORIES: { id: SettingsCategory; label: string }[] = [
  { id: "providers", label: "Providers" },
  { id: "user", label: "User" },
];

type ProviderSummary = {
  id: string;
  providerKey: string;
  displayName: string;
  enabled: boolean;
  baseUrl: string | null;
  hasApiKey: boolean;
  modelCount: number;
};

type ModelOption = AiSettingsConfig["models"][number];

function getModelValue(model: Pick<ModelOption, "providerId" | "modelId">) {
  return `${model.providerId}:${model.modelId}`;
}

function parseModelValue(value: string) {
  const [providerId, ...modelParts] = value.split(":");
  return {
    providerId: providerId || null,
    modelId: modelParts.join(":") || null,
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const showToast = useToaster();
  const [category, setCategory] = useState<SettingsCategory>("providers");
  const [config, setConfig] = useState<AiSettingsConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [providerKey, setProviderKey] = useState<string>(
    PROVIDER_CATALOG[0]?.key ?? "",
  );
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [busyAction, setBusyAction] = useState<string | null>(null);

  async function loadSettings(): Promise<void> {
    const response = await fetch("/api/settings/ai");
    if (!response.ok) {
      throw new Error("Failed to load AI settings");
    }

    const data = (await response.json()) as AiSettingsConfig;
    setConfig(data);
    setSystemPrompt(data.settings.systemPrompt);
    setSelectedModel(
      data.settings.preferredProviderId && data.settings.preferredModelId
        ? getModelValue({
            providerId: data.settings.preferredProviderId,
            modelId: data.settings.preferredModelId,
          })
        : "",
    );
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: load settings once on mount
  useEffect(() => {
    void loadSettings()
      .catch(() => {
        showToast({
          title: "Settings unavailable",
          description: "Could not load AI provider settings.",
          intent: Intent.DANGER,
          placement: ToastPlacement.BOTTOM_RIGHT,
        });
      })
      .finally(() => {
        setConfigLoading(false);
      });
  }, [showToast]);

  const modelOptions = useMemo(() => {
    if (!config) {
      return [];
    }

    return config.models.map((model) => ({
      value: getModelValue(model),
      label: `${model.label} (${model.providerName})`,
    }));
  }, [config]);

  async function runAction(action: string, task: () => Promise<void>) {
    setBusyAction(action);
    try {
      await task();
    } catch (error) {
      showToast({
        title: "Action failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
        intent: Intent.DANGER,
        placement: ToastPlacement.BOTTOM_RIGHT,
      });
    } finally {
      setBusyAction(null);
    }
  }

  async function addProvider(): Promise<void> {
    await runAction("add-provider", async () => {
      const response = await fetch("/api/settings/ai/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerKey,
          apiKey,
          baseUrl: baseUrl.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Provider could not be added");
      }

      setApiKey("");
      setBaseUrl("");
      await loadSettings();
    });
  }

  async function updateProvider(
    providerId: string,
    body: Partial<Pick<ProviderSummary, "enabled">>,
  ): Promise<void> {
    await runAction(`provider-${providerId}`, async () => {
      const response = await fetch(`/api/settings/ai/providers/${providerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Provider could not be updated");
      }

      await loadSettings();
    });
  }

  async function deleteProvider(providerId: string): Promise<void> {
    await runAction(`delete-${providerId}`, async () => {
      const response = await fetch(`/api/settings/ai/providers/${providerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Provider could not be deleted");
      }

      await loadSettings();
    });
  }

  async function saveSettings(): Promise<void> {
    await runAction("save-settings", async () => {
      const model = parseModelValue(selectedModel);
      const response = await fetch("/api/settings/ai", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt,
          preferredProviderId: model.providerId,
          preferredModelId: model.modelId,
        }),
      });

      if (!response.ok) {
        throw new Error("Settings could not be saved");
      }

      await loadSettings();
      showToast({
        title: "Settings saved",
        description: "Your default chat model and system prompt were updated.",
        intent: Intent.SUCCESS,
        placement: ToastPlacement.BOTTOM_RIGHT,
      });
    });
  }

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
                <span className={styles.settingLabel}>Add provider</span>
                <p className={styles.settingHint}>
                  Store your own API key. Models are fetched from the provider
                  when you open settings.
                </p>
                <div className={styles.formGrid}>
                  <Select
                    options={PROVIDER_CATALOG.map((item) => ({
                      value: item.key,
                      label: item.label,
                    }))}
                    value={providerKey}
                    onChange={setProviderKey}
                  />
                  <input
                    className={styles.input}
                    type="password"
                    value={apiKey}
                    placeholder="Provider API key"
                    onChange={(event) => setApiKey(event.target.value)}
                  />
                  <input
                    className={styles.input}
                    type="url"
                    value={baseUrl}
                    placeholder="Custom base URL (optional)"
                    onChange={(event) => setBaseUrl(event.target.value)}
                  />
                  <Button
                    text="Add provider"
                    leftIcon={IconNames["add-line"]}
                    intent={Intent.SECONDARY}
                    disabled={!apiKey.trim() || busyAction === "add-provider"}
                    onClick={() => void addProvider()}
                  />
                </div>
              </div>

              <div className={styles.settingGroup}>
                <span className={styles.settingLabel}>Provider list</span>
                <p className={styles.settingHint}>
                  Enabled providers populate the chat model dropdown.
                </p>
                <div className={styles.providerList}>
                  {configLoading ? (
                    <p className={styles.sectionLoading}>Loading providers…</p>
                  ) : config?.providers.length === 0 ? (
                    <p className={styles.emptyState}>No providers added yet.</p>
                  ) : (
                    config?.providers.map((provider) => (
                      <div className={styles.providerCard} key={provider.id}>
                        <div>
                          <strong>{provider.displayName}</strong>
                          <p className={styles.settingHint}>
                            {provider.modelCount}{" "}
                            {provider.modelCount === 1 ? "model" : "models"}{" "}
                            available
                            {provider.baseUrl ? ` · ${provider.baseUrl}` : ""}
                          </p>
                        </div>
                        <div className={styles.providerActions}>
                          <Button
                            text={provider.enabled ? "Enabled" : "Disabled"}
                            intent={
                              provider.enabled
                                ? Intent.SUCCESS
                                : Intent.TERTIARY
                            }
                            disabled={busyAction === `provider-${provider.id}`}
                            onClick={() =>
                              void updateProvider(provider.id, {
                                enabled: !provider.enabled,
                              })
                            }
                          />
                          <Button
                            text="Remove"
                            intent={Intent.DANGER}
                            disabled={busyAction === `delete-${provider.id}`}
                            onClick={() => void deleteProvider(provider.id)}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className={styles.settingGroup}>
                <label className={styles.settingLabel} htmlFor="chat-model">
                  Chat model
                </label>
                <p className={styles.settingHint}>
                  Select the default model used for new conversations.
                </p>
                {configLoading ? (
                  <p className={styles.sectionLoading}>Loading models…</p>
                ) : (
                  <Select
                    id="chat-model"
                    options={modelOptions}
                    value={selectedModel}
                    onChange={setSelectedModel}
                    searchable
                    emptyMessage="Add and enable a provider to load models."
                  />
                )}
                <Button
                  text="Save model"
                  intent={Intent.PRIMARY}
                  disabled={
                    configLoading ||
                    !selectedModel ||
                    busyAction === "save-settings"
                  }
                  onClick={() => void saveSettings()}
                />
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
                {configLoading ? (
                  <p className={styles.sectionLoading}>Loading prompt…</p>
                ) : (
                  <textarea
                    id="system-prompt"
                    className={styles.textarea}
                    value={systemPrompt}
                    onChange={(event) => setSystemPrompt(event.target.value)}
                  />
                )}
                <Button
                  text="Save prompt"
                  intent={Intent.PRIMARY}
                  disabled={
                    configLoading ||
                    !systemPrompt.trim() ||
                    busyAction === "save-settings"
                  }
                  onClick={() => void saveSettings()}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
