import type { ProviderKey } from "@/lib/ai/provider-catalog";

export type ImageModelCatalogItem = {
  providerKey: ProviderKey;
  modelId: string;
  label: string;
};

export const FAL_IMAGE_MODELS: ImageModelCatalogItem[] = [
  {
    providerKey: "fal",
    modelId: "fal-ai/flux-1/schnell",
    label: "FLUX.1 Schnell",
  },
  {
    providerKey: "fal",
    modelId: "fal-ai/flux-1/dev",
    label: "FLUX.1 Dev",
  },
  {
    providerKey: "fal",
    modelId: "fal-ai/flux-2/flash",
    label: "FLUX 2 Flash",
  },
  {
    providerKey: "fal",
    modelId: "fal-ai/flux-2",
    label: "FLUX 2",
  },
  {
    providerKey: "fal",
    modelId: "fal-ai/flux-2-pro",
    label: "FLUX 2 Pro",
  },
];
