import { NextResponse } from "next/server";
import { z } from "zod";

import { errorResponse } from "@/lib/services/api-errors";
import { deleteProject, updateProject } from "@/lib/services/projects";
import { getRequiredUserId } from "@/lib/services/session";

const projectUpdateSchema = z.object({
  title: z.string().min(1),
});

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const userId = await getRequiredUserId(request.headers);
    const { projectId } = await params;
    const body = projectUpdateSchema.parse(await request.json());
    return NextResponse.json(
      await updateProject(userId, projectId, { title: body.title }),
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const userId = await getRequiredUserId(request.headers);
    const { projectId } = await params;
    await deleteProject(userId, projectId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
