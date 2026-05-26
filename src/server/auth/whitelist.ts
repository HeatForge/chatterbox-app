import { db } from "~/server/db";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function isEmailWhitelisted(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);
  const entry = await db.allowedEmail.findUnique({
    where: { email: normalized },
  });
  return entry !== null;
}
