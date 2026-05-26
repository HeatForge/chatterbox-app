import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";

import { db } from "~/server/db";
import { isEmailWhitelisted, normalizeEmail } from "~/server/auth/whitelist";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") {
        return;
      }
      const email = ctx.body?.email;
      if (typeof email !== "string" || !(await isEmailWhitelisted(email))) {
        throw new APIError("UNPROCESSABLE_ENTITY", {
          message: "This email is not authorized to register.",
        });
      }
    }),
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const email = user.email;
          if (!email || !(await isEmailWhitelisted(email))) {
            throw new APIError("UNPROCESSABLE_ENTITY", {
              message: "This email is not authorized to register.",
            });
          }
          return {
            data: {
              ...user,
              email: normalizeEmail(email),
            },
          };
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
