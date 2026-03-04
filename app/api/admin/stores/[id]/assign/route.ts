import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { assertOwnerKey } from "@/app/lib/owner";
import { logAction } from "@/app/lib/audit";
import type { StoreRole } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: any) {
  try {
    assertOwnerKey(req);

    const storeId = String(ctx?.params?.id || "");
    if (!storeId) {
      return NextResponse.json({ ok: false, error: "Missing store id" }, { status: 400 });
    }

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      return NextResponse.json({ ok: false, error: "Store not found" }, { status: 404 });
    }

    const body = await req.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const role = String(body?.role || "STAFF") as StoreRole;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }
    if (!["OWNER", "MANAGER", "STAFF"].includes(role)) {
      return NextResponse.json({ ok: false, error: "Invalid role" }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    const storeUser = await prisma.storeUser.upsert({
      where: { storeId_userId: { storeId: store.id, userId: user.id } },
      update: { role },
      create: { storeId: store.id, userId: user.id, role },
    });

    await logAction({
      storeId: store.id,
      actorUserId: null,
      action: "STORE_USER_ASSIGN",
      entityType: "StoreUser",
      entityId: storeUser.id,
      meta: { email, role },
    });

    return NextResponse.json({ ok: true, storeUser });
  } catch (e: any) {
    const status = e?.status || 500;
    return NextResponse.json({ ok: false, error: e?.message || "Error" }, { status });
  }
}
