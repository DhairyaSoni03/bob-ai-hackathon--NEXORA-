import { useState } from "react";

const C = {
  bg: "#F5F8FC", surface: "#FFFFFF", border: "#E2E8F0",
  text: "#0F172A", muted: "#64748B", primary: "#2563EB",
  success: "#22C55E", warning: "#F59E0B", danger: "#EF4444",
  cardShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)",
};

const RECOMMENDATIONS = [
  {
    id: 1,
    priority: "High",
    priorityColor: C.danger,
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#2563EB" strokeWidth="2">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    iconBg: "rgba(37,99,235,0.08)",
    title: "Schedule Maintenance",
    equipment: "Transformer T-104",
    desc: "Perform thermal inspection and oil quality test for T-104. Temperature trend suggests imminent failure.",
    impact: "Prevent 78% probability failure",
    dueDate: "Within 3 days",
    action: "Schedule",
    primary: true,
    done: false,
  },
  {
    id: 2,
    priority: "High",
    priorityColor: C.danger,
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#22C55E" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
    iconBg: "rgba(34,197,94,0.08)",
    title: "Load Redistribution",
    equipment: "North Grid Sector",
    desc: "Temporarily shift 15% load from CB-44 to adjacent substation to reduce thermal stress.",
    impact: "Reduce load stress by 18%",
    dueDate: "Today",
    action: "View Plan",
    primary: false,
    done: false,
  },
  {
    id: 3,
    priority: "Medium",
    priorityColor: C.warning,
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#2563EB" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    iconBg: "rgba(37,99,235,0.08)",
    title: "Monitor Closely",
    equipment: "Circuit Breaker CB-23",
    desc: "Increase sensor sampling frequency from hourly to every 5 minutes for next 7 days.",
    impact: "Improve detection accuracy",
    dueDate: "This week",
    action: "Set Alert",
    primary: false,
    done: false,
  },
  {
    id: 4,
    priority: "Medium",
    priorityColor: C.warning,
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#F59E0B" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    iconBg: "rgba(245,158,11,0.08)",
    title: "Long-Term Upgrade",
    equipment: "Transformer T-104",
    desc: "Consider equipment replacement within 6 months given age (7 years) and increasing fault indicators.",
    impact: "Eliminate 78% risk permanently",
    dueDate: "6 months",
    action: "View Details",
    primary: false,
    done: false,
  },
  {
    id: 5,
    priority: "Low",
    priorityColor: C.primary,
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#2563EB" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    iconBg: "rgba(37,99,235,0.08)",
    title: "Update Maintenance Record",
    equipment: "Generator G-12",
    desc: "Log the completed inspection from Jan 10 and update digital maintenance records.",
    impact: "Compliance requirement",
    dueDate: "End of month",
    action: "Open Form",
    primary: false,
    done: false,
  },
];

const FILTER_TABS = ["All", "High", "Medium", "Low", "Completed"];

export default function AIRecommendationsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [items, setItems] = useState(RECOMMENDATIONS);

  function markDone(id: number) {
    setItems(prev => prev.map(r => r.id === id ? { ...r, done: true } : r));
  }

  const filtered = items.filter(r => {
    if (activeTab === "Completed") return r.done;
    if (activeTab === "All") return !r.done;
    return r.priority === activeTab && !r.done;
  });

  const counts = {
    All: items.filter(r => !r.done).length,
    High: items.filter(r => r.priority === "High" && !r.done).length,
    Medium: items.filter(r => r.priority === "Medium" && !r.done).length,
    Low: items.filter(r => r.priority === "Low" && !r.done).length,
    Completed: items.filter(r => r.done).length,
  };

  return (
    <div style={{ padding: "28px 32px", background: C.bg, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text, margin: 0 }}>AI Recommendations</h1>
        <p style={{ fontSize: 14, color: C.muted, margin: "4px 0 0" }}>Actionable steps to prevent failures and optimize grid performance</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Actions", val: items.filter(r => !r.done).length, color: C.primary, bg: "rgba(37,99,235,0.08)" },
          { label: "High Priority", val: counts.High, color: C.danger, bg: "rgba(239,68,68,0.08)" },
          { label: "Medium Priority", val: counts.Medium, color: C.warning, bg: "rgba(245,158,11,0.08)" },
          { label: "Completed", val: counts.Completed, color: C.success, bg: "rgba(34,197,94,0.08)" },
        ].map(s => (
          <div key={s.label} style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
            padding: "16px 20px", boxShadow: C.cardShadow,
          }}>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{
        display: "flex", gap: 4, background: C.surface,
        border: `1px solid ${C.border}`, borderRadius: 10, padding: 4,
        width: "fit-content", marginBottom: 20, boxShadow: C.cardShadow,
      }}>
        {FILTER_TABS.map(tab => (
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
            {(counts as Record<string, number>)[tab] > 0 && (
              <span style={{
                background: activeTab === tab ? "rgba(255,255,255,0.25)" : C.border,
                color: activeTab === tab ? "#fff" : C.muted,
                borderRadius: 10, padding: "0 6px", fontSize: 11, fontWeight: 600,
              }}>{(counts as Record<string, number>)[tab]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Recommendation cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filtered.length === 0 && (
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
            padding: 40, textAlign: "center", color: C.muted, fontSize: 14,
            boxShadow: C.cardShadow,
          }}>
            {activeTab === "Completed" ? "No completed recommendations yet." : "No recommendations in this category."}
          </div>
        )}
        {filtered.map(r => (
          <div key={r.id} style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
            padding: "20px 24px", boxShadow: C.cardShadow,
            display: "flex", alignItems: "center", gap: 16,
            opacity: r.done ? 0.6 : 1,
            transition: "box-shadow 0.2s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.10)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = C.cardShadow; }}
          >
            {/* Icon */}
            <div style={{
              width: 52, height: 52, borderRadius: 14, background: r.iconBg,
              border: `1px solid ${r.iconBg.replace("0.08", "0.2")}`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              {r.icon}
            </div>
            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{r.title}</span>
                <span style={{
                  background: r.priorityColor + "18", color: r.priorityColor,
                  borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700,
                }}>{r.priority}</span>
              </div>
              <div style={{ fontSize: 12, color: C.primary, fontWeight: 500, marginBottom: 4 }}>{r.equipment}</div>
              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{r.desc}</div>
              <div style={{ display: "flex", gap: 20, marginTop: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, color: C.muted }}>
                  <span style={{ fontWeight: 600, color: C.text }}>Impact:</span> {r.impact}
                </span>
                <span style={{ fontSize: 12, color: C.muted }}>
                  <span style={{ fontWeight: 600, color: C.text }}>Due:</span> {r.dueDate}
                </span>
              </div>
            </div>
            {/* Actions */}
            <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
              {!r.done && (
                <>
                  <button style={{
                    background: r.primary ? C.primary : C.surface,
                    color: r.primary ? "#fff" : C.text,
                    border: `1px solid ${r.primary ? C.primary : C.border}`,
                    borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600,
                    cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s",
                  }}
                    onMouseEnter={e => { if (!r.primary) { (e.currentTarget as HTMLButtonElement).style.borderColor = C.primary; (e.currentTarget as HTMLButtonElement).style.color = C.primary; } else { (e.currentTarget as HTMLButtonElement).style.background = "#1d4ed8"; } }}
                    onMouseLeave={e => { if (!r.primary) { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; (e.currentTarget as HTMLButtonElement).style.color = C.text; } else { (e.currentTarget as HTMLButtonElement).style.background = C.primary; } }}
                  >
                    {r.action}
                  </button>
                  <button
                    onClick={() => markDone(r.id)}
                    style={{
                      background: "rgba(34,197,94,0.08)", color: C.success,
                      border: `1px solid rgba(34,197,94,0.25)`, borderRadius: 8,
                      padding: "9px 14px", fontSize: 13, fontWeight: 600,
                      cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(34,197,94,0.18)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(34,197,94,0.08)")}
                  >
                    ✓ Done
                  </button>
                </>
              )}
              {r.done && (
                <span style={{
                  background: "rgba(34,197,94,0.1)", color: C.success,
                  borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 600,
                }}>
                  ✓ Completed
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
