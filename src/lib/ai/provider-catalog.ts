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
  "fal",
] as const;

export type ProviderKey = (typeof providerKeys)[number];

export type ProviderCatalogItem = {
  key: ProviderKey;
  label: string;
  baseUrl?: string;
  modelEndpoint?: string;
  apiKeyUrl?: string;
  openAiCompatible?: boolean;
  imageGeneration?: boolean;
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
  {
    key: "fal",
    label: "Fal.ai",
    apiKeyUrl: "https://fal.ai/dashboard/keys",
    imageGeneration: true,
  },
];
