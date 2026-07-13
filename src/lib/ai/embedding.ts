import { embed, embedMany } from "ai";

import {
  getEmbeddingModel,
  getPreferredEmbeddingModel,
} from "@/lib/services/ai-providers";

export function chunkText(input: string): string[] {
  return input
    .trim()
    .split(/(?<=[.!?])\s+/)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0);
}

export async function embedText(
  userId: string,
  value: string,
): Promise<number[]> {
  const preferred = await getPreferredEmbeddingModel(userId);
  const model = await getEmbeddingModel(
    userId,
    preferred.providerId,
    preferred.modelId,
  );
  const normalized = value.replaceAll("\n", " ");
  const { embedding } = await embed({ model, value: normalized });
  return embedding;
}

export async function embedTexts(
  userId: string,
  values: string[],
): Promise<number[][]> {
  if (values.length === 0) {
    return [];
  }

  const preferred = await getPreferredEmbeddingModel(userId);
  const model = await getEmbeddingModel(
    userId,
    preferred.providerId,
    preferred.modelId,
  );
  const { embeddings } = await embedMany({
    model,
    values: values.map((value) => value.replaceAll("\n", " ")),
  });
  return embeddings;
}
