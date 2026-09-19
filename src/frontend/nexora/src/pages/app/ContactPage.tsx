import React, { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const C = {
  bg: "#F5F8FC", surface: "#FFFFFF", border: "#E2E8F0",
  text: "#0F172A", muted: "#64748B", primary: "#2563EB",
  success: "#22C55E",
  cardShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", border: `1px solid ${C.border}`, borderRadius: 8,
  padding: "10px 12px", fontSize: 14, color: C.text, background: C.surface,
  outline: "none", boxSizing: "border-box", transition: "border-color 0.15s",
  fontFamily: "inherit",
};

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setName(""); setEmail(""); setSubject(""); setMessage("");
  }

  return (
    <div style={{ padding: "48px 32px", background: C.bg, minHeight: "100vh", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: C.text, margin: "0 0 12px" }}>Contact Us</h1>
        <p style={{ fontSize: 16, color: C.muted, maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
          Have a question or need support? Our team is ready to help.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 32, alignItems: "start" }}>
        {/* Contact info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { icon: <Mail size={20} color={C.primary} />, label: "Email", value: "support@nexora.ai", sub: "We reply within 24 hours" },
            { icon: <Phone size={20} color={C.primary} />, label: "Phone", value: "+1 (800) NEXORA-1", sub: "Mon–Fri, 8 AM–6 PM CT" },
            { icon: <MapPin size={20} color={C.primary} />, label: "Office", value: "Houston, Texas", sub: "Energy Corridor, TX 77079" },
          ].map(item => (
            <div key={item.label} style={{
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
              padding: "20px 20px", display: "flex", gap: 14, alignItems: "flex-start",
              boxShadow: C.cardShadow,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: "rgba(37,99,235,0.08)", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginTop: 2 }}>{item.value}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{item.sub}</div>
              </div>
            </div>
          ))}

          {/* Social links */}
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
            padding: "20px 20px", boxShadow: C.cardShadow,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 14 }}>Follow Us</div>
            <div style={{ display: "flex", gap: 10 }}>
              {["LinkedIn", "Twitter", "GitHub"].map(s => (
                <a key={s} href="#" style={{
                  background: "rgba(37,99,235,0.08)", color: C.primary,
                  borderRadius: 7, padding: "6px 14px", fontSize: 12, fontWeight: 600,
                  textDecoration: "none", transition: "background 0.15s",
                }}>
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
          padding: 32, boxShadow: C.cardShadow,
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 4 }}>Send a Message</h2>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>We'll get back to you as soon as possible</p>

          {sent && (
            <div style={{
              background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
              borderRadius: 8, padding: "12px 16px", marginBottom: 20,
              fontSize: 14, color: C.success, fontWeight: 600,
            }}>
              ✓ Message sent! We'll respond within 24 hours.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Full Name">
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
                  style={inputStyle} required
                  onFocus={e => (e.target.style.borderColor = C.primary)}
                  onBlur={e => (e.target.style.borderColor = C.border)} />
              </Field>
              <Field label="Email Address">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                  style={inputStyle} required
                  onFocus={e => (e.target.style.borderColor = C.primary)}
                  onBlur={e => (e.target.style.borderColor = C.border)} />
              </Field>
            </div>
            <Field label="Subject">
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="How can we help?"
                style={inputStyle} required
                onFocus={e => (e.target.style.borderColor = C.primary)}
                onBlur={e => (e.target.style.borderColor = C.border)} />
            </Field>
            <Field label="Message">
              <textarea
                value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Tell us more about your question or request..."
                rows={5}
                style={{ ...inputStyle, height: "auto", resize: "vertical" }}
                required
                onFocus={e => (e.target.style.borderColor = C.primary)}
                onBlur={e => (e.target.style.borderColor = C.border)}
              />
            </Field>
            <button type="submit" style={{
              width: "100%", height: 44, background: C.primary, color: "#fff",
              border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "background 0.15s",
            }}
              onMouseEnter={e => (e.currentTarget.style.background = "#1d4ed8")}
              onMouseLeave={e => (e.currentTarget.style.background = C.primary)}
            >
              <Send size={16} /> Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
