import React from "react";

// ============================================================
// HealthBar
// ============================================================
interface HealthBarProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function HealthBar({ score, size = "md", showLabel = true }: HealthBarProps) {
  const color = score >= 75 ? "#4ade80" : score >= 50 ? "#fbbf24" : "#f87171";
  const glowColor = score >= 75 ? "rgba(74,222,128,0.4)" : score >= 50 ? "rgba(251,191,36,0.4)" : "rgba(248,113,113,0.4)";
  const h = size === "sm" ? 4 : size === "lg" ? 8 : 6;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: h, background: "rgba(30,41,59,0.8)", borderRadius: h, overflow: "hidden" }}>
        <div style={{
          width: `${score}%`, height: "100%", background: color, borderRadius: h,
          transition: "width 0.5s ease",
          boxShadow: `0 0 8px ${glowColor}`,
        }} />
      </div>
      {showLabel && <span style={{ fontSize: "0.72rem", color, fontWeight: 700, minWidth: 28 }}>{score.toFixed(0)}</span>}
    </div>
  );
}

// ============================================================
// StatusBadge
// ============================================================
interface BadgeProps {
  status: "critical" | "warning" | "normal" | string;
  small?: boolean;
}

export function StatusBadge({ status, small }: BadgeProps) {
  const map: Record<string, { bg: string; color: string; label: string; glow: string }> = {
    critical:    { bg: "rgba(127,29,29,0.4)",  color: "#f87171", label: "CRITICAL",   glow: "rgba(248,113,113,0.3)" },
    warning:     { bg: "rgba(120,53,15,0.4)",  color: "#fbbf24", label: "WARNING",    glow: "rgba(251,191,36,0.3)" },
    normal:      { bg: "rgba(22,101,52,0.4)",  color: "#4ade80", label: "NORMAL",     glow: "rgba(74,222,128,0.3)" },
    high:        { bg: "rgba(88,28,135,0.4)",  color: "#c084fc", label: "HIGH",       glow: "rgba(192,132,252,0.3)" },
    medium:      { bg: "rgba(51,65,85,0.4)",   color: "#94a3b8", label: "MEDIUM",     glow: "transparent" },
    low:         { bg: "rgba(22,101,52,0.4)",  color: "#4ade80", label: "LOW",        glow: "rgba(74,222,128,0.3)" },
    active:      { bg: "rgba(127,29,29,0.4)",  color: "#f87171", label: "ACTIVE",     glow: "rgba(248,113,113,0.3)" },
    acknowledged:{ bg: "rgba(51,65,85,0.4)",   color: "#94a3b8", label: "ACK",        glow: "transparent" },
    resolved:    { bg: "rgba(22,101,52,0.4)",  color: "#4ade80", label: "RESOLVED",   glow: "rgba(74,222,128,0.3)" },
    pending:     { bg: "rgba(120,53,15,0.4)",  color: "#fbbf24", label: "PENDING",    glow: "rgba(251,191,36,0.3)" },
    scheduled:   { bg: "rgba(55,48,163,0.4)",  color: "#818cf8", label: "SCHED.",     glow: "rgba(129,140,248,0.3)" },
    planned:     { bg: "rgba(51,65,85,0.4)",   color: "#94a3b8", label: "PLANNED",    glow: "transparent" },
    "in-progress":{ bg: "rgba(14,116,144,0.3)",color: "#38bdf8", label: "IN PROG.",   glow: "rgba(56,189,248,0.3)" },
    completed:   { bg: "rgba(22,101,52,0.4)",  color: "#4ade80", label: "DONE",       glow: "rgba(74,222,128,0.3)" },
    deployed:    { bg: "rgba(22,101,52,0.4)",  color: "#4ade80", label: "DEPLOYED",   glow: "rgba(74,222,128,0.3)" },
    "en-route":  { bg: "rgba(14,116,144,0.3)", color: "#38bdf8", label: "EN ROUTE",   glow: "rgba(56,189,248,0.3)" },
    standby:     { bg: "rgba(120,53,15,0.4)",  color: "#fbbf24", label: "STANDBY",    glow: "rgba(251,191,36,0.3)" },
    available:   { bg: "rgba(22,101,52,0.4)",  color: "#4ade80", label: "AVAILABLE",  glow: "rgba(74,222,128,0.3)" },
  };
  const s = map[status] ?? { bg: "rgba(51,65,85,0.4)", color: "#94a3b8", label: status.toUpperCase(), glow: "transparent" };
  const fs = small ? "0.6rem" : "0.68rem";
  return (
    <span style={{
      background: s.bg, color: s.color,
      border: `1px solid ${s.color}55`,
      borderRadius: 5, padding: small ? "1px 6px" : "2px 9px",
      fontSize: fs, fontWeight: 700, letterSpacing: "0.05em", whiteSpace: "nowrap",
      boxShadow: `0 0 8px ${s.glow}`,
    }}>
      {s.label}
    </span>
  );
}

// ============================================================
// RiskBadge
// ============================================================
interface RiskBadgeProps { probability: number; small?: boolean }
export function RiskBadge({ probability, small }: RiskBadgeProps) {
  const pct = Math.round(probability * 100);
  const status = pct >= 65 ? "critical" : pct >= 45 ? "warning" : pct >= 25 ? "high" : "normal";
  return <StatusBadge status={status} small={small} />;
}

// ============================================================
// KPICard
// ============================================================
interface KPICardProps {
  label: string;
  value: string | number;
  sub?: string;
  variant?: "default" | "critical" | "warning" | "ok" | "info";
  icon?: React.ReactNode;
}
export function KPICard({ label, value, sub, variant = "default", icon }: KPICardProps) {
  const colors: Record<string, { border: string; accent: string; glow: string; bg: string }> = {
    default:  { border: "rgba(56,189,248,0.15)",  accent: "#94a3b8", glow: "transparent",          bg: "rgba(10,22,40,0.8)" },
    critical: { border: "rgba(248,113,113,0.35)", accent: "#f87171", glow: "rgba(248,113,113,0.1)", bg: "rgba(127,29,29,0.15)" },
    warning:  { border: "rgba(251,191,36,0.35)",  accent: "#fbbf24", glow: "rgba(251,191,36,0.1)",  bg: "rgba(120,53,15,0.15)" },
    ok:       { border: "rgba(74,222,128,0.3)",   accent: "#4ade80", glow: "rgba(74,222,128,0.1)",  bg: "rgba(22,101,52,0.12)" },
    info:     { border: "rgba(56,189,248,0.3)",   accent: "#38bdf8", glow: "rgba(56,189,248,0.1)",  bg: "rgba(14,116,144,0.12)" },
  };
  const c = colors[variant];
  return (
    <div style={{
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 12, padding: "16px 18px", minWidth: 0,
      boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px rgba(56,189,248,0.04) inset`,
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      backdropFilter: "blur(8px)",
      position: "relative", overflow: "hidden",
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
      (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 30px rgba(0,0,0,0.5), 0 0 20px ${c.glow}`;
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px rgba(56,189,248,0.04) inset`;
    }}>
      {/* Subtle corner glow */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: 60, height: 60,
        background: `radial-gradient(circle, ${c.glow} 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />
      <div style={{
        fontSize: "0.68rem", color: "#64748b", textTransform: "uppercase",
        letterSpacing: "0.08em", marginBottom: 6,
        display: "flex", gap: 6, alignItems: "center",
      }}>
        {icon}<span>{label}</span>
      </div>
      <div style={{ fontSize: "1.65rem", fontWeight: 800, color: c.accent, lineHeight: 1.1, letterSpacing: "-0.02em" }}>{value}</div>
      {sub && <div style={{ fontSize: "0.7rem", color: "#475569", marginTop: 5, fontWeight: 500 }}>{sub}</div>}
    </div>
  );
}

// ============================================================
// Table
// ============================================================
interface TableProps {
  headers: string[];
  children: React.ReactNode;
  compact?: boolean;
}
export function Table({ headers, children, compact }: TableProps) {
  const p = compact ? "6px 12px" : "11px 14px";
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h} style={{
                padding: p, textAlign: "left",
                color: "#38bdf8", fontWeight: 600,
                borderBottom: "1px solid rgba(56,189,248,0.12)",
                whiteSpace: "nowrap",
                background: "rgba(8,20,40,0.6)",
                fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.07em",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function TR({ children, onClick, highlighted }: { children: React.ReactNode; onClick?: () => void; highlighted?: boolean }) {
  return (
    <tr
      onClick={onClick}
      style={{
        cursor: onClick ? "pointer" : undefined,
        background: highlighted ? "rgba(56,189,248,0.08)" : undefined,
        borderBottom: "1px solid rgba(30,41,59,0.6)",
        transition: "background 0.15s",
      }}
      onMouseEnter={e => { if (!highlighted) (e.currentTarget as HTMLElement).style.background = "rgba(56,189,248,0.04)"; }}
      onMouseLeave={e => { if (!highlighted) (e.currentTarget as HTMLElement).style.background = ""; }}>
      {children}
    </tr>
  );
}

export function TD({ children, muted, right }: { children: React.ReactNode; muted?: boolean; right?: boolean }) {
  return (
    <td style={{
      padding: "10px 14px",
      color: muted ? "#475569" : "#cbd5e1",
      textAlign: right ? "right" : "left",
      whiteSpace: "nowrap",
      fontSize: "0.8rem",
    }}>
      {children}
    </td>
  );
}

// ============================================================
// Panel (GlassPanel)
// ============================================================
export function Panel({ title, children, actions }: { title?: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div style={{
      background: "rgba(8,20,40,0.7)",
      border: "1px solid rgba(56,189,248,0.12)",
      borderRadius: 14, overflow: "hidden",
      boxShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(56,189,248,0.06)",
      backdropFilter: "blur(10px)",
    }}>
      {title && (
        <div style={{
          padding: "13px 18px",
          borderBottom: "1px solid rgba(56,189,248,0.08)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "rgba(14,116,144,0.04)",
        }}>
          <span style={{
            fontWeight: 700, fontSize: "0.78rem", color: "#e2e8f0",
            letterSpacing: "0.04em", textTransform: "uppercase",
          }}>{title}</span>
          {actions}
        </div>
      )}
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
}

// ============================================================
// Spinner
// ============================================================
export function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 60, flexDirection: "column", gap: 16 }}>
      <div style={{
        width: 36, height: 36,
        border: "2px solid rgba(56,189,248,0.1)",
        borderTop: "2px solid #38bdf8",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
        boxShadow: "0 0 12px rgba(56,189,248,0.3)",
      }} />
      <span style={{ fontSize: "0.72rem", color: "#38bdf8", letterSpacing: "0.1em", opacity: 0.7 }}>LOADING</span>
    </div>
  );
}

// ============================================================
// EmptyState / ErrorState
// ============================================================
export function EmptyState({ message }: { message: string }) {
  return (
    <div style={{
      textAlign: "center", padding: "40px 20px",
      color: "#334155", fontSize: "0.85rem",
    }}>
      <div style={{ fontSize: "2rem", marginBottom: 10, opacity: 0.3 }}>◌</div>
      <div>{message}</div>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div style={{
      textAlign: "center", padding: "40px 20px",
      color: "#f87171", fontSize: "0.85rem",
    }}>
      <div style={{ fontSize: "2rem", marginBottom: 10 }}>⚠</div>
      <div>{message}</div>
    </div>
  );
}

// ============================================================
// SyntheticBadge
// ============================================================
export function SyntheticBadge() {
  return (
    <span style={{
      background: "rgba(51,65,85,0.4)",
      color: "#475569",
      border: "1px solid rgba(71,85,105,0.4)",
      borderRadius: 5, padding: "2px 8px",
      fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.06em",
    }}>
      SYNTHETIC DATA
    </span>
  );
}

// ============================================================
// SensorCard
// ============================================================
export function SensorCard({ label, value, unit, warnAbove, critAbove, warnBelow, critBelow }: {
  label: string; value: number | string; unit: string;
  warnAbove?: number; critAbove?: number; warnBelow?: number; critBelow?: number;
}) {
  const v = parseFloat(String(value));
  let color = "#4ade80"; let bg = "rgba(22,101,52,0.2)"; let border = "rgba(74,222,128,0.25)";
  if (critAbove !== undefined && v >= critAbove) { color = "#f87171"; bg = "rgba(127,29,29,0.2)"; border = "rgba(248,113,113,0.25)"; }
  else if (warnAbove !== undefined && v >= warnAbove) { color = "#fbbf24"; bg = "rgba(120,53,15,0.2)"; border = "rgba(251,191,36,0.25)"; }
  else if (critBelow !== undefined && v <= critBelow) { color = "#f87171"; bg = "rgba(127,29,29,0.2)"; border = "rgba(248,113,113,0.25)"; }
  else if (warnBelow !== undefined && v <= warnBelow) { color = "#fbbf24"; bg = "rgba(120,53,15,0.2)"; border = "rgba(251,191,36,0.25)"; }
  return (
    <div style={{
      background: bg, border: `1px solid ${border}`, borderRadius: 10,
      padding: "14px 16px", textAlign: "center",
      boxShadow: `0 0 16px rgba(0,0,0,0.3)`,
      transition: "transform 0.2s",
    }}
    onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"}
    onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "translateY(0)"}>
      <div style={{ fontSize: "0.65rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: "1.35rem", fontWeight: 800, color, letterSpacing: "-0.02em" }}>{value}</div>
      <div style={{ fontSize: "0.65rem", color: "#475569", marginTop: 4 }}>{unit}</div>
    </div>
  );
}
