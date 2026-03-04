import { prisma } from "@/app/lib/db";

function badge(status: string) {
  if (status === "READY") return "badge badgeReady";
  if (status === "WAITING") return "badge badgeWaiting";
  return "badge badgeCollected";
}

export default async function PickupPage({ params }: { params: { token: string } }) {
  const token = params.token;

  const order = await prisma.order.findUnique({
    where: { token },
    include: { store: true, customer: true },
  });

  if (!order) {
    return (
      <div className="container" style={{ maxWidth: 520 }}>
        <div className="card">
          <div className="cardTitle">PickPass</div>
          <div style={{ fontWeight: 850, fontSize: 18 }}>Pickup not found</div>
          <div className="small">Please check the link.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 520 }}>
      <div className="card">
        <div className="cardTitle">PickPass pickup</div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900 }}>
              {order.status === "READY" ? "Your pickup is ready" : "Pickup status"}
            </div>
            <div className="small">{order.store.name}</div>
          </div>
          <span className={badge(order.status)}>{order.status}</span>
        </div>

        <div className="hr" />

        <div className="grid">
          <div className="item">
            <div className="small">Item</div>
            <div style={{ fontWeight: 850 }}>{order.product}</div>
          </div>

          <div className="item">
            <div className="small">Pickup time</div>
            <div style={{ fontWeight: 850 }}>{order.pickupTime || "ASAP"}</div>
          </div>

          {order.note ? (
            <div className="item">
              <div className="small">Note</div>
              <div style={{ fontWeight: 750 }}>{order.note}</div>
            </div>
          ) : null}
        </div>

        <div style={{ height: 12 }} />
        <div className="small">
          Tip: This page is designed mobile-first. Desktop works too in this MVP.
        </div>
      </div>
    </div>
  );
}
