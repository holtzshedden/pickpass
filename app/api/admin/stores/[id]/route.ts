import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { assertOwnerKey } from "@/app/lib/owner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: any) {
  try {
    assertOwnerKey(req);

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
