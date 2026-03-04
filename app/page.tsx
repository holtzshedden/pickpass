export default function Home() {
  return (
    <div className="container">
      <div className="header">
        <div className="brand">
          <div>PickPass</div>
          <span className="pill">Setup is live</span>
        </div>
        <div className="row">
          <a className="pill" href="/admin">Owner Admin</a>
          <a className="pill" href="/s/wehfree">WeHFree Store</a>
        </div>
      </div>

      <div style={{ height: 14 }} />
      <div className="card">
        <div className="cardTitle">Next</div>
        <div style={{ fontWeight: 850, fontSize: 18 }}>Create a store, create an order, send a pickup link.</div>
        <div className="small">SMS is stubbed for MVP, logs are tracked.</div>
      </div>
    </div>
  );
}
