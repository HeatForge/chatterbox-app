import { PrismaClient, UserRole } from "../generated/prisma";
import { normalizeEmail } from "../src/server/auth/whitelist";

const db = new PrismaClient();

async function main() {
  const raw = process.env.ADMIN_EMAIL?.trim();
  if (!raw) {
    console.log("ADMIN_EMAIL not set; skipping admin bootstrap.");
    return;
  }

  const email = normalizeEmail(raw);

  await db.allowedEmail.upsert({
    where: { email },
    create: { email, note: "Bootstrap admin" },
    update: {},
  });

  const promoted = await db.user.updateMany({
    where: { email },
    data: { role: UserRole.admin },
  });

  if (promoted.count > 0) {
    console.log(`Promoted ${promoted.count} user(s) to admin: ${email}`);
  } else {
    console.log(`Whitelisted admin email (no user yet): ${email}`);
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
