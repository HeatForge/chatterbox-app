import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createMistral } from "@ai-sdk/mistral";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import { nanoid } from "nanoid";

import { type AiProvider, db } from "@/lib/db";
import { BadRequestError, NotFoundError } from "@/lib/services/api-errors";

export const DEFAULT_SYSTEM_PROMPT =
  "You are a helpful AI assistant. Be concise, accurate, and friendly in your responses.";

export const providerKeys = [
  "openai",
  "google",
  "anthropic",
  "openrouter",
  "mistral",
  "groq",
  "xai",
  "deepseek",
  "perplexity",
  "together",
  "cerebras",
] as const;

export type ProviderKey = (typeof providerKeys)[number];

type ProviderCatalogItem = {
  key: ProviderKey;
  label: string;
  baseUrl?: string;
  modelEndpoint?: string;
  apiKeyUrl?: string;
  openAiCompatible?: boolean;
};

export const PROVIDER_CATALOG: ProviderCatalogItem[] = [
  {
    key: "openai",
    label: "OpenAI",
    modelEndpoint: "https://api.openai.com/v1/models",
    apiKeyUrl: "https://platform.openai.com/api-keys",
  },
  {
    key: "google",
    label: "Google Gemini",
    modelEndpoint: "https://generativelanguage.googleapis.com/v1beta/models",
    apiKeyUrl: "https://aistudio.google.com/app/apikey",
  },
  {
    key: "anthropic",
    label: "Anthropic",
    modelEndpoint: "https://api.anthropic.com/v1/models",
    apiKeyUrl: "https://console.anthropic.com/settings/keys",
  },
  {
    key: "openrouter",
    label: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    modelEndpoint: "https://openrouter.ai/api/v1/models",
    apiKeyUrl: "https://openrouter.ai/settings/keys",
    openAiCompatible: true,
  },
  {
    key: "mistral",
    label: "Mistral",
    modelEndpoint: "https://api.mistral.ai/v1/models",
    apiKeyUrl: "https://console.mistral.ai/api-keys",
  },
  {
    key: "groq",
    label: "Groq",
    baseUrl: "https://api.groq.com/openai/v1",
    modelEndpoint: "https://api.groq.com/openai/v1/models",
    apiKeyUrl: "https://console.groq.com/keys",
    openAiCompatible: true,
  },
  {
    key: "xai",
    label: "xAI",
    baseUrl: "https://api.x.ai/v1",
    modelEndpoint: "https://api.x.ai/v1/models",
    apiKeyUrl: "https://console.x.ai",
    openAiCompatible: true,
  },
  {
    key: "deepseek",
    label: "DeepSeek",
    baseUrl: "https://api.deepseek.com",
    modelEndpoint: "https://api.deepseek.com/models",
    apiKeyUrl: "https://platform.deepseek.com/api_keys",
    openAiCompatible: true,
  },
  {
    key: "perplexity",
    label: "Perplexity",
    baseUrl: "https://api.perplexity.ai",
    modelEndpoint: "https://api.perplexity.ai/models",
    apiKeyUrl: "https://www.perplexity.ai/settings/api",
    openAiCompatible: true,
  },
  {
    key: "together",
    label: "Together AI",
    baseUrl: "https://api.together.xyz/v1",
    modelEndpoint: "https://api.together.xyz/v1/models",
    apiKeyUrl: "https://api.together.xyz/settings/api-keys",
    openAiCompatible: true,
  },
  {
    key: "cerebras",
    label: "Cerebras",
    baseUrl: "https://api.cerebras.ai/v1",
    modelEndpoint: "https://api.cerebras.ai/v1/models",
    apiKeyUrl: "https://cloud.cerebras.ai/platform",
    openAiCompatible: true,
  },
];

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

export async function listProviderSummaries(
  userId: string,
): Promise<ProviderSummary[]> {
  const providers = await db
    .selectFrom("ai_providers")
    .selectAll()
    .where("user_id", "=", userId)
    .orderBy("created_at", "asc")
    .execute();

  const models = await db
    .selectFrom("ai_provider_models")
    .innerJoin(
      "ai_providers",
      "ai_providers.id",
      "ai_provider_models.provider_id",
    )
    .select(["ai_provider_models.provider_id"])
    .where("ai_providers.user_id", "=", userId)
    .execute();

  const modelCountByProvider = new Map<string, number>();
  for (const model of models) {
    modelCountByProvider.set(
      model.provider_id,
      (modelCountByProvider.get(model.provider_id) ?? 0) + 1,
    );
  }

  return providers.map((provider) =>
    summarizeProvider(provider, modelCountByProvider),
  );
}

export async function listModelOptions(userId: string): Promise<ModelOption[]> {
  const rows = await db
    .selectFrom("ai_provider_models")
    .innerJoin(
      "ai_providers",
      "ai_providers.id",
      "ai_provider_models.provider_id",
    )
    .select([
      "ai_provider_models.provider_id",
      "ai_provider_models.model_id",
      "ai_provider_models.display_name",
      "ai_providers.provider_key",
      "ai_providers.display_name as provider_name",
    ])
    .where("ai_providers.user_id", "=", userId)
    .where("ai_providers.enabled", "=", true)
    .orderBy("ai_providers.display_name", "asc")
    .orderBy("ai_provider_models.display_name", "asc")
    .execute();

  return rows.map((row) => ({
    providerId: row.provider_id,
    providerName: row.provider_name,
    providerKey: assertProviderKey(row.provider_key),
    modelId: row.model_id,
    label: row.display_name,
  }));
}

export async function getAiSettingsPayload(userId: string) {
  const [settings, providers, models] = await Promise.all([
    getUserSettings(userId),
    listProviderSummaries(userId),
    listModelOptions(userId),
  ]);

  return {
    catalog: PROVIDER_CATALOG,
    settings: {
      systemPrompt: settings.system_prompt,
      preferredProviderId: settings.preferred_provider_id,
      preferredModelId: settings.preferred_model_id,
    },
    providers,
    models,
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
    const model = await db
      .selectFrom("ai_provider_models")
      .innerJoin(
        "ai_providers",
        "ai_providers.id",
        "ai_provider_models.provider_id",
      )
      .select("ai_provider_models.model_id")
      .where("ai_providers.user_id", "=", userId)
      .where("ai_providers.enabled", "=", true)
      .where("ai_provider_models.provider_id", "=", input.preferredProviderId)
      .where("ai_provider_models.model_id", "=", input.preferredModelId)
      .executeTakeFirst();

    if (!model) {
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

  return getAiSettingsPayload(userId);
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

  const models = await db
    .selectFrom("ai_provider_models")
    .select("provider_id")
    .where("provider_id", "=", providerId)
    .execute();

  return summarizeProvider(provider, new Map([[providerId, models.length]]));
}

export async function deleteProvider(userId: string, providerId: string) {
  await getUserProvider(userId, providerId);

  await db
    .deleteFrom("ai_providers")
    .where("user_id", "=", userId)
    .where("id", "=", providerId)
    .execute();
}

export async function refreshProviderModels(
  userId: string,
  providerId: string,
): Promise<ModelOption[]> {
  const provider = await getUserProvider(userId, providerId);
  const models = await fetchModels(provider);

  await db.transaction().execute(async (trx) => {
    await trx
      .deleteFrom("ai_provider_models")
      .where("provider_id", "=", providerId)
      .execute();

    if (models.length === 0) {
      return;
    }

    await trx
      .insertInto("ai_provider_models")
      .values(
        models.map((model) => ({
          provider_id: providerId,
          model_id: model.id,
          display_name: model.label,
        })),
      )
      .execute();
  });

  return listModelOptions(userId);
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
