import React, { useEffect, useState, useCallback } from "react";
import { fetchMaintenancePlan, updateMaintenance } from "../api/client";
import { MaintenanceAction, CrewPositioning } from "../types";
import { StatusBadge, Table, TR, TD, Panel, Spinner, SyntheticBadge } from "../components/shared";
import { PageHeader, Btn } from "../components/PageHeader";

function riskColor(p: number) { return p >= 0.65 ? "#ef4444" : p >= 0.45 ? "#f59e0b" : p >= 0.25 ? "#a78bfa" : "#4ade80"; }

const CREW_STATUS_COLORS: Record<string, string> = { deployed:"#4ade80","en-route":"#60a5fa",standby:"#fbbf24",available:"#9ca3af" };
const MAINT_STATUS_OPTIONS = ["pending","scheduled","in-progress","completed"];

export function MaintenancePlannerPage() {
  const [actions, setActions] = useState<MaintenanceAction[]>([]);
  const [crews, setCrews] = useState<CrewPositioning[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await fetchMaintenancePlan();
    setActions(data.maintenance_actions ?? []);
    setCrews(data.crew_positioning ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatusUpdate = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await updateMaintenance(id, status);
      setActions(prev => prev.map(a => a.id === id ? { ...a, status: status as MaintenanceAction["status"] } : a));
    } finally { setUpdating(null); }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Maintenance Planner" subtitle={`${actions.length} maintenance actions · ${crews.length} crews positioned`} actions={<SyntheticBadge />} />

      {/* Crew Pre-positioning */}
      <Panel title="🚐 Crew Pre-Positioning">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10, marginBottom: 8 }}>
          {crews.map(c => (
            <div key={c.crew} style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#f3f4f6" }}>{c.crew}</span>
                <span style={{ background: "#1f2937", color: CREW_STATUS_COLORS[c.status] ?? "#9ca3af", border: `1px solid ${CREW_STATUS_COLORS[c.status] ?? "#374151"}44`, borderRadius: 4, padding: "1px 7px", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase" }}>{c.status}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.72rem" }}>
                <div style={{ color: "#9ca3af" }}>📍 Deployed to: <span style={{ color: "#f3f4f6" }}>{c.assigned_location}</span></div>
                <div style={{ color: "#9ca3af" }}>🎯 Primary: <span style={{ color: "#f87171", fontWeight: 600 }}>{c.primary_target}</span></div>
                {c.secondary_target && <div style={{ color: "#9ca3af" }}>🔄 Secondary: <span style={{ color: "#fbbf24" }}>{c.secondary_target}</span></div>}
                <div style={{ color: "#9ca3af" }}>⏱ Response: <span style={{ color: "#4ade80" }}>{c.estimated_response_minutes} min</span></div>
                <div style={{ color: "#9ca3af" }}>👥 Personnel: <span style={{ color: "#f3f4f6" }}>{c.personnel_count} people</span></div>
                <div style={{ color: "#9ca3af" }}>🚐 Vehicle: <span style={{ color: "#f3f4f6" }}>{c.vehicle}</span></div>
                <div style={{ marginTop: 4, background: "#1e1b4b", borderRadius: 4, padding: "3px 7px", fontSize: "0.68rem", color: "#a5b4fc" }}>{c.specialization}</div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Maintenance actions table */}
      <div style={{ marginTop: 16 }}>
        <Panel title="📋 Prioritized Maintenance Actions">
          <Table headers={["#","Asset","Risk","Impact","Customers","Action","Crew","Window","Status","Update"]}>
            {actions.map(a => (
              <React.Fragment key={a.id}>
                <TR onClick={() => setExpanded(expanded === a.id ? null : a.id)} highlighted={expanded === a.id}>
                  <TD><span style={{ fontWeight: 700, color: riskColor(a.risk_score), fontSize: "0.85rem" }}>{a.priority}</span></TD>
                  <TD>
                    <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "#f3f4f6" }}>{a.asset_name}</div>
                    <div style={{ fontSize: "0.68rem", color: "#6b7280" }}>{a.asset_id}</div>
                  </TD>
                  <TD><span style={{ color: riskColor(a.risk_score), fontWeight: 700 }}>{(a.risk_score*100).toFixed(0)}%</span></TD>
                  <TD><span style={{ color: a.impact_score >= 80 ? "#f87171" : "#fbbf24" }}>{a.impact_score}/100</span></TD>
                  <TD muted>{a.customers_affected.toLocaleString()}</TD>
                  <TD><span style={{ fontSize: "0.75rem" }}>{a.action}</span></TD>
                  <TD muted>{a.crew}</TD>
                  <TD><span style={{ fontSize: "0.72rem", color: "#fbbf24" }}>{a.time_window}</span></TD>
                  <TD><StatusBadge status={a.status} small /></TD>
                  <TD>
                    <select
                      value={a.status}
                      onChange={e => { e.stopPropagation(); handleStatusUpdate(a.id, e.target.value); }}
                      disabled={updating === a.id}
                      onClick={e => e.stopPropagation()}
                      style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 4, padding: "3px 6px", color: "#f3f4f6", fontSize: "0.68rem" }}
                    >
                      {MAINT_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </TD>
                </TR>
                {expanded === a.id && (
                  <tr>
                    <td colSpan={10} style={{ background: "#0a1020", padding: "12px 20px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, fontSize: "0.78rem" }}>
                        <div>
                          <div style={{ color: "#9ca3af", marginBottom: 4, fontWeight: 600 }}>REQUIRED EQUIPMENT</div>
                          <ul style={{ margin: 0, paddingLeft: 14, color: "#d1d5db" }}>
                            {a.required_equipment.map(e => <li key={e} style={{ marginBottom: 2 }}>{e}</li>)}
                          </ul>
                        </div>
                        <div>
                          <div style={{ color: "#9ca3af", marginBottom: 4, fontWeight: 600 }}>SPECIAL NOTES</div>
                          <p style={{ margin: 0, color: "#fde68a" }}>{a.special_notes}</p>
                        </div>
                        <div>
                          <div style={{ color: "#9ca3af", marginBottom: 4, fontWeight: 600 }}>CREW & DURATION</div>
                          <div style={{ color: "#f3f4f6" }}>{a.crew} · {a.estimated_duration_hours}h</div>
                          <div style={{ color: "#6b7280", marginTop: 2 }}>{a.crew_location}</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </Table>
        </Panel>
      </div>
    </div>
  );
}
