import React, { useState } from "react";
import { User, Bell, Building, Sliders, Lock } from "lucide-react";

const C = {
  bg: "#F5F8FC", surface: "#FFFFFF", border: "#E2E8F0",
  text: "#0F172A", muted: "#64748B", primary: "#2563EB",
  success: "#22C55E", warning: "#F59E0B", danger: "#EF4444",
  cardShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)",
};

const SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "alerts", label: "Alert Preferences", icon: Sliders },
  { id: "security", label: "Security", icon: Lock },
  { id: "organization", label: "Organization", icon: Building },
];

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: on ? C.primary : C.border,
        border: "none", cursor: "pointer", position: "relative",
        transition: "background 0.2s", flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute", top: 3, left: on ? 23 : 3,
        width: 18, height: 18, borderRadius: "50%", background: "#fff",
        transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, type = "text", placeholder }: { value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%", height: 40, border: `1px solid ${C.border}`, borderRadius: 8,
        padding: "0 12px", fontSize: 14, color: C.text, background: C.surface,
        outline: "none", boxSizing: "border-box", transition: "border-color 0.15s",
      }}
      onFocus={e => (e.target.style.borderColor = C.primary)}
      onBlur={e => (e.target.style.borderColor = C.border)}
    />
  );
}

function SaveButton({ onClick }: { onClick: () => void }) {
  const [saved, setSaved] = useState(false);
  function handleClick() {
    onClick();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }
  return (
    <button
      onClick={handleClick}
      style={{
        background: saved ? C.success : C.primary, color: "#fff",
        border: "none", borderRadius: 8, padding: "10px 24px",
        fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "background 0.2s",
      }}
    >
      {saved ? "✓ Saved!" : "Save Changes"}
    </button>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");

  // Profile state
  const [name, setName] = useState("Aarav Mehta");
  const [email, setEmail] = useState("admin@nexora.com");
  const [phone, setPhone] = useState("+1 (555) 123-4567");
  const [jobTitle, setJobTitle] = useState("Utility Manager");

  // Notification toggles
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [pushNotif, setPushNotif] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  // Alert preferences
  const [criticalAlert, setCriticalAlert] = useState(true);
  const [warningAlert, setWarningAlert] = useState(true);
  const [predictiveAlert, setPredictiveAlert] = useState(true);
  const [maintenanceAlert, setMaintenanceAlert] = useState(false);

  return (
    <div style={{ padding: "28px 32px", background: C.bg, minHeight: "100vh" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text, margin: 0 }}>Settings</h1>
        <p style={{ fontSize: 14, color: C.muted, margin: "4px 0 0" }}>Manage your account and preferences</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24, alignItems: "start" }}>
        {/* Left nav */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 12, boxShadow: C.cardShadow, overflow: "hidden",
        }}>
          {SECTIONS.map(s => {
            const Icon = s.icon;
            const active = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                style={{
                  width: "100%", background: active ? "rgba(37,99,235,0.06)" : "transparent",
                  border: "none", borderLeft: active ? `3px solid ${C.primary}` : "3px solid transparent",
                  cursor: "pointer", padding: "13px 16px",
                  display: "flex", alignItems: "center", gap: 10,
                  color: active ? C.primary : C.muted,
                  fontSize: 14, fontWeight: active ? 600 : 400,
                  transition: "all 0.15s", textAlign: "left",
                }}
              >
                <Icon size={16} />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 12, boxShadow: C.cardShadow, padding: 28,
        }}>
          {/* PROFILE */}
          {activeSection === "profile" && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 4 }}>Profile</h2>
              <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Update your personal information</p>
              {/* Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 24, fontWeight: 700,
                }}>
                  AM
                </div>
                <div>
                  <button style={{
                    background: C.primary, color: "#fff", border: "none",
                    borderRadius: 7, padding: "7px 16px", fontSize: 13, fontWeight: 600,
                    cursor: "pointer", marginBottom: 6, display: "block",
                    transition: "background 0.15s",
                  }}>Change Avatar</button>
                  <div style={{ fontSize: 12, color: C.muted }}>JPG, PNG or SVG. Max 2MB.</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <FieldGroup label="Full Name"><Input value={name} onChange={setName} /></FieldGroup>
                <FieldGroup label="Email Address"><Input value={email} onChange={setEmail} type="email" /></FieldGroup>
                <FieldGroup label="Phone Number"><Input value={phone} onChange={setPhone} /></FieldGroup>
                <FieldGroup label="Job Title"><Input value={jobTitle} onChange={setJobTitle} /></FieldGroup>
              </div>
              <FieldGroup label="Role">
                <input value="Admin" readOnly style={{ width: "100%", height: 40, border: `1px solid ${C.border}`, borderRadius: 8, padding: "0 12px", fontSize: 14, color: C.muted, background: C.bg, outline: "none", boxSizing: "border-box" }} />
              </FieldGroup>
              <SaveButton onClick={() => {}} />
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeSection === "notifications" && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 4 }}>Notifications</h2>
              <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Configure how you receive notifications</p>
              {[
                { label: "Email Notifications", desc: "Receive alerts and updates via email", val: emailNotif, set: setEmailNotif },
                { label: "SMS Notifications", desc: "Receive critical alerts via SMS", val: smsNotif, set: setSmsNotif },
                { label: "Push Notifications", desc: "Browser push notifications for live alerts", val: pushNotif, set: setPushNotif },
                { label: "Weekly Digest", desc: "Weekly summary of grid health and predictions", val: weeklyDigest, set: setWeeklyDigest },
              ].map(item => (
                <div key={item.label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "16px 0", borderBottom: `1px solid ${C.border}`,
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{item.label}</div>
                    <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{item.desc}</div>
                  </div>
                  <Toggle on={item.val} onChange={item.set} />
                </div>
              ))}
              <div style={{ marginTop: 24 }}>
                <SaveButton onClick={() => {}} />
              </div>
            </div>
          )}

          {/* ALERT PREFERENCES */}
          {activeSection === "alerts" && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 4 }}>Alert Preferences</h2>
              <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Choose which alerts you want to receive</p>
              {[
                { label: "Critical Alerts", desc: "Immediate notification for critical equipment failures", val: criticalAlert, set: setCriticalAlert, color: C.danger },
                { label: "Warning Alerts", desc: "Notification for warning-level anomalies", val: warningAlert, set: setWarningAlert, color: C.warning },
                { label: "Predictive Alerts", desc: "AI-generated failure predictions (3–30 days out)", val: predictiveAlert, set: setPredictiveAlert, color: C.primary },
                { label: "Maintenance Reminders", desc: "Scheduled maintenance notifications", val: maintenanceAlert, set: setMaintenanceAlert, color: C.success },
              ].map(item => (
                <div key={item.label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "16px 0", borderBottom: `1px solid ${C.border}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{item.label}</div>
                      <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{item.desc}</div>
                    </div>
                  </div>
                  <Toggle on={item.val} onChange={item.set} />
                </div>
              ))}
              <div style={{ marginTop: 24 }}>
                <SaveButton onClick={() => {}} />
              </div>
            </div>
          )}

          {/* SECURITY */}
          {activeSection === "security" && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 4 }}>Security</h2>
              <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Manage your password and security settings</p>
              <FieldGroup label="Current Password"><Input value="" onChange={() => {}} type="password" placeholder="Enter current password" /></FieldGroup>
              <FieldGroup label="New Password"><Input value="" onChange={() => {}} type="password" placeholder="Enter new password" /></FieldGroup>
              <FieldGroup label="Confirm New Password"><Input value="" onChange={() => {}} type="password" placeholder="Confirm new password" /></FieldGroup>
              <div style={{
                background: "rgba(37,99,235,0.06)", border: `1px solid rgba(37,99,235,0.15)`,
                borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: C.primary,
              }}>
                Password must be at least 8 characters with uppercase, lowercase, and a number.
              </div>
              <SaveButton onClick={() => {}} />
            </div>
          )}

          {/* ORGANIZATION */}
          {activeSection === "organization" && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 4 }}>Organization</h2>
              <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Your organization and account details</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <FieldGroup label="Organization Name"><Input value="Texas Grid Authority" onChange={() => {}} /></FieldGroup>
                <FieldGroup label="Region"><Input value="Texas, USA" onChange={() => {}} /></FieldGroup>
                <FieldGroup label="NEXORA Account ID"><Input value="NGT-2025-001" onChange={() => {}} /></FieldGroup>
                <FieldGroup label="Plan"><Input value="Enterprise" onChange={() => {}} /></FieldGroup>
              </div>
              <div style={{
                background: "rgba(34,197,94,0.06)", border: `1px solid rgba(34,197,94,0.2)`,
                borderRadius: 8, padding: "12px 16px", fontSize: 13, color: C.success, marginBottom: 20,
              }}>
                ✓ Account is active. Next billing cycle: October 1, 2025.
              </div>
              <SaveButton onClick={() => {}} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
