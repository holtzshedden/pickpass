import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { generateToken } from "@/app/lib/token";
import { logAction } from "@/app/lib/audit";
import { sendPickupSms } from "@/app/lib/sms";
import type { OrderStatus } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  try {
    const store = await prisma.store.findUnique({ where: { slug: params.slug } });
    if (!store) return NextResponse.json({ ok: false, error: "Store not found" }, { status: 404 });

    const orders = await prisma.order.findMany({
      where: { storeId: store.id },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ ok: true, orders });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  try {
    const store = await prisma.store.findUnique({ where: { slug: params.slug } });
    if (!store) return NextResponse.json({ ok: false, error: "Store not found" }, { status: 404 });

    const body = await req.json();

    const phone = String(body?.phone || "").trim();
    const product = String(body?.product || "").trim();
    const status = String(body?.status || "READY") as OrderStatus;
    const pickupTime = body?.pickupTime ? String(body.pickupTime) : null;
    const note = body?.note ? String(body.note) : null;

    if (phone.length < 6) {
      return NextResponse.json({ ok: false, error: "Invalid phone" }, { status: 400 });
    }
    if (!product) {
      return NextResponse.json({ ok: false, error: "Missing product" }, { status: 400 });
    }
    if (!["WAITING", "READY", "COLLECTED"].includes(status)) {
      return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
    }

    const customer = await prisma.customer.upsert({
      where: { phone },
      update: {},
      create: { phone },
    });

    let token = generateToken(8);
    for (let i = 0; i < 4; i++) {
      const exists = await prisma.order.findUnique({ where: { token } });
      if (!exists) break;
      token = generateToken(8);
    }

    const order = await prisma.order.create({
      data: {
        storeId: store.id,
        customerId: customer.id,
        product,
        status,
        pickupTime,
        note,
        token,
      },
      include: { customer: true },
    });

    await logAction({
      storeId: store.id,
      actorUserId: null,
      orderId: order.id,
      action: "ORDER_CREATE",
      entityType: "Order",
      entityId: order.id,
      meta: { phone, product, status, pickupTime, note, token },
    });

    const pickupLink = `${new URL(req.url).origin}/p/${token}`;

    await sendPickupSms({
      toPhone: phone,
      link: pickupLink,
      storeName: store.name,
    });

    await logAction({
      storeId: store.id,
      actorUserId: null,
      orderId: order.id,
      action: "SMS_SEND",
      entityType: "Order",
      entityId: order.id,
      meta: { toPhone: phone, pickupLink },
    });

    return NextResponse.json({ ok: true, order, pickupLink });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Error" }, { status: 500 });
  }
}
