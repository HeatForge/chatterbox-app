import { NextResponse } from "next/server";
import { z } from "zod";

import { errorResponse } from "@/lib/services/api-errors";
import { createMessage } from "@/lib/services/messages";
import { getRequiredUserId } from "@/lib/services/session";

const postSchema = z.object({
  message: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    await getRequiredUserId(request.headers);
    const body = postSchema.parse(await request.json());
    const message = await createMessage(body.message);
    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return errorResponse(error);
  }
}
