import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { requireOwner } from "@/app/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: Request, ctx: any) {
  try {
    await requireOwner();

    const storeId = String(ctx?.params?.id || "");
    if (!storeId) {
      return NextResponse.json({ ok: false, error: "Missing store id" }, { status: 400 });
    }

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    const logs = await prisma.auditLog.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    return NextResponse.json({ ok: true, store, logs });
  } catch (e: any) {
    const status = e?.status || 500;
    return NextResponse.json({ ok: false, error: e?.message || "Error" }, { status });
  }
}
