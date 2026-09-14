import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { fetchGridKPI, fetchAssets, fetchAlerts, fetchPredictions } from "../api/client";
import { GridKPI, Asset, Alert, Prediction } from "../types";
import { KPICard, StatusBadge, HealthBar, Panel, Spinner, EmptyState, SyntheticBadge } from "../components/shared";
import { PageHeader } from "../components/PageHeader";

function riskColor(p: number) { return p >= 0.65 ? "#ef4444" : p >= 0.45 ? "#f59e0b" : p >= 0.25 ? "#a78bfa" : "#4ade80"; }

export function CommandCenterPage() {
  const [kpi, setKpi] = useState<GridKPI | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [k, a, al, pr] = await Promise.all([fetchGridKPI(), fetchAssets(), fetchAlerts({ status: "active" }), fetchPredictions()]);
      setKpi(k);
      setAssets(a.assets ?? []);
      setAlerts(al.alerts ?? []);
      setPredictions(pr.predictions ?? []);
      setLoading(false);
    } catch (e) {
      setError("Failed to load dashboard data. Is the backend running?");
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, [load]);

  if (loading) return <div style={{ display: "flex", justifyContent: "center", marginTop: 80 }}><Spinner /></div>;
  if (error) return <div style={{ color: "#f87171", padding: 30 }}>⚠ {error}</div>;
  if (!kpi) return null;

  const criticalAssets = assets.filter(a => a.status === "critical").sort((a, b) => b.failure_probability - a.failure_probability);
  const highRiskAssets = assets.filter(a => a.failure_probability >= 0.35).sort((a, b) => b.failure_probability - a.failure_probability);
  const activeAlerts = alerts.filter(a => a.status === "active").slice(0, 8);

  const kpiVariant = (score: number) => score >= 75 ? "ok" : score >= 55 ? "warning" : "critical";
  const riskVariant = (label: string) => label === "critical" ? "critical" : label === "high" ? "warning" : "ok";

  return (
    <div>
      <PageHeader
        title="Command Center"
        subtitle="Predict before failure. Act before outage."
        lastUpdate={new Date(kpi.timestamp).toLocaleString()}
        actions={<SyntheticBadge />}
      />

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
        <KPICard label="Grid Health" value={`${kpi.grid_health_score.toFixed(0)}/100`} sub="Overall system condition" variant={kpiVariant(kpi.grid_health_score)} icon="⚡" />
        <KPICard label="Outage Risk" value={`${(kpi.outage_risk_score * 100).toFixed(0)}%`} sub={kpi.outage_risk_label.toUpperCase()} variant={riskVariant(kpi.outage_risk_label)} icon="⚠" />
        <KPICard label="At-Risk Assets" value={kpi.at_risk_assets} sub={`${kpi.critical_assets} critical`} variant={kpi.at_risk_assets > 2 ? "critical" : "warning"} icon="🔧" />
        <KPICard label="Critical Assets" value={kpi.critical_assets} sub={`${kpi.warning_assets} warning`} variant={kpi.critical_assets > 0 ? "critical" : "ok"} icon="🚨" />
        <KPICard label="Customers at Risk" value={kpi.customers_potentially_affected.toLocaleString()} sub="Potentially affected" variant={kpi.customers_potentially_affected > 20000 ? "critical" : "warning"} icon="👥" />
        <KPICard label="Weather Risk" value={`${kpi.weather_risk.toFixed(1)}/10`} sub="Storm system active" variant={kpi.weather_risk > 6 ? "critical" : kpi.weather_risk > 4 ? "warning" : "ok"} icon="🌩" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Critical Actions */}
        <Panel title={`🚨 Critical Actions (${criticalAssets.length})`}>
          {criticalAssets.length === 0 ? <EmptyState message="No critical assets" /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {criticalAssets.slice(0, 4).map(a => (
                <div key={a.id} style={{ background: "#1a0505", border: "1px solid #7f1d1d", borderRadius: 8, padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div>
                      <span style={{ fontWeight: 700, color: "#f3f4f6", fontSize: "0.85rem" }}>{a.name}</span>
                      <span style={{ color: "#9ca3af", fontSize: "0.72rem", marginLeft: 8 }}>{a.substation} · {a.region}</span>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: "0.72rem", marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ color: "#f87171" }}>Risk: <b>{(a.failure_probability * 100).toFixed(0)}%</b></span>
                    <span style={{ color: "#fbbf24" }}>Health: <b>{a.health_score.toFixed(0)}/100</b></span>
                    <span style={{ color: "#a78bfa" }}>Impact: <b>{a.impact_score}/100</b></span>
                    <span style={{ color: "#60a5fa" }}>Customers: <b>{a.customers_affected.toLocaleString()}</b></span>
                  </div>
                  {a.critical_facilities.length > 0 && (
                    <div style={{ fontSize: "0.68rem", color: "#fbbf24", marginBottom: 6 }}>⚡ Critical: {a.critical_facilities.join(", ")}</div>
                  )}
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link to={`/assets/${a.id}`} style={{ background: "#7f1d1d", color: "#fca5a5", border: "none", borderRadius: 5, padding: "4px 10px", fontSize: "0.7rem", fontWeight: 600, cursor: "pointer", textDecoration: "none" }}>View Asset</Link>
                    <Link to={`/advisor?asset=${a.id}`} style={{ background: "#1e1b4b", color: "#a5b4fc", border: "none", borderRadius: 5, padding: "4px 10px", fontSize: "0.7rem", fontWeight: 600, cursor: "pointer", textDecoration: "none" }}>AI Advisor</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* Active Alerts */}
        <Panel title={`🔔 Active Alerts (${activeAlerts.length})`}>
          {activeAlerts.length === 0 ? <EmptyState message="No active alerts" /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {activeAlerts.map(a => (
                <div key={a.id} style={{
                  background: a.severity === "critical" ? "#1a0505" : a.severity === "high" ? "#1a0f00" : "#111827",
                  border: `1px solid ${a.severity === "critical" ? "#7f1d1d" : a.severity === "high" ? "#78350f" : "#1f2937"}`,
                  borderRadius: 6, padding: "8px 12px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                    <span style={{ fontWeight: 700, fontSize: "0.75rem", color: "#f3f4f6" }}>{a.asset_name}</span>
                    <StatusBadge status={a.severity} small />
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#9ca3af" }}>{a.reason}</div>
                  <div style={{ fontSize: "0.68rem", color: "#4b5563", marginTop: 2 }}>{new Date(a.timestamp).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        {/* Outage Risk Predictions */}
        <Panel title="📡 Outage Risk Predictions">
          {predictions.length === 0 ? <EmptyState message="No predictions available" /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {predictions.slice(0, 5).map(p => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #1f2937" }}>
                  <div style={{ minWidth: 54, height: 54, borderRadius: "50%", background: `${riskColor(p.probability)}22`, border: `2px solid ${riskColor(p.probability)}`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 800, color: riskColor(p.probability) }}>{(p.probability * 100).toFixed(0)}%</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "#f3f4f6" }}>{p.asset_name}</span>
                      <StatusBadge status={p.severity} small />
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: 2 }}>Window: {p.risk_window} · {p.customers_potentially_affected.toLocaleString()} customers · Confidence: {(p.confidence * 100).toFixed(0)}%</div>
                    <div style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: 1 }}>{p.recommended_action}</div>
                  </div>
                  <Link to={`/assets/${p.asset_id}`} style={{ color: "#60a5fa", fontSize: "0.7rem", textDecoration: "none", fontWeight: 600 }}>Details →</Link>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* Grid Risk Summary */}
        <Panel title="⚡ Grid Risk Summary">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {["critical","warning","normal"].map(s => {
              const count = assets.filter(a => a.status === s).length;
              const pct = assets.length ? (count / assets.length) * 100 : 0;
              const color = s === "critical" ? "#ef4444" : s === "warning" ? "#f59e0b" : "#22c55e";
              return (
                <div key={s}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: 3 }}>
                    <span style={{ textTransform: "capitalize", color: "#9ca3af" }}>{s}</span>
                    <span style={{ color, fontWeight: 700 }}>{count} assets</span>
                  </div>
                  <div style={{ height: 6, background: "#1f2937", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #1f2937" }}>
              <div style={{ fontSize: "0.72rem", color: "#9ca3af", marginBottom: 6 }}>Top at-risk assets:</div>
              {highRiskAssets.slice(0, 4).map(a => (
                <div key={a.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", marginBottom: 4 }}>
                  <Link to={`/assets/${a.id}`} style={{ color: "#93c5fd", textDecoration: "none" }}>{a.id}</Link>
                  <span style={{ color: riskColor(a.failure_probability), fontWeight: 700 }}>{(a.failure_probability * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link to="/assets" style={{ flex: 1, background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 6, padding: "7px 0", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", textDecoration: "none", textAlign: "center" }}>Asset Intelligence →</Link>
            <Link to="/maintenance" style={{ flex: 1, background: "#1f2937", color: "#d1d5db", border: "1px solid #374151", borderRadius: 6, padding: "7px 0", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", textDecoration: "none", textAlign: "center" }}>Maintenance Plan →</Link>
          </div>
        </Panel>
      </div>
    </div>
  );
}
