import { prisma } from "./db";

export async function logAction(params: {
  storeId?: string | null;
  actorUserId?: string | null;
  orderId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  meta?: any;
}) {
  await prisma.auditLog.create({
    data: {
      storeId: params.storeId ?? null,
      actorUserId: params.actorUserId ?? null,
      orderId: params.orderId ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      meta: params.meta ?? undefined,
    },
  });
}
