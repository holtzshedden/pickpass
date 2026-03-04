// app/lib/auth.ts
import { auth, clerkClient } from "@clerk/nextjs/server";

type StatusError = Error & { status?: number };

function statusError(message: string, status: number): StatusError {
  const err: StatusError = new Error(message);
  err.status = status;
  return err;
}

export async function requireUserId() {
  const a = await auth();
  const userId = a.userId;

  if (!userId) throw statusError("Unauthorized", 401);
  return userId;
}

export async function requireOwner() {
  const userId = await requireUserId();

  // Clerk v6: clerkClient ist (je nach Version) async
  const client: any = await clerkClient();
  const user = await client.users.getUser(userId);

  const flag = (user.publicMetadata as any)?.pickpassOwner;
  if (flag !== true) throw statusError("Forbidden", 403);

  return { userId, user };
}
