
const C = {
  bg: "#F5F8FC", surface: "#FFFFFF", border: "#E2E8F0",
  text: "#0F172A", muted: "#64748B", primary: "#2563EB",
  success: "#22C55E",
  cardShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)",
};

const TEAM = [
  { name: "Dr. Priya Sharma", role: "Chief AI Officer", initials: "PS", grad: "135deg,#2563eb,#7c3aed" },
  { name: "Aarav Mehta", role: "Engineering Lead", initials: "AM", grad: "135deg,#0891b2,#2563eb" },
  { name: "Jordan Lee", role: "Data Science Lead", initials: "JL", grad: "135deg,#7c3aed,#ec4899" },
  { name: "Sam Rivera", role: "Product Manager", initials: "SR", grad: "135deg,#22C55E,#0891b2" },
];

const TECH_STACK = [
  { name: "React + TypeScript", category: "Frontend" },
  { name: "Python / FastAPI", category: "Backend" },
  { name: "XGBoost + LSTM", category: "ML Models" },
  { name: "Apache Kafka", category: "Stream Processing" },
  { name: "PostgreSQL + TimescaleDB", category: "Database" },
  { name: "IBM watsonx.ai", category: "AI Platform" },
];

export default function AboutPage() {
  return (
    <div style={{ padding: "48px 32px", background: C.bg, minHeight: "100vh", maxWidth: 1100, margin: "0 auto" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16, margin: "0 auto 16px",
          background: "linear-gradient(135deg,#2563eb,#38bdf8)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" strokeWidth="2.5">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="rgba(255,255,255,0.3)" />
          </svg>
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: C.text, margin: "0 0 12px" }}>About NEXORA</h1>
        <p style={{ fontSize: 16, color: C.muted, maxWidth: 600, margin: "0 auto", lineHeight: 1.7 }}>
          NEXORA is an AI-powered grid intelligence platform built to help utility providers predict failures,
          prevent outages, and power a more reliable and sustainable future.
        </p>
      </div>

      {/* Mission */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16,
        padding: "32px 40px", boxShadow: C.cardShadow, marginBottom: 32,
        textAlign: "center",
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.primary, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>
          Our Mission
        </div>
        <p style={{ fontSize: 18, color: C.text, lineHeight: 1.7, maxWidth: 700, margin: "0 auto", fontWeight: 500 }}>
          "To eliminate unplanned power outages by giving grid operators AI-powered visibility and actionable intelligence — 
          keeping critical infrastructure running and communities powered."
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16, marginBottom: 40 }}>
        {[
          { val: "2022", label: "Founded" },
          { val: "50+", label: "Utility Clients" },
          { val: "15M+", label: "Assets Monitored" },
          { val: "99.8%", label: "Platform Uptime" },
        ].map(s => (
          <div key={s.label} style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
            padding: "20px 16px", textAlign: "center", boxShadow: C.cardShadow,
          }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.primary, marginBottom: 4 }}>{s.val}</div>
            <div style={{ fontSize: 13, color: C.muted }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Team */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 8 }}>Leadership Team</h2>
        <p style={{ fontSize: 14, color: C.muted, marginBottom: 24 }}>The people behind the platform</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 20 }}>
          {TEAM.map(m => (
            <div key={m.name} style={{
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
              padding: "24px 20px", textAlign: "center", boxShadow: C.cardShadow,
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%", margin: "0 auto 14px",
                background: `linear-gradient(${m.grad})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 18, fontWeight: 700,
              }}>
                {m.initials}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{m.name}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{m.role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 8 }}>Technology Stack</h2>
        <p style={{ fontSize: 14, color: C.muted, marginBottom: 24 }}>Built on modern, battle-tested infrastructure</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
          {TECH_STACK.map(t => (
            <div key={t.name} style={{
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
              padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center",
              boxShadow: C.cardShadow,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{t.name}</div>
              <span style={{
                background: "rgba(37,99,235,0.08)", color: C.primary,
                fontSize: 11, borderRadius: 6, padding: "2px 8px", fontWeight: 500,
              }}>{t.category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
