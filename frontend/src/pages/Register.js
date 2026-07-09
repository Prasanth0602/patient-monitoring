import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerDoctor } from "../api/api";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await registerDoctor(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🏥 Create Account</h1>
        <p className="subtitle">Register as a Doctor</p>
        {error && <div className="alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {[
            { field: "name", label: "Full Name", type: "text", placeholder: "Dr. John Smith" },
            { field: "email", label: "Email", type: "email", placeholder: "doctor@hospital.com" },
            { field: "phone", label: "Phone", type: "text", placeholder: "+91 9876543210" },
            { field: "password", label: "Password", type: "password", placeholder: "••••••••" },
          ].map(({ field, label, type, placeholder }) => (
            <div className="form-group" key={field}>
              <label>{label}</label>
              <input
                type={type}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                placeholder={placeholder}
                required
              />
            </div>
          ))}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "12px" }}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p style={{ marginTop: 16, fontSize: 13, textAlign: "center", color: "#718096" }}>
          Already have an account? <Link to="/login" style={{ color: "#3182ce" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
