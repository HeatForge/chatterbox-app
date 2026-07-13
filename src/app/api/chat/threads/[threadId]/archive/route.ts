import { NextResponse } from "next/server";

import { errorResponse } from "@/lib/services/api-errors";
import { archiveThread } from "@/lib/services/chat";
import { getRequiredUserId } from "@/lib/services/session";

type RouteContext = {
  params: Promise<{ threadId: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const userId = await getRequiredUserId(request.headers);
    const { threadId } = await params;
    return NextResponse.json(await archiveThread(userId, threadId));
  } catch (error) {
    return errorResponse(error);
  }
}
