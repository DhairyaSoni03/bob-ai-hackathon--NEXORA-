import React from "react";
import { Link, useLocation } from "react-router-dom";

const ROUTES = [
  { path: "/",              label: "Command Center",    icon: "⚡" },
  { path: "/grid-map",     label: "Grid Map",          icon: "🗺" },
  { path: "/assets",       label: "Asset Intelligence",icon: "🔧" },
  { path: "/predictions",  label: "Outage Prediction", icon: "📡" },
  { path: "/weather",      label: "Weather Intel",     icon: "🌩" },
  { path: "/advisor",      label: "Failure Advisor",   icon: "🤖" },
  { path: "/maintenance",  label: "Maintenance Planner",icon: "🗓" },
  { path: "/alerts",       label: "Alerts & Incidents",icon: "🔔" },
  { path: "/analytics",    label: "Analytics",         icon: "📊" },
];

interface Props { alertCount?: number }

export function Sidebar({ alertCount = 0 }: Props) {
  const loc = useLocation();
  return (
    <aside style={{
      width: 220, minWidth: 220, background: "#070c16", borderRight: "1px solid #1f2937",
      display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0, overflowY: "auto",
    }}>
      {/* Brand */}
      <div style={{ padding: "20px 18px 14px", borderBottom: "1px solid #1f2937" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "1.4rem" }}>⚡</span>
          <div>
            <div style={{ fontWeight: 900, fontSize: "1.1rem", color: "#f3f4f6", letterSpacing: "0.08em" }}>NEXORA</div>
            <div style={{ fontSize: "0.6rem", color: "#6b7280", letterSpacing: "0.06em" }}>AI GRID INTELLIGENCE</div>
          </div>
        </div>
      </div>
      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 0" }}>
        {ROUTES.map(r => {
          const active = loc.pathname === r.path || (r.path !== "/" && loc.pathname.startsWith(r.path));
          return (
            <Link key={r.path} to={r.path} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 18px",
                background: active ? "#1a2744" : "transparent",
                borderLeft: active ? "3px solid #3b82f6" : "3px solid transparent",
                color: active ? "#93c5fd" : "#9ca3af",
                fontSize: "0.8rem", fontWeight: active ? 600 : 400,
                transition: "all .15s",
                position: "relative",
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background="#111827"; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background="transparent"; }}>
                <span style={{ fontSize: "0.9rem" }}>{r.icon}</span>
                <span>{r.label}</span>
                {r.path === "/alerts" && alertCount > 0 && (
                  <span style={{ marginLeft: "auto", background: "#ef4444", color: "#fff", borderRadius: 10, padding: "1px 6px", fontSize: "0.65rem", fontWeight: 700 }}>{alertCount}</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
      {/* Footer */}
      <div style={{ padding: "12px 18px", borderTop: "1px solid #1f2937", fontSize: "0.65rem", color: "#4b5563" }}>
        <div>IBM Bob AI Hackathon 2026</div>
        <div style={{ marginTop: 2 }}>⚡ All data synthetic — demo</div>
      </div>
    </aside>
  );
}
