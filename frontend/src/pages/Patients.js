import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPatients, createPatient, deletePatient } from "../api/api";
import { useAuth } from "../context/AuthContext";

function PatientModal({ onClose, onSave, doctorId }) {
  const [form, setForm] = useState({
    name: "", age: "", gender: "Male", phone: "", address: "", doctor_id: doctorId,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave({ ...form, age: parseInt(form.age) });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Add New Patient</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          {[
            { field: "name", label: "Full Name", type: "text" },
            { field: "age", label: "Age", type: "number" },
            { field: "phone", label: "Phone", type: "text" },
            { field: "address", label: "Address", type: "text" },
          ].map(({ field, label, type }) => (
            <div className="form-group" key={field}>
              <label>{label}</label>
              <input
                type={type}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                required
              />
            </div>
          ))}
          <div className="form-group">
            <label>Gender</label>
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Patient</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { doctor } = useAuth();
  const navigate = useNavigate();

  const load = async () => {
    const res = await getPatients();
    setPatients(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (data) => {
    await createPatient(data);
    setShowModal(false);
    load();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this patient?")) {
      await deletePatient(id);
      load();
    }
  };

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search)
  );

  if (loading) return <div className="loading">Loading patients...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Patients</h1>
          <p>{patients.length} total patients</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Patient
        </button>
      </div>

      <div className="card" style={{ padding: "12px 20px" }}>
        <input
          type="text"
          placeholder="🔍  Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", border: "none", outline: "none", fontSize: 14 }}
        />
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Registered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id}>
                <td>{i + 1}</td>
                <td>
                  <button
                    style={{ background: "none", border: "none", color: "#3182ce", cursor: "pointer", fontWeight: 600, fontSize: 14 }}
                    onClick={() => navigate(`/patients/${p.id}`)}
                  >
                    {p.name}
                  </button>
                </td>
                <td>{p.age}</td>
                <td>
                  <span className={`badge badge-${p.gender.toLowerCase()}`}>{p.gender}</span>
                </td>
                <td>{p.phone}</td>
                <td>{p.address}</td>
                <td>{new Date(p.created_at).toLocaleDateString()}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p style={{ textAlign: "center", color: "#718096", padding: 20, fontSize: 14 }}>
            No patients found.
          </p>
        )}
      </div>

      {showModal && (
        <PatientModal
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          doctorId={doctor?.id}
        />
      )}
    </div>
  );
}
