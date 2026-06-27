import { NextResponse } from "next/server";
import { z } from "zod";

import { errorResponse } from "@/lib/services/api-errors";
import { sendMessage } from "@/lib/services/chat";
import { getRequiredUserId } from "@/lib/services/session";

const messageSchema = z.object({
  content: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const userId = await getRequiredUserId(request.headers);
    const body = messageSchema.parse(await request.json());
    return NextResponse.json(
      await sendMessage(userId, { content: body.content }),
      {
        status: 201,
      },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
