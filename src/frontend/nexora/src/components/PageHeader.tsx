import React from "react";

interface Props {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  lastUpdate?: string;
}

export function PageHeader({ title, subtitle, actions, lastUpdate }: Props) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#f3f4f6", letterSpacing: "0.03em" }}>{title}</h1>
        {subtitle && <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "#6b7280" }}>{subtitle}</p>}
        {lastUpdate && <p style={{ margin: "2px 0 0", fontSize: "0.68rem", color: "#4b5563" }}>Last update: {lastUpdate}</p>}
      </div>
      {actions && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{actions}</div>}
    </div>
  );
}

export function Btn({ children, onClick, variant = "primary", disabled, small }: {
  children: React.ReactNode; onClick?: () => void; variant?: "primary"|"secondary"|"danger"|"warning"|"ghost"; disabled?: boolean; small?: boolean;
}) {
  const variants: Record<string, { bg: string; color: string; border: string }> = {
    primary:   { bg: "#1d4ed8", color: "#fff", border: "transparent" },
    secondary: { bg: "#1f2937", color: "#d1d5db", border: "#374151" },
    danger:    { bg: "#991b1b", color: "#fff", border: "transparent" },
    warning:   { bg: "#92400e", color: "#fde68a", border: "transparent" },
    ghost:     { bg: "transparent", color: "#6b7280", border: "#374151" },
  };
  const v = variants[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ background: v.bg, color: v.color, border: `1px solid ${v.border}`, borderRadius: 6, padding: small ? "4px 10px" : "7px 14px", fontSize: small ? "0.72rem" : "0.78rem", fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, whiteSpace: "nowrap" }}
    >
      {children}
    </button>
  );
}
