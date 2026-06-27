const DATABASE_URL_KEYS = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "DATABASE_POSTGRES_URL",
  "DATABASE_POSTGRES_PRISMA_URL",
] as const;

export function getDatabaseUrl(): string {
  for (const key of DATABASE_URL_KEYS) {
    const url = process.env[key];
    if (url) {
      return url;
    }
  }

  throw new Error(
    "Database URL not found. Set DATABASE_URL (or POSTGRES_URL / DATABASE_POSTGRES_URL from Neon).",
  );
}
