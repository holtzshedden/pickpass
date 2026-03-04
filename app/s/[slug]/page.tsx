"use client";

import * as React from "react";

type Order = {
  id: string;
  token: string;
  product: string;
  status: "WAITING" | "READY" | "COLLECTED";
  pickupTime: string | null;
  note: string | null;
  createdAt: string;
  customer: { phone: string };
};

const PRODUCTS = ["Service Repair", "Bike Pickup", "Tailor Fix", "Food Order"];
const PICKUP_SLOTS = ["ASAP", "15:30", "16:00", "17:00", "18:00"];
const STATUS = ["WAITING", "READY", "COLLECTED"] as const;

function badgeClass(status: Order["status"]) {
  if (status === "READY") return "badge badgeReady";
  if (status === "WAITING") return "badge badgeWaiting";
  return "badge badgeCollected";
}

export default function StoreDashboard({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [slug, setSlug] = React.useState<string | null>(null);

  const [phone, setPhone] = React.useState("");
  const [product, setProduct] = React.useState(PRODUCTS[0]);
  const [status, setStatus] = React.useState<(typeof STATUS)[number]>("READY");
  const [pickupTime, setPickupTime] = React.useState(PICKUP_SLOTS[0]);
  const [note, setNote] = React.useState("");

  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [lastLink, setLastLink] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      const p = await params;
      if (!alive) return;
      setSlug(p.slug);
    })();
    return () => {
      alive = false;
    };
  }, [params]);

  async function loadOrders(s: string) {
    setError(null);
    try {
      const res = await fetch(`/api/stores/${s}/orders`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load orders");
      setOrders(data.orders || []);
    } catch (e: any) {
      setError(e?.message || "Error");
    }
  }

  React.useEffect(() => {
    if (!slug) return;
    loadOrders(slug);
    const t = setInterval(() => loadOrders(slug), 6000);
    return () => clearInterval(t);
  }, [slug]);

  async function createOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!slug) return;

    setError(null);
    setLastLink(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/stores/${slug}/orders`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          phone,
          product,
          status,
          pickupTime,
          note: note.trim() ? note.trim() : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create order");

      setLastLink(data.pickupLink);
      setPhone("");
      setNote("");
      await loadOrders(slug);
    } catch (e: any) {
      setError(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  const waiting = orders.filter((o) => o.status === "WAITING");
  const ready = orders.filter((o) => o.status === "READY");
  const collected = orders.filter((o) => o.status === "COLLECTED");

  return (
    <div className="container">
      <div className="header">
        <div className="brand">
          <a href="/">PickPass</a>
          <span className="pill">Store</span>
          <span className="pill">{slug ? `/${slug}` : "Loading…"}</span>
        </div>
        <a className="pill" href="/admin">
          Owner Admin
        </a>
      </div>

      <div style={{ height: 14 }} />

      <div className="grid grid-2">
        <div className="card">
          <div className="cardTitle">Create pickup</div>

          <form onSubmit={createOrder} className="grid">
            <div className="field">
              <div className="label">Phone</div>
              <input
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+49 170 1234567"
                inputMode="tel"
                autoComplete="tel"
              />
            </div>

            <div className="grid grid-2">
              <div className="field">
                <div className="label">Product</div>
                <select
                  className="select"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                >
                  {PRODUCTS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <div className="label">Status</div>
                <select
                  className="select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                >
                  {STATUS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-2">
              <div className="field">
                <div className="label">Pickup time</div>
                <select
                  className="select"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                >
                  {PICKUP_SLOTS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <div className="label">Note (optional)</div>
                <input
                  className="input"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Any special info"
                />
              </div>
            </div>

            <button className="button" disabled={loading || !slug || phone.trim().length < 6}>
              Send SMS
            </button>

            {lastLink ? (
              <div className="small">
                SMS stub done. Pickup link:{" "}
                <a style={{ textDecoration: "underline" }} href={lastLink}>
                  {lastLink}
                </a>
              </div>
            ) : null}

            {error ? (
              <div className="small" style={{ color: "#fecaca" }}>
                {error}
              </div>
            ) : null}

            <div className="small">MVP: polling every 6 seconds.</div>
          </form>
        </div>

        <div className="card">
          <div className="cardTitle">Live status</div>
          <div className="grid grid-3">
            <div className="card" style={{ padding: 12 }}>
              <div className="kpi">
                <div className="small">Waiting</div>
                <div className="kpiValue">{waiting.length}</div>
              </div>
            </div>
            <div className="card" style={{ padding: 12 }}>
              <div className="kpi">
                <div className="small">Ready</div>
                <div className="kpiValue">{ready.length}</div>
              </div>
            </div>
            <div className="card" style={{ padding: 12 }}>
              <div className="kpi">
                <div className="small">Collected</div>
                <div className="kpiValue">{collected.length}</div>
              </div>
            </div>
          </div>

          <div style={{ height: 12 }} />

          <div className="small">Most recent</div>
          <div className="list" style={{ marginTop: 10 }}>
            {orders.slice(0, 8).map((o) => (
              <div key={o.id} className="item">
                <div className="itemTop">
                  <div>
                    <div style={{ fontWeight: 800 }}>{o.product}</div>
                    <div className="small">{o.customer.phone}</div>
                    <div className="small">
                      Pickup: {o.pickupTime || "n/a"} ·{" "}
                      <a style={{ textDecoration: "underline" }} href={`/p/${o.token}`}>
                        /p/{o.token}
                      </a>
                    </div>
                  </div>
                  <span className={badgeClass(o.status)}>{o.status}</span>
                </div>
                {o.note ? <div className="small" style={{ marginTop: 8 }}>{o.note}</div> : null}
              </div>
            ))}
            {orders.length === 0 ? <div className="small">No orders yet.</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
