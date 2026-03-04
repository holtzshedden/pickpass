"use client";

import * as React from "react";

type Store = { id: string; name: string; slug: string; active: boolean };
type LogItem = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
};

function ownerKey() {
  return process.env.NEXT_PUBLIC_PICKPASS_OWNER_KEY || "";
}

export default function StoreManagePage({ params }: { params: { id: string } }) {
  const storeId = params.id;

  const [store, setStore] = React.useState<Store | null>(null);
  const [logs, setLogs] = React.useState<LogItem[]>([]);
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<"OWNER" | "MANAGER" | "STAFF">("MANAGER");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/stores/${storeId}`, {
        headers: { "x-pickpass-owner-key": ownerKey() },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load store");
      setStore(data.store);
      setLogs(data.logs || []);
    } catch (e: any) {
      setError(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, []);

  async function assignUser(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/stores/${storeId}/assign`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-pickpass-owner-key": ownerKey(),
        },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to assign user");
      setEmail("");
      await load();
    } catch (e: any) {
      setError(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="header">
        <div className="brand">
          <a href="/admin">PickPass</a>
          <span className="pill">Store</span>
        </div>
        <div className="row">
          {store ? (
            <a className="pill" href={`/s/${store.slug}`}>
              /s/{store.slug}
            </a>
          ) : null}
        </div>
      </div>

      <div style={{ height: 14 }} />

      <div className="grid grid-2">
        <div className="card">
          <div className="cardTitle">Store settings</div>
          {store ? (
            <>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{store.name}</div>
              <div className="small">Slug: {store.slug}</div>
              <div className="small">Status: {store.active ? "active" : "inactive"}</div>
              <div className="hr" />
              <div className="small">
                Next step: real authentication and store member management UI.
              </div>
            </>
          ) : (
            <div className="small">Loading…</div>
          )}
        </div>

        <div className="card">
          <div className="cardTitle">Assign user to this store</div>
          <form onSubmit={assignUser} className="grid">
            <div className="field">
              <div className="label">User email</div>
              <input
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
              />
            </div>
            <div className="field">
              <div className="label">Role</div>
              <select
                className="select"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
              >
                <option value="OWNER">OWNER</option>
                <option value="MANAGER">MANAGER</option>
                <option value="STAFF">STAFF</option>
              </select>
            </div>

            <button className="button" disabled={loading || !email.trim()}>
              Assign
            </button>

            {error ? <div className="small" style={{ color: "#fecaca" }}>{error}</div> : null}
          </form>
        </div>
      </div>

      <div style={{ height: 14 }} />

      <div className="card">
        <div className="cardTitle">Recent logs (store scoped)</div>
        <div className="list">
          {logs.map((l) => (
            <div key={l.id} className="item">
              <div className="itemTop">
                <div>
                  <div style={{ fontWeight: 750 }}>{l.action}</div>
                  <div className="small">
                    {l.entityType} {l.entityId}
                  </div>
                </div>
                <span className="badge">{new Date(l.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))}
          {logs.length === 0 ? <div className="small">No logs yet.</div> : null}
        </div>
      </div>
    </div>
  );
}
