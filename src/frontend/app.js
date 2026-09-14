/**
 * NEXORA Dashboard — Main Application Script
 * ===========================================
 * Polls the backend API and updates the dashboard in real time.
 * No build step required.
 */

const API_BASE = "";   // same-origin — backend serves frontend

// ------------------------------------------------------------------ //
// State                                                               //
// ------------------------------------------------------------------ //
let allEquipment    = [];
let filteredEquipment = [];
let selectedAssetId = null;
let scenarioActive  = false;

// AI Advisor state
let advisorAssetId  = null;   // currently pinned in the advisor panel
let advisorData     = null;   // last fetched advisor payload
// Mini sparkline chart instances inside the advisor
const advCharts = {};

// Chart instances (detail row)
const charts = {};

// ------------------------------------------------------------------ //
// Initialisation                                                      //
// ------------------------------------------------------------------ //
window.addEventListener("DOMContentLoaded", () => {
  initCharts();
  refresh();
  setInterval(refresh, 3000);
  // Advisor polls independently to keep it live
  refreshAdvisor();
  setInterval(refreshAdvisor, 3000);
});

// ------------------------------------------------------------------ //
// Charts                                                              //
// ------------------------------------------------------------------ //
function initCharts() {
  const defs = [
    ["chartLoad",    "#3b82f6", "rgba(59,130,246,0.12)",  0,  130],
    ["chartTemp",    "#f97316", "rgba(249,115,22,0.12)",  10, 120],
    ["chartVoltage", "#22c55e", "rgba(34,197,94,0.12)",   0.7, 1.15],
    ["chartHealth",  "#a78bfa", "rgba(167,139,250,0.12)", 0,  100],
  ];
  for (const [id, color, fill, min, max] of defs) {
    const el = document.getElementById(id);
    if (el) charts[id] = new Sparkline(el, { color, fill, min, max });
  }
}

function updateCharts(asset) {
  const map = [
    ["chartLoad",    asset.history_load],
    ["chartTemp",    asset.history_temp],
    ["chartVoltage", asset.history_voltage],
    ["chartHealth",  asset.history_health],
  ];
  for (const [id, data] of map) {
    if (charts[id] && data && data.length) charts[id].update(data);
  }
}

// ------------------------------------------------------------------ //
// Data polling                                                        //
// ------------------------------------------------------------------ //
async function refresh() {
  try {
    const [gridData, equipData, alertData] = await Promise.all([
      fetch(`${API_BASE}/api/grid`).then(r => r.json()),
      fetch(`${API_BASE}/api/equipment`).then(r => r.json()),
      fetch(`${API_BASE}/api/alerts`).then(r => r.json()),
    ]);
    allEquipment = equipData.equipment || [];
    updateKPIs(gridData);
    filterEquipment();
    updateGridViz(allEquipment);
    updateAlerts(alertData.alerts || []);
    set("tickCounter", `Tick: ${gridData.tick || "—"}`);

    // Refresh detail panel if an asset is selected
    if (selectedAssetId) {
      const asset = allEquipment.find(a => a.id === selectedAssetId);
      if (asset) renderDetail(asset);
    }
  } catch (err) {
    console.error("[NEXORA] API error:", err);
  }
}

// ------------------------------------------------------------------ //
// KPI Cards                                                           //
// ------------------------------------------------------------------ //
function updateKPIs(grid) {
  // Grid health
  const health = grid.grid_health_score || 0;
  setText("kpiHealthValue", health.toFixed(0));
  setClass("kpiHealth", healthClass(health));

  // Outage risk
  const orisk = (grid.outage_risk_score || 0) * 100;
  setText("kpiOutageValue", `${orisk.toFixed(0)}%`);
  setText("kpiOutageSub",   `${capitalize(grid.outage_risk_label || "—")} outage risk`);
  setClass("kpiOutage", riskClass(grid.outage_risk_label));

  // High-risk assets
  const hr = grid.high_risk_count || 0;
  setText("kpiHighRiskValue", hr);
  setText("kpiHighRiskSub", `${grid.critical_count || 0} critical`);
  setClass("kpiHighRisk", hr > 2 ? "kpi-card kpi-card--alert state-critical" : hr > 0 ? "kpi-card kpi-card--alert state-warning" : "kpi-card kpi-card--alert state-ok");

  // Active alerts
  const alerts = grid.active_alert_count || 0;
  setText("kpiAlertsValue", alerts);
  setText("kpiAlertsSub", `${grid.anomaly_count || 0} anomalies detected`);
  setClass("kpiAlerts", alerts > 3 ? "kpi-card state-critical" : alerts > 0 ? "kpi-card state-warning" : "kpi-card state-ok");
}

// ------------------------------------------------------------------ //
// Equipment Table                                                     //
// ------------------------------------------------------------------ //
function filterEquipment() {
  const typeFilter   = document.getElementById("filterType")?.value   || "";
  const statusFilter = document.getElementById("filterStatus")?.value || "";
  filteredEquipment = allEquipment.filter(a =>
    (!typeFilter   || a.asset_type === typeFilter) &&
    (!statusFilter || a.status === statusFilter)
  );
  renderEquipmentTable(filteredEquipment);
}

function renderEquipmentTable(equipment) {
  const tbody = document.getElementById("equipmentTableBody");
  if (!tbody) return;

  // Sort: critical first, then warning, then normal
  const order = { critical: 0, warning: 1, normal: 2 };
  const sorted = [...equipment].sort((a, b) => (order[a.status] || 2) - (order[b.status] || 2));

  tbody.innerHTML = sorted.map(a => {
    const hColor = healthColor(a.health_score);
    const rClass = `risk-${a.failure_risk_label}`;
    return `
      <tr onclick="selectAsset('${a.id}')" class="${a.id === selectedAssetId ? 'selected' : ''}">
        <td><strong>${escHtml(a.name)}</strong></td>
        <td style="text-transform:capitalize; color:var(--text-muted)">${escHtml(a.asset_type)}</td>
        <td style="color:var(--text-muted)">${escHtml(a.substation)}</td>
        <td>
          <div class="health-bar">
            <div class="health-bar__track">
              <div class="health-bar__fill" style="width:${a.health_score}%;background:${hColor}"></div>
            </div>
            <span style="font-size:0.78rem;color:${hColor};min-width:28px">${a.health_score.toFixed(0)}</span>
          </div>
        </td>
        <td><span class="risk-score ${rClass}">${(a.failure_risk_score * 100).toFixed(0)}% <span style="font-size:0.7rem">${a.failure_risk_label}</span></span></td>
        <td><span class="status-badge ${a.status}">${a.status}</span></td>
      </tr>`;
  }).join("");
}

// ------------------------------------------------------------------ //
// Grid Visualisation                                                  //
// ------------------------------------------------------------------ //
function updateGridViz(equipment) {
  const container = document.getElementById("gridViz");
  if (!container) return;

  // Group by substation
  const groups = {};
  for (const a of equipment) {
    if (!groups[a.substation]) groups[a.substation] = [];
    groups[a.substation].push(a);
  }

  const iconMap = { transformer: "🔌", feeder: "⚡", substation: "🏭" };

  container.innerHTML = Object.entries(groups).map(([sub, assets]) => `
    <div class="substation-block">
      <div class="substation-block__header">📡 ${escHtml(sub)}</div>
      <div class="substation-assets">
        ${assets.map(a => `
          <div class="asset-node status-${a.status} ${a.id === selectedAssetId ? 'selected' : ''}"
               onclick="selectAsset('${a.id}')">
            <span class="asset-node__icon">${iconMap[a.asset_type] || "⚙"}</span>
            <span class="asset-node__id">${escHtml(a.id)}</span>
            <span class="asset-node__score">${a.health_score.toFixed(0)}%</span>
          </div>
        `).join("")}
      </div>
    </div>
  `).join("");
}

// ------------------------------------------------------------------ //
// Asset Selection & Detail Panel                                      //
// ------------------------------------------------------------------ //
async function selectAsset(assetId) {
  selectedAssetId = assetId;
  document.getElementById("detailRow").style.display = "";

  // Pin the AI Advisor to this specific asset
  pinAdvisor(assetId);

  // Highlight in table and viz
  document.querySelectorAll(".equipment-table tbody tr").forEach(tr => {
    tr.classList.toggle("selected", tr.querySelector("td")?.textContent.trim() === "");
  });
  filterEquipment();   // re-render to apply selection highlight
  updateGridViz(allEquipment);

  try {
    const asset = await fetch(`${API_BASE}/api/equipment/${assetId}`).then(r => r.json());
    renderDetail(asset);
  } catch (e) {
    console.error("Detail fetch error", e);
  }
}

function renderDetail(asset) {
  set("detailTitle", `${asset.name} — ${capitalize(asset.asset_type)} · ${asset.substation}`);
  renderSensors(asset);
  updateCharts(asset);
  renderAdvisory(asset);
}

// ------------------------------------------------------------------ //
// Sensor Cards                                                        //
// ------------------------------------------------------------------ //
function renderSensors(asset) {
  const sensors = [
    { label: "Load",        value: asset.load_pct?.toFixed(1),        unit: "%",      warnAbove: 85,  critAbove: 95  },
    { label: "Temperature", value: asset.temperature_c?.toFixed(1),   unit: "°C",     warnAbove: 65,  critAbove: 82  },
    { label: "Voltage",     value: asset.voltage_pu?.toFixed(3),      unit: "pu",     warnBelow: 0.93, critBelow: 0.88 },
    { label: "Current",     value: asset.current_pu?.toFixed(3),      unit: "pu",     warnAbove: 0.90, critAbove: 1.05 },
    { label: "Vibration",   value: asset.vibration_mm_s?.toFixed(2),  unit: "mm/s",   warnAbove: 4.0,  critAbove: 7.0  },
    { label: "Oil Temp",    value: asset.oil_temp_c?.toFixed(1),      unit: "°C",     warnAbove: 80,   critAbove: 95  },
    { label: "Health",      value: asset.health_score?.toFixed(0),    unit: "/100",   warnBelow: 65,   critBelow: 45  },
    { label: "Fail Risk",   value: `${((asset.failure_risk_score||0)*100).toFixed(0)}`, unit: "%", warnAbove: 35, critAbove: 65 },
    { label: "Anomaly",     value: `${((asset.anomaly_score||0)*100).toFixed(0)}`,      unit: "%", warnAbove: 40, critAbove: 70 },
  ];

  const html = sensors.map(s => {
    const v = parseFloat(s.value);
    let cls = "sensor-ok";
    if (s.critAbove  !== undefined && v >= s.critAbove)  cls = "sensor-alert";
    else if (s.warnAbove !== undefined && v >= s.warnAbove)  cls = "sensor-warn";
    if (s.critBelow  !== undefined && v <= s.critBelow)  cls = "sensor-alert";
    else if (s.warnBelow !== undefined && v <= s.warnBelow)  cls = "sensor-warn";
    return `
      <div class="sensor-card ${cls}">
        <div class="sensor-card__label">${escHtml(s.label)}</div>
        <div class="sensor-card__value">${escHtml(s.value)}</div>
        <div class="sensor-card__unit">${escHtml(s.unit)}</div>
      </div>`;
  }).join("");

  const grid = document.getElementById("sensorGrid");
  if (grid) grid.innerHTML = html;
}

// ------------------------------------------------------------------ //
// Advisory Panel                                                      //
// ------------------------------------------------------------------ //
function renderAdvisory(asset) {
  const body = document.getElementById("advisoryBody");
  if (!body) return;

  if (!asset.advisory) {
    body.innerHTML = `<p class="advisory-empty">No advisory data available.</p>`;
    return;
  }

  const statusClass = asset.status === "critical" ? "critical"
                    : asset.status === "warning"  ? "warning"
                    : "normal";
  const statusText  = asset.status === "critical" ? "⚠ CRITICAL — Immediate Attention Required"
                    : asset.status === "warning"  ? "⚠ WARNING — Elevated Risk Detected"
                    : "✓ NORMAL — Operating Within Parameters";

  const anomalyHtml = asset.is_anomaly
    ? `<div class="advisory-section">
         <div class="advisory-section__title">Anomaly Detection</div>
         <div class="advisory-section__body" style="color:var(--accent-yellow)">
           Anomalous operating pattern detected (score ${((asset.anomaly_score||0)*100).toFixed(0)}%).
           Behaviour has deviated from normal operating baseline.
         </div>
       </div>`
    : "";

  const windowHtml = asset.risk_window_estimate
    ? `<div class="advisory-risk-window">${escHtml(asset.risk_window_estimate)}</div>`
    : "";

  body.innerHTML = `
    <div class="advisory-status-banner ${statusClass}">${statusText}</div>
    ${anomalyHtml}
    <div class="advisory-section">
      <div class="advisory-section__title">Analysis</div>
      <div class="advisory-section__body">${escHtml(asset.advisory)}</div>
    </div>
    <div class="advisory-section">
      <div class="advisory-section__title">Recommended Action</div>
      <div class="advisory-section__body" style="color:var(--accent-blue); font-weight:500">
        ▶ ${escHtml(asset.recommendation)}
      </div>
    </div>
    ${windowHtml}
    <div class="advisory-section" style="margin-top:4px">
      <div class="advisory-section__title">Risk Probabilities</div>
      <div class="advisory-section__body">
        ${renderProbBars(asset)}
      </div>
    </div>`;
}

function renderProbBars(asset) {
  if (!asset.failure_risk_score && asset.failure_risk_score !== 0) return "";
  const probs = [
    { label: "Low risk",    pct: Math.max(0, 100 - (asset.failure_risk_score * 100 * 1.4)), color: "var(--accent-green)" },
    { label: "Medium risk", pct: Math.min(100, asset.failure_risk_score * 100 * 0.8),        color: "var(--accent-yellow)" },
    { label: "High risk",   pct: Math.min(100, asset.failure_risk_score * 100 * 1.0),        color: "var(--accent-red)" },
  ];
  return probs.map(p => `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
      <span style="width:80px;font-size:0.72rem;color:var(--text-muted)">${p.label}</span>
      <div style="flex:1;height:6px;background:var(--border);border-radius:3px;overflow:hidden">
        <div style="width:${p.pct.toFixed(1)}%;height:100%;background:${p.color};border-radius:3px;transition:width .5s"></div>
      </div>
      <span style="font-size:0.72rem;color:var(--text-muted);min-width:30px">${p.pct.toFixed(0)}%</span>
    </div>`).join("");
}

// ------------------------------------------------------------------ //
// Alerts Feed                                                         //
// ------------------------------------------------------------------ //
function updateAlerts(alerts) {
  const list = document.getElementById("alertsList");
  if (!list) return;
  if (!alerts.length) {
    list.innerHTML = `<p class="advisory-empty">No active alerts.</p>`;
    return;
  }
  list.innerHTML = alerts.map(a => `
    <div class="alert-item ${a.status}">
      <span class="alert-item__asset">${escHtml(a.asset_id)}</span>
      <span class="alert-item__msg">${escHtml(a.message)}</span>
    </div>`).join("");
}

// ------------------------------------------------------------------ //
// AI Failure Advisor                                                  //
// ------------------------------------------------------------------ //

/**
 * Fetch and render the AI Advisor panel.
 * If advisorAssetId is set, fetch that specific asset.
 * Otherwise fetch the top (highest-risk) asset via /api/advisor.
 */
async function refreshAdvisor() {
  try {
    const url = advisorAssetId
      ? `${API_BASE}/api/advisor/${advisorAssetId}`
      : `${API_BASE}/api/advisor`;
    const data = await fetch(url).then(r => r.ok ? r.json() : null);
    if (!data) return;
    advisorData = data;
    renderAdvisorPanel(data);
  } catch (e) {
    console.error("[NEXORA] Advisor fetch error:", e);
  }
}

function renderAdvisorPanel(d) {
  const panel  = document.getElementById("aiAdvisorPanel");
  const header = document.getElementById("aiAdvisorHeader");
  const body   = document.getElementById("aiAdvisorBody");
  const tag    = document.getElementById("aiAdvisorAssetTag");
  if (!panel || !body) return;

  // Colour the panel border by risk level
  panel.className = `panel panel--ai-advisor adv-${d.status}`;

  // Asset tag in header
  if (tag) tag.textContent = `Showing: ${d.name}  ·  ${capitalize(d.asset_type)}  ·  ${d.substation}`;

  // ── Left column: identity + KPIs + risk window ──────────────── //
  const riskBadge = `<span class="adv-risk-badge ${d.status}">${d.status.toUpperCase()}</span>`;
  const healthColor = d.health_score >= 75 ? "risk-low"
                    : d.health_score >= 50 ? "risk-medium"
                    : "risk-critical";
  const riskColor  = d.failure_risk_label === "high"   ? "risk-high"
                   : d.failure_risk_label === "medium" ? "risk-medium"
                   : "risk-low";
  const statusColor = d.status === "critical" ? "risk-critical"
                    : d.status === "warning"  ? "risk-warning"
                    : "risk-normal";

  const windowBorderColor = d.status === "critical" ? "var(--accent-red)"
                           : d.status === "warning"  ? "var(--accent-yellow)"
                           : "var(--accent-green)";

  const leftCol = `
    <div class="adv-identity">
      <div class="adv-name">${escHtml(d.name)}</div>
      <div class="adv-meta">${escHtml(capitalize(d.asset_type))} &nbsp;·&nbsp; ${escHtml(d.substation)}</div>
      ${riskBadge}
      <div class="adv-kpi-row">
        <div class="adv-kpi">
          <div class="adv-kpi__label">Failure Risk</div>
          <div class="adv-kpi__value ${riskColor}">${d.failure_risk_pct.toFixed(0)}%</div>
        </div>
        <div class="adv-kpi">
          <div class="adv-kpi__label">Health Score</div>
          <div class="adv-kpi__value ${healthColor}">${d.health_score.toFixed(0)}/100</div>
        </div>
        ${d.is_anomaly ? `<div class="adv-kpi">
          <div class="adv-kpi__label">Anomaly</div>
          <div class="adv-kpi__value risk-high">${d.anomaly_score.toFixed(0)}%</div>
        </div>` : ""}
      </div>
      <div class="adv-window" style="border-left-color:${windowBorderColor}">
        <strong>Estimated Risk Window:</strong> ${escHtml(d.risk_window_label)}<br>
        <span style="font-size:0.72rem">(${escHtml(d.risk_window_note)})</span>
      </div>
    </div>`;

  // ── Middle column: contributing factors ──────────────────────── //
  let factorsHtml;
  if (d.factors && d.factors.length > 0) {
    factorsHtml = d.factors.map(f => `
      <li class="adv-factor-item">
        <span class="adv-factor-bullet ${escHtml(f.severity)}"></span>
        <span>${escHtml(f.description)}</span>
      </li>`).join("");
  } else {
    factorsHtml = `<li class="adv-factor-item no-factors">No elevated risk factors detected — asset operating normally.</li>`;
  }

  const midCol = `
    <div class="adv-factors">
      <div class="adv-section-label">Why the risk is elevated</div>
      <ul class="adv-factor-list">${factorsHtml}</ul>
      ${d.is_anomaly ? `<div style="margin-top:6px;font-size:0.75rem;color:var(--accent-yellow)">
        ⚠ Anomaly detected: operating pattern deviates from normal baseline (score ${d.anomaly_score.toFixed(0)}%).
      </div>` : ""}
    </div>`;

  // ── Right column: recommendations + mini sparklines ──────────── //
  let recsHtml = "";
  if (d.recommendations && d.recommendations.length > 0) {
    recsHtml = d.recommendations.map((r, i) => `
      <li class="adv-rec-item">
        <span class="adv-rec-num">${i + 1}</span>
        <span>${escHtml(r)}</span>
      </li>`).join("");
  } else {
    recsHtml = `<li class="adv-rec-item" style="color:var(--text-muted);font-style:italic">
      No specific actions required — continue normal monitoring.
    </li>`;
  }

  const rightCol = `
    <div class="adv-right">
      <div>
        <div class="adv-section-label">Recommended Actions</div>
        <ul class="adv-rec-list">${recsHtml}</ul>
      </div>
      <div>
        <div class="adv-section-label">Recent Trends</div>
        <div class="adv-trends">
          <div class="adv-trend-block">
            <div class="adv-trend-title">Health Score</div>
            <canvas id="advChartHealth" height="52"></canvas>
          </div>
          <div class="adv-trend-block">
            <div class="adv-trend-title">Failure Risk %</div>
            <canvas id="advChartRisk" height="52"></canvas>
          </div>
          <div class="adv-trend-block">
            <div class="adv-trend-title">Temperature (°C)</div>
            <canvas id="advChartTemp" height="52"></canvas>
          </div>
          <div class="adv-trend-block">
            <div class="adv-trend-title">Load %</div>
            <canvas id="advChartLoad" height="52"></canvas>
          </div>
        </div>
      </div>
    </div>`;

  // Replacing innerHTML destroys canvas elements — clear cached Sparkline instances first
  delete advCharts["advChartHealth"];
  delete advCharts["advChartRisk"];
  delete advCharts["advChartTemp"];
  delete advCharts["advChartLoad"];

  body.innerHTML = leftCol + midCol + rightCol;

  // Initialise new sparklines after canvas elements are in the DOM
  _updateAdvChart("advChartHealth", d.history_health, "#a78bfa", "rgba(167,139,250,0.15)", 0, 100);
  _updateAdvChart("advChartRisk",   d.history_risk,   "#ef4444", "rgba(239,68,68,0.15)",   0, 100);
  _updateAdvChart("advChartTemp",   d.history_temp,   "#f97316", "rgba(249,115,22,0.15)",  20, 120);
  _updateAdvChart("advChartLoad",   d.history_load,   "#3b82f6", "rgba(59,130,246,0.15)",  0, 120);
}

function _updateAdvChart(id, data, color, fill, min, max) {
  if (!data || !data.length) return;
  const el = document.getElementById(id);
  if (!el) return;
  if (!advCharts[id]) {
    advCharts[id] = new Sparkline(el, { color, fill, min, max });
  }
  advCharts[id].update(data);
}

// When operator clicks an equipment row/node, also pin the advisor to that asset
function pinAdvisor(assetId) {
  advisorAssetId = assetId;
  // Immediately refresh the advisor for the selected asset
  refreshAdvisor();
}

// ------------------------------------------------------------------ //
// Scenario Controls                                                   //
// ------------------------------------------------------------------ //
async function startScenario() {
  try {
    await fetch(`${API_BASE}/api/scenario/start`, { method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ asset_ids: ["T-201", "F-201"] })
    });
    scenarioActive = true;
    document.getElementById("btnStartScenario").style.display = "none";
    document.getElementById("btnStopScenario").style.display  = "";
    setText("scenarioStatus", "⚡ Degrading conditions active on T-201 and F-201 — watch the dashboard");
  } catch (e) { console.error(e); }
}

async function stopScenario() {
  try {
    await fetch(`${API_BASE}/api/scenario/stop`, { method: "POST" });
    scenarioActive = false;
    document.getElementById("btnStartScenario").style.display = "";
    document.getElementById("btnStopScenario").style.display  = "none";
    setText("scenarioStatus", "Conditions reset to normal.");
    setTimeout(() => setText("scenarioStatus", ""), 4000);
  } catch (e) { console.error(e); }
}

// ------------------------------------------------------------------ //
// Helpers                                                             //
// ------------------------------------------------------------------ //
function set(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
function setClass(id, cls) {
  const el = document.getElementById(id);
  if (el) el.className = cls;
}
function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
function escHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;");
}

function healthColor(score) {
  if (score >= 75) return "var(--accent-green)";
  if (score >= 50) return "var(--accent-yellow)";
  return "var(--accent-red)";
}
function healthClass(score) {
  if (score >= 75) return "kpi-card kpi-card--health state-ok";
  if (score >= 55) return "kpi-card kpi-card--health state-warning";
  return "kpi-card kpi-card--health state-critical";
}
function riskClass(label) {
  if (!label || label === "low") return "kpi-card kpi-card--risk state-ok";
  if (label === "elevated" || label === "medium") return "kpi-card kpi-card--risk state-warning";
  return "kpi-card kpi-card--risk state-critical";
}
