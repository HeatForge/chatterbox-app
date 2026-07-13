import { NextResponse } from "next/server";
import { z } from "zod";

import { errorResponse } from "@/lib/services/api-errors";
import {
  deleteThread,
  getThreadPayload,
  updateThread,
} from "@/lib/services/chat";
import { getRequiredUserId } from "@/lib/services/session";

const threadUpdateSchema = z.object({
  title: z.string().min(1),
});

type RouteContext = {
  params: Promise<{ threadId: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const userId = await getRequiredUserId(request.headers);
    const { threadId } = await params;
    return NextResponse.json(await getThreadPayload(userId, threadId));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const userId = await getRequiredUserId(request.headers);
    const { threadId } = await params;
    const body = threadUpdateSchema.parse(await request.json());
    return NextResponse.json(
      await updateThread(userId, threadId, { title: body.title }),
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const userId = await getRequiredUserId(request.headers);
    const { threadId } = await params;
    await deleteThread(userId, threadId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
