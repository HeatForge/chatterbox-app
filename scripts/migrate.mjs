import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

import { loadEnvFiles } from "./load-env.mjs";

const { Client } = pg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, "..", "db", "migrations");

async function migrate() {
  loadEnvFiles();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const { rows: applied } = await client.query(
      "SELECT filename FROM schema_migrations ORDER BY filename",
    );
    const appliedSet = new Set(applied.map((row) => row.filename));

    const files = (await readdir(migrationsDir))
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`Skipping ${file} (already applied)`);
        continue;
      }

      const sql = await readFile(path.join(migrationsDir, file), "utf8");
      console.log(`Applying ${file}...`);

      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations (filename) VALUES ($1)",
          [file],
        );
        await client.query("COMMIT");
        console.log(`Applied ${file}`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }

    console.log("Migrations complete");
  } finally {
    await client.end();
  }
}

migrate().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
