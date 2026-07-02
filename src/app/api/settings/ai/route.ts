import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getAiSettingsConfig,
  updateAiSettings,
} from "@/lib/services/ai-providers";
import { errorResponse } from "@/lib/services/api-errors";
import { getRequiredUserId } from "@/lib/services/session";

const settingsSchema = z.object({
  systemPrompt: z.string().min(1),
  preferredProviderId: z.string().nullable(),
  preferredModelId: z.string().nullable(),
});

export async function GET(request: Request) {
  try {
    const userId = await getRequiredUserId(request.headers);
    return NextResponse.json(await getAiSettingsConfig(userId));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getRequiredUserId(request.headers);
    const body = settingsSchema.parse(await request.json());
    return NextResponse.json(await updateAiSettings(userId, body));
  } catch (error) {
    return errorResponse(error);
  }
}
