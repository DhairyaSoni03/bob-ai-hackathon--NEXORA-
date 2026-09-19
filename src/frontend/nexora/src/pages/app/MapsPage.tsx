import { useState } from "react";

const C = {
  bg: "#F5F8FC", surface: "#FFFFFF", border: "#E2E8F0",
  text: "#0F172A", muted: "#64748B", primary: "#2563EB",
  success: "#22C55E", warning: "#F59E0B", danger: "#EF4444",
  cardShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)",
};

const EQUIPMENT_MARKERS = [
  { id: "T-104", x: 200, y: 160, type: "Transformer", status: "Critical", location: "Substation A" },
  { id: "CB-23", x: 320, y: 120, type: "Circuit Breaker", status: "Warning", location: "North Grid" },
  { id: "T-87", x: 420, y: 200, type: "Transformer", status: "Warning", location: "East Zone" },
  { id: "G-12", x: 150, y: 280, type: "Generator", status: "Healthy", location: "West Plant" },
  { id: "CB-56", x: 500, y: 300, type: "Circuit Breaker", status: "Healthy", location: "South Grid" },
  { id: "T-91", x: 350, y: 260, type: "Transformer", status: "Healthy", location: "Central Hub" },
  { id: "F-14", x: 450, y: 150, type: "Feeder", status: "Warning", location: "Industrial Sector" },
  { id: "S-07", x: 280, y: 330, type: "Substation", status: "Healthy", location: "Midtown" },
  { id: "CB-44", x: 100, y: 200, type: "Circuit Breaker", status: "Critical", location: "West Grid" },
  { id: "G-05", x: 380, y: 360, type: "Generator", status: "Healthy", location: "North Plant" },
];

const STATUS_COLORS: Record<string, string> = {
  Critical: C.danger, Warning: C.warning, Healthy: C.success,
};

const FILTER_TABS = ["All", "Healthy", "Warning", "Critical"];

function getMarkerShape(type: string, x: number, y: number, color: string, selected: boolean) {
  const size = selected ? 14 : 10;
  const glowColor = color + "55";
  if (type === "Transformer") {
    return (
      <g>
        {selected && <circle cx={x} cy={y} r={size + 6} fill={glowColor} opacity={0.5} />}
        <rect x={x - size / 2} y={y - size / 2} width={size} height={size} fill={color} rx="2" stroke="#fff" strokeWidth={selected ? 2 : 1.5} />
        <text x={x} y={y + 0.5} textAnchor="middle" dominantBaseline="middle" fontSize="5" fontWeight="700" fill="#fff">T</text>
      </g>
    );
  }
  if (type === "Generator") {
    const pts = `${x},${y - size} ${x + size * 0.87},${y + size * 0.5} ${x - size * 0.87},${y + size * 0.5}`;
    return (
      <g>
        {selected && <circle cx={x} cy={y} r={size + 6} fill={glowColor} opacity={0.5} />}
        <polygon points={pts} fill={color} stroke="#fff" strokeWidth={selected ? 2 : 1.5} />
        <text x={x} y={y + 2} textAnchor="middle" dominantBaseline="middle" fontSize="5" fontWeight="700" fill="#fff">G</text>
      </g>
    );
  }
  // Default circle
  return (
    <g>
      {selected && <circle cx={x} cy={y} r={size + 6} fill={glowColor} opacity={0.5} />}
      <circle cx={x} cy={y} r={size / 2 + 3} fill={color} stroke="#fff" strokeWidth={selected ? 2 : 1.5} />
      <text x={x} y={y + 0.5} textAnchor="middle" dominantBaseline="middle" fontSize="5" fontWeight="700" fill="#fff">
        {type[0]}
      </text>
    </g>
  );
}

export default function MapsPage() {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<string | null>(null);

  const visible = EQUIPMENT_MARKERS.filter(m => filter === "All" || m.status === filter);
  const selectedItem = EQUIPMENT_MARKERS.find(m => m.id === selected);

  return (
    <div style={{ padding: "28px 32px", background: C.bg, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text, margin: 0 }}>Maps</h1>
          <p style={{ fontSize: 14, color: C.muted, margin: "4px 0 0" }}>Geographic distribution of grid equipment</p>
        </div>
        <div style={{ display: "flex", gap: 4, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 4 }}>
          {FILTER_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: "7px 16px", borderRadius: 7, fontSize: 13, fontWeight: filter === tab ? 600 : 400,
                background: filter === tab ? C.primary : "transparent",
                color: filter === tab ? "#fff" : C.muted,
                border: "none", cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        {[{ label: "Total", val: EQUIPMENT_MARKERS.length, color: C.primary },
          { label: "Healthy", val: EQUIPMENT_MARKERS.filter(m => m.status === "Healthy").length, color: C.success },
          { label: "Warning", val: EQUIPMENT_MARKERS.filter(m => m.status === "Warning").length, color: C.warning },
          { label: "Critical", val: EQUIPMENT_MARKERS.filter(m => m.status === "Critical").length, color: C.danger },
        ].map(s => (
          <div key={s.label} style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
            padding: "10px 16px", display: "flex", alignItems: "center", gap: 8,
            boxShadow: C.cardShadow,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: C.muted }}>{s.label}</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{s.val}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, alignItems: "start" }}>
        {/* Map */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 12, boxShadow: C.cardShadow, overflow: "hidden",
        }}>
          <svg
            viewBox="0 0 680 460"
            style={{ width: "100%", cursor: "crosshair" }}
            onClick={() => setSelected(null)}
          >
            {/* Background */}
            <rect width="680" height="460" fill="#EEF2F8" />

            {/* Grid lines */}
            {[80, 160, 240, 320, 400, 480, 560, 640].map(x => (
              <line key={`vl${x}`} x1={x} y1="0" x2={x} y2="460" stroke="#dde4ef" strokeWidth="0.8" />
            ))}
            {[60, 120, 180, 240, 300, 360, 420].map(y => (
              <line key={`hl${y}`} x1="0" y1={y} x2="680" y2={y} stroke="#dde4ef" strokeWidth="0.8" />
            ))}

            {/* Texas outline */}
            <path
              d="M 60,40 L 580,40 L 600,120 L 580,360 L 520,400 L 460,420 L 140,420 L 80,360 L 50,240 Z"
              fill="#dbe8f5" stroke="#b0c4de" strokeWidth="1.5" fillOpacity="0.6"
            />

            {/* Region labels */}
            <text x="120" y="100" fontSize="10" fill="#94a3b8" fontStyle="italic">West Texas</text>
            <text x="300" y="80" fontSize="10" fill="#94a3b8" fontStyle="italic">North Texas</text>
            <text x="460" y="120" fontSize="10" fill="#94a3b8" fontStyle="italic">East Texas</text>
            <text x="180" y="350" fontSize="10" fill="#94a3b8" fontStyle="italic">South Texas</text>
            <text x="290" y="230" fontSize="10" fill="#94a3b8" fontStyle="italic">Central Texas</text>

            {/* Grid connections */}
            {[
              [200, 160, 320, 120], [320, 120, 420, 200], [420, 200, 500, 300],
              [200, 160, 150, 280], [150, 280, 280, 330], [280, 330, 350, 260],
              [350, 260, 420, 200], [350, 260, 380, 360], [320, 120, 450, 150],
              [100, 200, 150, 280], [100, 200, 200, 160],
            ].map(([x1, y1, x2, y2], i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="6 4" opacity="0.6" />
            ))}

            {/* Markers */}
            {visible.map(m => (
              <g
                key={m.id}
                onClick={e => { e.stopPropagation(); setSelected(m.id === selected ? null : m.id); }}
                style={{ cursor: "pointer" }}
              >
                {getMarkerShape(m.type, m.x, m.y, STATUS_COLORS[m.status], selected === m.id)}
              </g>
            ))}

            {/* Popup for selected */}
            {selectedItem && (() => {
              const m = selectedItem;
              const px = m.x + 16;
              const py = Math.max(10, m.y - 40);
              return (
                <g>
                  <rect x={px} y={py} width={160} height={70} rx="8"
                    fill="white" stroke={C.border} strokeWidth="1" filter="drop-shadow(0 2px 8px rgba(0,0,0,0.12))" />
                  <text x={px + 10} y={py + 18} fontSize="11" fontWeight="700" fill={C.text}>{m.id}</text>
                  <text x={px + 10} y={py + 33} fontSize="10" fill={C.muted}>{m.type}</text>
                  <text x={px + 10} y={py + 47} fontSize="10" fill={C.muted}>{m.location}</text>
                  <rect x={px + 10} y={py + 54} width={8} height={8} rx="4"
                    fill={STATUS_COLORS[m.status]} />
                  <text x={px + 22} y={py + 62} fontSize="10" fontWeight="600"
                    fill={STATUS_COLORS[m.status]}>{m.status}</text>
                </g>
              );
            })()}

            {/* Compass */}
            <g transform="translate(630,40)">
              <circle cx="0" cy="0" r="18" fill="white" stroke={C.border} strokeWidth="1" />
              <text x="0" y="-7" textAnchor="middle" fontSize="8" fontWeight="700" fill={C.primary}>N</text>
              <text x="0" y="12" textAnchor="middle" fontSize="7" fill={C.muted}>S</text>
              <text x="-9" y="3" textAnchor="middle" fontSize="7" fill={C.muted}>W</text>
              <text x="9" y="3" textAnchor="middle" fontSize="7" fill={C.muted}>E</text>
              <polygon points="0,-14 3,-4 -3,-4" fill={C.primary} />
              <polygon points="0,14 3,4 -3,4" fill={C.muted} />
            </g>

            {/* Scale bar */}
            <g transform="translate(40,430)">
              <line x1="0" y1="0" x2="60" y2="0" stroke={C.muted} strokeWidth="2" />
              <line x1="0" y1="-4" x2="0" y2="4" stroke={C.muted} strokeWidth="1.5" />
              <line x1="60" y1="-4" x2="60" y2="4" stroke={C.muted} strokeWidth="1.5" />
              <text x="30" y="-6" textAnchor="middle" fontSize="9" fill={C.muted}>50 km</text>
            </g>
          </svg>
        </div>

        {/* Equipment list panel */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 12, boxShadow: C.cardShadow, overflow: "hidden",
          maxHeight: 480, display: "flex", flexDirection: "column",
        }}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, fontSize: 14, fontWeight: 700, color: C.text }}>
            Equipment List
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {visible.map(m => (
              <button
                key={m.id}
                onClick={() => setSelected(m.id === selected ? null : m.id)}
                style={{
                  width: "100%", background: selected === m.id ? "rgba(37,99,235,0.06)" : "transparent",
                  border: "none", cursor: "pointer", padding: "12px 16px",
                  display: "flex", alignItems: "center", gap: 10,
                  borderBottom: `1px solid ${C.border}`,
                  transition: "background 0.12s", textAlign: "left",
                }}
                onMouseEnter={e => { if (selected !== m.id) (e.currentTarget as HTMLButtonElement).style.background = C.bg; }}
                onMouseLeave={e => { if (selected !== m.id) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_COLORS[m.status], flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{m.id}</div>
                  <div style={{ fontSize: 11, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.location}</div>
                </div>
                <span style={{ fontSize: 11, color: C.muted }}>{m.type.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
        padding: "12px 20px", marginTop: 16, display: "flex", gap: 24, flexWrap: "wrap",
        boxShadow: C.cardShadow,
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginRight: 4 }}>Legend:</span>
        {[
          { shape: "square", label: "Transformer" },
          { shape: "triangle", label: "Generator" },
          { shape: "circle", label: "Other" },
        ].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.muted }}>
            <span style={{
              display: "inline-block",
              width: 10, height: 10,
              background: C.muted,
              borderRadius: l.shape === "circle" ? "50%" : l.shape === "square" ? "2px" : 0,
              clipPath: l.shape === "triangle" ? "polygon(50% 0%, 0% 100%, 100% 100%)" : "none",
            }} />
            {l.label}
          </div>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 12, color: C.muted }}>Click a marker for details</span>
      </div>
    </div>
  );
}
