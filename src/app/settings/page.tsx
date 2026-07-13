"use client";

import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ModelCombobox } from "@/components/settings/model-combobox";
import { useSettingsInitialData } from "@/components/settings/SettingsInitialDataProvider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { PROVIDER_CATALOG } from "@/lib/ai/provider-catalog";
import {
  flushAppCachePersistence,
  getCachedSettings,
  setCachedSettings,
} from "@/lib/cache/app-cache";
import { Intent } from "@/lib/Intent";
import { intentVariants } from "@/lib/intent-variants";
import type { AiSettingsConfig } from "@/lib/services/ai-providers";
import { showIntentToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

type SettingsCategory = "providers" | "user";

type ProviderSummary = {
  id: string;
  providerKey: string;
  displayName: string;
  enabled: boolean;
  baseUrl: string | null;
  hasApiKey: boolean;
  modelCount: number;
};

function getModelValue(
  model: Pick<AiSettingsConfig["models"][number], "providerId" | "modelId">,
) {
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
  const initialSettings = useSettingsInitialData();
  const cachedSettings = getCachedSettings();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [category, setCategory] = useState<SettingsCategory>("providers");
  const [config, setConfig] = useState<AiSettingsConfig | null>(
    cachedSettings ?? initialSettings,
  );
  const [configLoading, setConfigLoading] = useState(
    !cachedSettings && !initialSettings,
  );
  const [providerKey, setProviderKey] = useState<string>(
    PROVIDER_CATALOG[0]?.key ?? "",
  );
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedEmbeddingModel, setSelectedEmbeddingModel] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const tertiaryIntent = intentVariants(Intent.TERTIARY);
  const successIntent = intentVariants(Intent.SUCCESS);

  async function loadSettings(): Promise<void> {
    const response = await fetch("/api/settings/ai");
    if (!response.ok) {
      throw new Error("Failed to load AI settings");
    }

    await applySettingsResponse(response);
  }

  useEffect(() => {
    if (initialSettings && !cachedSettings) {
      setSystemPrompt(initialSettings.settings.systemPrompt);
      setSelectedModel(
        initialSettings.settings.preferredProviderId &&
          initialSettings.settings.preferredModelId
          ? getModelValue({
              providerId: initialSettings.settings.preferredProviderId,
              modelId: initialSettings.settings.preferredModelId,
            })
          : "",
      );
      setSelectedEmbeddingModel(
        initialSettings.settings.preferredEmbeddingProviderId &&
          initialSettings.settings.preferredEmbeddingModelId
          ? getModelValue({
              providerId: initialSettings.settings.preferredEmbeddingProviderId,
              modelId: initialSettings.settings.preferredEmbeddingModelId,
            })
          : "",
      );
    }
  }, [cachedSettings, initialSettings]);

  /**
   * Applies an authoritative settings response to both page state and the
   * shared session cache, avoiding a second full settings/model reload.
   */
  async function applySettingsResponse(response: Response): Promise<void> {
    const data = (await response.json()) as AiSettingsConfig;
    setConfig(data);
    setCachedSettings(data);
    setSystemPrompt(data.settings.systemPrompt);
    setSelectedModel(
      data.settings.preferredProviderId && data.settings.preferredModelId
        ? getModelValue({
            providerId: data.settings.preferredProviderId,
            modelId: data.settings.preferredModelId,
          })
        : "",
    );
    setSelectedEmbeddingModel(
      data.settings.preferredEmbeddingProviderId &&
        data.settings.preferredEmbeddingModelId
        ? getModelValue({
            providerId: data.settings.preferredEmbeddingProviderId,
            modelId: data.settings.preferredEmbeddingModelId,
          })
        : "",
    );
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: load settings once on mount
  useEffect(() => {
    void loadSettings()
      .catch(() => {
        showIntentToast({
          title: "Settings unavailable",
          description: "Could not load AI provider settings.",
          intent: Intent.DANGER,
        });
      })
      .finally(() => {
        setConfigLoading(false);
      });
  }, []);

  async function runAction(action: string, task: () => Promise<void>) {
    setBusyAction(action);
    try {
      await task();
    } catch (error) {
      showIntentToast({
        title: "Action failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
        intent: Intent.DANGER,
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
      await applySettingsResponse(response);
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

      await applySettingsResponse(response);
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

      await applySettingsResponse(response);
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

      await applySettingsResponse(response);
      showIntentToast({
        title: "Settings saved",
        description: "Your default chat model and system prompt were updated.",
        intent: Intent.SUCCESS,
      });
    });
  }

  async function saveEmbeddingSettings(): Promise<void> {
    await runAction("save-embedding-settings", async () => {
      const model = parseModelValue(selectedEmbeddingModel);
      const response = await fetch("/api/settings/ai/embedding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredEmbeddingProviderId: model.providerId,
          preferredEmbeddingModelId: model.modelId,
        }),
      });

      if (!response.ok) {
        throw new Error("Embedding settings could not be saved");
      }

      await applySettingsResponse(response);
      showIntentToast({
        title: "Embedding model saved",
        description: "Your default embedding model was updated.",
        intent: Intent.SUCCESS,
      });
    });
  }

  return (
    <Tabs
      value={category}
      onValueChange={(value) => setCategory(value as SettingsCategory)}
      orientation={isMobile ? "horizontal" : "vertical"}
      className={cn(
        "flex h-dvh w-full overflow-hidden",
        isMobile ? "flex-col" : "flex-row",
      )}
    >
      <div
        className={cn(
          "shrink-0 bg-sidebar",
          isMobile
            ? "border-b border-border"
            : "h-full w-56 border-r border-border",
        )}
      >
        <div
          className={cn(
            "flex gap-1 p-3",
            isMobile ? "flex-row items-center overflow-x-auto" : "flex-col",
          )}
        >
          {!isMobile ? (
            <p className="mb-1 px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Settings
            </p>
          ) : null}
          <TabsList
            variant="line"
            className={cn(
              "h-auto bg-transparent p-0",
              isMobile ? "w-max min-w-full" : "w-full flex-col items-stretch",
            )}
          >
            <TabsTrigger value="providers" className="justify-start">
              Providers
            </TabsTrigger>
            <TabsTrigger value="user" className="justify-start">
              User
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 p-3 md:p-6">
        <header
          className={cn(
            "flex shrink-0 items-center",
            isMobile ? "justify-start" : "justify-end",
          )}
        >
          <Button
            type="button"
            variant={tertiaryIntent.buttonVariant}
            className={tertiaryIntent.className}
            onClick={() => router.push("/chat")}
            onMouseDown={flushAppCachePersistence}
          >
            <ArrowLeft data-icon="inline-start" />
            Back to chat
          </Button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <TabsContent value="providers" className="mx-auto w-full max-w-3xl">
            <FieldGroup>
              <div>
                <h1 className="text-xl font-semibold">Providers</h1>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Add provider</CardTitle>
                  <CardDescription>
                    Store your own API key. Models are fetched from the provider
                    when you open settings.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldGroup className="gap-4">
                    <div className="grid gap-3 md:grid-cols-[minmax(10rem,14rem)_1fr] md:items-end">
                      <Field>
                        <FieldLabel htmlFor="provider-key">Provider</FieldLabel>
                        <Select
                          value={providerKey}
                          onValueChange={(value) => {
                            if (value) {
                              setProviderKey(value);
                            }
                          }}
                        >
                          <SelectTrigger id="provider-key" className="w-full">
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                          <SelectContent>
                            {PROVIDER_CATALOG.map((item) => (
                              <SelectItem key={item.key} value={item.key}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field className="md:col-span-2">
                        <FieldLabel htmlFor="provider-api-key">
                          API key
                        </FieldLabel>
                        <Input
                          id="provider-api-key"
                          type="password"
                          value={apiKey}
                          placeholder="Provider API key"
                          onChange={(event) => setApiKey(event.target.value)}
                        />
                      </Field>
                      <Field className="md:col-span-2">
                        <FieldLabel htmlFor="provider-base-url">
                          Base URL
                        </FieldLabel>
                        <Input
                          id="provider-base-url"
                          type="url"
                          value={baseUrl}
                          placeholder="Custom base URL (optional)"
                          onChange={(event) => setBaseUrl(event.target.value)}
                        />
                      </Field>
                    </div>
                  </FieldGroup>
                </CardContent>
                <CardFooter>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={!apiKey.trim() || busyAction === "add-provider"}
                    onClick={() => void addProvider()}
                  >
                    {busyAction === "add-provider" ? (
                      <Loader2
                        className="animate-spin"
                        data-icon="inline-start"
                      />
                    ) : (
                      <Plus data-icon="inline-start" />
                    )}
                    Add provider
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Provider list</CardTitle>
                  <CardDescription>
                    Enabled providers populate the chat model dropdown.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {configLoading ? (
                    <div className="flex flex-col gap-3">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : config?.providers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No providers added yet.
                    </p>
                  ) : (
                    config?.providers.map((provider) => (
                      <Card key={provider.id} size="sm">
                        <CardContent className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="font-medium">
                              {provider.displayName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {provider.modelCount}{" "}
                              {provider.modelCount === 1 ? "model" : "models"}{" "}
                              available
                              {provider.baseUrl ? ` · ${provider.baseUrl}` : ""}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2 sm:justify-end">
                            <Button
                              type="button"
                              variant={
                                provider.enabled
                                  ? successIntent.buttonVariant
                                  : tertiaryIntent.buttonVariant
                              }
                              className={
                                provider.enabled
                                  ? successIntent.className
                                  : tertiaryIntent.className
                              }
                              disabled={
                                busyAction === `provider-${provider.id}`
                              }
                              onClick={() =>
                                void updateProvider(provider.id, {
                                  enabled: !provider.enabled,
                                })
                              }
                            >
                              {busyAction === `provider-${provider.id}` ? (
                                <Loader2
                                  className="animate-spin"
                                  data-icon="inline-start"
                                />
                              ) : null}
                              {provider.enabled ? "Enabled" : "Disabled"}
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              disabled={busyAction === `delete-${provider.id}`}
                              onClick={() => void deleteProvider(provider.id)}
                            >
                              {busyAction === `delete-${provider.id}` ? (
                                <Loader2
                                  className="animate-spin"
                                  data-icon="inline-start"
                                />
                              ) : (
                                <Trash2 data-icon="inline-start" />
                              )}
                              Remove
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Chat model</CardTitle>
                  <CardDescription>
                    Select the default model used for new conversations.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Field>
                    <FieldLabel htmlFor="chat-model">Model</FieldLabel>
                    {configLoading ? (
                      <Skeleton className="h-8 w-full" />
                    ) : (
                      <ModelCombobox
                        id="chat-model"
                        value={selectedModel}
                        onChange={setSelectedModel}
                        models={config?.models ?? []}
                        emptyMessage="Add and enable a provider to load models."
                      />
                    )}
                  </Field>
                </CardContent>
                <CardFooter>
                  <Button
                    type="button"
                    disabled={
                      configLoading ||
                      !selectedModel ||
                      busyAction === "save-settings"
                    }
                    onClick={() => void saveSettings()}
                  >
                    {busyAction === "save-settings" ? (
                      <Loader2
                        className="animate-spin"
                        data-icon="inline-start"
                      />
                    ) : null}
                    Save model
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Embedding model</CardTitle>
                  <CardDescription>
                    Required for project chats. Only 1536-dimension embedding
                    models are supported in this version.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Field>
                    <FieldLabel htmlFor="embedding-model">Model</FieldLabel>
                    {configLoading ? (
                      <Skeleton className="h-8 w-full" />
                    ) : (
                      <ModelCombobox
                        id="embedding-model"
                        value={selectedEmbeddingModel}
                        onChange={setSelectedEmbeddingModel}
                        models={config?.embeddingModels ?? []}
                        emptyMessage="Add and enable a provider with embedding models."
                      />
                    )}
                  </Field>
                </CardContent>
                <CardFooter>
                  <Button
                    type="button"
                    disabled={
                      configLoading ||
                      !selectedEmbeddingModel ||
                      busyAction === "save-embedding-settings"
                    }
                    onClick={() => void saveEmbeddingSettings()}
                  >
                    {busyAction === "save-embedding-settings" ? (
                      <Loader2
                        className="animate-spin"
                        data-icon="inline-start"
                      />
                    ) : null}
                    Save embedding model
                  </Button>
                </CardFooter>
              </Card>
            </FieldGroup>
          </TabsContent>

          <TabsContent value="user" className="mx-auto w-full max-w-3xl">
            <FieldGroup>
              <div>
                <h1 className="text-xl font-semibold">User</h1>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Default system prompt</CardTitle>
                  <CardDescription>
                    Applied to new chats unless overridden per conversation.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Field>
                    <FieldLabel htmlFor="system-prompt">Prompt</FieldLabel>
                    {configLoading ? (
                      <Skeleton className="min-h-48 w-full" />
                    ) : (
                      <Textarea
                        id="system-prompt"
                        className="min-h-48 font-mono text-xs"
                        value={systemPrompt}
                        onChange={(event) =>
                          setSystemPrompt(event.target.value)
                        }
                      />
                    )}
                  </Field>
                </CardContent>
                <CardFooter>
                  <Button
                    type="button"
                    disabled={
                      configLoading ||
                      !systemPrompt.trim() ||
                      busyAction === "save-settings"
                    }
                    onClick={() => void saveSettings()}
                  >
                    {busyAction === "save-settings" ? (
                      <Loader2
                        className="animate-spin"
                        data-icon="inline-start"
                      />
                    ) : null}
                    Save prompt
                  </Button>
                </CardFooter>
              </Card>
            </FieldGroup>
          </TabsContent>
        </div>
      </div>
    </Tabs>
  );
}
