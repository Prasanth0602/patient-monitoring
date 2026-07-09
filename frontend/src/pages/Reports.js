import React, { useEffect, useState } from "react";
import { getReports, createReport, deleteReport, getPatients } from "../api/api";

function ReportModal({ patients, onClose, onSave }) {
  const [form, setForm] = useState({ patient_id: "", report_type: "", file_path: "" });

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Add Report</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
          <div className="form-group">
            <label>Patient</label>
            <select value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })} required>
              <option value="">Select patient</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Report Type</label>
            <select value={form.report_type} onChange={(e) => setForm({ ...form, report_type: e.target.value })} required>
              <option value="">Select type</option>
              {["Weekly Summary", "Lab Report", "ECG Report", "Blood Work", "Discharge Summary", "Consultation Notes"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>File Path (optional)</label>
            <input type="text" value={form.file_path} onChange={(e) => setForm({ ...form, file_path: e.target.value })} placeholder="/reports/filename.pdf" />
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

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [rRes, pRes] = await Promise.all([getReports(), getPatients()]);
    setReports(rRes.data);
    setPatients(pRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (data) => {
    await createReport(data);
    setShowModal(false);
    load();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this report?")) {
      await deleteReport(id);
      load();
    }
  };

  const getPatientName = (pid) => patients.find((p) => p.id === pid)?.name || pid.slice(-8);

  if (loading) return <div className="loading">Loading reports...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <p>{reports.length} total reports</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Report</button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>#</th><th>Patient</th><th>Report Type</th><th>Date</th><th>File</th><th>Action</th></tr>
          </thead>
          <tbody>
            {reports.map((r, i) => (
              <tr key={r.id}>
                <td>{i + 1}</td>
                <td>{getPatientName(r.patient_id)}</td>
                <td>
                  <span className="badge" style={{ background: "#ebf8ff", color: "#2b6cb0" }}>{r.report_type}</span>
                </td>
                <td>{new Date(r.report_date).toLocaleDateString()}</td>
                <td>{r.file_path ? <a href={r.file_path} style={{ color: "#3182ce", fontSize: 13 }}>📎 View</a> : "—"}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reports.length === 0 && (
          <p style={{ textAlign: "center", color: "#718096", padding: 20, fontSize: 14 }}>No reports yet.</p>
        )}
      </div>

      {showModal && (
        <ReportModal patients={patients} onClose={() => setShowModal(false)} onSave={handleSave} />
      )}
    </div>
  );
}
