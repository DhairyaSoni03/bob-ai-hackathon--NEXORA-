import { useEffect, useState, useCallback } from "react";
import { fetchAlerts, fetchIncidents, acknowledgeAlert } from "../api/client";
import type { Alert, Incident } from "../types";
import { StatusBadge, Table, TR, TD, Panel, Spinner, SyntheticBadge } from "../components/shared";
import { PageHeader } from "../components/PageHeader";

const SEV_ORDER: Record<string, number> = { critical:0, high:1, medium:2, low:3 };

export function AlertsIncidentsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [sevFilter, setSevFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [acking, setAcking] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [al, inc] = await Promise.all([fetchAlerts(), fetchIncidents()]);
    setAlerts(al.alerts ?? []);
    setIncidents(inc.incidents ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);

  const handleAck = async (id: string) => {
    setAcking(id);
    try {
      await acknowledgeAlert(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: "acknowledged" as const } : a));
    } finally { setAcking(null); }
  };

  const filteredAlerts = alerts
    .filter(a => (!sevFilter || a.severity === sevFilter) && (!typeFilter || a.type === typeFilter) && (!statusFilter || a.status === statusFilter))
    .sort((a, b) => (SEV_ORDER[a.severity] ?? 3) - (SEV_ORDER[b.severity] ?? 3));

  const alertTypes = [...new Set(alerts.map(a => a.type))];

  if (loading) return <Spinner />;

  return (
    <div className="nx-page">
      <PageHeader title="Alerts & Incidents" subtitle={`${alerts.filter(a=>a.status==="active").length} active alerts � ${incidents.length} historical incidents`} actions={<SyntheticBadge />} />

      {/* Alert summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
        {["critical","high","medium","low"].map(s => {
          const count = alerts.filter(a => a.severity === s && a.status === "active").length;
          const color = s === "critical" ? "#f87171" : s === "high" ? "#fbbf24" : s === "medium" ? "#c084fc" : "#4ade80";
          const bg    = s === "critical" ? "rgba(127,29,29,0.2)" : s === "high" ? "rgba(120,53,15,0.2)" : s === "medium" ? "rgba(55,48,163,0.2)" : "rgba(22,101,52,0.2)";
          const isActive = sevFilter === s;
          return (
            <div key={s} onClick={() => setSevFilter(sevFilter === s ? "" : s)} style={{
              background: bg, border: `1px solid ${isActive ? color : color + "33"}`,
              borderRadius: 10, padding: "14px 16px", cursor: "pointer",
              transition: "all 0.2s", boxShadow: isActive ? `0 0 16px ${color}30` : "none",
              transform: isActive ? "translateY(-1px)" : "none",
            }}>
              <div style={{ fontSize: "0.65rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{s} alerts</div>
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color, letterSpacing: "-0.02em" }}>{count}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="acknowledged">Acknowledged</option>
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {alertTypes.map(t => <option key={t} value={t}>{t.replace(/_/g," ")}</option>)}
        </select>
        <button onClick={() => { setSevFilter(""); setTypeFilter(""); setStatusFilter(""); }}
          style={{
            background: "rgba(10,22,40,0.6)", border: "1px solid rgba(56,189,248,0.2)",
            borderRadius: 8, padding: "8px 14px", color: "#64748b",
            fontSize: "0.78rem", cursor: "pointer",
          }}>
          Clear Filters
        </button>
      </div>

      {/* Alerts */}
      <Panel title={`?? Active Alerts (${filteredAlerts.length})`}>
        {filteredAlerts.length === 0
          ? <div style={{ textAlign: "center", padding: 30, color: "#6b7280" }}>No alerts match current filters.</div>
          : (
            <Table headers={["Severity","Time","Asset","Type","Reason","Recommended Action","Status","Action"]}>
              {filteredAlerts.map(a => (
                <TR key={a.id}>
                  <TD><StatusBadge status={a.severity} small /></TD>
                  <TD muted>{a.timestamp === "live" ? "Live" : new Date(a.timestamp).toLocaleString()}</TD>
                  <TD>
                    <span style={{ fontWeight: 700, fontSize: "0.78rem", color: "#e2e8f0" }}>{a.asset_name}</span>
                    <br />
                    <span style={{ fontSize: "0.68rem", color: "#475569" }}>{a.asset_id}</span>
                  </TD>
                  <TD muted>
                    <span style={{ background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.12)", borderRadius: 4, padding: "2px 8px", fontSize: "0.65rem", color: "#64748b" }}>
                      {a.type.replace(/_/g," ")}
                    </span>
                  </TD>
                  <TD><span style={{ fontSize: "0.75rem", color: "#cbd5e1" }}>{a.reason}</span></TD>
                  <TD><span style={{ fontSize: "0.72rem", color: "#38bdf8", opacity: 0.8 }}>{a.recommended_action}</span></TD>
                  <TD><StatusBadge status={a.status} small /></TD>
                  <TD>
                    {a.status === "active" && (
                      <button onClick={() => handleAck(a.id)} disabled={acking === a.id}
                        style={{
                          background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)",
                          borderRadius: 6, padding: "4px 10px", color: "#38bdf8",
                          fontSize: "0.68rem", cursor: "pointer", fontWeight: 600,
                        }}>
                        {acking === a.id ? "�" : "Ack"}
                      </button>
                    )}
                  </TD>
                </TR>
              ))}
            </Table>
          )
        }
      </Panel>

      {/* Historical Incidents */}
      <div style={{ marginTop: 16 }}>
        <Panel title="Historical Incident Record">
          <Table headers={["Incident ID","Asset","Date","Failure Type","Severity","Duration","Customers","Resolution"]}>
            {incidents.map(inc => (
              <TR key={inc.id}>
                <TD><span style={{ fontWeight: 700, fontSize: "0.75rem", color: "#38bdf8" }}>{inc.id}</span></TD>
                <TD><span style={{ fontWeight: 600, fontSize: "0.78rem", color: "#e2e8f0" }}>{inc.asset_name}</span></TD>
                <TD muted>{new Date(inc.timestamp).toLocaleDateString()}</TD>
                <TD><span style={{ fontSize: "0.75rem", color: "#cbd5e1" }}>{inc.failure_type}</span></TD>
                <TD><StatusBadge status={inc.severity} small /></TD>
                <TD muted>{inc.duration_hours}h</TD>
                <TD muted>{inc.customers_affected.toLocaleString()}</TD>
                <TD><span style={{ fontSize: "0.72rem", color: "#475569" }}>{inc.resolution}</span></TD>
              </TR>
            ))}
          </Table>

          {/* Pre-failure signals detail */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: "0.68rem", color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10, fontWeight: 600 }}>Pre-Failure Signal Patterns</div>
            {incidents.slice(0,3).map(inc => (
              <div key={inc.id} style={{
                background: "rgba(8,20,40,0.5)", border: "1px solid rgba(56,189,248,0.1)",
                borderRadius: 10, padding: "12px 14px", marginBottom: 8,
              }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.78rem", color: "#38bdf8" }}>{inc.id}</span>
                  <span style={{ fontSize: "0.72rem", color: "#64748b" }}>{inc.failure_type}</span>
                  <StatusBadge status={inc.severity} small />
                  <span style={{ fontSize: "0.68rem", color: "#475569" }}>{inc.weather_conditions}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {inc.pre_failure_signals.map((s, i) => (
                    <span key={i} style={{
                      background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)",
                      borderRadius: 5, padding: "3px 9px", fontSize: "0.69rem", color: "#fbbf24",
                    }}>{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
