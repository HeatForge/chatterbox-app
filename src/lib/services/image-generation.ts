import { createFalClient } from "@fal-ai/client";

import { getPreferredImageGenerationModel } from "@/lib/services/ai-providers";
import { BadRequestError } from "@/lib/services/api-errors";

type FalImage = {
  url?: unknown;
};

type FalImageResult = {
  images?: unknown;
  image?: unknown;
  url?: unknown;
};

function isFalImage(value: unknown): value is FalImage {
  return Boolean(value && typeof value === "object" && "url" in value);
}

function extractImageUrl(data: unknown): string {
  const result = data as FalImageResult;
  const candidates = [
    ...(Array.isArray(result.images) ? result.images : []),
    result.image,
    result,
  ];

  for (const candidate of candidates) {
    if (isFalImage(candidate) && typeof candidate.url === "string") {
      return candidate.url;
    }
  }

  if (typeof result.url === "string") {
    return result.url;
  }

  throw new Error("Fal.ai did not return an image URL");
}

function escapeMarkdownAltText(value: string): string {
  return value
    .replace(/[\\[\]]/g, "\\$&")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateImageFromPrompt(
  userId: string,
  prompt: string,
): Promise<string> {
  const trimmedPrompt = prompt.trim();
  if (!trimmedPrompt) {
    throw new BadRequestError("Prompt is required");
  }

  const imageModel = await getPreferredImageGenerationModel(userId);
  const fal = createFalClient({ credentials: imageModel.apiKey });
  const result = await fal.subscribe(imageModel.modelId, {
    input: {
      prompt: trimmedPrompt,
    },
  });
  const imageUrl = extractImageUrl(result.data);
  const altText = escapeMarkdownAltText(trimmedPrompt).slice(0, 160);

  return `![Generated image: ${altText}](${imageUrl})\n\n**Prompt:** ${trimmedPrompt}`;
}
