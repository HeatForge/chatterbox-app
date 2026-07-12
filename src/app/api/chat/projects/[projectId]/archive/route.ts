import { NextResponse } from "next/server";

import { errorResponse } from "@/lib/services/api-errors";
import { archiveProject } from "@/lib/services/projects";
import { getRequiredUserId } from "@/lib/services/session";

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const userId = await getRequiredUserId(request.headers);
    const { projectId } = await params;
    return NextResponse.json(await archiveProject(userId, projectId));
  } catch (error) {
    return errorResponse(error);
  }
}
