import React, { useEffect, useState, useCallback } from "react";
import { fetchAlerts, fetchIncidents, acknowledgeAlert } from "../api/client";
import { Alert, Incident } from "../types";
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
    <div>
      <PageHeader title="Alerts & Incidents" subtitle={`${alerts.filter(a=>a.status==="active").length} active alerts · ${incidents.length} historical incidents`} actions={<SyntheticBadge />} />

      {/* Alert summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
        {["critical","high","medium","low"].map(s => {
          const count = alerts.filter(a => a.severity === s && a.status === "active").length;
          const color = s === "critical" ? "#ef4444" : s === "high" ? "#f59e0b" : s === "medium" ? "#a78bfa" : "#4ade80";
          const bg    = s === "critical" ? "#450a0a" : s === "high" ? "#451a03" : s === "medium" ? "#1e1b4b" : "#052e16";
          return (
            <div key={s} onClick={() => setSevFilter(sevFilter === s ? "" : s)} style={{ background: bg, border: `1px solid ${color}44`, borderRadius: 8, padding: "12px 16px", cursor: "pointer" }}>
              <div style={{ fontSize: "0.68rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s} alerts</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color }}>{count}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ background: "#111827", border: "1px solid #374151", borderRadius: 6, padding: "6px 10px", color: "#f3f4f6", fontSize: "0.78rem" }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="acknowledged">Acknowledged</option>
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          style={{ background: "#111827", border: "1px solid #374151", borderRadius: 6, padding: "6px 10px", color: "#f3f4f6", fontSize: "0.78rem" }}>
          <option value="">All Types</option>
          {alertTypes.map(t => <option key={t} value={t}>{t.replace(/_/g," ")}</option>)}
        </select>
        <button onClick={() => { setSevFilter(""); setTypeFilter(""); setStatusFilter(""); }}
          style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 6, padding: "6px 12px", color: "#9ca3af", fontSize: "0.78rem", cursor: "pointer" }}>
          Clear
        </button>
      </div>

      {/* Alerts */}
      <Panel title={`🔔 Active Alerts (${filteredAlerts.length})`}>
        {filteredAlerts.length === 0
          ? <div style={{ textAlign: "center", padding: 30, color: "#6b7280" }}>No alerts match current filters.</div>
          : (
            <Table headers={["Severity","Time","Asset","Type","Reason","Recommended Action","Status","Action"]}>
              {filteredAlerts.map(a => (
                <TR key={a.id}>
                  <TD><StatusBadge status={a.severity} small /></TD>
                  <TD muted>{a.timestamp === "live" ? "Live" : new Date(a.timestamp).toLocaleString()}</TD>
                  <TD><span style={{ fontWeight: 700, fontSize: "0.78rem", color: "#f3f4f6" }}>{a.asset_name}</span><br /><span style={{ fontSize: "0.68rem", color: "#6b7280" }}>{a.asset_id}</span></TD>
                  <TD muted><span style={{ background: "#1f2937", borderRadius: 4, padding: "2px 6px", fontSize: "0.68rem" }}>{a.type.replace(/_/g," ")}</span></TD>
                  <TD><span style={{ fontSize: "0.75rem", color: "#d1d5db" }}>{a.reason}</span></TD>
                  <TD><span style={{ fontSize: "0.72rem", color: "#60a5fa" }}>{a.recommended_action}</span></TD>
                  <TD><StatusBadge status={a.status} small /></TD>
                  <TD>
                    {a.status === "active" && (
                      <button onClick={() => handleAck(a.id)} disabled={acking === a.id}
                        style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 4, padding: "3px 8px", color: "#9ca3af", fontSize: "0.68rem", cursor: "pointer" }}>
                        {acking === a.id ? "..." : "Ack"}
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
        <Panel title="📋 Historical Incident Record">
          <Table headers={["Incident ID","Asset","Date","Failure Type","Severity","Duration","Customers","Resolution"]}>
            {incidents.map(inc => (
              <TR key={inc.id}>
                <TD><span style={{ fontWeight: 700, fontSize: "0.75rem", color: "#93c5fd" }}>{inc.id}</span></TD>
                <TD><span style={{ fontWeight: 600, fontSize: "0.78rem", color: "#f3f4f6" }}>{inc.asset_name}</span></TD>
                <TD muted>{new Date(inc.timestamp).toLocaleDateString()}</TD>
                <TD><span style={{ fontSize: "0.75rem", color: "#d1d5db" }}>{inc.failure_type}</span></TD>
                <TD><StatusBadge status={inc.severity} small /></TD>
                <TD muted>{inc.duration_hours}h</TD>
                <TD muted>{inc.customers_affected.toLocaleString()}</TD>
                <TD><span style={{ fontSize: "0.72rem", color: "#6b7280" }}>{inc.resolution}</span></TD>
              </TR>
            ))}
          </Table>

          {/* Pre-failure signals detail */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: "0.72rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Pre-Failure Signal Patterns</div>
            {incidents.slice(0,3).map(inc => (
              <div key={inc.id} style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 6, padding: "10px 12px", marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: "0.78rem", color: "#93c5fd" }}>{inc.id}</span>
                  <span style={{ fontSize: "0.72rem", color: "#9ca3af" }}>{inc.failure_type}</span>
                  <StatusBadge status={inc.severity} small />
                  <span style={{ fontSize: "0.68rem", color: "#6b7280" }}>{inc.weather_conditions}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {inc.pre_failure_signals.map((s, i) => (
                    <span key={i} style={{ background: "#1a0f00", border: "1px solid #92400e", borderRadius: 4, padding: "2px 8px", fontSize: "0.7rem", color: "#fde68a" }}>{s}</span>
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
