# NEXORA - AI-Powered Power Grid Intelligence

> **Predict before failure. Act before outage.**

NEXORA is a full-stack AI-powered grid intelligence decision-support platform for the **Power Outage Prediction & Grid Equipment Failure Advisor** challenge.

---

## Team

| Field | Value |
|---|---|
| Team Name | NEXORA |
| Track | AI |
| Team Lead | Meet Tanti - meett9668@gmail.com |
| Members | Kush Patel, Dhairya Soni, Aahan Soni |

---

## Problem Statement

Power transformer and substation failures cause blackouts costing utilities $1M+/hour. Most utilities use calendar-based maintenance while sensors can show failure signatures weeks in advance. Weather events compound the risk, but sensor data and forecasts are rarely combined in time to act.

---

## Solution

NEXORA combines asset health sensor data, weather forecasts, and historical incident records to:
- **Predict outage-prone areas** and at-risk equipment
- **Rank assets by grid impact severity**
- **Generate prioritised maintenance and crew pre-positioning plans**
- **Explain risk** with IBM watsonx.ai or a transparent local advisory engine

---

## Key Features

- 9-page professional utility operations control-room interface (React + TypeScript)
- AI Failure Advisor: IBM watsonx.ai Granite 13B with transparent local fallback
- Real-time sensor simulation with degradation scenarios for live demo
- Transparent multi-factor risk engine: sensor + health + weather + historical + load + impact
- Outage prediction with sensor / weather / historical contribution breakdown
- Weather-to-asset risk integration showing per-asset weather delta
- Prioritized maintenance plan with crew pre-positioning recommendations
- Historical incident pattern matching

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Recharts, React Router |
| Backend | FastAPI (Python 3.11), Uvicorn |
| AI | IBM watsonx.ai (ibm/granite-13b-instruct-v2) + local fallback |
| ML | Scikit-learn (RandomForestClassifier x2, IsolationForest) |
| Data | Deterministic synthetic demo dataset |

---

## How to Run

```bash
# 1. Clone the repository
git clone https://github.com/meett9668-boop/bob-ai-hackathon--NEXORA-.git
cd bob-ai-hackathon--NEXORA-

# 2. Install Python dependencies
pip install -r src/backend/requirements.txt

# 3. Build the frontend
cd src/frontend/nexora
npm install
npm run build
cd ../../..

# 4. (Optional) Configure environment variables
cp src/.env.example src/backend/.env
# Edit src/backend/.env to add WATSONX_API_KEY and WATSONX_PROJECT_ID if available

# 5. Start the application
cd src/backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

The full application (API + frontend) is available at: **`http://localhost:8000`**

For hot-reload frontend development:
```bash
cd src/frontend/nexora
npm run dev   # http://localhost:5173
```

See `docs/setup-guide.md` for complete setup instructions.

---

## Repository Structure

```
src/                  # All source code
  backend/            # FastAPI backend
    main.py           # API endpoints (18+ routes)
    data/             # Synthetic demo data module
    advisor/          # IBM watsonx.ai + local advisory engine
    ml/               # Scikit-learn ML models
    simulator/        # Real-time sensor simulator
  frontend/
    nexora/           # React+TypeScript SPA
      src/pages/      # 9 application pages
      dist/           # Built frontend (served by backend)
docs/                 # Written documentation
demo/                 # Demo artifacts
presentation/         # Slide deck
submission.yaml       # Structured submission metadata
```

---

## Demo

| Artifact | Link |
|---|---|
| Demo Video | See `demo/demo-video-link.txt` |
| Live Demo | See `demo/live-demo-url.txt` |
| Screenshots | See `demo/screenshots/` |
| Presentation | See `presentation/` |

---

## IBM Technology Integration

**IBM watsonx.ai (ibm/granite-13b-instruct-v2)** is integrated in the Failure Advisor:
- When `WATSONX_API_KEY` and `WATSONX_PROJECT_ID` are set, the Failure Advisor sends structured asset + sensor + weather + incident context to IBM Granite for natural-language risk explanation.
- When not configured, the local deterministic advisory engine runs transparently.
- The UI clearly displays which provider is active.

---

## Known Limitations

- All sensor data, weather records, incidents, and predictions are **synthetic demo data** - not real utility data.
- IBM watsonx.ai requires valid credentials; the system clearly labels when the local engine is used instead.
- ML risk windows are probability estimates only - not guaranteed failure times.
- The prototype uses in-memory state; production would use time-series and relational databases.
