import { NextResponse } from "next/server";

import { errorResponse } from "@/lib/services/api-errors";
import { getAllMessages } from "@/lib/services/messages";
import { getRequiredUserId } from "@/lib/services/session";

export async function GET(request: Request) {
  try {
    await getRequiredUserId(request.headers);
    const messages = await getAllMessages();
    return NextResponse.json(messages);
  } catch (error) {
    return errorResponse(error);
  }
}
