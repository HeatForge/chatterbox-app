import { NextResponse } from "next/server";
import { z } from "zod";

import { errorResponse } from "@/lib/services/api-errors";
import { createThread } from "@/lib/services/chat";
import { getProject } from "@/lib/services/projects";
import { getRequiredUserId } from "@/lib/services/session";

const createThreadSchema = z.object({
  firstMessage: z.string().optional(),
});

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const userId = await getRequiredUserId(request.headers);
    const { projectId } = await context.params;
    await getProject(userId, projectId);
    const body = createThreadSchema.parse(await request.json());
    return NextResponse.json(
      await createThread(userId, {
        firstMessage: body.firstMessage,
        projectId,
      }),
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
