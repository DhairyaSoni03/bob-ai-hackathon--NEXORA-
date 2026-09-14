"""
Simulated Real-Time Sensor Data Generator for NEXORA
=====================================================
Produces continuously updating equipment readings for the demo.

Assets are defined at startup and their state evolves over time.
A 'scenario' mode can push specific assets into degrading conditions
so that a judge can clearly observe the MONITOR → DETECT → PREDICT →
ASSESS → EXPLAIN → RECOMMEND → DISPLAY workflow.
"""

import random
import math
import time
from typing import Dict, List
from dataclasses import dataclass, field, asdict
from copy import deepcopy

ASSET_DEFINITIONS = [
    # (id, name,         type,         substation,      rated_kva, age_years, base_health)
    ("T-101", "Transformer T-101", "transformer", "Sub-Alpha",  1000, 12, 88),
    ("T-102", "Transformer T-102", "transformer", "Sub-Alpha",  1000,  5, 95),
    ("T-201", "Transformer T-201", "transformer", "Sub-Beta",   2000, 18, 72),
    ("T-202", "Transformer T-202", "transformer", "Sub-Beta",   2000,  8, 91),
    ("F-101", "Feeder F-101",      "feeder",      "Sub-Alpha",   500,  9, 85),
    ("F-201", "Feeder F-201",      "feeder",      "Sub-Beta",    500, 14, 78),
    ("S-001", "Substation Alpha",  "substation",  "Sub-Alpha",  5000, 15, 80),
    ("S-002", "Substation Beta",   "substation",  "Sub-Beta",   5000, 20, 70),
]

# Normal operating bands
NORMAL_BANDS: Dict[str, dict] = {
    "transformer": dict(
        load_pct=(40, 70), temperature_c=(38, 58), voltage_pu=(0.97, 1.03),
        current_pu=(0.40, 0.70), vibration_mm_s=(0.8, 2.5), oil_temp_c=(45, 68),
    ),
    "feeder": dict(
        load_pct=(35, 65), temperature_c=(30, 50), voltage_pu=(0.96, 1.04),
        current_pu=(0.35, 0.65), vibration_mm_s=(0.5, 1.8), oil_temp_c=(35, 60),
    ),
    "substation": dict(
        load_pct=(45, 75), temperature_c=(35, 55), voltage_pu=(0.97, 1.03),
        current_pu=(0.45, 0.75), vibration_mm_s=(1.0, 3.0), oil_temp_c=(40, 65),
    ),
}

# Degraded operating bands (used during scenario)
DEGRADED_BANDS: Dict[str, dict] = {
    "transformer": dict(
        load_pct=(88, 108), temperature_c=(82, 98), voltage_pu=(0.86, 0.93),
        current_pu=(0.90, 1.15), vibration_mm_s=(6.0, 12.0), oil_temp_c=(92, 112),
    ),
    "feeder": dict(
        load_pct=(80, 100), temperature_c=(70, 88), voltage_pu=(0.88, 0.94),
        current_pu=(0.82, 1.05), vibration_mm_s=(4.5, 9.0), oil_temp_c=(78, 95),
    ),
    "substation": dict(
        load_pct=(85, 105), temperature_c=(75, 92), voltage_pu=(0.87, 0.93),
        current_pu=(0.85, 1.08), vibration_mm_s=(5.5, 10.0), oil_temp_c=(85, 105),
    ),
}


@dataclass
class AssetState:
    id: str
    name: str
    asset_type: str
    substation: str
    rated_kva: int
    age_years: int
    base_health: int
    # live readings
    load_pct: float = 55.0
    temperature_c: float = 45.0
    voltage_pu: float = 1.00
    current_pu: float = 0.55
    vibration_mm_s: float = 1.5
    oil_temp_c: float = 55.0
    last_maint_days: int = 90
    fault_history: int = 0
    # computed
    health_score: float = 90.0
    failure_risk_score: float = 0.05
    failure_risk_label: str = "low"
    anomaly_score: float = 0.0
    is_anomaly: bool = False
    status: str = "normal"          # normal | warning | critical
    alerts: List[str] = field(default_factory=list)
    advisory: str = ""
    recommendation: str = ""
    risk_window_estimate: str = ""
    advisor_factors: List[dict] = field(default_factory=list)
    advisor_recs: List[str] = field(default_factory=list)
    # history (last 30 ticks)
    history_load: List[float] = field(default_factory=list)
    history_temp: List[float] = field(default_factory=list)
    history_voltage: List[float] = field(default_factory=list)
    history_health: List[float] = field(default_factory=list)
    history_risk: List[float] = field(default_factory=list)
    # scenario
    _degrading: bool = False
    _degrade_step: int = 0

    def to_dict(self):
        d = asdict(self)
        # Remove private fields
        d.pop("_degrading", None)
        d.pop("_degrade_step", None)
        return d


class SensorSimulator:
    """
    Maintains live state for all assets and advances one tick at a time.
    The API calls next_tick() on a background thread; the last state is
    readable at any time via get_assets() and get_grid_state().
    """

    def __init__(self):
        self.assets: Dict[str, AssetState] = {}
        self._tick = 0
        self._scenario_active = False
        self._scenario_target_ids: List[str] = []
        self._init_assets()

    def _init_assets(self):
        rng = random.Random(1234)
        for (aid, name, atype, sub, kva, age, health) in ASSET_DEFINITIONS:
            band = NORMAL_BANDS[atype]
            a = AssetState(
                id=aid, name=name, asset_type=atype, substation=sub,
                rated_kva=kva, age_years=age, base_health=health,
                load_pct=rng.uniform(*band["load_pct"]),
                temperature_c=rng.uniform(*band["temperature_c"]),
                voltage_pu=rng.uniform(*band["voltage_pu"]),
                current_pu=rng.uniform(*band["current_pu"]),
                vibration_mm_s=rng.uniform(*band["vibration_mm_s"]),
                oil_temp_c=rng.uniform(*band["oil_temp_c"]),
                last_maint_days=rng.randint(30, 200),
                fault_history=rng.randint(0, 2),
            )
            self.assets[aid] = a

    # ------------------------------------------------------------------ #
    # Public interface                                                     #
    # ------------------------------------------------------------------ #
    def start_scenario(self, asset_ids: List[str] = None):
        """Begin the degrading-conditions demo scenario."""
        if asset_ids is None:
            asset_ids = ["T-201", "F-201"]  # default: old transformer + feeder
        self._scenario_target_ids = asset_ids
        self._scenario_active = True
        for aid in asset_ids:
            if aid in self.assets:
                self.assets[aid]._degrading = True
                self.assets[aid]._degrade_step = 0
        return {"started": True, "targets": asset_ids}

    def stop_scenario(self):
        """Reset scenario assets back to normal conditions."""
        self._scenario_active = False
        for aid in self._scenario_target_ids:
            if aid in self.assets:
                a = self.assets[aid]
                a._degrading = False
                a._degrade_step = 0
                band = NORMAL_BANDS[a.asset_type]
                a.load_pct       = random.uniform(*band["load_pct"])
                a.temperature_c  = random.uniform(*band["temperature_c"])
                a.voltage_pu     = random.uniform(*band["voltage_pu"])
                a.current_pu     = random.uniform(*band["current_pu"])
                a.vibration_mm_s = random.uniform(*band["vibration_mm_s"])
                a.oil_temp_c     = random.uniform(*band["oil_temp_c"])
        self._scenario_target_ids = []
        return {"stopped": True}

    def next_tick(self, predictor):
        """Advance simulation by one tick, update all asset states."""
        self._tick += 1
        t = self._tick

        for aid, asset in self.assets.items():
            self._update_readings(asset, t)
            self._compute_derived(asset, predictor)
            self._update_history(asset)

    def get_assets(self) -> List[dict]:
        return [a.to_dict() for a in self.assets.values()]

    def get_asset(self, aid: str) -> dict | None:
        a = self.assets.get(aid)
        return a.to_dict() if a else None

    def get_advisor(self, aid: str) -> dict | None:
        """Return a rich structured advisory payload for the named asset."""
        a = self.assets.get(aid)
        if a is None:
            return None
        # Determine the risk window label for the UI
        score = a.failure_risk_score
        if a.status == "critical" or score >= 0.65:
            window_label = "Within 24 Hours"
            window_note  = "Critical — estimate only"
        elif score >= 0.45:
            window_label = "Within Several Days"
            window_note  = "High — estimate only"
        elif score >= 0.25:
            window_label = "Monitor Closely — Within Weeks"
            window_note  = "Moderate — estimate only"
        else:
            window_label = "No Immediate Risk"
            window_note  = "Low — estimate only"

        return {
            "id":               a.id,
            "name":             a.name,
            "asset_type":       a.asset_type,
            "substation":       a.substation,
            "status":           a.status,
            "health_score":     round(a.health_score, 1),
            "failure_risk_pct": round(a.failure_risk_score * 100, 1),
            "failure_risk_label": a.failure_risk_label,
            "anomaly_score":    round(a.anomaly_score * 100, 1),
            "is_anomaly":       a.is_anomaly,
            "risk_window_label": window_label,
            "risk_window_note":  window_note,
            "factors":          a.advisor_factors,
            "recommendations":  a.advisor_recs,
            "advisory_text":    a.advisory,
            # Trend data
            "history_health":   a.history_health[-20:],
            "history_risk":     [round(v * 100, 1) for v in a.history_risk[-20:]],
            "history_temp":     a.history_temp[-20:],
            "history_load":     a.history_load[-20:],
            "history_vibration": [],   # not tracked separately; use live value
            "live_vibration":   round(a.vibration_mm_s, 2),
            "live_temperature": round(a.temperature_c, 1),
            "live_load":        round(a.load_pct, 1),
        }

    def get_grid_state(self, predictor) -> dict:
        assets = list(self.assets.values())
        avg_load   = sum(a.load_pct for a in assets) / len(assets)
        avg_health = sum(a.health_score for a in assets) / len(assets)
        max_v_dev  = max(abs(a.voltage_pu - 1.0) for a in assets)
        high_risk  = sum(1 for a in assets if a.failure_risk_label in ("high",))
        critical   = sum(1 for a in assets if a.status == "critical")
        active_alerts = sum(len(a.alerts) for a in assets)
        anomalies  = sum(1 for a in assets if a.is_anomaly)
        # grid-level outage risk
        grid_state = {
            "grid_load_pct":       round(avg_load, 1),
            "voltage_deviation":   round(max_v_dev, 4),
            "frequency_deviation": round(abs(random.gauss(0.05, 0.04)), 3),
            "high_risk_assets":    high_risk + critical,
            "active_faults":       critical,
            "weather_severity":    round(random.uniform(1, 5), 1),
            "peak_hour":           1 if (self._tick % 48) in range(20, 32) else 0,
        }
        outage = predictor.predict_outage_risk(grid_state)
        return {
            "grid_health_score":  round(avg_health, 1),
            "outage_risk_score":  outage["risk_score"],
            "outage_risk_label":  outage["risk_label"],
            "outage_probabilities": outage["probabilities"],
            "avg_load_pct":       round(avg_load, 1),
            "high_risk_count":    high_risk + critical,
            "critical_count":     critical,
            "anomaly_count":      anomalies,
            "active_alert_count": active_alerts,
            "tick":               self._tick,
            "grid_features":      grid_state,
        }

    # ------------------------------------------------------------------ #
    # Internal helpers                                                     #
    # ------------------------------------------------------------------ #
    def _update_readings(self, asset: AssetState, t: int):
        is_deg = asset._degrading
        if is_deg:
            asset._degrade_step = min(asset._degrade_step + 1, 30)

        band = NORMAL_BANDS[asset.asset_type]
        dbnd = DEGRADED_BANDS[asset.asset_type]

        def interpolate(normal_range, degrade_range, step, max_step=30):
            alpha = step / max_step
            low  = normal_range[0] + alpha * (degrade_range[0] - normal_range[0])
            high = normal_range[1] + alpha * (degrade_range[1] - normal_range[1])
            return low, high

        def jitter(current, low, high, sigma=0.008):
            # Small random walk that stays within band
            delta = random.gauss(0, sigma * (high - low))
            return max(low, min(high, current + delta))

        if is_deg:
            step = asset._degrade_step
            asset.load_pct       = jitter(asset.load_pct,       *interpolate(band["load_pct"],       dbnd["load_pct"],       step))
            asset.temperature_c  = jitter(asset.temperature_c,  *interpolate(band["temperature_c"],  dbnd["temperature_c"],  step))
            asset.voltage_pu     = jitter(asset.voltage_pu,     *interpolate(band["voltage_pu"],     dbnd["voltage_pu"],     step))
            asset.current_pu     = jitter(asset.current_pu,     *interpolate(band["current_pu"],     dbnd["current_pu"],     step))
            asset.vibration_mm_s = jitter(asset.vibration_mm_s, *interpolate(band["vibration_mm_s"], dbnd["vibration_mm_s"], step))
            asset.oil_temp_c     = jitter(asset.oil_temp_c,     *interpolate(band["oil_temp_c"],     dbnd["oil_temp_c"],     step))
        else:
            # Diurnal load cycle + noise
            phase = (t / 48.0) * 2 * math.pi
            load_offset = 8 * math.sin(phase)
            lo, hi = band["load_pct"]
            mid_load = (lo + hi) / 2 + load_offset
            asset.load_pct       = jitter(asset.load_pct,       mid_load - (hi-lo)*0.3, mid_load + (hi-lo)*0.3)
            asset.temperature_c  = jitter(asset.temperature_c,  *band["temperature_c"])
            asset.voltage_pu     = jitter(asset.voltage_pu,     *band["voltage_pu"])
            asset.current_pu     = jitter(asset.current_pu,     *band["current_pu"])
            asset.vibration_mm_s = jitter(asset.vibration_mm_s, *band["vibration_mm_s"])
            asset.oil_temp_c     = jitter(asset.oil_temp_c,     *band["oil_temp_c"])

    def _compute_derived(self, asset: AssetState, predictor):
        readings = {
            "load_pct":        asset.load_pct,
            "temperature_c":   asset.temperature_c,
            "voltage_pu":      asset.voltage_pu,
            "current_pu":      asset.current_pu,
            "vibration_mm_s":  asset.vibration_mm_s,
            "oil_temp_c":      asset.oil_temp_c,
            "age_years":       asset.age_years,
            "last_maint_days": asset.last_maint_days,
            "fault_history":   asset.fault_history,
        }
        risk_result    = predictor.predict_equipment_risk(readings)
        anomaly_result = predictor.detect_anomaly(readings)

        asset.failure_risk_score = risk_result["risk_score"]
        asset.failure_risk_label = risk_result["risk_label"]
        asset.anomaly_score      = anomaly_result["anomaly_score"]
        asset.is_anomaly         = anomaly_result["is_anomaly"]

        # Health score: blend base health with current risk
        penalty = risk_result["risk_score"] * 40  # up to -40 pts
        age_penalty = min(asset.age_years * 0.5, 15)
        maint_penalty = min(asset.last_maint_days / 50, 10)
        raw = asset.base_health - penalty - age_penalty - maint_penalty
        asset.health_score = round(max(5.0, min(100.0, raw)), 1)

        # Status
        if asset.failure_risk_label == "high" or asset.health_score < 45:
            asset.status = "critical"
        elif asset.failure_risk_label == "medium" or asset.health_score < 68:
            asset.status = "warning"
        else:
            asset.status = "normal"

        # Alerts
        asset.alerts = _generate_alerts(asset)

        # Advisory
        if asset.status != "normal":
            top_factors = predictor.get_top_equipment_factors(readings)
            asset.advisory, asset.recommendation, asset.risk_window_estimate = \
                _generate_advisory(asset, top_factors)
            asset.advisor_factors = getattr(asset, "_advisor_factors", [])
            asset.advisor_recs    = getattr(asset, "_advisor_recs", [])
        else:
            asset.advisory = "Operating within normal parameters."
            asset.recommendation = "Continue regular monitoring and scheduled maintenance."
            asset.risk_window_estimate = ""
            asset.advisor_factors = []
            asset.advisor_recs = []

    def _update_history(self, asset: AssetState):
        MAX = 30
        asset.history_load.append(round(asset.load_pct, 1))
        asset.history_temp.append(round(asset.temperature_c, 1))
        asset.history_voltage.append(round(asset.voltage_pu, 3))
        asset.history_health.append(round(asset.health_score, 1))
        asset.history_risk.append(round(asset.failure_risk_score, 3))
        for lst in [
            asset.history_load, asset.history_temp, asset.history_voltage,
            asset.history_health, asset.history_risk,
        ]:
            if len(lst) > MAX:
                lst.pop(0)


# ------------------------------------------------------------------ #
# Alert generation                                                    #
# ------------------------------------------------------------------ #
def _generate_alerts(asset: AssetState) -> List[str]:
    alerts = []
    if asset.load_pct > 90:
        alerts.append(f"OVERLOAD: Load at {asset.load_pct:.1f}% of rated capacity")
    if asset.temperature_c > 80:
        alerts.append(f"HIGH TEMP: Equipment temperature {asset.temperature_c:.1f}°C")
    if asset.voltage_pu < 0.90:
        alerts.append(f"LOW VOLTAGE: Voltage {asset.voltage_pu:.3f} pu (below 0.90)")
    if asset.voltage_pu > 1.08:
        alerts.append(f"HIGH VOLTAGE: Voltage {asset.voltage_pu:.3f} pu (above 1.08)")
    if asset.vibration_mm_s > 5.0:
        alerts.append(f"VIBRATION: Vibration {asset.vibration_mm_s:.1f} mm/s exceeds threshold")
    if asset.oil_temp_c > 90:
        alerts.append(f"OIL TEMP: Oil/insulation temperature {asset.oil_temp_c:.1f}°C")
    if asset.is_anomaly:
        alerts.append(f"ANOMALY DETECTED: Abnormal operating pattern (score {asset.anomaly_score:.2f})")
    if asset.failure_risk_label == "high":
        alerts.append("CRITICAL RISK: Equipment failure risk elevated to HIGH")
    return alerts


# ------------------------------------------------------------------ #
# Advisory generation                                                 #
# ------------------------------------------------------------------ #

def _sensor_factors(asset: AssetState) -> List[dict]:
    """
    Derive contributing factors dynamically from actual sensor readings.
    Each factor: {key, description, severity}  severity: high|medium|low
    Ordered by severity descending.
    """
    factors = []

    # Temperature
    if asset.temperature_c > 80:
        factors.append({"key": "temperature_c",
                         "description": f"Equipment temperature is critically high ({asset.temperature_c:.1f}°C)",
                         "severity": "high"})
    elif asset.temperature_c > 65:
        factors.append({"key": "temperature_c",
                         "description": f"Equipment temperature is above normal ({asset.temperature_c:.1f}°C)",
                         "severity": "medium"})

    # Oil temperature
    if asset.oil_temp_c > 90:
        factors.append({"key": "oil_temp_c",
                         "description": f"Oil/insulation temperature is critically elevated ({asset.oil_temp_c:.1f}°C)",
                         "severity": "high"})
    elif asset.oil_temp_c > 75:
        factors.append({"key": "oil_temp_c",
                         "description": f"Oil/insulation temperature is elevated ({asset.oil_temp_c:.1f}°C)",
                         "severity": "medium"})

    # Load
    if asset.load_pct > 95:
        factors.append({"key": "load_pct",
                         "description": f"Load is critically high ({asset.load_pct:.1f}% of rated capacity)",
                         "severity": "high"})
    elif asset.load_pct > 85:
        factors.append({"key": "load_pct",
                         "description": f"Load exceeds normal operating range ({asset.load_pct:.1f}%)",
                         "severity": "medium"})

    # Vibration
    if asset.vibration_mm_s > 7.0:
        factors.append({"key": "vibration_mm_s",
                         "description": f"Vibration exceeds critical threshold ({asset.vibration_mm_s:.1f} mm/s)",
                         "severity": "high"})
    elif asset.vibration_mm_s > 4.0:
        factors.append({"key": "vibration_mm_s",
                         "description": f"Vibration is above normal levels ({asset.vibration_mm_s:.1f} mm/s)",
                         "severity": "medium"})

    # Voltage
    if asset.voltage_pu < 0.88:
        factors.append({"key": "voltage_pu",
                         "description": f"Voltage is critically low ({asset.voltage_pu:.3f} pu — below 0.88)",
                         "severity": "high"})
    elif asset.voltage_pu < 0.93:
        factors.append({"key": "voltage_pu",
                         "description": f"Voltage deviation from nominal ({asset.voltage_pu:.3f} pu)",
                         "severity": "medium"})
    elif asset.voltage_pu > 1.08:
        factors.append({"key": "voltage_pu",
                         "description": f"Over-voltage condition ({asset.voltage_pu:.3f} pu)",
                         "severity": "medium"})

    # Current
    if asset.current_pu > 1.05:
        factors.append({"key": "current_pu",
                         "description": f"Current draw is critically elevated ({asset.current_pu:.3f} pu)",
                         "severity": "high"})
    elif asset.current_pu > 0.90:
        factors.append({"key": "current_pu",
                         "description": f"Current draw is above normal ({asset.current_pu:.3f} pu)",
                         "severity": "medium"})

    # Age
    if asset.age_years >= 20:
        factors.append({"key": "age_years",
                         "description": f"Equipment age is high ({asset.age_years} years) — increased wear risk",
                         "severity": "medium"})
    elif asset.age_years >= 15:
        factors.append({"key": "age_years",
                         "description": f"Equipment is ageing ({asset.age_years} years)",
                         "severity": "low"})

    # Maintenance overdue
    if asset.last_maint_days > 180:
        factors.append({"key": "last_maint_days",
                         "description": f"Maintenance is overdue ({asset.last_maint_days} days since last service)",
                         "severity": "medium"})
    elif asset.last_maint_days > 120:
        factors.append({"key": "last_maint_days",
                         "description": f"Time since last maintenance is high ({asset.last_maint_days} days)",
                         "severity": "low"})

    # Fault history
    if asset.fault_history >= 3:
        factors.append({"key": "fault_history",
                         "description": f"Prior fault history is significant ({int(asset.fault_history)} recorded events)",
                         "severity": "medium"})

    # Anomaly
    if asset.is_anomaly:
        factors.append({"key": "anomaly",
                         "description": f"Abnormal operating pattern detected (anomaly score {asset.anomaly_score:.2f})",
                         "severity": "high"})

    # Sort: high first, then medium, then low
    order = {"high": 0, "medium": 1, "low": 2}
    factors.sort(key=lambda x: order.get(x["severity"], 3))
    return factors


def _sensor_recommendations(asset: AssetState, factors: List[dict]) -> List[str]:
    """
    Build a contextual list of recommended actions based on actual sensor conditions.
    """
    recs = []
    keys = {f["key"] for f in factors}
    level = "critical" if asset.status == "critical" else "warning"

    if "temperature_c" in keys or "oil_temp_c" in keys:
        recs.append("Inspect cooling system and thermal conditions — check fans, coolant flow, and heat exchangers")
    if "load_pct" in keys or "current_pu" in keys:
        recs.append("Review current loading levels — consider temporary load reduction or load balancing")
    if "vibration_mm_s" in keys:
        recs.append("Inspect for mechanical looseness, bearing wear, or mounting issues causing abnormal vibration")
    if "voltage_pu" in keys:
        recs.append("Check voltage regulation, tap changer settings, and upstream supply conditions")
    if "age_years" in keys or "last_maint_days" in keys:
        recs.append("Schedule preventive maintenance — prioritise inspection of aged or under-maintained components")
    if "fault_history" in keys:
        recs.append("Review fault history records and inspect components with prior fault events")
    if "anomaly" in keys:
        recs.append("Investigate anomalous operating pattern — compare against historical baseline readings")

    if level == "critical":
        if not recs:
            recs.append("Schedule immediate inspection by a qualified field engineer")
        recs.append("Prepare contingency switching plan to isolate this asset if conditions worsen")
    else:
        if not recs:
            recs.append("Increase monitoring frequency and schedule a maintenance inspection within 7 days")
        recs.append("Verify protection relay settings are current for this equipment")

    return recs


def _risk_window(asset: AssetState) -> str:
    """Return a labelled risk window estimate based on risk score and status."""
    score = asset.failure_risk_score
    if asset.status == "critical" or score >= 0.65:
        return "Within 24 Hours (Critical — estimate only, not a guaranteed failure time)"
    elif score >= 0.45:
        return "Within Several Days (High — estimate only, not a guaranteed failure time)"
    elif score >= 0.25:
        return "Monitor Closely — Within Weeks (Moderate — estimate only)"
    else:
        return "No Immediate Risk (Low — estimate only)"


def _generate_advisory(asset: AssetState, top_factors: List[str]) -> tuple:
    """
    Generate structured advisory.  Uses actual sensor readings for dynamic
    factor selection; ML feature importances kept as fallback hint only.
    Stores structured lists on asset for the /api/advisor endpoint.
    """
    sensor_facts = _sensor_factors(asset)
    recs = _sensor_recommendations(asset, sensor_facts)

    # Build summary text
    if sensor_facts:
        fact_texts = "; ".join(f["description"] for f in sensor_facts[:4])
    else:
        _FD = {
            "load_pct": "elevated load percentage",
            "temperature_c": "high equipment temperature",
            "voltage_pu": "voltage deviation from nominal",
            "current_pu": "elevated current draw",
            "vibration_mm_s": "abnormal vibration level",
            "oil_temp_c": "high oil/insulation temperature",
            "age_years": "advanced equipment age",
            "last_maint_days": "extended time since last maintenance",
            "fault_history": "history of prior fault events",
        }
        fact_texts = ", ".join(_FD.get(f, f) for f in top_factors)

    advisory = (
        f"Asset {asset.name} is in {asset.status.upper()} condition. "
        f"Key contributing factors: {fact_texts}. "
        f"Health score: {asset.health_score:.0f}/100. "
        f"Failure risk: {asset.failure_risk_score:.0%}."
    )
    if asset.is_anomaly:
        advisory += (
            f" Anomaly detected (score {asset.anomaly_score:.2f}) — "
            f"operating behaviour deviates from normal baseline."
        )

    # Store structured data on asset for the /api/advisor endpoint
    asset._advisor_factors = sensor_facts
    asset._advisor_recs = recs

    recommendation = recs[0] if recs else "Continue regular monitoring and scheduled maintenance."
    window = _risk_window(asset)
    return advisory, recommendation, window


# Singleton
_simulator: SensorSimulator | None = None


def get_simulator() -> SensorSimulator:
    global _simulator
    if _simulator is None:
        _simulator = SensorSimulator()
    return _simulator
