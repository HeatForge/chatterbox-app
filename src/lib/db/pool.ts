import { Pool } from "pg";

let pool: Pool | undefined;

function getDatabaseUrl(): string {
  const url =
    process.env.NODE_ENV === "development"
      ? process.env.DEV_DATABASE_URL
      : process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return url;
}

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: getDatabaseUrl() });
  }
  return pool;
}
