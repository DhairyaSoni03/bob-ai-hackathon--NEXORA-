import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { fetchAsset, fetchAssetSensors } from "../api/client";
import type { Asset, SensorReading } from "../types";
import { StatusBadge, Panel, Spinner, SensorCard, SyntheticBadge } from "../components/shared";
import { PageHeader } from "../components/PageHeader";

export function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [asset, setAsset] = useState<Asset & Record<string, unknown> | null>(null);
  const [sensors, setSensors] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [a, s] = await Promise.all([fetchAsset(id), fetchAssetSensors(id)]);
      setAsset(a);
      setSensors(s.readings ?? []);
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Spinner />;
  if (!asset) return <div style={{ color: "#f87171", padding: 30 }}>Asset not found.</div>;

  const latest = sensors[sensors.length - 1] ?? {} as SensorReading;

  const chartData = sensors.slice(-20).map((s, i) => ({
    i, temp: s.temperature_c, vib: s.vibration_mm_s, load: s.load_pct,
    voltage: s.voltage_pu, oq: s.oil_quality_index, pd: s.partial_discharge_pC,
  }));

  const incidents = (asset.related_incidents as Record<string, unknown>[] | undefined) ?? [];

  return (
    <div className="nx-page">
      <PageHeader
        title={String(asset.name)}
        subtitle={`${String(asset.type)} � ${String(asset.substation)} � ${String(asset.region)} � Installed ${String(asset.installation_year)} � Age ${Number(asset.age_years)} years`}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <SyntheticBadge />
            <Link to={`/advisor?asset=${id}`} style={{ background: "#1d4ed8", color: "#fff", borderRadius: 6, padding: "7px 14px", fontSize: "0.78rem", fontWeight: 600, textDecoration: "none" }}>?? AI Advisor</Link>
            <Link to="/maintenance" style={{ background: "rgba(30,41,59,0.7)", color: "#cbd5e1", border: "1px solid rgba(56,189,248,0.15)", borderRadius: 6, padding: "7px 14px", fontSize: "0.78rem", fontWeight: 600, textDecoration: "none" }}>Maintenance Plan</Link>
          </div>
        }
      />

      {/* Status Bar */}
      <div style={{ display: "flex", gap: 12, padding: "10px 16px", background: "rgba(8,16,32,0.8)", border: "1px solid rgba(56,189,248,0.1)", borderRadius: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <StatusBadge status={String(asset.status) as "critical"|"warning"|"normal"} />
        <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Health:</span>
        <span style={{ fontWeight: 700, color: Number(asset.health_score) >= 70 ? "#4ade80" : Number(asset.health_score) >= 50 ? "#fbbf24" : "#f87171" }}>{Number(asset.health_score).toFixed(0)}/100</span>
        <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Failure Risk:</span>
        <span style={{ fontWeight: 700, color: "#f87171" }}>{(Number(asset.failure_probability) * 100).toFixed(0)}%</span>
        <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Impact:</span>
        <span style={{ fontWeight: 700, color: "#a78bfa" }}>{Number(asset.impact_score)}/100</span>
        <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Customers:</span>
        <span style={{ fontWeight: 700, color: "#38bdf8" }}>{Number(asset.customers_affected).toLocaleString()}</span>
        <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Last maint:</span>
        <span style={{ fontWeight: 700, color: Number(asset.last_maintenance_days) > 200 ? "#f87171" : "#fbbf24" }}>{Number(asset.last_maintenance_days)} days ago</span>
      </div>

      {/* Sensor Cards */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Live Sensor Readings <span style={{ color: "#334155" }}>(most recent reading)</span></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8 }}>
          <SensorCard label="Temperature" value={latest.temperature_c?.toFixed(1) ?? "--"} unit="�C" warnAbove={70} critAbove={85} />
          <SensorCard label="Vibration"   value={latest.vibration_mm_s?.toFixed(2) ?? "--"} unit="mm/s" warnAbove={4.0} critAbove={7.0} />
          <SensorCard label="Voltage"     value={latest.voltage_pu?.toFixed(4) ?? "--"}     unit="pu"  critBelow={0.88} warnBelow={0.93} />
          <SensorCard label="Current"     value={latest.current_pu?.toFixed(3) ?? "--"}     unit="pu"  warnAbove={0.90} critAbove={1.05} />
          <SensorCard label="Load"        value={latest.load_pct?.toFixed(1) ?? "--"}       unit="%"   warnAbove={80} critAbove={90} />
          <SensorCard label="Frequency"   value={latest.frequency_hz?.toFixed(3) ?? "--"}   unit="Hz"  warnAbove={60.5} warnBelow={59.5} />
          <SensorCard label="Part. Disch."value={latest.partial_discharge_pC?.toFixed(0) ?? "--"} unit="pC" warnAbove={40} critAbove={60} />
          <SensorCard label="Oil Quality" value={latest.oil_quality_index?.toFixed(0) ?? "--"} unit="/100" critBelow={50} warnBelow={70} />
          <SensorCard label="Failure Risk" value={(Number(asset.failure_probability)*100).toFixed(0)} unit="%" warnAbove={35} critAbove={65} />
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {[
          { key: "temp", color: "#f97316", label: "Temperature (�C)", warnY: 70 },
          { key: "vib",  color: "#f87171", label: "Vibration (mm/s)", warnY: 4.0 },
          { key: "load", color: "#38bdf8", label: "Load (%)", warnY: 80 },
          { key: "oq",   color: "#4ade80", label: "Oil Quality Index", warnY: 70 },
        ].map(ch => (
          <Panel key={ch.key} title={`?? ${ch.label}`}>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="i" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} />
                <Tooltip contentStyle={{ background: "rgba(8,20,40,0.95)", border: "1px solid rgba(56,189,248,0.2)", fontSize: "0.75rem", color: "#e2e8f0", borderRadius: 8 }} />
                <Line type="monotone" dataKey={ch.key} stroke={ch.color} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Panel>
        ))}
      </div>

      {/* Critical Facilities & Metadata */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {(asset.critical_facilities as string[]).length > 0 && (
          <Panel title="? Critical Facilities Served">
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {(asset.critical_facilities as string[]).map((f: string) => (
                <div key={f} style={{ background: "#1a0f00", border: "1px solid #92400e", borderRadius: 6, padding: "6px 10px", fontSize: "0.78rem", color: "#fde68a" }}>? {f}</div>
              ))}
            </div>
          </Panel>
        )}

        {incidents.length > 0 && (
          <Panel title="?? Related Historical Incidents">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {incidents.slice(0,2).map((inc: Record<string, unknown>) => (
                <div key={String(inc.id)} style={{ background: "rgba(10,22,40,0.7)", border: "1px solid rgba(56,189,248,0.1)", borderRadius: 6, padding: "8px 10px" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.78rem", color: "#e2e8f0" }}>{String(inc.id)} � {String(inc.failure_type)}</div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 3 }}>Duration: {Number(inc.duration_hours)}h � {Number(inc.customers_affected).toLocaleString()} customers</div>
                  <div style={{ fontSize: "0.7rem", color: "#475569", marginTop: 2 }}>{String(inc.resolution)}</div>
                </div>
              ))}
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
