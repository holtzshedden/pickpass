import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { assertOwnerKey } from "@/app/lib/owner";
import { logAction } from "@/app/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    assertOwnerKey(req);

    const stores = await prisma.store.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, stores });
  } catch (e: any) {
    const status = e?.status || 500;
    return NextResponse.json({ ok: false, error: e?.message || "Error" }, { status });
  }
}

export async function POST(req: Request) {
  try {
    assertOwnerKey(req);

    const body = await req.json();
    const name = String(body?.name || "").trim();
    const slug = String(body?.slug || "").trim().toLowerCase();

    if (!name) return NextResponse.json({ ok: false, error: "Missing name" }, { status: 400 });
    if (!slug || !/^[a-z0-9-]+$/.test(slug))
      return NextResponse.json(
        { ok: false, error: "Slug must be a-z, 0-9, -" },
        { status: 400 }
      );

    const store = await prisma.store.create({
      data: { name, slug },
    });

    await logAction({
      storeId: store.id,
      actorUserId: null,
      action: "STORE_CREATE",
      entityType: "Store",
      entityId: store.id,
      meta: { name, slug },
    });

    return NextResponse.json({ ok: true, store });
  } catch (e: any) {
    const status = e?.status || 500;
    return NextResponse.json({ ok: false, error: e?.message || "Error" }, { status });
  }
}
