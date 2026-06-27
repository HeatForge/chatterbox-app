import { NextResponse } from "next/server";
import { z } from "zod";
import { addProvider, providerKeys } from "@/lib/services/ai-providers";
import { errorResponse } from "@/lib/services/api-errors";
import { getRequiredUserId } from "@/lib/services/session";

const providerSchema = z.object({
  providerKey: z.enum(providerKeys),
  displayName: z.string().min(1).optional(),
  apiKey: z.string().min(1),
  baseUrl: z.string().url().nullable().optional(),
});

export async function POST(request: Request) {
  try {
    const userId = await getRequiredUserId(request.headers);
    const body = providerSchema.parse(await request.json());
    const provider = await addProvider(userId, body);
    return NextResponse.json(provider, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
