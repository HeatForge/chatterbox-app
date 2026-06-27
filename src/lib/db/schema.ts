import type { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface Database {
  messages: MessagesTable;
  email_whitelist: EmailWhitelistTable;
}

export interface MessagesTable {
  id: string;
  content: string;
  created_at: Generated<Date>;
}

export interface EmailWhitelistTable {
  email: string;
  created_at: Generated<Date>;
}

export type Message = Selectable<MessagesTable>;
export type NewMessage = Insertable<MessagesTable>;
export type MessageUpdate = Updateable<MessagesTable>;
