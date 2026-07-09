import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPatients, getActiveAlerts, getReports } from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const [stats, setStats] = useState({ patients: 0, alerts: 0, reports: 0 });
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { doctor } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const [pRes, aRes, rRes] = await Promise.all([
          getPatients(),
          getActiveAlerts(),
          getReports(),
        ]);
        setStats({ patients: pRes.data.length, alerts: aRes.data.length, reports: rRes.data.length });
        setActiveAlerts(aRes.data.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, Dr. {doctor?.name}</p>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card" onClick={() => navigate("/patients")} style={{ cursor: "pointer" }}>
          <div className="stat-icon blue">🧑‍⚕️</div>
          <div className="stat-info">
            <h3>{stats.patients}</h3>
            <p>Total Patients</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate("/alerts")} style={{ cursor: "pointer" }}>
          <div className="stat-icon red">🔔</div>
          <div className="stat-info">
            <h3>{stats.alerts}</h3>
            <p>Active Alerts</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate("/reports")} style={{ cursor: "pointer" }}>
          <div className="stat-icon green">📋</div>
          <div className="stat-info">
            <h3>{stats.reports}</h3>
            <p>Reports</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate("/vitals")} style={{ cursor: "pointer" }}>
          <div className="stat-icon orange">💓</div>
          <div className="stat-info">
            <h3>Live</h3>
            <p>Vitals Monitor</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">⚠️ Recent Active Alerts</div>
        {activeAlerts.length === 0 ? (
          <p style={{ color: "#718096", fontSize: 14 }}>No active alerts. All patients are stable ✅</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Parameter</th>
                <th>Message</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {activeAlerts.map((a) => (
                <tr key={a.id}>
                  <td><code style={{ fontSize: 12 }}>{a.patient_id.slice(-6)}</code></td>
                  <td>{a.parameter}</td>
                  <td>{a.message}</td>
                  <td>{new Date(a.alert_time).toLocaleString()}</td>
                  <td><span className="badge badge-active">{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
