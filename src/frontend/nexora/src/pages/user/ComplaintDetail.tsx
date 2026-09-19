import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { PageHeader } from '../../components/PageHeader';
import { Btn } from '../../components/PageHeader';
import { getComplaintById } from '../../store/nexoraStore';
import type { NexoraComplaint } from '../../types/extended';

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  'OPEN':               { bg: 'rgba(56,189,248,0.1)',  color: '#38bdf8' },
  'UNDER REVIEW':       { bg: 'rgba(251,191,36,0.1)',  color: '#fbbf24' },
  'ASSIGNED':           { bg: 'rgba(129,140,248,0.1)', color: '#818cf8' },
  'INVESTIGATING':      { bg: 'rgba(251,191,36,0.1)',  color: '#fbbf24' },
  'REPAIR IN PROGRESS': { bg: 'rgba(56,189,248,0.1)',  color: '#38bdf8' },
  'RESOLVED':           { bg: 'rgba(74,222,128,0.1)',  color: '#4ade80' },
};

const URGENCY_COLORS: Record<string, string> = {
  low: '#4ade80', medium: '#94a3b8', high: '#fbbf24', critical: '#f87171',
};

const STATUS_STEPS = ['OPEN', 'UNDER REVIEW', 'ASSIGNED', 'INVESTIGATING', 'REPAIR IN PROGRESS', 'RESOLVED'];

const glass: React.CSSProperties = {
  background: 'rgba(8,20,40,0.7)',
  border: '1px solid rgba(56,189,248,0.12)',
  borderRadius: 14,
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  padding: '1.4rem 1.6rem',
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS_COLORS[status] ?? { bg: 'rgba(51,65,85,0.3)', color: '#94a3b8' };
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      borderRadius: 6,
      padding: '0.3rem 0.9rem',
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    }}>
      {status}
    </span>
  );
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function ComplaintDetail() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<NexoraComplaint | null>(null);

  useEffect(() => {
    function refresh() {
      if (!id) return;
      setComplaint(getComplaintById(id) ?? null);
    }
    refresh();
    const timer = setInterval(refresh, 3000);
    return () => clearInterval(timer);
  }, [id]);

  if (!user) return null;
  if (!complaint) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ color: '#64748b', fontSize: 13, marginBottom: '1rem' }}>Complaint not found.</div>
        <Btn small variant="secondary" onClick={() => navigate('/user/complaints')}>← Back to My Complaints</Btn>
      </div>
    );
  }

  const currentStepIdx = STATUS_STEPS.indexOf(complaint.status);

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: 800, margin: '0 auto' }}>
      <PageHeader
        title={complaint.id}
        subtitle={`${complaint.problemType} · ${complaint.location}`}
        actions={<Btn small variant="secondary" onClick={() => navigate('/user/complaints')}>← My Complaints</Btn>}
      />

      {/* Status progress stepper */}
      <div style={{ ...glass, marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Current Status</span>
          <StatusPill status={complaint.status} />
        </div>
        <div style={{ display: 'flex', gap: 0 }}>
          {STATUS_STEPS.map((step, idx) => {
            const done = idx < currentStepIdx;
            const current = idx === currentStepIdx;
            const s = STATUS_COLORS[step] ?? { bg: 'rgba(51,65,85,0.3)', color: '#94a3b8' };
            return (
              <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                {/* Connector line */}
                {idx > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: 9,
                    right: '50%',
                    left: '-50%',
                    height: 2,
                    background: done || current ? 'rgba(56,189,248,0.6)' : 'rgba(51,65,85,0.4)',
                  }} />
                )}
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: done ? '#38bdf8' : current ? s.bg : 'rgba(15,23,42,0.8)',
                  border: `2px solid ${done || current ? s.color : 'rgba(51,65,85,0.5)'}`,
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {done && <span style={{ fontSize: 10, color: '#0a1e35', fontWeight: 800 }}>✓</span>}
                  {current && <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, display: 'block' }} />}
                </div>
                <div style={{
                  fontSize: 9,
                  color: done || current ? s.color : '#475569',
                  textAlign: 'center',
                  marginTop: 5,
                  fontWeight: current ? 700 : 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  lineHeight: 1.2,
                  padding: '0 2px',
                }}>
                  {step}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={glass}>
          <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.9rem', fontWeight: 600 }}>Complaint Details</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              { label: 'Problem Type', value: complaint.problemType },
              { label: 'Location', value: complaint.location },
              { label: 'Urgency', value: complaint.urgency.toUpperCase(), color: URGENCY_COLORS[complaint.urgency] },
              { label: 'Linked Transformer', value: complaint.linkedTransformerId ?? '—' },
              { label: 'Assigned Team', value: complaint.assignedTeam ?? 'Not yet assigned' },
              { label: 'Submitted', value: formatTime(complaint.createdAt) },
              { label: 'Last Updated', value: formatTime(complaint.updatedAt) },
            ].map((row) => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>{row.label}</span>
                <span style={{ color: row.color ?? '#e2e8f0', fontWeight: 500 }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={glass}>
          <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.9rem', fontWeight: 600 }}>Description</div>
          <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>{complaint.description}</div>
          {complaint.adminNotes && (
            <>
              <div style={{ marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px solid rgba(56,189,248,0.08)', fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', fontWeight: 600 }}>Admin Notes</div>
              <div style={{ fontSize: 13, color: '#7dd3fc', lineHeight: 1.6 }}>{complaint.adminNotes}</div>
            </>
          )}
          {complaint.status === 'RESOLVED' && (
            <div style={{ marginTop: '1rem', padding: '0.8rem', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#4ade80' }}>✓ Issue Resolved</div>
              <div style={{ fontSize: 12, color: '#86efac', marginTop: 3 }}>Your complaint has been resolved. Thank you for your report.</div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div style={glass}>
        <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', fontWeight: 600 }}>Activity Timeline</div>
        <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
          {/* vertical line */}
          <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 2, background: 'rgba(56,189,248,0.15)', borderRadius: 2 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[...complaint.timeline].reverse().map((ev, idx) => (
              <div key={idx} style={{ position: 'relative', paddingLeft: '0.5rem' }}>
                <div style={{
                  position: 'absolute',
                  left: -22,
                  top: 3,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: 'rgba(56,189,248,0.6)',
                  border: '2px solid rgba(56,189,248,0.4)',
                }} />
                <div style={{ fontSize: 11, color: '#475569', marginBottom: 2 }}>{formatTime(ev.timestamp)}</div>
                <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>{ev.message}</div>
                {ev.actor && <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>— {ev.actor}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
