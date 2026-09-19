import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from "recharts";
import { ArrowLeft, Thermometer, Activity, Zap, Droplets, BarChart2, Radio } from "lucide-react";

const C = {
  bg: "#F5F8FC", surface: "#FFFFFF", border: "#E2E8F0",
  text: "#0F172A", muted: "#64748B", primary: "#2563EB",
  success: "#22C55E", warning: "#F59E0B", danger: "#EF4444",
  cardShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)",
};

const TEMP_DATA = [
  { day: "Sep 10", Actual: 72, Predicted: 74 },
  { day: "Sep 11", Actual: 76, Predicted: 79 },
  { day: "Sep 12", Actual: 80, Predicted: 83 },
  { day: "Sep 13", Actual: 85, Predicted: 88 },
  { day: "Sep 14", Actual: 88, Predicted: 92 },
  { day: "Sep 15", Actual: 91, Predicted: 96 },
  { day: "Sep 16", Actual: 94, Predicted: 100 },
  { day: "Sep 17", Predicted: 103 },
  { day: "Sep 18", Predicted: 107 },
  { day: "Sep 19", Predicted: 111 },
  { day: "Sep 20", Predicted: 116 },
];

const SENSORS = [
  { id: "temp", icon: <Thermometer size={18} color="#EF4444" />, label: "Temperature", value: "94°C", unit: "", status: "Critical", bg: "rgba(239,68,68,0.08)" },
  { id: "vib", icon: <Activity size={18} color="#F59E0B" />, label: "Vibration", value: "4.2", unit: "mm/s", status: "Warning", bg: "rgba(245,158,11,0.08)" },
  { id: "pd", icon: <Zap size={18} color="#EF4444" />, label: "Partial Discharge", value: "High", unit: "", status: "Critical", bg: "rgba(239,68,68,0.08)" },
  { id: "oil", icon: <Droplets size={18} color="#F59E0B" />, label: "Oil Quality", value: "68%", unit: "", status: "Warning", bg: "rgba(245,158,11,0.08)" },
  { id: "load", icon: <BarChart2 size={18} color="#22C55E" />, label: "Load Factor", value: "82%", unit: "", status: "Normal", bg: "rgba(34,197,94,0.08)" },
  { id: "volt", icon: <Radio size={18} color="#2563EB" />, label: "Voltage", value: "220kV", unit: "", status: "Normal", bg: "rgba(37,99,235,0.08)" },
];

const HISTORY = [
  { date: "Jan 10, 2026", event: "Preventive Maintenance", result: "Passed", tech: "Team A" },
  { date: "Aug 5, 2025", event: "Thermal Inspection", result: "Minor Issue", tech: "Team B" },
  { date: "Mar 15, 2025", event: "Oil Sample Test", result: "Passed", tech: "Team A" },
  { date: "Sep 1, 2024", event: "Full Inspection", result: "Passed", tech: "Team C" },
];

const RECOMMENDATIONS = [
  { icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#2563EB" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>, color: "#2563EB", bg: "rgba(37,99,235,0.08)", title: "Schedule Maintenance", desc: "Perform thermal inspection and oil quality test for T-104.", action: "Schedule", primary: true },
  { icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#22C55E" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" /></svg>, color: "#22C55E", bg: "rgba(34,197,94,0.08)", title: "Load Redistribution", desc: "Temporarily shift 15% load to adjacent substation.", action: "View Plan", primary: false },
  { icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#2563EB" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>, color: "#2563EB", bg: "rgba(37,99,235,0.08)", title: "Monitor Closely", desc: "Increase sensor sampling frequency for next 7 days.", action: "Set Alert", primary: false },
  { icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#F59E0B" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>, color: "#F59E0B", bg: "rgba(245,158,11,0.08)", title: "Long-Term Upgrade", desc: "Consider equipment replacement within 6 months.", action: "View Details", primary: false },
];

const TABS = ["Prediction", "Sensor Data", "History", "Recommendations"];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Critical: { bg: "rgba(239,68,68,0.1)", color: C.danger },
    Warning: { bg: "rgba(245,158,11,0.1)", color: C.warning },
    Normal: { bg: "rgba(34,197,94,0.1)", color: C.success },
  };
  const s = map[status] ?? { bg: "rgba(100,116,139,0.1)", color: C.muted };
  return (
    <span style={{
      background: s.bg, color: s.color,
      borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 600,
    }}>{status}</span>
  );
}

export default function PredictionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Prediction");
  const equipId = id ?? "T-104";

  return (
    <div style={{ padding: "28px 32px", background: C.bg, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
            width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: C.muted, transition: "all 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = C.bg)}
          onMouseLeave={e => (e.currentTarget.style.background = C.surface)}
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: 0 }}>
              Prediction Details — {equipId}
            </h1>
            <span style={{
              background: "rgba(239,68,68,0.1)", color: C.danger,
              borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700,
            }}>
              High Risk
            </span>
          </div>
          <p style={{ fontSize: 14, color: C.muted, margin: "4px 0 0" }}>Transformer T-104 · Substation A, Houston</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24, alignItems: "start" }}>
        {/* Left panel — equipment info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Image placeholder */}
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
            boxShadow: C.cardShadow, overflow: "hidden",
          }}>
            <div style={{
              height: 160, background: "linear-gradient(135deg,#e2e8f0,#f1f5f9)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
                <rect x="20" y="10" width="40" height="60" rx="4" fill="#94a3b8" opacity="0.4" />
                <rect x="28" y="18" width="24" height="10" rx="2" fill="#64748b" opacity="0.5" />
                <rect x="28" y="32" width="24" height="10" rx="2" fill="#64748b" opacity="0.5" />
                <rect x="28" y="46" width="24" height="16" rx="2" fill="#64748b" opacity="0.5" />
                <line x1="10" y1="25" x2="20" y2="25" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
                <line x1="60" y1="25" x2="70" y2="25" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
                <line x1="10" y1="55" x2="20" y2="55" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
                <line x1="60" y1="55" x2="70" y2="55" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 14 }}>Equipment Info</div>
              {[
                ["Type", "Power Transformer"],
                ["Capacity", "220/66 kV"],
                ["Manufacturer", "Siemens"],
                ["Installed", "Mar 12, 2019"],
                ["Last Service", "Jan 10, 2026"],
              ].map(([k, v]) => (
                <div key={k} style={{
                  display: "flex", justifyContent: "space-between",
                  paddingBottom: 8, marginBottom: 8,
                  borderBottom: `1px solid ${C.border}`,
                  fontSize: 13,
                }}>
                  <span style={{ color: C.muted }}>{k}</span>
                  <span style={{ color: C.text, fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
            boxShadow: C.cardShadow, padding: "16px 20px",
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 12 }}>Risk Factors</div>
            {[
              { label: "Thermal Stress", val: 92, color: C.danger },
              { label: "Mechanical Wear", val: 65, color: C.warning },
              { label: "Insulation", val: 44, color: C.warning },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: C.muted }}>{f.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: f.color }}>{f.val}%</span>
                </div>
                <div style={{ height: 6, background: C.border, borderRadius: 3 }}>
                  <div style={{ height: 6, width: `${f.val}%`, borderRadius: 3, background: f.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — tabs */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 12, boxShadow: C.cardShadow, overflow: "hidden",
        }}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "14px 20px", background: "transparent", border: "none",
                  cursor: "pointer", fontSize: 13, fontWeight: activeTab === tab ? 700 : 500,
                  color: activeTab === tab ? C.primary : C.muted,
                  borderBottom: activeTab === tab ? `2px solid ${C.primary}` : "2px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={{ padding: 24 }}>
            {/* PREDICTION TAB */}
            {activeTab === "Prediction" && (
              <div>
                {/* Big alert card */}
                <div style={{
                  background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: 12, padding: 20, marginBottom: 24,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: C.danger }}>78%</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Failure Probability</div>
                    <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Predicted within next 14 days</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Confidence</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>91%</div>
                    <div style={{
                      marginTop: 8, background: "rgba(239,68,68,0.1)", color: C.danger,
                      borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 600,
                      display: "inline-block",
                    }}>
                      ⚠ CRITICAL
                    </div>
                  </div>
                </div>

                {/* Temperature Trend */}
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 16 }}>Temperature Trend & Forecast</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={TEMP_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: C.muted }} />
                      <YAxis domain={[60, 130]} tick={{ fontSize: 11, fill: C.muted }} />
                      <Tooltip
                        contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }}
                      />
                      <ReferenceLine y={95} stroke={C.danger} strokeDasharray="5 3" label={{ value: "Threshold 95°C", position: "right", fontSize: 11, fill: C.danger }} />
                      <Line type="monotone" dataKey="Actual" stroke={C.primary} strokeWidth={2} dot={{ r: 3, fill: C.primary }} connectNulls={false} />
                      <Line type="monotone" dataKey="Predicted" stroke={C.danger} strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3, fill: C.danger }} connectNulls={true} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", gap: 20, marginTop: 12, fontSize: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.muted }}>
                      <span style={{ width: 20, height: 2, background: C.primary, display: "inline-block", borderRadius: 2 }} />
                      Actual
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.muted }}>
                      <span style={{ width: 20, height: 2, background: C.danger, display: "inline-block", borderRadius: 2, borderTop: "2px dashed "+C.danger }} />
                      Predicted
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.muted }}>
                      <span style={{ width: 20, height: 2, background: C.danger, display: "inline-block", borderRadius: 2 }} />
                      Threshold
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SENSOR DATA TAB */}
            {activeTab === "Sensor Data" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16 }}>
                {SENSORS.map(s => (
                  <div key={s.id} style={{
                    background: s.bg, border: `1px solid ${C.border}`,
                    borderRadius: 12, padding: 16,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      {s.icon}
                      <StatusBadge status={s.status} />
                    </div>
                    <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: C.text }}>{s.value}<span style={{ fontSize: 13, fontWeight: 400, color: C.muted }}>{s.unit}</span></div>
                  </div>
                ))}
              </div>
            )}

            {/* HISTORY TAB */}
            {activeTab === "History" && (
              <div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Date", "Event", "Result", "Technician"].map(col => (
                        <th key={col} style={{
                          padding: "10px 12px", textAlign: "left",
                          fontSize: 12, fontWeight: 600, color: C.muted,
                          borderBottom: `1px solid ${C.border}`, letterSpacing: "0.04em",
                        }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {HISTORY.map((h, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: "12px", fontSize: 13, color: C.muted }}>{h.date}</td>
                        <td style={{ padding: "12px", fontSize: 13, color: C.text, fontWeight: 500 }}>{h.event}</td>
                        <td style={{ padding: "12px" }}>
                          <span style={{
                            background: h.result === "Passed" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
                            color: h.result === "Passed" ? C.success : C.warning,
                            borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 600,
                          }}>{h.result}</span>
                        </td>
                        <td style={{ padding: "12px", fontSize: 13, color: C.muted }}>{h.tech}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* RECOMMENDATIONS TAB */}
            {activeTab === "Recommendations" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {RECOMMENDATIONS.map(r => (
                  <div key={r.title} style={{
                    display: "flex", alignItems: "center", gap: 16,
                    border: `1px solid ${C.border}`, borderRadius: 12, padding: 16,
                    background: C.bg, transition: "box-shadow 0.15s",
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, background: r.bg,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      {r.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{r.title}</div>
                      <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{r.desc}</div>
                    </div>
                    <button style={{
                      background: r.primary ? C.primary : C.surface,
                      color: r.primary ? "#fff" : C.text,
                      border: `1px solid ${r.primary ? C.primary : C.border}`,
                      borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600,
                      cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s",
                    }}>
                      {r.action}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
