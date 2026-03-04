// app/lib/auth.ts
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function requireUserId() {
  const { userId } = await auth();

  if (!userId) {
    const err = new Error("Unauthorized");
    // @ts-ignore
    err.status = 401;
    throw err;
  }

  return userId;
}

export async function requireOwner() {
  const userId = await requireUserId();

  const user = await clerkClient.users.getUser(userId);
  const flag = (user.publicMetadata as any)?.pickpassOwner;

  if (flag !== true) {
    const err = new Error("Forbidden");
    // @ts-ignore
    err.status = 403;
    throw err;
  }

  return { userId, user };
}
