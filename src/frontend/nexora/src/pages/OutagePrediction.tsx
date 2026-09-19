import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { fetchPredictions } from "../api/client";
import type { Prediction } from "../types";
import { StatusBadge, Panel, Spinner, SyntheticBadge } from "../components/shared";
import { PageHeader } from "../components/PageHeader";
import { Link } from "react-router-dom";

function riskColor(p: number) { return p >= 0.65 ? "#ef4444" : p >= 0.45 ? "#f59e0b" : p >= 0.25 ? "#a78bfa" : "#4ade80"; }

export function OutagePredictionPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { fetchPredictions().then(d => { setPredictions(d.predictions ?? []); setLoading(false); }); }, []);

  if (loading) return <Spinner />;

  const chartData = predictions.map(p => ({
    name: p.asset_id,
    sensor: p.sensor_contribution_pct,
    weather: p.weather_contribution_pct,
    historical: p.historical_contribution_pct,
    prob: Math.round(p.probability * 100),
  }));

  return (
    <div className="nx-page">
      <PageHeader
        title="Outage Prediction"
        subtitle="AI-ranked outage risk predictions � transparent model, synthetic demo data"
        actions={<SyntheticBadge />}
      />

      <div style={{ background: "#1a0f00", border: "1px solid #92400e", borderRadius: 8, padding: "8px 14px", marginBottom: 16, fontSize: "0.72rem", color: "#fde68a" }}>
        ? All predictions are based on synthetic demo data and deterministic risk calculations. These are not real utility predictions.
      </div>

      {/* Prediction cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        {predictions.map(p => {
          const isExpanded = expanded === p.id;
          const rc = riskColor(p.probability);
          return (
            <div key={p.id} style={{ background: "rgba(8,16,32,0.8)", border: `1px solid ${isExpanded ? "#3b82f6" : "#1f2937"}`, borderRadius: 10, overflow: "hidden" }}>
              {/* Header row */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 18px", cursor: "pointer" }}
                onClick={() => setExpanded(isExpanded ? null : p.id)}>
                {/* Risk dial */}
                <div style={{ minWidth: 60, height: 60, borderRadius: "50%", background: `${rc}11`, border: `3px solid ${rc}`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: 800, color: rc }}>{(p.probability * 100).toFixed(0)}%</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 800, fontSize: "0.92rem", color: "#e2e8f0" }}>{p.asset_name}</span>
                    <StatusBadge status={p.severity} />
                    <span style={{ fontSize: "0.7rem", color: "#475569" }}>{p.region}</span>
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: "0.72rem" }}>
                    <span style={{ color: "#64748b" }}>Window: <b style={{ color: "#fbbf24" }}>{p.risk_window}</b></span>
                    <span style={{ color: "#64748b" }}>Customers: <b style={{ color: "#38bdf8" }}>{p.customers_potentially_affected.toLocaleString()}</b></span>
                    <span style={{ color: "#64748b" }}>Confidence: <b style={{ color: "#4ade80" }}>{(p.confidence * 100).toFixed(0)}%</b></span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#475569", marginTop: 4 }}>{p.recommended_action}</div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <Link to={`/assets/${p.asset_id}`} onClick={e => e.stopPropagation()} style={{ background: "#1e3a5f", color: "#38bdf8", borderRadius: 5, padding: "4px 10px", fontSize: "0.7rem", fontWeight: 600, textDecoration: "none" }}>Asset</Link>
                  <Link to={`/advisor?asset=${p.asset_id}`} onClick={e => e.stopPropagation()} style={{ background: "#1e1b4b", color: "#a5b4fc", borderRadius: 5, padding: "4px 10px", fontSize: "0.7rem", fontWeight: 600, textDecoration: "none" }}>Advisor</Link>
                  <span style={{ color: "#475569", fontSize: "0.8rem", padding: "4px 6px" }}>{isExpanded ? "?" : "?"}</span>
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div style={{ borderTop: "1px solid #1f2937", padding: "14px 18px", background: "#0a1020" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 12 }}>
                    {/* Contribution breakdown */}
                    <div>
                      <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 700, marginBottom: 6, textTransform: "uppercase" }}>Risk Contributions</div>
                      {[
                        { label: "Sensor Anomalies", value: p.sensor_contribution_pct, color: "#f87171" },
                        { label: "Historical Patterns", value: p.historical_contribution_pct, color: "#a78bfa" },
                        { label: "Weather Exposure", value: p.weather_contribution_pct, color: "#38bdf8" },
                      ].map(item => (
                        <div key={item.label} style={{ marginBottom: 6 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", marginBottom: 2 }}>
                            <span style={{ color: "#64748b" }}>{item.label}</span>
                            <span style={{ color: item.color, fontWeight: 700 }}>{item.value}%</span>
                          </div>
                          <div style={{ height: 4, background: "rgba(30,41,59,0.7)", borderRadius: 2, overflow: "hidden" }}>
                            <div style={{ width: `${item.value}%`, height: "100%", background: item.color, borderRadius: 2 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Factor scores */}
                    <div>
                      <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 700, marginBottom: 6, textTransform: "uppercase" }}>Component Scores</div>
                      {Object.entries(p.contributing_factors).map(([k, v]) => (
                        <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", marginBottom: 5 }}>
                          <span style={{ color: "#64748b" }}>{k.replace(/_/g," ")}</span>
                          <span style={{ color: riskColor(v as number), fontWeight: 700 }}>{((v as number) * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                    {/* Explanation */}
                    <div>
                      <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 700, marginBottom: 6, textTransform: "uppercase" }}>AI Explanation</div>
                      <p style={{ fontSize: "0.75rem", color: "#cbd5e1", margin: 0, lineHeight: 1.6 }}>{p.explanation}</p>
                    </div>
                  </div>
                  {p.similar_incidents.length > 0 && (
                    <div style={{ fontSize: "0.72rem", color: "#64748b" }}>Similar incidents: <span style={{ color: "#38bdf8" }}>{p.similar_incidents.join(", ")}</span></div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <Panel title="?? Risk Contribution Breakdown by Asset">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} domain={[0, 100]} />
            <Tooltip contentStyle={{ background: "rgba(8,20,40,0.95)", border: "1px solid rgba(56,189,248,0.2)", fontSize: "0.75rem", color: "#e2e8f0", borderRadius: 8 }} />
            <Bar dataKey="sensor" name="Sensor" fill="#ef4444" stackId="a" />
            <Bar dataKey="historical" name="Historical" fill="#a78bfa" stackId="a" />
            <Bar dataKey="weather" name="Weather" fill="#60a5fa" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}
