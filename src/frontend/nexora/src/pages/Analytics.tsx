import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { fetchAnalytics, fetchAssets } from "../api/client";
import { Panel, Spinner, SyntheticBadge } from "../components/shared";
import { PageHeader } from "../components/PageHeader";

const PIE_COLORS = { critical:"#ef4444", high:"#f59e0b", medium:"#a78bfa", low:"#4ade80", poor:"#ef4444", fair:"#f59e0b", good:"#4ade80", excellent:"#60a5fa" };

export function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics().then(d => { setAnalytics(d); setLoading(false); }); }, []);

  if (loading) return <Spinner />;
  if (!analytics) return null;

  const riskDist = Object.entries(analytics.risk_distribution as Record<string, number>).map(([name, value]) => ({ name, value, color: (PIE_COLORS as Record<string,string>)[name] ?? "#9ca3af" }));
  const healthDist = Object.entries(analytics.health_distribution as Record<string, number>).map(([name, value]) => ({ name, value, color: (PIE_COLORS as Record<string,string>)[name] ?? "#9ca3af" }));
  const typeData = Object.entries(analytics.assets_by_type as Record<string, number>).map(([name, value]) => ({ name, value }));
  const incTypes = Object.entries(analytics.incidents_by_type as Record<string, number>).map(([name, value]) => ({ name: name.length > 25 ? name.slice(0,25)+"…" : name, value }));

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Grid and asset analytics dashboard — synthetic demo data" actions={<SyntheticBadge />} />

      {/* Summary KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Total Assets", value: analytics.total_assets as number, color: "#60a5fa" },
          { label: "Total Incidents", value: analytics.total_incidents as number, color: "#a78bfa" },
          { label: "Customers at Risk", value: ((analytics.total_customers_at_risk as number) ?? 0).toLocaleString(), color: "#f87171" },
        ].map(item => (
          <div key={item.label} style={{ background: "#0f172a", border: "1px solid #1f2937", borderRadius: 8, padding: "14px 18px" }}>
            <div style={{ fontSize: "0.68rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.label}</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: item.color }}>{item.value}</div>
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
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", fontSize: "0.75rem" }} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Health Score Distribution">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={healthDist} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {healthDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", fontSize: "0.75rem" }} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Panel title="Assets by Type">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={typeData}>
              <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", fontSize: "0.75rem", color: "#f3f4f6" }} />
              <Bar dataKey="value" fill="#3b82f6" name="Count" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Incidents by Failure Type">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={incTypes} layout="vertical">
              <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: "#9ca3af", fontSize: 9 }} width={140} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", fontSize: "0.75rem", color: "#f3f4f6" }} />
              <Bar dataKey="value" fill="#a78bfa" name="Count" radius={[0,3,3,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  );
}
