import { NextResponse } from "next/server";
import { z } from "zod";

import { createMessage } from "@/lib/services/messages";

const postSchema = z.object({
  message: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = postSchema.parse(await request.json());
    const message = await createMessage(body.message);
    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("db-post error:", error);
    return NextResponse.json(
      { error: "Failed to store message" },
      { status: 500 },
    );
  }
}
