import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

import type { Database } from "./schema";

let instance: Kysely<Database> | undefined;

function getDatabaseUrl(): string {
  const url = process.env.NODE_ENV === "development" ? process.env.DEV_DATABASE_URL : process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return url;
}

export function getDb(): Kysely<Database> {
  if (!instance) {
    const dialect = new PostgresDialect({
      pool: new Pool({ connectionString: getDatabaseUrl() }),
    });
    instance = new Kysely<Database>({ dialect });
  }
  return instance;
}

export const db = new Proxy({} as Kysely<Database>, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});
