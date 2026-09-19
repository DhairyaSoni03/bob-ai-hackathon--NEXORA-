import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { Btn } from '../../components/PageHeader';
import { useAuth } from '../../auth/AuthContext';
import {
  getCrews, updateCrew, getIncidents, updateIncident, addDispatch, addAuditEntry,
} from '../../store/nexoraStore';
import type { NexoraCrew } from '../../types/extended';

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  AVAILABLE:  { bg: 'rgba(74,222,128,0.1)',  color: '#4ade80' },
  DISPATCHED: { bg: 'rgba(129,140,248,0.1)', color: '#818cf8' },
  'EN ROUTE': { bg: 'rgba(251,191,36,0.1)',  color: '#fbbf24' },
  'ON SITE':  { bg: 'rgba(56,189,248,0.1)',  color: '#38bdf8' },
  REPAIRING:  { bg: 'rgba(56,189,248,0.1)',  color: '#38bdf8' },
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

interface DispatchModalProps {
  crew: NexoraCrew;
  onClose: () => void;
  onDispatched: () => void;
  adminId: string;
  adminName: string;
}

function DispatchModal({ crew, onClose, onDispatched, adminId, adminName }: DispatchModalProps) {
  const [destination, setDestination] = useState('');
  const [task, setTask] = useState('');
  const [eta, setEta] = useState('');
  const [incidentId, setIncidentId] = useState('');
  const [saving, setSaving] = useState(false);
  const incidents = getIncidents().filter((i) => i.status !== 'RESOLVED');

  function handleDispatch() {
    if (!destination.trim() || !task.trim() || !eta.trim()) return;
    setSaving(true);
    const now = new Date().toISOString();

    updateCrew(crew.id, {
      status: 'DISPATCHED',
      currentLocation: `En route to ${destination.trim()}`,
      assignedIncidentId: incidentId || undefined,
      eta: eta.trim(),
    });

    addDispatch({
      crewId: crew.id,
      incidentId: incidentId || 'MANUAL',
      destination: destination.trim(),
      task: task.trim(),
      eta: eta.trim(),
      dispatchedAt: now,
      status: 'ACTIVE',
    });

    if (incidentId) {
      const inc = incidents.find((i) => i.id === incidentId);
      if (inc) {
        const newTimeline = [...inc.timeline, {
          timestamp: now,
          status: 'CREW DISPATCHED',
          message: `${crew.name} dispatched to ${destination.trim()}. ETA: ${eta.trim()}.`,
          actor: adminName,
        }];
        updateIncident(incidentId, {
          status: 'CREW DISPATCHED',
          assignedCrew: crew.name,
          timeline: newTimeline,
        });
      }
    }

    addAuditEntry({
      adminId, adminName,
      action: 'DISPATCH_CREW',
      entity: 'Crew', entityId: crew.id,
      description: `Dispatched ${crew.name} to ${destination.trim()} for task: ${task.trim()}.`,
      timestamp: now,
    });

    setTimeout(() => { setSaving(false); onDispatched(); onClose(); }, 400);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ ...glass, maxWidth: 480, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>Dispatch {crew.name}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{crew.personnel} personnel · {crew.vehicle}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '1.2rem' }}>
          <div>
            <label style={labelStyle}>Link to Incident (optional)</label>
            <select value={incidentId} onChange={(e) => setIncidentId(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">— No linked incident —</option>
              {incidents.map((i) => <option key={i.id} value={i.id}>{i.id} · {i.type} · {i.region}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Destination *</label>
            <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Substation Alpha, Grid Sector 3" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Task Description *</label>
            <input type="text" value={task} onChange={(e) => setTask(e.target.value)} placeholder="e.g. Assess transformer fault and begin repair" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>ETA *</label>
            <input type="text" value={eta} onChange={(e) => setEta(e.target.value)} placeholder="e.g. 20 minutes, 14:30" style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: '0.8rem', borderTop: '1px solid rgba(56,189,248,0.08)' }}>
          <Btn variant="secondary" small onClick={onClose}>Cancel</Btn>
          <Btn small onClick={handleDispatch} disabled={saving || !destination.trim() || !task.trim() || !eta.trim()}>
            {saving ? 'Dispatching…' : 'Confirm Dispatch'}
          </Btn>
        </div>
      </div>
    </div>
  );
}

export default function CrewManagement() {
  const { user } = useAuth();
  const [crews, setCrews] = useState<NexoraCrew[]>([]);
  const [dispatchTarget, setDispatchTarget] = useState<NexoraCrew | null>(null);

  function refresh() { setCrews(getCrews()); }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, []);

  if (!user) return null;

  function returnToBase(crew: NexoraCrew) {
    const now = new Date().toISOString();
    updateCrew(crew.id, {
      status: 'AVAILABLE',
      currentLocation: `${crew.id === 'crew-001' ? 'Houston North' : crew.id === 'crew-002' ? 'Houston South' : 'Central'} Depot`,
      assignedIncidentId: undefined,
      eta: undefined,
    });
    addAuditEntry({
      adminId: user!.id, adminName: user!.name,
      action: 'RETURN_CREW',
      entity: 'Crew', entityId: crew.id,
      description: `${crew.name} returned to base.`,
      timestamp: now,
    });
    refresh();
  }

  const available = crews.filter((c) => c.status === 'AVAILABLE').length;
  const deployed = crews.length - available;

  return (
    <div style={{ padding: '1.5rem 2rem' }}>
      <PageHeader
        title="Crew Management"
        subtitle={`${available} available · ${deployed} deployed`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.2rem' }}>
        {crews.map((crew) => {
          const sc = STATUS_COLORS[crew.status] ?? STATUS_COLORS.AVAILABLE;
          return (
            <div key={crew.id} style={glass}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.9rem' }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', marginBottom: 2 }}>{crew.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{crew.id}</div>
                </div>
                <span style={{ background: sc.bg, color: sc.color, borderRadius: 5, padding: '0.25rem 0.7rem', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{crew.status}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: 13, marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Personnel</span>
                  <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{crew.personnel}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Specialization</span>
                  <span style={{ color: '#e2e8f0', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{crew.specialization.join(', ')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Vehicle</span>
                  <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{crew.vehicle}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Location</span>
                  <span style={{ color: '#94a3b8', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{crew.currentLocation}</span>
                </div>
                {crew.assignedIncidentId && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Incident</span>
                    <span style={{ color: '#818cf8', fontWeight: 600, fontFamily: 'monospace' }}>{crew.assignedIncidentId}</span>
                  </div>
                )}
                {crew.eta && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>ETA</span>
                    <span style={{ color: '#fbbf24', fontWeight: 600 }}>{crew.eta}</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {crew.status === 'AVAILABLE' ? (
                  <Btn small onClick={() => setDispatchTarget(crew)}>Dispatch</Btn>
                ) : (
                  <>
                    <Btn small variant="warning" onClick={() => setDispatchTarget(crew)}>Re-Dispatch</Btn>
                    <Btn small variant="ghost" onClick={() => returnToBase(crew)}>Return to Base</Btn>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {dispatchTarget && (
        <DispatchModal
          crew={dispatchTarget}
          onClose={() => setDispatchTarget(null)}
          onDispatched={refresh}
          adminId={user.id}
          adminName={user.name}
        />
      )}
    </div>
  );
}
