import { useState } from "react";
import { Plus, Download, FileText } from "lucide-react";

const C = {
  bg: "#F5F8FC", surface: "#FFFFFF", border: "#E2E8F0",
  text: "#0F172A", muted: "#64748B", primary: "#2563EB",
  success: "#22C55E", warning: "#F59E0B", danger: "#EF4444",
  cardShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)",
};

const REPORTS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#F59E0B" strokeWidth="2">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
      </svg>
    ),
    iconBg: "rgba(245,158,11,0.1)",
    title: "Equipment Health Report",
    desc: "Complete health status of all grid equipment with risk scores and maintenance recommendations.",
    lastGenerated: "Sep 14, 2025",
    size: "2.4 MB",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#EF4444" strokeWidth="2">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    iconBg: "rgba(239,68,68,0.1)",
    title: "Prediction Summary",
    desc: "AI prediction results and trend analysis for the past 30 days across all monitored assets.",
    lastGenerated: "Sep 15, 2025",
    size: "1.8 MB",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#2563EB" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    iconBg: "rgba(37,99,235,0.1)",
    title: "Maintenance Schedule",
    desc: "Recommended maintenance actions and scheduling for the next 90 days based on AI analysis.",
    lastGenerated: "Sep 10, 2025",
    size: "1.2 MB",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#22C55E" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    iconBg: "rgba(34,197,94,0.1)",
    title: "Outage Analysis",
    desc: "Historical and predicted outage data with root cause analysis and prevention strategies.",
    lastGenerated: "Sep 12, 2025",
    size: "3.1 MB",
  },
];

const RECENT_ACTIVITY = [
  { user: "Aarav Mehta", action: "Generated Equipment Health Report", time: "2 hours ago", type: "PDF" },
  { user: "Jordan Lee", action: "Downloaded Outage Analysis", time: "Yesterday, 3:42 PM", type: "CSV" },
  { user: "Sam Rivera", action: "Generated Prediction Summary", time: "Sep 13, 2025", type: "PDF" },
];

function DownloadToast({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 100,
      background: C.text, color: "#fff", borderRadius: 10,
      padding: "12px 20px", fontSize: 13, fontWeight: 500,
      boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <Download size={14} /> Report download started...
    </div>
  );
}

export default function ReportsPage() {
  const [toastVisible, setToastVisible] = useState(false);

  function handleDownload() {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  }

  return (
    <div style={{ padding: "28px 32px", background: C.bg, minHeight: "100vh" }}>
      <DownloadToast show={toastVisible} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text, margin: 0 }}>Reports</h1>
          <p style={{ fontSize: 14, color: C.muted, margin: "4px 0 0" }}>Generate and download detailed grid reports</p>
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
          <Plus size={16} /> Generate Report
        </button>
      </div>

      {/* Report cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 20, marginBottom: 32 }}>
        {REPORTS.map(r => (
          <div key={r.title} style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: 24,
            boxShadow: C.cardShadow, display: "flex", flexDirection: "column", gap: 16,
            transition: "box-shadow 0.2s, transform 0.2s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.10)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = C.cardShadow; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, background: r.iconBg,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {r.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{r.title}</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 4, lineHeight: 1.5 }}>{r.desc}</div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.muted }}>
              <span>Last generated: {r.lastGenerated}</span>
              <span>{r.size}</span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleDownload}
                style={{
                  flex: 1, height: 36, background: C.primary, color: "#fff",
                  border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#1d4ed8")}
                onMouseLeave={e => (e.currentTarget.style.background = C.primary)}
              >
                <Download size={13} /> PDF
              </button>
              <button
                onClick={handleDownload}
                style={{
                  flex: 1, height: 36, background: C.surface, color: C.text,
                  border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, fontWeight: 600,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = C.bg; (e.currentTarget as HTMLButtonElement).style.borderColor = C.primary; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = C.surface; (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; }}
              >
                <FileText size={13} /> CSV
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 12, boxShadow: C.cardShadow, padding: 24,
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: "0 0 16px" }}>Recent Activity</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {RECENT_ACTIVITY.map((a, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 0",
              borderBottom: i < RECENT_ACTIVITY.length - 1 ? `1px solid ${C.border}` : "none",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0,
              }}>
                {a.user.split(" ").map(n => n[0]).join("")}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{a.user}</span>
                <span style={{ fontSize: 13, color: C.muted }}> {a.action}</span>
              </div>
              <span style={{
                background: "rgba(37,99,235,0.08)", color: C.primary,
                fontSize: 11, fontWeight: 600, borderRadius: 6, padding: "2px 8px",
              }}>{a.type}</span>
              <span style={{ fontSize: 12, color: C.muted, whiteSpace: "nowrap" }}>{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
