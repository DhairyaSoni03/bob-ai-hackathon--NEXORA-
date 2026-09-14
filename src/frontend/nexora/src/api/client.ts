import axios from "axios";

const BASE = "" /* configured via vite proxy */;

const api = axios.create({ baseURL: BASE, timeout: 15000 });

export const fetchGridKPI    = () => api.get("/api/grid/kpi").then(r => r.data);
export const fetchAssets     = (params?: Record<string, string|number>) => api.get("/api/assets", { params }).then(r => r.data);
export const fetchAsset      = (id: string) => api.get(`/api/assets/${id}`).then(r => r.data);
export const fetchAssetSensors = (id: string, limit=30) => api.get(`/api/assets/${id}/sensors`, { params: { limit } }).then(r => r.data);
export const fetchAssetRisk  = (id: string) => api.get(`/api/assets/${id}/risk`).then(r => r.data);
export const fetchWeather    = (region?: string) => api.get("/api/weather", { params: region ? { region } : {} }).then(r => r.data);
export const fetchIncidents  = (params?: Record<string, string>) => api.get("/api/incidents", { params }).then(r => r.data);
export const fetchPredictions = (params?: Record<string, string|number>) => api.get("/api/predictions", { params }).then(r => r.data);
export const fetchAlerts     = (params?: Record<string, string>) => api.get("/api/alerts", { params }).then(r => r.data);
export const fetchMaintenancePlan = () => api.get("/api/maintenance-plan").then(r => r.data);
export const fetchAdvisor    = (asset_id: string) => api.get(`/api/advisor/${asset_id}`).then(r => r.data);
export const analyzeAsset    = (asset_id: string) => api.post("/api/advisor/analyze", { asset_id }).then(r => r.data);
export const fetchAnalytics  = () => api.get("/api/analytics").then(r => r.data);
export const updateMaintenance = (id: string, status: string) => api.patch(`/api/maintenance-plan/${id}`, { status }).then(r => r.data);
export const acknowledgeAlert = (id: string) => api.patch(`/api/alerts/${id}/acknowledge`).then(r => r.data);
export const fetchGrid = () => api.get("/api/grid").then(r => r.data);

export default api;
