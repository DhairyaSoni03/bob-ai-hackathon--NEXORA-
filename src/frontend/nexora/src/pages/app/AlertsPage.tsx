import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, CheckCircle } from "lucide-react";

const C = {
  bg: "#F5F8FC", surface: "#FFFFFF", border: "#E2E8F0",
  text: "#0F172A", muted: "#64748B", primary: "#2563EB",
  success: "#22C55E", warning: "#F59E0B", danger: "#EF4444",
  cardShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)",
};

const ALL_ALERTS = [
  { id: 1, severity: "Critical", equipment: "Transformer T-104", location: "Substation A, Houston", desc: "Core temperature exceeded 95°C threshold. Immediate inspection required.", time: "2 min ago", status: "Active" },
  { id: 2, severity: "Warning", equipment: "Circuit Breaker CB-23", location: "North Grid, Dallas", desc: "Vibration readings 3x above baseline. Possible mechanical loosening.", time: "18 min ago", status: "Active" },
  { id: 3, severity: "Warning", equipment: "Transformer T-87", location: "East Zone, Austin", desc: "Oil dielectric strength declining. Schedule oil quality test.", time: "1 hr ago", status: "Active" },
  { id: 4, severity: "Critical", equipment: "Circuit Breaker CB-44", location: "West Grid, El Paso", desc: "Contact resistance 40% above nominal. Risk of arc flash event.", time: "3 hr ago", status: "Active" },
  { id: 5, severity: "Informational", equipment: "Generator G-12", location: "West Plant, San Antonio", desc: "Routine maintenance reminder: Next service due in 14 days.", time: "5 hr ago", status: "Active" },
  { id: 6, severity: "Warning", equipment: "Feeder F-14", location: "Industrial Sector, Dallas", desc: "Load imbalance detected. Phase C carrying 18% excess load.", time: "6 hr ago", status: "Active" },
  { id: 7, severity: "Critical", equipment: "Transformer T-91", location: "Central Hub, Austin", desc: "Partial discharge detected. Insulation degradation likely.", time: "1 day ago", status: "Resolved" },
  { id: 8, severity: "Informational", equipment: "Substation S-07", location: "Midtown, Houston", desc: "Firmware update available for SCADA monitoring module.", time: "2 days ago", status: "Resolved" },
];

const TABS = ["All", "Critical", "Warning", "Informational", "Resolved"];

function SeverityBadge({ s }: { s: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Critical: { bg: "rgba(239,68,68,0.1)", color: C.danger },
    Warning: { bg: "rgba(245,158,11,0.1)", color: C.warning },
    Informational: { bg: "rgba(37,99,235,0.1)", color: C.primary },
    Resolved: { bg: "rgba(34,197,94,0.1)", color: C.success },
  };
  const style = map[s] ?? { bg: "rgba(100,116,139,0.1)", color: C.muted };
  return (
    <span style={{
      background: style.bg, color: style.color,
      borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700,
      whiteSpace: "nowrap",
    }}>{s}</span>
  );
}

export default function AlertsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [alerts, setAlerts] = useState(ALL_ALERTS);

  const filtered = alerts.filter(a => {
    const matchTab = activeTab === "All" || (activeTab === "Resolved" ? a.status === "Resolved" : a.severity === activeTab && a.status !== "Resolved");
    const q = search.toLowerCase();
    const matchQ = !q || a.equipment.toLowerCase().includes(q) || a.location.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q);
    return matchTab && matchQ;
  });

  const counts: Record<string, number> = {
    All: alerts.filter(a => a.status !== "Resolved").length,
    Critical: alerts.filter(a => a.severity === "Critical" && a.status !== "Resolved").length,
    Warning: alerts.filter(a => a.severity === "Warning" && a.status !== "Resolved").length,
    Informational: alerts.filter(a => a.severity === "Informational" && a.status !== "Resolved").length,
    Resolved: alerts.filter(a => a.status === "Resolved").length,
  };

  function resolve(id: number) {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: "Resolved" } : a));
  }

  return (
    <div style={{ padding: "28px 32px", background: C.bg, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text, margin: 0 }}>Alerts</h1>
        <p style={{ fontSize: 14, color: C.muted, margin: "4px 0 0" }}>Monitor and manage active grid alerts</p>
      </div>

      {/* Filter tabs */}
      <div style={{
        display: "flex", gap: 4, background: C.surface,
        border: `1px solid ${C.border}`, borderRadius: 10,
        padding: 4, width: "fit-content", marginBottom: 20,
        boxShadow: C.cardShadow,
      }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "7px 16px", borderRadius: 7, fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
              background: activeTab === tab ? C.primary : "transparent",
              color: activeTab === tab ? "#fff" : C.muted,
              border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.15s",
            }}
          >
            {tab}
            {counts[tab] > 0 && (
              <span style={{
                background: activeTab === tab ? "rgba(255,255,255,0.25)" : C.border,
                color: activeTab === tab ? "#fff" : C.muted,
                borderRadius: 10, padding: "0 6px", fontSize: 11, fontWeight: 600,
                minWidth: 18, textAlign: "center",
              }}>{counts[tab]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
        padding: "12px 16px", marginBottom: 20, display: "flex", gap: 12,
        boxShadow: C.cardShadow,
      }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={14} color={C.muted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search alerts by equipment, location or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", height: 36, border: `1px solid ${C.border}`, borderRadius: 8,
              paddingLeft: 36, fontSize: 13, color: C.text, background: C.bg, outline: "none", boxSizing: "border-box",
            }}
          />
        </div>
        <span style={{ display: "flex", alignItems: "center", fontSize: 13, color: C.muted }}>
          {filtered.length} alert{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Alert cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.length === 0 && (
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
            padding: 40, textAlign: "center", color: C.muted, fontSize: 14,
            boxShadow: C.cardShadow,
          }}>
            No alerts found.
          </div>
        )}
        {filtered.map(a => (
          <div key={a.id} style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderLeft: `4px solid ${a.severity === "Critical" ? C.danger : a.severity === "Warning" ? C.warning : a.severity === "Informational" ? C.primary : C.success}`,
            borderRadius: 12, padding: "16px 20px",
            display: "flex", alignItems: "center", gap: 16,
            boxShadow: C.cardShadow, opacity: a.status === "Resolved" ? 0.7 : 1,
          }}>
            <SeverityBadge s={a.severity} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{a.equipment}</div>
              <div style={{ fontSize: 12, color: C.muted, margin: "2px 0" }}>{a.location}</div>
              <div style={{ fontSize: 13, color: C.text }}>{a.desc}</div>
            </div>
            <div style={{ flexShrink: 0, textAlign: "right" }}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>{a.time}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => navigate(`/equipment/${a.equipment.split(" ").pop()}`)}
                  style={{
                    background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6,
                    padding: "5px 12px", fontSize: 12, color: C.text, cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.primary; (e.currentTarget as HTMLButtonElement).style.color = C.primary; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; (e.currentTarget as HTMLButtonElement).style.color = C.text; }}
                >
                  View Equipment
                </button>
                {a.status !== "Resolved" && (
                  <button
                    onClick={() => resolve(a.id)}
                    style={{
                      background: "rgba(34,197,94,0.1)", border: `1px solid rgba(34,197,94,0.3)`,
                      borderRadius: 6, padding: "5px 12px", fontSize: 12,
                      color: C.success, cursor: "pointer", fontWeight: 600,
                      display: "flex", alignItems: "center", gap: 4, transition: "all 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(34,197,94,0.2)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(34,197,94,0.1)")}
                  >
                    <CheckCircle size={12} /> Mark Resolved
                  </button>
                )}
                {a.status === "Resolved" && (
                  <span style={{
                    background: "rgba(34,197,94,0.1)", color: C.success,
                    borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600,
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    <CheckCircle size={12} /> Resolved
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
