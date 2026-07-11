import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createMistral } from "@ai-sdk/mistral";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import { nanoid } from "nanoid";

import {
  PROVIDER_CATALOG,
  type ProviderCatalogItem,
  type ProviderKey,
} from "@/lib/ai/provider-catalog";
import { type AiProvider, db } from "@/lib/db";
import { BadRequestError, NotFoundError } from "@/lib/services/api-errors";

export {
  PROVIDER_CATALOG,
  type ProviderKey,
  providerKeys,
} from "@/lib/ai/provider-catalog";

export const DEFAULT_SYSTEM_PROMPT =
  "You are a helpful AI assistant. Be concise, accurate, and friendly in your responses.";

export type ProviderSummary = {
  id: string;
  providerKey: ProviderKey;
  displayName: string;
  enabled: boolean;
  baseUrl: string | null;
  hasApiKey: boolean;
  modelCount: number;
  updatedAt: string;
};

export type ModelOption = {
  providerId: string;
  providerName: string;
  providerKey: ProviderKey;
  modelId: string;
  label: string;
};

type RemoteModel = {
  id: string;
  label: string;
};

function getCatalogItem(providerKey: string): ProviderCatalogItem {
  const catalogItem = PROVIDER_CATALOG.find((item) => item.key === providerKey);

  if (!catalogItem) {
    throw new BadRequestError("Unsupported provider");
  }

  return catalogItem;
}

function assertProviderKey(providerKey: string): ProviderKey {
  getCatalogItem(providerKey);
  return providerKey as ProviderKey;
}

function authHeaders(provider: AiProvider): HeadersInit {
  if (provider.provider_key === "anthropic") {
    return {
      "anthropic-version": "2023-06-01",
      "x-api-key": provider.api_key,
    };
  }

  return { Authorization: `Bearer ${provider.api_key}` };
}

function extractModels(payload: unknown, providerKey: string): RemoteModel[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const record = payload as Record<string, unknown>;
  const source = Array.isArray(record.data)
    ? record.data
    : Array.isArray(record.models)
      ? record.models
      : [];

  return source
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const model = item as Record<string, unknown>;
      const rawId = typeof model.id === "string" ? model.id : model.name;
      if (typeof rawId !== "string") {
        return null;
      }

      if (
        providerKey === "google" &&
        Array.isArray(model.supportedGenerationMethods) &&
        !model.supportedGenerationMethods.includes("generateContent")
      ) {
        return null;
      }

      const id = rawId.replace(/^models\//, "");
      const displayName =
        typeof model.display_name === "string"
          ? model.display_name
          : typeof model.displayName === "string"
            ? model.displayName
            : typeof model.name === "string" && providerKey !== "google"
              ? model.name
              : id;

      return { id, label: displayName };
    })
    .filter((model): model is RemoteModel => Boolean(model));
}

async function fetchModels(provider: AiProvider): Promise<RemoteModel[]> {
  const catalogItem = getCatalogItem(provider.provider_key);
  const endpoint = provider.base_url
    ? `${provider.base_url.replace(/\/$/, "")}/models`
    : catalogItem.modelEndpoint;

  if (!endpoint) {
    throw new BadRequestError("Provider does not expose a model endpoint");
  }

  const url =
    provider.provider_key === "google"
      ? `${endpoint}?key=${encodeURIComponent(provider.api_key)}`
      : endpoint;

  const response = await fetch(url, {
    headers:
      provider.provider_key === "google" ? undefined : authHeaders(provider),
  });

  if (!response.ok) {
    throw new BadRequestError(
      `Unable to fetch models from ${provider.display_name}: ${response.status}`,
    );
  }

  return extractModels(await response.json(), provider.provider_key);
}

function summarizeProvider(
  provider: AiProvider,
  modelCountByProvider: Map<string, number>,
): ProviderSummary {
  return {
    id: provider.id,
    providerKey: assertProviderKey(provider.provider_key),
    displayName: provider.display_name,
    enabled: provider.enabled,
    baseUrl: provider.base_url,
    hasApiKey: provider.api_key.length > 0,
    modelCount: modelCountByProvider.get(provider.id) ?? 0,
    updatedAt: provider.updated_at.toISOString(),
  };
}

export async function getUserSettings(userId: string) {
  const existing = await db
    .selectFrom("ai_user_settings")
    .selectAll()
    .where("user_id", "=", userId)
    .executeTakeFirst();

  if (existing) {
    return existing;
  }

  return db
    .insertInto("ai_user_settings")
    .values({ user_id: userId, system_prompt: DEFAULT_SYSTEM_PROMPT })
    .returningAll()
    .executeTakeFirstOrThrow();
}

async function listUserProviders(userId: string): Promise<AiProvider[]> {
  return db
    .selectFrom("ai_providers")
    .selectAll()
    .where("user_id", "=", userId)
    .orderBy("created_at", "asc")
    .execute();
}

type ProviderWithModels = {
  provider: AiProvider;
  models: RemoteModel[];
};

async function fetchProvidersWithModels(
  providers: AiProvider[],
): Promise<ProviderWithModels[]> {
  const results = await Promise.allSettled(
    providers.map(async (provider) => ({
      provider,
      models: await fetchModels(provider),
    })),
  );

  return results.flatMap((result) =>
    result.status === "fulfilled" ? [result.value] : [],
  );
}

function toModelOptions({
  provider,
  models,
}: ProviderWithModels): ModelOption[] {
  return models.map((model) => ({
    providerId: provider.id,
    providerName: provider.display_name,
    providerKey: assertProviderKey(provider.provider_key),
    modelId: model.id,
    label: model.label,
  }));
}

export async function listProviderSummaries(
  userId: string,
): Promise<ProviderSummary[]> {
  const providers = await listUserProviders(userId);
  const providersWithModels = await fetchProvidersWithModels(providers);
  const modelCountByProvider = new Map(
    providersWithModels.map(({ provider, models }) => [
      provider.id,
      models.length,
    ]),
  );

  return providers.map((provider) =>
    summarizeProvider(provider, modelCountByProvider),
  );
}

export async function listModelOptions(userId: string): Promise<ModelOption[]> {
  const providers = (await listUserProviders(userId)).filter(
    (provider) => provider.enabled,
  );
  const providersWithModels = await fetchProvidersWithModels(providers);

  return providersWithModels
    .flatMap(toModelOptions)
    .sort((left, right) => left.label.localeCompare(right.label));
}

export type AiSettingsConfig = {
  settings: {
    systemPrompt: string;
    preferredProviderId: string | null;
    preferredModelId: string | null;
  };
  providers: ProviderSummary[];
  models: ModelOption[];
};

export async function getAiSettingsConfig(
  userId: string,
): Promise<AiSettingsConfig> {
  const [settings, providers] = await Promise.all([
    getUserSettings(userId),
    listUserProviders(userId),
  ]);
  const providersWithModels = await fetchProvidersWithModels(providers);
  const modelCountByProvider = new Map(
    providersWithModels.map(({ provider, models }) => [
      provider.id,
      models.length,
    ]),
  );

  return {
    settings: {
      systemPrompt: settings.system_prompt,
      preferredProviderId: settings.preferred_provider_id,
      preferredModelId: settings.preferred_model_id,
    },
    providers: providers.map((provider) =>
      summarizeProvider(provider, modelCountByProvider),
    ),
    models: providersWithModels
      .filter(({ provider }) => provider.enabled)
      .flatMap(toModelOptions)
      .sort((left, right) => left.label.localeCompare(right.label)),
  };
}

export async function updateAiSettings(
  userId: string,
  input: {
    systemPrompt: string;
    preferredProviderId: string | null;
    preferredModelId: string | null;
  },
) {
  await getUserSettings(userId);

  if (input.preferredProviderId && input.preferredModelId) {
    const provider = await getUserProvider(userId, input.preferredProviderId);

    if (!provider.enabled) {
      throw new BadRequestError("Selected provider is disabled");
    }

    const models = await fetchModels(provider);
    if (!models.some((model) => model.id === input.preferredModelId)) {
      throw new BadRequestError("Selected model is not available");
    }
  }

  await db
    .updateTable("ai_user_settings")
    .set({
      system_prompt: input.systemPrompt,
      preferred_provider_id: input.preferredProviderId,
      preferred_model_id: input.preferredModelId,
      updated_at: new Date(),
    })
    .where("user_id", "=", userId)
    .execute();

  return getAiSettingsConfig(userId);
}

export async function addProvider(
  userId: string,
  input: {
    providerKey: ProviderKey;
    apiKey: string;
    displayName?: string;
    baseUrl?: string | null;
  },
): Promise<ProviderSummary> {
  const catalogItem = getCatalogItem(input.providerKey);
  const provider = await db
    .insertInto("ai_providers")
    .values({
      id: nanoid(),
      user_id: userId,
      provider_key: input.providerKey,
      display_name: input.displayName?.trim() || catalogItem.label,
      api_key: input.apiKey,
      base_url: input.baseUrl?.trim() || catalogItem.baseUrl || null,
      enabled: true,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return summarizeProvider(provider, new Map());
}

async function getUserProvider(
  userId: string,
  providerId: string,
): Promise<AiProvider> {
  const provider = await db
    .selectFrom("ai_providers")
    .selectAll()
    .where("user_id", "=", userId)
    .where("id", "=", providerId)
    .executeTakeFirst();

  if (!provider) {
    throw new NotFoundError("Provider not found");
  }

  return provider;
}

export async function updateProvider(
  userId: string,
  providerId: string,
  input: {
    displayName?: string;
    apiKey?: string;
    baseUrl?: string | null;
    enabled?: boolean;
  },
): Promise<ProviderSummary> {
  await getUserProvider(userId, providerId);

  const provider = await db
    .updateTable("ai_providers")
    .set({
      ...(input.displayName !== undefined
        ? { display_name: input.displayName }
        : {}),
      ...(input.apiKey !== undefined ? { api_key: input.apiKey } : {}),
      ...(input.baseUrl !== undefined ? { base_url: input.baseUrl } : {}),
      ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
      updated_at: new Date(),
    })
    .where("user_id", "=", userId)
    .where("id", "=", providerId)
    .returningAll()
    .executeTakeFirstOrThrow();

  const providersWithModels = await fetchProvidersWithModels([provider]);
  const modelCount = providersWithModels[0]?.models.length ?? 0;

  return summarizeProvider(provider, new Map([[providerId, modelCount]]));
}

export async function deleteProvider(userId: string, providerId: string) {
  await getUserProvider(userId, providerId);

  await db
    .deleteFrom("ai_providers")
    .where("user_id", "=", userId)
    .where("id", "=", providerId)
    .execute();
}

export async function getGenerationModel(
  userId: string,
  providerId: string,
  modelId: string,
): Promise<LanguageModel> {
  const provider = await getUserProvider(userId, providerId);

  if (!provider.enabled) {
    throw new BadRequestError("Selected provider is disabled");
  }

  switch (provider.provider_key) {
    case "anthropic":
      return createAnthropic({ apiKey: provider.api_key })(modelId);
    case "google":
      return createGoogleGenerativeAI({ apiKey: provider.api_key })(modelId);
    case "mistral":
      return createMistral({ apiKey: provider.api_key })(modelId);
    default: {
      const catalogItem = getCatalogItem(provider.provider_key);
      const baseURL = provider.base_url || catalogItem.baseUrl;
      const openaiProvider = createOpenAI({
        apiKey: provider.api_key,
        baseURL,
        name: provider.provider_key,
      });
      return catalogItem.openAiCompatible
        ? openaiProvider.chat(modelId)
        : openaiProvider(modelId);
    }
  }
}

export async function getPreferredModel(userId: string) {
  const settings = await getUserSettings(userId);

  if (!settings.preferred_provider_id || !settings.preferred_model_id) {
    throw new BadRequestError("Select a chat model in Settings first");
  }

  return {
    providerId: settings.preferred_provider_id,
    modelId: settings.preferred_model_id,
    systemPrompt: settings.system_prompt,
  };
}
