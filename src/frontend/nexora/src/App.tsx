import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { CommandCenterPage } from "./pages/CommandCenter";
import { GridMapPage } from "./pages/GridMap";
import { AssetIntelligencePage } from "./pages/AssetIntelligence";
import { AssetDetailPage } from "./pages/AssetDetail";
import { OutagePredictionPage } from "./pages/OutagePrediction";
import { WeatherIntelligencePage } from "./pages/WeatherIntelligence";
import { FailureAdvisorPage } from "./pages/FailureAdvisor";
import { MaintenancePlannerPage } from "./pages/MaintenancePlanner";
import { AlertsIncidentsPage } from "./pages/AlertsIncidents";
import { AnalyticsPage } from "./pages/Analytics";
import { fetchAlerts } from "./api/client";

function App() {
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    const loadAlerts = () =>
      fetchAlerts({ status: "active" }).then(d => setAlertCount((d.alerts ?? []).filter((a: { type: string }) => a.type !== "live_sensor").length)).catch(() => {});
    loadAlerts();
    const t = setInterval(loadAlerts, 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <BrowserRouter>
      <div style={{ display: "flex", minHeight: "100vh", background: "#030712", color: "#f3f4f6" }}>
        <Sidebar alertCount={alertCount} />
        <main style={{ flex: 1, padding: "24px 28px", overflowY: "auto", maxWidth: "calc(100vw - 220px)" }}>
          <Routes>
            <Route path="/"              element={<CommandCenterPage />} />
            <Route path="/grid-map"      element={<GridMapPage />} />
            <Route path="/assets"        element={<AssetIntelligencePage />} />
            <Route path="/assets/:id"    element={<AssetDetailPage />} />
            <Route path="/predictions"   element={<OutagePredictionPage />} />
            <Route path="/weather"       element={<WeatherIntelligencePage />} />
            <Route path="/advisor"       element={<FailureAdvisorPage />} />
            <Route path="/maintenance"   element={<MaintenancePlannerPage />} />
            <Route path="/alerts"        element={<AlertsIncidentsPage />} />
            <Route path="/analytics"     element={<AnalyticsPage />} />
            <Route path="*"              element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
