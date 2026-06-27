import { NextResponse } from "next/server";
import { z } from "zod";

import { errorResponse } from "@/lib/services/api-errors";
import { createThread, listThreads } from "@/lib/services/chat";
import { getRequiredUserId } from "@/lib/services/session";

const createThreadSchema = z.object({
  firstMessage: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const userId = await getRequiredUserId(request.headers);
    return NextResponse.json(await listThreads(userId));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getRequiredUserId(request.headers);
    const body = createThreadSchema.parse(await request.json());
    return NextResponse.json(await createThread(userId, body.firstMessage), {
      status: 201,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
