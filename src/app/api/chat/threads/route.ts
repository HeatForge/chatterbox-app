import { NextResponse } from "next/server";
import { z } from "zod";

import { errorResponse } from "@/lib/services/api-errors";
import {
  createThread,
  listSidebarThreads,
  listThreadPayloads,
  listThreads,
} from "@/lib/services/chat";
import { getRequiredUserId } from "@/lib/services/session";

const createThreadSchema = z.object({
  firstMessage: z.string().optional(),
  projectId: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const userId = await getRequiredUserId(request.headers);
    const url = new URL(request.url);

    if (url.searchParams.get("view") === "sidebar") {
      return NextResponse.json(await listSidebarThreads(userId));
    }

    const includeMessages = url.searchParams.get("full") === "true";

    if (includeMessages) {
      return NextResponse.json(await listThreadPayloads(userId));
    }

    return NextResponse.json(await listThreads(userId));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getRequiredUserId(request.headers);
    const body = createThreadSchema.parse(await request.json());
    return NextResponse.json(
      await createThread(userId, {
        firstMessage: body.firstMessage,
        projectId: body.projectId,
      }),
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
