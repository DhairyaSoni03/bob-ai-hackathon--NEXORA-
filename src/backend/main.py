"""
NEXORA FastAPI Backend
======================
Main entry point.  Serves both the REST API (under /api/) and the
static frontend (src/frontend/) at the root.

Usage:
    cd src/backend
    uvicorn main:app --reload --port 8000
"""

import os
import sys
import threading
import time
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional

# ------------------------------------------------------------------ #
# Make sure sibling packages are importable                           #
# ------------------------------------------------------------------ #
_HERE = os.path.dirname(os.path.abspath(__file__))
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)

from ml.predictor import get_predictor
from simulator.sensor_simulator import get_simulator

# ------------------------------------------------------------------ #
# Startup / Shutdown                                                  #
# ------------------------------------------------------------------ #
_tick_thread: threading.Thread | None = None
_stop_event = threading.Event()

TICK_INTERVAL = 3  # seconds between simulation ticks


def _tick_loop():
    predictor = get_predictor()
    simulator = get_simulator()
    # Prime with a few ticks so first request has data
    for _ in range(5):
        simulator.next_tick(predictor)
    while not _stop_event.is_set():
        simulator.next_tick(predictor)
        time.sleep(TICK_INTERVAL)


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _tick_thread
    # Pre-load models (trains if not present)
    _ = get_predictor()
    # Start simulation loop in background thread
    _stop_event.clear()
    _tick_thread = threading.Thread(target=_tick_loop, daemon=True)
    _tick_thread.start()
    yield
    _stop_event.set()


# ------------------------------------------------------------------ #
# App                                                                 #
# ------------------------------------------------------------------ #
app = FastAPI(
    title="NEXORA — AI-Powered Power Grid Intelligence",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------ #
# Pydantic models                                                     #
# ------------------------------------------------------------------ #
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


# ------------------------------------------------------------------ #
# API Routes                                                          #
# ------------------------------------------------------------------ #

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "NEXORA Backend"}


# --- Grid overview ---------------------------------------------------
@app.get("/api/grid")
def get_grid():
    predictor = get_predictor()
    simulator = get_simulator()
    return simulator.get_grid_state(predictor)


# --- Equipment list --------------------------------------------------
@app.get("/api/equipment")
def get_equipment(
    status: Optional[str] = Query(None, description="Filter by status: normal|warning|critical"),
    asset_type: Optional[str] = Query(None, description="Filter by type: transformer|feeder|substation"),
):
    simulator = get_simulator()
    assets = simulator.get_assets()
    if status:
        assets = [a for a in assets if a["status"] == status]
    if asset_type:
        assets = [a for a in assets if a["asset_type"] == asset_type]
    return {"equipment": assets, "count": len(assets)}


# --- Single equipment detail -----------------------------------------
@app.get("/api/equipment/{asset_id}")
def get_equipment_detail(asset_id: str):
    simulator = get_simulator()
    asset = simulator.get_asset(asset_id)
    if asset is None:
        raise HTTPException(status_code=404, detail=f"Asset {asset_id} not found")
    return asset


# --- Ad-hoc equipment prediction ------------------------------------
@app.post("/api/predict/equipment")
def predict_equipment(readings: EquipmentReadings):
    predictor = get_predictor()
    risk = predictor.predict_equipment_risk(readings.model_dump())
    anomaly = predictor.detect_anomaly(readings.model_dump())
    return {**risk, **anomaly}


# --- Ad-hoc outage prediction ----------------------------------------
@app.post("/api/predict/outage")
def predict_outage(state: GridState):
    predictor = get_predictor()
    return predictor.predict_outage_risk(state.model_dump())


# --- AI Advisor ------------------------------------------------------
@app.get("/api/advisor/{asset_id}")
def get_advisor(asset_id: str):
    simulator = get_simulator()
    data = simulator.get_advisor(asset_id)
    if data is None:
        raise HTTPException(status_code=404, detail=f"Asset {asset_id} not found")
    return data


@app.get("/api/advisor")
def get_top_advisor():
    """Return the advisor for the highest-risk asset (for auto-populate)."""
    simulator = get_simulator()
    assets = simulator.get_assets()
    if not assets:
        raise HTTPException(status_code=404, detail="No assets available")
    # Priority: critical > warning > normal; within same level, highest risk_score
    order = {"critical": 0, "warning": 1, "normal": 2}
    top = min(assets, key=lambda a: (order.get(a["status"], 2), -a["failure_risk_score"]))
    data = simulator.get_advisor(top["id"])
    if data is None:
        raise HTTPException(status_code=404, detail="Advisor data not available")
    return data


# --- Alerts ----------------------------------------------------------
@app.get("/api/alerts")
def get_alerts():
    simulator = get_simulator()
    assets = simulator.get_assets()
    all_alerts = []
    for a in assets:
        for alert in a["alerts"]:
            all_alerts.append({
                "asset_id":   a["id"],
                "asset_name": a["name"],
                "status":     a["status"],
                "message":    alert,
            })
    return {"alerts": all_alerts, "count": len(all_alerts)}


# --- Scenario control ------------------------------------------------
@app.post("/api/scenario/start")
def scenario_start(req: ScenarioRequest):
    simulator = get_simulator()
    result = simulator.start_scenario(req.asset_ids)
    return result


@app.post("/api/scenario/stop")
def scenario_stop():
    simulator = get_simulator()
    result = simulator.stop_scenario()
    return result


# ------------------------------------------------------------------ #
# Serve static frontend                                               #
# ------------------------------------------------------------------ #
_FRONTEND_DIR = os.path.join(_HERE, "..", "frontend")

if os.path.isdir(_FRONTEND_DIR):
    app.mount("/static", StaticFiles(directory=_FRONTEND_DIR), name="static")

    @app.get("/", include_in_schema=False)
    def serve_index():
        index = os.path.join(_FRONTEND_DIR, "index.html")
        if os.path.exists(index):
            return FileResponse(index)
        return JSONResponse({"message": "NEXORA API running. Frontend not found."})

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_spa(full_path: str):
        requested = os.path.join(_FRONTEND_DIR, full_path)
        if os.path.exists(requested) and os.path.isfile(requested):
            return FileResponse(requested)
        index = os.path.join(_FRONTEND_DIR, "index.html")
        if os.path.exists(index):
            return FileResponse(index)
        raise HTTPException(status_code=404)
