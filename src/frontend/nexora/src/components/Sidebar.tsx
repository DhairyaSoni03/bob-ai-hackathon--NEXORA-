import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const ADMIN_ROUTES = [
  { path: "/",                label: "Command Center",     icon: "⚡", tip: "Live dashboard" },
  { path: "/grid-map",        label: "Grid Map",           icon: "◎",  tip: "Spatial overview" },
  { path: "/assets",          label: "Asset Intelligence", icon: "◈",  tip: "All grid assets" },
  { path: "/predictions",     label: "Outage Prediction",  icon: "◐",  tip: "ML risk forecasts" },
  { path: "/weather",         label: "Weather Intel",      icon: "◌",  tip: "Storm & environment" },
  { path: "/advisor",         label: "Failure Advisor",    icon: "◆",  tip: "AI recommendations" },
  { path: "/maintenance",     label: "Maintenance",        icon: "◉",  tip: "Scheduling & crew" },
  { path: "/alerts",          label: "Alerts & Incidents", icon: "◎",  tip: "Active & historical" },
  { path: "/analytics",       label: "Analytics",          icon: "◈",  tip: "Charts & insights" },
  { path: "/admin/incidents", label: "Incident Response",  icon: "🚨", tip: "Manage incidents" },
  { path: "/admin/complaints",label: "Complaints",         icon: "📋", tip: "User complaints" },
  { path: "/admin/crews",     label: "Crew Management",    icon: "👷", tip: "Field crews" },
  { path: "/admin/audit",     label: "Audit Log",          icon: "🗂",  tip: "Admin audit trail" },
];

const USER_ROUTES = [
  { path: "/user",             label: "My Dashboard",       icon: "⚡", tip: "Your area overview" },
  { path: "/user/transformer", label: "My Transformer",     icon: "◎",  tip: "Nearest transformer" },
  { path: "/user/complaints",  label: "My Complaints",      icon: "📋", tip: "Submitted issues" },
  { path: "/user/notifications",label: "Notifications",     icon: "🔔", tip: "Updates & alerts" },
  { path: "/predictions",      label: "Outage Status",      icon: "◐",  tip: "Area outage prediction" },
];

interface Props { alertCount?: number }

export function Sidebar({ alertCount = 0 }: Props) {
  const loc = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const routes = user?.role === "admin" ? ADMIN_ROUTES : USER_ROUTES;

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <>
      {/* Mobile overlay toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        style={{
          display: "none",
          position: "fixed", top: 14, left: 14, zIndex: 200,
          background: "rgba(8,20,40,0.85)", border: "1px solid rgba(56,189,248,0.25)",
          borderRadius: 8, padding: "8px 10px", color: "#38bdf8", cursor: "pointer",
          backdropFilter: "blur(10px)",
        }}
        className="nx-mobile-toggle"
        aria-label="Toggle navigation"
      >☰</button>

      <aside style={{
        width: collapsed ? 64 : 220,
        minWidth: collapsed ? 64 : 220,
        background: "linear-gradient(180deg, #060e1e 0%, #030b18 100%)",
        borderRight: "1px solid rgba(56,189,248,0.1)",
        display: "flex", flexDirection: "column",
        height: "100vh", position: "sticky", top: 0, overflowY: "auto", overflowX: "hidden",
        transition: "width 0.25s ease, min-width 0.25s ease",
        zIndex: 100,
        flexShrink: 0,
      }}>

        {/* Brand */}
        <div style={{
          padding: collapsed ? "20px 12px 16px" : "20px 18px 16px",
          borderBottom: "1px solid rgba(56,189,248,0.08)",
          display: "flex", alignItems: "center", gap: 10,
          justifyContent: collapsed ? "center" : "flex-start",
        }}>
          <div style={{ flexShrink: 0 }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="15" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.5" />
              <circle cx="16" cy="16" r="5" fill="#38bdf8" fillOpacity="0.15" stroke="#38bdf8" strokeWidth="1.5" />
              <line x1="16" y1="1" x2="16" y2="11" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.7" />
              <line x1="16" y1="21" x2="16" y2="31" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.7" />
              <line x1="1" y1="16" x2="11" y2="16" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.7" />
              <line x1="21" y1="16" x2="31" y2="16" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.7" />
              <circle cx="16" cy="16" r="2.5" fill="#38bdf8" />
              <circle cx="16" cy="1.5" r="2" fill="#38bdf8" fillOpacity="0.6" />
              <circle cx="30.5" cy="16" r="2" fill="#38bdf8" fillOpacity="0.6" />
            </svg>
          </div>
          {!collapsed && (
            <div style={{ overflow: "hidden" }}>
              <div style={{
                fontWeight: 900, fontSize: "1.05rem", letterSpacing: "0.12em",
                background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>NEXORA</div>
              <div style={{ fontSize: "0.55rem", color: "#475569", letterSpacing: "0.12em", fontWeight: 600, marginTop: 1 }}>AI GRID INTELLIGENCE</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? "Expand" : "Collapse"}
            style={{
              marginLeft: collapsed ? 0 : "auto", background: "none", border: "none",
              color: "#475569", cursor: "pointer", padding: 4, borderRadius: 4,
              fontSize: "0.7rem", transition: "color 0.2s", flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#38bdf8")}
            onMouseLeave={e => (e.currentTarget.style.color = "#475569")}
          >
            {collapsed ? "▶" : "◀"}
          </button>
        </div>

        {/* User info */}
        {user && !collapsed && (
          <div style={{
            padding: "10px 18px",
            borderBottom: "1px solid rgba(56,189,248,0.08)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.62rem", fontWeight: 700, color: "#fff",
            }}>
              {user.avatar ?? user.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: "0.72rem", color: "#e2e8f0", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
              <span style={{
                fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                color: user.role === "admin" ? "#38bdf8" : "#818cf8",
                background: user.role === "admin" ? "rgba(56,189,248,0.1)" : "rgba(129,140,248,0.1)",
                borderRadius: 4, padding: "1px 5px",
              }}>
                {user.role}
              </span>
            </div>
          </div>
        )}

        {/* System status */}
        {!collapsed && (
          <div style={{
            padding: "8px 18px",
            borderBottom: "1px solid rgba(56,189,248,0.06)",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#4ade80",
              boxShadow: "0 0 6px #4ade80",
              display: "inline-block",
              animation: "pulse 2.5s ease infinite",
            }} />
            <span style={{ fontSize: "0.62rem", color: "#4ade80", fontWeight: 600, letterSpacing: "0.06em" }}>SYSTEM ONLINE</span>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: "8px 0" }}>
          {routes.map(r => {
            const active = loc.pathname === r.path || (r.path !== "/" && r.path !== "/user" && loc.pathname.startsWith(r.path));
            return (
              <Link key={r.path} to={r.path} title={collapsed ? r.label : undefined} style={{ textDecoration: "none", display: "block" }}>
                <div style={{
                  display: "flex", alignItems: "center",
                  gap: collapsed ? 0 : 10,
                  padding: collapsed ? "10px 0" : "9px 18px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  background: active
                    ? "linear-gradient(90deg, rgba(56,189,248,0.12) 0%, transparent 100%)"
                    : "transparent",
                  borderLeft: active ? "2px solid #38bdf8" : "2px solid transparent",
                  color: active ? "#38bdf8" : "#64748b",
                  fontSize: "0.8rem", fontWeight: active ? 600 : 400,
                  transition: "all 0.15s ease",
                  position: "relative",
                  cursor: "pointer",
                }}
                onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "rgba(56,189,248,0.05)"; (e.currentTarget as HTMLElement).style.color = "#94a3b8"; } }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#64748b"; } }}>

                  <span style={{
                    fontSize: "1rem", flexShrink: 0,
                    filter: active ? "drop-shadow(0 0 6px #38bdf8)" : "none",
                    transition: "filter 0.2s",
                  }}>
                    {r.icon}
                  </span>

                  {!collapsed && (
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {r.label}
                    </span>
                  )}

                  {/* Alert badge */}
                  {r.path === "/alerts" && alertCount > 0 && !collapsed && (
                    <span style={{
                      marginLeft: "auto", background: "#ef4444",
                      color: "#fff", borderRadius: 10, padding: "1px 6px",
                      fontSize: "0.62rem", fontWeight: 700,
                      boxShadow: "0 0 8px rgba(239,68,68,0.5)",
                    }}>
                      {alertCount}
                    </span>
                  )}
                  {r.path === "/alerts" && alertCount > 0 && collapsed && (
                    <span style={{
                      position: "absolute", top: 6, right: 8,
                      width: 8, height: 8, borderRadius: "50%",
                      background: "#ef4444",
                      boxShadow: "0 0 6px rgba(239,68,68,0.6)",
                    }} />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Logout + Footer */}
        <div style={{ borderTop: "1px solid rgba(56,189,248,0.06)" }}>
          {/* Logout button */}
          <button
            onClick={handleLogout}
            title={collapsed ? "Logout" : undefined}
            style={{
              width: "100%",
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: collapsed ? 0 : 10,
              justifyContent: collapsed ? "center" : "flex-start",
              padding: collapsed ? "12px 0" : "10px 18px",
              color: "#64748b",
              fontSize: "0.8rem",
              fontWeight: 500,
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(248,113,113,0.06)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.background = "none"; }}
          >
            <span style={{ fontSize: "1rem", flexShrink: 0 }}>↩</span>
            {!collapsed && <span>Logout</span>}
          </button>

          {!collapsed && (
            <div style={{
              padding: "8px 18px 14px",
              fontSize: "0.6rem", color: "#334155",
            }}>
              <div style={{ color: "#38bdf8", opacity: 0.5, marginBottom: 2 }}>IBM Bob AI Hackathon 2026</div>
              <div>All data synthetic · demo</div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
