// app/admin/page.tsx
"use client";

import * as React from "react";
import { SignOutButton, UserButton } from "@clerk/nextjs";

type Store = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  createdAt: string;
};

export default function OwnerAdminPage() {
  const [stores, setStores] = React.useState<Store[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [name, setName] = React.useState("WeHFree");
  const [slug, setSlug] = React.useState("wehfree");
  const [error, setError] = React.useState<string | null>(null);

  async function loadStores() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stores", { method: "GET" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load stores");
      setStores(data.stores || []);
    } catch (e: any) {
      setError(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadStores();
  }, []);

  async function createStore(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stores", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create store");
      await loadStores();
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
          <div>PickPass</div>
          <span className="pill">Owner Admin</span>
        </div>

        <div className="row" style={{ gap: 10 }}>
          <a className="pill" href="/">
            Home
          </a>
          <UserButton />
          <SignOutButton>
            <button className="pill" type="button">
              Sign out
            </button>
          </SignOutButton>
        </div>
      </div>

      <div style={{ height: 14 }} />

      <div className="grid grid-2">
        <div className="card">
          <div className="cardTitle">Create store</div>
          <form onSubmit={createStore} className="grid">
            <div className="field">
              <div className="label">Store name</div>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="WeHFree"
              />
            </div>

            <div className="field">
              <div className="label">Slug</div>
              <input
                className="input"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="wehfree"
              />
              <div className="small">Will be used as: /s/{slug}</div>
            </div>

            <div className="row" style={{ justifyContent: "space-between" }}>
              <button className="button" disabled={loading}>
                Create
              </button>
              <button
                type="button"
                className="buttonSecondary"
                onClick={loadStores}
                disabled={loading}
              >
                Refresh
              </button>
            </div>

            {error ? (
              <div className="small" style={{ color: "#fecaca" }}>
                {error}
              </div>
            ) : null}

            <div className="small">
              Auth: /admin + /api/admin is protected by Clerk session. Owner check is
              via Clerk publicMetadata.pickpassOwner.
            </div>
          </form>
        </div>

        <div className="card">
          <div className="cardTitle">Stores</div>

          {loading && stores.length === 0 ? (
            <div className="small">Loading…</div>
          ) : (
            <div className="list">
              {stores.map((s) => (
                <div key={s.id} className="item">
                  <div className="itemTop">
                    <div>
                      <div style={{ fontWeight: 750 }}>{s.name}</div>
                      <div className="small">/s/{s.slug}</div>
                    </div>
                    <span className="badge">{s.active ? "active" : "inactive"}</span>
                  </div>

                  <div className="hr" />

                  <div className="row">
                    <a className="buttonSecondary" href={`/admin/store/${s.id}`}>
                      Manage
                    </a>
                    <a className="buttonSecondary" href={`/s/${s.slug}`}>
                      Open dashboard
                    </a>
                  </div>
                </div>
              ))}
              {stores.length === 0 ? <div className="small">No stores yet.</div> : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
