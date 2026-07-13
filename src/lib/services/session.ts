export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

export async function getRequiredUserId(headers: Headers): Promise<string> {
  const { auth } = await import("@/lib/auth");
  const session = await auth.api.getSession({ headers });
  const userId = session?.user?.id;

  if (!userId) {
    throw new UnauthorizedError();
  }

  return userId;
}

export async function getServerUserId(): Promise<string> {
  const { headers } = await import("next/headers");
  return getRequiredUserId(await headers());
}
