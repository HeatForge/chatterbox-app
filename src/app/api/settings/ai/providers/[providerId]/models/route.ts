import { NextResponse } from "next/server";

import { errorResponse } from "@/lib/services/api-errors";
import { refreshProviderModels } from "@/lib/services/ai-providers";
import { getRequiredUserId } from "@/lib/services/session";

type RouteContext = {
  params: Promise<{ providerId: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const userId = await getRequiredUserId(request.headers);
    const { providerId } = await params;
    return NextResponse.json(await refreshProviderModels(userId, providerId));
  } catch (error) {
    return errorResponse(error);
  }
}
