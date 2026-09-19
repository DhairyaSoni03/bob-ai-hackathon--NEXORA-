import React from "react";

const C = {
  bg: "#F5F8FC", surface: "#FFFFFF", border: "#E2E8F0",
  text: "#0F172A", muted: "#64748B", primary: "#2563EB",
  success: "#22C55E", warning: "#F59E0B", danger: "#EF4444",
  cardShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)",
};

const WORKFLOW_STEPS = [
  {
    step: 1,
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#2563EB" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    label: "Sensor Data",
    desc: "Real-time data collected from thousands of IoT sensors across the power grid.",
    color: "#2563EB",
  },
  {
    step: 2,
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#7c3aed" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    label: "Data Processing",
    desc: "Raw sensor streams are cleaned, normalized, and enriched with weather and load data.",
    color: "#7c3aed",
  },
  {
    step: 3,
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#0891b2" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    label: "ML Prediction Model",
    desc: "Ensemble machine learning models trained on 5 years of historical grid failure data.",
    color: "#0891b2",
  },
  {
    step: 4,
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#F59E0B" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    label: "Risk Score",
    desc: "Equipment is scored 0–100 with contributing factors broken down by category.",
    color: "#F59E0B",
  },
  {
    step: 5,
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#EF4444" strokeWidth="2">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    label: "Failure Prediction",
    desc: "Probability and expected timeframe of failure surfaced with confidence intervals.",
    color: "#EF4444",
  },
  {
    step: 6,
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#22C55E" strokeWidth="2">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    label: "AI Recommendation",
    desc: "Actionable maintenance recommendations generated and dispatched to field teams.",
    color: "#22C55E",
  },
];

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#2563EB" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
    title: "Real-Time Processing",
    desc: "Sensor data processed with sub-second latency using distributed stream processing.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#7c3aed" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: "Explainable AI",
    desc: "Every prediction includes SHAP-based feature importance so operators understand why.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#22C55E" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: "99.8% Uptime SLA",
    desc: "Redundant infrastructure ensures continuous monitoring even during partial outages.",
  },
];

export default function HowItWorksPage() {
  return (
    <div style={{ padding: "48px 32px", background: C.bg, minHeight: "100vh", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(37,99,235,0.08)", border: `1px solid rgba(37,99,235,0.2)`,
          borderRadius: 20, padding: "5px 16px", marginBottom: 16,
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.primary }}>AI Workflow</span>
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: C.text, margin: "0 0 12px" }}>How NEXORA Works</h1>
        <p style={{ fontSize: 16, color: C.muted, maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
          From raw sensor signals to actionable maintenance recommendations in seconds.
        </p>
      </div>

      {/* Workflow steps */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16,
        padding: "40px 32px", boxShadow: C.cardShadow, marginBottom: 40,
      }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "stretch", gap: 0 }}>
          {WORKFLOW_STEPS.map((step, i) => (
            <React.Fragment key={step.step}>
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                textAlign: "center", width: 148, padding: "0 8px",
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 16,
                  background: step.color + "12",
                  border: `2px solid ${step.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 12, flexShrink: 0,
                }}>
                  {step.icon}
                </div>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: step.color, color: "#fff",
                  fontSize: 11, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 10, flexShrink: 0,
                }}>
                  {step.step}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 6 }}>{step.label}</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{step.desc}</div>
              </div>
              {i < WORKFLOW_STEPS.length - 1 && (
                <div style={{
                  display: "flex", alignItems: "center", flexShrink: 0,
                  marginTop: 20, color: C.border,
                }}>
                  <svg viewBox="0 0 24 12" width="28" height="14" fill="none">
                    <line x1="0" y1="6" x2="16" y2="6" stroke="#CBD5E1" strokeWidth="1.5" />
                    <polygon points="14,2 22,6 14,10" fill="#CBD5E1" />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Feature cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20, marginBottom: 40 }}>
        {FEATURES.map(f => (
          <div key={f.title} style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
            padding: 24, boxShadow: C.cardShadow,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: "rgba(37,99,235,0.06)", border: `1px solid rgba(37,99,235,0.1)`,
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
            }}>
              {f.icon}
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8 }}>{f.title}</h3>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Data flow diagram */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 12, padding: 32, boxShadow: C.cardShadow,
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 24, textAlign: "center" }}>
          Data Architecture
        </h2>
        <svg viewBox="0 0 700 220" style={{ width: "100%" }}>
          {/* Boxes */}
          {[
            { x: 20, y: 80, w: 100, h: 60, label: "IoT Sensors", sub: "1M+ data points/day", color: "#2563EB" },
            { x: 190, y: 80, w: 100, h: 60, label: "Stream Processor", sub: "Apache Kafka", color: "#7c3aed" },
            { x: 360, y: 80, w: 100, h: 60, label: "ML Engine", sub: "XGBoost + LSTM", color: "#0891b2" },
            { x: 530, y: 80, w: 100, h: 60, label: "Dashboard API", sub: "REST / WebSocket", color: "#22C55E" },
          ].map(box => (
            <g key={box.label}>
              <rect x={box.x} y={box.y} width={box.w} height={box.h} rx="8"
                fill={box.color + "10"} stroke={box.color + "40"} strokeWidth="1.5" />
              <text x={box.x + box.w / 2} y={box.y + 26} textAnchor="middle" fontSize="11" fontWeight="700" fill={C.text}>{box.label}</text>
              <text x={box.x + box.w / 2} y={box.y + 42} textAnchor="middle" fontSize="10" fill={C.muted}>{box.sub}</text>
            </g>
          ))}
          {/* Arrows */}
          {[[120, 110, 190, 110], [290, 110, 360, 110], [460, 110, 530, 110]].map(([x1, y1, x2, y2], i) => (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2 - 8} y2={y2} stroke="#CBD5E1" strokeWidth="1.5" />
              <polygon points={`${x2},${y2} ${x2 - 8},${y2 - 5} ${x2 - 8},${y2 + 5}`} fill="#CBD5E1" />
            </g>
          ))}
          {/* Bottom label */}
          <text x="350" y="195" textAnchor="middle" fontSize="11" fill={C.muted}>
            End-to-end latency &lt; 2 seconds from sensor to dashboard
          </text>
        </svg>
      </div>
    </div>
  );
}
