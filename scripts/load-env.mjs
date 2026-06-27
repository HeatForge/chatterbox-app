import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");

const DATABASE_URL_KEYS = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "DATABASE_POSTGRES_URL",
  "DATABASE_POSTGRES_PRISMA_URL",
];

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }

  const separatorIndex = trimmed.indexOf("=");
  if (separatorIndex === -1) {
    return null;
  }

  const key = trimmed.slice(0, separatorIndex).trim();
  let value = trimmed.slice(separatorIndex + 1).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return { key, value };
}

function loadEnvFile(filePath, platformKeys) {
  if (!existsSync(filePath)) {
    return;
  }

  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    const parsed = parseEnvLine(line);
    if (!parsed || platformKeys.has(parsed.key)) {
      continue;
    }
    process.env[parsed.key] = parsed.value;
  }
}

/**
 * Load .env files using Next.js precedence. Values already present in the
 * shell or hosting platform (e.g. Vercel build env) are never overwritten.
 */
export function loadEnvFiles() {
  const platformKeys = new Set(Object.keys(process.env));
  const nodeEnv = process.env.NODE_ENV ?? "development";
  const filenames = [
    ".env",
    ".env.local",
    `.env.${nodeEnv}`,
    `.env.${nodeEnv}.local`,
  ];

  for (const filename of filenames) {
    loadEnvFile(path.join(projectRoot, filename), platformKeys);
  }
}

export function resolveDatabaseUrl() {
  for (const key of DATABASE_URL_KEYS) {
    const value = process.env[key];
    if (value) {
      return value;
    }
  }
  return null;
}
