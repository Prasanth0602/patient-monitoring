import React, { useEffect, useState } from "react";
import { getPatients, getVitalsForPatient, recordVitals } from "../api/api";

function RecordModal({ patients, onClose, onSave }) {
  const [form, setForm] = useState({ patient_id: "", heart_rate: "", temperature: "", blood_pressure: "" });

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Record Vitals</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={(e) => {
          e.preventDefault();
          onSave({ ...form, heart_rate: parseFloat(form.heart_rate), temperature: parseFloat(form.temperature) });
        }}>
          <div className="form-group">
            <label>Patient</label>
            <select value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })} required>
              <option value="">Select patient</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Heart Rate (bpm)</label>
            <input type="number" value={form.heart_rate} onChange={(e) => setForm({ ...form, heart_rate: e.target.value })} required placeholder="72" />
          </div>
          <div className="form-group">
            <label>Temperature (°C)</label>
            <input type="number" step="0.1" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} required placeholder="37.2" />
          </div>
          <div className="form-group">
            <label>Blood Pressure (mmHg)</label>
            <input type="text" value={form.blood_pressure} onChange={(e) => setForm({ ...form, blood_pressure: e.target.value })} required placeholder="120/80" />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Vitals() {
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState("");
  const [vitals, setVitals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPatients().then((r) => {
      setPatients(r.data);
      if (r.data.length > 0) setSelected(r.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    getVitalsForPatient(selected).then((r) => {
      setVitals(r.data);
      setLoading(false);
    });
  }, [selected]);

  const handleSave = async (data) => {
    await recordVitals(data);
    setShowModal(false);
    if (data.patient_id === selected) {
      const r = await getVitalsForPatient(selected);
      setVitals(r.data);
    }
  };

  const selectedPatient = patients.find((p) => p.id === selected);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Vitals Monitor</h1>
          <p>Track patient vital signs</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Record Vitals
        </button>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Select Patient</label>
          <select value={selected} onChange={(e) => setSelected(e.target.value)}>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {selectedPatient && vitals.length > 0 && (
        <div className="vitals-grid" style={{ marginBottom: 20 }}>
          {[
            { label: "Latest Heart Rate", value: vitals[0].heart_rate, unit: "bpm" },
            { label: "Latest Temperature", value: vitals[0].temperature, unit: "°C" },
            { label: "Blood Pressure", value: vitals[0].blood_pressure, unit: "mmHg" },
          ].map((item) => (
            <div className="vital-item card" key={item.label} style={{ margin: 0 }}>
              <div className="label">{item.label}</div>
              <div className="value">{item.value}</div>
              <div className="unit">{item.unit}</div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="card-title">Vitals History</div>
        {loading ? (
          <p className="loading">Loading vitals...</p>
        ) : vitals.length === 0 ? (
          <p style={{ color: "#718096", fontSize: 14, padding: "12px 0" }}>No vitals recorded yet for this patient.</p>
        ) : (
          <table>
            <thead>
              <tr><th>Date &amp; Time</th><th>Heart Rate</th><th>Temperature</th><th>Blood Pressure</th></tr>
            </thead>
            <tbody>
              {vitals.map((v) => (
                <tr key={v.id}>
                  <td>{new Date(v.recorded_at).toLocaleString()}</td>
                  <td>
                    <span style={{ color: (v.heart_rate < 50 || v.heart_rate > 120) ? "#e53e3e" : "#276749", fontWeight: 600 }}>
                      {v.heart_rate} bpm
                    </span>
                  </td>
                  <td>
                    <span style={{ color: (v.temperature < 35.5 || v.temperature > 38.5) ? "#e53e3e" : "#276749", fontWeight: 600 }}>
                      {v.temperature} °C
                    </span>
                  </td>
                  <td>{v.blood_pressure}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <RecordModal patients={patients} onClose={() => setShowModal(false)} onSave={handleSave} />
      )}
    </div>
  );
}
