import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { fetchAnalytics } from "../api/client";
import { Panel, Spinner, SyntheticBadge } from "../components/shared";
import { PageHeader } from "../components/PageHeader";

const PIE_COLORS = { critical:"#f87171", high:"#fbbf24", medium:"#c084fc", low:"#4ade80", poor:"#f87171", fair:"#fbbf24", good:"#4ade80", excellent:"#38bdf8" };
const TOOLTIP_STYLE = { background: "rgba(8,20,40,0.95)", border: "1px solid rgba(56,189,248,0.2)", fontSize: "0.75rem", color: "#e2e8f0", borderRadius: 8 };

export function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics().then(d => { setAnalytics(d); setLoading(false); }); }, []);

  if (loading) return <Spinner />;
  if (!analytics) return null;

  const riskDist = Object.entries(analytics.risk_distribution as Record<string, number>).map(([name, value]) => ({ name, value, color: (PIE_COLORS as Record<string,string>)[name] ?? "#9ca3af" }));
  const healthDist = Object.entries(analytics.health_distribution as Record<string, number>).map(([name, value]) => ({ name, value, color: (PIE_COLORS as Record<string,string>)[name] ?? "#9ca3af" }));
  const typeData = Object.entries(analytics.assets_by_type as Record<string, number>).map(([name, value]) => ({ name, value }));
  const incTypes = Object.entries(analytics.incidents_by_type as Record<string, number>).map(([name, value]) => ({ name: name.length > 25 ? name.slice(0,25)+"�" : name, value }));

  return (
    <div className="nx-page">
      <PageHeader title="Analytics" subtitle="Grid and asset analytics dashboard � synthetic demo data" actions={<SyntheticBadge />} />

      {/* Summary KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Total Assets", value: analytics.total_assets as number, color: "#38bdf8" },
          { label: "Total Incidents", value: analytics.total_incidents as number, color: "#a78bfa" },
          { label: "Customers at Risk", value: ((analytics.total_customers_at_risk as number) ?? 0).toLocaleString(), color: "#f87171" },
        ].map(item => (
          <div key={item.label} style={{
            background: "rgba(10,22,40,0.8)", border: "1px solid rgba(56,189,248,0.12)",
            borderRadius: 12, padding: "16px 18px",
            backdropFilter: "blur(8px)",
          }}>
            <div style={{ fontSize: "0.68rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: item.color, letterSpacing: "-0.02em" }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Panel title="Risk Distribution">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={riskDist} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {riskDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Health Score Distribution">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={healthDist} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {healthDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Panel title="Assets by Type">
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={typeData}>
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="value" fill="#38bdf8" name="Count" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Incidents by Failure Type">
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={incTypes} layout="vertical">
              <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: "#64748b", fontSize: 9 }} width={140} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="value" fill="#818cf8" name="Count" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  );
}
