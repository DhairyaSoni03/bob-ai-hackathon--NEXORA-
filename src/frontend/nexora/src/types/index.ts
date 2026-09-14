export interface Asset {
  id: string;
  name: string;
  type: "transformer" | "substation" | "feeder";
  substation: string;
  region: string;
  latitude: number;
  longitude: number;
  installation_year: number;
  rated_capacity_kva: number;
  health_score: number;
  failure_probability: number;
  impact_score: number;
  customers_affected: number;
  critical_facilities: string[];
  status: "critical" | "warning" | "normal";
  priority: number;
  age_years: number;
  last_maintenance_days: number;
  fault_history: number;
}

export interface SensorReading {
  asset_id: string;
  timestamp: string;
  temperature_c: number;
  vibration_mm_s: number;
  voltage_pu: number;
  current_pu: number;
  load_pct: number;
  frequency_hz: number;
  partial_discharge_pC: number;
  oil_quality_index: number;
}

export interface WeatherRecord {
  region: string;
  timestamp: string;
  is_forecast: boolean;
  temperature_c: number;
  wind_speed_kph: number;
  rainfall_mm: number;
  storm_probability: number;
  heat_risk_index: number;
  humidity_pct: number;
}

export interface Incident {
  id: string;
  asset_id: string;
  asset_name: string;
  timestamp: string;
  failure_type: string;
  severity: "critical" | "high" | "medium" | "low";
  duration_hours: number;
  customers_affected: number;
  pre_failure_signals: string[];
  weather_conditions: string;
  resolution: string;
  similar_to_current: string[];
}

export interface Prediction {
  id: string;
  asset_id: string;
  asset_name: string;
  region: string;
  probability: number;
  risk_window: string;
  confidence: number;
  severity: "critical" | "high" | "medium" | "low";
  customers_potentially_affected: number;
  contributing_factors: Record<string, number>;
  weather_contribution_pct: number;
  sensor_contribution_pct: number;
  historical_contribution_pct: number;
  recommended_action: string;
  explanation: string;
  similar_incidents: string[];
  timestamp: string;
}

export interface Alert {
  id: string;
  timestamp: string;
  severity: "critical" | "high" | "medium" | "low";
  type: string;
  asset_id: string;
  asset_name: string;
  reason: string;
  status: "active" | "acknowledged" | "resolved";
  recommended_action: string;
}

export interface MaintenanceAction {
  id: string;
  asset_id: string;
  asset_name: string;
  priority: number;
  risk_score: number;
  impact_score: number;
  customers_affected: number;
  action: string;
  crew: string;
  crew_location: string;
  estimated_duration_hours: number;
  time_window: string;
  status: "pending" | "scheduled" | "planned" | "in-progress" | "completed";
  required_equipment: string[];
  special_notes: string;
}

export interface CrewPositioning {
  crew: string;
  current_location: string;
  assigned_location: string;
  primary_target: string;
  secondary_target: string;
  priority: string;
  estimated_response_minutes: number;
  personnel_count: number;
  specialization: string;
  vehicle: string;
  status: "deployed" | "en-route" | "standby" | "available";
}

export interface GridKPI {
  grid_health_score: number;
  outage_risk_score: number;
  outage_risk_label: string;
  at_risk_assets: number;
  critical_assets: number;
  warning_assets: number;
  customers_potentially_affected: number;
  weather_risk: number;
  active_alerts: number;
  total_assets: number;
  timestamp: string;
}

export interface AdvisoryResult {
  provider: string;
  ibm_ai_used: boolean;
  asset_id: string;
  asset_name: string;
  risk_level: string;
  failure_probability_pct: number;
  risk_window: string;
  urgency: string;
  health_score: number;
  executive_summary: string;
  contributing_factors: string[];
  historical_similarity: string;
  weather_contribution: string;
  recommendations: string[];
  crew_type: string;
  required_equipment: string[];
  grid_impact: {
    impact_score: number;
    customers_affected: number;
    critical_facilities: string[];
  };
  ibm_narrative?: string;
}
