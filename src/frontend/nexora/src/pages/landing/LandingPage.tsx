import { useNavigate } from "react-router-dom";

const NAV_LINKS = ["Home", "Features", "How It Works", "About", "Contact"];

function PowerLineHero() {
  return (
    <svg viewBox="0 0 900 320" style={{ width: "100%", opacity: 0.55 }} xmlns="http://www.w3.org/2000/svg">
      {/* Tower 1 */}
      <g stroke="#7dd3fc" strokeWidth="1.5" fill="none">
        <line x1="80" y1="280" x2="100" y2="140" />
        <line x1="120" y1="280" x2="100" y2="140" />
        <line x1="70" y1="190" x2="130" y2="190" />
        <line x1="75" y1="215" x2="125" y2="215" />
        <line x1="85" y1="160" x2="115" y2="160" />
        <line x1="70" y1="190" x2="85" y2="160" />
        <line x1="130" y1="190" x2="115" y2="160" />
        <circle cx="70" cy="190" r="3" fill="#7dd3fc" />
        <circle cx="130" cy="190" r="3" fill="#7dd3fc" />
        <circle cx="100" cy="140" r="3" fill="#38bdf8" />
      </g>
      {/* Tower 2 */}
      <g stroke="#7dd3fc" strokeWidth="1.5" fill="none" transform="translate(350,0)">
        <line x1="80" y1="280" x2="100" y2="140" />
        <line x1="120" y1="280" x2="100" y2="140" />
        <line x1="70" y1="190" x2="130" y2="190" />
        <line x1="75" y1="215" x2="125" y2="215" />
        <line x1="85" y1="160" x2="115" y2="160" />
        <line x1="70" y1="190" x2="85" y2="160" />
        <line x1="130" y1="190" x2="115" y2="160" />
        <circle cx="70" cy="190" r="3" fill="#7dd3fc" />
        <circle cx="130" cy="190" r="3" fill="#7dd3fc" />
        <circle cx="100" cy="140" r="3" fill="#38bdf8" />
      </g>
      {/* Tower 3 */}
      <g stroke="#7dd3fc" strokeWidth="1.5" fill="none" transform="translate(700,0)">
        <line x1="80" y1="280" x2="100" y2="140" />
        <line x1="120" y1="280" x2="100" y2="140" />
        <line x1="70" y1="190" x2="130" y2="190" />
        <line x1="75" y1="215" x2="125" y2="215" />
        <line x1="85" y1="160" x2="115" y2="160" />
        <line x1="70" y1="190" x2="85" y2="160" />
        <line x1="130" y1="190" x2="115" y2="160" />
        <circle cx="70" cy="190" r="3" fill="#7dd3fc" />
        <circle cx="130" cy="190" r="3" fill="#7dd3fc" />
        <circle cx="100" cy="140" r="3" fill="#38bdf8" />
      </g>
      {/* Power lines connecting towers */}
      <path d="M 70,190 Q 215,210 420,190" stroke="#38bdf8" strokeWidth="1" fill="none" opacity="0.7" />
      <path d="M 130,190 Q 275,208 480,190" stroke="#38bdf8" strokeWidth="1" fill="none" opacity="0.7" />
      <path d="M 420,190 Q 570,210 770,190" stroke="#38bdf8" strokeWidth="1" fill="none" opacity="0.7" />
      <path d="M 480,190 Q 630,208 830,190" stroke="#38bdf8" strokeWidth="1" fill="none" opacity="0.7" />
      {/* Top lines */}
      <path d="M 100,140 Q 300,120 450,140" stroke="#93c5fd" strokeWidth="0.8" fill="none" opacity="0.5" />
      <path d="M 450,140 Q 620,120 800,140" stroke="#93c5fd" strokeWidth="0.8" fill="none" opacity="0.5" />
      {/* Ground glow */}
      <ellipse cx="450" cy="290" rx="400" ry="20" fill="url(#groundGlow)" opacity="0.3" />
      <defs>
        <radialGradient id="groundGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
    </svg>
  );
}

const FEATURE_CARDS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#facc15" strokeWidth="2">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: "Early Fault Detection",
    desc: "Identify equipment failures up to 30 days in advance using multivariate sensor analysis and anomaly detection.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#a78bfa" strokeWidth="2">
        <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" />
        <path d="M12 6v6l4 2" />
        <circle cx="12" cy="12" r="3" fill="#a78bfa" opacity="0.3" />
      </svg>
    ),
    title: "AI-Powered Insights",
    desc: "Machine learning models trained on historical grid data deliver actionable predictions with confidence scores.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#4ade80" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: "Reliable & Sustainable",
    desc: "Minimize carbon footprint and energy waste by ensuring optimal equipment health and reducing unplanned outages.",
  },
];

const STATS = [
  { value: "1M+", label: "Data Points Daily" },
  { value: "$1M+", label: "Savings Generated" },
  { value: "70%", label: "Outage Reduction" },
  { value: "24/7", label: "Real-time Monitoring" },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "#060e1e", fontFamily: "Inter, system-ui, sans-serif", color: "#f1f5f9" }}>
      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(6,14,30,0.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(56,189,248,0.12)",
        padding: "0 24px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: "linear-gradient(135deg,#2563eb,#38bdf8)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="2.5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="rgba(255,255,255,0.3)" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: "-0.3px", color: "#fff" }}>NEXORA</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {NAV_LINKS.map(link => (
            <a
              key={link}
              href={link === "Home" ? "/" : `/${link.toLowerCase().replace(/\s+/g, "-")}`}
              style={{ color: "#94a3b8", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#f1f5f9")}
              onMouseLeave={e => (e.currentTarget.style.color = "#94a3b8")}
            >
              {link}
            </a>
          ))}
          <button
            onClick={() => navigate("/login")}
            style={{
              background: "#2563eb", color: "#fff", border: "none", borderRadius: 8,
              padding: "8px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#1d4ed8")}
            onMouseLeave={e => (e.currentTarget.style.background = "#2563eb")}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: "calc(100vh - 64px)",
        background: "linear-gradient(160deg, #060e1e 0%, #0b1a2e 50%, #060e1e 100%)",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", textAlign: "center",
        padding: "60px 24px 40px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Background glow blobs */}
        <div style={{
          position: "absolute", top: "10%", left: "15%",
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "10%", right: "10%",
          width: 350, height: 350, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Power line illustration */}
        <div style={{ width: "100%", maxWidth: 900, marginBottom: 32, position: "relative" }}>
          <PowerLineHero />
        </div>

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.4)",
          borderRadius: 20, padding: "6px 16px", marginBottom: 24,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#38bdf8", display: "inline-block" }} />
          <span style={{ fontSize: 13, color: "#93c5fd", fontWeight: 500 }}>AI-Powered Grid Intelligence Platform</span>
        </div>

        <h1 style={{
          fontSize: "clamp(32px,5vw,62px)", fontWeight: 800,
          lineHeight: 1.15, maxWidth: 700, margin: "0 auto 20px",
          letterSpacing: "-1px",
          background: "linear-gradient(135deg, #ffffff 0%, #93c5fd 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Predict. Prevent.<br />Power a Brighter Tomorrow.
        </h1>

        <p style={{
          fontSize: 18, color: "#94a3b8", maxWidth: 560,
          margin: "0 auto 40px", lineHeight: 1.7,
        }}>
          NEXORA uses real-time sensor data and machine learning to predict grid failures before they happen — keeping the lights on for millions.
        </p>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={() => navigate("/login")}
            style={{
              background: "#2563eb", color: "#fff", border: "none",
              borderRadius: 10, padding: "14px 32px", fontSize: 16, fontWeight: 600,
              cursor: "pointer", transition: "all 0.2s",
              boxShadow: "0 0 24px rgba(37,99,235,0.4)",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#1d4ed8"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Get Started →
          </button>
          <button
            style={{
              background: "transparent", color: "#f1f5f9",
              border: "1px solid rgba(241,245,249,0.2)",
              borderRadius: 10, padding: "14px 32px", fontSize: 16, fontWeight: 600,
              cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(241,245,249,0.5)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(241,245,249,0.2)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            ▶ Watch Demo
          </button>
        </div>
      </section>

      {/* ── FEATURE CARDS ───────────────────────────────────────────────── */}
      <section style={{
        background: "#0a1628",
        padding: "80px 24px",
        borderTop: "1px solid rgba(56,189,248,0.08)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: 36, fontWeight: 700, marginBottom: 12, color: "#f1f5f9" }}>
            Why NEXORA?
          </h2>
          <p style={{ textAlign: "center", color: "#64748b", fontSize: 16, marginBottom: 56 }}>
            Built for utility providers who need reliability at scale
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
            {FEATURE_CARDS.map(card => (
              <div key={card.title} style={{
                background: "linear-gradient(135deg,#0f1e38 0%,#0d1a30 100%)",
                border: "1px solid rgba(56,189,248,0.15)",
                borderRadius: 16, padding: 32,
                transition: "transform 0.2s, border-color 0.2s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(56,189,248,0.35)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(56,189,248,0.15)"; }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: "rgba(56,189,248,0.08)", display: "flex",
                  alignItems: "center", justifyContent: "center", marginBottom: 20,
                }}>
                  {card.icon}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: "#f1f5f9" }}>{card.title}</h3>
                <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.7 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────────────────── */}
      <section style={{
        background: "linear-gradient(135deg,#0b1a2e 0%,#0f2040 100%)",
        padding: "64px 24px",
        borderTop: "1px solid rgba(56,189,248,0.08)",
      }}>
        <div style={{
          maxWidth: 900, margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
          gap: 40, textAlign: "center",
        }}>
          {STATS.map(s => (
            <div key={s.value}>
              <div style={{
                fontSize: "clamp(32px,4vw,48px)", fontWeight: 800,
                background: "linear-gradient(135deg,#38bdf8,#2563eb)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                marginBottom: 8,
              }}>
                {s.value}
              </div>
              <div style={{ fontSize: 15, color: "#64748b" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer style={{
        background: "#060e1e", borderTop: "1px solid rgba(56,189,248,0.08)",
        padding: "28px 24px", textAlign: "center",
        color: "#475569", fontSize: 13,
      }}>
        © 2025 NEXORA — AI Grid Intelligence. All rights reserved.
      </footer>
    </div>
  );
}

