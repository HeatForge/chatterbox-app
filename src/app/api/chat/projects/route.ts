import { NextResponse } from "next/server";
import { z } from "zod";

import { errorResponse } from "@/lib/services/api-errors";
import {
  createProject,
  listProjectsWithThreads,
} from "@/lib/services/projects";
import { getRequiredUserId } from "@/lib/services/session";

const createProjectSchema = z.object({
  title: z.string().min(1),
});

export async function GET(request: Request) {
  try {
    const userId = await getRequiredUserId(request.headers);
    return NextResponse.json(await listProjectsWithThreads(userId));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getRequiredUserId(request.headers);
    const body = createProjectSchema.parse(await request.json());
    return NextResponse.json(await createProject(userId, body.title), {
      status: 201,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
