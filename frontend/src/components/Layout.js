import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/",         icon: "🏠", label: "Dashboard" },
  { to: "/patients", icon: "🧑‍⚕️", label: "Patients" },
  { to: "/vitals",   icon: "💓", label: "Vitals" },
  { to: "/alerts",   icon: "🔔", label: "Alerts" },
  { to: "/reports",  icon: "📋", label: "Reports" },
];

export default function Layout() {
  const { doctor, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          🏥 <span>Patient</span>Monitor
        </div>
        <nav>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => isActive ? "active" : ""}
            >
              {item.icon} {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div style={{ marginBottom: 8 }}>
            👤 Dr. {doctor?.name}
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-danger btn-sm"
            style={{ width: "100%" }}
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
