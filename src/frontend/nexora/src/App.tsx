import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { Sidebar } from "./components/Sidebar";
import { AuthProvider, useAuth } from "./auth/AuthContext";
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
import Login from "./pages/Login";
// User portal pages
import UserDashboard from "./pages/user/UserDashboard";
import UserTransformerView from "./pages/user/UserTransformerView";
import ComplaintForm from "./pages/user/ComplaintForm";
import MyComplaints from "./pages/user/MyComplaints";
import ComplaintDetail from "./pages/user/ComplaintDetail";
import UserNotifications from "./pages/user/UserNotifications";
// Admin pages
import ComplaintManagement from "./pages/admin/ComplaintManagement";
import IncidentResponse from "./pages/admin/IncidentResponse";
import CrewManagement from "./pages/admin/CrewManagement";
import AuditLog from "./pages/admin/AuditLog";
// New enterprise UI pages
import LandingPage from "./pages/landing/LandingPage";
import AppLayout from "./pages/app/AppLayout";
import Dashboard from "./pages/app/Dashboard";
import EquipmentPage from "./pages/app/EquipmentPage";
import PredictionDetails from "./pages/app/PredictionDetails";
import AlertsPage from "./pages/app/AlertsPage";
import ReportsPage from "./pages/app/ReportsPage";
import MapsPage from "./pages/app/MapsPage";
import SettingsPage from "./pages/app/SettingsPage";
import HowItWorksPage from "./pages/app/HowItWorksPage";
import AboutPage from "./pages/app/AboutPage";
import ContactPage from "./pages/app/ContactPage";
import AIRecommendationsPage from "./pages/app/AIRecommendationsPage";
import { fetchAlerts } from "./api/client";

/* ============================================================
   NEXORA Background — cinematic dark navy ambient system
   ============================================================ */
function NexoraBackground() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden",
    }}>
      {/* Base gradient */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(160deg, #020c1b 0%, #030b18 40%, #040d1c 70%, #030912 100%)",
      }} />

      {/* Top-left ambient radial (warm cyan) */}
      <div style={{
        position: "absolute", top: "-15%", left: "-10%",
        width: "55%", height: "55%",
        background: "radial-gradient(ellipse, rgba(56,189,248,0.06) 0%, transparent 65%)",
      }} />

      {/* Top-right ambient radial (violet) */}
      <div style={{
        position: "absolute", top: "-10%", right: "-5%",
        width: "45%", height: "50%",
        background: "radial-gradient(ellipse, rgba(129,140,248,0.05) 0%, transparent 65%)",
      }} />

      {/* Bottom ambient orange warmth (landscape horizon feel) */}
      <div style={{
        position: "absolute", bottom: "-5%", left: "20%",
        width: "60%", height: "35%",
        background: "radial-gradient(ellipse, rgba(251,146,60,0.04) 0%, transparent 70%)",
      }} />

      {/* Mountain silhouette SVG at the bottom */}
      <svg
        style={{ position: "absolute", bottom: 0, left: 0, width: "100%", opacity: 0.06 }}
        viewBox="0 0 1440 220" preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,200 L0,160 L80,130 L160,155 L240,90 L320,120 L400,60 L480,100 L560,40 L640,80 L720,20 L800,70 L880,50 L960,90 L1040,45 L1120,85 L1200,55 L1280,95 L1360,130 L1440,110 L1440,220 Z"
          fill="#38bdf8"
        />
        <path
          d="M0,200 L0,180 L120,155 L200,170 L280,140 L360,160 L440,120 L520,145 L600,110 L680,130 L760,100 L840,125 L920,105 L1000,130 L1080,115 L1160,140 L1240,125 L1320,155 L1440,145 L1440,220 Z"
          fill="#818cf8"
          opacity="0.5"
        />
      </svg>

      {/* Subtle grid dots */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.025 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="0.8" fill="#38bdf8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Energy flow lines */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="lineGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <line x1="0" y1="35%" x2="100%" y2="35%" stroke="url(#lineGrad1)" strokeWidth="0.5" />
        <line x1="0" y1="65%" x2="100%" y2="65%" stroke="url(#lineGrad2)" strokeWidth="0.5" />
        <line x1="30%" y1="0" x2="70%" y2="100%" stroke="url(#lineGrad1)" strokeWidth="0.4" />
      </svg>
    </div>
  );
}

/* ============================================================
   ProtectedRoute — redirects to /login if not authenticated
   adminOnly — redirects users to /user if they are not admin
   ============================================================ */
function ProtectedRoute({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/user" replace />;
  return <>{children}</>;
}

/* ============================================================
   AppShell — layout with old dark sidebar + main content
   (used for the existing admin dark-theme pages under /admin/*)
   ============================================================ */
function AppShell({ alertCount }: { alertCount: number }) {
  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      color: "#e2e8f0",
      position: "relative", zIndex: 1,
    }}>
      <Sidebar alertCount={alertCount} />
      <main style={{
        flex: 1,
        padding: "28px 32px",
        overflowY: "auto",
        minWidth: 0,
        background: "rgba(3,11,24,0.4)",
      }}>
        <Routes>
          {/* ── Legacy admin dark-theme routes ───────────────────────── */}
          <Route path="/admin/command"    element={<ProtectedRoute adminOnly><CommandCenterPage /></ProtectedRoute>} />
          <Route path="/admin/grid-map"   element={<ProtectedRoute adminOnly><GridMapPage /></ProtectedRoute>} />
          <Route path="/admin/assets"     element={<ProtectedRoute adminOnly><AssetIntelligencePage /></ProtectedRoute>} />
          <Route path="/admin/assets/:id" element={<ProtectedRoute adminOnly><AssetDetailPage /></ProtectedRoute>} />
          <Route path="/admin/predictions" element={<ProtectedRoute><OutagePredictionPage /></ProtectedRoute>} />
          <Route path="/admin/weather"    element={<ProtectedRoute adminOnly><WeatherIntelligencePage /></ProtectedRoute>} />
          <Route path="/admin/advisor"    element={<ProtectedRoute adminOnly><FailureAdvisorPage /></ProtectedRoute>} />
          <Route path="/admin/maintenance" element={<ProtectedRoute adminOnly><MaintenancePlannerPage /></ProtectedRoute>} />
          <Route path="/admin/alerts"     element={<ProtectedRoute adminOnly><AlertsIncidentsPage /></ProtectedRoute>} />
          <Route path="/admin/analytics"  element={<ProtectedRoute adminOnly><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/admin/incidents"  element={<ProtectedRoute adminOnly><IncidentResponse /></ProtectedRoute>} />
          <Route path="/admin/complaints" element={<ProtectedRoute adminOnly><ComplaintManagement /></ProtectedRoute>} />
          <Route path="/admin/crews"      element={<ProtectedRoute adminOnly><CrewManagement /></ProtectedRoute>} />
          <Route path="/admin/audit"      element={<ProtectedRoute adminOnly><AuditLog /></ProtectedRoute>} />

          {/* ── User portal routes ───────────────────────────────────── */}
          <Route path="/user"                      element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/user/transformer"           element={<ProtectedRoute><UserTransformerView /></ProtectedRoute>} />
          <Route path="/user/complaints"            element={<ProtectedRoute><MyComplaints /></ProtectedRoute>} />
          <Route path="/user/complaints/new"        element={<ProtectedRoute><ComplaintForm /></ProtectedRoute>} />
          <Route path="/user/complaints/:id"        element={<ProtectedRoute><ComplaintDetail /></ProtectedRoute>} />
          <Route path="/user/notifications"         element={<ProtectedRoute><UserNotifications /></ProtectedRoute>} />

          <Route path="*" element={<AuthFallback />} />
        </Routes>
      </main>
    </div>
  );
}

function AuthFallback() {
  const { user } = useAuth();
  return <Navigate to={user?.role === "admin" ? "/dashboard" : "/user"} replace />;
}

/* ============================================================
   App root
   ============================================================ */
function AppInner() {
  const [alertCount, setAlertCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role !== "admin") return;
    const loadAlerts = () =>
      fetchAlerts({ status: "active" })
        .then(d => setAlertCount((d.alerts ?? []).filter((a: { type: string }) => a.type !== "live_sensor").length))
        .catch(() => {});
    loadAlerts();
    const t = setInterval(loadAlerts, 30000);
    return () => clearInterval(t);
  }, [user]);

  return (
    <Routes>
      {/* ── Public routes ─────────────────────────────────────────────── */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/how-it-works" element={<AppLayout><HowItWorksPage /></AppLayout>} />
      <Route path="/about" element={<AppLayout><AboutPage /></AppLayout>} />
      <Route path="/contact" element={<AppLayout><ContactPage /></AppLayout>} />

      {/* ── New enterprise dashboard routes (protected) ───────────────── */}
      <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/equipment" element={<ProtectedRoute><AppLayout><EquipmentPage /></AppLayout></ProtectedRoute>} />
      <Route path="/equipment/:id" element={<ProtectedRoute><AppLayout><PredictionDetails /></AppLayout></ProtectedRoute>} />
      <Route path="/predictions-view" element={<ProtectedRoute><AppLayout><PredictionDetails /></AppLayout></ProtectedRoute>} />
      <Route path="/alerts-view" element={<ProtectedRoute><AppLayout><AlertsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><AppLayout><ReportsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/maps" element={<ProtectedRoute><AppLayout><MapsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/settings-view" element={<ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/ai-recommendations" element={<ProtectedRoute><AppLayout><AIRecommendationsPage /></AppLayout></ProtectedRoute>} />

      {/* ── Dark-theme admin shell (legacy pages at /admin/*) ─────────── */}
      <Route path="*" element={
        <>
          <NexoraBackground />
          <AppShell alertCount={alertCount} />
        </>
      } />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
