import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";

export const adminRouter = createTRPCRouter({
  ping: adminProcedure.query(() => {
    return { ok: true as const };
  }),
});
