import { createFalClient } from "@fal-ai/client";

import type { ImageGenerationModelId } from "@/lib/image-generation-models";

export type GeneratedImage = {
  url: string;
  width?: number;
  height?: number;
  contentType?: string;
};

export type GenerateImageInput = {
  prompt: string;
  modelId: ImageGenerationModelId;
};

export type GenerateImageResult = {
  modelId: ImageGenerationModelId;
  prompt: string;
  images: GeneratedImage[];
  requestId?: string;
};

type FalImage = {
  url?: unknown;
  width?: unknown;
  height?: unknown;
  content_type?: unknown;
  contentType?: unknown;
};

type FalImageResponse = {
  images?: FalImage[];
};

function getFalKey(): string | undefined {
  return process.env.FAL_KEY;
}

function shouldUseMockImages(): boolean {
  return process.env.FAL_IMAGE_GENERATION_MOCK === "1";
}

function createMockImage(prompt: string): GeneratedImage {
  const escapedPrompt = prompt
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#7c3aed"/><stop offset="1" stop-color="#06b6d4"/></linearGradient></defs><rect width="1024" height="1024" rx="96" fill="url(#g)"/><circle cx="780" cy="224" r="116" fill="rgba(255,255,255,0.28)"/><circle cx="232" cy="744" r="164" fill="rgba(255,255,255,0.2)"/><text x="96" y="504" fill="white" font-family="Arial, sans-serif" font-size="48" font-weight="700">Mock fal.ai image</text><foreignObject x="96" y="552" width="832" height="260"><div xmlns="http://www.w3.org/1999/xhtml" style="color:white;font-family:Arial,sans-serif;font-size:32px;line-height:1.35">${escapedPrompt}</div></foreignObject></svg>`;

  return {
    url: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
    width: 1024,
    height: 1024,
    contentType: "image/svg+xml",
  };
}

function normalizeFalImages(data: FalImageResponse): GeneratedImage[] {
  return (data.images ?? [])
    .map((image) => {
      if (typeof image.url !== "string") {
        return undefined;
      }

      const normalizedImage: GeneratedImage = {
        url: image.url,
      };

      if (typeof image.width === "number") {
        normalizedImage.width = image.width;
      }
      if (typeof image.height === "number") {
        normalizedImage.height = image.height;
      }
      if (typeof image.content_type === "string") {
        normalizedImage.contentType = image.content_type;
      } else if (typeof image.contentType === "string") {
        normalizedImage.contentType = image.contentType;
      }

      return normalizedImage;
    })
    .filter((image): image is GeneratedImage => Boolean(image));
}

export async function generateImage({
  prompt,
  modelId,
}: GenerateImageInput): Promise<GenerateImageResult> {
  if (shouldUseMockImages()) {
    return {
      modelId,
      prompt,
      images: [createMockImage(prompt)],
      requestId: "mock",
    };
  }

  const falKey = getFalKey();
  if (!falKey) {
    throw new Error("FAL_KEY is required to generate images.");
  }

  const fal = createFalClient({
    credentials: falKey,
  });

  const result = await fal.subscribe(modelId, {
    input: {
      prompt,
      image_size: "square_hd",
    },
    pollInterval: 3000,
  });
  const images = normalizeFalImages(result.data as FalImageResponse);

  if (images.length === 0) {
    throw new Error("fal.ai did not return any images.");
  }

  return {
    modelId,
    prompt,
    images,
    requestId: result.requestId,
  };
}
