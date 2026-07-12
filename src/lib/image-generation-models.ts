export const IMAGE_GENERATION_MODELS = [
  {
    id: "fal-ai/flux/schnell",
    label: "FLUX Schnell",
    description: "Fast image generation for quick drafts.",
  },
  {
    id: "fal-ai/flux/dev",
    label: "FLUX Dev",
    description: "Higher quality FLUX generation.",
  },
] as const;

export type ImageGenerationModelId =
  (typeof IMAGE_GENERATION_MODELS)[number]["id"];

export const IMAGE_GENERATION_MODEL_IDS = IMAGE_GENERATION_MODELS.map(
  (model) => model.id,
) as [ImageGenerationModelId, ...ImageGenerationModelId[]];

export const DEFAULT_IMAGE_GENERATION_MODEL_ID: ImageGenerationModelId =
  IMAGE_GENERATION_MODELS[0].id;
