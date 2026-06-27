import { db } from "@/lib/db/client";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function isEmailWhitelisted(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);
  const row = await db
    .selectFrom("email_whitelist")
    .select("email")
    .where("email", "=", normalized)
    .executeTakeFirst();

  return row !== undefined;
}
