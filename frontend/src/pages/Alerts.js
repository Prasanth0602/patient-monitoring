import React, { useEffect, useState } from "react";
import { getAlerts, resolveAlert, deleteAlert } from "../api/api";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await getAlerts();
    setAlerts(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleResolve = async (id) => {
    await resolveAlert(id);
    load();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this alert?")) {
      await deleteAlert(id);
      load();
    }
  };

  const filtered = filter === "all" ? alerts : alerts.filter((a) => a.status === filter);
  const activeCount = alerts.filter((a) => a.status === "active").length;
  const resolvedCount = alerts.filter((a) => a.status === "resolved").length;

  if (loading) return <div className="loading">Loading alerts...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Alerts</h1>
          <p>{activeCount} active · {resolvedCount} resolved</p>
        </div>
      </div>

      <div className="stats-row" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <div className="stat-card">
          <div className="stat-icon red">🔴</div>
          <div className="stat-info"><h3>{activeCount}</h3><p>Active Alerts</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-info"><h3>{resolvedCount}</h3><p>Resolved</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">📊</div>
          <div className="stat-info"><h3>{alerts.length}</h3><p>Total</p></div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["all", "active", "resolved"].map((f) => (
          <button
            key={f}
            className={`btn ${filter === f ? "btn-primary" : "btn-outline"}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>Parameter</th><th>Message</th><th>Patient ID</th><th>Time</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id}>
                <td><strong>{a.parameter}</strong></td>
                <td>{a.message}</td>
                <td><code style={{ fontSize: 12, color: "#718096" }}>...{a.patient_id.slice(-8)}</code></td>
                <td>{new Date(a.alert_time).toLocaleString()}</td>
                <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                <td style={{ display: "flex", gap: 6 }}>
                  {a.status === "active" && (
                    <button className="btn btn-success btn-sm" onClick={() => handleResolve(a.id)}>✓ Resolve</button>
                  )}
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p style={{ textAlign: "center", color: "#718096", padding: 20, fontSize: 14 }}>
            No {filter === "all" ? "" : filter} alerts found.
          </p>
        )}
      </div>
    </div>
  );
}
