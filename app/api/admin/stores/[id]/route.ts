import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { assertOwnerKey } from "@/lib/owner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    assertOwnerKey(req);

    const store = await prisma.store.findUnique({ where: { id: params.id } });
    if (!store) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

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
