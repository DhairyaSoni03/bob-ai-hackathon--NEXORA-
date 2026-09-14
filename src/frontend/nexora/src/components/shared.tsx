import React from "react";

interface Props {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function HealthBar({ score, size = "md", showLabel = true }: Props) {
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  const h = size === "sm" ? 4 : size === "lg" ? 10 : 6;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ flex: 1, height: h, background: "#2d3748", borderRadius: h, overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: h, transition: "width .4s" }} />
      </div>
      {showLabel && <span style={{ fontSize: "0.75rem", color, fontWeight: 600, minWidth: 28 }}>{score.toFixed(0)}</span>}
    </div>
  );
}

interface BadgeProps {
  status: "critical" | "warning" | "normal" | string;
  small?: boolean;
}

export function StatusBadge({ status, small }: BadgeProps) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    critical: { bg: "#450a0a", color: "#f87171", label: "CRITICAL" },
    warning:  { bg: "#451a03", color: "#fbbf24", label: "WARNING" },
    normal:   { bg: "#052e16", color: "#4ade80", label: "NORMAL" },
    high:     { bg: "#3b0764", color: "#c084fc", label: "HIGH" },
    medium:   { bg: "#1c1917", color: "#a3a3a3", label: "MEDIUM" },
    low:      { bg: "#052e16", color: "#4ade80", label: "LOW" },
    active:   { bg: "#450a0a", color: "#f87171", label: "ACTIVE" },
    acknowledged: { bg: "#1c1917", color: "#a3a3a3", label: "ACK" },
    resolved: { bg: "#052e16", color: "#4ade80", label: "RESOLVED" },
    pending:  { bg: "#451a03", color: "#fbbf24", label: "PENDING" },
    scheduled: { bg: "#1e1b4b", color: "#818cf8", label: "SCHED." },
    planned:  { bg: "#1c1917", color: "#a3a3a3", label: "PLANNED" },
    "in-progress": { bg: "#1e3a5f", color: "#60a5fa", label: "IN PROG." },
    completed: { bg: "#052e16", color: "#4ade80", label: "DONE" },
    deployed:  { bg: "#052e16", color: "#4ade80", label: "DEPLOYED" },
    "en-route": { bg: "#1e3a5f", color: "#60a5fa", label: "EN ROUTE" },
    standby:  { bg: "#451a03", color: "#fbbf24", label: "STANDBY" },
    available: { bg: "#052e16", color: "#4ade80", label: "AVAILABLE" },
  };
  const s = map[status] ?? { bg: "#1c1917", color: "#a3a3a3", label: status.toUpperCase() };
  const fs = small ? "0.62rem" : "0.7rem";
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}33`, borderRadius: 4, padding: small ? "1px 5px" : "2px 8px", fontSize: fs, fontWeight: 700, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
}

interface RiskBadgeProps { probability: number; small?: boolean }
export function RiskBadge({ probability, small }: RiskBadgeProps) {
  const pct = Math.round(probability * 100);
  const status = pct >= 65 ? "critical" : pct >= 45 ? "warning" : pct >= 25 ? "high" : "normal";
  return <StatusBadge status={status} small={small} />;
}

interface KPICardProps {
  label: string;
  value: string | number;
  sub?: string;
  variant?: "default" | "critical" | "warning" | "ok" | "info";
  icon?: React.ReactNode;
}
export function KPICard({ label, value, sub, variant = "default", icon }: KPICardProps) {
  const colors: Record<string, { border: string; accent: string }> = {
    default:  { border: "#374151", accent: "#9ca3af" },
    critical: { border: "#ef4444", accent: "#f87171" },
    warning:  { border: "#f59e0b", accent: "#fbbf24" },
    ok:       { border: "#22c55e", accent: "#4ade80" },
    info:     { border: "#3b82f6", accent: "#60a5fa" },
  };
  const c = colors[variant];
  return (
    <div style={{ background: "#111827", border: `1px solid ${c.border}`, borderRadius: 8, padding: "14px 18px", minWidth: 0 }}>
      <div style={{ fontSize: "0.72rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4, display: "flex", gap: 6, alignItems: "center" }}>
        {icon}{label}
      </div>
      <div style={{ fontSize: "1.6rem", fontWeight: 700, color: c.accent, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: "0.72rem", color: "#6b7280", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

interface TableProps {
  headers: string[];
  children: React.ReactNode;
  compact?: boolean;
}
export function Table({ headers, children, compact }: TableProps) {
  const p = compact ? "6px 10px" : "10px 14px";
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h} style={{ padding: p, textAlign: "left", color: "#9ca3af", fontWeight: 600, borderBottom: "1px solid #1f2937", whiteSpace: "nowrap", background: "#0f172a", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
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
    <tr onClick={onClick} style={{ cursor: onClick ? "pointer" : undefined, background: highlighted ? "#1a2744" : undefined, borderBottom: "1px solid #1f2937" }}
      onMouseEnter={e => { if (!highlighted) (e.currentTarget as HTMLElement).style.background = "#1f2937"; }}
      onMouseLeave={e => { if (!highlighted) (e.currentTarget as HTMLElement).style.background = ""; }}>
      {children}
    </tr>
  );
}

export function TD({ children, muted, right }: { children: React.ReactNode; muted?: boolean; right?: boolean }) {
  return <td style={{ padding: "9px 14px", color: muted ? "#6b7280" : "#e5e7eb", textAlign: right ? "right" : "left", whiteSpace: "nowrap" }}>{children}</td>;
}

export function Panel({ title, children, actions }: { title?: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div style={{ background: "#0f172a", border: "1px solid #1f2937", borderRadius: 10, overflow: "hidden" }}>
      {title && (
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #1f2937", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "#f3f4f6", letterSpacing: "0.03em", textTransform: "uppercase" }}>{title}</span>
          {actions}
        </div>
      )}
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
}

export function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 40 }}>
      <div style={{ width: 32, height: 32, border: "3px solid #1f2937", borderTop: "3px solid #3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <div style={{ textAlign: "center", padding: "40px 20px", color: "#6b7280", fontSize: "0.85rem" }}>{message}</div>;
}

export function ErrorState({ message }: { message: string }) {
  return <div style={{ textAlign: "center", padding: "40px 20px", color: "#f87171", fontSize: "0.85rem" }}>⚠ {message}</div>;
}

export function SyntheticBadge() {
  return (
    <span style={{ background: "#1c1917", color: "#78716c", border: "1px solid #44403c", borderRadius: 4, padding: "1px 6px", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.04em" }}>
      SYNTHETIC DATA
    </span>
  );
}

export function SensorCard({ label, value, unit, warnAbove, critAbove, warnBelow, critBelow }: {
  label: string; value: number | string; unit: string;
  warnAbove?: number; critAbove?: number; warnBelow?: number; critBelow?: number;
}) {
  const v = parseFloat(String(value));
  let color = "#4ade80"; let bg = "#052e16";
  if (critAbove !== undefined && v >= critAbove) { color = "#f87171"; bg = "#450a0a"; }
  else if (warnAbove !== undefined && v >= warnAbove) { color = "#fbbf24"; bg = "#451a03"; }
  else if (critBelow !== undefined && v <= critBelow) { color = "#f87171"; bg = "#450a0a"; }
  else if (warnBelow !== undefined && v <= warnBelow) { color = "#fbbf24"; bg = "#451a03"; }
  return (
    <div style={{ background: bg, border: `1px solid ${color}33`, borderRadius: 8, padding: "12px 14px", textAlign: "center" }}>
      <div style={{ fontSize: "0.68rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: "1.3rem", fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: "0.68rem", color: "#6b7280", marginTop: 2 }}>{unit}</div>
    </div>
  );
}
