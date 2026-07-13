import { sql } from "kysely";
import { nanoid } from "nanoid";

import { chunkText, embedText, embedTexts } from "@/lib/ai/embedding";
import { db } from "@/lib/db";

const SIMILARITY_THRESHOLD = 0;
const DEFAULT_LIMIT = 4;

export type ProjectContextChunk = {
  content: string;
  similarity: number;
};

function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

export async function indexMessage(
  userId: string,
  input: {
    projectId: string;
    threadId: string;
    messageId: string;
    content: string;
  },
): Promise<void> {
  void userId;

  const chunks = chunkText(input.content);
  if (chunks.length === 0) {
    return;
  }

  const embeddings = await embedTexts(userId, chunks);

  for (const [index, chunk] of chunks.entries()) {
    const embedding = embeddings[index];
    if (!embedding) {
      continue;
    }

    await sql`
      INSERT INTO project_embeddings (id, project_id, thread_id, message_id, content, embedding)
      VALUES (
        ${nanoid()},
        ${input.projectId},
        ${input.threadId},
        ${input.messageId},
        ${chunk},
        ${toVectorLiteral(embedding)}::vector
      )
    `.execute(db);
  }
}

export async function findRelevantProjectContext(
  userId: string,
  input: {
    projectId: string;
    query: string;
    excludeThreadId: string;
    limit?: number;
  },
): Promise<ProjectContextChunk[]> {
  void userId;

  const queryEmbedding = await embedText(userId, input.query);
  const vectorLiteral = toVectorLiteral(queryEmbedding);
  const limit = input.limit ?? DEFAULT_LIMIT;

  const results = await sql<{
    content: string;
    similarity: number;
  }>`
    SELECT pe.content, 1 - (pe.embedding <=> ${vectorLiteral}::vector) AS similarity
    FROM project_embeddings pe
    INNER JOIN chat_threads ct ON ct.id = pe.thread_id
    WHERE pe.project_id = ${input.projectId}
      AND pe.thread_id <> ${input.excludeThreadId}
      AND ct.deleted_at IS NULL
    ORDER BY pe.embedding <=> ${vectorLiteral}::vector
    LIMIT ${limit}
  `.execute(db);

  return results.rows.filter((row) => row.similarity >= SIMILARITY_THRESHOLD);
}
