import { nanoid } from "nanoid";

import { type ChatThread, db } from "@/lib/db";
import { BadRequestError, NotFoundError } from "@/lib/services/api-errors";

export type ProjectThreadSummary = {
  id: string;
  title: string;
  modelId: string;
  projectId: string;
  providerId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectWithThreads = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  threads: ProjectThreadSummary[];
};

export type StandaloneThreadSummary = {
  id: string;
  title: string;
  modelId: string;
  projectId: null;
  providerId: string | null;
  createdAt: string;
  updatedAt: string;
};

function toProjectThreadSummary(thread: ChatThread): ProjectThreadSummary {
  return {
    id: thread.id,
    title: thread.title,
    modelId: thread.model_id,
    projectId: thread.project_id ?? "",
    providerId: thread.provider_id,
    createdAt: thread.created_at.toISOString(),
    updatedAt: thread.updated_at.toISOString(),
  };
}

function toStandaloneThreadSummary(
  thread: ChatThread,
): StandaloneThreadSummary {
  return {
    id: thread.id,
    title: thread.title,
    modelId: thread.model_id,
    projectId: null,
    providerId: thread.provider_id,
    createdAt: thread.created_at.toISOString(),
    updatedAt: thread.updated_at.toISOString(),
  };
}

export async function getProject(userId: string, projectId: string) {
  const project = await db
    .selectFrom("projects")
    .selectAll()
    .where("user_id", "=", userId)
    .where("id", "=", projectId)
    .executeTakeFirst();

  if (!project) {
    throw new NotFoundError("Project not found");
  }

  return project;
}

export async function listProjectsWithThreads(
  userId: string,
): Promise<ProjectWithThreads[]> {
  const projects = await db
    .selectFrom("projects")
    .selectAll()
    .where("user_id", "=", userId)
    .orderBy("updated_at", "desc")
    .execute();

  if (projects.length === 0) {
    return [];
  }

  const projectIds = projects.map((project) => project.id);
  const threads = await db
    .selectFrom("chat_threads")
    .selectAll()
    .where("user_id", "=", userId)
    .where("project_id", "in", projectIds)
    .orderBy("updated_at", "desc")
    .execute();

  const threadsByProject = new Map<string, ChatThread[]>();
  for (const thread of threads) {
    if (!thread.project_id) {
      continue;
    }

    const projectThreads = threadsByProject.get(thread.project_id) ?? [];
    projectThreads.push(thread);
    threadsByProject.set(thread.project_id, projectThreads);
  }

  return projects.map((project) => ({
    id: project.id,
    title: project.title,
    createdAt: project.created_at.toISOString(),
    updatedAt: project.updated_at.toISOString(),
    threads: (threadsByProject.get(project.id) ?? []).map(
      toProjectThreadSummary,
    ),
  }));
}

export async function listStandaloneThreads(
  userId: string,
): Promise<StandaloneThreadSummary[]> {
  const threads = await db
    .selectFrom("chat_threads")
    .selectAll()
    .where("user_id", "=", userId)
    .where("project_id", "is", null)
    .orderBy("updated_at", "desc")
    .execute();

  return threads.map(toStandaloneThreadSummary);
}

export async function listSidebarThreads(userId: string) {
  const [projects, standalone] = await Promise.all([
    listProjectsWithThreads(userId),
    listStandaloneThreads(userId),
  ]);

  return { projects, standalone };
}

export async function createProject(userId: string, title: string) {
  const normalizedTitle = title.trim();
  if (!normalizedTitle) {
    throw new BadRequestError("Project title is required");
  }

  const project = await db
    .insertInto("projects")
    .values({
      id: nanoid(),
      user_id: userId,
      title: normalizedTitle,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return {
    id: project.id,
    title: project.title,
    createdAt: project.created_at.toISOString(),
    updatedAt: project.updated_at.toISOString(),
    threads: [],
  };
}
