import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";

import { getPool } from "@/lib/db/pool";
import { isEmailWhitelisted } from "@/lib/services/email-whitelist";

export const auth = betterAuth({
  database: getPool(),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [username(), nextCookies()],
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") {
        return;
      }

      const email = ctx.body?.email;
      if (typeof email !== "string" || email.length === 0) {
        return;
      }

      const whitelisted = await isEmailWhitelisted(email);
      if (!whitelisted) {
        throw new APIError("FORBIDDEN", {
          message: "You haven't been whitelisted yet.",
          code: "NOT_WHITELISTED",
        });
      }
    }),
  },
});
