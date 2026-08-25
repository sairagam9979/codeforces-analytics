import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div>
      <nav
        style={{
          borderBottom: "1px solid var(--border)",
          background: "rgba(18, 24, 41, 0.85)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 10
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem 1.25rem",
            gap: "1rem",
            flexWrap: "wrap"
          }}
        >
          <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>
            <span style={{ color: "var(--accent)" }}>Code</span>Profile
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <NavLink
              to="/dashboard"
              style={({ isActive }) => ({
                padding: "0.5rem 0.9rem",
                borderRadius: "8px",
                background: isActive ? "rgba(91, 140, 255, 0.15)" : "transparent",
                color: isActive ? "var(--accent)" : "var(--muted)"
              })}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/friends"
              style={({ isActive }) => ({
                padding: "0.5rem 0.9rem",
                borderRadius: "8px",
                background: isActive ? "rgba(91, 140, 255, 0.15)" : "transparent",
                color: isActive ? "var(--accent)" : "var(--muted)"
              })}
            >
              Friends
            </NavLink>
            <NavLink
              to="/recommendations"
              style={({ isActive }) => ({
                padding: "0.5rem 0.9rem",
                borderRadius: "8px",
                background: isActive ? "rgba(91, 140, 255, 0.15)" : "transparent",
                color: isActive ? "var(--accent)" : "var(--muted)"
              })}
            >
              AI Coach
            </NavLink>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{user?.name}</span>
            <button className="btn btn-secondary" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="container page-shell" style={{ padding: "2rem 1.25rem" }}>
        <Outlet />
      </main>
    </div>
  );
}
