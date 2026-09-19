import React from "react";

interface Props {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  lastUpdate?: string;
}

export function PageHeader({ title, subtitle, actions, lastUpdate }: Props) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      marginBottom: 24, flexWrap: "wrap", gap: 12,
      paddingBottom: 20,
      borderBottom: "1px solid rgba(56,189,248,0.08)",
    }}>
      <div>
        <h1 style={{
          margin: 0, fontSize: "1.35rem", fontWeight: 800,
          color: "#e2e8f0", letterSpacing: "0.02em", lineHeight: 1.2,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ margin: "5px 0 0", fontSize: "0.8rem", color: "#475569", fontWeight: 400 }}>
            {subtitle}
          </p>
        )}
        {lastUpdate && (
          <p style={{ margin: "3px 0 0", fontSize: "0.68rem", color: "#334155", display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#38bdf8", display: "inline-block", boxShadow: "0 0 6px #38bdf8" }} />
            Last update: {lastUpdate}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {actions}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Btn — Premium NEXORA Button
// ============================================================
export function Btn({
  children, onClick, variant = "primary", disabled, small,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "warning" | "ghost";
  disabled?: boolean;
  small?: boolean;
}) {
  const variants: Record<string, { bg: string; color: string; border: string; hover: string; glow: string }> = {
    primary:   {
      bg: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
      color: "#fff", border: "transparent",
      hover: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
      glow: "rgba(56,189,248,0.3)",
    },
    secondary: {
      bg: "rgba(15,23,42,0.8)",
      color: "#cbd5e1", border: "rgba(56,189,248,0.2)",
      hover: "rgba(30,41,59,0.8)",
      glow: "rgba(56,189,248,0.1)",
    },
    danger:    {
      bg: "rgba(127,29,29,0.6)",
      color: "#fca5a5", border: "rgba(248,113,113,0.3)",
      hover: "rgba(153,27,27,0.8)",
      glow: "rgba(248,113,113,0.2)",
    },
    warning:   {
      bg: "rgba(120,53,15,0.6)",
      color: "#fde68a", border: "rgba(251,191,36,0.3)",
      hover: "rgba(146,64,14,0.8)",
      glow: "rgba(251,191,36,0.2)",
    },
    ghost:     {
      bg: "transparent",
      color: "#64748b", border: "rgba(51,65,85,0.6)",
      hover: "rgba(56,189,248,0.05)",
      glow: "transparent",
    },
  };
  const v = variants[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: v.bg, color: v.color,
        border: `1px solid ${v.border}`,
        borderRadius: 8,
        padding: small ? "5px 12px" : "8px 16px",
        fontSize: small ? "0.72rem" : "0.8rem",
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        whiteSpace: "nowrap",
        transition: "all 0.2s ease",
        letterSpacing: "0.02em",
        boxShadow: disabled ? "none" : `0 2px 12px ${v.glow}`,
      }}
      onMouseEnter={e => {
        if (!disabled) {
          (e.currentTarget as HTMLElement).style.background = v.hover;
          (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 20px ${v.glow}`;
          (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={e => {
        if (!disabled) {
          (e.currentTarget as HTMLElement).style.background = v.bg;
          (e.currentTarget as HTMLElement).style.boxShadow = `0 2px 12px ${v.glow}`;
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        }
      }}
    >
      {children}
    </button>
  );
}
