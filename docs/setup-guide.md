# Setup Guide — NEXORA AI-Powered Power Grid Intelligence

> This guide covers local development setup. All demo data is synthetic — no external utility data source is required.

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Python | 3.11+ | Required for backend |
| Node.js | 18+ | Required for frontend build |
| npm | 9+ | Included with Node.js |
| Git | Any | For cloning the repository |

### Optional (for IBM watsonx.ai integration)
| Requirement | Notes |
|---|---|
| IBM Cloud account | Required for watsonx.ai access |
| watsonx.ai project | Create at cloud.ibm.com/watson |

## Environment Variables

Copy `src/.env.example` to `src/backend/.env` and fill in values:

```bash
# Required for basic operation — no values needed
APP_PORT=8000
APP_ENV=development

# Optional — IBM watsonx.ai integration (Failure Advisor page)
# Leave blank to use the local advisory engine instead
WATSONX_API_KEY=your_ibm_cloud_api_key
WATSONX_PROJECT_ID=your_watsonx_project_id
WATSONX_URL=https://us-south.ml.cloud.ibm.com

# Optional — Slack notifications
SLACK_WEBHOOK_URL=
```

**Never commit your `.env` file.** It is already listed in `.gitignore`.

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/meett9668-boop/bob-ai-hackathon--NEXORA-.git
cd bob-ai-hackathon--NEXORA-
```

### 2. Install backend dependencies

```bash
cd src/backend
pip install -r requirements.txt
```

The `requirements.txt` includes:
- `fastapi>=0.111.0`
- `uvicorn[standard]>=0.29.0`
- `scikit-learn>=1.5.0`
- `pandas>=2.2.0`
- `numpy>=2.0.0`
- `pydantic>=2.7.0`
- `python-dotenv>=1.0.1`

### 3. (Optional) Install IBM watsonx.ai SDK

Only required if you want to use the IBM Granite AI advisor:

```bash
pip install ibm-watsonx-ai>=1.0.0
```

### 4. Install and build the frontend

```bash
cd src/frontend/nexora
npm install
npm run build
```

The built frontend is output to `src/frontend/nexora/dist/`. The FastAPI backend will automatically serve it.

## Running the Application

### Start the backend (serves both API and frontend)

```bash
cd src/backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The application will be available at: **`http://localhost:8000`**

### Development mode (frontend hot reload)

In a separate terminal:

```bash
cd src/frontend/nexora
npm run dev
```

Frontend dev server: `http://localhost:5173` (proxies API calls to `localhost:8000`)

## Verification Steps

After starting the backend, verify:

1. **API health check:**
   ```bash
   curl http://localhost:8000/api/health
   # Expected: {"status":"ok","service":"NEXORA Backend v2","synthetic_data":true}
   ```

2. **Assets endpoint:**
   ```bash
   curl http://localhost:8000/api/assets
   # Expected: JSON with 12 assets including TX-047 at critical status
   ```

3. **Frontend loads:** Open `http://localhost:8000` — Command Center should display with KPI cards, critical alerts, and predictions.

4. **All 9 navigation pages load** without errors:
   - Command Center (/)
   - Grid Map (/grid-map)
   - Asset Intelligence (/assets)
   - Asset Detail (/assets/TX-047)
   - Outage Prediction (/predictions)
   - Weather Intelligence (/weather)
   - Failure Advisor (/advisor)
   - Maintenance Planner (/maintenance)
   - Alerts & Incidents (/alerts)
   - Analytics (/analytics)

5. **Failure Advisor:** Select TX-047 and click Analyze — should generate risk advisory.

6. **IBM watsonx.ai (if configured):** The Failure Advisor panel will show "IBM watsonx.ai" as the provider instead of "Local Advisory Engine".

## Python Syntax Validation

```bash
python -m compileall src/backend
```

## Troubleshooting

| Issue | Solution |
|---|---|
| `ModuleNotFoundError: ml` | Run from `src/backend/` directory |
| `Port 8000 in use` | Change port: `uvicorn main:app --port 8001` |
| Models not found | Backend auto-trains them at startup; wait ~30 seconds |
| Frontend shows blank | Run `npm run build` in `src/frontend/nexora/`, or use dev server |
| `WATSONX_API_KEY not set` | This is fine — system falls back to local advisory engine |
| Charts not rendering | Ensure `recharts` is in `node_modules`; re-run `npm install` |
| CORS error in browser dev | Ensure vite proxy is configured (it is, in `vite.config.ts`) |

## IBM watsonx.ai Integration Details

When `WATSONX_API_KEY` and `WATSONX_PROJECT_ID` are set:

1. The Failure Advisor sends asset + sensor + weather + incident data to IBM Granite 13B Instruct model.
2. The model generates a structured natural-language risk explanation.
3. This is displayed in the Failure Advisor panel alongside the structured risk data.
4. The provider label switches from "Local Advisory Engine" to "IBM watsonx.ai".

When not configured, the local deterministic advisory engine runs instead. The local engine produces the same structured fields but without the IBM AI narrative. The UI clearly labels which provider is active.
