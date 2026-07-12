import { NextResponse } from "next/server";
import { z } from "zod";

import { updateImageGenerationSettings } from "@/lib/services/ai-providers";
import { errorResponse } from "@/lib/services/api-errors";
import { getRequiredUserId } from "@/lib/services/session";

const imageGenerationSettingsSchema = z.object({
  preferredImageProviderId: z.string().nullable(),
  preferredImageModelId: z.string().nullable(),
});

export async function PUT(request: Request) {
  try {
    const userId = await getRequiredUserId(request.headers);
    const body = imageGenerationSettingsSchema.parse(await request.json());
    return NextResponse.json(await updateImageGenerationSettings(userId, body));
  } catch (error) {
    return errorResponse(error);
  }
}
