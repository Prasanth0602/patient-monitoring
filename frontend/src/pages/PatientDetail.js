import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getPatient, getVitalsForPatient, getAlertsForPatient,
  getReportsForPatient, recordVitals, createReport, resolveAlert,
} from "../api/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

function VitalsModal({ patientId, onClose, onSave }) {
  const [form, setForm] = useState({ patient_id: patientId, heart_rate: "", temperature: "", blood_pressure: "" });

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Record Vitals</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave({ ...form, heart_rate: parseFloat(form.heart_rate), temperature: parseFloat(form.temperature) }); }}>
          <div className="form-group">
            <label>Heart Rate (bpm)</label>
            <input type="number" value={form.heart_rate} onChange={(e) => setForm({ ...form, heart_rate: e.target.value })} required placeholder="e.g. 72" />
          </div>
          <div className="form-group">
            <label>Temperature (°C)</label>
            <input type="number" step="0.1" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} required placeholder="e.g. 37.2" />
          </div>
          <div className="form-group">
            <label>Blood Pressure</label>
            <input type="text" value={form.blood_pressure} onChange={(e) => setForm({ ...form, blood_pressure: e.target.value })} required placeholder="e.g. 120/80" />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Vitals</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [vitals, setVitals] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [reports, setReports] = useState([]);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [pRes, vRes, aRes, rRes] = await Promise.all([
      getPatient(id),
      getVitalsForPatient(id),
      getAlertsForPatient(id),
      getReportsForPatient(id),
    ]);
    setPatient(pRes.data);
    setVitals(vRes.data.reverse());
    setAlerts(aRes.data);
    setReports(rRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const handleSaveVitals = async (data) => {
    await recordVitals(data);
    setShowVitalsModal(false);
    load();
  };

  const handleCreateReport = async () => {
    const type = prompt("Report type (e.g. Weekly Summary, Lab Report):");
    if (!type) return;
    await createReport({ patient_id: id, report_type: type });
    load();
  };

  const handleResolveAlert = async (alertId) => {
    await resolveAlert(alertId);
    load();
  };

  if (loading) return <div className="loading">Loading patient details...</div>;
  if (!patient) return <div className="loading">Patient not found.</div>;

  const chartData = vitals.map((v) => ({
    time: new Date(v.recorded_at).toLocaleTimeString(),
    HeartRate: v.heart_rate,
    Temperature: v.temperature,
  }));

  return (
    <div>
      <div className="page-header">
        <div>
          <button onClick={() => navigate("/patients")} style={{ background: "none", border: "none", color: "#3182ce", cursor: "pointer", fontSize: 14, marginBottom: 4 }}>
            ← Back to Patients
          </button>
          <h1>{patient.name}</h1>
          <p>{patient.gender} · {patient.age} yrs · {patient.phone}</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-primary" onClick={() => setShowVitalsModal(true)}>💓 Record Vitals</button>
          <button className="btn btn-success" onClick={handleCreateReport}>📋 Add Report</button>
        </div>
      </div>

      {/* Patient Info */}
      <div className="card" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {[
          ["📍 Address", patient.address],
          ["📞 Phone", patient.phone],
          ["🗓 Registered", new Date(patient.created_at).toLocaleDateString()],
        ].map(([label, val]) => (
          <div key={label}>
            <p style={{ fontSize: 12, color: "#718096" }}>{label}</p>
            <p style={{ fontWeight: 600 }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Latest Vitals */}
      {vitals.length > 0 && (
        <div className="card">
          <div className="card-title">Latest Vitals</div>
          <div className="vitals-grid">
            <div className="vital-item">
              <div className="label">Heart Rate</div>
              <div className="value">{vitals[vitals.length - 1].heart_rate}</div>
              <div className="unit">bpm</div>
            </div>
            <div className="vital-item">
              <div className="label">Temperature</div>
              <div className="value">{vitals[vitals.length - 1].temperature}</div>
              <div className="unit">°C</div>
            </div>
            <div className="vital-item">
              <div className="label">Blood Pressure</div>
              <div className="value" style={{ fontSize: 18 }}>{vitals[vitals.length - 1].blood_pressure}</div>
              <div className="unit">mmHg</div>
            </div>
          </div>
        </div>
      )}

      {/* Vitals Chart */}
      {chartData.length > 1 && (
        <div className="card">
          <div className="card-title">📈 Vitals Trend</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="HeartRate" stroke="#e53e3e" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Temperature" stroke="#3182ce" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Alerts */}
      <div className="card">
        <div className="card-title">⚠️ Alerts ({alerts.length})</div>
        {alerts.length === 0 ? (
          <p style={{ color: "#718096", fontSize: 14 }}>No alerts for this patient.</p>
        ) : (
          <table>
            <thead>
              <tr><th>Parameter</th><th>Message</th><th>Time</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {alerts.map((a) => (
                <tr key={a.id}>
                  <td>{a.parameter}</td>
                  <td>{a.message}</td>
                  <td>{new Date(a.alert_time).toLocaleString()}</td>
                  <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                  <td>
                    {a.status === "active" && (
                      <button className="btn btn-success btn-sm" onClick={() => handleResolveAlert(a.id)}>
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Reports */}
      <div className="card">
        <div className="card-title">📋 Reports ({reports.length})</div>
        {reports.length === 0 ? (
          <p style={{ color: "#718096", fontSize: 14 }}>No reports yet.</p>
        ) : (
          <table>
            <thead>
              <tr><th>Type</th><th>Date</th><th>File</th></tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td>{r.report_type}</td>
                  <td>{new Date(r.report_date).toLocaleDateString()}</td>
                  <td>{r.file_path || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showVitalsModal && (
        <VitalsModal patientId={id} onClose={() => setShowVitalsModal(false)} onSave={handleSaveVitals} />
      )}
    </div>
  );
}
