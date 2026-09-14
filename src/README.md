# NEXORA Source Code

All application source code lives here.

## Structure

```
backend/
  main.py           # FastAPI app + all 18+ API endpoints
  requirements.txt  # Python dependencies
  data/
    demo_data.py    # Deterministic synthetic demo dataset (12 assets, weather, incidents)
  advisor/
    ai_advisor.py   # IBM watsonx.ai integration + local fallback advisory engine
  ml/
    predictor.py    # Scikit-learn model wrapper
    train_models.py # Model training script
  simulator/
    sensor_simulator.py  # Real-time sensor data simulator (3s tick)
  models/           # Pre-trained ML model binaries

frontend/
  nexora/           # React + TypeScript SPA (Vite)
    src/
      pages/        # 9 application pages
      components/   # Shared UI components
      api/          # API client (axios)
      types/        # TypeScript type definitions
    dist/           # Built frontend (served by FastAPI backend)

.env.example        # Environment variable documentation
```

## Quick Start

```bash
# Backend
cd src/backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000

# Frontend (build)
cd src/frontend/nexora
npm install && npm run build
```

See `docs/setup-guide.md` for complete setup instructions.
