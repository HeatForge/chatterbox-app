import { NextResponse } from "next/server";
import { z } from "zod";

import { errorResponse } from "@/lib/services/api-errors";
import { sendMessage } from "@/lib/services/chat";
import { getRequiredUserId } from "@/lib/services/session";

const messageSchema = z.object({
  content: z.string().min(1),
});

type RouteContext = {
  params: Promise<{ threadId: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const userId = await getRequiredUserId(request.headers);
    const { threadId } = await params;
    const body = messageSchema.parse(await request.json());
    return NextResponse.json(
      await sendMessage(userId, { threadId, content: body.content }),
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
