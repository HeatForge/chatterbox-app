import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

import { getDatabaseUrl } from "@/lib/env/database-url";

import type { Database } from "./schema";

let instance: Kysely<Database> | undefined;

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
  get(_target, prop) {
    const instance = getDb();
    const value = Reflect.get(instance, prop, instance);
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
});
