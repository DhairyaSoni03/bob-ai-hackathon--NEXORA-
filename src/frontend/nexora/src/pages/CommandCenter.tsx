import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { fetchGridKPI, fetchAssets, fetchAlerts, fetchPredictions } from "../api/client";
import type { GridKPI, Asset, Alert, Prediction } from "../types";
import { KPICard, StatusBadge, Panel, Spinner, EmptyState, SyntheticBadge } from "../components/shared";
import { PageHeader } from "../components/PageHeader";

function riskColor(p: number) {
  return p >= 0.65 ? "#f87171" : p >= 0.45 ? "#fbbf24" : p >= 0.25 ? "#c084fc" : "#4ade80";
}

function RiskCircle({ probability }: { probability: number }) {
  const color = riskColor(probability);
  const pct = (probability * 100).toFixed(0);
  return (
    <div style={{
      minWidth: 52, height: 52, borderRadius: "50%",
      background: `${color}14`,
      border: `2px solid ${color}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 0 12px ${color}40`,
      flexShrink: 0,
    }}>
      <span style={{ fontSize: "0.82rem", fontWeight: 800, color }}>{pct}%</span>
    </div>
  );
}

export function CommandCenterPage() {
  const [kpi, setKpi] = useState<GridKPI | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [k, a, al, pr] = await Promise.all([
        fetchGridKPI(), fetchAssets(),
        fetchAlerts({ status: "active" }), fetchPredictions(),
      ]);
      setKpi(k);
      setAssets(a.assets ?? []);
      setAlerts(al.alerts ?? []);
      setPredictions(pr.predictions ?? []);
      setLoading(false);
    } catch {
      setError("Failed to load dashboard data. Is the backend running?");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  if (loading) return <Spinner />;
  if (error) return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "60px 30px", gap: 12,
    }}>
      <div style={{ fontSize: "2.5rem", opacity: 0.4 }}>⚡</div>
      <div style={{ color: "#f87171", fontSize: "0.9rem" }}>{error}</div>
      <div style={{ color: "#475569", fontSize: "0.75rem" }}>Backend may be offline. Showing cached demo data.</div>
    </div>
  );
  if (!kpi) return null;

  const criticalAssets = assets.filter(a => a.status === "critical").sort((a, b) => b.failure_probability - a.failure_probability);
  const highRiskAssets = assets.filter(a => a.failure_probability >= 0.35).sort((a, b) => b.failure_probability - a.failure_probability);
  const activeAlerts = alerts.filter(a => a.status === "active").slice(0, 8);

  const kpiVariant = (score: number) => score >= 75 ? "ok" : score >= 55 ? "warning" : "critical";
  const riskVariant = (label: string) => label === "critical" ? "critical" : label === "high" ? "warning" : "ok";

  return (
    <div className="nx-page">
      <PageHeader
        title="Command Center"
        subtitle="Predict before failure. Act before outage."
        lastUpdate={new Date(kpi.timestamp).toLocaleString()}
        actions={<SyntheticBadge />}
      />

      {/* KPI Row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))",
        gap: 12, marginBottom: 24,
      }}>
        <KPICard label="Grid Health" value={`${kpi.grid_health_score.toFixed(0)}/100`}
          sub="Overall system condition" variant={kpiVariant(kpi.grid_health_score)} icon="⚡" />
        <KPICard label="Outage Risk" value={`${(kpi.outage_risk_score * 100).toFixed(0)}%`}
          sub={kpi.outage_risk_label.toUpperCase()} variant={riskVariant(kpi.outage_risk_label)} icon="⚠" />
        <KPICard label="At-Risk Assets" value={kpi.at_risk_assets}
          sub={`${kpi.critical_assets} critical`} variant={kpi.at_risk_assets > 2 ? "critical" : "warning"} icon="◈" />
        <KPICard label="Critical Assets" value={kpi.critical_assets}
          sub={`${kpi.warning_assets} warning`} variant={kpi.critical_assets > 0 ? "critical" : "ok"} icon="◆" />
        <KPICard label="Customers at Risk" value={kpi.customers_potentially_affected.toLocaleString()}
          sub="Potentially affected" variant={kpi.customers_potentially_affected > 20000 ? "critical" : "warning"} icon="◉" />
        <KPICard label="Weather Risk" value={`${kpi.weather_risk.toFixed(1)}/10`}
          sub="Storm system active" variant={kpi.weather_risk > 6 ? "critical" : kpi.weather_risk > 4 ? "warning" : "ok"} icon="◌" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Critical Actions */}
        <Panel title={`Critical Actions (${criticalAssets.length})`}>
          {criticalAssets.length === 0
            ? <EmptyState message="No critical assets — all systems nominal" />
            : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {criticalAssets.slice(0, 4).map(a => (
                  <div key={a.id} style={{
                    background: "rgba(127,29,29,0.12)",
                    border: "1px solid rgba(248,113,113,0.2)",
                    borderRadius: 10, padding: "12px 14px",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(248,113,113,0.4)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(248,113,113,0.2)"}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <div>
                        <span style={{ fontWeight: 700, color: "#e2e8f0", fontSize: "0.85rem" }}>{a.name}</span>
                        <span style={{ color: "#475569", fontSize: "0.7rem", marginLeft: 8 }}>{a.substation} · {a.region}</span>
                      </div>
                      <StatusBadge status={a.status} />
                    </div>
                    <div style={{ display: "flex", gap: 14, fontSize: "0.72rem", marginBottom: 8, flexWrap: "wrap" }}>
                      <span style={{ color: "#f87171" }}>Risk: <b>{(a.failure_probability * 100).toFixed(0)}%</b></span>
                      <span style={{ color: "#fbbf24" }}>Health: <b>{a.health_score.toFixed(0)}/100</b></span>
                      <span style={{ color: "#c084fc" }}>Impact: <b>{a.impact_score}/100</b></span>
                      <span style={{ color: "#38bdf8" }}>Customers: <b>{a.customers_affected.toLocaleString()}</b></span>
                    </div>
                    {a.critical_facilities.length > 0 && (
                      <div style={{ fontSize: "0.68rem", color: "#fbbf24", marginBottom: 7 }}>
                        ⚡ {a.critical_facilities.join(", ")}
                      </div>
                    )}
                    <div style={{ height: 4, background: "rgba(30,41,59,0.8)", borderRadius: 2, marginBottom: 9 }}>
                      <div style={{ width: `${a.health_score}%`, height: "100%", background: "#f87171", borderRadius: 2, boxShadow: "0 0 6px rgba(248,113,113,0.4)" }} />
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Link to={`/assets/${a.id}`} style={{
                        background: "rgba(127,29,29,0.4)", color: "#fca5a5",
                        border: "1px solid rgba(248,113,113,0.3)",
                        borderRadius: 6, padding: "4px 12px",
                        fontSize: "0.7rem", fontWeight: 600, textDecoration: "none",
                        transition: "background 0.2s",
                      }}>View Asset</Link>
                      <Link to={`/advisor?asset=${a.id}`} style={{
                        background: "rgba(55,48,163,0.3)", color: "#a5b4fc",
                        border: "1px solid rgba(129,140,248,0.3)",
                        borderRadius: 6, padding: "4px 12px",
                        fontSize: "0.7rem", fontWeight: 600, textDecoration: "none",
                        transition: "background 0.2s",
                      }}>AI Advisor</Link>
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </Panel>

        {/* Active Alerts */}
        <Panel title={`Active Alerts (${activeAlerts.length})`}>
          {activeAlerts.length === 0
            ? <EmptyState message="No active alerts" />
            : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {activeAlerts.map(a => {
                  const isCrit = a.severity === "critical";
                  const isHigh = a.severity === "high";
                  return (
                    <div key={a.id} style={{
                      background: isCrit ? "rgba(127,29,29,0.12)" : isHigh ? "rgba(120,53,15,0.12)" : "rgba(10,22,40,0.5)",
                      border: `1px solid ${isCrit ? "rgba(248,113,113,0.2)" : isHigh ? "rgba(251,191,36,0.2)" : "rgba(56,189,248,0.08)"}`,
                      borderRadius: 8, padding: "9px 12px",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                        <span style={{ fontWeight: 700, fontSize: "0.78rem", color: "#e2e8f0" }}>{a.asset_name}</span>
                        <StatusBadge status={a.severity} small />
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{a.reason}</div>
                      <div style={{ fontSize: "0.65rem", color: "#334155", marginTop: 2 }}>
                        {new Date(a.timestamp).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          }
        </Panel>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        {/* Outage Risk Predictions */}
        <Panel title="Outage Risk Predictions">
          {predictions.length === 0
            ? <EmptyState message="No predictions available" />
            : (
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {predictions.slice(0, 5).map(p => (
                  <div key={p.id} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "11px 0", borderBottom: "1px solid rgba(30,41,59,0.5)",
                  }}>
                    <RiskCircle probability={p.probability} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: "0.83rem", color: "#e2e8f0" }}>{p.asset_name}</span>
                        <StatusBadge status={p.severity} small />
                      </div>
                      <div style={{ fontSize: "0.71rem", color: "#64748b", marginTop: 2 }}>
                        Window: {p.risk_window} · {p.customers_potentially_affected.toLocaleString()} customers · Confidence: {(p.confidence * 100).toFixed(0)}%
                      </div>
                      <div style={{ fontSize: "0.69rem", color: "#38bdf8", marginTop: 2, opacity: 0.8 }}>{p.recommended_action}</div>
                    </div>
                    <Link to={`/assets/${p.asset_id}`} style={{
                      color: "#38bdf8", fontSize: "0.72rem",
                      fontWeight: 600, whiteSpace: "nowrap",
                      transition: "opacity 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.7"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}>
                      Details →
                    </Link>
                  </div>
                ))}
              </div>
            )
          }
        </Panel>

        {/* Grid Risk Summary */}
        <Panel title="Grid Risk Summary">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {["critical", "warning", "normal"].map(s => {
              const count = assets.filter(a => a.status === s).length;
              const pct = assets.length ? (count / assets.length) * 100 : 0;
              const color = s === "critical" ? "#f87171" : s === "warning" ? "#fbbf24" : "#4ade80";
              return (
                <div key={s}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.74rem", marginBottom: 4 }}>
                    <span style={{ textTransform: "capitalize", color: "#64748b", fontWeight: 500 }}>{s}</span>
                    <span style={{ color, fontWeight: 700 }}>{count} assets</span>
                  </div>
                  <div style={{ height: 5, background: "rgba(30,41,59,0.8)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{
                      width: `${pct}%`, height: "100%", background: color,
                      borderRadius: 3, transition: "width 0.6s ease",
                      boxShadow: `0 0 8px ${color}60`,
                    }} />
                  </div>
                </div>
              );
            })}

            <div style={{ marginTop: 6, paddingTop: 12, borderTop: "1px solid rgba(56,189,248,0.08)" }}>
              <div style={{ fontSize: "0.68rem", color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8, fontWeight: 600 }}>
                Top At-Risk Assets
              </div>
              {highRiskAssets.slice(0, 4).map(a => (
                <div key={a.id} style={{
                  display: "flex", justifyContent: "space-between",
                  fontSize: "0.72rem", marginBottom: 5, alignItems: "center",
                }}>
                  <Link to={`/assets/${a.id}`} style={{
                    color: "#38bdf8",
                    fontWeight: 500,
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#7dd3fc"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#38bdf8"}>
                    {a.id}
                  </Link>
                  <span style={{
                    color: riskColor(a.failure_probability), fontWeight: 700,
                    background: `${riskColor(a.failure_probability)}15`,
                    padding: "1px 7px", borderRadius: 4,
                  }}>
                    {(a.failure_probability * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 8, flexDirection: "column" }}>
            <Link to="/assets" style={{
              background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
              color: "#fff",
              borderRadius: 8, padding: "8px 0",
              fontSize: "0.76rem", fontWeight: 600,
              textDecoration: "none", textAlign: "center",
              display: "block",
              boxShadow: "0 2px 12px rgba(56,189,248,0.3)",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.85"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}>
              Asset Intelligence →
            </Link>
            <Link to="/maintenance" style={{
              background: "rgba(10,22,40,0.6)",
              color: "#94a3b8",
              border: "1px solid rgba(56,189,248,0.15)",
              borderRadius: 8, padding: "8px 0",
              fontSize: "0.76rem", fontWeight: 600,
              textDecoration: "none", textAlign: "center",
              display: "block",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(56,189,248,0.35)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(56,189,248,0.15)"}>
              Maintenance Plan →
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  );
}
