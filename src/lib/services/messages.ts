import { nanoid } from "nanoid";

import { db, type Message } from "@/lib/db";

export async function createMessage(content: string): Promise<Message> {
  return db
    .insertInto("messages")
    .values({ id: nanoid(), content })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function getAllMessages(): Promise<Message[]> {
  return db
    .selectFrom("messages")
    .selectAll()
    .orderBy("created_at", "asc")
    .execute();
}
