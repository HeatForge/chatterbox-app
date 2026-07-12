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

type SidebarMode = "active" | "archived";

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
    .where("deleted_at", "is", null)
    .executeTakeFirst();

  if (!project) {
    throw new NotFoundError("Project not found");
  }

  return project;
}

async function listProjectsWithThreadsByMode(
  userId: string,
  mode: SidebarMode,
): Promise<ProjectWithThreads[]> {
  let projectsQuery = db
    .selectFrom("projects")
    .selectAll()
    .where("user_id", "=", userId)
    .where("deleted_at", "is", null);

  projectsQuery =
    mode === "active"
      ? projectsQuery.where("archived_at", "is", null)
      : projectsQuery.where("archived_at", "is not", null);

  const projects = await projectsQuery.orderBy("updated_at", "desc").execute();

  if (projects.length === 0) {
    return [];
  }

  const projectIds = projects.map((project) => project.id);
  let threadsQuery = db
    .selectFrom("chat_threads")
    .selectAll()
    .where("user_id", "=", userId)
    .where("project_id", "in", projectIds)
    .where("deleted_at", "is", null);

  if (mode === "active") {
    threadsQuery = threadsQuery.where("archived_at", "is", null);
  }

  const threads = await threadsQuery.orderBy("updated_at", "desc").execute();

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

async function listStandaloneThreadsByMode(
  userId: string,
  mode: SidebarMode,
): Promise<StandaloneThreadSummary[]> {
  let query = db
    .selectFrom("chat_threads")
    .selectAll()
    .where("user_id", "=", userId)
    .where("project_id", "is", null)
    .where("deleted_at", "is", null);

  query =
    mode === "active"
      ? query.where("archived_at", "is", null)
      : query.where("archived_at", "is not", null);

  const threads = await query.orderBy("updated_at", "desc").execute();
  return threads.map(toStandaloneThreadSummary);
}

export async function listProjectsWithThreads(
  userId: string,
): Promise<ProjectWithThreads[]> {
  return listProjectsWithThreadsByMode(userId, "active");
}

export async function listStandaloneThreads(
  userId: string,
): Promise<StandaloneThreadSummary[]> {
  return listStandaloneThreadsByMode(userId, "active");
}

export async function listArchivedSidebarThreads(userId: string) {
  const [projects, standalone] = await Promise.all([
    listProjectsWithThreadsByMode(userId, "archived"),
    listStandaloneThreadsByMode(userId, "archived"),
  ]);

  return { projects, standalone };
}

/**
 * Reads every sidebar entity in two ordered queries, then partitions active
 * and archived groups in memory. This replaces the previous six-query fan-out
 * while preserving the public sidebar response shape.
 */
export async function listSidebarThreads(userId: string) {
  const [projects, threads] = await Promise.all([
    db
      .selectFrom("projects")
      .selectAll()
      .where("user_id", "=", userId)
      .where("deleted_at", "is", null)
      .orderBy("updated_at", "desc")
      .execute(),
    db
      .selectFrom("chat_threads")
      .selectAll()
      .where("user_id", "=", userId)
      .where("deleted_at", "is", null)
      .orderBy("updated_at", "desc")
      .execute(),
  ]);

  const projectThreads = new Map<string, ChatThread[]>();
  const activeStandalone: StandaloneThreadSummary[] = [];
  const archivedStandalone: StandaloneThreadSummary[] = [];

  for (const thread of threads) {
    if (thread.project_id) {
      const grouped = projectThreads.get(thread.project_id) ?? [];
      grouped.push(thread);
      projectThreads.set(thread.project_id, grouped);
      continue;
    }

    if (thread.archived_at) {
      archivedStandalone.push(toStandaloneThreadSummary(thread));
    } else {
      activeStandalone.push(toStandaloneThreadSummary(thread));
    }
  }

  const toProject = (
    project: (typeof projects)[number],
  ): ProjectWithThreads => ({
    id: project.id,
    title: project.title,
    createdAt: project.created_at.toISOString(),
    updatedAt: project.updated_at.toISOString(),
    threads: (projectThreads.get(project.id) ?? [])
      .filter((thread) => project.archived_at || !thread.archived_at)
      .map(toProjectThreadSummary),
  });

  const activeProjects = projects
    .filter((project) => !project.archived_at)
    .map(toProject);
  const archivedProjects = projects
    .filter((project) => project.archived_at)
    .map(toProject);

  return {
    projects: activeProjects,
    standalone: activeStandalone,
    archived: {
      projects: archivedProjects,
      standalone: archivedStandalone,
    },
  };
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

export async function updateProject(
  userId: string,
  projectId: string,
  input: { title: string },
) {
  const normalizedTitle = input.title.trim();
  if (!normalizedTitle) {
    throw new BadRequestError("Project title is required");
  }

  await getProject(userId, projectId);

  const project = await db
    .updateTable("projects")
    .set({ title: normalizedTitle, updated_at: new Date() })
    .where("user_id", "=", userId)
    .where("id", "=", projectId)
    .where("deleted_at", "is", null)
    .returningAll()
    .executeTakeFirstOrThrow();

  return {
    id: project.id,
    title: project.title,
    createdAt: project.created_at.toISOString(),
    updatedAt: project.updated_at.toISOString(),
  };
}

export async function archiveProject(userId: string, projectId: string) {
  const project = await getProject(userId, projectId);

  if (project.archived_at) {
    throw new BadRequestError("Project is already archived");
  }

  const updated = await db
    .updateTable("projects")
    .set({ archived_at: new Date(), updated_at: new Date() })
    .where("id", "=", projectId)
    .where("user_id", "=", userId)
    .returningAll()
    .executeTakeFirstOrThrow();

  return {
    id: updated.id,
    title: updated.title,
    createdAt: updated.created_at.toISOString(),
    updatedAt: updated.updated_at.toISOString(),
  };
}

export async function unarchiveProject(userId: string, projectId: string) {
  const project = await db
    .selectFrom("projects")
    .selectAll()
    .where("user_id", "=", userId)
    .where("id", "=", projectId)
    .where("deleted_at", "is", null)
    .executeTakeFirst();

  if (!project) {
    throw new NotFoundError("Project not found");
  }

  if (!project.archived_at) {
    throw new BadRequestError("Project is not archived");
  }

  const updated = await db
    .updateTable("projects")
    .set({ archived_at: null, updated_at: new Date() })
    .where("id", "=", projectId)
    .returningAll()
    .executeTakeFirstOrThrow();

  return {
    id: updated.id,
    title: updated.title,
    createdAt: updated.created_at.toISOString(),
    updatedAt: updated.updated_at.toISOString(),
  };
}

export async function deleteProject(userId: string, projectId: string) {
  await getProject(userId, projectId);
  const now = new Date();

  await db.transaction().execute(async (trx) => {
    await trx
      .updateTable("chat_threads")
      .set({ deleted_at: now, updated_at: now })
      .where("project_id", "=", projectId)
      .where("user_id", "=", userId)
      .where("deleted_at", "is", null)
      .execute();

    await trx
      .updateTable("projects")
      .set({ deleted_at: now, updated_at: now })
      .where("id", "=", projectId)
      .where("user_id", "=", userId)
      .execute();
  });
}
