import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchAssets, analyzeAsset } from "../api/client";
import { Asset, AdvisoryResult } from "../types";
import { StatusBadge, Panel, Spinner, EmptyState, SyntheticBadge } from "../components/shared";
import { PageHeader, Btn } from "../components/PageHeader";

function RiskLevelBanner({ level }: { level: string }) {
  const colors: Record<string, { bg: string; color: string; border: string }> = {
    CRITICAL: { bg: "#450a0a", color: "#f87171", border: "#7f1d1d" },
    HIGH:     { bg: "#451a03", color: "#fbbf24", border: "#78350f" },
    MEDIUM:   { bg: "#1e1b4b", color: "#a5b4fc", border: "#3730a3" },
    LOW:      { bg: "#052e16", color: "#4ade80", border: "#166534" },
  };
  const c = colors[level] ?? colors.LOW;
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 8, padding: "12px 18px", display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
      <span style={{ fontSize: "1.5rem" }}>{level === "CRITICAL" ? "🚨" : level === "HIGH" ? "⚠" : level === "MEDIUM" ? "📋" : "✅"}</span>
      <div>
        <div style={{ fontSize: "0.68rem", color: c.color, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Risk Assessment</div>
        <div style={{ fontSize: "1.3rem", fontWeight: 900, color: c.color }}>{level}</div>
      </div>
    </div>
  );
}

export function FailureAdvisorPage() {
  const [searchParams] = useSearchParams();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedId, setSelectedId] = useState<string>(searchParams.get("asset") ?? "");
  const [advisory, setAdvisory] = useState<AdvisoryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchAssets().then(d => {
      setAssets(d.assets ?? []);
      if (!selectedId && d.assets?.length) {
        // Auto-select the highest priority asset
        const top = (d.assets as Asset[]).sort((a, b) => b.failure_probability - a.failure_probability)[0];
        setSelectedId(top.id);
      }
    });
  }, []);

  const runAnalysis = useCallback(async (id: string) => {
    if (!id) return;
    setAnalyzing(true);
    try {
      const result = await analyzeAsset(id);
      setAdvisory(result);
    } finally { setAnalyzing(false); }
  }, []);

  useEffect(() => {
    if (selectedId) runAnalysis(selectedId);
  }, [selectedId, runAnalysis]);

  const selectedAsset = assets.find(a => a.id === selectedId);

  return (
    <div>
      <PageHeader
        title="🤖 AI Failure Advisor"
        subtitle="IBM watsonx.ai-powered (or local engine) failure risk explanation and maintenance recommendations"
        actions={<SyntheticBadge />}
      />

      {/* Asset selector */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        <label style={{ fontSize: "0.78rem", color: "#9ca3af" }}>Select Asset:</label>
        <select
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
          style={{ background: "#111827", border: "1px solid #374151", borderRadius: 6, padding: "8px 12px", color: "#f3f4f6", fontSize: "0.82rem", minWidth: 280 }}
        >
          <option value="">-- Select an asset --</option>
          {assets.sort((a,b) => b.failure_probability - a.failure_probability).map(a => (
            <option key={a.id} value={a.id}>
              {a.name} — Risk: {(a.failure_probability*100).toFixed(0)}% ({a.status})
            </option>
          ))}
        </select>
        {selectedId && (
          <Btn onClick={() => runAnalysis(selectedId)} disabled={analyzing}>
            {analyzing ? "Analyzing..." : "🔄 Re-analyze"}
          </Btn>
        )}
      </div>

      {analyzing && <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}><Spinner /></div>}

      {!analyzing && advisory && (
        <div>
          {/* Provider badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{
              background: advisory.ibm_ai_used ? "#1e1b4b" : "#1f2937",
              color: advisory.ibm_ai_used ? "#a5b4fc" : "#9ca3af",
              border: `1px solid ${advisory.ibm_ai_used ? "#3730a3" : "#374151"}`,
              borderRadius: 5, padding: "2px 10px", fontSize: "0.68rem", fontWeight: 700,
            }}>
              {advisory.ibm_ai_used ? "🤖 IBM watsonx.ai" : "🔧 Local Advisory Engine"}
            </span>
            <span style={{ fontSize: "0.68rem", color: "#6b7280" }}>{advisory.provider}</span>
          </div>

          <RiskLevelBanner level={advisory.risk_level} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: 16 }}>
            {/* KPIs */}
            <Panel title="Risk Assessment">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Failure Probability", value: `${advisory.failure_probability_pct.toFixed(0)}%`, color: advisory.failure_probability_pct >= 65 ? "#ef4444" : advisory.failure_probability_pct >= 45 ? "#f59e0b" : "#4ade80" },
                  { label: "Health Score", value: `${advisory.health_score.toFixed(0)}/100`, color: advisory.health_score >= 75 ? "#4ade80" : advisory.health_score >= 50 ? "#f59e0b" : "#ef4444" },
                  { label: "Risk Window", value: advisory.risk_window, color: "#f3f4f6" },
                  { label: "Urgency", value: advisory.urgency, color: "#fbbf24" },
                  { label: "Impact Score", value: `${advisory.grid_impact.impact_score}/100`, color: "#a78bfa" },
                  { label: "Customers", value: advisory.grid_impact.customers_affected.toLocaleString(), color: "#60a5fa" },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #1f2937" }}>
                    <span style={{ fontSize: "0.72rem", color: "#9ca3af" }}>{item.label}</span>
                    <span style={{ fontWeight: 700, color: item.color, fontSize: "0.78rem" }}>{item.value}</span>
                  </div>
                ))}
                {advisory.grid_impact.critical_facilities.length > 0 && (
                  <div style={{ background: "#1a0f00", border: "1px solid #92400e", borderRadius: 6, padding: "8px" }}>
                    <div style={{ fontSize: "0.65rem", color: "#fbbf24", fontWeight: 700, marginBottom: 4 }}>CRITICAL FACILITIES AT RISK</div>
                    {advisory.grid_impact.critical_facilities.map(f => (
                      <div key={f} style={{ fontSize: "0.72rem", color: "#fde68a" }}>· {f}</div>
                    ))}
                  </div>
                )}
              </div>
            </Panel>

            {/* Executive Summary */}
            <Panel title="Executive Summary">
              <p style={{ fontSize: "0.82rem", color: "#d1d5db", lineHeight: 1.7, margin: 0 }}>{advisory.executive_summary}</p>
              {advisory.ibm_narrative && (
                <div style={{ marginTop: 12, background: "#1e1b4b", border: "1px solid #3730a3", borderRadius: 6, padding: "10px 12px" }}>
                  <div style={{ fontSize: "0.68rem", color: "#a5b4fc", fontWeight: 700, marginBottom: 6 }}>IBM watsonx.ai Granite Analysis</div>
                  <p style={{ fontSize: "0.78rem", color: "#c7d2fe", margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{advisory.ibm_narrative}</p>
                </div>
              )}
            </Panel>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
            {/* Contributing Factors */}
            <Panel title="⚠ Why the Risk Is Elevated">
              {advisory.contributing_factors.length === 0 ? <EmptyState message="No elevated risk factors." /> : (
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                  {advisory.contributing_factors.map((f, i) => (
                    <li key={i} style={{ display: "flex", gap: 8, fontSize: "0.78rem", color: "#d1d5db", background: "#111827", borderRadius: 5, padding: "6px 10px" }}>
                      <span style={{ color: "#f87171", fontWeight: 700, minWidth: 16 }}>{i+1}.</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            {/* Recommendations */}
            <Panel title="🛠 Recommended Actions">
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                {advisory.recommendations.map((r, i) => (
                  <li key={i} style={{ display: "flex", gap: 8, fontSize: "0.78rem", color: "#d1d5db", background: "#052e16", borderRadius: 5, padding: "6px 10px", border: "1px solid #16653488" }}>
                    <span style={{ color: "#4ade80", fontWeight: 700, minWidth: 16 }}>✓</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: "0.68rem", color: "#9ca3af", marginBottom: 4 }}>Recommended Crew Type</div>
                <div style={{ fontSize: "0.75rem", color: "#60a5fa" }}>{advisory.crew_type}</div>
              </div>
            </Panel>

            {/* Required Equipment + Weather */}
            <Panel title="🔧 Required Equipment">
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                {advisory.required_equipment.map((e, i) => (
                  <li key={i} style={{ fontSize: "0.75rem", color: "#d1d5db", padding: "4px 0", borderBottom: "1px solid #1f2937", display: "flex", gap: 6 }}>
                    <span style={{ color: "#6b7280" }}>·</span>{e}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: 12, background: "#111827", borderRadius: 6, padding: "8px" }}>
                <div style={{ fontSize: "0.68rem", color: "#9ca3af", marginBottom: 4 }}>Weather Contribution</div>
                <div style={{ fontSize: "0.75rem", color: "#fbbf24" }}>{advisory.weather_contribution}</div>
              </div>
            </Panel>
          </div>

          {/* Historical Similarity */}
          {advisory.historical_similarity && (
            <Panel title="📋 Historical Pattern Similarity">
              <p style={{ fontSize: "0.8rem", color: "#d1d5db", margin: 0 }}>{advisory.historical_similarity}</p>
            </Panel>
          )}
        </div>
      )}

      {!analyzing && !advisory && !selectedId && (
        <div style={{ textAlign: "center", padding: 60, color: "#6b7280" }}>
          Select an asset from the dropdown above to generate an AI failure advisory.
        </div>
      )}
    </div>
  );
}
