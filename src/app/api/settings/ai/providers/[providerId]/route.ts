import { NextResponse } from "next/server";
import { z } from "zod";

import { errorResponse } from "@/lib/services/api-errors";
import { deleteProvider, updateProvider } from "@/lib/services/ai-providers";
import { getRequiredUserId } from "@/lib/services/session";

const providerUpdateSchema = z.object({
  displayName: z.string().min(1).optional(),
  apiKey: z.string().min(1).optional(),
  baseUrl: z.string().url().nullable().optional(),
  enabled: z.boolean().optional(),
});

type RouteContext = {
  params: Promise<{ providerId: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const userId = await getRequiredUserId(request.headers);
    const { providerId } = await params;
    const body = providerUpdateSchema.parse(await request.json());
    return NextResponse.json(await updateProvider(userId, providerId, body));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const userId = await getRequiredUserId(request.headers);
    const { providerId } = await params;
    await deleteProvider(userId, providerId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
