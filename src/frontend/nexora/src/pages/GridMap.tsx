import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { fetchAssets } from "../api/client";
import { Asset } from "../types";
import { StatusBadge, HealthBar, Panel, Spinner, SyntheticBadge } from "../components/shared";
import { PageHeader } from "../components/PageHeader";

const REGION_COLORS: Record<string, string> = {
  "Houston North": "#1e3a5f",
  "Houston South": "#1a2020",
  "Houston West":  "#1e1b4b",
};

function riskColor(p: number) { return p >= 0.65 ? "#ef4444" : p >= 0.45 ? "#f59e0b" : p >= 0.25 ? "#a78bfa" : "#22c55e"; }

const ICON_MAP: Record<string, string> = { transformer: "🔧", substation: "🏗", feeder: "⚡" };

export function GridMapPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Asset | null>(null);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = useCallback(async () => {
    const data = await fetchAssets();
    setAssets(data.assets ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = assets.filter(a => {
    if (typeFilter && a.type !== typeFilter) return false;
    if (statusFilter && a.status !== statusFilter) return false;
    return true;
  });

  const regions = [...new Set(filtered.map(a => a.region))];

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Grid Map" subtitle="Interactive asset topology and risk visualization" actions={<SyntheticBadge />} />

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        {["","transformer","substation","feeder"].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            style={{ background: typeFilter === t ? "#1d4ed8" : "#1f2937", border: "1px solid #374151", borderRadius: 20, padding: "4px 12px", color: typeFilter === t ? "#fff" : "#9ca3af", fontSize: "0.75rem", cursor: "pointer" }}>
            {t ? ICON_MAP[t] + " " + t.charAt(0).toUpperCase()+t.slice(1) : "All Types"}
          </button>
        ))}
        <div style={{ width: 1, height: 20, background: "#374151" }} />
        {["","critical","warning","normal"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{ background: statusFilter === s ? "#1d4ed8" : "#1f2937", border: "1px solid #374151", borderRadius: 20, padding: "4px 12px", color: statusFilter === s ? "#fff" : "#9ca3af", fontSize: "0.75rem", cursor: "pointer" }}>
            {s || "All Status"}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
        {/* Grid topology */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {regions.map(region => {
            const regionAssets = filtered.filter(a => a.region === region);
            const substations = [...new Set(regionAssets.map(a => a.substation))];
            return (
              <div key={region} style={{ background: REGION_COLORS[region] ?? "#111827", border: "1px solid #1f2937", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ padding: "10px 16px", borderBottom: "1px solid #1f2937", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.06em" }}>📍 {region}</span>
                  <span style={{ fontSize: "0.68rem", color: "#6b7280" }}>{regionAssets.length} assets</span>
                  {regionAssets.some(a => a.status === "critical") && <span style={{ background: "#450a0a", color: "#f87171", borderRadius: 4, padding: "1px 6px", fontSize: "0.65rem", fontWeight: 700 }}>CRITICAL</span>}
                </div>
                <div style={{ padding: 12 }}>
                  {substations.map(sub => {
                    const subAssets = regionAssets.filter(a => a.substation === sub);
                    return (
                      <div key={sub} style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: "0.72rem", color: "#9ca3af", marginBottom: 6 }}>🏗 {sub}</div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {subAssets.map(a => {
                            const isSelected = selected?.id === a.id;
                            const rc = riskColor(a.failure_probability);
                            return (
                              <div key={a.id} onClick={() => setSelected(a)}
                                style={{
                                  background: isSelected ? "#1a2744" : "#0f172a",
                                  border: `2px solid ${isSelected ? "#3b82f6" : rc}`,
                                  borderRadius: 8, padding: "8px 12px", cursor: "pointer", minWidth: 110,
                                  boxShadow: isSelected ? "0 0 12px #3b82f655" : "none",
                                  transition: "all .15s",
                                }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                                  <span>{ICON_MAP[a.type]}</span>
                                  <span style={{ fontWeight: 700, fontSize: "0.78rem", color: "#f3f4f6" }}>{a.id}</span>
                                </div>
                                <div style={{ marginBottom: 4 }}><HealthBar score={a.health_score} size="sm" /></div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem" }}>
                                  <StatusBadge status={a.status} small />
                                  <span style={{ color: rc, fontWeight: 700 }}>{(a.failure_probability*100).toFixed(0)}%</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Asset detail panel */}
        <div>
          {selected ? (
            <Panel title="Asset Detail">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "1rem", color: "#f3f4f6" }}>{selected.name}</div>
                  <div style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: 2 }}>{selected.type} · {selected.substation} · {selected.region}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { label: "Health", value: `${selected.health_score.toFixed(0)}/100`, color: selected.health_score >= 70 ? "#4ade80" : "#f87171" },
                    { label: "Fail Risk", value: `${(selected.failure_probability*100).toFixed(0)}%`, color: riskColor(selected.failure_probability) },
                    { label: "Impact", value: `${selected.impact_score}/100`, color: "#a78bfa" },
                    { label: "Customers", value: selected.customers_affected.toLocaleString(), color: "#60a5fa" },
                    { label: "Age", value: `${selected.age_years} yrs`, color: "#9ca3af" },
                    { label: "Capacity", value: `${selected.rated_capacity_kva} kVA`, color: "#9ca3af" },
                  ].map(item => (
                    <div key={item.label} style={{ background: "#111827", borderRadius: 6, padding: "8px 10px" }}>
                      <div style={{ fontSize: "0.65rem", color: "#6b7280" }}>{item.label}</div>
                      <div style={{ fontWeight: 700, color: item.color, fontSize: "0.85rem" }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                <StatusBadge status={selected.status} />
                {selected.critical_facilities.length > 0 && (
                  <div style={{ background: "#1a0f00", border: "1px solid #92400e", borderRadius: 6, padding: "8px 10px" }}>
                    <div style={{ fontSize: "0.65rem", color: "#fbbf24", fontWeight: 700, marginBottom: 4 }}>CRITICAL FACILITIES</div>
                    {selected.critical_facilities.map(f => <div key={f} style={{ fontSize: "0.72rem", color: "#fde68a" }}>· {f}</div>)}
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <Link to={`/assets/${selected.id}`} style={{ background: "#1d4ed8", color: "#fff", borderRadius: 6, padding: "8px", fontSize: "0.78rem", fontWeight: 600, textDecoration: "none", textAlign: "center" }}>View Full Asset Details</Link>
                  <Link to={`/advisor?asset=${selected.id}`} style={{ background: "#1e1b4b", color: "#a5b4fc", border: "1px solid #3730a3", borderRadius: 6, padding: "8px", fontSize: "0.78rem", fontWeight: 600, textDecoration: "none", textAlign: "center" }}>🤖 Open AI Failure Advisor</Link>
                </div>
              </div>
            </Panel>
          ) : (
            <Panel title="Select Asset">
              <div style={{ color: "#6b7280", fontSize: "0.8rem", textAlign: "center", padding: 20 }}>
                Click any asset in the grid topology to view details and access the AI Failure Advisor.
              </div>
            </Panel>
          )}

          {/* Legend */}
          <div style={{ marginTop: 12, background: "#0f172a", border: "1px solid #1f2937", borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#9ca3af", marginBottom: 6, textTransform: "uppercase" }}>Risk Level Legend</div>
            {[
              { label: "Critical (≥65%)", color: "#ef4444" },
              { label: "High (45–64%)", color: "#f59e0b" },
              { label: "Medium (25–44%)", color: "#a78bfa" },
              { label: "Low (<25%)", color: "#22c55e" },
            ].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
                <span style={{ fontSize: "0.72rem", color: "#9ca3af" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
