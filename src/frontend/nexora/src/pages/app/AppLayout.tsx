import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import {
  LayoutDashboard, Cpu, TrendingUp, Bell, FileText, Map, Settings,
  LogOut, Search, ChevronLeft, ChevronRight, Menu,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Equipment", icon: Cpu, path: "/equipment" },
  { label: "Predictions", icon: TrendingUp, path: "/predictions-view" },
  { label: "Alerts", icon: Bell, path: "/alerts-view", badge: 3 },
  { label: "Reports", icon: FileText, path: "/reports" },
  { label: "Maps", icon: Map, path: "/maps" },
  { label: "Settings", icon: Settings, path: "/settings-view" },
];

const C = {
  bg: "#F5F8FC",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  text: "#0F172A",
  muted: "#64748B",
  primary: "#2563EB",
  sidebar: "#0B2545",
  sidebarActive: "#2563EB",
  sidebarText: "rgba(255,255,255,0.75)",
  sidebarTextActive: "#FFFFFF",
  sidebarBorder: "rgba(255,255,255,0.08)",
};

const SIDEBAR_W = 240;
const HEADER_H = 64;

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarWidth = collapsed ? 68 : SIDEBAR_W;

  function handleNav(path: string) {
    navigate(path);
    setMobileOpen(false);
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const initials = user?.name ? user.name.split(" ").map(n => n[0]).join("") : "AM";
  const displayName = user?.name ?? "Aarav Mehta";
  const displayRole = user?.role === "admin" ? "Utility Manager" : "Grid Operator";

  const SidebarContent = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? "20px 0" : "20px 20px",
        display: "flex", alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        borderBottom: `1px solid ${C.sidebarBorder}`,
        height: HEADER_H, boxSizing: "border-box",
      }}>
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg,#2563eb,#38bdf8)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" strokeWidth="2.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="rgba(255,255,255,0.3)" />
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 17, color: "#fff", letterSpacing: "-0.2px" }}>NEXORA</span>
          </div>
        )}
        {collapsed && (
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg,#2563eb,#38bdf8)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" strokeWidth="2.5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="rgba(255,255,255,0.3)" />
            </svg>
          </div>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            background: "transparent", border: "none", cursor: "pointer",
            color: C.sidebarText, padding: 4, borderRadius: 4, display: "flex",
            alignItems: "center",
          }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 0", overflowY: "auto" }}>
        {!collapsed && (
          <div style={{ padding: "0 16px 8px", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Main Menu
          </div>
        )}
        {NAV_ITEMS.map(item => {
          const active = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              title={collapsed ? item.label : undefined}
              style={{
                width: "100%", background: active ? C.sidebarActive : "transparent",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center",
                gap: collapsed ? 0 : 12,
                padding: collapsed ? "12px 0" : "11px 20px",
                justifyContent: collapsed ? "center" : "flex-start",
                color: active ? C.sidebarTextActive : C.sidebarText,
                fontSize: 14, fontWeight: active ? 600 : 400,
                transition: "background 0.15s, color 0.15s",
                position: "relative",
                borderRadius: collapsed ? 0 : 0,
                marginBottom: 2,
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              <span style={{ position: "relative", flexShrink: 0 }}>
                <Icon size={18} />
                {item.badge && !collapsed && (
                  <span style={{
                    position: "absolute", top: -5, right: -6,
                    background: "#EF4444", color: "#fff", fontSize: 9,
                    fontWeight: 700, borderRadius: "50%", width: 14, height: 14,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{item.badge}</span>
                )}
              </span>
              {!collapsed && <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>}
              {!collapsed && item.badge && (
                <span style={{
                  background: "rgba(239,68,68,0.2)", color: "#fca5a5",
                  fontSize: 11, fontWeight: 600, borderRadius: 10,
                  padding: "1px 7px",
                }}>{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User profile */}
      <div style={{
        padding: collapsed ? "16px 0" : "16px 20px",
        borderTop: `1px solid ${C.sidebarBorder}`,
        display: "flex", alignItems: "center",
        gap: collapsed ? 0 : 12,
        justifyContent: collapsed ? "center" : "flex-start",
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "linear-gradient(135deg,#2563eb,#7c3aed)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0,
        }}>
          {initials}
        </div>
        {!collapsed && (
          <>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {displayName}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{displayRole}</div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                color: "rgba(255,255,255,0.4)", padding: 4,
                display: "flex", alignItems: "center", borderRadius: 4,
                transition: "color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
            >
              <LogOut size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Desktop Sidebar */}
      <aside style={{
        width: sidebarWidth, minWidth: sidebarWidth, maxWidth: sidebarWidth,
        background: C.sidebar, height: "100vh",
        position: "sticky", top: 0, flexShrink: 0,
        transition: "width 0.2s, min-width 0.2s, max-width 0.2s",
        zIndex: 30, overflowX: "hidden",
        display: "flex", flexDirection: "column",
      }}>
        {SidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            zIndex: 40, display: "none",
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main column */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top header */}
        <header style={{
          height: HEADER_H, background: C.surface,
          borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center",
          padding: "0 24px", gap: 16,
          position: "sticky", top: 0, zIndex: 20,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}>
          {/* Mobile menu btn */}
          <button
            style={{ background: "transparent", border: "none", cursor: "pointer", display: "none", padding: 4 }}
            onClick={() => setMobileOpen(m => !m)}
          >
            <Menu size={20} color={C.muted} />
          </button>

          {/* Search */}
          <div style={{
            flex: 1, maxWidth: 400, position: "relative", display: "flex", alignItems: "center",
          }}>
            <Search size={15} color={C.muted} style={{ position: "absolute", left: 12 }} />
            <input
              type="text"
              placeholder="Search equipment, location..."
              style={{
                width: "100%", height: 38, border: `1px solid ${C.border}`,
                borderRadius: 8, paddingLeft: 36, paddingRight: 12,
                fontSize: 13, color: C.text, background: C.bg,
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ flex: 1 }} />

          {/* Notification bell */}
          <button
            style={{
              position: "relative", background: "transparent", border: "none",
              cursor: "pointer", padding: 8, borderRadius: 8,
              display: "flex", alignItems: "center",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = C.bg)}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <Bell size={18} color={C.muted} />
            <span style={{
              position: "absolute", top: 6, right: 6,
              width: 8, height: 8, borderRadius: "50%",
              background: "#EF4444", border: "2px solid #fff",
            }} />
          </button>

          {/* User */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg,#2563eb,#7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 13, fontWeight: 700,
            }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{displayName}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{displayRole}</div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: "auto", padding: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
