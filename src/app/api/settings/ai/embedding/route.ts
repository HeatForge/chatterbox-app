import { NextResponse } from "next/server";
import { z } from "zod";

import { updateEmbeddingSettings } from "@/lib/services/ai-providers";
import { errorResponse } from "@/lib/services/api-errors";
import { getRequiredUserId } from "@/lib/services/session";

const embeddingSettingsSchema = z.object({
  preferredEmbeddingProviderId: z.string().nullable(),
  preferredEmbeddingModelId: z.string().nullable(),
});

export async function PUT(request: Request) {
  try {
    const userId = await getRequiredUserId(request.headers);
    const body = embeddingSettingsSchema.parse(await request.json());
    return NextResponse.json(await updateEmbeddingSettings(userId, body));
  } catch (error) {
    return errorResponse(error);
  }
}
