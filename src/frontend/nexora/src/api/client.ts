import axios from "axios";
import type { GridKPI, Asset, Alert, Prediction, Incident, AdvisoryResult, MaintenanceAction, CrewPositioning, SensorReading, WeatherRecord } from "../types";

// ── API client ────────────────────────────────────────────────────────────────
// Tries the real FastAPI backend first.
// If unreachable (e.g. Vercel static deployment), falls back to bundled JSON.
// ─────────────────────────────────────────────────────────────────────────────

const api = axios.create({ baseURL: "", timeout: 8000 });

let _backendAvailable: boolean | null = null;
async function backendAvailable(): Promise<boolean> {
  if (_backendAvailable !== null) return _backendAvailable;
  try {
    await axios.get("/api/health", { timeout: 3000 });
    _backendAvailable = true;
  } catch {
    _backendAvailable = false;
  }
  return _backendAvailable;
}

async function loadFallback(name: string): Promise<unknown> {
  const mod = await import(`../assets/${name}.json`);
  return mod.default ?? mod;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function get<T = any>(url: string, params?: Record<string, string | number>): Promise<T> {
  if (await backendAvailable()) {
    try {
      return (await api.get<T>(url, { params })).data;
    } catch {
      _backendAvailable = false;
    }
  }
  if (url === "/api/grid/kpi")         return loadFallback("demo_kpi") as Promise<T>;
  if (url === "/api/assets")           return loadFallback("demo_assets") as Promise<T>;
  if (url.startsWith("/api/assets/") && url.endsWith("/sensors")) return { readings: [] } as T;
  if (url.startsWith("/api/assets/") && url.endsWith("/risk"))    return loadFallback("demo_kpi") as Promise<T>;
  if (url.startsWith("/api/assets/"))  return loadFallback("demo_asset_TX-047") as Promise<T>;
  if (url === "/api/predictions")      return loadFallback("demo_predictions") as Promise<T>;
  if (url === "/api/alerts")           return loadFallback("demo_alerts") as Promise<T>;
  if (url === "/api/weather")          return loadFallback("demo_weather") as Promise<T>;
  if (url === "/api/incidents")        return loadFallback("demo_incidents") as Promise<T>;
  if (url === "/api/analytics")        return loadFallback("demo_analytics") as Promise<T>;
  if (url === "/api/maintenance-plan") return loadFallback("demo_maintenance") as Promise<T>;
  if (url.startsWith("/api/advisor/")) return loadFallback("demo_advisor_TX-047") as Promise<T>;
  return {} as T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function post<T = any>(url: string, body?: unknown): Promise<T> {
  if (await backendAvailable()) {
    try {
      return (await api.post<T>(url, body)).data;
    } catch {
      _backendAvailable = false;
    }
  }
  if (url === "/api/advisor/analyze") return loadFallback("demo_advisor_TX-047") as Promise<T>;
  return {} as T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function patch<T = any>(url: string, body?: unknown): Promise<T> {
  if (await backendAvailable()) {
    try {
      return (await api.patch<T>(url, body)).data;
    } catch {
      _backendAvailable = false;
    }
  }
  return {} as T;
}

// ── Public API ────────────────────────────────────────────────────────────────
export const fetchGridKPI         = () => get<GridKPI>("/api/grid/kpi");
export const fetchAssets          = (params?: Record<string, string | number>) => get<{ assets: Asset[] }>("/api/assets", params);
export const fetchAsset           = (id: string) => get<Asset & Record<string, unknown>>(`/api/assets/${id}`);
export const fetchAssetSensors    = (id: string, limit = 30) => get<{ readings: SensorReading[] }>(`/api/assets/${id}/sensors`, { limit });
export const fetchAssetRisk       = (id: string) => get<Record<string, unknown>>(`/api/assets/${id}/risk`);
export const fetchWeather         = (region?: string) => get<{ regions: Record<string, { current: WeatherRecord; forecast: WeatherRecord[] }>; asset_impacts: Record<string, unknown>[] }>("/api/weather", region ? { region } : undefined);
export const fetchIncidents       = (params?: Record<string, string>) => get<{ incidents: Incident[] }>("/api/incidents", params);
export const fetchPredictions     = (params?: Record<string, string | number>) => get<{ predictions: Prediction[] }>("/api/predictions", params);
export const fetchAlerts          = (params?: Record<string, string>) => get<{ alerts: Alert[] }>("/api/alerts", params);
export const fetchMaintenancePlan = () => get<{ maintenance_actions: MaintenanceAction[]; crew_positioning: CrewPositioning[] }>("/api/maintenance-plan");
export const fetchAdvisor         = (asset_id: string) => get<AdvisoryResult>(`/api/advisor/${asset_id}`);
export const analyzeAsset         = (asset_id: string) => post<AdvisoryResult>("/api/advisor/analyze", { asset_id });
export const fetchAnalytics       = () => get<Record<string, unknown>>("/api/analytics");
export const updateMaintenance    = (id: string, status: string) => patch(`/api/maintenance-plan/${id}`, { status });
export const acknowledgeAlert     = (id: string) => patch(`/api/alerts/${id}/acknowledge`);
export const fetchGrid            = () => get<Record<string, unknown>>("/api/grid");

export default api;
