"""
Predictor wrapper – loads trained models from disk (trains if missing)
and exposes predict() methods used by the API layer.
"""

import os
import sys
import json
import numpy as np
import pandas as pd
import joblib

# Allow imports from parent package when run directly
_HERE = os.path.dirname(__file__)
sys.path.insert(0, os.path.join(_HERE, ".."))

MODEL_DIR = os.path.join(_HERE, "..", "models")

EQUIPMENT_FEATURES = [
    "load_pct", "temperature_c", "voltage_pu", "current_pu",
    "vibration_mm_s", "oil_temp_c", "age_years",
    "last_maint_days", "fault_history",
]
OUTAGE_FEATURES = [
    "grid_load_pct", "voltage_deviation", "frequency_deviation",
    "high_risk_assets", "active_faults", "weather_severity", "peak_hour",
]

RISK_LABELS = {0: "low", 1: "medium", 2: "high"}
OUTAGE_LABELS = {0: "low", 1: "elevated", 2: "high"}


class ModelPredictor:
    def __init__(self):
        self._equip_model = None
        self._outage_model = None
        self._anomaly_model = None
        self._feature_importances = {}
        self._load()

    def _load(self):
        equip_path   = os.path.join(MODEL_DIR, "equipment_model.pkl")
        outage_path  = os.path.join(MODEL_DIR, "outage_model.pkl")
        anomaly_path = os.path.join(MODEL_DIR, "anomaly_model.pkl")
        fi_path      = os.path.join(MODEL_DIR, "feature_importances.json")

        if not all(os.path.exists(p) for p in [equip_path, outage_path, anomaly_path]):
            print("[predictor] Models not found – training now …")
            from ml.train_models import train_and_save
            train_and_save()

        self._equip_model   = joblib.load(equip_path)
        self._outage_model  = joblib.load(outage_path)
        self._anomaly_model = joblib.load(anomaly_path)

        if os.path.exists(fi_path):
            with open(fi_path) as f:
                self._feature_importances = json.load(f)

    # ------------------------------------------------------------------ #
    # Equipment failure-risk prediction                                    #
    # ------------------------------------------------------------------ #
    def predict_equipment_risk(self, readings: dict) -> dict:
        """
        readings: dict with keys matching EQUIPMENT_FEATURES.
        Returns risk_label, risk_score (0-1), probabilities.
        """
        X = pd.DataFrame([{k: readings.get(k, 0) for k in EQUIPMENT_FEATURES}])
        proba = self._equip_model.predict_proba(X)[0]
        cls   = int(np.argmax(proba))
        # Weighted risk score: 0*low + 0.5*med + 1.0*high
        score = float(proba[1] * 0.5 + proba[2] * 1.0)
        return {
            "risk_class":  cls,
            "risk_label":  RISK_LABELS[cls],
            "risk_score":  round(score, 4),
            "probabilities": {
                "low":    round(float(proba[0]), 4),
                "medium": round(float(proba[1]), 4),
                "high":   round(float(proba[2]), 4),
            },
        }

    # ------------------------------------------------------------------ #
    # Outage-risk prediction                                               #
    # ------------------------------------------------------------------ #
    def predict_outage_risk(self, grid_state: dict) -> dict:
        X = pd.DataFrame([{k: grid_state.get(k, 0) for k in OUTAGE_FEATURES}])
        proba = self._outage_model.predict_proba(X)[0]
        cls   = int(np.argmax(proba))
        score = float(proba[1] * 0.5 + proba[2] * 1.0)
        return {
            "risk_class":  cls,
            "risk_label":  OUTAGE_LABELS[cls],
            "risk_score":  round(score, 4),
            "probabilities": {
                "low":      round(float(proba[0]), 4),
                "elevated": round(float(proba[1]), 4),
                "high":     round(float(proba[2]), 4),
            },
        }

    # ------------------------------------------------------------------ #
    # Anomaly detection                                                    #
    # ------------------------------------------------------------------ #
    def detect_anomaly(self, readings: dict) -> dict:
        X = pd.DataFrame([{k: readings.get(k, 0) for k in EQUIPMENT_FEATURES}])
        score = self._anomaly_model.decision_function(X)[0]  # more negative = more anomalous
        is_anomaly = bool(self._anomaly_model.predict(X)[0] == -1)
        # Normalise to 0-1 where 1 = most anomalous
        normalised = float(np.clip((-score + 0.1) / 0.5, 0.0, 1.0))
        return {
            "is_anomaly":    is_anomaly,
            "anomaly_score": round(normalised, 4),
        }

    # ------------------------------------------------------------------ #
    # Feature importances (for advisory explanations)                     #
    # ------------------------------------------------------------------ #
    def get_top_equipment_factors(self, readings: dict, n: int = 4) -> list:
        importances = self._feature_importances.get("equipment", {})
        if not importances:
            return []
        sorted_feats = sorted(importances.items(), key=lambda x: x[1], reverse=True)
        return [k for k, _ in sorted_feats[:n]]

    def get_top_outage_factors(self, grid_state: dict, n: int = 3) -> list:
        importances = self._feature_importances.get("outage", {})
        if not importances:
            return []
        sorted_feats = sorted(importances.items(), key=lambda x: x[1], reverse=True)
        return [k for k, _ in sorted_feats[:n]]


# Singleton
_predictor: ModelPredictor | None = None


def get_predictor() -> ModelPredictor:
    global _predictor
    if _predictor is None:
        _predictor = ModelPredictor()
    return _predictor
