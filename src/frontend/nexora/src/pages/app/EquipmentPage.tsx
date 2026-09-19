import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, ChevronLeft, ChevronRight, Eye } from "lucide-react";

const C = {
  bg: "#F5F8FC", surface: "#FFFFFF", border: "#E2E8F0",
  text: "#0F172A", muted: "#64748B", primary: "#2563EB",
  success: "#22C55E", warning: "#F59E0B", danger: "#EF4444",
  cardShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)",
};

const ALL_EQUIPMENT = [
  { id: "T-104", name: "Transformer T-104", type: "Power Transformer", location: "Substation A, Houston", status: "Critical", lastCheck: "2h ago", risk: 78 },
  { id: "CB-23", name: "Circuit Breaker CB-23", type: "Circuit Breaker", location: "North Grid, Dallas", status: "Warning", lastCheck: "4h ago", risk: 45 },
  { id: "T-87", name: "Transformer T-87", type: "Power Transformer", location: "East Zone, Austin", status: "Warning", lastCheck: "6h ago", risk: 38 },
  { id: "G-12", name: "Generator G-12", type: "Generator", location: "West Plant, San Antonio", status: "Healthy", lastCheck: "1d ago", risk: 12 },
  { id: "CB-56", name: "Circuit Breaker CB-56", type: "Circuit Breaker", location: "South Grid, Houston", status: "Healthy", lastCheck: "3h ago", risk: 8 },
  { id: "T-91", name: "Transformer T-91", type: "Power Transformer", location: "Central Hub, Austin", status: "Healthy", lastCheck: "2d ago", risk: 15 },
  { id: "F-14", name: "Feeder F-14", type: "Feeder", location: "Industrial Sector, Dallas", status: "Warning", lastCheck: "5h ago", risk: 42 },
  { id: "S-07", name: "Substation S-07", type: "Substation", location: "Midtown, Houston", status: "Healthy", lastCheck: "1d ago", risk: 9 },
  { id: "G-05", name: "Generator G-05", type: "Generator", location: "North Plant, Lubbock", status: "Healthy", lastCheck: "2d ago", risk: 11 },
  { id: "CB-44", name: "Circuit Breaker CB-44", type: "Circuit Breaker", location: "West Grid, El Paso", status: "Critical", lastCheck: "1h ago", risk: 82 },
];

const TYPES = ["All Types", "Power Transformer", "Circuit Breaker", "Generator", "Feeder", "Substation"];
const STATUSES = ["All Status", "Healthy", "Warning", "Critical"];
const PAGE_SIZE = 6;

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Critical: { bg: "rgba(239,68,68,0.1)", color: C.danger },
    Warning: { bg: "rgba(245,158,11,0.1)", color: C.warning },
    Healthy: { bg: "rgba(34,197,94,0.1)", color: C.success },
  };
  const s = map[status] ?? { bg: "rgba(100,116,139,0.1)", color: C.muted };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: s.bg, color: s.color,
      borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, display: "inline-block" }} />
      {status}
    </span>
  );
}

export default function EquipmentPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [page, setPage] = useState(1);

  const filtered = ALL_EQUIPMENT.filter(eq => {
    const q = search.toLowerCase();
    const matchQ = !q || eq.id.toLowerCase().includes(q) || eq.name.toLowerCase().includes(q) || eq.location.toLowerCase().includes(q);
    const matchT = typeFilter === "All Types" || eq.type === typeFilter;
    const matchS = statusFilter === "All Status" || eq.status === statusFilter;
    return matchQ && matchT && matchS;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSearch(v: string) { setSearch(v); setPage(1); }
  function handleType(v: string) { setTypeFilter(v); setPage(1); }
  function handleStatus(v: string) { setStatusFilter(v); setPage(1); }

  return (
    <div style={{ padding: "28px 32px", background: C.bg, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text, margin: 0 }}>Equipment</h1>
          <p style={{ fontSize: 14, color: C.muted, margin: "4px 0 0" }}>Manage and monitor all grid equipment</p>
        </div>
        <button style={{
          display: "flex", alignItems: "center", gap: 6,
          background: C.primary, color: "#fff", border: "none",
          borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer",
          transition: "background 0.15s",
        }}
          onMouseEnter={e => (e.currentTarget.style.background = "#1d4ed8")}
          onMouseLeave={e => (e.currentTarget.style.background = C.primary)}
        >
          <Plus size={16} /> Add Equipment
        </button>
      </div>

      {/* Filters */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 12, padding: "16px 20px",
        display: "flex", gap: 12, flexWrap: "wrap",
        marginBottom: 20,
        boxShadow: C.cardShadow,
      }}>
        <div style={{ position: "relative", flex: "1 1 240px" }}>
          <Search size={14} color={C.muted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search by ID, name or location..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
            style={{
              width: "100%", height: 38, border: `1px solid ${C.border}`,
              borderRadius: 8, paddingLeft: 36, paddingRight: 12, fontSize: 13,
              color: C.text, background: C.bg, outline: "none", boxSizing: "border-box",
            }}
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => handleType(e.target.value)}
          style={{
            height: 38, border: `1px solid ${C.border}`, borderRadius: 8,
            padding: "0 12px", fontSize: 13, color: C.text, background: C.surface,
            outline: "none", cursor: "pointer", minWidth: 150,
          }}
        >
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => handleStatus(e.target.value)}
          style={{
            height: 38, border: `1px solid ${C.border}`, borderRadius: 8,
            padding: "0 12px", fontSize: 13, color: C.text, background: C.surface,
            outline: "none", cursor: "pointer", minWidth: 140,
          }}
        >
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", fontSize: 13, color: C.muted }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 12, boxShadow: C.cardShadow, overflow: "hidden",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: C.bg }}>
              {["ID", "Name", "Type", "Location", "Status", "Risk Score", "Last Check", "Actions"].map(col => (
                <th key={col} style={{
                  padding: "12px 16px", textAlign: "left",
                  fontSize: 12, fontWeight: 600, color: C.muted,
                  letterSpacing: "0.04em", textTransform: "uppercase",
                  borderBottom: `1px solid ${C.border}`,
                }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((eq, i) => (
              <tr
                key={eq.id}
                style={{
                  borderBottom: i < paged.length - 1 ? `1px solid ${C.border}` : "none",
                  cursor: "pointer", transition: "background 0.12s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = C.bg)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                onClick={() => navigate(`/equipment/${eq.id}`)}
              >
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.primary }}>{eq.id}</span>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{eq.name}</div>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{
                    background: "rgba(37,99,235,0.07)", color: C.primary,
                    fontSize: 12, borderRadius: 6, padding: "2px 8px", fontWeight: 500,
                  }}>
                    {eq.type}
                  </span>
                </td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: C.muted }}>{eq.location}</td>
                <td style={{ padding: "14px 16px" }}>
                  <StatusBadge status={eq.status} />
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: C.border, borderRadius: 3, maxWidth: 80 }}>
                      <div style={{
                        height: 6, borderRadius: 3,
                        width: `${eq.risk}%`,
                        background: eq.risk >= 70 ? C.danger : eq.risk >= 40 ? C.warning : C.success,
                      }} />
                    </div>
                    <span style={{ fontSize: 12, color: C.muted, minWidth: 28 }}>{eq.risk}%</span>
                  </div>
                </td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: C.muted }}>{eq.lastCheck}</td>
                <td style={{ padding: "14px 16px" }} onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => navigate(`/equipment/${eq.id}`)}
                    style={{
                      background: "transparent", border: `1px solid ${C.border}`,
                      borderRadius: 6, padding: "5px 12px", fontSize: 12, color: C.text,
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = C.primary; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; (e.currentTarget as HTMLButtonElement).style.borderColor = C.primary; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = C.text; (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; }}
                  >
                    <Eye size={12} /> View
                  </button>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: 40, textAlign: "center", color: C.muted, fontSize: 14 }}>
                  No equipment found matching the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", borderTop: `1px solid ${C.border}`,
            background: C.bg,
          }}>
            <span style={{ fontSize: 13, color: C.muted }}>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                style={{
                  width: 32, height: 32, borderRadius: 6, border: `1px solid ${C.border}`,
                  background: C.surface, cursor: page === 1 ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: page === 1 ? 0.5 : 1,
                }}
              >
                <ChevronLeft size={14} color={C.muted} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      width: 32, height: 32, borderRadius: 6, fontSize: 13, fontWeight: page === p ? 700 : 400,
                      background: page === p ? C.primary : C.surface,
                      color: page === p ? "#fff" : C.text,
                      border: `1px solid ${page === p ? C.primary : C.border}`,
                      cursor: "pointer",
                    }}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                style={{
                  width: 32, height: 32, borderRadius: 6, border: `1px solid ${C.border}`,
                  background: C.surface, cursor: page === totalPages ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: page === totalPages ? 0.5 : 1,
                }}
              >
                <ChevronRight size={14} color={C.muted} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
