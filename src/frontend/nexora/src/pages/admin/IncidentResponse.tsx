import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { Btn } from '../../components/PageHeader';
import { useAuth } from '../../auth/AuthContext';
import {
  getIncidents, addIncident, updateIncident, addAuditEntry,
} from '../../store/nexoraStore';
import type { NexoraIncident } from '../../types/extended';

const INCIDENT_TYPES = ['Transformer Fault', 'Line Down', 'Substation Failure', 'Equipment Damage', 'Storm Damage', 'Overload', 'Other'] as const;
const DAMAGE_TYPES = ['Electrical Fault', 'Physical Damage', 'Overheating', 'Flooding', 'Lightning Strike', 'Wind Damage', 'Equipment Failure'] as const;
const REGIONS = ['Houston North', 'Houston South', 'Central Houston', 'Houston East', 'Houston West'] as const;

const STATUS_ORDER: NexoraIncident['status'][] = ['REPORTED', 'INVESTIGATING', 'CREW DISPATCHED', 'EN ROUTE', 'ON SITE', 'REPAIRING', 'RESOLVED'];

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  REPORTED:         { bg: 'rgba(56,189,248,0.1)',  color: '#38bdf8' },
  INVESTIGATING:    { bg: 'rgba(251,191,36,0.1)',  color: '#fbbf24' },
  'CREW DISPATCHED':{ bg: 'rgba(129,140,248,0.1)', color: '#818cf8' },
  'EN ROUTE':       { bg: 'rgba(251,191,36,0.1)',  color: '#fbbf24' },
  'ON SITE':        { bg: 'rgba(56,189,248,0.1)',  color: '#38bdf8' },
  REPAIRING:        { bg: 'rgba(56,189,248,0.1)',  color: '#38bdf8' },
  RESOLVED:         { bg: 'rgba(74,222,128,0.1)',  color: '#4ade80' },
};

const SEVERITY_COLORS: Record<string, string> = {
  low: '#4ade80', medium: '#94a3b8', high: '#fbbf24', critical: '#f87171',
};

const glass: React.CSSProperties = {
  background: 'rgba(8,20,40,0.7)',
  border: '1px solid rgba(56,189,248,0.12)',
  borderRadius: 14,
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  padding: '1.4rem 1.6rem',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(3,11,24,0.7)',
  border: '1px solid rgba(56,189,248,0.15)',
  borderRadius: 8,
  color: '#e2e8f0',
  padding: '0.6rem 0.9rem',
  fontSize: 13,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  color: '#64748b',
  marginBottom: 5,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  fontWeight: 500,
};

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
}

interface SimulateModalProps {
  onClose: () => void;
  onCreated: () => void;
  adminName: string;
  adminId: string;
}

function SimulateModal({ onClose, onCreated, adminName, adminId }: SimulateModalProps) {
  const [form, setForm] = useState({
    type: 'Transformer Fault',
    region: 'Houston North',
    substation: 'Substation Alpha',
    affectedAsset: 'TX-047',
    damageSeverity: 'high' as NexoraIncident['damageSeverity'],
    damageType: 'Electrical Fault',
    description: '',
    customersAffected: '1200',
    personnelRequired: '4',
    deploymentLocation: '',
    estimatedRepairTime: '4 hours',
  });
  const [saving, setSaving] = useState(false);

  function handleCreate() {
    if (!form.description.trim()) return;
    setSaving(true);
    const now = new Date().toISOString();
    addIncident({
      type: form.type,
      region: form.region,
      substation: form.substation,
      affectedAssets: [form.affectedAsset],
      damageSeverity: form.damageSeverity,
      damageType: form.damageType,
      description: form.description,
      customersAffected: Number(form.customersAffected) || 0,
      estimatedDuration: form.estimatedRepairTime,
      personnelRequired: Number(form.personnelRequired) || 4,
      deploymentLocation: form.deploymentLocation || form.region,
      priority: form.damageSeverity,
      status: 'REPORTED',
      timeline: [{ timestamp: now, status: 'REPORTED', message: `Incident simulated by admin ${adminName}.`, actor: adminName }],
      createdAt: now,
      updatedAt: now,
      estimatedRepairTime: form.estimatedRepairTime,
    });

    addAuditEntry({
      adminId, adminName,
      action: 'SIMULATE_INCIDENT',
      entity: 'Incident',
      entityId: 'pending',
      description: `Simulated ${form.type} incident in ${form.region}.`,
      timestamp: now,
    });

    setTimeout(() => { setSaving(false); onCreated(); onClose(); }, 400);
  }

  function setField(key: string, val: string) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ ...glass, maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>⚡ Simulate Incident</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '0.9rem' }}>
          <div>
            <label style={labelStyle}>Incident Type</label>
            <select value={form.type} onChange={(e) => setField('type', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              {INCIDENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Region</label>
            <select value={form.region} onChange={(e) => setField('region', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Substation</label>
            <input type="text" value={form.substation} onChange={(e) => setField('substation', e.target.value)} style={inputStyle} placeholder="Substation Alpha" />
          </div>
          <div>
            <label style={labelStyle}>Affected Asset ID</label>
            <input type="text" value={form.affectedAsset} onChange={(e) => setField('affectedAsset', e.target.value)} style={inputStyle} placeholder="TX-047" />
          </div>
          <div>
            <label style={labelStyle}>Damage Severity</label>
            <select value={form.damageSeverity} onChange={(e) => setField('damageSeverity', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              {['low', 'medium', 'high', 'critical'].map((s) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Damage Type</label>
            <select value={form.damageType} onChange={(e) => setField('damageType', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              {DAMAGE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Customers Affected</label>
            <input type="number" value={form.customersAffected} onChange={(e) => setField('customersAffected', e.target.value)} style={inputStyle} placeholder="1200" />
          </div>
          <div>
            <label style={labelStyle}>Personnel Required</label>
            <input type="number" value={form.personnelRequired} onChange={(e) => setField('personnelRequired', e.target.value)} style={inputStyle} placeholder="4" />
          </div>
          <div>
            <label style={labelStyle}>Estimated Repair Time</label>
            <input type="text" value={form.estimatedRepairTime} onChange={(e) => setField('estimatedRepairTime', e.target.value)} style={inputStyle} placeholder="4 hours" />
          </div>
          <div>
            <label style={labelStyle}>Deployment Location</label>
            <input type="text" value={form.deploymentLocation} onChange={(e) => setField('deploymentLocation', e.target.value)} style={inputStyle} placeholder="Grid Sector 3" />
          </div>
        </div>

        <div style={{ marginBottom: '1.2rem' }}>
          <label style={labelStyle}>Description *</label>
          <textarea
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            rows={3}
            placeholder="Describe the incident…"
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: '0.8rem', borderTop: '1px solid rgba(56,189,248,0.08)' }}>
          <Btn variant="secondary" small onClick={onClose}>Cancel</Btn>
          <button
            onClick={handleCreate}
            disabled={saving || !form.description.trim()}
            style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #f59e0b 100%)',
              border: 'none', borderRadius: 8, color: '#fff',
              fontSize: 13, fontWeight: 600, padding: '0.5rem 1.4rem',
              cursor: saving || !form.description.trim() ? 'not-allowed' : 'pointer',
              opacity: saving || !form.description.trim() ? 0.5 : 1,
            }}
          >
            {saving ? 'Creating…' : '⚡ Create Incident'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface TimelineModalProps { incident: NexoraIncident; onClose: () => void; }

function TimelineModal({ incident, onClose }: TimelineModalProps) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ ...glass, maxWidth: 480, width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>{incident.id} Timeline</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{incident.type}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
        <div style={{ position: 'relative', paddingLeft: '1.2rem' }}>
          <div style={{ position: 'absolute', left: 5, top: 8, bottom: 8, width: 2, background: 'rgba(56,189,248,0.15)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {[...incident.timeline].reverse().map((ev, i) => (
              <div key={i} style={{ position: 'relative', paddingLeft: '0.5rem' }}>
                <div style={{ position: 'absolute', left: -17, top: 4, width: 8, height: 8, borderRadius: '50%', background: '#38bdf8' }} />
                <div style={{ fontSize: 11, color: '#475569', marginBottom: 2 }}>{formatTime(ev.timestamp)}</div>
                <div style={{ fontSize: 13, color: '#e2e8f0' }}>{ev.message}</div>
                {ev.actor && <div style={{ fontSize: 11, color: '#64748b' }}>— {ev.actor}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IncidentResponse() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<NexoraIncident[]>([]);
  const [showSimulate, setShowSimulate] = useState(false);
  const [timelineInc, setTimelineInc] = useState<NexoraIncident | null>(null);

  function refresh() { setIncidents(getIncidents()); }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, []);

  if (!user) return null;

  function advanceStatus(inc: NexoraIncident) {
    const idx = STATUS_ORDER.indexOf(inc.status);
    if (idx < 0 || idx >= STATUS_ORDER.length - 1) return;
    const next = STATUS_ORDER[idx + 1];
    const now = new Date().toISOString();
    const newTimeline = [...inc.timeline, { timestamp: now, status: next, message: `Status advanced to ${next}.`, actor: user!.name }];
    updateIncident(inc.id, { status: next, timeline: newTimeline });
    addAuditEntry({
      adminId: user!.id, adminName: user!.name,
      action: 'UPDATE_INCIDENT_STATUS',
      entity: 'Incident', entityId: inc.id,
      description: `Status → ${next}`,
      timestamp: now,
    });
    refresh();
  }

  return (
    <div style={{ padding: '1.5rem 2rem' }}>
      <PageHeader
        title="Incident Response"
        subtitle={`${incidents.filter((i) => i.status !== 'RESOLVED').length} active incidents`}
        actions={
          <Btn onClick={() => setShowSimulate(true)}>⚡ Simulate Incident</Btn>
        }
      />

      {incidents.length === 0 ? (
        <div style={{ ...glass, textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          No incidents recorded. Use the Simulate button to create a test incident.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {incidents.map((inc) => {
            const sc = STATUS_COLORS[inc.status] ?? STATUS_COLORS.REPORTED;
            const canAdvance = STATUS_ORDER.indexOf(inc.status) < STATUS_ORDER.length - 1;
            return (
              <div key={inc.id} style={glass}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.9rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: 3 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#38bdf8' }}>{inc.id}</span>
                      <span style={{ background: sc.bg, color: sc.color, borderRadius: 5, padding: '0.2rem 0.6rem', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>{inc.status}</span>
                      <span style={{ color: SEVERITY_COLORS[inc.damageSeverity], fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>{inc.damageSeverity} severity</span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>{inc.type}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{inc.region} · {inc.substation}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#f87171' }}>{inc.customersAffected.toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>customers affected</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', fontSize: 12, color: '#94a3b8', marginBottom: '0.9rem', flexWrap: 'wrap' }}>
                  <span>Assets: {inc.affectedAssets.join(', ')}</span>
                  <span>ETA: {inc.estimatedRepairTime}</span>
                  {inc.assignedCrew && <span style={{ color: '#4ade80' }}>Crew: {inc.assignedCrew}</span>}
                  <span>Created: {formatTime(inc.createdAt)}</span>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  {canAdvance && (
                    <Btn small onClick={() => advanceStatus(inc)}>
                      → Advance to {STATUS_ORDER[STATUS_ORDER.indexOf(inc.status) + 1]}
                    </Btn>
                  )}
                  <Btn small variant="secondary" onClick={() => setTimelineInc(inc)}>📋 Timeline</Btn>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showSimulate && (
        <SimulateModal
          onClose={() => setShowSimulate(false)}
          onCreated={refresh}
          adminName={user.name}
          adminId={user.id}
        />
      )}

      {timelineInc && (
        <TimelineModal incident={timelineInc} onClose={() => setTimelineInc(null)} />
      )}
    </div>
  );
}
