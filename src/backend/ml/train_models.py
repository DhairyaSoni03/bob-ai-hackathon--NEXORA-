"""
ML Models for NEXORA
====================
Trains and persists two RandomForest classifiers:
  1. equipment_model  – predicts equipment failure risk (0/1/2)
  2. outage_model     – predicts grid outage risk (0/1/2)

Models are saved to src/backend/models/ as joblib files alongside
feature-importance summaries used by the advisory engine.
"""

import os
import json
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report
import joblib

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

EQUIPMENT_FEATURES = [
    "load_pct", "temperature_c", "voltage_pu", "current_pu",
    "vibration_mm_s", "oil_temp_c", "age_years",
    "last_maint_days", "fault_history",
]
OUTAGE_FEATURES = [
    "grid_load_pct", "voltage_deviation", "frequency_deviation",
    "high_risk_assets", "active_faults", "weather_severity", "peak_hour",
]


def ensure_training_data():
    equip_path = os.path.join(DATA_DIR, "equipment_training.csv")
    outage_path = os.path.join(DATA_DIR, "outage_training.csv")
    if not os.path.exists(equip_path) or not os.path.exists(outage_path):
        from data.generate_training_data import (
            generate_equipment_dataset, generate_outage_dataset
        )
        rng = np.random.default_rng(42)
        os.makedirs(DATA_DIR, exist_ok=True)
        generate_equipment_dataset(5000, rng).to_csv(equip_path, index=False)
        generate_outage_dataset(5000, rng).to_csv(outage_path, index=False)
    return equip_path, outage_path


def train_equipment_model(equip_path: str):
    df = pd.read_csv(equip_path)
    X = df[EQUIPMENT_FEATURES]
    y = df["failure_risk"]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    clf = Pipeline([
        ("scaler", StandardScaler()),
        ("rf", RandomForestClassifier(
            n_estimators=120, max_depth=12, random_state=42,
            class_weight="balanced", n_jobs=-1
        )),
    ])
    clf.fit(X_train, y_train)
    print("Equipment model:")
    print(classification_report(y_test, clf.predict(X_test),
                                 target_names=["low", "medium", "high"]))
    importances = dict(zip(
        EQUIPMENT_FEATURES,
        clf.named_steps["rf"].feature_importances_.tolist()
    ))
    return clf, importances


def train_outage_model(outage_path: str):
    df = pd.read_csv(outage_path)
    X = df[OUTAGE_FEATURES]
    y = df["outage_risk"]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    clf = Pipeline([
        ("scaler", StandardScaler()),
        ("rf", RandomForestClassifier(
            n_estimators=120, max_depth=10, random_state=42,
            class_weight="balanced", n_jobs=-1
        )),
    ])
    clf.fit(X_train, y_train)
    print("Outage model:")
    print(classification_report(y_test, clf.predict(X_test),
                                 target_names=["low", "elevated", "high"]))
    importances = dict(zip(
        OUTAGE_FEATURES,
        clf.named_steps["rf"].feature_importances_.tolist()
    ))
    return clf, importances


def train_anomaly_detector(equip_path: str):
    """
    IsolationForest trained on low-risk samples only so that it learns
    what 'normal' looks like and flags deviations.
    """
    df = pd.read_csv(equip_path)
    normal = df[df["failure_risk"] == 0][EQUIPMENT_FEATURES]
    iso = IsolationForest(
        n_estimators=100, contamination=0.05, random_state=42
    )
    iso.fit(normal)
    return iso


def train_and_save():
    os.makedirs(MODEL_DIR, exist_ok=True)
    equip_path, outage_path = ensure_training_data()

    equip_model, equip_imp = train_equipment_model(equip_path)
    outage_model, outage_imp = train_outage_model(outage_path)
    anomaly_model = train_anomaly_detector(equip_path)

    joblib.dump(equip_model,   os.path.join(MODEL_DIR, "equipment_model.pkl"))
    joblib.dump(outage_model,  os.path.join(MODEL_DIR, "outage_model.pkl"))
    joblib.dump(anomaly_model, os.path.join(MODEL_DIR, "anomaly_model.pkl"))

    with open(os.path.join(MODEL_DIR, "feature_importances.json"), "w") as f:
        json.dump({"equipment": equip_imp, "outage": outage_imp}, f, indent=2)

    print(f"\nModels saved to {MODEL_DIR}")


if __name__ == "__main__":
    train_and_save()
