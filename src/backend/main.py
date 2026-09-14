"""
NEXORA FastAPI Backend - Full Production API
============================================
Serves the React frontend + all REST API endpoints.

Usage:
    cd src/backend
    uvicorn main:app --reload --port 8000
"""
import os, sys, threading, time
from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

_HERE = os.path.dirname(os.path.abspath(__file__))
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)

from ml.predictor import get_predictor
from simulator.sensor_simulator import get_simulator
from data.demo_data import (
    ASSETS, ASSET_MAP, SENSOR_READINGS, WEATHER, WEATHER_ASSET_IMPACT,
    INCIDENTS, PREDICTIONS, MAINTENANCE_ACTIONS, CREW_POSITIONING, ALERTS,
    get_grid_kpi, current_weather, REGIONS,
)

_tick_thread = None
_stop_event = threading.Event()
TICK_INTERVAL = 3


def _tick_loop():
    predictor = get_predictor()
    simulator = get_simulator()
    for _ in range(5):
        simulator.next_tick(predictor)
    while not _stop_event.is_set():
        simulator.next_tick(predictor)
        time.sleep(TICK_INTERVAL)


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _tick_thread
    _ = get_predictor()
    _stop_event.clear()
    _tick_thread = threading.Thread(target=_tick_loop, daemon=True)
    _tick_thread.start()
    yield
    _stop_event.set()


app = FastAPI(title="NEXORA - AI-Powered Power Grid Intelligence", version="2.0.0", lifespan=lifespan)

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ── Pydantic Models ──────────────────────────────────────────────────
class EquipmentReadings(BaseModel):
    load_pct:        float = Field(ge=0, le=130)
    temperature_c:   float = Field(ge=-10, le=200)
    voltage_pu:      float = Field(ge=0.5, le=1.5)
    current_pu:      float = Field(ge=0.0, le=2.0)
    vibration_mm_s:  float = Field(ge=0.0, le=30.0)
    oil_temp_c:      float = Field(ge=0.0, le=200.0)
    age_years:       float = Field(ge=0, le=60)
    last_maint_days: float = Field(ge=0, le=1000)
    fault_history:   float = Field(ge=0, le=20)

class GridState(BaseModel):
    grid_load_pct:       float = Field(ge=0, le=130)
    voltage_deviation:   float = Field(ge=0, le=1.0)
    frequency_deviation: float = Field(ge=0, le=5.0)
    high_risk_assets:    float = Field(ge=0, le=50)
    active_faults:       float = Field(ge=0, le=30)
    weather_severity:    float = Field(ge=0, le=10)
    peak_hour:           float = Field(ge=0, le=1)

class ScenarioRequest(BaseModel):
    asset_ids: Optional[List[str]] = None

class AdvisorRequest(BaseModel):
    asset_id: str

class MaintenanceStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None


# ══════════════════════════════════════════════════════════════════════
# HEALTH
# ══════════════════════════════════════════════════════════════════════
@app.get("/api/health")
def health():
    return {"status":"ok","service":"NEXORA Backend v2","synthetic_data":True}


# ══════════════════════════════════════════════════════════════════════
# GRID COMMAND CENTER
# ══════════════════════════════════════════════════════════════════════
@app.get("/api/grid")
def get_grid():
    predictor = get_predictor()
    simulator = get_simulator()
    live = simulator.get_grid_state(predictor)
    static = get_grid_kpi()
    return {**static, **{k:v for k,v in live.items() if k not in static}}

@app.get("/api/grid/kpi")
def get_grid_kpi_endpoint():
    return get_grid_kpi()


# ══════════════════════════════════════════════════════════════════════
# ASSETS
# ══════════════════════════════════════════════════════════════════════
@app.get("/api/assets")
def get_assets(
    status:     Optional[str] = Query(None, description="Filter: critical|warning|normal"),
    asset_type: Optional[str] = Query(None, description="Filter: transformer|feeder|substation"),
    region:     Optional[str] = Query(None, description="Filter by region name"),
    min_risk:   Optional[float] = Query(None, description="Min failure probability 0-1"),
    sort_by:    Optional[str] = Query("priority", description="Sort field"),
):
    assets = list(ASSETS)
    if status:     assets = [a for a in assets if a["status"] == status]
    if asset_type: assets = [a for a in assets if a["type"] == asset_type]
    if region:     assets = [a for a in assets if a["region"].lower() == region.lower()]
    if min_risk is not None: assets = [a for a in assets if a["failure_probability"] >= min_risk]

    reverse = sort_by in ("failure_probability","impact_score","customers_affected","health_score")
    if sort_by == "health_score":
        assets.sort(key=lambda a: a.get(sort_by,0), reverse=False)
    elif sort_by in ASSETS[0]:
        assets.sort(key=lambda a: a.get(sort_by,0), reverse=reverse)
    else:
        assets.sort(key=lambda a: a.get("priority",99))

    return {"assets": assets, "count": len(assets), "synthetic_data": True}

@app.get("/api/assets/{asset_id}")
def get_asset_detail(asset_id: str):
    asset = ASSET_MAP.get(asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset {asset_id} not found")
    # Enrich with latest sensor reading
    sensors = SENSOR_READINGS.get(asset_id, [])
    latest_sensor = sensors[-1] if sensors else {}
    # Find matching incidents
    incidents = [i for i in INCIDENTS if asset_id in i.get("similar_to_current",[])]
    # Find predictions
    predictions = [p for p in PREDICTIONS if p["asset_id"] == asset_id]
    # Find maintenance
    maint = [m for m in MAINTENANCE_ACTIONS if m["asset_id"] == asset_id]
    return {
        **asset,
        "latest_sensor": latest_sensor,
        "related_incidents": incidents,
        "predictions": predictions,
        "maintenance_actions": maint,
        "synthetic_data": True,
    }

@app.get("/api/assets/{asset_id}/sensors")
def get_asset_sensors(asset_id: str, limit: int = Query(30, ge=1, le=200)):
    if asset_id not in ASSET_MAP:
        raise HTTPException(status_code=404, detail=f"Asset {asset_id} not found")
    readings = SENSOR_READINGS.get(asset_id, [])[-limit:]
    return {"asset_id": asset_id, "readings": readings, "count": len(readings), "synthetic_data": True}

@app.get("/api/assets/{asset_id}/risk")
def get_asset_risk(asset_id: str):
    asset = ASSET_MAP.get(asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset {asset_id} not found")
    sensors = SENSOR_READINGS.get(asset_id,[])
    latest = sensors[-1] if sensors else {}
    prediction = next((p for p in PREDICTIONS if p["asset_id"]==asset_id), None)
    incidents = [i for i in INCIDENTS if asset_id in i.get("similar_to_current",[])]
    weather_impact = next((w for w in WEATHER_ASSET_IMPACT if w["asset_id"]==asset_id), None)
    cw = current_weather(asset["region"])
    return {
        "asset_id":asset_id,"asset_name":asset["name"],
        "health_score":asset["health_score"],"failure_probability":asset["failure_probability"],
        "impact_score":asset["impact_score"],"status":asset["status"],
        "latest_sensor":latest,"prediction":prediction,
        "similar_incidents":incidents,"weather_impact":weather_impact,
        "current_weather":cw,"synthetic_data":True,
    }



# ══════════════════════════════════════════════════════════════════════
# ASSET CRUD — Add / Remove assets at runtime
# ══════════════════════════════════════════════════════════════════════
class NewAsset(BaseModel):
    id: str = Field(min_length=2, max_length=20)
    name: str = Field(min_length=2, max_length=80)
    type: str = Field(pattern="^(transformer|substation|feeder)$")
    substation: str = Field(min_length=1, max_length=60)
    region: str = Field(min_length=1, max_length=60)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    installation_year: int = Field(ge=1950, le=2030)
    rated_capacity_kva: int = Field(ge=1, le=100000)
    health_score: float = Field(ge=0, le=100, default=80.0)
    failure_probability: float = Field(ge=0, le=1, default=0.10)
    impact_score: int = Field(ge=0, le=100, default=50)
    customers_affected: int = Field(ge=0, default=0)
    critical_facilities: List[str] = Field(default=[])
    age_years: int = Field(ge=0, le=80, default=5)
    last_maintenance_days: int = Field(ge=0, le=1000, default=30)
    fault_history: int = Field(ge=0, le=50, default=0)

@app.post("/api/assets", status_code=201)
def create_asset(asset: NewAsset):
    """Add a new asset to the live dataset."""
    if asset.id in ASSET_MAP:
        raise HTTPException(status_code=409, detail=f"Asset {asset.id} already exists")
    # Derive status from failure_probability
    if asset.failure_probability >= 0.65 or asset.health_score < 45:
        status = "critical"
    elif asset.failure_probability >= 0.35 or asset.health_score < 68:
        status = "warning"
    else:
        status = "normal"
    new = {
        **asset.model_dump(),
        "status": status,
        "priority": len(ASSETS) + 1,
    }
    ASSETS.append(new)
    ASSET_MAP[asset.id] = new
    # Seed a flat sensor reading so /sensors doesn't return empty
    from datetime import datetime
    SENSOR_READINGS[asset.id] = [{
        "asset_id": asset.id,
        "timestamp": datetime.utcnow().isoformat(),
        "temperature_c": round(50 + asset.failure_probability * 40, 1),
        "vibration_mm_s": round(1.5 + asset.failure_probability * 6, 2),
        "voltage_pu": round(1.0 - asset.failure_probability * 0.1, 4),
        "current_pu": round(0.55 + asset.failure_probability * 0.4, 3),
        "load_pct": round(55 + asset.failure_probability * 35, 1),
        "frequency_hz": 60.0,
        "partial_discharge_pC": round(10 + asset.failure_probability * 70, 1),
        "oil_quality_index": round(90 - asset.failure_probability * 50, 1),
    }]
    return {"success": True, "asset": new, "message": f"Asset {asset.id} added successfully"}

@app.delete("/api/assets/{asset_id}", status_code=200)
def delete_asset(asset_id: str):
    """Remove an asset from the live dataset."""
    if asset_id not in ASSET_MAP:
        raise HTTPException(status_code=404, detail=f"Asset {asset_id} not found")
    asset = ASSET_MAP.pop(asset_id)
    ASSETS.remove(asset)
    SENSOR_READINGS.pop(asset_id, None)
    # Also remove related predictions, alerts, maintenance actions
    global PREDICTIONS, ALERTS, MAINTENANCE_ACTIONS
    PREDICTIONS = [p for p in PREDICTIONS if p["asset_id"] != asset_id]
    ALERTS[:] = [a for a in ALERTS if a["asset_id"] != asset_id]
    MAINTENANCE_ACTIONS[:] = [m for m in MAINTENANCE_ACTIONS if m["asset_id"] != asset_id]
    return {"success": True, "deleted_id": asset_id, "message": f"Asset {asset_id} removed successfully"}
# ══════════════════════════════════════════════════════════════════════
# LEGACY EQUIPMENT (backward compatibility with old frontend)
# ══════════════════════════════════════════════════════════════════════
@app.get("/api/equipment")
def get_equipment(status: Optional[str]=Query(None), asset_type: Optional[str]=Query(None)):
    simulator = get_simulator()
    assets = simulator.get_assets()
    if status:     assets = [a for a in assets if a["status"]==status]
    if asset_type: assets = [a for a in assets if a["asset_type"]==asset_type]
    return {"equipment":assets,"count":len(assets)}

@app.get("/api/equipment/{asset_id}")
def get_equipment_detail(asset_id: str):
    simulator = get_simulator()
    asset = simulator.get_asset(asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset {asset_id} not found")
    return asset


# ══════════════════════════════════════════════════════════════════════
# WEATHER
# ══════════════════════════════════════════════════════════════════════
@app.get("/api/weather")
def get_weather(region: Optional[str]=Query(None)):
    if region:
        recs = WEATHER.get(region)
        if not recs:
            raise HTTPException(status_code=404, detail=f"Region '{region}' not found")
        return {"region":region,"records":recs,"current":current_weather(region),"synthetic_data":True}
    result = {}
    for r in REGIONS:
        result[r] = {"current":current_weather(r),"forecast":[x for x in WEATHER[r] if x["is_forecast"]][:24]}
    return {"regions":result,"asset_impacts":WEATHER_ASSET_IMPACT,"synthetic_data":True}

@app.get("/api/weather/{region}")
def get_weather_region(region: str):
    recs = WEATHER.get(region)
    if not recs:
        raise HTTPException(status_code=404, detail=f"Region '{region}' not found")
    return {"region":region,"records":recs,"current":current_weather(region),"asset_impacts":[w for w in WEATHER_ASSET_IMPACT if w["region"]==region],"synthetic_data":True}


# ══════════════════════════════════════════════════════════════════════
# INCIDENTS
# ══════════════════════════════════════════════════════════════════════
@app.get("/api/incidents")
def get_incidents(asset_id: Optional[str]=Query(None), severity: Optional[str]=Query(None)):
    incidents = list(INCIDENTS)
    if asset_id:  incidents = [i for i in incidents if asset_id in [i.get("asset_id")] + i.get("similar_to_current",[])]
    if severity:  incidents = [i for i in incidents if i["severity"]==severity]
    return {"incidents":incidents,"count":len(incidents),"synthetic_data":True}


# ══════════════════════════════════════════════════════════════════════
# PREDICTIONS
# ══════════════════════════════════════════════════════════════════════
@app.get("/api/predictions")
def get_predictions(severity: Optional[str]=Query(None), min_probability: float=Query(0.0)):
    preds = [p for p in PREDICTIONS if p["probability"]>=min_probability]
    if severity: preds = [p for p in preds if p["severity"]==severity]
    preds.sort(key=lambda p: p["probability"], reverse=True)
    return {"predictions":preds,"count":len(preds),"synthetic_data":True}


# ══════════════════════════════════════════════════════════════════════
# ALERTS
# ══════════════════════════════════════════════════════════════════════
@app.get("/api/alerts")
def get_alerts_endpoint(status: Optional[str]=Query(None), severity: Optional[str]=Query(None)):
    alerts = list(ALERTS)
    if status:   alerts = [a for a in alerts if a["status"]==status]
    if severity: alerts = [a for a in alerts if a["severity"]==severity]
    # Also add live simulation alerts
    simulator = get_simulator()
    live_assets = simulator.get_assets()
    for a in live_assets:
        for msg in a.get("alerts",[]):
            alerts.append({"id":f"LIVE-{a['id']}","timestamp":"live","severity":a["status"] if a["status"]!="normal" else "low","type":"live_sensor","asset_id":a["id"],"asset_name":a["name"],"reason":msg,"status":"active","recommended_action":"Review in AI Failure Advisor"})
    return {"alerts":alerts,"count":len(alerts)}

@app.patch("/api/alerts/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str):
    for a in ALERTS:
        if a["id"] == alert_id:
            a["status"] = "acknowledged"
            return {"success":True,"alert_id":alert_id}
    raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")


# ══════════════════════════════════════════════════════════════════════
# MAINTENANCE PLAN
# ══════════════════════════════════════════════════════════════════════
@app.get("/api/maintenance-plan")
def get_maintenance_plan():
    return {"maintenance_actions":MAINTENANCE_ACTIONS,"crew_positioning":CREW_POSITIONING,"count":len(MAINTENANCE_ACTIONS),"synthetic_data":True}

@app.get("/api/maintenance-plan/{action_id}")
def get_maintenance_action(action_id: str):
    action = next((m for m in MAINTENANCE_ACTIONS if m["id"]==action_id), None)
    if not action:
        raise HTTPException(status_code=404, detail=f"Action {action_id} not found")
    return action

@app.patch("/api/maintenance-plan/{action_id}")
def update_maintenance_action(action_id: str, update: MaintenanceStatusUpdate):
    action = next((m for m in MAINTENANCE_ACTIONS if m["id"]==action_id), None)
    if not action:
        raise HTTPException(status_code=404, detail=f"Action {action_id} not found")
    action["status"] = update.status
    if update.notes: action["notes"] = update.notes
    return {"success":True,"action_id":action_id,"new_status":update.status}


# ══════════════════════════════════════════════════════════════════════
# AI FAILURE ADVISOR
# ══════════════════════════════════════════════════════════════════════
@app.get("/api/advisor/{asset_id}")
def get_advisor_for_asset(asset_id: str):
    # First try live simulator data
    simulator = get_simulator()
    live = simulator.get_advisor(asset_id)
    if live:
        return live
    # Fall back to static demo data
    asset = ASSET_MAP.get(asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset {asset_id} not found")
    sensors = SENSOR_READINGS.get(asset_id,[])
    latest = sensors[-1] if sensors else {}
    incidents = [i for i in INCIDENTS if asset_id in i.get("similar_to_current",[])]
    cw = current_weather(asset["region"])
    from advisor.ai_advisor import generate_advisory
    return generate_advisory(asset, latest, cw, incidents)

@app.get("/api/advisor")
def get_top_advisor():
    simulator = get_simulator()
    assets = simulator.get_assets()
    if not assets:
        raise HTTPException(status_code=404, detail="No assets available")
    order = {"critical":0,"warning":1,"normal":2}
    top = min(assets, key=lambda a:(order.get(a["status"],2),-a["failure_risk_score"]))
    return simulator.get_advisor(top["id"])

@app.post("/api/advisor/analyze")
def analyze_asset(req: AdvisorRequest):
    asset = ASSET_MAP.get(req.asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset {req.asset_id} not found")
    sensors = SENSOR_READINGS.get(req.asset_id,[])
    latest = sensors[-1] if sensors else {}
    incidents = [i for i in INCIDENTS if req.asset_id in i.get("similar_to_current",[])]
    cw = current_weather(asset["region"])
    from advisor.ai_advisor import generate_advisory
    return generate_advisory(asset, latest, cw, incidents)


# ══════════════════════════════════════════════════════════════════════
# LEGACY PREDICTOR ENDPOINTS
# ══════════════════════════════════════════════════════════════════════
@app.post("/api/predict/equipment")
def predict_equipment(readings: EquipmentReadings):
    predictor = get_predictor()
    risk = predictor.predict_equipment_risk(readings.model_dump())
    anomaly = predictor.detect_anomaly(readings.model_dump())
    return {**risk, **anomaly}

@app.post("/api/predict/outage")
def predict_outage(state: GridState):
    predictor = get_predictor()
    return predictor.predict_outage_risk(state.model_dump())

@app.post("/api/scenario/start")
def scenario_start(req: ScenarioRequest):
    simulator = get_simulator()
    return simulator.start_scenario(req.asset_ids)

@app.post("/api/scenario/stop")
def scenario_stop():
    simulator = get_simulator()
    return simulator.stop_scenario()


# ══════════════════════════════════════════════════════════════════════
# ANALYTICS
# ══════════════════════════════════════════════════════════════════════
@app.get("/api/analytics")
def get_analytics():
    # Risk distribution
    risk_dist = {"critical":0,"high":0,"medium":0,"low":0}
    for a in ASSETS:
        p = a["failure_probability"]
        if p>=0.65: risk_dist["critical"]+=1
        elif p>=0.45: risk_dist["high"]+=1
        elif p>=0.25: risk_dist["medium"]+=1
        else: risk_dist["low"]+=1

    # Health distribution
    health_dist = {"poor":0,"fair":0,"good":0,"excellent":0}
    for a in ASSETS:
        h = a["health_score"]
        if h<50: health_dist["poor"]+=1
        elif h<70: health_dist["fair"]+=1
        elif h<85: health_dist["good"]+=1
        else: health_dist["excellent"]+=1

    # By type
    type_counts = {}
    for a in ASSETS:
        type_counts[a["type"]] = type_counts.get(a["type"],0)+1

    # Incidents by type
    inc_types = {}
    for i in INCIDENTS:
        inc_types[i["failure_type"]] = inc_types.get(i["failure_type"],0)+1

    return {
        "risk_distribution": risk_dist,
        "health_distribution": health_dist,
        "assets_by_type": type_counts,
        "incidents_by_type": inc_types,
        "total_assets": len(ASSETS),
        "total_incidents": len(INCIDENTS),
        "total_customers_at_risk": sum(a["customers_affected"] for a in ASSETS if a["failure_probability"]>=0.50),
        "synthetic_data": True,
    }

# ══════════════════════════════════════════════════════════════════════
# STATIC FRONTEND
# ══════════════════════════════════════════════════════════════════════
_REACT_DIST = os.path.join(_HERE, "..", "frontend", "nexora", "dist")

if os.path.isdir(_REACT_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(_REACT_DIST, "assets")), name="react_assets")

    @app.get("/", include_in_schema=False)
    def serve_index():
        idx = os.path.join(_REACT_DIST, "index.html")
        if os.path.exists(idx):
            return FileResponse(idx)
        return JSONResponse({"message": "NEXORA API running. Run `npm run build` in src/frontend/nexora first."})

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_spa(full_path: str):
        # Try to serve a real file first (e.g. favicon.svg)
        requested = os.path.join(_REACT_DIST, full_path)
        if os.path.exists(requested) and os.path.isfile(requested):
            return FileResponse(requested)
        # All other routes → return index.html for React Router
        idx = os.path.join(_REACT_DIST, "index.html")
        if os.path.exists(idx):
            return FileResponse(idx)
        raise HTTPException(status_code=404)
