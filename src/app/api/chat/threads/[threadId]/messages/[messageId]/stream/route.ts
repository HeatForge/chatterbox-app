import { errorResponse } from "@/lib/services/api-errors";
import { createAssistantMessageStream } from "@/lib/services/chat";
import { getRequiredUserId } from "@/lib/services/session";

type RouteContext = {
  params: Promise<{ threadId: string; messageId: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const userId = await getRequiredUserId(request.headers);
    const { threadId, messageId } = await params;
    const stream = await createAssistantMessageStream(
      userId,
      threadId,
      messageId,
      request.signal,
    );

    return new Response(stream, {
      headers: {
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Content-Type": "text/event-stream",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
