import { Pool } from "pg";

import { getDatabaseUrl } from "@/lib/env/database-url";

let pool: Pool | undefined;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: getDatabaseUrl() });
  }
  return pool;
}
