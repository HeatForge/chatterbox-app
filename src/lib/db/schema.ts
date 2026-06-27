import type { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface Database {
  messages: MessagesTable;
}

export interface MessagesTable {
  id: string;
  content: string;
  created_at: Generated<Date>;
}

export type Message = Selectable<MessagesTable>;
export type NewMessage = Insertable<MessagesTable>;
export type MessageUpdate = Updateable<MessagesTable>;
