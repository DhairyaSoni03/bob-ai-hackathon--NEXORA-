import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { fetchWeather } from "../api/client";
import type { WeatherRecord } from "../types";
import { Panel, Spinner, SyntheticBadge } from "../components/shared";
import { PageHeader } from "../components/PageHeader";

const REGIONS = ["Houston North", "Houston South", "Houston West"];

export function WeatherIntelligencePage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]);

  useEffect(() => { fetchWeather().then(d => { setData(d); setLoading(false); }); }, []);

  if (loading) return <Spinner />;
  if (!data) return null;

  const regions = data.regions as Record<string, { current: WeatherRecord; forecast: WeatherRecord[] }>;
  const impacts = data.asset_impacts as Record<string, unknown>[];
  const regionData = regions[selectedRegion];
  const current = regionData?.current;
  const forecast = regionData?.forecast ?? [];

  const chartData = forecast.slice(0, 24).map((f, i) => ({
    i, temp: f.temperature_c, wind: f.wind_speed_kph, storm: (f.storm_probability * 100).toFixed(0),
    humidity: f.humidity_pct, rain: f.rainfall_mm, heat: f.heat_risk_index,
  }));

  return (
    <div className="nx-page">
      <PageHeader title="Weather Intelligence" subtitle="Weather data integrated into asset risk scoring � not a standalone weather app" actions={<SyntheticBadge />} />

      {/* Region selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {REGIONS.map(r => (
          <button key={r} onClick={() => setSelectedRegion(r)}
            style={{ background: selectedRegion === r ? "#1d4ed8" : "#1f2937", border: "1px solid rgba(56,189,248,0.15)", borderRadius: 6, padding: "7px 14px", color: selectedRegion === r ? "#fff" : "#9ca3af", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>
            {r}
          </button>
        ))}
      </div>

      {current && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 16 }}>
          {[
            { label: "Temperature", value: `${current.temperature_c}�C`, color: current.temperature_c > 38 ? "#ef4444" : "#f97316" },
            { label: "Wind Speed", value: `${current.wind_speed_kph} kph`, color: current.wind_speed_kph > 60 ? "#ef4444" : current.wind_speed_kph > 40 ? "#f59e0b" : "#4ade80" },
            { label: "Rainfall", value: `${current.rainfall_mm} mm`, color: current.rainfall_mm > 15 ? "#60a5fa" : "#4ade80" },
            { label: "Storm Prob.", value: `${(current.storm_probability * 100).toFixed(0)}%`, color: current.storm_probability > 0.6 ? "#ef4444" : current.storm_probability > 0.4 ? "#f59e0b" : "#4ade80" },
            { label: "Heat Risk", value: `${current.heat_risk_index.toFixed(1)}/10`, color: current.heat_risk_index > 7 ? "#ef4444" : current.heat_risk_index > 5 ? "#f59e0b" : "#4ade80" },
            { label: "Humidity", value: `${current.humidity_pct.toFixed(0)}%`, color: current.humidity_pct > 85 ? "#f59e0b" : "#4ade80" },
          ].map(item => (
            <div key={item.label} style={{ background: "rgba(8,16,32,0.8)", border: "1px solid rgba(56,189,248,0.1)", borderRadius: 8, padding: "12px 14px", textAlign: "center" }}>
              <div style={{ fontSize: "0.65rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: "1.2rem", fontWeight: 700, color: item.color }}>{item.value}</div>
              <div style={{ fontSize: "0.62rem", color: "#334155", marginTop: 2 }}>Current</div>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <Panel title="?? Storm Probability (24h Forecast)">
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="i" tick={{ fill: "#6b7280", fontSize: 9 }} label={{ value: "Hours ahead", fill: "#6b7280", fontSize: 9, position: "insideBottom", offset: -2 }} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 9 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "rgba(8,20,40,0.95)", border: "1px solid rgba(56,189,248,0.2)", fontSize: "0.75rem", color: "#e2e8f0", borderRadius: 8 }} />
              <Line type="monotone" dataKey="storm" stroke="#ef4444" strokeWidth={2} dot={false} name="Storm %" />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="?? Wind Speed (24h Forecast)">
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="i" tick={{ fill: "#6b7280", fontSize: 9 }} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 9 }} />
              <Tooltip contentStyle={{ background: "rgba(8,20,40,0.95)", border: "1px solid rgba(56,189,248,0.2)", fontSize: "0.75rem", color: "#e2e8f0", borderRadius: 8 }} />
              <Line type="monotone" dataKey="wind" stroke="#60a5fa" strokeWidth={2} dot={false} name="Wind kph" />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* Weather ? Asset Risk Impact */}
      <Panel title="? Weather ? Asset Risk Impact">
        <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 10 }}>
          How the active weather system affects asset failure probability (additive weather contribution):
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {impacts.filter((i: Record<string, unknown>) => String(i.region) === selectedRegion).map((impact: Record<string, unknown>) => {
            const delta = Number(impact.weather_delta);
            const final = Number(impact.final_risk);
            return (
              <div key={String(impact.asset_id)} style={{ background: "rgba(10,22,40,0.7)", border: "1px solid rgba(56,189,248,0.1)", borderRadius: 6, padding: "8px 12px", display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ minWidth: 80, fontWeight: 700, fontSize: "0.78rem", color: "#e2e8f0" }}>{String(impact.asset_id)}</div>
                <div style={{ flex: 1, fontSize: "0.72rem", color: "#64748b" }}>{String(impact.reason)}</div>
                <div style={{ textAlign: "right", minWidth: 100 }}>
                  <div style={{ fontSize: "0.68rem", color: "#475569" }}>Weather adds</div>
                  <div style={{ fontWeight: 700, color: "#fbbf24", fontSize: "0.85rem" }}>+{(delta*100).toFixed(0)}%</div>
                  <div style={{ fontSize: "0.68rem", color: final >= 0.65 ? "#ef4444" : "#fbbf24" }}>? {(final*100).toFixed(0)}% final risk</div>
                </div>
              </div>
            );
          })}
          {impacts.filter((i: Record<string, unknown>) => String(i.region) === selectedRegion).length === 0 && (
            <div style={{ color: "#475569", fontSize: "0.8rem", padding: "10px 0" }}>No impacted assets in {selectedRegion} region.</div>
          )}
        </div>
      </Panel>
    </div>
  );
}
